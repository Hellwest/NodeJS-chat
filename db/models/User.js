const Sequelize = require('sequelize');
const sequelize = require('../DBConnect');

const User = sequelize.define('user', {
	userid: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	username: {
		type: Sequelize.STRING,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING(60),
		allowNull: false
	}
});

User.sync();

module.exports = User;
