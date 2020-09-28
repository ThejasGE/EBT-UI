app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});
app.directive('chooseFile', function() {
    return {
        link: function (scope, elem, attrs) {
            var button = elem.find('button');
            var input = angular.element(elem[0].querySelector('input#fileInput'));
            var fileModel = elem[0].querySelector('input#fileInput').getAttribute('ng-model');
            var filename = elem[0].querySelector("#filename-container #fileName");
            var fileNameModel = filename.getAttribute('ng-model');
            button.bind('click', function() {
                input[0].click();
            });
            input.bind('change', function(e) {
                scope.$apply(function() {
                    var files = e.target.files;
                    scope[fileModel] = files
                    if (files.length == 1) {
                        scope[fileNameModel] = files[0].name
                    }
                    else if(files.length > 1)
                    {
                        var names = []
                        for(var i=0;i< files.length; i++)
                        {
                            names.push(files[i].name)
                        }
                        scope[fileNameModel] = names.join()
                    }
                    else {
                        scope[fileNameModel] = null;
                    }
                });
            });
        }
    };
});
app.directive('draggable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.draggable({
                cursor: "move",
                containment: 'parent',
                stop: function (event, ui) {
                    /*scope[attrs.xpos] = ui.position.left;
                    scope[attrs.ypos] = ui.position.top;*/
                    var model = this.getAttribute('model')
                    scope[model].posx = parseFloat(ui.position.left);
                    scope[model].posy = parseFloat(ui.position.top);
                    // scope.$apply();
                }
            });
        }
    };
});

app.directive('modalDraggable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.draggable({
                cursor: "move",
                containment: 'parent',
                stop: function (event, ui) {
                    event.stopPropagation();
                }
            });
        }
    };
});

app.directive('resizable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.resizable({
                containment: 'parent',
                stop: function (event, ui) {
                    var model = this.getAttribute('model')
                    scope[model].width = parseFloat(ui.size.width);
                    scope[model].height = parseFloat(ui.size.height);
                    scope.$apply();
                }
            });
        }
    };
});

app.directive('rotatable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.rotatable({
                containment: 'parent',
                wheelRotate: false,
                rotate: function(event, ui) {
                    var model = this.getAttribute('model')
                    scope[model].rotate = parseFloat(ui.angle.degrees);
                    scope.$apply();
                }
            });
        }
    };
});

app.directive('animateOnChange', function($animate,$timeout) {
    return function(scope, elem, attr) {
        scope.$watch(attr.animateOnChange, function(nv,ov) {
            if (nv!=ov) {
                $animate.addClass(elem,'highlight-content shake').then(function() {
                    $timeout(function() {$animate.removeClass(elem,'highlight-content shake')});
                });
            }
        })
    }  
})