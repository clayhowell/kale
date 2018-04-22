/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="config.d.ts" />
/// <reference path="utils.d.ts" />
/// <reference path="quoter.d.ts" />
/// <reference path="safety.d.ts" />
/// <reference path="persister.d.ts" />
/// <reference path="statistics.d.ts" />
/// <reference path="active-state.d.ts" />
/// <reference path="market-filtration.d.ts" />
/// <reference path="quoting-parameters.d.ts" />
import Models = require('../common/models');
import Messaging = require('../common/messaging');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import Persister = require('./persister');
import MarketFiltration = require('./market-filtration');
import QuotingParameters = require('./quoting-parameters');
export declare class FairValueEngine {
    private _details;
    private _timeProvider;
    private _filtration;
    private _qlParamRepo;
    private _fvPublisher;
    private _fvPersister;
    FairValueChanged: Utils.Evt<Models.FairValue>;
    private _latest;
    latestFairValue: Models.FairValue;
    constructor(_details: Interfaces.IBroker, _timeProvider: Utils.ITimeProvider, _filtration: MarketFiltration.MarketFiltration, _qlParamRepo: QuotingParameters.QuotingParametersRepository, _fvPublisher: Messaging.IPublish<Models.FairValue>, _fvPersister: Persister.IPersist<Models.FairValue>);
    private static ComputeFVUnrounded(ask, bid, model);
    private ComputeFV(ask, bid, model);
    private recalcFairValue;
}
