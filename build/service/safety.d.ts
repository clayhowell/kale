/// <reference path="../common/models.d.ts" />
/// <reference path="config.d.ts" />
/// <reference path="utils.d.ts" />
/// <reference path="broker.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="persister.d.ts" />
import Models = require('../common/models');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import Broker = require('./broker');
import Messaging = require('../common/messaging');
import Persister = require('./persister');
export declare class SafetyCalculator {
    private _timeProvider;
    private _repo;
    private _broker;
    private _qlParams;
    private _publisher;
    private _persister;
    NewValue: Utils.Evt<{}>;
    private _latest;
    latest: Models.TradeSafety;
    private _buys;
    private _sells;
    constructor(_timeProvider: Utils.ITimeProvider, _repo: Interfaces.IRepository<Models.QuotingParameters>, _broker: Broker.OrderBroker, _qlParams: Interfaces.IRepository<Models.QuotingParameters>, _publisher: Messaging.IPublish<Models.TradeSafety>, _persister: Persister.IPersist<Models.TradeSafety>);
    private onTrade;
    private isOlderThan(o, settings);
    private computeQtyLimit;
}
