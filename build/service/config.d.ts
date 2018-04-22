/// <reference path="../common/models.d.ts" />
export interface IConfigProvider {
    Has(configKey: string): boolean;
    GetString(configKey: string): string;
    GetBoolean(configKey: string): boolean;
    GetNumber(configKey: string): number;
    inBacktestMode: boolean;
}
export declare class ConfigProvider implements IConfigProvider {
    private static Log;
    private _config;
    constructor();
    Has: (configKey: string) => boolean;
    GetNumber: (configKey: string) => number;
    GetBoolean: (configKey: string) => boolean;
    GetString: (configKey: string) => string;
    private Fetch;
    inBacktestMode: boolean;
}
