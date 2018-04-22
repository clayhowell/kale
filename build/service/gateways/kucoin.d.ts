/// <reference path="../utils.d.ts" />
/// <reference path="../../common/models.d.ts" />
/// <reference path="nullgw.d.ts" />
/// <reference path="../config.d.ts" />
/// <reference path="../interfaces.d.ts" />
import Config = require('../config');
import Models = require('../../common/models');
import Utils = require('../utils');
import Interfaces = require('../interfaces');
export declare function createKucoin(timeProvider: Utils.ITimeProvider, config: Config.IConfigProvider, pair: Models.CurrencyPair): Promise<Interfaces.CombinedGateway>;
