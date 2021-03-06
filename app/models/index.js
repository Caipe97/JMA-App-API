var fs = require('fs');
var deployType;

try{
  deployType = fs.readFileSync('./deployType.txt', 'utf8');
  //console.log("Data: ", deployType.toString());
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
      logging: false,
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
    case 'local':
    sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
      logging: false,
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

db.foods = require("./food.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.meals = require("./meal.model.js")(sequelize, Sequelize);
db.foodsMeals = require("./foodMeal.model.js")(sequelize, Sequelize);
db.foodCategories = require("./foodCategory.model.js")(sequelize, Sequelize);
db.goals = require("./goal.model.js")(sequelize, Sequelize);
db.objectives = require("./objective.model.js")(sequelize, Sequelize);

//Asociaciones//
db.users.hasMany(db.meals, {foreignKey: "userId"});
db.users.hasMany(db.foods, {foreignKey: "userId"});
db.users.hasMany(db.foodCategories, {foreignKey: "userId"});
db.users.hasMany(db.goals, {foreignKey: "userId"});

//
db.foodCategories.hasMany(db.foods, {foreignKey: "foodCategoryId"});

//
db.meals.belongsTo(db.users, {
  as: 'user',
  foreignKey: "userId"
});
db.meals.belongsToMany(db.foods, {through: db.foodsMeals, foreignKey: "mealId"});

db.foods.belongsToMany(db.meals, {through: db.foodsMeals, foreignKey: "foodId"});
//

db.goals.belongsToMany(db.foodCategories, {through: db.objectives, foreignKey: 'goalId'});
db.foodCategories.belongsToMany(db.goals, {through: db.objectives, foreignKey: 'foodCategoryId'});

//
module.exports = db;
