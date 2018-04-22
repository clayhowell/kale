/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference types="angular" />
import angular = require('angular');
import Messaging = require('../common/messaging');
import Models = require('../common/models');
import * as moment from 'moment';
export interface ProductState {
    advert: Models.ProductAdvertisement;
    fixed: number;
}
export declare class FireFactory {
    private socket;
    private $log;
    constructor(socket: any, $log: ng.ILogService);
    getFire: <T>(topic: string) => Messaging.IFire<T>;
}
export declare class SubscriberFactory {
    private socket;
    private $log;
    constructor(socket: any, $log: ng.ILogService);
    getSubscriber: <T>(scope: angular.IScope, topic: string) => Messaging.ISubscribe<T>;
}
export declare class EvalAsyncSubscriber<T> implements Messaging.ISubscribe<T> {
    private _scope;
    private _wrapped;
    constructor(_scope: ng.IScope, topic: string, io: any, log: (...args: any[]) => void);
    registerSubscriber: (incrementalHandler: (msg: T) => void, snapshotHandler: (msgs: T[]) => void) => Messaging.ISubscribe<T>;
    registerDisconnectedHandler: (handler: () => void) => Messaging.ISubscribe<T>;
    registerConnectHandler: (handler: () => void) => Messaging.ISubscribe<T>;
    disconnect: () => void;
    readonly connected: boolean;
}
export declare function fastDiff(a: moment.Moment, b: moment.Moment): number;
export declare let sharedDirectives: string;
