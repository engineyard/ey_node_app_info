var vows = require('vows'),
  assert = require('assert'),
  expect = require('chai').expect;

var sys = require('sys');
var exec = require('child_process').exec;

var packageInfoExecutable = "./bin/ey_node_package_info"

var invokeCommand = function(cmdString, fixtureCommands, callback){
  var cmd = [packageInfoExecutable, cmdString, fixtureCommands].join(" ");
  if(process.env.DEBUG) console.log('Invoking: ', cmd, '\n');
  exec(cmd, callback);
};



vows.describe("integrated testing").addBatch({
  'a default package.json': {
    topic: ' --package-json-path ./test/fixtures/default.package.json '+
       ' --available-json-path ./test/fixtures/default.available.json ',
    'when given: --help': {
      topic: function(fixtureCommands) { invokeCommand('--help', fixtureCommands, this.callback) },
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
    "when given: engine-version": {
      topic: function(fixtureCommands) {
        invokeCommand('engine-version', fixtureCommands, this.callback);
      },
      "it should return 0.8.7": function(error, stdout, stderr){
        assert.equal("0.8.7\n", stdout);
      }
    }
  },
  'an outdated package.json (version to old to be available)': {
    topic: ' --package-json-path ./test/fixtures/outdated.package.json '+
           ' --available-json-path ./test/fixtures/default.available.json ',
    'when asked for engine-version': {
      topic: function(fixtureCommands) {
        invokeCommand('engine-version', fixtureCommands, this.callback);
      },
      "it should blow up with an error message": function(error, stdout, stderr){
        assert.equal(error.code, 1);
        expect(stderr).to.include("Could not find").include("0.4.0");
      }
    }
  },
  'unspecified engine in package.json': {
    topic: ' --package-json-path ./test/fixtures/minimal.package.json '+
           ' --available-json-path ./test/fixtures/default.available.json ',
    'when asked for engine-version': {
      topic: function(fixtureCommands) {
        invokeCommand('engine-version', fixtureCommands, this.callback);
      },
      "it returns the default version": function(error, stdout, stderr){
        assert.equal(error, null);
        expect(stdout).to.equal("1337.0.0\n");
      }
    }
  },
  'querying basic commands': {
    topic: ' --package-json-path ./test/fixtures/default.package.json '+
       ' --available-json-path ./test/fixtures/default.available.json ',
    'start command': {
      topic: function(fixtureCommands) {
        invokeCommand('command start', fixtureCommands, this.callback);
      },
      "returns 'npm start' if that key is present": function(error, stdout, stderr){
        assert.equal(error, null);
        expect(stdout).to.equal("npm start\n");
      }
    },
  },
  'querying basic commands (results when not specified)': {
    topic: ' --package-json-path ./test/fixtures/minimal.package.json '+
       ' --available-json-path ./test/fixtures/default.available.json ',
    'start command': {
      topic: function(fixtureCommands) {
        invokeCommand('command start', fixtureCommands, this.callback);
      },
      "exist non-zero if command is not present": function(error, stdout, stderr){
        assert.equal(error.code, 1);
        expect(stderr).to.include('No npm scripts key for start')
      }
    }
  },



}).run();
