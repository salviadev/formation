var fs = require('fs');
var dsutils = require('phoenix-seed').dsutils;
var layoutUtils = require('phoenix-seed').layoutUtils;
var config = require('phoenix-seed').config;


function _buildHelp(grunt) {
    var deploy = grunt.option('deploy');
    if (deploy)
        grunt.task.run('help-deploy');
    else
        grunt.task.run('help');
}

function _build(grunt, moduleName) {
    if (moduleName === "core") return;
    if (moduleName === "help") {
        return _buildHelp(grunt);
    }
    var src = grunt.config.get('srcRootPath');
    var application = grunt.config.get('application');
    var cfg = src + '/' + moduleName + '/' + 'config.json';
    var moduleConfig = grunt.file.readJSON(cfg);

    var glbCfg = grunt.config.get('glbCfg');
    grunt.config.set('glbCfg', glbCfg);
    if (!moduleConfig)
        return grunt.fail.fatal("File not found: " + cfg);
    application.title = moduleConfig.application.title;
    application.name = moduleName;
    var deploy = grunt.option('deploy');
    if (deploy) {
        grunt.config.set('deploy', { release: 'true' });
    }

    grunt.config.set('application', application);
    grunt.task.run('compile');

    grunt.config.set('htmlPath', grunt.config.get('distPath') + '/' + application.name);
    grunt.config.set('htmlPathPrefix', '');
    grunt.config.set('bowerPath', '../libs');
    var hb = grunt.config.getRaw('htmlbuild');
    if (moduleConfig.plugins && moduleConfig.plugins.debug && moduleConfig.plugins.dist) {
        hb.debug.options.scripts.application_plugins.files = (moduleConfig.plugins.debug.scripts ? moduleConfig.plugins.debug.scripts : moduleConfig.plugins.debug);
        hb.dist.options.scripts.application_plugins.files = (moduleConfig.plugins.dist.scripts ? moduleConfig.plugins.dist.scripts : moduleConfig.plugins.dist);
        if (moduleConfig.plugins.dist.styles)
            hb.dist.options.styles.third_party.files = hb.dist.options.styles.third_party.files.concat(moduleConfig.plugins.dist.styles);
        if (moduleConfig.plugins.debug.styles)
            hb.debug.options.styles.third_party.files = hb.debug.options.styles.third_party.files.concat(moduleConfig.plugins.debug.styles);
    } else {
        hb.debug.options.scripts.application_plugins.files = [];
        hb.dist.options.scripts.application_plugins.files = [];
    }

   
    grunt.config.set('htmlbuild', hb);
    grunt.task.run('html-build');
    if (deploy) {
        grunt.task.run('clean:dist');
        // merge pages with datasets
        grunt.task.run('integrateDatasets');
        // merge forms with subforms
        grunt.task.run('integrateSubForms');
        grunt.task.run('copy:deploy');

    }
}


