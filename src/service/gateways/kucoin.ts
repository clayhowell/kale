/// <reference path="../utils.ts" />
/// <reference path="../../common/models.ts" />
/// <reference path="nullgw.ts" />
///<reference path="../config.ts"/>
///<reference path="../utils.ts"/>
///<reference path="../interfaces.ts"/>

import Q = require('q');
import crypto = require('crypto');
import request = require('request');
import rp = require('request-promise');
import url = require('url');
import querystring = require('querystring');
import Config = require('../config');
import NullGateway = require('./nullgw');
import Models = require('../../common/models');
import Utils = require('../utils');
import util = require('util');
import Interfaces = require('../interfaces');
import moment = require('moment');
import _ = require('lodash');
import log from '../logging';

const queryStringEncode = require('query-string-encode');

let shortId = require('shortid');
let Deque = require('collections/deque');

interface KucoinMarketTradeData {
  oid: string;
  dealPrice: number;
  orderOid: string;
  direction: string;
  amount: number;
  dealValue: number;
  createdAt: number;
}

interface KucoinMarketTrade {
  tid: number;
  timestamp: number;
  datetime: string;
  price: string;
  amount: string;
  exchange: string;
  type: string;
  datas: KucoinMarketTradeData[];
}

interface KucoinMarketLevel {
  price: string;
  amount: string;
  timestamp: string;
}

interface KucoinOrderBook {
  bids: KucoinMarketLevel[];
  asks: KucoinMarketLevel[];
}

function decodeSide(side: string) {
  switch (side) {
    case 'buy':
      return Models.Side.Bid;
    case 'sell':
      return Models.Side.Ask;
    default:
      return Models.Side.Unknown;
  }
}

function encodeSide(side: Models.Side) {
  switch (side) {
    case Models.Side.Bid:
      return 'buy';
    case Models.Side.Ask:
      return 'sell';
    default:
      return '';
  }
}

function encodeTimeInForce(tif: Models.TimeInForce, type: Models.OrderType) {
  if (type === Models.OrderType.Market) {
    return 'exchange market';
  } else if (type === Models.OrderType.Limit) {
    if (tif === Models.TimeInForce.FOK) return 'exchange fill-or-kill';
    // kucoin only offers limit
    if (tif === Models.TimeInForce.GTC) return 'limit';
  }
  throw new Error(
    'unsupported tif ' +
      Models.TimeInForce[tif] +
      ' and order type ' +
      Models.OrderType[type]
  );
}

class KucoinMarketDataGateway implements Interfaces.IMarketDataGateway {
  ConnectChanged = new Utils.Evt<Models.ConnectivityStatus>();
  MarketData = new Utils.Evt<Models.Market>();
  MarketTrade = new Utils.Evt<Models.GatewayMarketTrade>();

  private _since: number = null;

  private onTrades = (trades: Models.Timestamped<KucoinMarketTrade>) => {
    console.log('trades.data', trades.data);

    trades.data.datas.map(trade => {
      let timestamp = <string>(<any>trade.createdAt);
      let px = +trade.dealPrice;
      let sz = +trade.amount;
      let time = moment.unix(trade.createdAt).toDate();
      let side = decodeSide(timestamp);
      let mt = new Models.GatewayMarketTrade(
        px,
        sz,
        time,
        this._since === null,
        side
      );
      this.MarketTrade.trigger(mt);
    });

    // let value = trades.data.datas[0];
    // console.log('val', value);

    // console.log('test', test);

    // _.forEach(trades.data, trade => {
    //   let px = parseFloat(trade.price);
    //   let sz = parseFloat(trade.amount);
    //   let time = moment.unix(trade.timestamp).toDate();
    //   let side = decodeSide(trade.type);
    //   let mt = new Models.GatewayMarketTrade(
    //     px,
    //     sz,
    //     time,
    //     this._since === null,
    //     side
    //   );
    //   this.MarketTrade.trigger(mt);
    // });

    this._since = moment().unix();
  };

