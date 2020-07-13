FROM node:10-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
RUN mkdir logs && chown node:node logs

COPY ./nodejs_server/src/package.json ./

USER node
RUN npm install

COPY --chown=node:node ./nodejs_server/src ./