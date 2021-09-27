const db = require("../models");
const Food = db.foods;
const User = db.users;
const Op = db.Sequelize.Op;

// Create and Save a new Food
exports.create = async (req, res) => {
   // Validate request
   if (!req.body.name || !req.body.recommendedServing || !req.body.caloriesPerServing ) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Food
  const food = {
    name: req.body.name,
    recommendedServing: req.body.recommendedServing,
    caloriesPerServing: req.body.caloriesPerServing
  };

  //Si viene con un userId, se trata de un custom food, hay que guardarlo como tal
  if(req.body.userId){
    let aUser;
    try{
      aUser = await User.findByPk(req.body.userId);
      //console.log(aUser);
    }
    catch(err){
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Error getting user with that Id"
      });
    }
    theFood = await Food.create(food);
    await aUser.addFood(theFood);
  }
  else{

    // Save Food in the database
    Food.create(food)
    .then(data => {
      this.findFoods(req,res);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error while creating new Food."
      });
    });

    
  }
  this.findFoods(req, res);
  
};

// Retrieve Foods from the database.
exports.findFoods = (req, res) => {

  if(req.query.foodId){
    //Busco 1 food por su id
    const foodId = req.query.foodId;

    Food.findByPk(foodId)
      .then(data => {
        if(!data){
          res.status(400).send({
            message: "Food not Found"
          })
        }
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving food with foodId=" + foodId
        });
      });

  }
  else {
    //Busco todos los foods

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

  }
    
};

// Update a Food by the id in the request
exports.update = (req, res) => {
    const foodId = req.query.foodId;

    Food.update(req.body, {
      where: { foodId: foodId }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Food was updated successfully."
          });
        } else {
          res.status(400).send({
            message: `Error updating Food with foodId=${foodId}. Maybe Food was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Food with foodId=" + foodId
        });
      });
};

// Delete a Food with the specified foodId in the request
exports.delete = (req, res) => {
    const foodId = req.query.foodId;
    console.log("ID: "+foodId);

    Food.destroy({
      where: { foodId: foodId }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Food was deleted successfully!"
          });
        } else {
          res.status(400).send({
            message: `Cannot delete Food with foodId=${foodId}. Maybe Food was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete User with foodId=" + foodId
        });
      });
};