  private downloadMarketTrades = () => {
    let qs = {
      // timestamp:
      //   this._since === null
      //     ? moment
      //         .utc()
      //         .subtract(60, 'seconds')
      //         .unix()
      //     : this._since,
      symbol: this._symbolProvider.symbol
    };

    console.log('deal-orders', qs);

    this._http
      .get<KucoinMarketTrade>('deal-orders', qs)
      .then(this.onTrades)
      .done();
  };

  private static ConvertToMarketSide(
    level: KucoinMarketLevel
  ): Models.MarketSide {
    return new Models.MarketSide(
      parseFloat(level.price),
      parseFloat(level.amount)
    );
  }

  private static ConvertToMarketSides(
    level: KucoinMarketLevel[]
  ): Models.MarketSide[] {
    return _.map(level, KucoinMarketDataGateway.ConvertToMarketSide);
  }

  private onMarketData = (book: Models.Timestamped<KucoinOrderBook>) => {
    let bids = KucoinMarketDataGateway.ConvertToMarketSides(book.data.bids);
    let asks = KucoinMarketDataGateway.ConvertToMarketSides(book.data.asks);
    this.MarketData.trigger(new Models.Market(bids, asks, book.time));
  };

  constructor(
    timeProvider: Utils.ITimeProvider,
    private _http: KucoinHttp,
    private _symbolProvider: KucoinSymbolProvider
  ) {
    timeProvider.setInterval(
      this.downloadMarketData,
      moment.duration(5, 'seconds')
    );
    timeProvider.setInterval(
      this.downloadMarketTrades,
      moment.duration(15, 'seconds')
    );

    this.downloadMarketData();
    this.downloadMarketTrades();

    _http.ConnectChanged.on(s => this.ConnectChanged.trigger(s));
  }

  // fetch market data from api

  private downloadMarketData = () => {
    this._http
      .get<KucoinOrderBook>('open/tick', {
        symbol: this._symbolProvider.symbol
      })
      // .then(result => console.log(result))
      .then(this.onMarketData)
      .done();
  };
}

interface RejectableResponse {
  message: string;
}

interface KucoinNewOrderRequest {
  symbol: string;
  amount: string;
  price: string; //Price to buy or sell at. Must be positive. Use random number for market orders.
  exchange: string; //always "kucoin"
  side: string; // buy or sell
  type: string; // "market" / "limit" / "stop" / "trailing-stop" / "fill-or-kill" / "exchange market" / "exchange limit" / "exchange stop" / "exchange trailing-stop" / "exchange fill-or-kill". (type starting by "exchange " are exchange orders, others are margin trading orders)
  is_hidden?: boolean;
}

interface KucoinNewOrderResponse extends RejectableResponse {
  orderOId: string;
}

interface KucoinCancelOrderRequest {
  orderOId: string;
}

interface KucoinCancelReplaceOrderRequest extends KucoinNewOrderRequest {
  orderOId: string;
}

interface KucoinCancelReplaceOrderResponse
  extends KucoinCancelOrderRequest,
    RejectableResponse {}

interface KucoinOrderStatusRequest {
  orderOId: string;
}

interface KucoinMyTradesRequest {
  symbol: string;
  // timestamp: number;
}

interface KucoinMyTradesResponse extends RejectableResponse {
  price: string;
  amount: string;
  timestamp: number;
  exchange: string;
  type: string;
  fee_currency: string;
  fee_amount: string;
  tid: number;
  orderOId: string;
}

interface KucoinOrderStatusResponse extends RejectableResponse {
  symbol: string;
  exchange: string; // bitstamp or kucoin
  price: number;
  avg_execution_price: string;
  side: string;
  type: string; // "market" / "limit" / "stop" / "trailing-stop".
  timestamp: number;
  is_live: boolean;
  is_cancelled: boolean;
  is_hidden: boolean;
  was_forced: boolean;
  executed_amount: string;
  remaining_amount: string;
  original_amount: string;
}

class KucoinOrderEntryGateway implements Interfaces.IOrderEntryGateway {
  OrderUpdate = new Utils.Evt<Models.OrderStatusUpdate>();
  ConnectChanged = new Utils.Evt<Models.ConnectivityStatus>();

  supportsCancelAllOpenOrders = (): boolean => {
    return false;
  };
  cancelAllOpenOrders = (): Q.Promise<number> => {
    return Q(0);
  };

