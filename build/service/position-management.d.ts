/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="config.d.ts" />
/// <reference path="utils.d.ts" />
/// <reference path="statistics.d.ts" />
/// <reference path="persister.d.ts" />
/// <reference path="fair-value.d.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="quoting-parameters.d.ts" />
import Models = require('../common/models');
import Messaging = require('../common/messaging');
import Utils = require('./utils');
import Statistics = require('./statistics');
import Persister = require('./persister');
import FairValue = require('./fair-value');
import moment = require('moment');
import Interfaces = require('./interfaces');
import QuotingParameters = require('./quoting-parameters');
export declare class PositionManager {
    private _details;
    private _timeProvider;
    private _persister;
    private _fvAgent;
    private _data;
    private _shortEwma;
    private _longEwma;
    private _log;
    NewTargetPosition: Utils.Evt<{}>;
    private _latest;
    readonly latestTargetPosition: number;
    private _timer;
    constructor(_details: Interfaces.IBroker, _timeProvider: Utils.ITimeProvider, _persister: Persister.IPersist<Models.RegularFairValue>, _fvAgent: FairValue.FairValueEngine, _data: Models.RegularFairValue[], _shortEwma: Statistics.IComputeStatistics, _longEwma: Statistics.IComputeStatistics);
    private updateEwmaValues;
}
export declare class TargetBasePositionManager {
    private _timeProvider;
    private _positionManager;
    private _params;
    private _positionBroker;
    private _wrapped;
    private _persister;
    private _log;
    NewTargetPosition: Utils.Evt<{}>;
    private _latest;
    readonly latestTargetPosition: Models.TargetBasePositionValue;
    constructor(_timeProvider: Utils.ITimeProvider, _positionManager: PositionManager, _params: QuotingParameters.QuotingParametersRepository, _positionBroker: Interfaces.IPositionBroker, _wrapped: Messaging.IPublish<Models.TargetBasePositionValue>, _persister: Persister.IPersist<Models.TargetBasePositionValue>);
    private recomputeTargetPosition;
}
export declare class RegularTimer {
    private _timeProvider;
    private _action;
    private _diffTime;
    constructor(_timeProvider: Utils.ITimeProvider, _action: () => void, _diffTime: moment.Duration, lastTime: moment.Moment);
    private tick;
    private startTicking;
}
