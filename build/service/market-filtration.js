"use strict";
/// <reference path="../common/models.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="config.ts" />
/// <reference path="utils.ts" />
/// <reference path="quoter.ts"/>
/// <reference path="interfaces.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const Models = require("../common/models");
const Utils = require("./utils");
class MarketFiltration {
    constructor(_details, _scheduler, _quoter, _broker) {
        this._details = _details;
        this._scheduler = _scheduler;
        this._quoter = _quoter;
        this._broker = _broker;
        this._latest = null;
        this.FilteredMarketChanged = new Utils.Evt();
        this.filterFullMarket = () => {
            let mkt = this._broker.currentBook;
            if (mkt == null || mkt.bids.length < 1 || mkt.asks.length < 1) {
                this.latestFilteredMarket = null;
                return;
            }
            let ask = this.filterMarket(mkt.asks, Models.Side.Ask);
            let bid = this.filterMarket(mkt.bids, Models.Side.Bid);
            this.latestFilteredMarket = new Models.Market(bid, ask, mkt.time);
        };
        this.filterMarket = (mkts, s) => {
            let rgq = this._quoter.quotesSent(s);
            let copiedMkts = [];
            for (let i = 0; i < mkts.length; i++) {
                copiedMkts.push(new Models.MarketSide(mkts[i].price, mkts[i].size));
            }
            for (let j = 0; j < rgq.length; j++) {
                let q = rgq[j].quote;
                for (let i = 0; i < copiedMkts.length; i++) {
                    let m = copiedMkts[i];
                    if (Math.abs(q.price - m.price) < this._details.minTickIncrement) {
                        copiedMkts[i].size = m.size - q.size;
                    }
                }
            }
            return copiedMkts.filter(m => m.size > 0.001);
        };
        _broker.MarketData.on(() => this._scheduler.schedule(this.filterFullMarket));
    }
    get latestFilteredMarket() { return this._latest; }
    set latestFilteredMarket(val) {
        this._latest = val;
        this.FilteredMarketChanged.trigger();
    }
}
exports.MarketFiltration = MarketFiltration;
//# sourceMappingURL=market-filtration.js.map