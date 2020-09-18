const User = require('./db/models/User');
const Message = require('./db/models/Message');

const getUser = async (login) => {
	try {
		return await User.findOne({ username: login });
	} catch (error) {
		console.log('Error searching for a user:', error);
	}
}

const addUser = async (login, password) => {
	try {
		User.create({ username: login, password });
	} catch (error) {
		console.log('Error inserting new login:', error);
	}
}

const storeMessage = async (username, text, time) => {
	try {
		Message.create({ username, text, time });
	} catch (error) {
		console.log('Error inserting new message:', error);
	}
}

const getChatHistory = async () => {
	try {
		return await Message.find();
	} catch (error) {
		console.log('Error retrieving chat history:', error);
	}
}

module.exports = {
	getUser,
	addUser,
	storeMessage,
	getChatHistory
};
