/// <reference path="../../common/models.d.ts" />
import StyleHelpers = require('./helpers');
import Models = require('../../common/models');
export declare class QuotingStyleRegistry {
    private _mapping;
    constructor(modules: StyleHelpers.QuoteStyle[]);
    private static NullQuoteGenerator;
    Get: (mode: Models.QuotingMode) => StyleHelpers.QuoteStyle;
}
