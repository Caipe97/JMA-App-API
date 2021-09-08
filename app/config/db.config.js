var fs = require('fs');
var deployType;
try{
  deployType = fs.readFileSync('./deployType.txt', 'utf8');
  console.log("Data: ", deployType.toString());
  deployType = deployType.toString();
}
catch(e){
  console.log('Error: ', e.stack);
}

var host;
var user;
var password;
var db;

switch(deployType){

  case "local":
    host = "localhost";
    user = "jmaadmin";
    password = "hola1234";
    db = "productionDB";
    break;

  case "prod":
    host = "ec2-18-214-238-28.compute-1.amazonaws.com";
    user = "felwwwxailwhga";
    password = "e2c3d193ad75dc375be583af8e59468633feef75e6dae94515eb8c39f1b705d5";
    db = "d8k6n6tld23bad";
    break;

  default: //default es el modo test
    host = "ec2-34-196-238-94.compute-1.amazonaws.com";
    user = "lubkbmpwbxxakv";
    password = "be26288ddd5db110d51f01fb07cee35d4150cd26964effdde53717b4ccc84938";
    db = "db713h9rm2p329";
    break;
}


  module.exports = {
    HOST: host,
    USER: user,
    PASSWORD: password,
    DB: db,
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

/*
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
  */