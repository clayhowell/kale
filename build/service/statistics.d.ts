/// <reference path="utils.d.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="fair-value.d.ts" />
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import FairValue = require('./fair-value');
export interface IComputeStatistics {
    latest: number;
    initialize(seedData: number[]): void;
    addNewValue(value: number): number;
}
export declare class EwmaStatisticCalculator implements IComputeStatistics {
    private _alpha;
    constructor(_alpha: number);
    latest: number;
    initialize(seedData: number[]): void;
    addNewValue(value: number): number;
}
export declare function computeEwma(newValue: number, previous: number, alpha: number): number;
export declare class EmptyEWMACalculator implements Interfaces.IEwmaCalculator {
    constructor();
    latest: number;
    Updated: Utils.Evt<any>;
}
export declare class ObservableEWMACalculator implements Interfaces.IEwmaCalculator {
    private _timeProvider;
    private _fv;
    private _alpha;
    private _log;
    constructor(_timeProvider: Utils.ITimeProvider, _fv: FairValue.FairValueEngine, _alpha?: number);
    private onTick;
    private _latest;
    readonly latest: number;
    private setLatest;
    Updated: Utils.Evt<any>;
}
