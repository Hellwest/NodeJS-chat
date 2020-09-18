FROM node:14.11-alpine

# install dependencies
WORKDIR /opt
COPY package.json yarn.lock ./
RUN yarn --production

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
WORKDIR /opt/app
COPY . /opt/app

EXPOSE 5000

CMD yarn start
