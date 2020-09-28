app.controller('loginCtrl', ['$scope', '$rootScope', '$cookies', '$http', '$timeout', '$state', function($scope, $rootScope, $cookies, $http, $timeout, $state) {
    $scope.user = {};
    $scope.login_error = null;
    $scope.makingAjaxCall = false;

    $scope.login = function() {
        $scope.login_error = null;
        $scope.makingAjaxCall = true;
        $http.post('/login', $scope.user).then(function(response, headers) {
            /*var token = response.data.auth_token;
            $rootScope.auth_token = token;*/
            /*$cookies.put('auth_token', token);
            $cookies.putObject("user",response.data.name);*/
            $scope.makingAjaxCall = false;
            $rootScope.auth_token = $cookies.get("auth_token");
            /*$timeout(function(){
                $state.go('dashboard',{})
            },2000)*/

            window.location.href = "/homepage";
        }, function(err) {
            /*$scope.login_error = err.data.err;*/
            $rootScope.showToast(err.data.err, 'error-toast', 'top center')
            $scope.makingAjaxCall = false;
        })
    }
}])