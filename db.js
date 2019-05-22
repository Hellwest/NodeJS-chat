const Sequelize = require('sequelize');
const sequelize = require('./db/DBConnect.js');
const User = require('./db/models/User');
const ChatHistory = require('./db/models/ChatHistory');
const Op = Sequelize.Op;

async function findUser(login, password) {
	try {
		var result = await User.findOne({
			attributes: ['username', 'password'],
			where: {
				[Op.and]: {
					username: { [Op.like]: login },
					password: { [Op.like]: password }
				}
			}
		});
	} catch (error) {
		console.log('Error:', error);
	} finally {
		return result;
	}
}

async function addUser(login, password) {
	try {
		let found = await User.findAll({
			where: { username: { [Op.like]: login } }
		});
		console.log('Username found:', found, typeof found);
		if (!found.length) {
			try {
				User.create({ username: login, password });
				return true;
			} catch (e) {
				console.log('Error inserting new login:', e);
			}
		} else throw 'Username is not unique';
	} catch (error) {
		console.log('Registation error:', error);
		return false;
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
	findUser,
	addUser,
	storeMessage,
	getChatHistory
};
