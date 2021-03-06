const { Mongoose } = require('../db-config');

const UserSchema = Mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
}, {
  timestamps: true,
});

const User = Mongoose.model("User", UserSchema)

module.exports = User;
