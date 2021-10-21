const db = require("../models");
//const foodCategoryModel = require("../models/foodCategory.model");
const Goal = db.goals;
const User = db.users;
const FoodCategory = db.foodCategories;
const Food = db.foods;
const Meal = db.meals;
const Objective = db.objectives;
const Op = db.Sequelize.Op;
var atoms = require('../atoms');

function isGoalDataValid(aGoal){
  if (!aGoal.name || !aGoal.dateStart || (aGoal.totalCalories == 0 && !aGoal.objectives) || !atoms.isDateOk(aGoal.dateStart) || !isTotalCaloriesGreaterThanSumCalories(aGoal)) {
    return 0;
  }
  return 1;
}

function isTotalCaloriesGreaterThanSumCalories(aGoal){
  if(aGoal.totalCalories == 0 || !aGoal.objectives){
    //Goal is not based on totalCalories or there are no objectives
    return 1;
  }
  let caloriesSum = 0;
  aGoal.objectives.forEach(objective =>{
    caloriesSum += objective.objectiveCalories;
  })
  if(caloriesSum > aGoal.totalCalories){
    return 0;
  }
  return 1;
}

//Formateo de data de GET a enviar
function formatGetData(goals){
  var replyData = [];
  //Tengo que, para cada goal, utilizar sus objectives
  goals.forEach(goal => {
    var goalData = 
    {
      name: goal.name,
      objectives: [],
      dateStart: goal.dateStart,
      totalCalories: goal.totalCalories,
      userId: goal.userId,
      goalId: goal.goalId
    };
    goal.FoodCategories.forEach(foodCategory => {
      var objectiveData = 
      {
        foodCategoryId: foodCategory.Objective.foodCategoryId,
        goalId: foodCategory.Objective.goalId,
        objectiveCalories: foodCategory.Objective.objectiveCalories,
        currentCalories: 0,
        foodCategory: 
        {
          name: foodCategory.name,
          foodCategoryId: foodCategory.foodCategoryId
        }
      }
      //Tengo que saber cuantas calorias me piden en el objective, y cuantas voy por ahora..
      foodCategory.Food.forEach(food => {
        var foodCalories = food.caloriesPerServing;
        //Tengo que contar la cantidad de calorias por cada comida del FoodCategory
        food.Meals.forEach(meal => {
          objectiveData.currentCalories += (meal.FoodMeal.quantity * foodCalories);
        })
      })
      goalData.objectives.push(objectiveData);

    })
    replyData.push(goalData);
  })
  return replyData;
}

// Create and Save a new Goal
exports.create = async (req, res) => {
   // Validate request
   if (!req.query.userId) {
    res.status(400).send({
      message: "No userId provided."
    });
    return;
  }
  if (!isGoalDataValid(req.body)) {
    res.status(400).send({
      message: "Bad Goal format."
    });
    return;
  }
  //Check if Goal already exists for that month
  
  let goalExists = await Goal.findOne({where: {dateStart: new Date(req.body.dateStart), userId: req.query.userId}});
  if (goalExists){
    res.status(400).send({
      message: "Goal already exists for that Date."
    });
    return;
  }

  // Create a Goal
  const goal = {
    name: req.body.name,
    dateStart: new Date(req.body.dateStart),
    totalCalories: req.body.totalCalories
  };

  //Add it to the user and finally to the db
  let aUser = await User.findByPk(req.query.userId);
  if(!aUser){
    res.status(400).send(
      {message: "Cannot find the userId specified"}
    )
  }
  let theGoal = await Goal.create(goal);
  await aUser.addGoal(theGoal);
  //Le agrego los objectives, si tiene uno. Para eso, me traigo las foodCategories que haya precisado
  if(req.body.objectives){
    for (let objective of req.body.objectives){ //usando forEach no me deja utilizar awaits dentro.
      let theFoodCategory = await FoodCategory.findByPk(objective.foodCategoryId);
      if(theFoodCategory){
        await theGoal.addFoodCategory(theFoodCategory, {through: {objectiveCalories: objective.objectiveCalories}});
      }
    }
  }
 
  this.findGoals(req, res);
    
};

