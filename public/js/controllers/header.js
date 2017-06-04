angular.module('mean.system')
.controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
    console.log('Im here');
    $scope.menu = [{
        "title": "Articles",
        "link": "articles"
    }, {
        "title": "Create New Article",
        "link": "articles/create"
    }];
}]);