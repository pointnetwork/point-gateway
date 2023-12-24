# Define node version
FROM node:18 as app

# Create app directory
WORKDIR /var/www/html

# Install app dependencies
# Copy package.json and package-lock.json (if available)
COPY . .

EXPOSE 5000
EXPOSE 3000

ENTRYPOINT [ "docker/entrypoint.sh" ]

# Install npm packages
# RUN npm install

# RUN npm run build

# Bundle app source
# COPY . .

# Your startup command
# CMD [ "node", "index.js" ]

# CMD pm2 start ./dist/index.js --name point-gateway
# CMD ["pm2-runtime", "start", "./dist/index.js", "--name", "point-gateway"]