  generateClientOrderId = () => shortId.generate();

  public cancelsByClientOrderId = false;

  private convertToOrderRequest = (
    order: Models.OrderStatusReport
  ): KucoinNewOrderRequest => {
    return {
      amount: order.quantity.toString(),
      exchange: 'kucoin',
      price: order.price.toString(),
      side: encodeSide(order.side),
      symbol: this._symbolProvider.symbol,
      type: encodeTimeInForce(order.timeInForce, order.type)
    };
  };

  sendOrder = (order: Models.OrderStatusReport) => {
    let req = this.convertToOrderRequest(order);

    this._http
      .post<KucoinNewOrderRequest, KucoinNewOrderResponse>('order', req)
      .then(resp => {
        if (typeof resp.data.message !== 'undefined') {
          this.OrderUpdate.trigger({
            orderStatus: Models.OrderStatus.Rejected,
            orderId: order.orderId,
            rejectMessage: resp.data.message,
            time: resp.time
          });
          return;
        }

        this.OrderUpdate.trigger({
          orderId: order.orderId,
          exchangeId: resp.data.orderOId,
          time: resp.time,
          orderStatus: Models.OrderStatus.Working
        });
      })
      .done();

    this.OrderUpdate.trigger({
      orderId: order.orderId,
      computationalLatency: Utils.fastDiff(new Date(), order.time)
    });
  };

  cancelOrder = (cancel: Models.OrderStatusReport) => {
    let req = { orderOId: cancel.exchangeId };
    this._http
      .post<KucoinCancelOrderRequest, any>('cancel-order', req)
      .then(resp => {
        if (typeof resp.data.message !== 'undefined') {
          this.OrderUpdate.trigger({
            orderStatus: Models.OrderStatus.Rejected,
            cancelRejected: true,
            orderId: cancel.orderId,
            rejectMessage: resp.data.message,
            time: resp.time
          });
          return;
        }

        this.OrderUpdate.trigger({
          orderId: cancel.orderId,
          time: resp.time,
          orderStatus: Models.OrderStatus.Cancelled
        });
      })
      .done();

    this.OrderUpdate.trigger({
      orderId: cancel.orderId,
      computationalLatency: Utils.fastDiff(new Date(), cancel.time)
    });
  };

  replaceOrder = (replace: Models.OrderStatusReport) => {
    this.cancelOrder(replace);
    this.sendOrder(replace);
  };

  private downloadOrderStatuses = () => {
    // let tradesReq = {
    //   // timestamp: this._since.unix(),
    //   symbol: this._symbolProvider.symbol
    // };

    let qs = {
      symbol: this._symbolProvider.symbol
    };

    this._http
      .get<KucoinMyTradesResponse[]>(
        // .get<KucoinMyTradesRequest, KucoinMyTradesResponse[]>(
        'order/active-map',
        qs
      )
      .then(resps => {
        _.forEach(resps.data, t => {
          let qs = { orderOId: t.orderOId };

          this._http
            .get<KucoinOrderStatusResponse>('order/detail', qs)
            .then(r => {
              this.OrderUpdate.trigger({
                exchangeId: t.orderOId,
                lastPrice: parseFloat(t.price),
                lastQuantity: parseFloat(t.amount),
                orderStatus: KucoinOrderEntryGateway.GetOrderStatus(r.data),
                averagePrice: parseFloat(r.data.avg_execution_price),
                leavesQuantity: parseFloat(r.data.remaining_amount),
                cumQuantity: parseFloat(r.data.executed_amount),
                quantity: parseFloat(r.data.original_amount)
              });
            })
            .done();
        });
      })
      .done();

    this._since = moment.utc();
  };

