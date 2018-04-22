/// <reference path="utils.d.ts" />
/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="persister.d.ts" />
/// <reference path="broker.d.ts" />
/// <reference path="web.d.ts" />
/// <reference path="quoting-engine.d.ts" />
import Models = require('../common/models');
import Messaging = require('../common/messaging');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import P = require('./persister');
import Broker = require('./broker');
import QuotingEngine = require('./quoting-engine');
export declare class MarketTradeBroker implements Interfaces.IMarketTradeBroker {
    private _mdGateway;
    private _marketTradePublisher;
    private _mdBroker;
    private _quoteEngine;
    private _base;
    private _persister;
    private _log;
    MarketTrade: Utils.Evt<Models.MarketTrade>;
    readonly marketTrades: Models.MarketTrade[];
    private _marketTrades;
    private handleNewMarketTrade;
    constructor(_mdGateway: Interfaces.IMarketDataGateway, _marketTradePublisher: Messaging.IPublish<Models.MarketTrade>, _mdBroker: Interfaces.IMarketDataBroker, _quoteEngine: QuotingEngine.QuotingEngine, _base: Broker.ExchangeBroker, _persister: P.IPersist<Models.MarketTrade>, initMkTrades: Array<Models.MarketTrade>);
}
