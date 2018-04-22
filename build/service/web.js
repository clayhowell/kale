"use strict";
/// <reference path="utils.ts" />
/// <reference path="../common/models.ts" />
/// <reference path="../common/messaging.ts" />
///<reference path="persister.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const moment = require("moment");
class StandaloneHttpPublisher {
    constructor(_wrapped, route, _httpApp, _persister) {
        this._wrapped = _wrapped;
        this.route = route;
        this._httpApp = _httpApp;
        this._persister = _persister;
        this.publish = this._wrapped.publish;
        this.registerSnapshot = (generator) => {
            return this._wrapped.registerSnapshot(generator);
        };
        _httpApp.get('/data/' + route, (req, res) => {
            let getParameter = (pName, cvt) => {
                let rawMax = req.param(pName, null);
                return (rawMax === null ? null : cvt(rawMax));
            };
            let max = getParameter('max', r => parseInt(r));
            let startTime = getParameter('start_time', r => moment(r));
            let handler = (d) => {
                if (max !== null && max <= d.length)
                    d = _.takeRight(d, max);
                res.json(d);
            };
            const selector = startTime == null
                ? null
                : { time: { $gte: startTime.toDate() } };
            _persister.loadAll(max, selector).then(handler);
        });
    }
}
exports.StandaloneHttpPublisher = StandaloneHttpPublisher;
//# sourceMappingURL=web.js.map