// Retrieve Goals from the database.
exports.findGoals = (req, res) => {
  var condition;
  if(req.body.userId){ //Esto es por si me pinguean desde el post.
    req.query.userId = req.body.userId;
  }

  if(req.query.goalId){
    //Find a goal by its id
    condition = {goalId: req.query.goalId}  
  }
  else {
    if (!req.query.userId){
      res.status(400).send(
        {message: "No parameters provided."}
      )
    }
    condition = { userId: req.query.userId };
    }

    //Busco todos los goals
    Goal.findAll(
      {
        where: condition,
        include: {model: FoodCategory, include: {model: Food, include: Meal}}
      })
      .then(data => {
        //Formateo de data a enviar
        res.send(formatGetData(data));
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Error while retrieving goals."
        });
      });
};

// Update a Goal by the id in the request
exports.update = async (req, res) => {
  if(!req.query.goalId || !req.query.userId){
    res.status(400).send({
      message: "No goalId or userId provided."
    });
    return;
  }
  const goalId = req.query.goalId;

  if(!isGoalDataValid(req.body)){
    res.status(400).send({
      message: "Bad Goal format. Check your input"
    });
    return;
  }

  //Find old Goal
  const theGoal = await Goal.findOne({
    where: {
      goalId: goalId
    },
    include: {model: FoodCategory, include: {model: Food, include: Meal}}
  });

  if(theGoal.dateStart <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)){
    res.status(400).send({
      message: "Cannot edit a past or current goal."
    });
    return;
  }

  if(new Date(req.body.dateStart) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)){
    res.status(400).send({
      message: "Cannot edit a past or current goal."
    });
    return;
  }
  //Check if there is another goal in the future
  const checkGoal = await Goal.findOne({
    where: {
      dateStart: new Date(req.body.dateStart),
      goalId: {[Op.not]: req.query.goalId},
      userId: req.query.userId
    }
  });
  if(checkGoal){
    res.status(400).send({
      message: "Goal already associated with provided date."
    });
    return;
  }

  //Update basic goal data
  theGoal.name = req.body.name;
  theGoal.dateStart = new Date(req.body.dateStart);
  theGoal.totalCalories = req.body.totalCalories;
  await theGoal.save();

  if(theGoal.FoodCategories){
    //Delete old objective data if it had any
    await db.objectives.destroy(
      {where: {goalId: goalId}}
    );
    await theGoal.reload();
    //Add all new objectives, if there are any
    if(req.body.objectives){
      for (let objective of req.body.objectives){ //can't use awaits with forEach, here's a workaround.
        let theFoodCategory = await FoodCategory.findByPk(objective.foodCategoryId);
        if(theFoodCategory){
          await theGoal.addFoodCategory(theFoodCategory, {through: {objectiveCalories: objective.objectiveCalories}});
        }
      }
    }

  }
  await theGoal.save();
  this.findGoals(req, res);
}

// Delete a Goal with the specified goalId in the request
exports.delete = async (req, res) => {
    if(!req.query.goalId || !req.query.userId){
      res.status(400).send({
        message: "No goalId or userId provided."
      });
      return;
    }
    const goalId = req.query.goalId;

    //Delete associated objectives..
    await Objective.destroy({
      where: {goalId: goalId}
    })
    //..Then delete goal.
    Goal.destroy({
      where: { goalId: goalId }
    })
      .then(num => {
        if (num == 1) {

          req.query.goalId = null;

          this.findGoals(req, res);

        } else {
          res.status(400).send({
            message: `Cannot delete Goal with goalId=${goalId}. Maybe Goal was not found!`
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Could not delete User with goalId=" + goalId
        });
      });
};

