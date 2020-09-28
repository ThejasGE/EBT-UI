app.controller('dashCtrl',function($scope, $http, $window, $mdDialog,$mdSidenav, $state, $rootScope, $interval, $location) {
    $scope.selectedParameter = "horlinePoints";
    

    

    $scope.issettings2page = function() {
        var url = $location.path()
        console.log(url, "location...........")
        if (url == "/settingsdashboard") {
            return true
        } else {
            return false
        }
    }
    $scope.addNetwork=function(){
        // $scope.makingAjaxCall=true
        // var url = $location.path()
        // console.log(url, "location...........")
        // if (url == "/dialogNetwork") {
        //     return true
        // } else {
        //     return false
        // }
        // $scope.network_details={};
        // $mdDialog.show({
        //     controller:settingDashCtrl,
        //     templateUrl:'web/partials/pages/dialogNetwork.html',
        //     clickOutsideToClose:true,
        //     parent: angular.element(document.body),
        //     scope:$scope,
        //     preserveScope:true
        // }).then(function(){
        //     $scope.blur_content=false;

        // },function(){
        //     $scope.blur_content=false;
        // });
        window.location.href="/network"

    }

    $http.get('/getJsonData').then(function(response) {
        //console.log(response);
        //console.log(response.data.upCount);
        if (response.data != '') {
            // $scope.data.record;
            // $scope.data.video.record = $scope.recordselectedValue;

            $scope.data = response.data;
            $scope.locationName = response.data.location.location_name;
            $scope.capacity = response.data.location.capacity;
            $scope.linePoints = response.data.counter.line_points;
            $scope.recordselectedValue = $scope.data.video.record;
            $scope.testselectedValue = $scope.data.video.test;
            $scope.displayselectedValue = $scope.data.video.display;
            $scope.wifiselectedValue = $scope.data.db.wifi;
            $scope.resetselectedValue=$scope.data.db.reset
            $scope.cloudselectedValue = $scope.data.db.cloud;
            $scope.gatewayselectedValue = $scope.data.db.gateway;
            $scope.displayselectedValue=$scope.data.video.display
            console.log($scope.testselectedValue, "test value from get.........")
        }

    }, function(err) {
        console.log(err);
    });


    $scope.issettingsbackpage = function() {
            var url = $location.path()
            console.log(url, "location...........")
            if (url == "/dashboard") {
                return true
            } else {
                return false
            }
        }
        // Canvas variables

    var canvas = document.getElementById("mcanvas");
    var context = canvas ? canvas.getContext("2d") : {};

    var cw = 645;
    var ch = 485;
    var defaultnames = ["Q0", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11"];
    var img = new Image();
    img.src = "css/bt-delete.png";
    $scope.areasArray = {};
    isPush = true;
    isDeleted = false;

    var liveImageInterval = null;
    var liveCamera = false;
    $scope.liveStatus = false;
    $scope.markimage = false;
    $scope.editMark = true;
    $scope.checkfirstclick = true;

    // Canvas drawing code Start

    function resize() {
        // Our canvas must cover full height of screen
        // regardless of the resolution
        var height = 485;

        // So we need to calculate the proper scaled width
        // that should work well with every resolution
        var ratio = canvas.width / canvas.height;
        var width = height * ratio;

        canvas.style.width = width + 'px';
        // canvas.style.height = height + 'px';
    }

    // window.addEventListener('load', reOffset, false);
    //  window.addEventListener('resize', reOffset, false);

    function reOffset(evt) {

        var BB = canvas.getBoundingClientRect();

        offsetX = (evt.clientX - BB.left) / (BB.right - BB.left) * canvas.width;
        offsetY = (evt.clientY - BB.top) / (BB.bottom - BB.top) * canvas.height;

    }
    var offsetX, offsetY;

    window.onscroll = function(e) {
        reOffset(e);
    };

    context.lineWidth = 2;
    context.strokeStyle = 'red';

    var coordinates = [];
    var isDone = false;

    $scope.addNewBlock = function() {
        coordinates = [];
        isDone = false;
    };


    $("#canvas").mousedown(function(e) {
        if ($scope.markimage) {
            canvas = document.getElementById("canvas");
            context = canvas.getContext("2d");
            handleMouseDown(e);
        }

    });

    $("#mcanvas").mousedown(function(e) {

        if (!$scope.markimage && document.getElementById("mcanvas")) {
            canvas = document.getElementById("mcanvas");
            context = canvas.getContext("2d");
            coordinates = [];
            handleMouseDown(e);
        }

    });

    function handleMouseDown(e) {
        isPush = true;
        reOffset(e);
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mouseX = parseInt(offsetX);
        mouseY = parseInt(offsetY);
        if ($scope.markimage) {

            var namelist = Object.keys($scope.areasArray);
            Object.keys($scope.areasArray).forEach(function(key) {

                if (mouseX >= $scope.areasArray[key].delete_coordinates.x1 && mouseX <= $scope.areasArray[key].delete_coordinates.x2 &&
                    mouseY >= $scope.areasArray[key].delete_coordinates.y1 && mouseY <= $scope.areasArray[key].delete_coordinates.y4) {
                    delete $scope.areasArray[key]
                    isPush = false;
                    isDone = false;
                    isDeleted = true;

                }

            })
            if (isDeleted) {

                var namelist = Object.keys($scope.areasArray);
                var namelist_to_rename = [];
                for (var i = 0; i < namelist.length; i++) {
                    namelist_to_rename.push(defaultnames[i]);

                }

                Object.keys($scope.areasArray).forEach(function(key) {
                    for (var i = 0; i < namelist_to_rename.length; i++) {
                        $scope.areasArray[namelist_to_rename[i]] = $scope.areasArray[key];

                        if (namelist_to_rename[i] != key) {
                            delete $scope.areasArray[key];
                        }
                        namelist_to_rename.splice(i, 1);
                        break;
                    }
                })
                isDeleted = false;


            }
            if (isDone) {
                alert("Only 12 segments are allowed.");
                return

            } else if (isPush) {
                var obj = {};
                obj["S" + coordinates.length] = {
                    x: mouseX,
                    y: mouseY
                }
                coordinates.push(obj);
            }
        }
        drawPolygon();

    }

    function drawPolygon() {

        context.clearRect(0, 0, cw, ch);

        if (coordinates.length == 4) {
            context.drawImage(img, coordinates[0]['S0'].x, coordinates[0]['S0'].y, 15, 15);
            var namelist = Object.keys($scope.areasArray);
            var Qname = validatename(namelist, defaultnames);
            context.font = "15px Arial";
            context.fillStyle = "white";
            context.fillText(Qname, coordinates[0]['S0'].x + 20, coordinates[0]['S0'].y + 20);
            $scope.areasArray[Qname] = {
                "S0": coordinates[0]['S0'],
                "S1": coordinates[1]['S1'],
                "S2": coordinates[2]['S2'],
                "S3": coordinates[3]['S3']
            };
            coordinates = [];
        } else if (coordinates.length > 0) {
            context.strokeStyle = 'red';
            context.beginPath();
            context.moveTo(coordinates[0]['S0'].x, coordinates[0]['S0'].y);
            if (coordinates.length == 1) {
                context.fillStyle = "red";
                context.arc(coordinates[0]['S0'].x, coordinates[0]['S0'].y, 3, Math.PI * 2, true);
                context.fill();
            }
            for (index = 1; index < coordinates.length; index++) {

                context.lineTo(coordinates[index]['S' + index].x, coordinates[index]['S' + index].y);
            }

            context.closePath();
            context.stroke();
        }

        Object.keys($scope.areasArray).forEach(function(key) {

            context.beginPath();
            $scope.areasArray[key]['delete_coordinates'] = {
                x1: $scope.areasArray[key]['S0'].x,
                y1: $scope.areasArray[key]['S0'].y,
                x2: $scope.areasArray[key]['S0'].x + 15,
                y2: $scope.areasArray[key]['S0'].y,
                x3: $scope.areasArray[key]['S0'].x,
                y3: $scope.areasArray[key]['S0'].y + 15,
                x4: $scope.areasArray[key]['S0'] + 15,
                y4: $scope.areasArray[key]['S0'].y + 15
            }
            context.moveTo($scope.areasArray[key]['S0'].x, $scope.areasArray[key]['S0'].y);

            context.font = "15px Arial";
            context.fillStyle = "white";

            switch (key) {
                case "Q0":
                    context.strokeStyle = 'violet';
                    break;
                case "Q1":
                    context.strokeStyle = 'indigo';
                    break;
                case "Q2":
                    context.strokeStyle = 'blue';
                    break;
                case "Q3":
                    context.strokeStyle = 'green';
                    break;
                case "Q4":
                    context.strokeStyle = 'yellow';
                    break;
                case "Q5":
                    context.strokeStyle = 'orange';
                    break;
                case "Q6":
                    context.strokeStyle = 'olive';
                    break;
                case "Q7":
                    context.strokeStyle = 'brown';
                    break;
                case "Q8":
                    context.strokeStyle = 'black';
                    break;
                case "Q9":
                    context.strokeStyle = 'pink';
                    break;
                case "Q10":
                    context.strokeStyle = 'purple';
                    break;
                case "Q11":
                    context.strokeStyle = 'aqua';
                    break;
                default:
                    context.strokeStyle = 'red';
                    break;
            }

            for (index = 1; index < 4; index++) {
                context.lineTo($scope.areasArray[key]['S' + index].x, $scope.areasArray[key]['S' + index].y);

            }
            context.fillText(key, $scope.areasArray[key]['S0'].x + 20, $scope.areasArray[key]['S0'].y + 20);
            context.drawImage(img, $scope.areasArray[key]['S0'].x, $scope.areasArray[key]['S0'].y, 15, 15);
            context.closePath();
            context.stroke();
        });

        if (Object.keys($scope.areasArray).length >= 12) {
            isDone = true;
            return
        }
    }


    // Canvas drawing code end


    $scope.gotofirmware = function() {
        $state.go('firmware-managment');
    }

    $scope.pageTitle = "PCS Commissioning.V4";

    $http.get('/getBleAddress').then(function(response) {
        console.log(response)
        $scope.bleAddress = response.data.address;
    }, function(err) {
        console.log(err);
    });
    $scope.currentPage = 1;

    $http.get('/getSDcardSerialNumber').then(function(response){
        // console.log(response)
        $scope.sdcardserial=response.data.address;
    },function(err){
        console.log(err)
    })
    // $scope.searchNetwork=function(){
        // $scope.makingAjaxCall=true;
        // $scope.networks=[];
    
        $http.get('/getScanNetwork').then(function(response){
            // console.log(response)
            $scope.networks;
            $scope.networks=response.Essid
            // networks1.substring(5);
            // $scope.networks=JSON.parse(networks)
            console.log($scope.networks)

            // networks1=$scope.networks1
            // networks1.substring(5);
            // $scope.networks=networks1.split(" ")
            // console.log($scope.networks)
            // if($scope.networks)
        }, function(err) {
            console.log(err);
        });

        $scope.searchNetwork=function(){
        $scope.makingAjaxCall=true;
        $scope.networks=[];
    
        $http.get('/getScanNetwork').then(function(response){
            $scope.makingAjaxCall = false;
            // console.log(response)
            // $scope.networks;
            $scope.networks=response.data.Essid
            // networks1.substring(5);
            // $scope.networks=JSON.parse(networks)
            console.log($scope.networks)

            // console.log($scope.networks)
            // if($scope.networks)
        }, function(err) {
            console.log(err);
        })
    }
    
$scope.networkConnect=function(){
    
    // $scope.login_error = null;
    // $scope.makingAjaxCall = false;
    // $scope.login_error = null;
        $scope.makingAjaxCall = true;
        $http.post('/putScanNetwork', $scope.wifi).then(function(response) {
            $scope.makingAjaxCall = false;
            // $rootScope.userName = $scope.username;
            // $scope.error = '';
            $scope.username = response.username;
            $scope.password = response.password;
            // $state.transitionTo('home');
            window.location.href = "/settingsdashboard";
            if(response){
                $rootScope.showToast("Wifi Connected Successfully", 'success-toast', 'top center');
            } 
        
            

},function(err) {
    /*$scope.login_error = err.data.err;*/
    $rootScope.showToast("Wifi not Connected", 'error-toast', 'top center')
    $scope.makingAjaxCall = false;
})
}
    function getImageList() {
        $http.get('/getImageList/' + $scope.currentPage).then(function(response) {
            $scope.imageList = response.data.imageList;
            $scope.pages = response.data.totalPages;
            if ($scope.pages == 0)
                $scope.currentPage = 0;
        }, function(err) {
            console.log(err);
        });
    };
    getImageList();
    $http.get('/getHostAddress').then(function(response) {
        $scope.hostAddress = response.data.address;
    }, function(err) {
        console.log(err);
    });
    $http.get('/getSensorName').then(function(response) {
        $scope.sensorName = response.data.address;
    }, function(err) {
        console.log(err);
    });
    
    $http.get('/getImageCount').then(function(response) {
        $scope.imageCount = parseInt(response.data.imageCount);
    }, function(err) {
        console.log(err);
    });
    $scope.previousImageList = function() {
        $scope.currentPage--;
        getImageList();
    }
    $scope.nextImageList = function() {
        $scope.currentPage++;
        getImageList();
    }
    var url = ''

    function Whitecanvas() {

        $("#mcanvas").css("background", "url('" + url.replace(/(\r\n|\n|\r)/gm, "") + "')  no-repeat");
        $("#mcanvas").css("background-size", "cover");
    }

    function loadLiveImage() {
        $http.get('/getLiveCameraData').then(function(response) {
            console.log(response);
            if (response.data.imageData != '') {
                $scope.liveCameraImage = response.data.imageData;
                // url = "data:image;base64,"+$scope.liveCameraImage.replace(/(\r\n|\n|\r)/gm, "");
                url = "data:image/png;base64," + $scope.liveCameraImage.replace(/(\r\n|\n|\r)/gm, "");
                Whitecanvas();
            }

        }, function(err) {
            console.log(err);
        });


    }
    loadLiveImage();
    
    function loadVideoSample() {
        $http.get('/getCameraData').then(function(response) {
            console.log(response);
            if (response.data.image != '') {
                $scope.liveCameraImage = response.data.image;
                // url = "data:image;base64,"+$scope.liveCameraImage.replace(/(\r\n|\n|\r)/gm, "");
                url = "data:image/png;base64," + $scope.liveCameraImage.replace(/(\r\n|\n|\r)/gm, "");
                Whitecanvas();
            }

        }, function(err) {
            console.log(err);
        });


    }
    loadVideoSample();

    function liveViewStatus() {
        $http.get('/liveAppStatus').then(function(response) {
            console.log(response);
            liveCamera = response.data.status;
            $scope.liveStatus = response.data.status;
            if ($scope.liveStatus) {
                $http.get("/stopLiveCamera").then(function(response) {
                    $scope.liveStatus = !$scope.liveStatus;
                    $interval.cancel(liveImageInterval);
                }, function(err) {});
            }
            // $scope.timerText = liveCamera ? 'Stop Live view' : 'Start Live view';
        }, function(err) {
            console.log(err);
        });
    }
    liveViewStatus();

    $scope.writeData = function() {
        $http.post('/setPcsConfig', {
            pcsConfig: $scope.pcsConfig
        }).then(function(response) {
            if (response) {
                $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
            }
            console.log($scope.pcsConfig);
        }, function(err) {
            console.log(err);
        });
    };


    function validatename(namelist, dnames) {
        var name;
        // console.log(namelist)
        for (var i = 0; i < dnames.length; i++) {

            if (namelist.indexOf(dnames[i]) === -1) {
                name = dnames[i];
                break;
            }
        }

        return name;
    }
    
    // $scope.toggleLeft = buildToggler('left');

    // function buildToggler(componentId) {
    //   return function() {
    //     $mdSidenav(componentId).toggle();
    //   }
    // }
    $scope.toggleSidenav=function(){
        $mdSidenav('left').toggle();
    }
    $scope.closeDialog = function() {
        $scope.area = {};
        $mdDialog.hide();
        $scope.editMark = true;
    }

    $scope.saveToJSON = function() {

        $http.post("/saveConfiguration", {
            configuration: $scope.areasArray,
            roomName: "dddd"
        }).then(function(response) {

            $rootScope.showToast(response.data.msg, 'success-toast', 'top-center');
            $scope.markimage = false;
            $scope.areasArray = {};
            $scope.liveStatus = !$scope.liveStatus;
            $http.get('/getConfiguration/' + "dddd").then(function(response) {

                $scope.areasArray = response.data.configuration;
                canvas = document.getElementById("mcanvas");
                context = canvas.getContext("2d");
                drawPolygon()
            }, function(err) {
                console.log(err);
            });
        }, function(err) {
            console.log(err);
            $rootScope.showToast(err.data.err, 'error-toast', 'top center');
        });

    };


    $scope.videoSample = function() {

        if ($scope.liveStatus) {
            $scope.markimage = true;
            $http.get("/stopLiveCamera").then(function(response) {

                $rootScope.showToast(response.data.msg, 'success-toast', 'top-center');
                $scope.liveStatus = !$scope.liveStatus;
                $interval.cancel(liveImageInterval);
                $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });

            $("#canvas").css("background", "url('" + url.replace(/(\r\n|\n|\r)/gm, "") + "')  no-repeat");
            $("#canvas").css("background-size", "cover");

            $http.get('/getConfiguration/' + "dddd").then(function(response) {

                $scope.areasArray = response.data.configuration;
                canvas = document.getElementById("canvas");
                context = canvas.getContext("2d");
                drawPolygon()

            }, function(err) {
                console.log(err);
            });

        } else {
            $scope.markimage = false;
            $scope.areasArray = {};
            $scope.liveStatus = !$scope.liveStatus;
            liveImageInterval = $interval(loadVideoSample, 250);

            $http.get("/getCameraData").then(function(response) {
                $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });

            $http.get('/getConfiguration/' + "dddd").then(function(response) {

                $scope.areasArray = response.data.configuration;
                canvas = document.getElementById("mcanvas");
                context = canvas.getContext("2d");
                drawPolygon()

            }, function(err) {
                console.log(err);
            });

        }
    };

    

    $scope.startStopLiveView = function() {

        if ($scope.liveStatus) {
            $scope.markimage = true;
            $http.get("/stopLiveCamera").then(function(response) {

                $rootScope.showToast(response.data.msg, 'success-toast', 'top-center');
                $scope.liveStatus = !$scope.liveStatus;
                $interval.cancel(liveImageInterval);
                $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });

            $("#canvas").css("background", "url('" + url.replace(/(\r\n|\n|\r)/gm, "") + "')  no-repeat");
            $("#canvas").css("background-size", "cover");

            $http.get('/getConfiguration/' + "dddd").then(function(response) {

                $scope.areasArray = response.data.configuration;
                canvas = document.getElementById("canvas");
                context = canvas.getContext("2d");
                drawPolygon()

            }, function(err) {
                console.log(err);
            });

        } else {
            $scope.markimage = false;
            $scope.areasArray = {};
            $scope.liveStatus = !$scope.liveStatus;
            liveImageInterval = $interval(loadLiveImage, 250);

            $http.get("/startLiveCamera").then(function(response) {
                $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });

            $http.get('/getConfiguration/' + "dddd").then(function(response) {

                $scope.areasArray = response.data.configuration;
                canvas = document.getElementById("mcanvas");
                context = canvas.getContext("2d");
                drawPolygon()

            }, function(err) {
                console.log(err);
            });

        }
    };

    $scope.reload = function() {
        window.location.reload();
    }

    // $scope.recordselectedValue = 'true';
    $scope.changeRecordValue = function() {
        $scope.data.video.record
        if ($scope.data.video.record == "true" || "false") {
            $http.post('/putIndividualData', {
                record: $scope.recordselectedValue
            }).then(function(response) {
                if ($scope.recordselectedValue == false) {
                    // console.log($scope.recordselectedValue, "in false block...........")
                    $rootScope.showToast("Turned Off Successfully", 'success-toast', 'top center');
                } else if ($scope.recordselectedValue == true) {
                    // console.log($scope.recordselectedValue, "in true block...........")
                    $rootScope.showToast("Turned On Successfully", 'success-toast', 'top center');
                }
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
        // console.log($scope.selectedValue, "value done")

    }
    $scope.changeTestValue = function() {
        $scope.data.video.test
        $scope.data.video.display
        if ($scope.data.video.test == "true" || "false") {
            $http.post('/putIndividualData', {
                display: $scope.testselectedValue,
                test: $scope.testselectedValue
            }).then(function(response) {

                if ($scope.testselectedValue == false) {
                    
                    
                    // console.log($scope.testselectedValue, "in false block...........")
                    // console.log($scope.displayselectedValue, "in false block...........")

                    $rootScope.showToast("Turned Off Successfully", 'success-toast', 'top center');
                } else if ($scope.testselectedValue == true) {
                    
                       
                    
                    

                    // console.log($scope.testselectedValue, "in true block...........")
                    $rootScope.showToast("Turned On Successfully", 'success-toast', 'top center');
                }

            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
        // console.log($scope.selectedValue, "value done")

    }
    $scope.changeWifiValue = function() {
        $scope.data.db.wifi
        if ($scope.data.db.wifi == "true" || "false") {
            $http.post('/putIndividualData', {
                wifi: $scope.wifiselectedValue
            }).then(function(response) {
                if ($scope.wifiselectedValue == false) {
                    console.log($scope.wifiselectedValue, "in false block...........")
                    $rootScope.showToast("Turned Off Successfully", 'success-toast', 'top center');
                } else if ($scope.wifiselectedValue == true) {
                    console.log($scope.wifiselectedValue, "in true block...........")
                    $rootScope.showToast("Turned On Successfully", 'success-toast', 'top center');
                }
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
        // console.log($scope.selectedValue, "value done")

    }

    $scope.changeCloudValue = function() {
        $scope.data.db.cloud
        if ($scope.data.db.cloud == "true" || "false") {
            $http.post('/putIndividualData', {
                cloud: $scope.cloudselectedValue
            }).then(function(response) {
                if ($scope.cloudselectedValue == false) {
                    console.log($scope.cloudselectedValue, "in false block...........")
                    $rootScope.showToast("Turned Off Successfully", 'success-toast', 'top center');
                } else if ($scope.cloudselectedValue == true) {
                    console.log($scope.cloudselectedValue, "in true block...........")
                    $rootScope.showToast("Turned On Successfully", 'success-toast', 'top center');
                }
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
        // console.log($scope.selectedValue, "value done")

    }

    $scope.changeGatewayValue = function() {
        $scope.data.db.gateway
        if ($scope.data.db.gateway == "true" || "false") {
            $http.post('/putIndividualData', {
                gateway: $scope.gatewayselectedValue
            }).then(function(response) {
                if ($scope.gatewaytselectedValue == false) {
                    console.log($scope.gatewayselectedValue, "in false block...........")
                    $rootScope.showToast("Turned Off Successfully", 'success-toast', 'top center');
                } else if ($scope.gatewayselectedValue == true) {
                    console.log($scope.gatewayselectedValue, "in true block...........")
                    $rootScope.showToast("Turned On Successfully", 'success-toast', 'top center');
                }
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
        // console.log($scope.selectedValue, "value done")

    }
    $scope.changeResetValue = function() {
        $scope.data.db.reset
        if ($scope.data.db.reset == "true" || "false") {
            $http.post('/putIndividualData', {
                reset: $scope.resetselectedValue
            }).then(function(response) {
                if ($scope.resetselectedValue == false) {
                    console.log($scope.resetselectedValue, "in false block...........")
                    $rootScope.showToast("Turned Off Successfully", 'success-toast', 'top center');
                } else if ($scope.resetselectedValue == true) {
                    console.log($scope.resetselectedValue, "in true block...........")
                    $rootScope.showToast("Turned On Successfully", 'success-toast', 'top center');
                }
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
        // console.log($scope.selectedValue, "value done")

    }
    $scope.updateLocationName = function() {
        if ($scope.locationName) {
            $http.post('/putIndividualData', {
                location_name: $scope.locationName
            }).then(function(response) {
                $rootScope.showToast("Location Name Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }
    $scope.updateCapacity = function() {
        
        if (Number($scope.capacity))  {
            $http.post('/putIndividualData', {
                capacity: parseInt($scope.capacity)
            }).then(function(response) {
                $rootScope.showToast("Capacity Number Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Capacity Number", 'error-toast', 'top center');
        }
    }
    $scope.updateHorLinePoints = function() {
        $scope.linePoints="0.0,0.5,1.0,0.5"
        if ($scope.linePoints) {
            console.log($scope.linePoints)
            var temp=$scope.linePoints.split(",").map(x=>Number(x))
            var result=new Array();
            for(var i=0;i<temp.length;i=i+2){
                result.push([temp[i],temp[i+1]])
            }
            console.log(result)

            $http.post('/putIndividualData', {
                line_points:result
            
            }).then(function(response) {
                $rootScope.showToast("Horizontal Line points updated successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Horizontal line points", 'error-toast', 'top center');
        }
    }
    $scope.updateVerLinePoints = function() {
        $scope.linePoints="0.5,0.0,0.5,1.0"
        if ($scope.linePoints){
            console.log($scope.linePoints)
            var temp1=$scope.linePoints.split(",").map(x=>Number(x))
            var result1=new Array();
            for(var i=0;i<temp1.length;i=i+2){
                result1.push([temp1[i],temp1[i+1]])
            }
            console.log(result1)

            $http.post('/putIndividualData', {
                line_points:result1
            
            }).then(function(response) {
                $rootScope.showToast("Vertical Line points updated successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Vertical line points", 'error-toast', 'top center');
        }
    }
    $scope.updateEntranceData = function() {
        if ($scope.data.counter.entrance) {
            $http.post('/putIndividualData', {
                entrance: $scope.data.counter.entrance
            }).then(function(response) {
                $rootScope.showToast("Entrance Data updated successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid entrance", 'error-toast', 'top center');
        }
    }
    $scope.updateMinutesInactive = function() {
        if (Number($scope.data.counter.minutes_inactive)) {
            $http.post('/putIndividualData', {
                minutes_inactive: parseInt($scope.data.counter.minutes_inactive)
            }).then(function(response) {
                $rootScope.showToast("Inactive Minutes updated successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Inactive Minutes", 'error-toast', 'top center');
        }
    }

    $scope.updatePercentCapData = function() {
        if ($scope.data.counter.percent_cap) {
            $http.post('/putIndividualData', {
                
                percent_cap: parseFloat($scope.data.counter.percent_cap)
                
            }).then(function(response) {
                $rootScope.showToast("Percentage Cap updated successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Percentage Cap", 'error-toast', 'top center');
        }
    }
    $scope.updateMinWaitTime = function() {
        if (Number($scope.data.counter.min_wait_time)){
            $http.post('/putIndividualData', {
                min_wait_time:parseInt($scope.data.counter.min_wait_time)
            }).then(function(response) {
                // console.log(min_wait_time, "updated")
                $rootScope.showToast("Minimum Wait Time updated successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Minimum Time", 'error-toast', 'top center');
        }
    }
    $scope.updateMaxWaitTime = function() {
        if (Number($scope.data.counter.max_wait_time)) {
            $http.post('/putIndividualData', {
                max_wait_time:parseInt( $scope.data.counter.max_wait_time)
            }).then(function(response) {
                // console.log(max_wait_time, "updated")
                $rootScope.showToast("Maximum Wait Time updated successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Maximum Time", 'error-toast', 'top center');
        }
    }

    $scope.updateMinConfedence = function() {
        if (Number($scope.data.detection.min_conf) ){
            $http.post('/putIndividualData', {
                min_conf: $scope.data.detection.min_conf
            }).then(function(response) {
                $rootScope.showToast("Minimum Confedence Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }

    $scope.updateMaxBoxes = function() {
        if (Number($scope.data.detection.max_boxes) ){
            $http.post('/putIndividualData', {
                max_boxes: $scope.data.detection.max_boxes
            }).then(function(response) {
                $rootScope.showToast("Maximum Boxes Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }

    $scope.updateMaxDays = function() {
        if (Number($scope.data.db.max_days) ){
            $http.post('/putIndividualData', {
                max_days: $scope.data.db.max_days
            }).then(function(response) {
                $rootScope.showToast("Max Days Value Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }

    $scope.updateFrequency = function() {
        if (Number($scope.data.motion.frequency) ){
            $http.post('/putIndividualData', {
                frequency: $scope.data.motion.frequency
            }).then(function(response) {
                $rootScope.showToast("Frequency Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }

    $scope.updateMaxDistance = function() {
        if (number($scope.data.tracking.max_distance)) {
            $http.post('/putIndividualData', {
                max_distance: $scope.data.tracking.max_distance
            }).then(function(response) {
                $rootScope.showToast("Max Distance Value Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }

    $scope.updateMaxDissappeared = function() {
        if (Number($scope.data.tracking.max_disappeared)) {
            $http.post('/putIndividualData', {
                max_disappeared: $scope.data.tracking.max_disappeared
            }).then(function(response) {
                $rootScope.showToast("Max Disappreared Value Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }

    $scope.updateBufferFrames = function() {
        if (Number($scope.data.tracking.buffer_frames) ){
            $http.post('/putIndividualData', {
                buffer_frames: $scope.data.tracking.buffer_frames
            }).then(function(response) {
                $rootScope.showToast("Buffer Frames Value Updated Successfully", 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }


    $scope.updateSensorName = function() {
        if ($scope.sensorName) {
            $http.post('/sensorName', {
                sensorName: $scope.sensorName
            }).then(function(response) {
                $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        } else {
            $rootScope.showToast("Please enter a valid Host Address", 'error-toast', 'top center');
        }
    }

    $scope.deleteAllImages = function() {
        $http.get('/deleteAllImages').then(function(response) {
            $scope.currentPage = 0;
            getImageList();
            $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
        }, function(err) {
            $rootScope.showToast(err.data.err, 'error-toast', 'top center');
        });
    }
    $scope.updateImageCount = function() {
        if ($scope.imageCount || $scope.imageCount >= 0) {
            $http.post('/updateImageCount', {
                imageCount: $scope.imageCount
            }).then(function(response) {
                $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
            }, function(err) {
                $rootScope.showToast(err.data.err, 'error-toast', 'top center');
            });
        }
    }
    $scope.$on('$destroy', function() {
        if (liveImageInterval) {
            $http.get("/stopLiveCamera").then(function(response) {
                $rootScope.showToast(response.data.msg, 'success-toast', 'top-center');
                $scope.liveStatus = !$scope.liveStatus;
                $interval.cancel(liveImageInterval);
            }, function(err) {
                console.log(err);
            });
        }
    });
    $window.addEventListener("beforeunload", function(e) {
        navigator.sendBeacon("http://192.168.1.50:8002/stopLiveCamera")
        return "Please stop Live view before closing";
    });
});

//-------------------------------------------------------------------------------------------------------