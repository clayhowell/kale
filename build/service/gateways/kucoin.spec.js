'use strict';
/// <reference path="../../common/models.ts" />
///<reference path="../config.ts"/>
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const kucoin_1 = require('./kucoin');
const Models = require('../../common/models');
const Config = require('../config');
const Utils = require('../utils');
const chai_1 = require('chai');
require('mocha');
function ParseCurrencyPair(raw) {
  const split = raw.split('/');
  if (split.length !== 2)
    throw new Error(
      'Invalid currency pair! Must be in the format of BASE/QUOTE, eg ADB/BTC'
    );
  return new Models.CurrencyPair(
    Models.Currency[split[0]],
    Models.Currency[split[1]]
  );
}
const config = new Config.ConfigProvider();
const timeProvider = new Utils.RealTimeProvider();
const pair = ParseCurrencyPair(config.GetString('TradedPair'));
describe('Kucoin Gateway service ', () => {
  let kucoin = {};
  before(() =>
    __awaiter(this, void 0, void 0, function*() {
      kucoin = yield kucoin_1.createKucoin(timeProvider, config, pair);
      chai_1.expect(kucoin).to.be.an('object');
    })
  );
  after(() => {});
  it('should have a Base Gateway', done => {
    chai_1.expect(kucoin).to.have.property('base');
    console.log(kucoin);
    done();
  });
  it('should have a Position Gateway ', done => {
    chai_1.expect(kucoin).to.have.property('pg');
    done();
  });
  it('should have a Market Data Gateway ', done => {
    chai_1.expect(kucoin).to.have.property('md');
    done();
  });
  it('should have an Order Entry Gateway ', done => {
    chai_1.expect(kucoin).to.have.property('oe');
    done();
  });
});
//# sourceMappingURL=kucoin.spec.js.map
