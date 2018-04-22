/// <reference path="models.d.ts" />
/// <reference types="socket.io" />
/// <reference types="socket.io-client" />
export interface IPublish<T> {
    publish: (msg: T) => void;
    registerSnapshot: (generator: () => T[]) => IPublish<T>;
}
export declare class Publisher<T> implements IPublish<T> {
    private topic;
    private _io;
    private _log;
    private _snapshot;
    constructor(topic: string, _io: SocketIO.Server, snapshot: () => T[], _log: (...args: any[]) => void);
    publish: (msg: T) => SocketIO.Namespace;
    registerSnapshot: (generator: () => T[]) => this;
}
export declare class NullPublisher<T> implements IPublish<T> {
    publish: (msg: T) => void;
    registerSnapshot: (generator: () => T[]) => this;
}
export interface ISubscribe<T> {
    registerSubscriber: (incrementalHandler: (msg: T) => void, snapshotHandler: (msgs: T[]) => void) => ISubscribe<T>;
    registerDisconnectedHandler: (handler: () => void) => ISubscribe<T>;
    registerConnectHandler: (handler: () => void) => ISubscribe<T>;
    connected: boolean;
    disconnect: () => void;
}
export declare class Subscriber<T> implements ISubscribe<T> {
    private topic;
    private _log;
    private _incrementalHandler;
    private _snapshotHandler;
    private _disconnectHandler;
    private _connectHandler;
    private _socket;
    constructor(topic: string, io: SocketIOClient.Socket, _log: (...args: any[]) => void);
    readonly connected: boolean;
    private onConnect;
    private onDisconnect;
    private onIncremental;
    private onSnapshot;
    disconnect: () => void;
    registerSubscriber: (incrementalHandler: (msg: T) => void, snapshotHandler: (msgs: T[]) => void) => this;
    registerDisconnectedHandler: (handler: () => void) => this;
    registerConnectHandler: (handler: () => void) => this;
}
export interface IFire<T> {
    fire(msg: T): void;
}
export declare class Fire<T> implements IFire<T> {
    private topic;
    private _socket;
    constructor(topic: string, io: SocketIOClient.Socket, _log: (...args: any[]) => void);
    fire: (msg: T) => void;
}
export interface IReceive<T> {
    registerReceiver(handler: (msg: T) => void): void;
}
export declare class NullReceiver<T> implements IReceive<T> {
    registerReceiver: (handler: (msg: T) => void) => void;
}
export declare class Receiver<T> implements IReceive<T> {
    private topic;
    private _log;
    private _handler;
    constructor(topic: string, io: SocketIO.Server, _log: (...args: any[]) => void);
    registerReceiver: (handler: (msg: T) => void) => void;
}
export declare class Topics {
    static FairValue: string;
    static Quote: string;
    static ActiveSubscription: string;
    static ActiveChange: string;
    static MarketData: string;
    static QuotingParametersChange: string;
    static SafetySettings: string;
    static Product: string;
    static OrderStatusReports: string;
    static ProductAdvertisement: string;
    static Position: string;
    static ExchangeConnectivity: string;
    static SubmitNewOrder: string;
    static CancelOrder: string;
    static MarketTrade: string;
    static Trades: string;
    static Message: string;
    static ExternalValuation: string;
    static QuoteStatus: string;
    static TargetBasePosition: string;
    static TradeSafetyValue: string;
    static CancelAllOrders: string;
}
