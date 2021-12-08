const db = require("../models");
const FoodCategory = db.foodCategories;
const Goal = db.goals;
const User = db.users;
const Op = db.Sequelize.Op;

// Create and Save a new FoodCategory
exports.create = async (req, res) => {
   // Validate request
   if (!req.body.name) {
    res.status(400).send({
      message: "Name can not be empty!"
    });
    return;
  }
  //Chequear si existe la foodCategory en la BD
  
  // Create a FoodCategory
  const foodCategory = {
    name: req.body.name
  };

  //Si viene con un userId, se trata de un custom food, hay que guardarlo como tal
  if(req.body.userId){
    let aUser;
    try{
      aUser = await User.findByPk(req.body.userId);
    }
    catch(err){
      console.log(err);
      res.status(400).send({
        message:
          err.message || "Error getting user with that Id"
      });
    }
    theFoodCategory = await FoodCategory.create(foodCategory);
    await aUser.addFoodCategory(theFoodCategory);
  }
  else{

    // Save FoodCategory in the database
    await FoodCategory.create(foodCategory)
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error while creating new FoodCategory."
      });
    });

    
  }
  this.findFoodCategories(req, res);
  
};

// Retrieve FoodCategories from the database.
exports.findFoodCategories = (req, res) => {
  if(req.body.userId){ //Esto es por si me pinguean desde el post.
    req.query.userId = req.body.userId;
  }

  if(req.query.foodCategoryId){
    //Busco 1 food por su id
    const foodCategoryId = req.query.foodCategoryId;

    FoodCategory.findByPk(foodCategoryId)
      .then(data => {
        if(!data){
          res.status(400).send({
            message: "FoodCategory not Found"
          })
        }
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving food with foodCategoryId=" + foodCategoryId
        });
      });

  }
  else {
    //Si se pide un userId, se piden tambien los customFoodCategories
    var condition = req.query.userId ? {[Op.or]: [
                                        { userId: null },
                                        { userId: req.query.userId }
                                      ]} : {userId: null};
    }
    //Busco todos los foodCategories

  
    FoodCategory.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Error while retrieving foodCategories."
        });
      });
};

// Update a FoodCategory by the id in the request
exports.update = (req, res) => {
    const foodCategoryId = req.query.foodCategoryId;

    FoodCategory.update(req.body, {
      where: { foodCategoryId: foodCategoryId }
    })
      .then(num => {
        if (num == 1) {
            //elimino el foodCategoryId de la query para que encuentre todas luego
            req.query.foodCategoryId = null;
            this.findFoodCategories(req, res);

        } else {
          res.status(400).send({
            message: `Error updating FoodCategory with foodCategoryId=${foodCategoryId}. Maybe FoodCategory was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating FoodCategory with foodCategoryId=" + foodCategoryId
        });
      });
};

// Delete a FoodCategory with the specified foodCategoryId in the request
exports.delete = (req, res) => {
    const foodCategoryId = req.query.foodCategoryId;

    console.log("ID: "+foodCategoryId);

    FoodCategory.destroy({
      where: { foodCategoryId: foodCategoryId }
    })
      .then(num => {
        if (num == 1) {
          //Elimino los goals que hayan quedado sólo con la FoodCategory que se acaba de eliminar (ojo sólo los goals que tengan totalCalories en 0)
          let goalsToDelete = [];
          //Delete all empty meals (or meals that only had the now deleted food).
          Goal.findAll({
            where: { [Op.or]: [
              {totalCalories: 0},
              {totalCalories: null}
            ] },
            include: FoodCategory
          }).then(allGoals => {
            
            allGoals.forEach(goal => {
              if(goal.FoodCategories.length == 0){
                goalsToDelete.push(goal.goalId);
              }
            });
            goalsToDelete.forEach(goal => {
              Goal.destroy({where: {goalId: goal}})
            })
            
          }).then(hola =>{
            req.query.foodCategoryId = null;
            this.findFoodCategories(req, res);
          })



          //elimino el foodCategoryId de la query para que encuentre todas luego
            
        } else {
          res.status(400).send({
            message: `Cannot delete FoodCategory with foodCategoryId=${foodCategoryId}. Maybe FoodCategory was not found!`
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Could not delete User with foodCategoryId=" + foodCategoryId
        });
      });
};

