/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="persister.d.ts" />
import Messaging = require('../common/messaging');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
import Persister = require('./persister');
import Models = require('../common/models');
export declare class MessagesPubisher implements Interfaces.IPublishMessages {
    private _timeProvider;
    private _persister;
    private _wrapped;
    private _storedMessages;
    constructor(_timeProvider: Utils.ITimeProvider, _persister: Persister.IPersist<Models.Message>, initMsgs: Models.Message[], _wrapped: Messaging.IPublish<Models.Message>);
    publish: (text: string) => void;
}
