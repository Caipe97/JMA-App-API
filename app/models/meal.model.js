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
      dateEaten: {
        type: Sequelize.DATE
      },
    });
  
    return Meal;
  };
  