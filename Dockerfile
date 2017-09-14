FROM node:boron

# Create app directory
WORKDIR /etc/tickets

# Install app dependencies
COPY package.json .

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]