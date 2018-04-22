/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="config.d.ts" />
/// <reference path="utils.d.ts" />
/// <reference path="interfaces.d.ts" />
import Messaging = require('../common/messaging');
import Utils = require('./utils');
import Interfaces = require('./interfaces');
export declare class ActiveRepository implements Interfaces.IRepository<boolean> {
    private _exchangeConnectivity;
    private _pub;
    private _rec;
    private _log;
    NewParameters: Utils.Evt<{}>;
    private _savedQuotingMode;
    readonly savedQuotingMode: boolean;
    private _latest;
    readonly latest: boolean;
    constructor(startQuoting: boolean, _exchangeConnectivity: Interfaces.IBrokerConnectivity, _pub: Messaging.IPublish<boolean>, _rec: Messaging.IReceive<boolean>);
    private handleNewQuotingModeChangeRequest;
    private reevaluateQuotingMode;
    private updateParameters;
}
