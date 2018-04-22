/// <reference path="utils.d.ts" />
/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="persister.d.ts" />
/// <reference path="messages.d.ts" />
import Models = require('../common/models');
import Messaging = require('../common/messaging');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import Persister = require('./persister');
import Messages = require('./messages');
export declare class MarketDataBroker implements Interfaces.IMarketDataBroker {
    private _mdGateway;
    private _messages;
    MarketData: Utils.Evt<Models.Market>;
    readonly currentBook: Models.Market;
    private _currentBook;
    private handleMarketData;
    constructor(time: Utils.ITimeProvider, _mdGateway: Interfaces.IMarketDataGateway, rawMarketPublisher: Messaging.IPublish<Models.Market>, persister: Persister.IPersist<Models.Market>, _messages: Messages.MessagesPubisher);
}
export declare class OrderStateCache implements Interfaces.IOrderStateCache {
    allOrders: Map<string, Models.OrderStatusReport>;
    exchIdsToClientIds: Map<string, string>;
}
export declare class OrderBroker implements Interfaces.IOrderBroker {
    private _timeProvider;
    private _baseBroker;
    private _oeGateway;
    private _orderPersister;
    private _tradePersister;
    private _orderStatusPublisher;
    private _tradePublisher;
    private _submittedOrderReciever;
    private _cancelOrderReciever;
    private _cancelAllOrdersReciever;
    private _messages;
    private _orderCache;
    private readonly _publishAllOrders;
    private _log;
    cancelOpenOrders(): Promise<number>;
    OrderUpdate: Utils.Evt<Models.OrderStatusReport>;
    private _cancelsWaitingForExchangeOrderId;
    Trade: Utils.Evt<Models.Trade>;
    _trades: Models.Trade[];
    private roundPrice;
    sendOrder: (order: Models.SubmitNewOrder) => Models.SentOrder;
    replaceOrder: (replace: Models.CancelReplaceOrder) => Models.SentOrder;
    cancelOrder: (cancel: Models.OrderCancel) => void;
    updateOrderState: (osr: Models.OrderStatusUpdate) => Models.OrderStatusReport;
    private _pendingRemovals;
    private updateOrderStatusInMemory;
    private addOrderStatusInMemory;
    private clearPendingRemovals;
    private shouldPublish;
    private orderStatusSnapshot;
    constructor(_timeProvider: Utils.ITimeProvider, _baseBroker: Interfaces.IBroker, _oeGateway: Interfaces.IOrderEntryGateway, _orderPersister: Persister.IPersist<Models.OrderStatusReport>, _tradePersister: Persister.IPersist<Models.Trade>, _orderStatusPublisher: Messaging.IPublish<Models.OrderStatusReport>, _tradePublisher: Messaging.IPublish<Models.Trade>, _submittedOrderReciever: Messaging.IReceive<Models.OrderRequestFromUI>, _cancelOrderReciever: Messaging.IReceive<Models.OrderStatusReport>, _cancelAllOrdersReciever: Messaging.IReceive<Models.CancelAllOrdersRequest>, _messages: Messages.MessagesPubisher, _orderCache: OrderStateCache, initOrders: Models.OrderStatusReport[], initTrades: Models.Trade[], _publishAllOrders: boolean);
}
export declare class PositionBroker implements Interfaces.IPositionBroker {
    private _timeProvider;
    private _base;
    private _posGateway;
    private _positionPublisher;
    private _positionPersister;
    private _mdBroker;
    private _log;
    NewReport: Utils.Evt<Models.PositionReport>;
    private _report;
    readonly latestReport: Models.PositionReport;
    private _currencies;
    getPosition(currency: Models.Currency): Models.CurrencyPosition;
    private onPositionUpdate;
    constructor(_timeProvider: Utils.ITimeProvider, _base: Interfaces.IBroker, _posGateway: Interfaces.IPositionGateway, _positionPublisher: Messaging.IPublish<Models.PositionReport>, _positionPersister: Persister.IPersist<Models.PositionReport>, _mdBroker: Interfaces.IMarketDataBroker);
}
export declare class ExchangeBroker implements Interfaces.IBroker {
    private _pair;
    private _mdGateway;
    private _baseGateway;
    private _oeGateway;
    private _connectivityPublisher;
    private _log;
    readonly hasSelfTradePrevention: boolean;
    makeFee(): number;
    takeFee(): number;
    exchange(): Models.Exchange;
    readonly pair: Models.CurrencyPair;
    readonly minTickIncrement: number;
    ConnectChanged: Utils.Evt<Models.ConnectivityStatus>;
    private mdConnected;
    private oeConnected;
    private _connectStatus;
    onConnect: (gwType: Models.GatewayType, cs: Models.ConnectivityStatus) => void;
    readonly connectStatus: Models.ConnectivityStatus;
    constructor(_pair: Models.CurrencyPair, _mdGateway: Interfaces.IMarketDataGateway, _baseGateway: Interfaces.IExchangeDetailsGateway, _oeGateway: Interfaces.IOrderEntryGateway, _connectivityPublisher: Messaging.IPublish<Models.ConnectivityStatus>);
}
