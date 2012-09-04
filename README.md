ey_node_package_info
====================

Parses a Node.js app's package.json file to figure out which node version and commands to use. 


EY Node Package Info
===

Internal tool to extract information about a Node.js application.






Examples:
---

Given:

{
  "scripts": {
    "start": "node ./bin/http-server",
    "test": "vows --spec --isolate",
    "predeploy": "echo This will be run before deploying the app",
    "postdeploy": "echo This will be run after deploying the app"
    "migrate": "echo migratey stuff"
  },
  "main": "./bin/web-server",
  "engines" {
    "node": ">=0.6"
  }
}

Output:


ey-node-package-info --engine-install # installs or fails w/ log stuff
ey-node-package-info --engine-path # "/opt/nodejs/0.8.7/bin"
ey-node-package-info --command start # "node ./bin/web-server"
ey-node-package-info --command predeploy # "..."
ey-node-package-info --command postdeploy # "..."
ey-node-package-info --command migrate # "..."

Given:

no package.json file

Output:

EXPLODE


Given:

package.json with no engine

Outputs:

ey-node-package-info --engine-path # whatever eselected node there is main recipes: 0.8.7

Given:

package.json with no scripts

predeploy: no-op
postdeploy: no-op
migrate: no-op
start: look for {app,web,server}.{js,coffee} # app.js



