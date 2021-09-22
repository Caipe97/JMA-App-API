const { foods } = require("../models");
const db = require("../models");
const Meal = db.meals;
const User = db.users;
const Food = db.foods;
//const FoodMeal = db.foodsMeals;
const Op = db.Sequelize.Op;

function isDateOk(dateString){
  if(isNaN(new Date(dateString))){
    return 0;
  }
  return 1;
}


function parseMealMultipleResponse(data){

  //Función que recibe unas meals, le busca sus foods asociados y las cantidades de cada uno
  let retResponse = [];
  if(data == null){
    return retResponse;
  }

  data.forEach(meal => {

    let response = {
      mealId: meal.dataValues.mealId,
      name: meal.dataValues.name,
      dateEaten: meal.dataValues.dateEaten,
      userId: meal.dataValues.userId,
      FoodList: [] //Le agrego acá los foods que contiene luego...
    };
  
    if(meal.Food.length){ //Si data tiene Foods asociados..
      meal.Food.forEach(food => {
        response.FoodList.push(
          {
            quantity: food.FoodMeal.quantity,
            food: {
              foodId: food.foodId,
              name: food.name,
              recommendedServing: food.recommendedServing,
              caloriesPerServing: food.caloriesPerServing,
              createdAt: food.createdAt,
              updatedAt: food.updatedAt
            }
          }
        )
        
      });
    }
    retResponse.push(response);



  })

  return(retResponse);

}

function parseMealSingleResponse(data){

  //Función que recibe unas meals, le busca sus foods asociados y las cantidades de cada uno
    if(data == null){
      return {mealId: -1};
    }
    let response = {
      mealId: data.dataValues.mealId,
      name: data.dataValues.name,
      dateEaten: data.dataValues.dateEaten,
      userId: data.dataValues.userId,
      FoodList: [] //Le agrego acá los foods que contiene luego...
    };

    if(data == null){
      return response;
    }
  
    if(data.Food.length){ //Si data tiene Foods asociados..
      data.Food.forEach(food => {
        response.FoodList.push(
          {
            quantity: food.FoodMeal.quantity,
            food: {
              foodId: food.foodId,
              name: food.name,
              recommendedServing: food.recommendedServing,
              caloriesPerServing: food.caloriesPerServing,
              createdAt: food.createdAt,
              updatedAt: food.updatedAt
            }
          }
        )
        
      });
    }

  return(response);

}

// Create and Save a new Meal
exports.create = async (req, res) => {
   // Validate request
   console.log(req.body);
   if (!req.body.name  || !req.body.dateEaten || !req.query.userId ) {
    
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
    dateEaten: new Date(req.body.dateEaten),
  };
  

try{
  const aUser =  await User.findByPk(req.query.userId);
  const aMeal =  await Meal.create(meal);

  await aUser.addMeal(aMeal);

  //Agrego los foods al meal

  for(const ingredient of req.body.FoodList){

    let theFood = await Food.findByPk(ingredient.food.foodId);
    if(!theFood){
      res.status(400).send(
        {message: "No Food found with id" + ingredient.food.foodId}
      )
    }
    await aMeal.addFood(theFood, {through: {quantity: ingredient.quantity}});
  }

  //El hack mas horrible de todos...

  this.findMeals(req, res);

}
catch(err){
  console.log(err);
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

    Meal.findAll({ 
      where: {userId: userId},
      include: Food
     })
      .then(data => {
        if(!data){
          res.status(400).send(
            {message: "No meals found for userId = " + userId}
          )
          return;
        }

        let response = parseMealMultipleResponse(data);
        res.send(response);
      })
      .catch(err => {
        console.log(err)
        res.status(500).send({
          message:
            err.message || "Error while retrieving Meals."
        });
      });
  }
  else if (req.query.mealId){
    //Busco un meal segun su id..
        const mealId = req.query.mealId;
    
          Meal.findOne({
            where: {
              mealId: mealId
            },
            include: Food
          })
          .then(data => {
            if( data == null){
              res.status(400).send(
                {message: "No meal found with mealId= " + mealId}
              )
              return;
            }
            //Happy path
            //console.log("Data from query:");
            //console.log(data);
            let response = parseMealSingleResponse(data);            
            
            res.send(response);
          })
          .catch(err => {
            console.log(err);
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



// Update a Meal by the mealId in the request
exports.update = async (req, res) => {
    const mealId = req.query.mealId;

    //enlisto los updates
    const name = req.body.name;
    const dateEaten = req.body.dateEaten; //En string

    if (!isDateOk(dateEaten)){
      res.status(400).send(
        {message: "Bad date format"}
      )
    }

    //Tengo que encontrar el Meal
      const theMeal = await Meal.findOne({
        where: {
          mealId: mealId
        },
        include: Food
      });
      console.log(theMeal);
      if(!theMeal){
        res.status(400).send(
          {message: "Error finding meal"}
        )
        return;
      }
    //Le updateo los parametros "simples" (que no requieren asociación)
    console.log("ms1");

    req.query.userId = theMeal.userId;

    theMeal.name = name;
    theMeal.dateEaten = new Date(dateEaten);
    await theMeal.save();
    console.log("ms2");
    if(req.body.FoodList){
      //Le destruyo las foods existentes y le agrego las que me pasaron 
      //await theMeal.setFoods([]);
      await db.foodsMeals.destroy(
        {where: {mealId: mealId}}
      )
      await theMeal.reload();
      console.log("ms4");
      for(const ingredient of req.body.FoodList){
        console.log("ms5");
  
        let theFood = await Food.findByPk(ingredient.food.foodId);
        if(!theFood){
          res.status(400).send(
            {message: "No Food found with id" + ingredient.food.foodId}
          )
        }
        await theMeal.addFood(theFood, {through: {quantity: ingredient.quantity}});
      }
    }
    

    this.findMeals(req, res)
};

// Delete a Meal with the specified mealId in the request
exports.delete = (req, res) => {
    //console.log(req);
    if(!req.query.mealId){
      res.status(400).send({
        message: `No mealId parameter`
      });
    }
    const mealId = req.query.mealId;

    Meal.destroy({
      where: { mealId: mealId }
    })
      .then(num => {
        if (num == 1) {
          //Tengo que sendear todos los meals del user, si es que me pasaron el userId
          if(req.query.userId){
            this.findMeals(req, res);
          }
          else{
            res.send({
              message: "Meal was deleted successfully!",
              deletedMealID: mealId,
            });
          }
          
        } else {
          //console.log(num);
          res.status(400).send({
            message: `Cannot delete Meal with mealId=${mealId}. Maybe Meal was not found!`
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Could not delete User with mealId=" + mealId
        });
      });
};

