/// <reference path="../utils.d.ts" />
/// <reference path="../../common/models.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference types="q" />
import * as Q from 'q';
import Models = require('../../common/models');
import Utils = require('../utils');
import Interfaces = require('../interfaces');
import Config = require('../config');
export declare class NullOrderGateway implements Interfaces.IOrderEntryGateway {
    OrderUpdate: Utils.Evt<Models.OrderStatusUpdate>;
    ConnectChanged: Utils.Evt<Models.ConnectivityStatus>;
    supportsCancelAllOpenOrders: () => boolean;
    cancelAllOpenOrders: () => Q.Promise<number>;
    cancelsByClientOrderId: boolean;
    generateClientOrderId: () => string;
    private raiseTimeEvent;
    sendOrder(order: Models.OrderStatusReport): void;
    cancelOrder(cancel: Models.OrderStatusReport): void;
    replaceOrder(replace: Models.OrderStatusReport): void;
    private trigger(orderId, status, order?);
    constructor();
}
export declare class NullPositionGateway implements Interfaces.IPositionGateway {
    PositionUpdate: Utils.Evt<Models.CurrencyPosition>;
    constructor(pair: Models.CurrencyPair);
}
export declare class NullMarketDataGateway implements Interfaces.IMarketDataGateway {
    private _minTick;
    MarketData: Utils.Evt<Models.Market>;
    ConnectChanged: Utils.Evt<Models.ConnectivityStatus>;
    MarketTrade: Utils.Evt<Models.GatewayMarketTrade>;
    constructor(_minTick: number);
    private getPrice;
    private genMarketTrade;
    private genSingleLevel;
    private readonly Depth;
    private generateMarketData;
}
export declare function createNullGateway(config: Config.IConfigProvider, pair: Models.CurrencyPair): Promise<Interfaces.CombinedGateway>;
