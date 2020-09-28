var app = angular.module("CommissioningApp", ['ngResource', 'ngMaterial', 'ngCookies', 'ui.router', 'ngMessages']);
app.config(['$stateProvider', '$resourceProvider', '$locationProvider', function($stateProvider, $resourceProvider, $locationProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
    $locationProvider.html5Mode(true);
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    function checkLogin($rootScope, $state) {
        // console.log($rootScope.auth_token, "Rootscope ................")
        if (!$rootScope.auth_token) {
            // console.log("im inside////////////////")
            $state.go('login', {});
        }
    }

    $stateProvider.state('loginCtrl', {
            url: '/',
            templateUrl: 'partials/pages/login.html',
            controller: 'loginCtrl',
            resolve: {
                check: function($rootScope, $state) {
                    //$rootScope.logout();
                    if ($rootScope.auth_token) {
                        $state.go('homepage', {});
                    }
                }
            }
        })
        .state('homepage', {
            url: '/homepage',
            templateUrl: 'partials/pages/homepage.html',
            controller: 'homePageCtrl',
            resolve: {
                check: checkLogin
                    //no checking login page its directly getting opened// Wat to do??show
            }
            
        })
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: 'partials/pages/dashboard.html',
            controller: 'dashCtrl',
            resolve: {
                check: checkLogin
                    //no checking login page its directly getting opened// Wat to do??show
            }
        })
        .state('analytics', {
            url: '/analytics',
            templateUrl: 'partials/pages/analytics.html',
            controller: 'analyticsCtrl',
            resolve: {
                check: checkLogin
                    //no checking login page its directly getting opened// Wat to do??show
            }
        })
        .state('network', {
            url: '/network',
            templateUrl: 'partials/pages/dialogNetwork.html',
            controller: 'dashCtrl',
            resolve: {
                check: checkLogin
                    //no checking login page its directly getting opened// Wat to do??show
            }
        })
        .state('settingsdashboard', {
            url: '/settingsdashboard',
            templateUrl: 'partials/pages/settingsdashboard.html',
            controller: 'dashCtrl',
            resolve: {
                check: checkLogin
            }
        });
}]);
app.run(function($rootScope, $cookies, $state, $http, $mdSidenav, $mdToast) {
    $rootScope.showToast = function(message, theme, position) {
        if (!position)
            position = 'top left';
        $mdToast.show(
            $mdToast.simple()
            .textContent(message)
            .position(position)
            .parent('#toastContainer')
            .theme(theme)
            .hideDelay(3000)
        );
    }
    $rootScope.toggleLeft=function(){
        $mdSidenav('left').toggle();
    }
// app.run(function($mdSidenav,$mdDialog,$rootScope,$scope){
//     $rootScope.toggleLeft = buildToggler('left');

//     function buildToggler(componentId) {
//       return function() {
//         $mdSidenav(componentId).toggle();
 
//       };
//     }

// })


    $rootScope.logout = function() {
        $http.get('/logout').then(function(response) {
            $rootScope.auth_token = null;
            window.location.href = '/'
        }, function(err) {
            $rootScope.showToast(err.data.err, 'error-toast', 'top center')
        })
    }
    $rootScope.auth_token = $cookies.get("auth_token");
})
function buildToggler(componentId){
    return function(){
        $mdSidenav(componentId).toggle();
    }
}