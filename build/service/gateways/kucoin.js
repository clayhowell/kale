"use strict";
/// <reference path="../utils.ts" />
/// <reference path="../../common/models.ts" />
/// <reference path="nullgw.ts" />
///<reference path="../config.ts"/>
///<reference path="../utils.ts"/>
///<reference path="../interfaces.ts"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Q = require("q");
const crypto = require("crypto");
const request = require("request");
const NullGateway = require("./nullgw");
const Models = require("../../common/models");
const Utils = require("../utils");
const Interfaces = require("../interfaces");
const moment = require("moment");
const _ = require("lodash");
const logging_1 = require("../logging");
let shortId = require('shortid');
let Deque = require('collections/deque');
function decodeSide(side) {
    switch (side) {
        case 'buy':
            return Models.Side.Bid;
        case 'sell':
            return Models.Side.Ask;
        default:
            return Models.Side.Unknown;
    }
}
function encodeSide(side) {
    switch (side) {
        case Models.Side.Bid:
            return 'buy';
        case Models.Side.Ask:
            return 'sell';
        default:
            return '';
    }
}
function encodeTimeInForce(tif, type) {
    if (type === Models.OrderType.Market) {
        return 'exchange market';
    }
    else if (type === Models.OrderType.Limit) {
        if (tif === Models.TimeInForce.FOK)
            return 'exchange fill-or-kill';
        if (tif === Models.TimeInForce.GTC)
            return 'exchange limit';
    }
    throw new Error('unsupported tif ' +
        Models.TimeInForce[tif] +
        ' and order type ' +
        Models.OrderType[type]);
}
class KucoinMarketDataGateway {
    constructor(timeProvider, _http, _symbolProvider) {
        this._http = _http;
        this._symbolProvider = _symbolProvider;
        this.ConnectChanged = new Utils.Evt();
        this.MarketData = new Utils.Evt();
        this.MarketTrade = new Utils.Evt();
        this._since = null;
        this.onTrades = (trades) => {
            _.forEach(trades.data, trade => {
                let px = parseFloat(trade.price);
                let sz = parseFloat(trade.amount);
                let time = moment.unix(trade.timestamp).toDate();
                let side = decodeSide(trade.type);
                let mt = new Models.GatewayMarketTrade(px, sz, time, this._since === null, side);
                this.MarketTrade.trigger(mt);
            });
            this._since = moment().unix();
        };
        this.downloadMarketTrades = () => {
            let qs = {
                timestamp: this._since === null
                    ? moment
                        .utc()
                        .subtract(60, 'seconds')
                        .unix()
                    : this._since
            };
            this._http
                .get('trades/' + this._symbolProvider.symbol, qs)
                .then(this.onTrades)
                .done();
        };
        this.onMarketData = (book) => {
            let bids = KucoinMarketDataGateway.ConvertToMarketSides(book.data.bids);
            let asks = KucoinMarketDataGateway.ConvertToMarketSides(book.data.asks);
            this.MarketData.trigger(new Models.Market(bids, asks, book.time));
        };
        this.downloadMarketData = () => {
            console.log('this._symbolProvider.symbol', this._symbolProvider.symbol);
            this._http
                .get('/open/tick' + this._symbolProvider.symbol, {
                limit_bids: 5,
                limit_asks: 5
            })
                .then(this.onMarketData)
                .done();
        };
        timeProvider.setInterval(this.downloadMarketData, moment.duration(5, 'seconds'));
        timeProvider.setInterval(this.downloadMarketTrades, moment.duration(15, 'seconds'));
        this.downloadMarketData();
        this.downloadMarketTrades();
        _http.ConnectChanged.on(s => this.ConnectChanged.trigger(s));
    }
    static ConvertToMarketSide(level) {
        return new Models.MarketSide(parseFloat(level.price), parseFloat(level.amount));
    }
    static ConvertToMarketSides(level) {
        return _.map(level, KucoinMarketDataGateway.ConvertToMarketSide);
    }
}
class KucoinOrderEntryGateway {
    constructor(timeProvider, _details, _http, _symbolProvider) {
        this._details = _details;
        this._http = _http;
        this._symbolProvider = _symbolProvider;
        this.OrderUpdate = new Utils.Evt();
        this.ConnectChanged = new Utils.Evt();
        this.supportsCancelAllOpenOrders = () => {
            return false;
        };
        this.cancelAllOpenOrders = () => {
            return Q(0);
        };
        this.generateClientOrderId = () => shortId.generate();
        this.cancelsByClientOrderId = false;
        this.convertToOrderRequest = (order) => {
            return {
                amount: order.quantity.toString(),
                exchange: 'kucoin',
                price: order.price.toString(),
                side: encodeSide(order.side),
                symbol: this._symbolProvider.symbol,
                type: encodeTimeInForce(order.timeInForce, order.type)
            };
        };
        this.sendOrder = (order) => {
            let req = this.convertToOrderRequest(order);
            this._http
                .post('order/new', req)
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
                    exchangeId: resp.data.order_id,
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
        this.cancelOrder = (cancel) => {
            let req = { order_id: cancel.exchangeId };
            this._http
                .post('order/cancel', req)
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
        this.replaceOrder = (replace) => {
            this.cancelOrder(replace);
            this.sendOrder(replace);
        };
        this.downloadOrderStatuses = () => {
            let tradesReq = {
                timestamp: this._since.unix(),
                symbol: this._symbolProvider.symbol
            };
            this._http
                .post('mytrades', tradesReq)
                .then(resps => {
                _.forEach(resps.data, t => {
                    this._http
                        .post('order/status', { order_id: t.order_id })
                        .then(r => {
                        this.OrderUpdate.trigger({
                            exchangeId: t.order_id,
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
        this._since = moment.utc();
        this._log = logging_1.default('tribeca:gateway:KucoinOE');
        _http.ConnectChanged.on(s => this.ConnectChanged.trigger(s));
        timeProvider.setInterval(this.downloadOrderStatuses, moment.duration(8, 'seconds'));
    }
    static GetOrderStatus(r) {
        if (r.is_cancelled)
            return Models.OrderStatus.Cancelled;
        if (r.is_live)
            return Models.OrderStatus.Working;
        if (r.executed_amount === r.original_amount)
            return Models.OrderStatus.Complete;
        return Models.OrderStatus.Other;
    }
}
class RateLimitMonitor {
    constructor(_number, duration) {
        this._number = _number;
        this._log = logging_1.default('tribeca:gateway:rlm');
        this._queue = Deque();
        this.add = () => {
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
        this._durationMs = duration.asMilliseconds();
    }
}
class KucoinHttp {
    constructor(config, _monitor) {
        this._monitor = _monitor;
        this.ConnectChanged = new Utils.Evt();
        this._timeout = 15000;
        this.get = (actionUrl, qs) => {
            const url = this._baseUrl + '/' + actionUrl;
            let opts = {
                timeout: this._timeout,
                url: url,
                qs: qs || undefined,
                method: 'GET'
            };
            return this.doRequest(opts, url);
        };
        // Kucoin seems to have a race condition where nonces are processed out of order when rapidly placing orders
        // Retry here - look to mitigate in the future by batching orders?
        this.post = (actionUrl, msg) => {
            return this.postOnce(actionUrl, _.clone(msg)).then(resp => {
                let rejectMsg = resp.data.message;
                if (typeof rejectMsg !== 'undefined' &&
                    rejectMsg.indexOf('Nonce is too small') > -1)
                    return this.post(actionUrl, _.clone(msg));
                else
                    return resp;
            });
        };
        this.postOnce = (actionUrl, msg) => {
            msg['request'] = '/v1/' + actionUrl;
            msg['nonce'] = this._nonce.toString();
            this._nonce += 1;
            let payload = new Buffer(JSON.stringify(msg)).toString('base64');
            let signature = crypto
                .createHmac('sha384', this._secret)
                .update(payload)
                .digest('hex');
            const url = this._baseUrl + '/' + actionUrl;
            let opts = {
                timeout: this._timeout,
                url: url,
                headers: {
                    'KC-API-KEY': this._apiKey,
                    'KC-API-NONCE': this._nonce.toString(),
                    // "X-BFX-PAYLOAD": payload,
                    'KC-API-SIGNATURE': signature
                },
                method: 'POST'
            };
            return this.doRequest(opts, url);
        };
        this.doRequest = (msg, url) => {
            let d = Q.defer();
            this._monitor.add();
            request(msg, (err, resp, body) => {
                if (err) {
                    this._log.error(err, 'Error returned: url=', url, 'err=', err);
                    d.reject(err);
                }
                else {
                    try {
                        let t = new Date();
                        let data = JSON.parse(body);
                        d.resolve(new Models.Timestamped(data, t));
                    }
                    catch (err) {
                        this._log.error(err, 'Error parsing JSON url=', url, 'err=', err, ', body=', body);
                        d.reject(err);
                    }
                }
            });
            return d.promise;
        };
        this._log = logging_1.default('tribeca:gateway:KucoinHTTP');
        this._baseUrl = config.GetString('KucoinHttpUrl');
        this._apiKey = config.GetString('KucoinKey');
        this._secret = config.GetString('KucoinSecret');
        this._nonce = new Date().valueOf();
        this._log.info('Starting nonce: ', this._nonce);
        setTimeout(() => this.ConnectChanged.trigger(Models.ConnectivityStatus.Connected), 10);
    }
}
class KucoinPositionGateway {
    constructor(timeProvider, _http) {
        this._http = _http;
        this.PositionUpdate = new Utils.Evt();
        this.onRefreshPositions = () => {
            this._http
                .post('balances', {})
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
        this._log = logging_1.default('tribeca:gateway:KucoinPG');
        timeProvider.setInterval(this.onRefreshPositions, moment.duration(15, 'seconds'));
        this.onRefreshPositions();
    }
}
class KucoinBaseGateway {
    constructor(minTickIncrement) {
        this.minTickIncrement = minTickIncrement;
    }
    get hasSelfTradePrevention() {
        return false;
    }
    name() {
        return 'Kucoin';
    }
    makeFee() {
        return 0.001;
    }
    takeFee() {
        return 0.001;
    }
    exchange() {
        return Models.Exchange.Kucoin;
    }
}
class KucoinSymbolProvider {
    constructor(pair) {
        this.symbol = `${Models.fromCurrency(pair.base).toLowerCase()}-${Models.fromCurrency(pair.quote).toLowerCase()}`;
    }
}
class Kucoin extends Interfaces.CombinedGateway {
    constructor(timeProvider, config, symbol, pricePrecision) {
        const monitor = new RateLimitMonitor(60, moment.duration(1, 'minutes'));
        const http = new KucoinHttp(config, monitor);
        const details = new KucoinBaseGateway(pricePrecision);
        const orderGateway = config.GetString('KucoinOrderDestination') === 'Kucoin'
            ? new KucoinOrderEntryGateway(timeProvider, details, http, symbol)
            : new NullGateway.NullOrderGateway();
        super(new KucoinMarketDataGateway(timeProvider, http, symbol), orderGateway, new KucoinPositionGateway(timeProvider, http), details);
    }
}
function createKucoin(timeProvider, config, pair) {
    return __awaiter(this, void 0, void 0, function* () {
        const detailsUrl = config.GetString('KucoinHttpUrl') + '/market/open/symbols';
        const symbolDetails = yield Utils.getJSON(detailsUrl);
        const symbol = new KucoinSymbolProvider(pair);
        for (let s of symbolDetails) {
            // regex'd and tolowedcased symbol pairs because kucoin makes things difficult
            if (s.symbol.toLocaleLowerCase() === symbol.symbol)
                // hardcoded kucoin price precision because it's not served on api requests
                return new Kucoin(timeProvider, config, symbol, Math.pow(10, (-1 * 8)));
        }
        throw new Error('cannot match pair to a Kucoin Symbol ' + pair.toString());
    });
}
exports.createKucoin = createKucoin;
//# sourceMappingURL=kucoin.js.map