  parseTrade(trade, market = undefined) {
    let id = undefined;
    let order = undefined;
    let info = trade;
    let timestamp = undefined;
    let type = undefined;
    let side = undefined;
    let price = undefined;
    let cost = undefined;
    let amount = undefined;
    let fee = undefined;

    if (Array.isArray(trade)) {
      timestamp = trade[0];
      type = 'limit';
      if (trade[1] === 'BUY') {
        side = 'buy';
      } else if (trade[1] === 'SELL') {
        side = 'sell';
      }
      price = trade[2];
      amount = trade[3];
    } else {
      timestamp = trade.createdAt;
      order = trade.orderOid;
      id = trade.oid;
      side = trade.direction;
      if (typeof side !== 'undefined') side = side.toLowerCase();
      price = trade.dealPrice;
      amount = trade.amount;
      cost = trade.dealValue;
      let feeCurrency = undefined;
      if (typeof market !== 'undefined') {
        feeCurrency = side === 'sell' ? market['quote'] : market['base'];
      } else {
        let feeCurrencyField = side === 'sell' ? 'coinTypePair' : 'coinType';
        let feeCurrency = order.feeCurrencyField;
        // if (typeof feeCurrency !== 'undefined') {
        //   if (feeCurrency in this.currencies_by_id)
        //     feeCurrency = this.currencies_by_id[feeCurrency]['code'];
        // }
      }
      fee = {
        cost: trade.fee,
        currency: feeCurrency
      };
    }
    let symbol = undefined;
    if (typeof market !== 'undefined') symbol = market['symbol'];
    return {
      id: id,
      order: order,
      info: info,
      timestamp: timestamp,
      datetime: new Date(timestamp).toISOString(),
      symbol: symbol,
      type: type,
      side: side,
      price: price,
      cost: cost,
      amount: amount,
      fee: fee
    };
  }

  private static GetOrderStatus(r: KucoinOrderStatusResponse) {
    if (r.is_cancelled) return Models.OrderStatus.Cancelled;
    if (r.is_live) return Models.OrderStatus.Working;
    if (r.executed_amount === r.original_amount)
      return Models.OrderStatus.Complete;
    return Models.OrderStatus.Other;
  }

  private _since = moment.utc();
  private _log = log('tribeca:gateway:KucoinOE');
  constructor(
    timeProvider: Utils.ITimeProvider,
    private _details: KucoinBaseGateway,
    private _http: KucoinHttp,
    private _symbolProvider: KucoinSymbolProvider
  ) {
    _http.ConnectChanged.on(s => this.ConnectChanged.trigger(s));
    timeProvider.setInterval(
      this.downloadOrderStatuses,
      moment.duration(8, 'seconds')
    );
  }
}

class RateLimitMonitor {
  private _log = log('tribeca:gateway:rlm');

  private _queue = Deque();
  private _durationMs: number;

  public add = () => {
    let now = moment.utc();

    while (now.diff(this._queue.peek()) > this._durationMs) {
      this._queue.shift();
    }

    this._queue.push(now);

    if (this._queue.length > this._number) {
      this._log.error('Exceeded rate limit', {
        nRequests: this._queue.length,
        max: this._number,
        durationMs: this._durationMs
      });
    }
  };

  constructor(private _number: number, duration: moment.Duration) {
    this._durationMs = duration.asMilliseconds();
  }
}

class KucoinHttp {
  ConnectChanged = new Utils.Evt<Models.ConnectivityStatus>();

  private _timeout = 15000;
  // perform GET operation
  get = <T>(actionUrl: string, qs?: any): Q.Promise<Models.Timestamped<T>> => {
    // let nonce = this._nonce.toString();
    let nonce = new Date().getTime();
    // construct GET request
    const url = this._baseUrl + '/' + actionUrl;
    let opts = {
      timeout: this._timeout,
      url: url,
      qs: qs || undefined,
      method: 'GET',
      headers: {
        'KC-API-KEY': this._apiKey,
        'KC-API-NONCE': nonce,
        'KC-API-SIGNATURE': this.getSignature(`/v1/${actionUrl}`, qs, nonce)
      },
      json: true
    };
    // execute the GET request
    return this.doRequest<T>(opts, url);
  };

  // Kucoin seems to have a race condition where nonces are processed out of order when rapidly placing orders
  // Retry here - look to mitigate in the future by batching orders?
  post = <TRequest, TResponse>(
    actionUrl: string,
    msg: TRequest
  ): Q.Promise<Models.Timestamped<TResponse>> => {
    return this.postOnce<TRequest, TResponse>(actionUrl, _.clone(msg)).then(
      resp => {
        console.log('post', resp);
        let rejectMsg: string = (<any>resp.data).message;
        if (
          typeof rejectMsg !== 'undefined' &&
          rejectMsg.indexOf('Nonce is too small') > -1
        )
          return this.post<TRequest, TResponse>(actionUrl, _.clone(msg));
        else return resp;
      }
    );
  };

