module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      name: {
        type: Sequelize.STRING
      },
      surname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      birthday: {
        type: Sequelize.DATE
      },
      weight: {
        type: Sequelize.FLOAT
      },
      height: {
        type: Sequelize.FLOAT
      }

    });
  
    return User;
  };
  