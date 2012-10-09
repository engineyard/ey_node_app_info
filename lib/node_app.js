var semver = require('semver'),
    fs = require('fs');

function getJsonFromPath(jsonFilePath){
  return JSON.parse(fs.readFileSync(jsonFilePath, 'UTF-8'));
}

var detectFallbacks = function(path){
  var fallbackExists = function(path, name){
    return fs.existsSync(path + '/' + name);
  };

  var fallbackBaseNames = ['app', 'index', 'web', 'server'];
  var fallbackExtensions = ['js', 'coffee'];

  var availableFallbacks = [];

  fallbackExtensions.forEach(function(extension){
    fallbackBaseNames.forEach(function(name){
      var fullName = name + '.' + extension;
      if (fallbackExists(path, fullName)) {
        availableFallbacks.push('node ./' + fullName);
      }
    });
  });
  return availableFallbacks[0];
}

exports.NodeApp = function(options){
  var appPath        = options.appPath;
  var availablePath  = options.availablePath;

  this.version   = '0.8.7';
  this.available = [];
  this.default   = '';
  this.requested = null;
  this.commands  = {};
  this.parsed    = null;

  // Parse available_versions.json
  var availableJson = getJsonFromPath(availablePath);
  this.default = availableJson.version;
  this.available = availableJson.available_versions;

  // Parse package.json
  var packageJson = {}
  try {
    packageJson = getJsonFromPath(appPath + "/package.json");
    this.parsed = true;
  } catch(err) {
    this.parsed = false;
  }

  // Extract requested engine string
  if(packageJson.engines && packageJson.engines.node) {
    this.requested = packageJson.engines.node;
  }

  // Extract defined npm scripts
  var nodeApp = this;
  if (packageJson.scripts) {
    Object.keys(packageJson.scripts).forEach(function(scriptName){
      nodeApp.commands[scriptName] = "npm run-script " + scriptName;
    })
  }

  this.result = semver.maxSatisfying(this.available, this.requested);

  this.fallbackStartCommand = detectFallbacks(appPath);
};

exports.createFrom = function(options){
  return new exports.NodeApp(options);
};
