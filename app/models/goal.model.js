

module.exports = (sequelize, Sequelize) => {
    const Goal = sequelize.define("Goal", {
      goalId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
      },
      name: {
        type: Sequelize.STRING
      },
      dateStart: {
        type: Sequelize.DATE,
      },
      totalCalories: {
        type: Sequelize.INTEGER,
      },
    });
  
    return Goal;
  };
  