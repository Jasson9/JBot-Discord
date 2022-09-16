FROM ubuntu:22.04 as common-build-stage

COPY . ./app

WORKDIR /app

ENV NODE_VERSION=16.13.0

RUN apt-get update && apt-get install -y apt-transport-https

RUN echo 'deb http://private-repo-1.hortonworks.com/HDP/ubuntu14/2.x/updates/2.4.2.0 HDP main' >> /etc/apt/sources.list.d/HDP.list

RUN echo 'deb http://private-repo-1.hortonworks.com/HDP-UTILS-1.1.0.20/repos/ubuntu14 HDP-UTILS main'  >> /etc/apt/sources.list.d/HDP.list

RUN echo 'deb [arch=amd64] https://apt-mo.trafficmanager.net/repos/azurecore/ trusty main' >> /etc/apt/sources.list.d/azure-public-trusty.list


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