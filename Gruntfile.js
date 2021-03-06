module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("gruntify-eslint");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-mocha-istanbul");
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-sass");

    var files = ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/**/*.js"];
    var artifactsLocation = "build_artifacts";
    var webpack = require("webpack");
    var webpackConfig = require("./webpack.development.config.js");

    grunt.initConfig({
        watch: {
            options: {
                livereload: true
            },
            app: {
                files: ["src/client/app/**/*"],
                tasks: ["webpack:build-dev"],
                options: {
                    spawn: false
                }
            },
            express: {
                options: {
                    files: ["server/*"],
                    tasks: ["express:dev"],
                    options: {
                        spawn: false
                    }
                }
            }
        },
        express: {
            options: {
                port: 8080
            }
        },
        eslint: {
            all: ["server/**/*.js", "src/**/*.js", "src/**/*.jsx", "!node_modules/**/*"],
            dev: {
                src: ["webpack.development.config.js"]
            }
        },
        jshint: {
            all: files,
            options: {
                jshintrc: true
            },
            dev: {
                src: ["webpack.development.config.js"]
            }
        },
        jscs: {
            all: files,
            dev: {
                src: ["webpack.development.config.js"]
            }
        },
        mochaTest: {
            test: {
                src: ["test/**/*.js"]
            }
        },
        "mocha_istanbul": {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    quiet: false
                }
            },
            options: {
                coverageFolder: artifactsLocation,
                reportFormats: ["none"],
                print: "detail"
            }
        },
        "istanbul_report": {
            test: {

            },
            options: {
                coverageFolder: artifactsLocation
            }
        },
        "istanbul_check_coverage": {
            test: {

            },
            options: {
                coverageFolder: artifactsLocation,
                check: true
            }
        }
    });

    grunt.registerMultiTask("istanbul_report", "Solo task for generating a report over multiple files.", function () {
        var done = this.async();
        var cmd = process.execPath;
        var istanbulPath = require.resolve("istanbul/lib/cli");
        var options = this.options({
            coverageFolder: "coverage"
        });
        grunt.util.spawn({
            cmd: cmd,
            args: [istanbulPath, "report", "--dir=" + options.coverageFolder]
        }, function(err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("escheck", ["eslint"]);
    grunt.registerTask("test", ["mochaTest", "mocha_istanbul", "istanbul_report",
        "istanbul_check_coverage"]);
    grunt.registerTask("default", "test");
};
