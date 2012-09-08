var semver = require('semver'),
    fs = require('fs');


function getJsonFromPath(jsonFilePath){
  return JSON.parse(fs.readFileSync(jsonFilePath, 'UTF-8'));
}

function Package(options){
  this.options = options;

  // Parse available_versions.json
  var availableJson = getJsonFromPath(options.availableJsonPath);
  this.default = availableJson.version;
  this.available = availableJson.available_versions;


  // Parse package.json
  var packageJson = getJsonFromPath(options.packageJsonPath);
  if(packageJson.engines && packageJson.engines.node) {
    this.requested = packageJson.engines.node;
  } else {
    this.requested = this.default;
  }

  if(packageJson.scripts) {
    this.commands = packageJson.scripts;
  }



};

var PackageClass = {
  version: '0.8.7',
  options: {},
  available: [],
  default: '',
  requested: '',

  result: function(){
    return semver.maxSatisfying(this.available, this.requested);
  },
  
  commands: {},
};

Package.prototype = PackageClass;

exports.createFrom = function(options){
  return new Package(options);
};

exports.Package = Package;
