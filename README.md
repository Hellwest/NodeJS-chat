# NodeJS-chat

## Description

Чат представляет собой общую чат-комнату: есть поле для ввода нового сообщения, история полученных сообщений (каждое сообщение содержит текст, время, автора), информация о пользователях, подключенных в данный момент.  
Клиент-серверное взаимодействие через вебсокеты.

## ONLINE APP

Heroku: <https://nodejs-chat-bravedev.herokuapp.com>

## Local installation

### Requirements

- [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/)
- [node](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/)

```bash
git clone https://github.com/Hellwest/NodeJS-chat.git
cd NodeJS-chat
npm install
```

## Launch

```bash
node server.js
```

or using Docker:

```bash
docker-compose up
```