  private postOnce = <TRequest, TResponse>(
    actionUrl: string,
    msg: TRequest
  ): Q.Promise<Models.Timestamped<TResponse>> => {
    // msg['request'] = '/v1/' + actionUrl;
    // msg['nonce'] = this._nonce.toString();
    // this._nonce += 1;

    let nonce = this._nonce.toString();
    // let payload = new Buffer(JSON.stringify(msg)).toString('base64');
    console.log('post', this._baseUrl + '/' + actionUrl);
    const url = this._baseUrl + '/' + actionUrl;
    const qs = {};
    let opts: request.Options = {
      timeout: this._timeout,
      url: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'KC-API-KEY': this._apiKey,
        'KC-API-NONCE': nonce,
        'KC-API-SIGNATURE': this.getSignature(`/v1/${actionUrl}`, qs, nonce)
      },
      method: 'POST'
    };

    return this.doRequest<TResponse>(opts, url);
  };

  private doRequest = <TResponse>(
    msg: request.Options,
    url: string
  ): Q.Promise<Models.Timestamped<TResponse>> => {
    let d = Q.defer<Models.Timestamped<TResponse>>();
    this._monitor.add();
    console.log('msg', msg);
    rp(msg)
      .then(body => {
        let t = new Date();
        console.log('body', body);
        body.hasOwnProperty('data')
          ? d.resolve(new Models.Timestamped(body.data, t))
          : d.resolve(new Models.Timestamped(body, t));
      })
      .catch(err => {
        console.log(err);
        this._log.error(
          err,
          'Error parsing JSON url=',
          url,
          'err=',
          err,
          ', body='
        );
        d.reject(err);
      });
    return d.promise;
  };

  private _log = log('tribeca:gateway:KucoinHTTP');
  private _baseUrl: string;
  private _apiKey: string;
  private _secret: string;
  private _nonce: number;

  constructor(
    config: Config.IConfigProvider,
    private _monitor: RateLimitMonitor
  ) {
    this._baseUrl = config.GetString('KucoinHttpUrl');
    this._apiKey = config.GetString('KucoinKey');
    this._secret = config.GetString('KucoinSecret');

    this._nonce = new Date().valueOf();
    this._log.info('Starting nonce: ', this._nonce);
    setTimeout(
      () => this.ConnectChanged.trigger(Models.ConnectivityStatus.Connected),
      10
    );
  }

  /**
   * Generate a signature to sign API requests that require authorisation.
   * @access private
   * @param {string} endpoint API endpoint URL suffix.
   * @param {string} queryString A querystring of parameters for the request.
   * @param {number} nonce Number of milliseconds since the Unix epoch.
   * @return {string} A string to be used as the authorisation signature.
   */
  private getSignature(endpoint, queryString, nonce) {
    let qs = queryStringEncode(queryString);
    console.log('qs', qs);
    let strForSign = `${endpoint}/${nonce}/${qs}`;
    console.log('strForSign', strForSign);
    let signatureStr = new Buffer(strForSign).toString('base64');
    let signatureResult = crypto
      .createHmac('sha256', this._secret)
      .update(signatureStr)
      .digest('hex');
    return signatureResult;
  }
}

interface KucoinPositionResponseItem {
  type: string;
  currency: string;
  amount: string;
  available: string;
}

class KucoinPositionGateway implements Interfaces.IPositionGateway {
  PositionUpdate = new Utils.Evt<Models.CurrencyPosition>();

  private onRefreshPositions = () => {
    this._http
      .get<KucoinPositionResponseItem[]>('account/balances', {})
      .then(res => {
        _.forEach(_.filter(res.data, x => x.type === 'exchange'), p => {
          let amt = parseFloat(p.amount);
          let cur = Models.toCurrency(p.currency);
          let held = amt - parseFloat(p.available);
          let rpt = new Models.CurrencyPosition(amt, held, cur);
          this.PositionUpdate.trigger(rpt);
        });
      })
      .done();
  };

