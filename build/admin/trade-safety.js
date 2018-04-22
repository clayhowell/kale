"use strict";
/// <reference path="../common/models.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="shared_directives.ts"/>
///<reference path="pair.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const angular = require("angular");
const Messaging = require("../common/messaging");
let TradeSafetyController = ($scope, $log, subscriberFactory) => {
    let updateValue = (value) => {
        if (value == null)
            return;
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
exports.tradeSafetyDirective = 'tradeSafetyDirective';
angular
    .module(exports.tradeSafetyDirective, ['sharedDirectives'])
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
//# sourceMappingURL=trade-safety.js.map