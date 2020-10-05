app.controller('settingsDashctrl', function($scope, $http, $window, $mdDialog, $state, $rootScope, $interval, $location) {
    console.log($location.path(), "path........")
    // $scope.network="network"
    $scope.issettings2page = function() {
        var url = $location.path()
        console.log(url, "location...........")
        if (url == "/settingsdashboard") {
            return true
        } else {
            return false
        }
    }
    


    // Canvas variables

    var canvas = document.getElementById("mcanvas");
    var context = canvas ? canvas.getContext("2d") : {};
    console.log("statee..............", $rootScope)
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


    $scope.updateHostAddress = function() {
        if ($scope.hostAddress) {
            $http.post('/hostAddress', {
                hostAddress: $scope.hostAddress
            }).then(function(response) {
                $rootScope.showToast(response.data.msg, 'success-toast', 'top center');
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
    // $scope.checkWifiHotspot=function(){
    //     $http.get('/getNetworkInfo',).then(function(response){
    //         data=$scope.data;
    //         if(data){
    //             $rootScope.showToast("", 'success-toast', 'top center'); 
    //         }
    //     })
    // }
    $scope.addNetwork=function(){
        // $scope.network_details={};
        // $mdDialog.show({
        //     controller:settingDashCtrl,
        //     templateUrl:'web/static/pages/dialogNetwork.html',
        //     clickOutsideToClose:true,
        //     parent: angular.element(document.body),
        //     scope:$scope,
        //     preserveScope:true
        // }).then(function(){
        //     $scope.blur_content=false;

        // },function(){
        //     $scope.blur_content=false;
        // });
        window.location.href="/dialogNetwork"

    }
    
    $scope.searchNetwork=function(ssid){
        $scope.makingAjaxCall=true;
        $scope.networks=[];
    
        $http.get('/getScanNetwork/'+ssid).then(function(response){
            
            $scope.networks=response.data;
            // if($scope.networks)
        }, function(err) {
            console.log(err);
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
        navigator.sendBeacon("http://192.168.1.40:8002/stopLiveCamera")
        return "Please stop Live view before closing";
    });
});

//-------------------------------------------------------------------------------------------------------