  private _log = log('tribeca:gateway:KucoinPG');
  constructor(timeProvider: Utils.ITimeProvider, private _http: KucoinHttp) {
    timeProvider.setInterval(
      this.onRefreshPositions,
      moment.duration(15, 'seconds')
    );
    this.onRefreshPositions();
  }
}

class KucoinBaseGateway implements Interfaces.IExchangeDetailsGateway {
  public get hasSelfTradePrevention() {
    return false;
  }

  name(): string {
    return 'Kucoin';
  }

  makeFee(): number {
    return 0.001;
  }

  takeFee(): number {
    return 0.001;
  }

  exchange(): Models.Exchange {
    return Models.Exchange.Kucoin;
  }

  constructor(public minTickIncrement: number) {}
}

class KucoinSymbolProvider {
  public symbol: string;

  constructor(pair: Models.CurrencyPair) {
    this.symbol = `${Models.fromCurrency(
      pair.base
    ).toLowerCase()}-${Models.fromCurrency(pair.quote).toLowerCase()}`;
  }
}

class Kucoin extends Interfaces.CombinedGateway {
  constructor(
    timeProvider: Utils.ITimeProvider,
    config: Config.IConfigProvider,
    symbol: KucoinSymbolProvider,
    pricePrecision: number
  ) {
    const monitor = new RateLimitMonitor(60, moment.duration(1, 'minutes'));
    const http = new KucoinHttp(config, monitor);
    const details = new KucoinBaseGateway(pricePrecision);

    const orderGateway =
      config.GetString('KucoinOrderDestination') === 'Kucoin'
        ? <Interfaces.IOrderEntryGateway>new KucoinOrderEntryGateway(
            timeProvider,
            details,
            http,
            symbol
          )
        : new NullGateway.NullOrderGateway();

    super(
      new KucoinMarketDataGateway(timeProvider, http, symbol),
      orderGateway,
      new KucoinPositionGateway(timeProvider, http),
      details
    );
  }
}

// interface SymbolDetails {
//   pair: string;
//   price_precision: number;
//   initial_margin: string;
//   minimum_margin: string;
//   maximum_order_size: string;
//   minimum_order_size: string;
//   expiration: string;
// }

interface SymbolDetails {
  coinType: string;
  trading: boolean;
  symbol: string;
  lastDealPrice: number;
  buy: number;
  sell: number;
  change: number;
  coinTypePair: string;
  sort: number;
  feeRate: number;
  volValue: number;
  high: number;
  datetime: number;
  vol: number;
  low: number;
  changeRate: number;
}

export async function createKucoin(
  timeProvider: Utils.ITimeProvider,
  config: Config.IConfigProvider,
  pair: Models.CurrencyPair
): Promise<Interfaces.CombinedGateway> {
  const detailsUrl = config.GetString('KucoinHttpUrl') + '/market/open/symbols';
  const symbolDetails = await Utils.getJSON<SymbolDetails[]>(detailsUrl);
  const symbol = new KucoinSymbolProvider(pair);

  if (symbolDetails[0].hasOwnProperty('symbol')) {
    console.log('ooops');
    for (let s of symbolDetails) {
      console.log('s', s);
      // regex'd and tolowedcased symbol pairs because kucoin makes things difficult
      if (s.symbol.toLowerCase() === symbol.symbol)
        // hardcoded kucoin price precision because it's not served on api requests
        return new Kucoin(timeProvider, config, symbol, 10 ** (-1 * 8));
    }
  } else {
    for (let s of symbolDetails) {
      console.log('s', s);
      // regex'd and tolowedcased symbol pairs because kucoin makes things difficult
      if (
        `${s.coinType.toLowerCase()}-${s.coinTypePair.toLowerCase()}` ===
        symbol.symbol
      )
        // hardcoded kucoin price precision because it's not served on api requests
        return new Kucoin(timeProvider, config, symbol, 10 ** (-1 * 8));
    }
  }

  throw new Error('cannot match pair to a Kucoin Symbol ' + pair.toString());
}