module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        glbCfg: grunt.file.readJSON('./src/global.json'),
        application: {
            name: "Invalid Application Name",
        },
        tempPath: './temp',
        srcRootPath: './src',
        srcCoreRootPath: './src/core',
        distPath: './public',
        bowerPath: '../libs',
        releasePath: './dist',

        htmlPath: '<%= distPath %>/<%= application.name %>',
        htmlPathPrefix: '',
        prefixHtmlRoot: '',
        deploy: {
            release: "false"
        },
        rootPath: './public',
        less: {
            application: {
                options: {},
                files: [
                    {
                        expand: true,
                        cwd: '<%= srcRootPath %>/<%= application.name %>/widgets/',
                        src: '**/*.less',
                        dest: '<%= tempPath %>/<%= application.name %>/css',
                        rename: function(dest, src, options) {
                            var path = require('path');
                            var fn = src.replace(/\.less/, '.css').replace(/\/less\//, '/');
                            return path.join(dest, fn);
                        }
                    }

                ]
            }
        },
        replace: {
            dist: {
                files: [{
                    src: ['<%= srcRootPath %>/<%= application.name %>/widgets/core/main.ts'],
                    dest: '<%= srcRootPath %>/<%= application.name %>/widgets/core/main-compiled.ts'
                }],
                options: {
                    patterns: [
                        {
                            match: 'application_name',
                            replacement: '<%= application.name %>'
                        },
                        {
                            match: 'application_title',
                            replacement: '<%= application.title %>'
                        },
                        {
                            match: /glb_cfg/g,
                            replacement: '<%= glbCfg %>'
                        }
                    ]
                }
            }
        },
        ts: {
            all: {
                files: [
                    {
                        src: [
                            '<%= srcRootPath %>/<%= application.name %>/widgets/core/auth.ts',
                            '<%= srcRootPath %>/<%= application.name %>/widgets/core/main-compiled.ts',
                            '<%= srcRootPath %>/<%= application.name %>/widgets/**/*.ts',
                            '!<%= srcRootPath %>/<%= application.name %>/widgets/core/main.ts',
                        ],
                        dest: '<%= tempPath %>/<%= application.name %>/ts/ts.js'
                    }
                ],
                options: {
                    fast: "never",
                    comments: false,
                    noResolve: false
                }
            }
        },
        ngtemplates: {
            application: {
                cwd: '<%= srcRootPath %>/<%= application.name %>/widgets/',
                src: '**/*.html',
                dest: '<%= tempPath %>/<%= application.name %>/js/widgets-tpls.js',
                options: {
                    htmlmin: {
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        removeComments: true
                    },
                    module: '<%= application.name %>',
                    url: function(file) {
                        var path = require('path');
                        file = path.basename(file);
                        return './templates/' + file;
                    },
                }
            }

        },
        concat: {
            options: {
                stripBanners: true,
            },
            application: {
                src: [
                    '<%= tempPath %>/<%= application.name %>/ts/ts.js',
                    '<%= tempPath %>/<%= application.name %>/js/*.js',
                    '<%= srcRootPath %>/<%= application.name %>/widgets/**/*.js'
                ],
                dest: '<%= distPath %>/<%= application.name %>/application.js'
            },
            application_css: {
                src: [
                    '<%= tempPath %>/<%= application.name %>/css/**/*.css'
                ],
                dest: '<%= distPath %>/<%= application.name %>/css/application.css'
            }

        },
        cssmin: {
            target: {
                files: [{
                    src: '<%= distPath %>/<%= application.name %>/css/application.css',
                    dest: '<%= distPath %>/<%= application.name %>/css/application.min.css'

                }]
            }
        },

        uglify: {
            options: {
                sourceMap: true
            },
            application: {
                src: '<%= distPath %>/<%= application.name %>/application.js',
                dest: '<%= distPath %>/<%= application.name %>/application.min.js'
            }
        },

        copy: {
            app_json: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/widgets/**/*.json', '!<%= srcRootPath %>/<%= application.name %>/widgets/**/modules.json'],
                        dest: '<%= distPath %>/<%= application.name %>/ui/locales/'
                    }
                ]
            },
            core: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/core/widgets/core/**/*.*'],
                        dest: '<%= srcRootPath %>/<%= application.name %>/widgets/core/',
                        filter: 'isFile'
                    }
                ]
            },
            help: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= srcRootPath %>/help',
                        src: ['./**/*.*'],
                        dest: '<%= distPath %>/help/',
                        filter: 'isFile'
                    }
                ]
            },
            "help-deploy": {
                files: [
                    {
                        expand: true,
                        cwd: '<%= srcRootPath %>/help',
                        src: ['./**/*.*'],
                        dest: '<%= releasePath %>/help/',
                        filter: 'isFile'
                    }
                ]
            },
            app: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/widgets/**/img/*.*'],
                        dest: '<%= distPath %>/<%= application.name %>/img/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/ui/pages/*.json'],
                        dest: '<%= distPath %>/<%= application.name %>/ui/pages/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/ui/forms/*.json'],
                        dest: '<%= distPath %>/<%= application.name %>/ui/forms/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/ui/forms/meta/*.json'],
                        dest: '<%= distPath %>/<%= application.name %>/ui/forms/meta/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/ui/toolboxes/*.json'],
                        dest: '<%= distPath %>/<%= application.name %>/ui/toolboxes/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/ui/menus/*.json'],
                        dest: '<%= distPath %>/<%= application.name %>/ui/menus/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/photos/*'],
                        dest: '<%= distPath %>/<%= application.name %>/photos/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/data/*'],
                        dest: '<%= distPath %>/<%= application.name %>/data/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/<%= application.name %>/model.html'],
                        dest: '<%= distPath %>/<%= application.name %>'
                    }

                ]
            },
            deploy: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= distPath %>/<%= application.name %>',
                        src: ['**/*', '!libs/**'],
                        dest: '<%= releasePath %>/<%= application.name %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= distPath %>',
                        src: [
                            'libs/phoenix-app/**/*.min.*',
                            'libs/phoenix-cli/dist/**/*',
                            'libs/isMobile/**/*.min.*',
                            'libs/es6-promise/**/*.min.*',
                            'libs/phoenix-app/dist/**/*.json',
                            'libs/phoenix-app/*dist/img/*.*'
                        ],
                        dest: '<%= releasePath %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= srcRootPath %>',
                        src: ['Web.config'],
                        dest: '<%= releasePath %>'
                    }

                ]
            },
            app_config: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= srcRootPath %>/app.json'],
                        dest: '<%= distPath %>'
                    }
                ]
            },
            'deploy-root-index': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= distPath %>',
                        src: ['index.html', 'app.json'],
                        dest: '<%= releasePath %>'
                    }
                ]
            }

        },
        htmlbuild: {
            "redirect-debug": {
                src: '<%= srcCoreRootPath %>/html/redirect-debug.html',
                dest: '<%= distPath %>/debug.html',
                options: {
                    beautify: true,
                    relative: false
                }

            },
            "redirect-release": {
                src: '<%= srcCoreRootPath %>/html/redirect-release.html',
                dest: '<%= distPath %>/index.html',
                options: {
                    beautify: true,
                    relative: false
                }

            },
            debug: {
                src: '<%= htmlPath %>/model.html',
                dest: '<%= htmlPath %>/debug.html',
                options: {
                    beautify: true,
                    relative: false,
                    scripts: {
                        core: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-app/dist/js/app.js'
                            ]
                        },
                        phoenix: {
                            cwd: '<%= htmlPath %>',
                            files: ['<%= bowerPath %>/phoenix-cli/dist/js/phoenix.js',
                                '<%= bowerPath %>/phoenix-cli/dist/js/phoenix.widgets.js',
                                '<%= bowerPath %>/phoenix-cli/dist/js/phoenix.angular.js',
                                '<%= bowerPath %>/phoenix-cli/dist/js/phoenix.widgets.angular.js'
                            ]
                        },
                        jquery: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/jquery/dist/jquery.js'
                            ]
                        },
                        third_party: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/es6-promise/promise.js',
                                '<%= bowerPath %>/phoenix-cli/dist/bootstrap-theme/js/bootstrap.js',
                                '<%= bowerPath %>/isMobile/isMobile.js',
                                '<%= bowerPath %>/bootstrap-datepicker/dist/js/bootstrap-datepicker.js'
                            ]
                        },
                        angular: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/angular/angular.js',
                                '<%= bowerPath %>/angular-route/angular-route.js'
                            ]
                        },
                        application_plugins: {
                            cwd: '<%= htmlPath %>',
                            files: [
                            ]
                        },
                        application: {
                            cwd: '<%= htmlPath %>',
                            files: ['<%= htmlPathPrefix %>application.js']
                        }
                    },
                    styles: {
                        phoenix: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-cli/dist/css/phoenix.widgets.css',
                                '<%= bowerPath %>/phoenix-cli/dist/css/phoenix.css',
                                '<%= bowerPath %>/phoenix-cli/dist/css/phoenix.theme.css'
                            ]
                        },
                        phoenix_fonts: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-cli/dist/css/phoenix.fonts.css'
                            ]
                        },
                        third_party: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-cli/dist/bootstrap-theme/css/bootstrap.css',
                                '<%= bowerPath %>/bootstrap-datepicker/dist/css/bootstrap-datepicker.css'
                            ]
                        },
                        core: {
                            cwd: '<%= htmlPath %>',
                            files: ['<%= bowerPath %>/phoenix-app/dist/css/app.css']
                        },
                        application: {
                            cwd: '<%= htmlPath %>',
                            files: ['<%= htmlPathPrefix %>css/application.css']
                        }

                    }
                }

            },
            dist: {
                src: '<%= htmlPath %>/model.html',
                dest: '<%= htmlPath %>/index.html',
                options: {
                    beautify: true,
                    relative: false,
                    scripts: {
                        core: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-app/dist/js/app.min.js'
                            ]
                        },
                        phoenix: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-cli/dist/js/phoenix.min.js',
                                '<%= bowerPath %>/phoenix-cli/dist/js/phoenix.widgets.min.js',
                                '<%= bowerPath %>/phoenix-cli/dist/js/phoenix.angular.min.js',
                                '<%= bowerPath %>/phoenix-cli/dist/js/phoenix.widgets.angular.min.js'
                            ]
                        },
                        jquery: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js',
                            ]
                        },
                        third_party: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/es6-promise/promise.min.js',
                                '<%= bowerPath %>/phoenix-cli/dist/bootstrap-theme/js/bootstrap.min.js',
                                '<%= bowerPath %>/isMobile/isMobile.min.js',
                                '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js'
                            ]
                        },
                        angular: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '//ajax.googleapis.com/ajax/libs/angularjs/1.4.2/angular.min.js',
                                '//ajax.googleapis.com/ajax/libs/angularjs/1.4.2/angular-route.min.js'
                            ]
                        },
                        application_plugins: {
                            cwd: '<%= htmlPath %>',
                            files: [
                            ]
                        },
                        application: {
                            cwd: '<%= htmlPath %>',
                            files: ['<%= htmlPathPrefix %>application.min.js']
                        }
                    },
                    styles: {
                        phoenix: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-cli/dist/css/phoenix.widgets.min.css',
                                '<%= bowerPath %>/phoenix-cli/dist/css/phoenix.min.css',
                                '<%= bowerPath %>/phoenix-cli/dist/css/phoenix.theme.min.css'
                            ]
                        },
                        phoenix_fonts: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-cli/dist/css/phoenix.fonts.min.css'
                            ]
                        },
                        third_party: {
                            cwd: '<%= htmlPath %>',
                            files: [
                                '<%= bowerPath %>/phoenix-cli/dist/bootstrap-theme/css/bootstrap.min.css',
                                '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker.min.css'
                            ]
                        },
                        core: {
                            cwd: '<%= htmlPath %>',
                            files: ['<%= bowerPath %>/phoenix-app/dist/css/app.min.css']
                        },
                        application: {
                            cwd: '<%= htmlPath %>',
                            files: ['<%= htmlPathPrefix %>css/application.min.css']
                        }

                    }
                }

            }
        },


        clean: {
            help: [
                '<%= distPath %>/help'
            ],
            "help-deploy": [
                '<%= releasePath %>/help'
            ],
            before: [
                '<%= distPath %>/<%= application.name %>'
            ],
            temp: [
                '<%= tempPath %>',
                '<%= srcRootPath %>/<%= application.name %>/widgets/core',
                '<%= srcRootPath %>/<%= application.name %>/widgets/core/main-compiled.ts',
                '<%= distPath %>/<%= application.name %>/model.html'
            ],

            release: [
                '<%= releasePath %>/<%= application.name %>',
                '<%= releasePath %>/libs'
            ],
            bower: [
                '<%= rootPath %>/libs/phoenix-app',
                '<%= rootPath %>/libs/phoenix-cli'
            ],
            dist: [
                '<%= releasePath %>/<%= application.name %>'
            ]
        },
        bower: {
            install: {
                options: {
                    targetDir: "./public/libs",
                    cleanBowerDir: false
                }
            }
        }
    });
    grunt.registerTask('default', ['build']);

    grunt.registerTask('integrateDatasets', [], function() {
        var done = this.async();
        var application = grunt.config.get('application');
        var dsPath = config.dsPath(application.name);
        var pagesPath = grunt.config.get('distPath') + '/' + application.name + '/ui/pages/';
        dsutils.integrateDatasets(pagesPath, dsPath, function(err) {
            if (err)
                return grunt.fail.fatal(err);
            layoutUtils.integrateSubLayouts(pagesPath, function(err) {
                if (err)
                    return grunt.fail.fatal(err);
                done();
            });
        });
    });
    
    grunt.registerTask('integrateSubForms', [], function() {
        var done = this.async();
        var application = grunt.config.get('application');
        var formsPath = grunt.config.get('distPath') + '/' + application.name + '/ui/forms/';
        layoutUtils.integrateSubLayouts(formsPath, function(err) {
            if (err)
                return grunt.fail.fatal(err);
            done();
        });
    });


    grunt.registerTask('compile', ['clean:before', 'clean:temp', 'clean:dist', 'clean:release', 'copy:core', 'replace', 'ts', 'less', 'ngtemplates', 'concat', 'uglify', 'cssmin', 'copy:app_json', 'copy:app']);
    grunt.registerTask('help', ['clean:help', 'copy:help']);
    grunt.registerTask('help-deploy', ['clean:help-deploy', 'copy:help-deploy']);

    grunt.registerTask('html-build', ['htmlbuild:debug', 'htmlbuild:dist', 'clean:temp']);
    grunt.registerTask('build-one', "Build one", function(moduleName) {
        _build(grunt, moduleName);
    });

    grunt.registerTask('build', "Build task", function() {
        var done = this.async();
        var ic = grunt.option('install-client');
        if (ic) {
            grunt.task.run('clean:bower');
            grunt.task.run('bower:install');
        }

        var moduleName = grunt.option('module');
        if (moduleName) {
            grunt.task.run('build-one:' + moduleName);
            done();
        } else {
            var glbCfg = grunt.config.get('glbCfg');
            glbCfg.portailName = glbCfg.portailName || 'portail';
            grunt.config.set('glbCfg', glbCfg);
            grunt.task.run('htmlbuild:redirect-debug');
            grunt.task.run('htmlbuild:redirect-release');
            grunt.task.run('copy:app_config');
            var deploy = grunt.option('deploy');
            if (deploy)
                grunt.task.run('copy:deploy-root-index');

            var mdSrc = grunt.config.get('srcRootPath');
            fs.readdir(mdSrc, function(err, files) {
                if (err) return done(err);

                files.forEach(function(mn) {
                    var stats = fs.statSync(mdSrc + "/" + mn);
                    if (stats.isDirectory())
                        grunt.task.run('build-one:' + mn);
                });
                done();
            });
        }

    });

};

