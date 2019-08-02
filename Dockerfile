FROM node:10

# install dependencies
WORKDIR /opt/app
COPY package.json yarn.lock ./

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY . /opt/app
RUN yarn

# set application PORT and expose docker PORT, 80 is what Elastic Beanstalk expects
ENV PORT 80
EXPOSE 80

CMD yarn && yarn start

# CMD [ "npm", "run", "start" ]