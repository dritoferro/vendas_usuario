FROM node:carbon-stretch-slim

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY ./src src
COPY tsconfig.json /app
RUN npm run build
RUN rm -rf src

COPY enviroments.env /app

CMD [ "node", "out/index.js" ]
