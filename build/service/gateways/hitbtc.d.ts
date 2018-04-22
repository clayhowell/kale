/// <reference path="../utils.d.ts" />
/// <reference path="../../common/models.d.ts" />
/// <reference path="nullgw.d.ts" />
/// <reference path="../interfaces.d.ts" />
import Config = require('../config');
import Models = require('../../common/models');
import Interfaces = require('../interfaces');
export declare function createHitBtc(config: Config.IConfigProvider, pair: Models.CurrencyPair): Promise<Interfaces.CombinedGateway>;
