
/// <reference path="../../../public/libs/phoenix-cli/dist/phoenix.d.ts" />
/// <reference path="../../../public/libs/phoenix-cli/typings/browser.d.ts" />
namespace Phoenix {
    export module demo {
        let _application = application;
        var app = angular.module(_application.name);

        app.controller("UserDetailFormController", ["$scope", function ($scope) {
            $scope.data = {};
            $scope.onModelChange = function (action, model, form) {
                console.log(action.property)
                switch (action.property) {
                    case "lastName":
                    case "firstName":
                        model.fullName = (model.firstName || '') + ' ' + (model.lastName || '');
                        break;
                }
            }
        }]);
        app.directive('widgetUserDetailForm', [function () {
            return {
                scope: {
                    data: '=',
                    props: '=',
                    module: '='
                },
                restrict: 'E',
                replace: true,
                controller: "UserDetailFormController",
                template: '<div><bsform layout="props.data.layout" action="onModelChange" data="data" schema="props.data.schema"></bsform</div>'
            };
        }]);
    }
}















































/*
                    case "$links.link1":
                       model.$states.fullName.isHidden =  !model.$states.fullName.isHidden;                            
                       break;
                    case "$links.checkuser":
                       let  errorFound = false;
                       if (!model.validate()) {
                           errorFound = true;
                       } 
                       if (model.lastName === 'Clinton') { 
                            model.$errors.lastName.addError( "Invalid Name"); 
                            errorFound = true;
                       }
                       if (errorFound) {
                           model.$errors.$.addError("Invalid User.")
                       }                          
                       break;
*/
