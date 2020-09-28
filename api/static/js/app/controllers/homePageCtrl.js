app.controller('homePageCtrl', function($scope, $http, $mdDialog,$mdSidenav, $state, $rootScope, $interval) {
    var liveImageInterval = null;
    var liveCamera = false;
    $scope.timerText = 'Start Live view';
    $scope.appText = "Start Application";
    $scope.Entry = "";
    $scope.waitingtime = "";




    function loadLiveImage() {
        $http.get('/getCount').then(function(response) {

            if (response.data != '') {

                $scope.timestamp = response.data.timestamp;
                $scope.timesplitted = $scope.timestamp.split(" ")
                console.log($scope.timesplitted, "times")

                $scope.finaltime = $scope.timesplitted[1] + " " + $scope.timesplitted[2] + " " + $scope.timesplitted[3]
                $scope.time = $scope.finaltime.toUpperCase();
                $scope.upCount = 5;
                // $scope.downCount = response.data.exit;
                $scope.downCount = response.data.capacity;
                $scope.fill = 50;
                $scope.minwaittime = response.data.min_wait_time;
                console.log($scope.minwaittime, "wait times")
                $scope.roomname = response.data.location_name.toUpperCase();

            }

        }, function(err) {
            console.log(err);
        });
    }

    $scope.toggleSidenav=function(){
        $mdSidenav('left').toggle();
    }

    $scope.isRoomOccupied = function() {
        // console.log()


        // let el = document.getElementById('wave');
        // el.className = "box water_wave_frontfilled";
        // el.className = "water_wave";

        // windowsize > 500 && windowsize < 600
        if ($scope.fill > 89 && $scope.fill < 100) {
            // console.log($scope.upCount)

            // svgElement.className.baseVal = "";
            // svgElement.style.left = 0;
            // svgElement.style[margin - bottom] = "-1px";
            // svgElement.style.animation = "wave-front 0.7s infinite linear;";

            $scope.Entry = "ENTER"
            $scope.waitingtime = "No Wait";
            return true

        } else if ($scope.fill <= 89) {
            $scope.Entry = "ENTER"
            $scope.waitingtime = "No Wait";
            return false

        } else {
            $scope.isRoomFullOccupied = function() {
                // console.log()

                // let el = document.getElementById('wave');
                // el.className = "box water_wave_frontfilled";
                // el.className = "water_wave";

                if ($scope.fill === 100) {
                    // console.log($scope.upCount)

                    // svgElement.className.baseVal = "";
                    // svgElement.style.left = 0;
                    // svgElement.style[margin - bottom] = "-1px";
                    // svgElement.style.animation = "wave-front 0.7s infinite linear;";

                    $scope.Entry = "WAIT"
                    $scope.waitingtime = $scope.minwaittime + " Minutes";
                    return true

                }
            }
        }
    }



    setInterval(function() {
        loadLiveImage()
    }, 200);

});

//-------------------------------------------------------------------------------------------------------