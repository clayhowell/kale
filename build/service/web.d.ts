/// <reference path="utils.d.ts" />
/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="persister.d.ts" />
/// <reference types="express" />
import Messaging = require('../common/messaging');
import express = require('express');
import Persister = require('./persister');
export declare class StandaloneHttpPublisher<T> {
    private _wrapped;
    private route;
    private _httpApp;
    private _persister;
    constructor(_wrapped: Messaging.IPublish<T>, route: string, _httpApp: express.Application, _persister: Persister.ILoadAll<T>);
    publish: (msg: T) => void;
    registerSnapshot: (generator: () => T[]) => Messaging.IPublish<T>;
}
