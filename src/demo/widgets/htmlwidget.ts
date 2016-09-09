
/// <reference path="../../../public/libs/phoenix-cli/dist/phoenix.d.ts" />
/// <reference path="../../../public/libs/phoenix-cli/typings/index.d.ts" />
namespace Phoenix {
    export module demo {
        let _application = application;
        var app = angular.module(_application.name);
         app.directive('widgetHtmlTest', [function () {
            return {
                scope: {
                    module: '=',
                    data: '=',
                    props: '='
                },
                restrict: 'E',
                replace: true,
                template: '<div style="min-height:60px; background-color: red; position:relative;"><a href="#" data-phoenix-href="link://link1">Link ver la page vide</a></div>'
            };
        }]);
    }
}


