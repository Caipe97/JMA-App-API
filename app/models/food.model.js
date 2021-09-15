module.exports = (sequelize, Sequelize) => {
    const Food = sequelize.define("Food", {
      foodId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
      },
      name: {
        type: Sequelize.STRING
      },
      recommendedServing: { //Expresado en gramos
        type: Sequelize.INTEGER
      },
      caloriesPerServing: { //Expresado en cal/gramo
        type: Sequelize.INTEGER
      },
    });
    return Food;
  };
  