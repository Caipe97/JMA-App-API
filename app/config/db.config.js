module.exports = {
    HOST: "localhost",
    USER: "jmaadmin",
    PASSWORD: "hola1234",
    DB: "testDB",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };