/// <reference path="../../common/models.ts" />

import StyleHelpers = require('./helpers');
import Models = require('../../common/models');

export class MidMarketQuoteStyle implements StyleHelpers.QuoteStyle {
    Mode = Models.QuotingMode.Mid;

    GenerateQuote = (input: StyleHelpers.QuoteInput): StyleHelpers.GeneratedQuote => {
        let width = input.params.width;
        let size = input.params.size;

        let bidPx = Math.max(input.fv.price - width, 0);
        let askPx = input.fv.price + width;

        return new StyleHelpers.GeneratedQuote(bidPx, size, askPx, size);
    }
}