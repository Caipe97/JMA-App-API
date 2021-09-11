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

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
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
};

// Find a single name with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    User.findByPk(id)
      .then(data => {
        if(!data){
          res.status(404).send(
            {message: "Not Found"}
          )
        }
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving user with id=" + id
        });
      });
};

// Update a User by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    console.log(id);

    User.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "User was updated successfully."
          });
        } else {
          res.status(404).send({
            message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating User with id=" + id
        });
      });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  console.log(req);
    const id = req.params.id;

    User.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "User was deleted successfully!"
          });
        } else {
          res.status(404).send({
            message: `Cannot delete User with id=${id}. Maybe User was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete User with id=" + id
        });
      });
};


// Log in a user
exports.login = (req, res) => {
  console.log(req.body);
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
      res.send(data); //envio el perfil del usuario...
    })
    .catch(err => {
      res.status(500).send({
        message: "Error logging user"
      });
    });
};
