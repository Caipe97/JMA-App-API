const db = require("../models");
const FoodSuggestion = db.foodSuggestions;
const Op = db.Sequelize.Op;

// Create and Save a new FoodSuggestion
exports.create = (req, res) => {
   // Validate request
   if (!req.body.name || !req.body.recommendedServing || !req.body.caloriesPerServing ) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a FoodSuggestion
  const food = {
    name: req.body.name,
    recommendedServing: req.body.recommendedServing,
    caloriesPerServing: req.body.caloriesPerServing
  };

  // Save FoodSuggestion in the database
  FoodSuggestion.create(food)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error while creating new FoodSuggestion."
      });
    });
};

// Retrieve FoodSuggestions from the database.
exports.findFoodSuggestions = (req, res) => {

  if(req.query.foodSuggestionId){
    //Busco 1 food por su id
    const foodSuggestionId = req.query.foodSuggestionId;

    FoodSuggestion.findByPk(foodSuggestionId)
      .then(data => {
        if(!data){
          res.status(400).send({
            message: "FoodSuggestion not Found"
          })
        }
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving food with foodSuggestionId=" + foodSuggestionId
        });
      });

  }
  else {
    //Busco todos los foods

    const name = req.query.name;
    var condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null;
  
    FoodSuggestion.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Error while retrieving foods."
        });
      });

  }
    
};

// Update a FoodSuggestion by the id in the request
exports.update = (req, res) => {
    const foodSuggestionId = req.query.foodSuggestionId;

    FoodSuggestion.update(req.body, {
      where: { foodSuggestionId: foodSuggestionId }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "FoodSuggestion was updated successfully."
          });
        } else {
          res.status(400).send({
            message: `Error updating FoodSuggestion with foodSuggestionId=${foodSuggestionId}. Maybe FoodSuggestion was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating FoodSuggestion with foodSuggestionId=" + foodSuggestionId
        });
      });
};

// Delete a FoodSuggestion with the specified foodSuggestionId in the request
exports.delete = (req, res) => {
    const foodSuggestionId = req.query.foodSuggestionId;
    console.log("ID: "+foodSuggestionId);

    FoodSuggestion.destroy({
      where: { foodSuggestionId: foodSuggestionId }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "FoodSuggestion was deleted successfully!"
          });
        } else {
          res.status(400).send({
            message: `Cannot delete FoodSuggestion with foodSuggestionId=${foodSuggestionId}. Maybe FoodSuggestion was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete User with foodSuggestionId=" + foodSuggestionId
        });
      });
};

