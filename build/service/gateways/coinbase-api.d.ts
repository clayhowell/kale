/// <reference path="../utils.d.ts" />
/// <reference path="../../common/models.d.ts" />
import Utils = require('../utils');
export declare let PublicClient: (apiURI?: string) => void;
export declare let AuthenticatedClient: (key: string, b64secret: string, passphrase: string, apiURI?: string) => void;
export declare let OrderBook: (productID: string, websocketURI: string, restURI: string, timeProvider: Utils.ITimeProvider) => void;
