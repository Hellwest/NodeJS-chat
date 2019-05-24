const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:admin@postgres:5432/chat', {
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

try {
    sequelize.authenticate();
} catch (error) {
    console.log(error)
};

module.exports = sequelize;