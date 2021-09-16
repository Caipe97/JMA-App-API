module.exports = (sequelize, Sequelize) => {
    const FoodMeal = sequelize.define("FoodMeal", {
      quantity: { //representa cantidad de cierta food en una meal
        type: Sequelize.INTEGER
      }
    });
    return FoodMeal;
  };
  