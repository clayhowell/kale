/// <reference path="utils.d.ts" />
/// <reference path="../common/models.d.ts" />
/// <reference path="../common/messaging.d.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="config.d.ts" />
import Models = require('../common/models');
import Utils = require('./utils');
import mongodb = require('mongodb');
import Config = require('./config');
export declare function loadDb(config: Config.IConfigProvider): Promise<mongodb.Db>;
export interface Persistable {
    time?: Date;
    pair?: Models.CurrencyPair;
    exchange?: Models.Exchange;
}
export interface IPersist<T> {
    persist(data: T): void;
}
export interface ILoadLatest<T> extends IPersist<T> {
    loadLatest(): Promise<T>;
}
export interface ILoadAll<T> extends IPersist<T> {
    loadAll(limit?: number, query?: Object): Promise<T[]>;
}
export declare class RepositoryPersister<T> implements ILoadLatest<T> {
    private collection;
    private _defaultParameter;
    private _dbName;
    private _exchange;
    private _pair;
    private _log;
    loadLatest: () => Promise<T>;
    persist: (report: T) => Promise<void>;
    private converter;
    constructor(collection: mongodb.Collection, _defaultParameter: T, _dbName: string, _exchange: Models.Exchange, _pair: Models.CurrencyPair);
}
export declare class Persister<T extends Persistable> implements ILoadAll<T> {
    private collection;
    private _dbName;
    private _exchange;
    private _pair;
    private _log;
    loadAll: (limit?: number, query?: any) => Promise<T[]>;
    private loadInternal;
    private _persistQueue;
    persist: (report: T) => void;
    private converter;
    constructor(time: Utils.ITimeProvider, collection: mongodb.Collection, _dbName: string, _exchange: Models.Exchange, _pair: Models.CurrencyPair);
}
