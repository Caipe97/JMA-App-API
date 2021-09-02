const db = require("../models");
const Food = db.foods;
const Op = db.Sequelize.Op;

// Create and Save a new Food
exports.create = (req, res) => {
   // Validate request
   if (!req.body.name ) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Food
  const food = {
    name: req.body.name,
  };

  // Save Food in the database
  Food.create(food)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error while creating new Food."
      });
    });
};

// Retrieve all Foods from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null;
  
    Food.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Error while retrieving foods."
        });
      });
};

// Find a single food with an id
exports.findOne = (req, res) => {
    const id = req.body.id;

    Food.findByPk(id)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving food with id=" + id
        });
      });
};

// Update a Food by the id in the request
exports.update = (req, res) => {
    const id = req.body.id;

    Food.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Food was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Food with id=${id}. Maybe Food was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Food with id=" + id
        });
      });
};

// Delete a Food with the specified id in the request
exports.delete = (req, res) => {
    const id = req.body.id;

    Food.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Food was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Food with id=${id}. Maybe Food was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete User with id=" + id
        });
      });
};

// Delete all Foods from the database.
exports.deleteAll = (req, res) => {
    Food.destroy({
        where: {},
        truncate: false
      })
        .then(nums => {
          res.send({ message: `${nums} Foods were deleted successfully!` });
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while removing all Foods."
          });
        });
};

