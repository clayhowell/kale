/// <reference types="node" />
import Models = require('../common/models');
import moment = require('moment');
export declare const date: () => Date;
export declare function fastDiff(x: Date, y: Date): number;
export declare function timeOrDefault(x: Models.ITimestamped, timeProvider: ITimeProvider): Date;
export declare class Evt<T> {
    private _singleCallback;
    private _multiCallback;
    on: (handler: (data?: T) => void) => void;
    off: (handler: (data?: T) => void) => void;
    trigger: (data?: T) => void;
}
export declare function roundSide(x: number, minTick: number, side: Models.Side): number;
export declare function roundNearest(x: number, minTick: number): number;
export declare function roundUp(x: number, minTick: number): number;
export declare function roundDown(x: number, minTick: number): number;
export interface ITimeProvider {
    utcNow(): Date;
    setTimeout(action: () => void, time: moment.Duration): any;
    setImmediate(action: () => void): any;
    setInterval(action: () => void, time: moment.Duration): any;
}
export interface IBacktestingTimeProvider extends ITimeProvider {
    scrollTimeTo(time: moment.Moment): any;
}
export declare class RealTimeProvider implements ITimeProvider {
    constructor();
    utcNow: () => Date;
    setTimeout: (action: () => void, time: moment.Duration) => NodeJS.Timer;
    setImmediate: (action: () => void) => any;
    setInterval: (action: () => void, time: moment.Duration) => NodeJS.Timer;
}
export interface IActionScheduler {
    schedule(action: () => void): any;
}
export declare class ImmediateActionScheduler implements IActionScheduler {
    private _timeProvider;
    constructor(_timeProvider: ITimeProvider);
    private _shouldSchedule;
    schedule: (action: () => void) => void;
}
export declare function getJSON<T>(url: string, qs?: any): Promise<T>;
