module.exports = (sequelize, Sequelize) => {
    const Meal = sequelize.define("Meal", {
      mealId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
      },
      name: {
        type: Sequelize.STRING
      },
      gramAmount: {
        type: Sequelize.INTEGER
      },
      dateEaten: {
        type: Sequelize.DATE
      },
    });
  
    return Meal;
  };
  