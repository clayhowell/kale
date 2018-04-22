"use strict";
/// <reference path="../../common/models.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const StyleHelpers = require("./helpers");
const Models = require("../../common/models");
class TopOfTheMarketQuoteStyle {
    constructor() {
        this.Mode = Models.QuotingMode.Top;
        this.GenerateQuote = (input) => {
            return computeTopJoinQuote(input);
        };
    }
}
exports.TopOfTheMarketQuoteStyle = TopOfTheMarketQuoteStyle;
class InverseTopOfTheMarketQuoteStyle {
    constructor() {
        this.Mode = Models.QuotingMode.InverseTop;
        this.GenerateQuote = (input) => {
            return computeInverseJoinQuote(input);
        };
    }
}
exports.InverseTopOfTheMarketQuoteStyle = InverseTopOfTheMarketQuoteStyle;
class InverseJoinQuoteStyle {
    constructor() {
        this.Mode = Models.QuotingMode.InverseJoin;
        this.GenerateQuote = (input) => {
            return computeInverseJoinQuote(input);
        };
    }
}
exports.InverseJoinQuoteStyle = InverseJoinQuoteStyle;
class PingPongQuoteStyle {
    constructor() {
        this.Mode = Models.QuotingMode.PingPong;
        this.GenerateQuote = (input) => {
            return computePingPongQuote(input);
        };
    }
}
exports.PingPongQuoteStyle = PingPongQuoteStyle;
class JoinQuoteStyle {
    constructor() {
        this.Mode = Models.QuotingMode.Join;
        this.GenerateQuote = (input) => {
            return computeTopJoinQuote(input);
        };
    }
}
exports.JoinQuoteStyle = JoinQuoteStyle;
function getQuoteAtTopOfMarket(input) {
    let topBid = (input.market.bids[0].size > input.params.stepOverSize ? input.market.bids[0] : input.market.bids[1]);
    if (typeof topBid === 'undefined')
        topBid = input.market.bids[0]; // only guaranteed top level exists
    let bidPx = topBid.price;
    let topAsk = (input.market.asks[0].size > input.params.stepOverSize ? input.market.asks[0] : input.market.asks[1]);
    if (typeof topAsk === 'undefined')
        topAsk = input.market.asks[0];
    let askPx = topAsk.price;
    return new StyleHelpers.GeneratedQuote(bidPx, topBid.size, askPx, topAsk.size);
}
function computeTopJoinQuote(input) {
    let genQt = getQuoteAtTopOfMarket(input);
    if (input.params.mode === Models.QuotingMode.Top && genQt.bidSz > .2) {
        genQt.bidPx += input.minTickIncrement;
    }
    let minBid = input.fv.price - input.params.width / 2.0;
    genQt.bidPx = Math.min(minBid, genQt.bidPx);
    if (input.params.mode === Models.QuotingMode.Top && genQt.askSz > .2) {
        genQt.askPx -= input.minTickIncrement;
    }
    let minAsk = input.fv.price + input.params.width / 2.0;
    genQt.askPx = Math.max(minAsk, genQt.askPx);
    genQt.bidSz = input.params.size;
    genQt.askSz = input.params.size;
    return genQt;
}
function computeInverseJoinQuote(input) {
    let genQt = getQuoteAtTopOfMarket(input);
    let mktWidth = Math.abs(genQt.askPx - genQt.bidPx);
    if (mktWidth > input.params.width) {
        genQt.askPx += input.params.width;
        genQt.bidPx -= input.params.width;
    }
    if (input.params.mode === Models.QuotingMode.InverseTop) {
        if (genQt.bidSz > .2)
            genQt.bidPx += input.minTickIncrement;
        if (genQt.askSz > .2)
            genQt.askPx -= input.minTickIncrement;
    }
    if (mktWidth < (2.0 * input.params.width / 3.0)) {
        genQt.askPx += input.params.width / 4.0;
        genQt.bidPx -= input.params.width / 4.0;
    }
    genQt.bidSz = input.params.size;
    genQt.askSz = input.params.size;
    return genQt;
}
//computePingPongQuote is same as computeTopJoinQuote but need to use params.mode === Models.QuotingMode.PingPong
function computePingPongQuote(input) {
    let genQt = getQuoteAtTopOfMarket(input);
    if (input.params.mode === Models.QuotingMode.PingPong && genQt.bidSz > .2) {
        genQt.bidPx += input.minTickIncrement;
    }
    let minBid = input.fv.price - input.params.width / 2.0;
    genQt.bidPx = Math.min(minBid, genQt.bidPx);
    if (input.params.mode === Models.QuotingMode.PingPong && genQt.askSz > .2) {
        genQt.askPx -= input.minTickIncrement;
    }
    let minAsk = input.fv.price + input.params.width / 2.0;
    genQt.askPx = Math.max(minAsk, genQt.askPx);
    genQt.bidSz = input.params.size;
    genQt.askSz = input.params.size;
    return genQt;
}
//# sourceMappingURL=top-join.js.map