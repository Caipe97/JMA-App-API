const db = require("../models");
const Record = db.records;
const Op = db.Sequelize.Op;

// Create and Save a new Record
exports.create = (req, res) => {
   // Validate request
   console.log(req.body);
   if (!req.body.foodName || !req.body.gramAmount || !req.body.dateEaten || !req.body.userID ) {
    
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
    //Check date format
    try{
      let aDate = new Date(req.body.dateEaten);
    }
    catch (err){
      res.status(400).send({
        message: "Bad Date Format"
      });
      return;
    };

  // Create a Record
  const record = {
    foodName: req.body.foodName,
    gramAmount: parseInt(req.body.gramAmount),
    userID: parseInt(req.body.userID),
    dateEaten: new Date(req.body.dateEaten),
  };

  // Save Record in the database
  Record.create(record)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error while creating new Record."
      });
    });
};

// Retrieve all Records from the database. CAMBIAR PARA HACER UN RETRIEVE SEGUN UN USERID
exports.findAll = (req, res) => {
    const foodName = req.query.foodName;
    var condition = foodName ? { name: { [Op.iLike]: `%${foodName}%` } } : null;
  
    Record.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Error while retrieving Records."
        });
      });
};

// Find a single Record with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Record.findByPk(id)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Record with id=" + id
        });
      });
};

// Update a Record by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Record.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Record was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Record with id=${id}. Maybe Record was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Record with id=" + id
        });
      });
};

// Delete a Record with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Record.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Record was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Record with id=${id}. Maybe Record was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete User with id=" + id
        });
      });
};

