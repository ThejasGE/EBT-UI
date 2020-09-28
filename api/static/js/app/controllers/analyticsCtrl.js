app.controller('analyticsCtrl', function($scope, $http, $window, $mdDialog, $state, $rootScope, $interval, $location) {




    $http.get('/getCount').then(function(response) {

        if (response.data != '') {

            // $scope.timestamp = response.data.timestamp;
            // $scope.timesplitted = $scope.timestamp.split(" ")
            // console.log($scope.timesplitted, "times")

            // $scope.finaltime = $scope.timesplitted[1] + " " + $scope.timesplitted[2] + " " + $scope.timesplitted[3]
            // $scope.time = $scope.finaltime.toUpperCase();
            // $scope.upCount = 0;
            // // $scope.downCount = response.data.exit;
            // $scope.downCount = response.data.capacity;
            // $scope.fill = 100;
            // $scope.minwaittime = response.data.min_wait_time;
            // console.log($scope.minwaittime, "wait times")
            $scope.roomname = response.data.location_name.toUpperCase();

        }

    }, function(err) {
        console.log(err);
    });


    $http.get('/getAnalyticsData').then(function(response) {
        console.log(response.data);

        //console.log(response.data.upCount);
        if (response.data != '') {
            // $scope.data.record;
            // $scope.data.video.record = $scope.recordselectedValue;

            $scope.data = response.data;
            $scope.PercentageData = response.data.hourlyPattern.PercentageData;
            $scope.TimeData = response.data.hourlyPattern.TimeData;
            console.log($scope.PercentageData)
            console.log($scope.TimeData)
            console.log($scope.roomname)
        }
        Highcharts.chart('container1', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Hourly Pattern'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: $scope.TimeData,
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                }
            },
            yAxis: {
                min: 0,
                max: 100,

                labels: {
                    format: '{value}%'
                },
                title: {
                    enabled: false
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:,.0f:.1f}%',
                split: true
            },
            plotOptions: {
                area: {
                    stacking: 'percent',
                    lineColor: '#ffffff',
                    lineWidth: 0.5,
                    marker: {
                        lineWidth: 0.5,
                        lineColor: '#ffffff'
                    },
                    accessibility: {
                        pointDescriptionFormatter: function(point) {
                            function round(x) {
                                return Math.round(x * 100) / 100;
                            }
                            return (point.index + 1) + ', ' + point.category + ', ' +
                                point.y + round(point.percentage) + '%, ' +
                                point.series.name;
                        }
                    }
                }
            },
            series: [{
                name: $scope.roomname,
                data: $scope.PercentageData
            }]
        });

    }, function(err) {
        console.log(err);
    });
    // $scope.total = function() {



    // };

    // $scope.total();

});

//-------------------------------------------------------------------------------------------------------