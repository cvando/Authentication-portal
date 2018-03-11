FROM node:boron

# Create app directory
WORKDIR /etc/tickets

RUN apt-get update && apt-get install -y \
paxctl && paxctl -cm `which node`

# Install app dependencies
COPY package.json .

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
