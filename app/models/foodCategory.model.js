module.exports = (sequelize, Sequelize) => {
    const FoodCategory = sequelize.define("FoodCategory", {
      foodCategoryId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
      },
      name: {
        type: Sequelize.STRING
      }
    });
    return FoodCategory;
  };
  