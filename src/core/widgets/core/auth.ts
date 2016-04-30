/// <reference path="../../../../public/libs/phoenix-cli/dist/phoenix.d.ts" />
/// <reference path="../../../../public/libs/phoenix-cli/typings/browser.d.ts" />

namespace Phoenix {
    let _authentication = authentication,
        _application = application,
        _ajax = ajax,
        _external = external,
        _ui = ui,
        _dom = dom,
        _data = data;
    var _checkLoggedIn = function(credentials, after, method) {
        let doExit = !credentials;
        if (!doExit) doExit = ((method === "GET") || (method === "DELETE")) && !credentials.token;
        if (!doExit) doExit = (method === "POST") && !credentials.login
        if (doExit) {
            if (after) after(null);
            return;
        }
        // Disable authentication interception
        _dom.processing(true);
        _ajax.activateInterceptError(401, false);
        let toSend = null;
        if (method === "POST") {
            toSend = credentials;
        }
        _data.rest.getRessources({ "$method": method, "$url": "session", $data: toSend }, null).then(function(ldata) {
            _dom.processing(false);
            if (method === "DELETE") {
                _authentication.clear();
            }                    
            // Enable authentication interception
            _ajax.activateInterceptError(401, true);
            if (method === "POST" || method === "GET") {
                _application.licences = {}; 
                if (ldata.licences) {
                    ldata.licences.forEach(function(licence){
                        application.licences[licence.module] = licence;
                    });
                }
               _authentication.save(ldata, true);
            }
            if (after) after(ldata);
        }).catch(function(data) {
            _dom.processing(false);
            // Enable authentication interception
            _authentication.clear();
            _ajax.activateInterceptError(401, true);
            if (after) after(null);
        });
    };
    _external.checkLoggedInHandler = function(after) {
        var credentials = _authentication.load();
        _checkLoggedIn(credentials, after, "GET");
    }
    export function activateAuthentification(app) {
        app.run(['$rootScope', function($rootScope) {
            var _acheckLoggedIn = function(credentials, after, method) {
                _checkLoggedIn(credentials, function(ldata) {
                    $rootScope.$apply(function() {
                        if (after) after(ldata);
                    });
                }, method);

            }
            //do Login 
            $rootScope.doLogIn = function(credentials, after) {
                _authentication.clear();
                _acheckLoggedIn(credentials, function(data) {
                    if (after) after(data);
                }, "POST");
            };
            
            //check if logged in
            $rootScope.checkLoggedIn = function(after) {
                var credentials = _authentication.load();
                _acheckLoggedIn(credentials, function(data) {
                    if (after) after(data);
                }, "GET");
            };
            // do logout
            $rootScope.doLogOut = function(after) {
                var credentials = _authentication.load();
                _acheckLoggedIn(credentials, function(data) {
                    if (after) after(data);
                }, "DELETE");
            }
            // user info
            $rootScope.$on('auth-state-changed', function(event, data) {
                var page = _ui.Page();
                page.props.$user = data;
            });

        }]);
    }

}