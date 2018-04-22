/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="config.d.ts" />
/// <reference path="utils.d.ts" />
/// <reference path="quoter.d.ts" />
/// <reference path="interfaces.d.ts" />
import Models = require('../common/models');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import Quoter = require('./quoter');
export declare class MarketFiltration {
    private _details;
    private _scheduler;
    private _quoter;
    private _broker;
    private _latest;
    FilteredMarketChanged: Utils.Evt<Models.Market>;
    latestFilteredMarket: Models.Market;
    constructor(_details: Interfaces.IBroker, _scheduler: Utils.IActionScheduler, _quoter: Quoter.Quoter, _broker: Interfaces.IMarketDataBroker);
    private filterFullMarket;
    private filterMarket;
}
