const db = require("../models");
const Food = db.foods;
const User = db.users;
const FoodCategory = db.foodCategories;
const Op = db.Sequelize.Op;

// Create and Save a new Food
exports.create = async (req, res) => {
   // Validate request
   if (!req.body.name || !req.body.recommendedServing || !req.body.caloriesPerServing) {
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

  //Creo la Food en la bd
  let theFood = await Food.create(food);

  //Si viene con un userId, se trata de un custom food, hay que guardarlo como tal
  if(req.body.userId){
    let aUser;
    aUser = await User.findByPk(req.body.userId);
    if(!aUser){
      res.status(400).send(
        {message: "Cannot find the userId specified"}
      )
    }
    await aUser.addFood(theFood);
  }
  //Si viene con un foodCategoryId, metemos la food ahi, sino es un uncategorized (foodCategoryId = null)
  if(req.body.foodCategoryId){
    let aFoodCategory = await FoodCategory.findByPk(req.body.foodCategoryId);
    if(!aFoodCategory){
      res.status(400).send(
        {message: "Cannot find the foodCategoryId specified"}
      )
    }
    await aFoodCategory.addFood(theFood);

  }

  this.findFoods(req, res);
  
};

// Retrieve Foods from the database.
exports.findFoods = (req, res) => {
  if(req.body.userId){ //Esto es por si me pinguean desde el post.
    req.query.userId = req.body.userId;
  }

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
    //Si se pide un userId, se piden tambien los customFoods, sino, solo los genericos
    var condition = req.query.userId ? {[Op.or]: [
                                        { userId: null },
                                        { userId: req.query.userId }
                                      ]} : {userId: null};
    }
    //Busco todos los foods

  
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

// Update a Food by the id in the request
exports.update = async (req, res) => {
    const foodId = req.query.foodId;


    //Hago la magia
    Food.update(req.body, {
      where: { foodId: foodId }
    })
      .then(num => {
        if (num == 1) {

          //Quito el foodId para que el findFoods me encuentre todos los demas
          req.query.foodId = null;

          this.findFoods(req, res);
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

          req.query.foodId = null;

          this.findFoods(req, res);

        } else {
          res.status(400).send({
            message: `Cannot delete Food with foodId=${foodId}. Maybe Food was not found!`
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Could not delete User with foodId=" + foodId
        });
      });
};

