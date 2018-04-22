/// <reference path="utils.d.ts" />
/// <reference path="../common/models.d.ts" />
/// <reference types="q" />
import Models = require('../common/models');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import moment = require('moment');
import Persister = require('./persister');
import Q = require('q');
export declare class BacktestTimeProvider implements Utils.IBacktestingTimeProvider {
    private _internalTime;
    private _endTime;
    constructor(_internalTime: moment.Moment, _endTime: moment.Moment);
    utcNow: () => Date;
    private _immediates;
    setImmediate: (action: () => void) => number;
    private _timeouts;
    setTimeout: (action: () => void, time: moment.Duration) => void;
    setInterval: (action: () => void, time: moment.Duration) => void;
    private setAction;
    scrollTimeTo: (time: moment.Moment) => void;
}
export declare class BacktestGateway implements Interfaces.IPositionGateway, Interfaces.IOrderEntryGateway, Interfaces.IMarketDataGateway {
    private _inputData;
    private _baseAmount;
    private _quoteAmount;
    private timeProvider;
    ConnectChanged: Utils.Evt<Models.ConnectivityStatus>;
    MarketData: Utils.Evt<Models.Market>;
    MarketTrade: Utils.Evt<Models.GatewayMarketTrade>;
    OrderUpdate: Utils.Evt<Models.OrderStatusUpdate>;
    supportsCancelAllOpenOrders: () => boolean;
    cancelAllOpenOrders: () => Q.Promise<number>;
    generateClientOrderId: () => string;
    cancelsByClientOrderId: boolean;
    private _openBidOrders;
    private _openAskOrders;
    sendOrder: (order: Models.OrderStatusReport) => void;
    cancelOrder: (cancel: Models.OrderStatusReport) => void;
    replaceOrder: (replace: Models.OrderStatusReport) => void;
    private onMarketData;
    private tryToMatch;
    private onMarketTrade;
    PositionUpdate: Utils.Evt<Models.CurrencyPosition>;
    private recomputePosition;
    private _baseHeld;
    private _quoteHeld;
    constructor(_inputData: Array<Models.Market | Models.MarketTrade>, _baseAmount: number, _quoteAmount: number, timeProvider: Utils.IBacktestingTimeProvider);
    run: () => void;
}
export declare class BacktestParameters {
    startingBasePosition: number;
    startingQuotePosition: number;
    quotingParameters: Models.QuotingParameters;
    id: string;
}
export declare class BacktestPersister<T> implements Persister.ILoadAll<T>, Persister.ILoadLatest<T> {
    private initialData;
    load: (exchange: Models.Exchange, pair: Models.CurrencyPair, limit?: number) => Promise<T[]>;
    loadAll: (limit?: number) => Promise<T[]>;
    persist: (report: T) => void;
    loadLatest: () => Promise<T>;
    constructor(initialData?: T[]);
}
export declare class BacktestExchange extends Interfaces.CombinedGateway {
    private gw;
    constructor(gw: BacktestGateway);
    run: () => void;
}
