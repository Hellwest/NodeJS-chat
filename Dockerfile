FROM node

# install dependencies
WORKDIR /opt/app
COPY package.json package-lock.json* ./
RUN npm cache clean --force && npm install

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY . /opt/app

# set application PORT and expose docker PORT, 80 is what Elastic Beanstalk expects
ENV PORT 80
EXPOSE 80

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && npm run start

# CMD [ "npm", "run", "start" ]