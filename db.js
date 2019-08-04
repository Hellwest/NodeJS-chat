const Sequelize = require('sequelize');
const User = require('./db/models/User');
const ChatHistory = require('./db/models/ChatHistory');
const Op = Sequelize.Op;

async function testLogin(login) {
	try {
		var result = await User.findAll({
			attributes: ['username', 'password'],
			where: { username: { [Op.like]: login } }
		});
	} catch (error) {
		console.log('Error:', error);
	} finally {
		return result[0];
	}
}

async function addUser(login, password) {
	try {
		User.create({ username: login, password });
	} catch (e) {
		console.log('Error inserting new login:', e);
	}
}

async function storeMessage(username, message) {
	try {
		ChatHistory.create({ username, message });
	} catch (e) {
		console.log('Error inserting new message:', e);
	}
}

async function getChatHistory() {
	try {
		var result = await ChatHistory.findAll({
			attributes: ['time', 'username', 'message']
		});
	} catch (e) {
		console.log('Error retrieving chat history:', e);
	} finally {
		return result;
	}
}

module.exports = {
	testLogin,
	addUser,
	storeMessage,
	getChatHistory
};
