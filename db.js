const Sequelize = require('sequelize');
const sequelize = require('./db/DBConnect.js');
const User = require('./db/models/User');
const Message = require('./db/models/Message');

async function testLogin(login) {
	try {
		return await User.findOne({ username: login });
	} catch (error) {
		console.log('Error searching for a user:', error);
	}
}

async function addUser(login, password) {
	try {
		User.create({ username: login, password });
	} catch (error) {
		console.log('Error inserting new login:', error);
	}
}

async function storeMessage(username, text, time) {
	try {
		Message.create({ username, text, time });
	} catch (error) {
		console.log('Error inserting new message:', error);
	}
}

async function getChatHistory() {
	try {
		return await Message.find();
	} catch (error) {
		console.log('Error retrieving chat history:', error);
	}
}

module.exports = {
	testLogin,
	addUser,
	storeMessage,
	getChatHistory
};
