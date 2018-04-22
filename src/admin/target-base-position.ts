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

interface TargetBasePositionScope extends ng.IScope {
    targetBasePosition: number;
}

let TargetBasePositionController = ($scope: TargetBasePositionScope, $log: ng.ILogService, subscriberFactory: Shared.SubscriberFactory) => {

    let update = (value: Models.TargetBasePositionValue) => {
        if (value == null) return;
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

export let targetBasePositionDirective = 'targetBasePositionDirective';

angular
    .module(targetBasePositionDirective, ['sharedDirectives'])
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