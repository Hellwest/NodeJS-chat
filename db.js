const {Pool} = require('pg');

const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'chat',
    password: '',
    port: 5432,
}

async function testLogin(login) {
    var pool = new Pool(config);
    var client = await pool.connect();
    
    try {
        var result = await client.query('select * from users where username = $1', [login])
    } catch (error) {
        console.log(error);
    } finally {
        client.release();
        return await result.rows[0];
    }
}

async function addUser(login, password) {
    var pool = new Pool(config);
    var client = await pool.connect();

    try {
        await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [login, password])
    } catch (err) {
        console.log("Error inserting new login:",err);
    } finally {
        client.release();
    }
}

async function storeMessage(username, msg) {
    var pool = new Pool(config);
    var client = await pool.connect();

    try {
        await client.query('INSERT INTO chathistory (username, message) VALUES ($1, $2)', [username, msg]);
    } catch (e) {
        console.log("Error occured while inserting:", e)
     } finally {
        client.release();
    }
}

async function getChatHistory() {
    var pool = new Pool(config);
    var client = await pool.connect();

    try {
        var result = await client.query('SELECT * FROM chathistory');
        for (let i=0; i<result.rowCount; i++) {
            result.rows[i].time = JSON.stringify(result.rows[i].time);
            let date = result.rows[i].time.substring(1,11);
            let time = result.rows[i].time.substring(12,20);
            let fancy = date + ' ' + time;
            result.rows[i].time = fancy;
        }
    } catch (e) {
        console.log("Error occured while retrieving data:",e);
    } finally {
        client.release();
        return result.rows;
    }
}

module.exports = {
    testLogin,
    addUser,
    storeMessage,
    getChatHistory,
}