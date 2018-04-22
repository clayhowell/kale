"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function timeout(ms, promise) {
    return new Promise(function (resolve, reject) {
        promise.then(resolve);
        setTimeout(function () {
            reject(new Error('Timeout after ' + ms + ' ms')); // (A)
        }, ms);
    });
}
exports.timeout = timeout;
function delay(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms); // (A)
    });
}
exports.delay = delay;
//# sourceMappingURL=promises.js.map