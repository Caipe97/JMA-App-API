const db = require("../models");
const Meal = db.meals;
const User = db.users;
const Op = db.Sequelize.Op;

function isDateOk(dateString){
  if(isNaN(new Date(dateString))){
    return 0;
  }
  return 1;
}

// Create and Save a new Meal
exports.create = async (req, res) => {
   // ValmealIdate request
   //console.log(req.body);
   if (!req.body.name || !req.body.gramAmount || !req.body.dateEaten || !req.query.userId ) {
    
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
    //Check date format
    if(!isDateOk(req.body.dateEaten)){
      res.status(400).send({
        message: "Bad Date Format!"
      });
    }

  // Create a Meal
  const meal = {
    name: req.body.name,
    gramAmount: parseInt(req.body.gramAmount),
    dateEaten: new Date(req.body.dateEaten),
  };
try{
  const aUser =  await User.findByPk(req.query.userId);
  const aMeal =  await Meal.create(meal);

  await aUser.addMeal(aMeal);

  //El hack mas horrible de todos...
  Meal.findByPk(aMeal.mealId)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error sending a Meal with mealId=" + aMeal.mealId
        });
      });
}
catch(err){
  res.status(500).send({
    message:
      err.message || "Error while creating new Meal."
  });

}


};

// Retrieve all meals from an user

exports.findMeals = (req, res) => {

  if (req.query.userId){
    //Busco todos los meals segun un userId
    const userId = req.query.userId;
    var condition = {userId: userId};

    Meal.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Error while retrieving Meals."
        });
      });
  }
  else if (req.query.mealId){
    //Busco un meal segun su id
        const mealId = req.query.mealId;
    
        Meal.findByPk(mealId)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message: "Error retrieving Meal with mealId=" + mealId
            });
          });
  }
  else{
    //error
    res.status(400).send({
      message: "bad parameters"
    });
  }


  
};

// Retrieve all meals

/*exports.findAll = (req, res) => {

  Meal.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error while retrieving Meals."
      });
    });
};*/

// Find a single Meal with an mealId


// Update a Meal by the mealId in the request
exports.update = (req, res) => {
    const mealId = req.query.mealId;

    Meal.update(req.body, {
      where: { mealId: mealId }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Meal was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Meal with mealId=${mealId}. Maybe Meal was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Error updating Meal with mealId=" + mealId
        });
      });
};

// Delete a Meal with the specified mealId in the request
exports.delete = (req, res) => {
    //console.log(req);
    const mealId = req.body.mealId;

    Meal.destroy({
      where: { mealId: mealId }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Meal was deleted successfully!",
            deletedMealID: mealId,
          });
        } else {
          console.log(num);
          res.status(400).send({
            message: `Cannot delete Meal with mealId=${mealId}. Maybe Meal was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete User with mealId=" + mealId
        });
      });
};

