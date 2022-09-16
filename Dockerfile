# Common build stage
FROM python:3

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir nibabel pydicom matplotlib pillow med2image


FROM alpine:3.15 as common-build-stage

ENV NODE_VERSION 16.17.0

COPY . ./app

WORKDIR /app

RUN npm install -g node-pre-gyp

RUN npm install -g node-gyp

RUN npm i @discordjs/voice

RUN npm i discord.js

RUN npm i @discordjs/rest

RUN npm i yt-search

RUN npm i ytdl-core

RUN npm install

EXPOSE 3000

FROM common-build-stage as production-build-stage

ENV NODE_ENV production
ENV PORT 3000

CMD ["node", "index.js"]