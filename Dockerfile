# Common build stage
FROM node:18-alpine3.15 as common-build-stage

COPY . ./app

WORKDIR /app

RUN npm install -g npm@8.19.2

RUN npm install -g node-gyp

RUN npm i @discordjs/opus

RUN npm i @discordjs/voice

RUN npm i discord.js

RUN npm i @discordjs/rest

RUN npm i yt-search

RUN npm i ytdl-core

EXPOSE 3000

FROM common-build-stage as production-build-stage

ENV NODE_ENV production
ENV PORT 3000

CMD ["node", "index.js"]