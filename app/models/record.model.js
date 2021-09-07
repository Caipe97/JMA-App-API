module.exports = (sequelize, Sequelize) => {
    const Record = sequelize.define("food", {
      foodName: {
        type: Sequelize.STRING
      },
      gramAmount: {
        type: Sequelize.INTEGER
      },
      dateEaten: {
        type: Sequelize.DATE
      },
      userID: {
        type: Sequelize.INTEGER
      }
    });
  
    return Record;
  };
  