/// <reference path="../../../../public/libs/phoenix-cli/dist/phoenix.d.ts" />
/// <reference path="../../../../public/libs/phoenix-cli/typings/browser.d.ts" />
namespace Phoenix {
    let _application = application;
    // Init application
	let cfg = glb_cfg;
    _application.init("@@application_name", "@@application_title", cfg);
    _application.angularApplication = angular.module(_application.name, []);
}


