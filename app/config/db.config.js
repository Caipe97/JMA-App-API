module.exports = {
    HOST: "ec2-18-214-238-28.compute-1.amazonaws.com",
    USER: "felwwwxailwhga",
    PASSWORD: "e2c3d193ad75dc375be583af8e59468633feef75e6dae94515eb8c39f1b705d5",
    DB: "d8k6n6tld23bad",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };