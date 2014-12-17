(function() {
    'use strict';

    /* @ngInject */
    angular
        .module('mappifyApp', ['mappify','ngRoute','examples'])
        .config(routeConfig)
        .config(logConfig)
        .controller('MainCtrl', MainCtrl);

    /* @ngInject */
    function MainCtrl($scope, $location) {
        $scope.menuClass = function (page) {
            return $location.path() === page ? 'active' : '';
        };
    }

     /* @ngInject */
    function routeConfig ($routeProvider) {
        // Define fallback route
        $routeProvider
            .when('/', {
                templateUrl: 'template/home.tpl.html'
            })
            .otherwise({redirectTo:'/'});
    }

    function logConfig($logProvider){
        $logProvider.debugEnabled(true);
    }

})();



