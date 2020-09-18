FROM node:latest

# install dependencies
WORKDIR /opt/app
COPY package.json yarn.lock ./

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY . /opt/app
RUN yarn

EXPOSE 5000

CMD yarn && yarn start

# CMD [ "npm", "run", "start" ]