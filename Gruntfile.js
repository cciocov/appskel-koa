/**
 *
 * Build and compile assets.
 *
 */
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);


  grunt.initConfig({
    copy: {
      views: {
        expand: true,
        cwd: 'views/',
        src: ['**/*', '!.min/**'],
        dest: 'views/.min/'
      },

      fonts: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: 'webroot/libs/',
            src: ['**/fonts/*'],
            dest: 'webroot/assets/fonts/',
            filter: 'isFile'
          }
        ]
      }
    },


    clean: {
      views: {
        src: 'views/.min/'
      },
      tmp: {
        src: '.tmp/'
      }
    },


    less: {
      options: {
        strictImports: true,
        plugins: [
          new (require('less-plugin-autoprefix'))({
            browsers: ["last 2 versions"]
          })
        ]
      },

      files: {
        expand: true,
        cwd: 'client/less/',
        src: ['**/*.less', '!**/_*.less'],
        dest: 'client/css/',
        ext: '.less.css'
      }
    },


    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/assets/js/',
          src: '*.js',
          dest: '.tmp/concat/assets/js/'
        }]
      }
    },


    useminPrepare: {
      options: {
        root: ['client/', 'webroot/'],
        dest: 'webroot/'
      },
      html: 'views/.min/**/*.*'
    },

    usemin: {
      options: {
        assetsDirs: ['webroot/assets/'],
        patterns: {
          jade: require('usemin-patterns').jade
        }
      },
      html: 'views/.min/**/*.html',
      jade: 'views/.min/**/*.jade'
    },


    watch: {
      views: {
        files: ['views/**/*.*', '!views/.min/**/*.*'],
        tasks: ['build']
      },

      'less-dev': {
        files: 'client/less/**/*.less',
        tasks: ['less']
      },

      'less-min': {
        files: 'client/less/**/*.less',
        tasks: ['build']
      },

      js: {
        files: 'client/js/**/*.js',
        tasks: ['build']
      }
    },


    nodemon: {
      options: {
        watch: ['config', 'lib', 'node_modules'],
        ext: 'js,json',
        exec: 'npm run'
      },

      dev: {
        script: 'dev'
      },

      min: {
        script: 'min'
      }
    },


    concurrent: {
      options: {
        'logConcurrentOutput': true
      },

      dev: {
        tasks: ['nodemon:dev', 'watch:less-dev']
      },

      min: {
        tasks: ['nodemon:min', 'watch:views', 'watch:less-min', 'watch:js']
      }
    }
  });


  grunt.registerTask('compile-views', [
    'clean:views',
    'copy:views',
    'useminPrepare',
    'concat:generated',
    'ngAnnotate',
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'clean:tmp'
  ]);

  grunt.registerTask('build', [
    'less',
    'compile-views'
  ]);

  grunt.registerTask('dev', [
    'build',
    'concurrent:dev'
  ]);
  
  grunt.registerTask('min', [
    'copy:fonts',
    'build',
    'concurrent:min'
  ]);

  grunt.registerTask('default', ['dev']);
};
