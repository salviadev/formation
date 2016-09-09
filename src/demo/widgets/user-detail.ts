
/// <reference path="../../../public/libs/phoenix-cli/dist/phoenix.d.ts" />
/// <reference path="../../../public/libs/phoenix-cli/typings/index.d.ts" />
/// <reference path="./aaa.ts" />
namespace Phoenix {
    export module demo {
        let _application = application;
        var app = angular.module(_application.name);

        app.controller("UserDetailFormController", ["$scope", function ($scope) {
            $scope.data =  {address: {}};
            $scope.onModelChange = function (action, model, form) {
                //console.log(action.property)
                switch (action.property) {
                    case "lastName":
                    case "firstName":
                        model.fullName = (model.firstName || '') + ' ' + (model.lastName || '');
                        break;
                    case "$links.link1":
                        model.$states.fullName.isMandatory =  !model.$states.fullName.isMandatory;                            
                        break;
                    case "$links.checkuser":
                       aaa();
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
                template: '<div><bsform layout="props.data.layout" action="onModelChange" data="data" meta="props.data.meta"></bsform</div>'
            };
        }]);
    }
}















































/*
                    case "$links.link1":
                       model.$states.fullName.isHidden =  !model.$states.fullName.isHidden;                            
                       break;
*/
