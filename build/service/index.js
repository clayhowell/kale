'use strict';
/// <reference path="../common/models.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="broker.ts"/>
/// <reference path="active-state.ts"/>
/// <reference path="backtest.ts"/>
/// <reference path="config.ts"/>
/// <reference path="fair-value.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="market-filtration.ts"/>
/// <reference path="markettrades.ts"/>
/// <reference path="messages.ts"/>
/// <reference path="quote-sender.ts"/>
/// <reference path="quoter.ts"/>
/// <reference path="quoting-engine.ts"/>
/// <reference path="quoting-parameters.ts"/>
/// <reference path="safety.ts"/>
/// <reference path="statistics.ts"/>
/// <reference path="utils.ts"/>
/// <reference path="web.ts"/>
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const _ = require('lodash');
const path = require('path');
const express = require('express');
const util = require('util');
const moment = require('moment');
const request = require('request');
const http = require('http');
const socket_io = require('socket.io');
const HitBtc = require('./gateways/hitbtc');
const Coinbase = require('./gateways/coinbase');
const NullGw = require('./gateways/nullgw');
// import OkCoin = require('./gateways/okcoin');
const Bitfinex = require('./gateways/bitfinex');
const Kucoin = require('./gateways/kucoin');
const Utils = require('./utils');
const Config = require('./config');
const Broker = require('./broker');
const QuoteSender = require('./quote-sender');
const MarketTrades = require('./markettrades');
const Messaging = require('../common/messaging');
const Models = require('../common/models');
const Quoter = require('./quoter');
const Safety = require('./safety');
const compression = require('compression');
const Persister = require('./persister');
const Active = require('./active-state');
const FairValue = require('./fair-value');
const Web = require('./web');
const Promises = require('./promises');
const QuotingParameters = require('./quoting-parameters');
const MarketFiltration = require('./market-filtration');
const PositionManagement = require('./position-management');
const Statistics = require('./statistics');
const Backtest = require('./backtest');
const QuotingEngine = require('./quoting-engine');
const Messages = require('./messages');
const logging_1 = require('./logging');
const QuotingStyleRegistry = require('./quoting-styles/style-registry');
const MidMarket = require('./quoting-styles/mid-market');
const TopJoin = require('./quoting-styles/top-join');
const Depth = require('./quoting-styles/depth');
const serverUrl =
  'BACKTEST_SERVER_URL' in process.env
    ? process.env['BACKTEST_SERVER_URL']
    : 'http://localhost:5001';
