/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="config.d.ts" />
/// <reference path="utils.d.ts" />
/// <reference path="quoter.d.ts" />
/// <reference path="statistics.d.ts" />
/// <reference path="active-state.d.ts" />
/// <reference path="fair-value.d.ts" />
/// <reference path="market-filtration.d.ts" />
/// <reference path="quoting-parameters.d.ts" />
/// <reference path="quoting-engine.d.ts" />
import Models = require('../common/models');
import Messaging = require('../common/messaging');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import Quoter = require('./quoter');
import Active = require('./active-state');
import FairValue = require('./fair-value');
import QuotingEngine = require('./quoting-engine');
export declare class QuoteSender {
    private _timeProvider;
    private _quotingEngine;
    private _statusPublisher;
    private _quoter;
    private _activeRepo;
    private _positionBroker;
    private _fv;
    private _broker;
    private _details;
    private _log;
    private _latest;
    latestStatus: Models.TwoSidedQuoteStatus;
    constructor(_timeProvider: Utils.ITimeProvider, _quotingEngine: QuotingEngine.QuotingEngine, _statusPublisher: Messaging.IPublish<Models.TwoSidedQuoteStatus>, _quoter: Quoter.Quoter, _activeRepo: Active.ActiveRepository, _positionBroker: Interfaces.IPositionBroker, _fv: FairValue.FairValueEngine, _broker: Interfaces.IMarketDataBroker, _details: Interfaces.IBroker);
    private checkCrossedQuotes;
    private sendQuote;
    private hasEnoughPosition;
}
