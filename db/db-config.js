const Mongoose = require('mongoose');

const connectionString = 
  `mongodb://${process.env.DB_HOST || `localhost`}/${process.env.DB_NAME || `chat`}`

try {
  Mongoose.connect(connectionString, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
  });
} catch (error) {
  console.log("Database connection error:", error)
}

module.exports = { Mongoose };
