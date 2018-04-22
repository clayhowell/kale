/// <reference path="../../common/models.ts" />
///<reference path="../config.ts"/>

import { createKucoin } from './kucoin';
import Models = require('../../common/models');
import Config = require('../config');
import Utils = require('../utils');
import { expect } from 'chai';
import 'mocha';

function ParseCurrencyPair(raw: string): Models.CurrencyPair {
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
const timeProvider: Utils.ITimeProvider = new Utils.RealTimeProvider();
const pair = ParseCurrencyPair(config.GetString('TradedPair'));

describe('Kucoin Gateway service ', () => {
  let kucoin = {};

  before(async () => {
    kucoin = await createKucoin(timeProvider, config, pair);
    expect(kucoin).to.be.an('object');
  });

  after(() => {});

  it('should have a Base Gateway', done => {
    expect(kucoin).to.have.property('base');
    // console.log(kucoin);
    done();
  });

  it('should have a Position Gateway ', done => {
    expect(kucoin).to.have.property('pg');
    done();
  });

  it('should have a Market Data Gateway ', done => {
    expect(kucoin).to.have.property('md');
    done();
  });

  it('should have an Order Entry Gateway ', done => {
    expect(kucoin).to.have.property('oe');
    done();
  });
});
