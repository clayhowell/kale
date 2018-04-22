"use strict";
/// <reference path="../../common/models.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const StyleHelpers = require("./helpers");
const Models = require("../../common/models");
class MidMarketQuoteStyle {
    constructor() {
        this.Mode = Models.QuotingMode.Mid;
        this.GenerateQuote = (input) => {
            let width = input.params.width;
            let size = input.params.size;
            let bidPx = Math.max(input.fv.price - width, 0);
            let askPx = input.fv.price + width;
            return new StyleHelpers.GeneratedQuote(bidPx, size, askPx, size);
        };
    }
}
exports.MidMarketQuoteStyle = MidMarketQuoteStyle;
//# sourceMappingURL=mid-market.js.map