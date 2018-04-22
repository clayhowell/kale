/// <reference path="../../common/models.d.ts" />
import Models = require('../../common/models');
export declare class GeneratedQuote {
    bidPx: number;
    bidSz: number;
    askPx: number;
    askSz: number;
    constructor(bidPx: number, bidSz: number, askPx: number, askSz: number);
}
export declare class QuoteInput {
    market: Models.Market;
    fv: Models.FairValue;
    params: Models.QuotingParameters;
    minTickIncrement: number;
    minSizeIncrement: number;
    constructor(market: Models.Market, fv: Models.FairValue, params: Models.QuotingParameters, minTickIncrement: number, minSizeIncrement?: number);
}
export interface QuoteStyle {
    Mode: Models.QuotingMode;
    GenerateQuote(input: QuoteInput): GeneratedQuote;
}
