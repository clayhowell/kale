/// <reference path="../../common/models.d.ts" />
import StyleHelpers = require('./helpers');
import Models = require('../../common/models');
export declare class DepthQuoteStyle implements StyleHelpers.QuoteStyle {
    Mode: Models.QuotingMode;
    GenerateQuote: (input: StyleHelpers.QuoteInput) => StyleHelpers.GeneratedQuote;
}
