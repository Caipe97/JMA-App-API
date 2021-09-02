module.exports = (sequelize, Sequelize) => {
    const Food = sequelize.define("food", {
      name: {
        type: Sequelize.STRING
      }
    });
  
    return Food;
  };
  