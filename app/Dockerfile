FROM node:20.6.1-alpine3.17

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN chown -R node:node /home/node/app

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3080 3443


CMD [ "node", "app.js" ]