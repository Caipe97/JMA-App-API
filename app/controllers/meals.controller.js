
const db = require("../models");
const Meal = db.meals;
const User = db.users;
const Food = db.foods;
const FoodMeal = db.foodsMeals;
//const FoodMeal = db.foodsMeals;
const Op = db.Sequelize.Op;
var atoms = require('../atoms');

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
              updatedAt: food.updatedAt,
              foodCategoryId: food.foodCategoryId
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
              updatedAt: food.updatedAt,
              foodCategoryId: food.foodCategoryId
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
   //console.log(req.body);
   if (!req.body.name  || !req.body.dateEaten || !req.query.userId ) {
    
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
    //Check date format
    if(!atoms.isDateOk(req.body.dateEaten)){
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


  this.findMeals(req, res);

}
catch(err){
  //console.log(err);
  res.status(500).send({
    message:
      err.message || "Error while creating new Meal."
  });

}
};

// Retrieve all meals from an user

exports.findMeals = (req, res) => {


  if (req.query.userId){
    var condition = [{userId: req.query.userId}];

    if(req.query.dateStart){
      if (!atoms.isDateOk(req.query.dateStart)){
        res.status(400).send({
          message: "Bad dateStart"
        })
      }
      if(req.query.dateEnd){
        //Validar que funcione dateEnd
        if (!atoms.isDateOk(req.query.dateEnd)){
          res.status(400).send({
            message: "Bad dateEnd"
          })
        }

        //Ambos dateStart y dateEnd
        condition.push({
          dateEaten: {
            [Op.and]: {
              [Op.gte]: new Date(req.query.dateStart),
              [Op.lte]: new Date(req.query.dateEnd)
            }}
        })
      }
      else{
        //Sólo dateStart
        condition.push({
          dateEaten: {[Op.gte]: new Date(req.query.dateStart)}
        });
      }
    }
    else if(req.query.dateEnd){ 
      //Sólo dateEnd
      condition.push({
        dateEaten: {[Op.lte]: new Date(req.query.dateEnd)}
      })

    }
    //Busco todos los meals segun un userId
    const userId = req.query.userId;

    Meal.findAll({ 
      where: condition,
      include: Food
     })
      .then(data => {
        if(!data){
          res.status(400).send(
            {message: "No meals found for userId = " + userId}
          )
          return;
        }
        //Happy path
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

    if (!atoms.isDateOk(dateEaten)){
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
      if(!theMeal){
        res.status(400).send(
          {message: "Error finding meal"}
        )
        return;
      }
    //Le updateo los parametros "simples" (que no requieren asociación)

    req.query.userId = theMeal.userId;

    theMeal.name = name;
    theMeal.dateEaten = new Date(dateEaten);
    await theMeal.save();
    if(req.body.FoodList){
      //Le destruyo las foods existentes y le agrego las que me pasaron 
      await db.foodsMeals.destroy(
        {where: {mealId: mealId}}
      )
      await theMeal.reload();
      for(const ingredient of req.body.FoodList){
  
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
exports.delete = async (req, res) => {
    //console.log(req);
    if(!req.query.mealId){
      res.status(400).send({
        message: `No mealId parameter`
      });
    }
    const mealId = req.query.mealId;

    //Elimino los foodsMeals correspondientes.
    await FoodMeal.destroy({
      where: {mealId: mealId}
    });

    Meal.destroy({
      where: { mealId: mealId }
    })
      .then(num => {
        if (num == 1) {
          //Tengo que sendear todos los meals del user, si es que me pasaron el userId
          if(req.query.userId){
            req.query.mealId = null;
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

exports.graphBarData = async (req, res) => {
  if(!req.query.userId){
    res.status(400).send({
      message: "No userId provided"
    })
  }
//Tengo que buscar los meals del usuario del ultimo año
const theMeals = await Meal.findAll({ 
  where: {
    userId: req.query.userId,
    dateEaten: {[Op.gte]: new Date(new Date().setMonth(new Date().getMonth()-11))}},
  include: Food
 });

 let graphBarReply = {
   labels: [],
   data: []
 }
 //Organizo en meses a las distintas Meals
 for(let i= 0; i<=11; i++){
  let dateToCheck = new Date();
  dateToCheck.setMonth(dateToCheck.getMonth() - 11 + i);


  //Me creo el objeto que voy a pushear al array
  graphBarReply.labels[i] = dateToCheck.toLocaleString('es-ES', { month: 'long' }) + " " + dateToCheck.getFullYear();
  let calorieCount = 0;

  //Busco en todas las meals cuales pertenecen a este mes
  theMeals.forEach(meal => {
    //Check si se esta en el mes correspondiente

    if(((meal.dataValues.dateEaten).getMonth() == dateToCheck.getMonth()) && (meal.dataValues.dateEaten).getFullYear() == dateToCheck.getFullYear()){
      //Agrego las calorias de todos los foods

      meal.dataValues.Food.forEach(food => {

        //Sumo el contenido calorico de aquella comida
        calorieCount += food.dataValues.caloriesPerServing * food.dataValues.FoodMeal.dataValues.quantity;
      })
    }
    
  });
  graphBarReply.data[i] = calorieCount;

 }
 res.send(graphBarReply);

};
