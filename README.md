# NodeJS-chat

## Local installation

```
$ git clone https://github.com/Hellwest/NodeJS-chat
$ cd NodeJS-chat
$ npm install
```

## Launch

```
$ node server.js
```

**Возможно, придётся изменить строку password в db.js, чтобы подключиться к базе данных**

## Local PostgreSQL db

```
create database chat;
\c chat;

create table users(
    userid serial primary key not null,
    username varchar(50) not null,
    password varchar(30) not null);

create table chathistory(
    msgid serial primary key not null,
    time timestamptz default current_timestamp,
    username varchar(50) not null,
    message text not null);
```
