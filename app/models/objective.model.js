module.exports = (sequelize, Sequelize) => {
    const Objective = sequelize.define("Objective", {
      objectiveCalories: { //representa cantidad de cierta food en una meal
        type: Sequelize.INTEGER
      }
    });
    return Objective;
  };
  