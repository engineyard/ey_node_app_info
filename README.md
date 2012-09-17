ey_node_app_info
====================

Parses a Node.js app's package.json file to figure out which node version and commands to use.


EY Node Package Info
===

Internal tool to extract information about a Node.js application.

Examples:
---

    ey_node_app_info engine-version --app /path/to/app
    # output like '0.8.7'

    ey_node_app_info command start --app /path/to/app
    # output like 'node ./app.js' or 'npm start'
    