const config = new Config.ConfigProvider();
let exitingEvent = () => new Promise(() => 0);
const performExit = () => {
  Promises.timeout(2000, exitingEvent())
    .then(completed => {
      mainLog.info(
        'All exiting event handlers have fired, exiting application.'
      );
      process.exit();
    })
    .catch(() => {
      mainLog.warn(
        'Did not complete clean-up tasks successfully, still shutting down.'
      );
      process.exit(1);
    });
};
process.on('uncaughtException', err => {
  mainLog.error(err, 'Unhandled exception!');
  performExit();
});
process.on('unhandledRejection', (reason, p) => {
  mainLog.error(reason, 'Unhandled promise rejection!', p);
  performExit();
});
process.on('exit', code => {
  mainLog.info('Exiting with code', code);
});
process.on('SIGINT', () => {
  mainLog.info('Handling SIGINT');
  performExit();
});
const mainLog = logging_1.default('tribeca:main');
const messagingLog = logging_1.default('tribeca:messaging');
function ParseCurrencyPair(raw) {
  const split = raw.split('/');
  if (split.length !== 2)
    throw new Error(
      'Invalid currency pair! Must be in the format of BASE/QUOTE, eg ADB/BTC'
    );
  return new Models.CurrencyPair(
    Models.Currency[split[0]],
    Models.Currency[split[1]]
  );
}
const pair = ParseCurrencyPair(config.GetString('TradedPair'));
const defaultActive = new Models.SerializedQuotesActive(false, new Date(1));
const defaultQuotingParameters = new Models.QuotingParameters(
  0.3,
  0.05,
  Models.QuotingMode.Top,
  Models.FairValueModel.BBO,
  3,
  0.8,
  false,
  Models.AutoPositionMode.Off,
  false,
  2.5,
  300,
  0.095,
  2 * 0.095,
  0.095,
  3,
  0.1
);
const backTestSimulationSetup = (inputData, parameters) => {
  const timeProvider = new Backtest.BacktestTimeProvider(
    moment(_.first(inputData).time),
    moment(_.last(inputData).time)
  );
  const exchange = Models.Exchange.Null;
  const gw = new Backtest.BacktestGateway(
    inputData,
    parameters.startingBasePosition,
    parameters.startingQuotePosition,
    timeProvider
  );
  const getExch = orderCache =>
    __awaiter(this, void 0, void 0, function*() {
      return new Backtest.BacktestExchange(gw);
    });
  const getPublisher = (topic, persister) => {
    return new Messaging.NullPublisher();
  };
  const getReceiver = topic => new Messaging.NullReceiver();
  const getPersister = collectionName =>
    new Promise(cb => cb(new Backtest.BacktestPersister()));
  const getRepository = (defValue, collectionName) =>
    new Promise(cb => cb(new Backtest.BacktestPersister([defValue])));
  const startingActive = new Models.SerializedQuotesActive(
    true,
    timeProvider.utcNow()
  );
  const startingParameters = parameters.quotingParameters;
  return {
    exchange: exchange,
    startingActive: startingActive,
    startingParameters: startingParameters,
    timeProvider: timeProvider,
    getExch: getExch,
    getReceiver: getReceiver,
    getPersister: getPersister,
    getRepository: getRepository,
    getPublisher: getPublisher
  };
};
const liveTradingSetup = () => {
  const timeProvider = new Utils.RealTimeProvider();
  const app = express();
  const http_server = http.createServer(app);
  const io = socket_io(http_server);
  const username = config.GetString('WebClientUsername');
  const password = config.GetString('WebClientPassword');
  if (username !== 'NULL' && password !== 'NULL') {
    mainLog.info('Requiring authentication to web client');
    const basicAuth = require('basic-auth-connect');
    app.use(basicAuth((u, p) => u === username && p === password));
  }
  app.use(compression());
  app.use(express.static(path.join(__dirname, 'admin')));
  const webport = config.GetNumber('WebClientListenPort');
  http_server.listen(webport, () =>
    mainLog.info('Listening to admins on *:', webport)
  );
  const getExchange = () => {
    const ex = config.GetString('EXCHANGE').toLowerCase();
    switch (ex) {
      case 'hitbtc':
        return Models.Exchange.HitBtc;
      case 'coinbase':
        return Models.Exchange.Coinbase;
      // case 'okcoin':
      //   return Models.Exchange.OkCoin;
      case 'null':
        return Models.Exchange.Null;
      case 'bitfinex':
        return Models.Exchange.Bitfinex;
      case 'kucoin':
        return Models.Exchange.Kucoin;
      default:
        throw new Error('unknown configuration env variable EXCHANGE ' + ex);
    }
  };
  const exchange = getExchange();
  const getExch = orderCache => {
    switch (exchange) {
      case Models.Exchange.HitBtc:
        return HitBtc.createHitBtc(config, pair);
      case Models.Exchange.Coinbase:
        return Coinbase.createCoinbase(config, orderCache, timeProvider, pair);
      // case Models.Exchange.OkCoin:
      //   return OkCoin.createOkCoin(config, pair);
      case Models.Exchange.Null:
        return NullGw.createNullGateway(config, pair);
      case Models.Exchange.Bitfinex:
        return Bitfinex.createBitfinex(timeProvider, config, pair);
      case Models.Exchange.Kucoin:
        return Kucoin.createKucoin(timeProvider, config, pair);
      default:
        throw new Error('no gateway provided for exchange ' + exchange);
    }
  };
  const getPublisher = (topic, persister) => {
    const socketIoPublisher = new Messaging.Publisher(
      topic,
      io,
      null,
      messagingLog.info.bind(messagingLog)
    );
    if (persister)
      return new Web.StandaloneHttpPublisher(
        socketIoPublisher,
        topic,
        app,
        persister
      );
    else return socketIoPublisher;
  };
  const getReceiver = topic =>
    new Messaging.Receiver(topic, io, messagingLog.info.bind(messagingLog));
  const db = Persister.loadDb(config);
  const getPersister = collectionName =>
    __awaiter(this, void 0, void 0, function*() {
      const coll = yield (yield db).collection(collectionName);
      return new Persister.Persister(
        timeProvider,
        coll,
        collectionName,
        exchange,
        pair
      );
    });
  const getRepository = (defValue, collectionName) =>
    __awaiter(this, void 0, void 0, function*() {
      return new Persister.RepositoryPersister(
        yield (yield db).collection(collectionName),
        defValue,
        collectionName,
        exchange,
        pair
      );
    });
  return {
    exchange: exchange,
    startingActive: defaultActive,
    startingParameters: defaultQuotingParameters,
    timeProvider: timeProvider,
    getExch: getExch,
    getReceiver: getReceiver,
    getPersister: getPersister,
    getRepository: getRepository,
    getPublisher: getPublisher
  };
};
const runTradingSystem = classes =>
  __awaiter(this, void 0, void 0, function*() {
    const getPersister = classes.getPersister;
    const orderPersister = yield getPersister('osr');
    const tradesPersister = yield getPersister('trades');
    const fairValuePersister = yield getPersister('fv');
    const mktTradePersister = yield getPersister('mt');
    const positionPersister = yield getPersister('pos');
    const messagesPersister = yield getPersister('msg');
    const rfvPersister = yield getPersister('rfv');
    const tbpPersister = yield getPersister('tbp');
    const tsvPersister = yield getPersister('tsv');
    const marketDataPersister = yield getPersister(Messaging.Topics.MarketData);
    const activePersister = yield classes.getRepository(
      classes.startingActive,
      Messaging.Topics.ActiveChange
    );
    const paramsPersister = yield classes.getRepository(
      classes.startingParameters,
      Messaging.Topics.QuotingParametersChange
    );
    const exchange = classes.exchange;
    const shouldPublishAllOrders =
      !config.Has('ShowAllOrders') || config.GetBoolean('ShowAllOrders');
    const ordersFilter = shouldPublishAllOrders
      ? {}
      : { source: { $gte: Models.OrderSource.OrderTicket } };
    const [
      initOrders,
      initTrades,
      initMktTrades,
      initMsgs,
      initParams,
      initActive,
      initRfv
    ] = yield Promise.all([
      orderPersister.loadAll(10000, ordersFilter),
      tradesPersister.loadAll(10000),
      mktTradePersister.loadAll(100),
      messagesPersister.loadAll(50),
      paramsPersister.loadLatest(),
      activePersister.loadLatest(),
      rfvPersister.loadAll(50)
    ]);
    _.defaults(initParams, defaultQuotingParameters);
    _.defaults(initActive, defaultActive);
    const orderCache = new Broker.OrderStateCache();
    const timeProvider = classes.timeProvider;
    const getPublisher = classes.getPublisher;
    const gateway = yield classes.getExch(orderCache);
    const advert = new Models.ProductAdvertisement(
      exchange,
      pair,
      config.GetString('TRIBECA_MODE'),
      gateway.base.minTickIncrement
    );
    getPublisher(Messaging.Topics.ProductAdvertisement)
      .registerSnapshot(() => [advert])
      .publish(advert);
    const quotePublisher = getPublisher(Messaging.Topics.Quote);
    const fvPublisher = getPublisher(
      Messaging.Topics.FairValue,
      fairValuePersister
    );
    const marketDataPublisher = getPublisher(
      Messaging.Topics.MarketData,
      marketDataPersister
    );
    const orderStatusPublisher = getPublisher(
      Messaging.Topics.OrderStatusReports,
      orderPersister
    );
    const tradePublisher = getPublisher(
      Messaging.Topics.Trades,
      tradesPersister
    );
    const activePublisher = getPublisher(Messaging.Topics.ActiveChange);
    const quotingParametersPublisher = getPublisher(
      Messaging.Topics.QuotingParametersChange
    );
    const marketTradePublisher = getPublisher(
      Messaging.Topics.MarketTrade,
      mktTradePersister
    );
    const messagesPublisher = getPublisher(
      Messaging.Topics.Message,
      messagesPersister
    );
    const quoteStatusPublisher = getPublisher(Messaging.Topics.QuoteStatus);
    const targetBasePositionPublisher = getPublisher(
      Messaging.Topics.TargetBasePosition,
      tbpPersister
    );
    const tradeSafetyPublisher = getPublisher(
      Messaging.Topics.TradeSafetyValue,
      tsvPersister
    );
    const positionPublisher = getPublisher(
      Messaging.Topics.Position,
      positionPersister
    );
    const connectivity = getPublisher(Messaging.Topics.ExchangeConnectivity);
    const messages = new Messages.MessagesPubisher(
      timeProvider,
      messagesPersister,
      initMsgs,
      messagesPublisher
    );
    messages.publish('start up');
    const getReceiver = classes.getReceiver;
    const activeReceiver = getReceiver(Messaging.Topics.ActiveChange);
    const quotingParametersReceiver = getReceiver(
      Messaging.Topics.QuotingParametersChange
    );
    const submitOrderReceiver = getReceiver(Messaging.Topics.SubmitNewOrder);
    const cancelOrderReceiver = getReceiver(Messaging.Topics.CancelOrder);
    const cancelAllOrdersReceiver = getReceiver(
      Messaging.Topics.CancelAllOrders
    );
    const broker = new Broker.ExchangeBroker(
      pair,
      gateway.md,
      gateway.base,
      gateway.oe,
      connectivity
    );
    mainLog.info(
      {
        exchange: broker.exchange,
        pair: broker.pair.toString(),
        minTick: broker.minTickIncrement,
        makeFee: broker.makeFee,
        takeFee: broker.takeFee,
        hasSelfTradePrevention: broker.hasSelfTradePrevention
      },
      'using the following exchange details'
    );
    const orderBroker = new Broker.OrderBroker(
      timeProvider,
      broker,
      gateway.oe,
      orderPersister,
      tradesPersister,
      orderStatusPublisher,
      tradePublisher,
      submitOrderReceiver,
      cancelOrderReceiver,
      cancelAllOrdersReceiver,
      messages,
      orderCache,
      initOrders,
      initTrades,
      shouldPublishAllOrders
    );
    const marketDataBroker = new Broker.MarketDataBroker(
      timeProvider,
      gateway.md,
      marketDataPublisher,
      marketDataPersister,
      messages
    );
    const positionBroker = new Broker.PositionBroker(
      timeProvider,
      broker,
      gateway.pg,
      positionPublisher,
      positionPersister,
      marketDataBroker
    );
    const paramsRepo = new QuotingParameters.QuotingParametersRepository(
      quotingParametersPublisher,
      quotingParametersReceiver,
      initParams
    );
    paramsRepo.NewParameters.on(() =>
      paramsPersister.persist(paramsRepo.latest)
    );
    const safetyCalculator = new Safety.SafetyCalculator(
      timeProvider,
      paramsRepo,
      orderBroker,
      paramsRepo,
      tradeSafetyPublisher,
      tsvPersister
    );
    const startQuoting =
      moment(timeProvider.utcNow()).diff(moment(initActive.time), 'minutes') <
        3 && initActive.active;
    const active = new Active.ActiveRepository(
      startQuoting,
      broker,
      activePublisher,
      activeReceiver
    );
    const quoter = new Quoter.Quoter(orderBroker, broker);
    const filtration = new MarketFiltration.MarketFiltration(
      broker,
      new Utils.ImmediateActionScheduler(timeProvider),
      quoter,
      marketDataBroker
    );
    const fvEngine = new FairValue.FairValueEngine(
      broker,
      timeProvider,
      filtration,
      paramsRepo,
      fvPublisher,
      fairValuePersister
    );
    const ewma = new Statistics.ObservableEWMACalculator(
      timeProvider,
      fvEngine,
      initParams.quotingEwma
    );
    const rfvValues = _.map(initRfv, r => r.value);
    const shortEwma = new Statistics.EwmaStatisticCalculator(
      initParams.shortEwma
    );
    shortEwma.initialize(rfvValues);
    const longEwma = new Statistics.EwmaStatisticCalculator(
      initParams.longEwma
    );
    longEwma.initialize(rfvValues);
    const registry = new QuotingStyleRegistry.QuotingStyleRegistry([
      new MidMarket.MidMarketQuoteStyle(),
      new TopJoin.InverseJoinQuoteStyle(),
      new TopJoin.InverseTopOfTheMarketQuoteStyle(),
      new TopJoin.JoinQuoteStyle(),
      new TopJoin.TopOfTheMarketQuoteStyle(),
      new TopJoin.PingPongQuoteStyle(),
      new Depth.DepthQuoteStyle()
    ]);
    const positionMgr = new PositionManagement.PositionManager(
      broker,
      timeProvider,
      rfvPersister,
      fvEngine,
      initRfv,
      shortEwma,
      longEwma
    );
    const tbp = new PositionManagement.TargetBasePositionManager(
      timeProvider,
      positionMgr,
      paramsRepo,
      positionBroker,
      targetBasePositionPublisher,
      tbpPersister
    );
    const quotingEngine = new QuotingEngine.QuotingEngine(
      registry,
      timeProvider,
      filtration,
      fvEngine,
      paramsRepo,
      quotePublisher,
      orderBroker,
      positionBroker,
      broker,
      ewma,
      tbp,
      safetyCalculator
    );
    const quoteSender = new QuoteSender.QuoteSender(
      timeProvider,
      quotingEngine,
      quoteStatusPublisher,
      quoter,
      active,
      positionBroker,
      fvEngine,
      marketDataBroker,
      broker
    );
    const marketTradeBroker = new MarketTrades.MarketTradeBroker(
      gateway.md,
      marketTradePublisher,
      marketDataBroker,
      quotingEngine,
      broker,
      mktTradePersister,
      initMktTrades
    );
    if (config.inBacktestMode) {
      const t = Utils.date();
      console.log('starting backtest');
      try {
        gateway.run();
      } catch (err) {
        console.error(
          'exception while running backtest!',
          err.message,
          err.stack
        );
        throw err;
      }
      const results = [
        paramsRepo.latest,
        positionBroker.latestReport,
        {
          trades: orderBroker._trades.map(t => [
            t.time.valueOf(),
            t.price,
            t.quantity,
            t.side
          ]),
          volume: orderBroker._trades.reduce((p, c) => p + c.quantity, 0)
        }
      ];
      console.log(
        'sending back results, took: ',
        moment(Utils.date()).diff(t, 'seconds')
      );
      request(
        {
          url: serverUrl + '/result',
          method: 'POST',
          json: results
        },
        (err, resp, body) => {}
      );
    }
    exitingEvent = () => {
      const a = new Models.SerializedQuotesActive(
        active.savedQuotingMode,
        timeProvider.utcNow()
      );
      mainLog.info('persisting active to', a.active);
      activePersister.persist(a);
      return orderBroker.cancelOpenOrders();
    };
    // event looped blocked timer
    let start = process.hrtime();
    const interval = 100;
    setInterval(() => {
      const delta = process.hrtime(start);
      const ms = (delta[0] * 1e9 + delta[1]) / 1e6;
      const n = ms - interval;
      if (n > 25)
        mainLog.info(`Event looped blocked for ${Utils.roundUp(n, 0.001)}ms`);
      start = process.hrtime();
    }, interval).unref();
  });
const harness = () =>
  __awaiter(this, void 0, void 0, function*() {
    if (config.inBacktestMode) {
      console.log('enter backtest mode');
      const getFromBacktestServer = ep => {
        return new Promise((resolve, reject) => {
          request.get(serverUrl + '/' + ep, (err, resp, body) => {
            if (err) reject(err);
            else resolve(body);
          });
        });
      };
      const input = yield getFromBacktestServer('inputData').then(body => {
        const inp = typeof body === 'string' ? eval(body) : body; // tslint:disable-line
        for (let i = 0; i < inp.length; i++) {
          const d = inp[i];
          d.time = new Date(d.time);
        }
        return inp;
      });
      const nextParameters = () =>
        getFromBacktestServer('nextParameters').then(body => {
          const p = typeof body === 'string' ? JSON.parse(body) : body;
          console.log("Recv'd parameters", util.inspect(p));
          return typeof p === 'string' ? null : p;
        });
      while (true) {
        const next = yield nextParameters();
        if (!next) break;
        runTradingSystem(backTestSimulationSetup(input, next));
      }
    } else {
      return runTradingSystem(liveTradingSetup());
    }
  });
harness();
//# sourceMappingURL=index.js.map
