const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./app/models");
const app = express();

let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;

chai.use(chaiHttp);



var corsOptions = {
  origin: "http://localhost:8081"
};

const dropDB = 0;

switch (dropDB){
  case 1:
    db.sequelize.sync({ force: true }).then(() => {
      console.log("Drop and re-sync db.");
    });
  default:
    db.sequelize.sync().then(() => {
      console.log("sync db.");
    });
}

//app.use(cors(corsOptions));
app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "API JMA Group Ltd." });
});

module.exports = app;



require("./app/routes/user.routes")(app);
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
