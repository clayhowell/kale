/// <reference path="../../common/models.d.ts" />
import StyleHelpers = require('./helpers');
import Models = require('../../common/models');
export declare class TopOfTheMarketQuoteStyle implements StyleHelpers.QuoteStyle {
    Mode: Models.QuotingMode;
    GenerateQuote: (input: StyleHelpers.QuoteInput) => StyleHelpers.GeneratedQuote;
}
export declare class InverseTopOfTheMarketQuoteStyle implements StyleHelpers.QuoteStyle {
    Mode: Models.QuotingMode;
    GenerateQuote: (input: StyleHelpers.QuoteInput) => StyleHelpers.GeneratedQuote;
}
export declare class InverseJoinQuoteStyle implements StyleHelpers.QuoteStyle {
    Mode: Models.QuotingMode;
    GenerateQuote: (input: StyleHelpers.QuoteInput) => StyleHelpers.GeneratedQuote;
}
export declare class PingPongQuoteStyle implements StyleHelpers.QuoteStyle {
    Mode: Models.QuotingMode;
    GenerateQuote: (input: StyleHelpers.QuoteInput) => StyleHelpers.GeneratedQuote;
}
export declare class JoinQuoteStyle implements StyleHelpers.QuoteStyle {
    Mode: Models.QuotingMode;
    GenerateQuote: (input: StyleHelpers.QuoteInput) => StyleHelpers.GeneratedQuote;
}
