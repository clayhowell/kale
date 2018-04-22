/// <reference path="../common/models.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="shared_directives.ts"/>
///<reference path="pair.ts"/>

import angular = require('angular');
import Models = require('../common/models');
import io = require('socket.io-client');
import moment = require('moment');
import Messaging = require('../common/messaging');
import Pair = require('./pair');
import Shared = require('./shared_directives');

interface TradeSafetyScope extends ng.IScope {
    buySafety: number;
    sellSafety: number;
    tradeSafetyValue: number;
}

let TradeSafetyController = ($scope: TradeSafetyScope, $log: ng.ILogService, subscriberFactory: Shared.SubscriberFactory) => {

    let updateValue = (value: Models.TradeSafety) => {
        if (value == null) return;
        $scope.tradeSafetyValue = value.combined;
        $scope.buySafety = value.buy;
        $scope.sellSafety = value.sell;
    };

    let clear = () => {
        $scope.tradeSafetyValue = null;
        $scope.buySafety = null;
        $scope.sellSafety = null;
    };

    let subscriber = subscriberFactory.getSubscriber($scope, Messaging.Topics.TradeSafetyValue)
        .registerConnectHandler(clear)
        .registerSubscriber(updateValue, us => us.forEach(updateValue));

    $scope.$on('$destroy', () => {
        subscriber.disconnect();
        $log.info('destroy trade safety');
    });

    $log.info('started trade safety');
};

export let tradeSafetyDirective = 'tradeSafetyDirective';

angular
    .module(tradeSafetyDirective, ['sharedDirectives'])
    .directive('tradeSafety', () => {
        let template = '<span>BuyTS: {{ buySafety|number:2 }}, SellTS: {{ sellSafety|number:2 }}, TotalTS: {{ tradeSafetyValue|number:2 }}</span>';

        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            template: template,
            controller: TradeSafetyController
        };
    });