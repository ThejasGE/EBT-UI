app.controller('dashCtrl',function($scope,$http,$mdDialog,$state,$rootScope,$interval){
    // $scope.cameraImage = ''
    $http.get('/getCameraData').then(function(response){
        $scope.cameraImage = response.data
        //console.log($scope.cameraImage);
    }, function(err){
        $rootScope.showToast(err, 'error-toast', 'top-center')
    })

    // $scope.cameraImage = "/home/pi/Arraystorm/pcImg/pcamera.jpg";
    $http.get('/getPcsConfig').then(function(response){
        $scope.pcsConfig = response.data;
    }, function(err){
        $rootScope.showToast(err, 'error-toast', 'top-center')
    })

    $scope.writeData = function(){
       $http.post('/setPcsConfig',{pcsConfig:$scope.pcsConfig}).then(function(response){
       		$rootScope.showToast(response.data.msg, 'success-toast', 'top center');
       		console.log($scope.pcsConfig);
       }, function(err){
	        console.log(err);
	   })
    }
});

//-------------------------------------------------------------------------------------------------------





