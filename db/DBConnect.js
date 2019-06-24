const Sequelize = require('sequelize');

const sequelize = new Sequelize(
	'postgres://dsuewvsykwbxob:c271c5735d3111e4ef1ce2c34b9fc1d6cb756d7ce2b7b9e4aac80df18cd0487b@ec2-54-227-245-146.compute-1.amazonaws.com:5432/da3t7s27m1mmul', {
		logging: false,
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000
		}
	}
);

try {
	sequelize.authenticate();
} catch (error) {
	console.log(error);
}

module.exports = sequelize;
