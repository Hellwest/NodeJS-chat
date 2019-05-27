const Sequelize = require('sequelize');
const sequelize = require('../DBConnect');

const ChatHistory = sequelize.define(
	'chathistory',
	{
		msgid: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		time: {
			type: Sequelize.DATE,
			get: function() {
				let date = new Date(this.getDataValue('time'));
				date.setHours(date.getHours() + 4);
				let month = date.getMonth();
				let day = date.getDate();
				let year = date.getFullYear();
				let hours = ('0' + date.getHours()).slice(-2);
				let minutes = ('0' + date.getMinutes()).slice(-2);
				let seconds = ('0' + date.getSeconds()).slice(-2);
				return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
			}
		},
		username: {
			type: Sequelize.STRING,
			allowNull: false
		},
		message: {
			type: Sequelize.TEXT,
			allowNull: false
		}
	},
	{
		freezeTableName: true,
		timestamps: false
	}
);

module.exports = ChatHistory;
