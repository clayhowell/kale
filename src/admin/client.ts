/// <reference path="../common/models.ts" />
/// <reference path="orderlist.ts"/>
/// <reference path="trades.ts"/>
/// <reference path="../common/messaging.ts"/>
/// <reference path="shared_directives.ts"/>
/// <reference path="pair.ts"/>
/// <reference path="market-quoting.ts"/>
/// <reference path="market-trades.ts"/>
/// <reference path="position.ts"/>
/// <reference path="target-base-position.ts"/>
/// <reference path="trade-safety.ts"/>

(<any>global).jQuery = require('jquery');
import angular = require('angular');

let ui_bootstrap = require('angular-ui-bootstrap');
let ngGrid = require('../ui-grid.min');
let bootstrap = require('../bootstrap.min');

import Models = require('../common/models');
import moment = require('moment');
import OrderList = require('./orderlist');
import Trades = require('./trades');
import Messaging = require('../common/messaging');
import Shared = require('./shared_directives');
import Pair = require('./pair');
import MarketQuoting = require('./market-quoting');
import MarketTrades = require('./market-trades');
import Messages = require('./messages');
import Position = require('./position');
import Tbp = require('./target-base-position');
import TradeSafety = require('./trade-safety');

interface MainWindowScope extends ng.IScope {
    env: string;
    connected: boolean;
    order: DisplayOrder;
    pair: Pair.DisplayPair;
    exch_name: string;
    pair_name: string;
    cancelAllOrders();
}

class DisplayOrder {
    side: string;
    price: number;
    quantity: number;
    timeInForce: string;
    orderType: string;

    availableSides: string[];
    availableTifs: string[];
    availableOrderTypes: string[];

    private static getNames(enumObject: any) {
        let names: string[] = [];
        for (let mem in enumObject) {
            if (!enumObject.hasOwnProperty(mem)) continue;
            if (parseInt(mem, 10) >= 0) {
              names.push(enumObject[mem]);
            }
        }
        return names;
    }

    private _fire: Messaging.IFire<Models.OrderRequestFromUI>;
    constructor(fireFactory: Shared.FireFactory, private _log: ng.ILogService) {
        this.availableSides = DisplayOrder.getNames(Models.Side);
        this.availableTifs = DisplayOrder.getNames(Models.TimeInForce);
        this.availableOrderTypes = DisplayOrder.getNames(Models.OrderType);

        this._fire = fireFactory.getFire(Messaging.Topics.SubmitNewOrder);
    }

    public submit = () => {
        let msg = new Models.OrderRequestFromUI(this.side, this.price, this.quantity, this.timeInForce, this.orderType);
        this._log.info('submitting order', msg);
        this._fire.fire(msg);
    }
}

let uiCtrl = ($scope: MainWindowScope,
              $timeout: ng.ITimeoutService,
              $log: ng.ILogService,
              subscriberFactory: Shared.SubscriberFactory,
              fireFactory: Shared.FireFactory,
              product: Shared.ProductState) => {

    let cancelAllFirer = fireFactory.getFire(Messaging.Topics.CancelAllOrders);
    $scope.cancelAllOrders = () => cancelAllFirer.fire(new Models.CancelAllOrdersRequest());

    $scope.order = new DisplayOrder(fireFactory, $log);
    $scope.pair = null;

    let onAdvert = (pa: Models.ProductAdvertisement) => {
        $log.info('advert', pa);
        $scope.connected = true;
        $scope.env = pa.environment;
        $scope.pair_name = Models.Currency[pa.pair.base] + '/' + Models.Currency[pa.pair.quote];
        $scope.exch_name = Models.Exchange[pa.exchange];
        $scope.pair = new Pair.DisplayPair($scope, subscriberFactory, fireFactory);
        product.advert = pa;
        product.fixed = -1 * Math.floor(Math.log10(pa.minTick));
    };

    let reset = (reason: string, connected: boolean) => {
        $log.info('reset', reason);
        $scope.connected = connected;

        if (connected) {
            $scope.pair_name = null;
            $scope.exch_name = null;

            if ($scope.pair !== null)
                $scope.pair.dispose();
            $scope.pair = null;
        }
    };
    reset('startup', false);

    let sub = subscriberFactory.getSubscriber($scope, Messaging.Topics.ProductAdvertisement)
        .registerSubscriber(onAdvert, a => a.forEach(onAdvert))
        .registerConnectHandler(() => reset('connect', true))
        .registerDisconnectedHandler(() => reset('disconnect', false));

    $scope.$on('$destroy', () => {
        sub.disconnect();
        $log.info('destroy client');
    });

    $log.info('started client');
};

let requires = ['ui.bootstrap',
                'ui.grid',
                OrderList.orderListDirective,
                Trades.tradeListDirective,
                MarketQuoting.marketQuotingDirective,
                MarketTrades.marketTradeDirective,
                Messages.messagesDirective,
                Position.positionDirective,
                Tbp.targetBasePositionDirective,
                TradeSafety.tradeSafetyDirective,
                Shared.sharedDirectives];

angular.module('projectApp', requires)
       .controller('uiCtrl', uiCtrl);