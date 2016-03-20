#!/bin/bash
##Copy the final SPA artifacts to the /static folder, served by node.js express
rm ../server/static/build/bundle.js
mv build/bundle.js ../server/static/build/bundle.js
