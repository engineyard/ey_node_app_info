var vows = require('vows'),
  assert = require('assert'),
  expect = require('chai').expect,
  sys = require('sys'),
  exec = require('child_process').exec;

var packageInfoExecutable = "./bin/ey_node_app_info";

var invokeCommand = function(cmdString, optionString, callback){
  var cmd = [packageInfoExecutable, cmdString, optionString].join(" ");
  if(process.env.DEBUG) console.log('Invoking: ', cmd, '\n');
  exec(cmd, callback);
};

vows.describe("integrated testing").addBatch({
  'help': {
    'when given: --help': {
      topic: function() { invokeCommand('--help', '', this.callback) },
      "it exits with return code 1": function(error, stdout, stderr){
        assert.equal(error.code, 1);
      },
      "there is no stderr output": function(error, stdout, stderr){
        assert.equal('', stderr);
      },
      "there is help on stdout": function(error, stdout, stderr){
        expect(stdout).to.include("Available options");
      }
    },
  },
  'with available versions': {
    topic: '--available ./test/sample-apps/available-node-versions.json',
    'a basic application': {
      topic: function(available){
        return '--app ./test/sample-apps/basic '+available;
      },
      "when given: engine-version": {
        topic: function(optionString) {
          invokeCommand('engine-version', optionString, this.callback);
        },
        "it should return 0.8.7": function(error, stdout, stderr){
          assert.equal("0.8.7\n", stdout);
        }
      },
      'when given: check': {
        topic: function(optionString) {
          invokeCommand('check', optionString, this.callback);
        },
        "it should say package.json exists, exit zero": function(error, stdout, stderr){
          assert.equal("Found package.json\n", stdout);
          assert.equal(error, null);
        }
      }
    },
    'an outdated package.json (version to old to be available)': {
      topic: function(available){
        return '--app ./test/sample-apps/outdated ' + available;
      },
      'when asked for engine-version': {
        topic: function(optionString) {
          invokeCommand('engine-version', optionString, this.callback);
        },
        "it should blow up with an error message": function(error, stdout, stderr){
          assert.equal(error.code, 1);
          expect(stdout).to.include("Could not find").include("0.4.0");
        }
      }
    },
    'unspecified engine in package.json': {
      topic: function(available) {
        return '--app ./test/sample-apps/minimal ' + available;
      },
      'when asked for engine-version': {
        topic: function(optionString) {
          invokeCommand('engine-version', optionString, this.callback);
        },
        "it returns the default version": function(error, stdout, stderr){
          assert.equal(error, null);
          expect(stdout).to.equal("1337.0.0\n");
        }
      }
    },
    'empty project': {
      topic: function(available) {
        return '--app ./test/sample-apps/empty ' + available;
      },
      'when given: check': {
        topic: function(optionString) {
          invokeCommand('check', optionString, this.callback);
        },
        'it says its missing and returns non-zero': function(error, stdout, stderr) {
          assert.equal("Invalid or missing package.json\n", stdout);
          assert.equal(error.code, 1);
        }
      },
      'when asked for engine-version': {
        topic: function(optionString) {
          invokeCommand('engine-version', optionString, this.callback);
        },
        "it returns the default version": function(error, stdout, stderr){
          assert.equal(error, null);
          expect(stdout).to.equal("1337.0.0\n");
        }
      },
      'start command': {
        topic: function(optionString) {
          invokeCommand('command start', optionString, this.callback);
        },
        "gives up and returns nothing": function(error, stdout, stderr){
          expect(stdout).to.equal("");
          assert.equal(error.code, 1);
        }
      }
    },
    'querying basic commands': {
      topic: function(available){
        return '--app ./test/sample-apps/basic ' + available;
      },
      'start command': {
        topic: function(optionString) {
          invokeCommand('command start', optionString, this.callback);
        },
        "returns 'npm start' if that key is present": function(error, stdout, stderr){
          assert.equal(error, null);
          expect(stdout).to.equal("npm run-script start\n");
        }
      },
      'predeploy command': {
        topic: function(optionString) {
          invokeCommand('command predeploy', optionString, this.callback);
        },
        "returns 'npm run-script predeploy' if that key is present": function(error, stdout, stderr){
          assert.equal(error, null);
          expect(stdout).to.equal("npm run-script predeploy\n");
        }
      },
      'postdeploy command': {
        topic: function(optionString) {
          invokeCommand('command postdeploy', optionString, this.callback);
        },
        "returns 'npm run-script postdeploy' if that key is present": function(error, stdout, stderr){
          assert.equal(error, null);
          expect(stdout).to.equal("npm run-script postdeploy\n");
        }
      },
    },
    'querying available commands (results when not specified)': {
      topic: function(available){
        return ' --app ./test/sample-apps/minimal ' + available;
      },
      'start command': {
        topic: function(optionString) {
          invokeCommand('command start', optionString, this.callback);
        },
        "fallback to app.js": function(error, stdout, stderr){
          assert.equal(error, null);
          expect(stdout).to.include("node ./app.js");
        }
      },
      'predeploy command not specified': {
        topic: function(optionString) {
          invokeCommand('command predeploy', optionString, this.callback);
        },
        "returns nothing since that key is not present": function(error, stdout, stderr){
          assert.equal(error.code, 1);
          expect(stdout).to.equal("");
        }
      },
      'postdeploy command not specified': {
        topic: function(optionString) {
          invokeCommand('command postdeploy', optionString, this.callback);
        },
        "returns nothing since that key is not present": function(error, stdout, stderr){
          assert.equal(error.code, 1);
          expect(stdout).to.equal("");
        }
      },
    },
    'insufficient information to start application': {
      topic: function(available){
        return ' --app ./test/sample-apps/wont_start ' + available;
      },
      'start command': {
        topic: function(optionString) {
          invokeCommand('command start', optionString, this.callback);
        },
        "exist non-zero if command is not present": function(error, stdout, stderr){
          assert.equal(error.code, 1);
          expect(stderr).to.include('No `npm start` specified.')
        }
      },
    },

  }


}).run();

