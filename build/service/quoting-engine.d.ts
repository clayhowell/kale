/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="config.d.ts" />
/// <reference path="utils.d.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="quoter.d.ts" />
/// <reference path="safety.d.ts" />
/// <reference path="statistics.d.ts" />
/// <reference path="active-state.d.ts" />
/// <reference path="fair-value.d.ts" />
/// <reference path="market-filtration.d.ts" />
/// <reference path="quoting-parameters.d.ts" />
/// <reference path="position-management.d.ts" />
/// <reference path="quoting-styles/style-registry.d.ts" />
import Models = require('../common/models');
import Messaging = require('../common/messaging');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import Safety = require('./safety');
import FairValue = require('./fair-value');
import MarketFiltration = require('./market-filtration');
import QuotingParameters = require('./quoting-parameters');
import PositionManagement = require('./position-management');
import QuotingStyleRegistry = require('./quoting-styles/style-registry');
export declare class QuotingEngine {
    private _registry;
    private _timeProvider;
    private _filteredMarkets;
    private _fvEngine;
    private _qlParamRepo;
    private _quotePublisher;
    private _orderBroker;
    private _positionBroker;
    private _details;
    private _ewma;
    private _targetPosition;
    private _safeties;
    private _log;
    QuoteChanged: Utils.Evt<Models.TwoSidedQuote>;
    private _latest;
    latestQuote: Models.TwoSidedQuote;
    constructor(_registry: QuotingStyleRegistry.QuotingStyleRegistry, _timeProvider: Utils.ITimeProvider, _filteredMarkets: MarketFiltration.MarketFiltration, _fvEngine: FairValue.FairValueEngine, _qlParamRepo: QuotingParameters.QuotingParametersRepository, _quotePublisher: Messaging.IPublish<Models.TwoSidedQuote>, _orderBroker: Interfaces.IOrderBroker, _positionBroker: Interfaces.IPositionBroker, _details: Interfaces.IBroker, _ewma: Interfaces.IEwmaCalculator, _targetPosition: PositionManagement.TargetBasePositionManager, _safeties: Safety.SafetyCalculator);
    private computeQuote(filteredMkt, fv);
    private recalcQuote;
    private quotesAreSame(newQ, prevTwoSided, side);
}
