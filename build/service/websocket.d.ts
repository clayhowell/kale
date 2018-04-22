import * as Models from '../common/models';
export default class WebSocket {
    private _url;
    private _reconnectInterval;
    private _onData;
    private _onConnected;
    private _onDisconnected;
    private readonly _log;
    private _ws;
    constructor(_url: string, _reconnectInterval?: number, _onData?: (msgs: Models.Timestamped<string>) => void, _onConnected?: () => void, _onDisconnected?: () => void);
    readonly isConnected: boolean;
    connect: () => void;
    private _failureCount;
    private createSocket;
    private closeAndReconnect;
    send: (data: string, callback?: () => void) => void;
}
