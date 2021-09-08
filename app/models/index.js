var fs = require('fs');
var deployType;

try{
  deployType = fs.readFileSync('./deployType.txt', 'utf8');
  console.log("Data: ", deployType.toString());
  deployType = deployType.toString();
}
catch(e){
  console.log('Error: ', e.stack);
}

const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
var sequelize;

switch (deployType){
  case 'test':
    sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
      host: dbConfig.HOST,
      dialect: dbConfig.dialect,
      operatorsAliases: false,
      //dialectOptions: dbConfig.dialectOptions,
      pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
      },
      storage: './db/test.db'
    });
    break;
  default:
    sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
      host: dbConfig.HOST,
      dialect: dbConfig.dialect,
      operatorsAliases: false,
      dialectOptions: dbConfig.dialectOptions,
      pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
      }
    })


}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);
db.foods = require("./food.model.js")(sequelize, Sequelize);
db.records = require("./record.model.js")(sequelize, Sequelize);


module.exports = db;
