"use strict";
/// <reference path="../common/models.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="shared_directives.ts"/>
///<reference path="pair.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const angular = require("angular");
const Messaging = require("../common/messaging");
let TargetBasePositionController = ($scope, $log, subscriberFactory) => {
    let update = (value) => {
        if (value == null)
            return;
        $scope.targetBasePosition = value.data;
    };
    let subscriber = subscriberFactory.getSubscriber($scope, Messaging.Topics.TargetBasePosition)
        .registerConnectHandler(() => $scope.targetBasePosition = null)
        .registerSubscriber(update, us => us.forEach(update));
    $scope.$on('$destroy', () => {
        subscriber.disconnect();
        $log.info('destroy target base position');
    });
    $log.info('started target base position');
};
exports.targetBasePositionDirective = 'targetBasePositionDirective';
angular
    .module(exports.targetBasePositionDirective, ['sharedDirectives'])
    .directive('targetBasePosition', () => {
    let template = '<span>{{ targetBasePosition|number:2 }}</span>';
    return {
        restrict: 'E',
        replace: true,
        transclude: false,
        template: template,
        controller: TargetBasePositionController
    };
});
//# sourceMappingURL=target-base-position.js.map