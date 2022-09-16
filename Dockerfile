FROM ubuntu:22.04 as common-build-stage

COPY . ./app

WORKDIR /app

ENV NODE_VERSION=16.13.0

RUN apt install -y curl

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

ENV NVM_DIR=/root/.nvm

RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}

RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}

RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}

ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN node --version

RUN npm --version

RUN dir

RUN npm install

EXPOSE 3000

FROM common-build-stage as production-build-stage

ENV PORT 3000

CMD [ "node" , "index.js"]