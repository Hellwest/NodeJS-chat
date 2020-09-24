const { Mongoose } = require('../db-config');

const MessageSchema = Mongoose.Schema({
  time: {
		type: Date,
    defaultValue: Date.now(),
    required: true,
    get: (time) => {
      const date = new Date(time);

      date.setHours(date.getHours() + 4);
      const month = date.getMonth();
      const day = date.getDate();
      const year = date.getFullYear();
      const hours = ('0' + date.getHours()).slice(-2);
      const minutes = ('0' + date.getMinutes()).slice(-2);
      const seconds = ('0' + date.getSeconds()).slice(-2);

      return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
    }
	},
	username: {
		type: String,
		required: true
	},
	text: {
		type: String,
		required: true
	}
}, {
  timestamps: true,
  toObject: { getters: true },
});

const Message = Mongoose.model("Message", MessageSchema)

module.exports = Message;
