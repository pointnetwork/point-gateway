#!/bin/bash

# Install npm packages
# RUN npm install

# RUN npm run build

# Bundle app source
# COPY . .

# Your startup command
# CMD [ "node", "index.js" ]

# CMD pm2 start ./dist/index.js --name point-gateway
# CMD ["pm2-runtime", "start", "./dist/index.js", "--name", "point-gateway"]

echo "Starting entrypoing.sh..."

npm install

npm install pm2 -g

npm run build

# pm2 start ./dist/index.js --name point-gateway
# Avoid "pm2: command not found":
pm2-runtime start ./dist/index.js --name point-gateway