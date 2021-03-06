module.exports = function(grunt) {
  grunt.registerTask('test:server', 'Autorun tests on ChromeCanary',
                     ['build', 'concat:tests', 'karma:server', 'watch:test']);
  grunt.registerTask('test:all', 'Run tests once on ChromeCanary, Chrome, Firefox and Opera',
                     ['build', 'concat:tests', 'karma:multiple']);
  grunt.registerTask('test:safari', 'Run tests once on Safari using IndexedDBShim',
                     ['build', 'concat:tests', 'karma:safari']);

  grunt.loadNpmTasks('grunt-microlib');
  grunt.loadNpmTasks('grunt-karma');

  var microlibConfig = require('grunt-microlib').init.bind(this)(grunt);
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,

    cfg: {
      name: 'EasyIndexedDB',
      barename: 'eidb',
      namespace: 'EIDB'
    },

    watch: {
      build: {
        files: ['lib/**'],
        tasks: ['build']
      },
      test: {
        files: ['lib/**', 'test/**'],
        tasks: ['build', 'concat:tests', 'karma:server:run']
      }
    },

    concat: {
      tests: {
        src: ['test/test_helper.js','test/tests/**.js'],
        dest: 'tmp/tests-bundle.js'
      }
    },

    karma: {
      options: {
        configFile: 'karma.conf.js',
        reporters: ['dots'],
        browsers: ['ChromeCanary']
      },
      multiple: {
        singleRun: true,
        browsers: ['ChromeCanary', 'Chrome', 'Firefox', 'Opera']
      },
      safari: {
        configFile: 'safari.karma.conf.js',
        browsers: ['Safari'],
        singleRun: true
      },
      server: {
        background: true
      }
    }
  };

  grunt.initConfig(grunt.util._.merge(microlibConfig, config));
};
