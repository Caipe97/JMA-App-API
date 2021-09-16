const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

// Create and Save a new User
exports.create = (req, res) => {
   // Validate request
  if (!req.body.name || !req.body.surname || !req.body.email || !req.body.password || !req.body.gender || !req.body.weight || !req.body.height || !req.body.birthday) {

    res.status(400).send({
      message: "Content can not be empty!"
    });
    return
  }
    //Check date format

    let aDate = new Date(req.body.birthday);
    if(isNaN(aDate.getTime())){
      res.status(400).send({
        message: "Bad Date Format"
      });
    }

  // Create a User
  const user = {
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: req.body.password,
    birthday: new Date(req.body.birthday),
    gender: req.body.gender,
    weight: req.body.weight,
    height: req.body.height
  };

  // Save User in the database
  User.create(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error while creating new User."
      });
    });
};

// Retrieve  Users from the database.
exports.findUsers = (req, res) => {

    if(!req.query.userId || req.query.userId == ""){ //Quiero buscar todos
      const name = req.query.name;
    var condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null;
  
    User.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Error while retrieving users."
        });
      });
    }
    else{ //Quiero buscar uno
      const userId = req.query.userId;

    User.findByPk(userId)
      .then(data => {
        if(!data){
          res.status(400).send(
            {message: "Not Found"}
          )
        }
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving user with id=" + userId
        });
      });

    }
    
};


// Update a User by the id in the request
exports.update = (req, res) => {
    if(!req.query.userId){
      res.status(400).send({
        message: "no userId query parameter"
      })
    }
    const userId = req.query.userId;

    User.update(req.body, {
      where: { userId: userId }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "User was updated successfully."
          });
        } else {
          res.status(400).send({
            message: `Cannot update User with userid=${userId}. Maybe User was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating User with userid=" + userId
        });
      });
};

// Delete a User with the specified userid in the request
exports.delete = (req, res) => {
    const userId = req.query.userId;

    User.destroy({
      where: { userId: userId }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "User was deleted successfully!"
          });
        } else {
          res.status(400).send({
            message: `Cannot delete User with userId=${userId}. Maybe User was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete User with userId=" + userId
        });
      });
};


// Log in a user
exports.login = (req, res) => {
  if (!req.body.email || !req.body.password ) {
    res.status(400).send({
      message: "Login credentials incomplete"
    });
    return;
  }
  
  const email = req.body.email;
  const password = (req.body.password).toString();

  User.findOne({ where: { email: email, password: password } })
    .then(data => {
      if(!data){
        res.status(400).send({
          message: "No user found with given credentials"
        })
      }
      res.send(data); //envio el perfil del usuario...
    })
    .catch(err => {
      res.status(500).send({
        message: "Error logging user"
      });
    });
};
