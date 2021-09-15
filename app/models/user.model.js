module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING
      },
      surname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING
      },
      gender: {
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
  