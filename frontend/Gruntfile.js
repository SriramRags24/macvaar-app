'use strict';
module.exports = function(grunt) {
   // load all grunt tasks using tc method
   require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
   grunt.loadNpmTasks('grunt-bg-shell');

   // configurable paths
   var yeomanConfig = {
      app: 'dev',
      debug: 'debug',
      deploy: 'deploy'
   };

   console.log("Using " + grunt.option('target') + " as target");
   var targetto = grunt.option('target');

   grunt.registerTask('alldebug', ['less:debug', 'bgShell:debug', 'copy:debug']);
   grunt.registerTask('alldeploy', ['less:prostrap', 'less:debug', 'bgShell:debug', 'copy:deploy']);
   //grunt.registerTask('minify', ['bgShell:minify']);

   grunt.registerTask('default', ['alldeploy']);

   //grunt.option('target');
   grunt.initConfig({
      target: targetto,
      clean: {
         debug: ['.tmp', '<%= yeoman.debug %>/*'],
         server: '.tmp'
      },

      watch: {
         debug: {
            files: ['dev/<%= target %>/**/*', 'dev/partials/**/*'],
            tasks: ['alldeploy'],
         }
      },

      less: {
         debug: {
            files: [{
               expand: true,
               cwd: 'dev/<%= target %>/',
               src: ['**/*.partial.less'],
               dest: 'dev/<%= target %>/',
               ext: '.partial.css'
            }, {
               expand: true,
               cwd: 'dev/<%= target %>/',
               src: ['**/*.less', '!**/*.partial.less'],
               dest: 'dev/<%= target %>/',
               ext: '.css'
            }, {
               expand: true,
               cwd: 'dev/partials',
               src: ['**/*.partial.less'],
               dest: 'dev/partials',
               ext: '.partial.css'
            }, {
               expand: true,
               cwd: 'dev/partials',
               src: ['**/*.less', '!**/*.partial.less'],
               dest: 'dev/partials',
               ext: '.css'
            }]
         },
         prostrap: {
            files: [{
               expand: true,
               cwd: 'dev/prostrap/css/',
               src: ['less/bootstrap.less'],
               dest: 'dev/prostrap/css/',
               ext: '.css'
            }, ]
         }
      },

      bgShell: {
         _defaults: {
            bg: true
         },

         test: {
            cmd: 'ls <%= target %>',
            bg: false
         },

         debug: {
            cmd: 'python2.7 dev/wrapper.py <%= target %>/templates/index.partial.html',
            bg: false
         },

         pyserver: {
            cmd: 'pushd debug/; python -m SimpleHTTPServer; popd',
            bg: false
         },

         minify: {
            cmd: 'mv deploy/components _compoennts ; pushd ../minify/ ; ./minify.py ../ui/deploy/ ; popd ; mv _compoennts deploy/components ;',
            bg: false
         },
         /*
         optimizejs: {
            cmd: "pushd deploy/ ; ./optimize.py scripts/landing_page/init.js ;  ./optimize.py scripts/owlink_user/init.js ; ./optimize.py scripts/owlink_group/init.js ;",
            bg: false
         }*/

      },

      copy: {
         debug: {
            files: [
               /*Copy partials*/
               {
                  expand: true,
                  dot: true,
                  cwd: 'dev',
                  dest: 'debug',
                  src: ['partials/**/*']
               },

               /*Copy files*/
               {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/templates',
                  dest: 'debug/templates/<%= target %>/',
                  src: ['**/*']
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/scripts',
                  dest: 'debug/scripts/<%= target %>/',
                  src: ['**/*']
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/css',
                  dest: 'debug/styles/<%= target %>',
                  src: ['**/*']
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/img',
                  dest: 'debug/styles/<%= target %>',
                  src: ['**/*']
               }
            ]
         },

         deploy: {
            files: [
               /*Copy partials*/
               // {
               // expand: true,
               // dot: true,
               // cwd: 'dev',
               // dest: 'deploy',
               // src: [ 'partials/**/*' ]
               //},

               /*Copy files - frontend*/

               {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/templates',
                  dest: 'deploy/templates/<%= target %>/',
                  src: ['**/*']
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/scripts',
                  dest: 'deploy/scripts/<%= target %>/',
                  src: ['**/*']
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/css',
                  dest: 'deploy/styles/<%= target %>',
                  src: ['**/*']
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/img',
                  dest: 'deploy/styles/<%= target %>',
                  src: ['**/*']
               },

               /*Copy files - backend*/
               {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/templates',
                  dest: '../backend/views/<%= target %>/',
                  ext: '.html',
                  src: ['**/*', '!**/*.partial.*', "!.*.sw*", '!*.handlebars']
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/scripts',
                  dest: '../backend/static/scripts/<%= target %>/',
                  src: ['**/*', '!**/*.partial.*', "!.*.sw*"]
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/css',
                  dest: '../backend/static/styles/<%= target %>/',
                  src: ['**/*', '!**/*.partial.*', "!.*.sw*"]
               }, {
                  expand: true,
                  dot: true,
                  cwd: 'dev/<%= target %>/img',
                  dest: '../backend/static/styles/<%= target %>/',
                  src: ['**/*', '!**/*.partial.*', "!.*.sw*"]
               },

               /*Copy prostrap styles. Always :) */
               {
                  expand: true,
                  dot: true,
                  cwd: 'dev/prostrap/css',
                  dest: 'deploy/styles/prostrap',
                  src: ['!**/*.less', '**/*.css']
               },
               {
                  expand: true,
                  dot: true,
                  cwd: 'dev/prostrap/css',
                  dest: '../backend/static/styles/prostrap',
                  src: ['!**/*.less', '**/*.css']
               },
               {
                  expand: true,
                  dot: true,
                  cwd: 'dev/common/img/',
                  dest: '../backend/static/styles/common',
                  src: ['**/*']
               }

            ]
         },


         /*Copy components*/
         components_debug: {
            files: [{
               expand: true,
               dot: true,
               cwd: 'dev',
               dest: 'debug',
               src: ['components/**/*', '!components/node_modules/**/*']
            }]
         },
         components_deploy: {
            files: [{
               expand: true,
               dot: false,
               cwd: 'dev',
               dest: 'deploy',
               src: ['components/**/*.{css,js,png}', '!components/node_modules/**/*', '!components/**/{test*,docs}/**/*']
            }]
         },
      },

      jshint: {
         options: {
            jshintrc: '.jshintrc'
         },
         view: ['Gruntfile.js',
            'dev/partials/**/*.js',
            'dev/view/**/*.js'
         ]
      },

      coffee: {
         debug: {
            files: [{
               // rather than compiling multiple files here you should
               // require them into your main .coffee file
               expand: true,
               cwd: '<%= yeoman.app %>/scripts',
               src: '**/*.coffee',
               dest: '<%= yeoman.debug %>/scripts',
               ext: '.js'
            }]
         }
      },

      requirejs: {
         debug: {
            options: {
               baseUrl: 'scripts/',
               appDir: 'debug/',
               mainConfigFile: 'debug/scripts/main.js',
               optimize: 'uglify2',
               optimizeCss: 'standard.keepLines',
               dir: 'release',
               modules: [{
                  name: 'main',
                  exclude: [
                     'jquery',
                     'mustache'
                  ]
               }, {
                  name: 'modules/Ingredients/Calculator',
                  exclude: [
                     'jquery',
                     'mustache',
                     'underscore',
                     'vendor/flight/lib/component'
                  ]
               }],
               removeCombined: false,
               stubModules: [
                  'text'
               ],
               preserveLicenseComments: false,
               useStrict: true,
               wrap: true
            }

         }
      },

      imagemin: {
         debug: {
            files: [{
               expand: true,
               cwd: '<%= yeoman.app %>/img',
               src: '{,*/}*.{png,jpg,jpeg}',
               dest: '<%= yeoman.debug %>/img'
            }]
         }
      },

      cssmin: {
         debug: {
            files: {
               '<%= yeoman.debug %>/styles/output.css': [
                  '.tmp/styles/{,*/}*.css',
                  '<%= yeoman.app %>/styles/**/*.css'
               ]
            }
         }
      },
   });

};
