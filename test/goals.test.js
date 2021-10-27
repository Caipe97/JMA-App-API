const db = require('../app/models');
const User = db.users;
const Goal = db.goals;
const Meal = db.meals;
const Food = db.foods;
const FoodCategory = db.foodCategories;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');
const { foodCategories } = require('../app/models');
const foodCategoryModel = require('../app/models/foodCategory.model');


//Testeo de /api/users
describe("api/goals", () => {
    beforeEach( async ()=> {
        //Elimino todo de la base de datos.
       await db.sequelize.sync({ force: true }).then(() => {
            //console.log("Drop and re-sync db.");
          });{ force: true }
    });

    describe("GET /goals", () => {
        it("should get all goals created by a user", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoals = [
                {name: "Goal1", dateStart: "2021-09"},
                {name: "Goal2", dateStart: "2021-10"}
            ];

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoals[0]);
            const anotherGoal = await Goal.create(testGoals[1]);

            //associations

            await aUser.addGoals([aGoal, anotherGoal]);

            //Hacer el Get
            let resGet = await request(app).get("/api/goals?userId=1");

            expect(resGet.status).to.equal(200);
            let reply = resGet.body;
            //console.log(reply);
            expect(reply[0].name).to.equal("Goal2");
            expect(reply[1].name).to.equal("Goal1");
            expect(reply[0].userId).to.equal(1);
            expect(reply[1].userId).to.equal(1);

        });
        it("should list all objectives from a goal", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2021-09"};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            //Creo un foodCategory
            const aFoodCategory = await FoodCategory.create({name: "myFoodCategory"});
            const anotherFoodCategory = await FoodCategory.create({name: "myOtherFoodCategory"});


            //Creo foods asociadas (o no) a la foodCategory
            const aFood = await Food.create({name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198});
            const anotherFood = await Food.create({name: "Remolacha", recommendedServing: 85, caloriesPerServing: 100});

            //associations

            await aUser.addGoal(aGoal);

            await aGoal.addFoodCategory(aFoodCategory, {through: {objectiveCalories: 4000}});
            await aGoal.addFoodCategory(anotherFoodCategory, {through: {objectiveCalories: 2000}});

            await aFoodCategory.addFood(aFood);
            

            //Hacer el Get
            let resGet = await request(app).get("/api/goals?userId=1");

            expect(resGet.status).to.equal(200);
            let reply = resGet.body;
            //console.log(reply[0].FoodCategories[0].Food);
            expect(reply[0].name).to.equal("Goal1");
            expect(reply[0].objectives[0].foodCategoryId).to.equal(1);
            expect(reply[0].objectives[0].objectiveCalories).to.equal(4000);
            expect(reply[0].objectives[1].foodCategoryId).to.equal(2);
            expect(reply[0].objectives[1].objectiveCalories).to.equal(2000);
            expect(reply[0].userId).to.equal(1);
            
        });
        it("should list all meals associated with a goal, with its calorie count", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2021-09"};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            //Creo un foodCategory
            const aFoodCategory = await FoodCategory.create({name: "myFoodCategory"});
            const anotherFoodCategory = await FoodCategory.create({name: "myOtherFoodCategory"});


            //Creo foods asociadas (o no) a la foodCategory
            const aFood = await Food.create({name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198});
            const anotherFood = await Food.create({name: "Remolacha", recommendedServing: 85, caloriesPerServing: 100});

            const pizzaPala = await Meal.create({name: "Milanesa con puré", dateEaten: "2021-09-08"}); //Notar que es en la fecha estipulada en el goal

            //associations

            await aUser.addGoal(aGoal);

            await aGoal.addFoodCategory(aFoodCategory, {through: {objectiveCalories: 4000}});
            await aGoal.addFoodCategory(anotherFoodCategory, {through: {objectiveCalories: 2000}});

            await aFoodCategory.addFood(aFood);
            await anotherFoodCategory.addFood(anotherFood);

            await pizzaPala.addFood(aFood, {through: {quantity: 2}});
            await pizzaPala.addFood(anotherFood, {through: {quantity: 3}});

            await aUser.addMeal(pizzaPala);
            

            //Hacer el Get
            let resGet = await request(app).get("/api/goals?userId=1");

            expect(resGet.status).to.equal(200);
            let reply = resGet.body;
            //New
            expect(reply[0].name).to.equal("Goal1");
            expect(reply[0].objectives[0].foodCategoryId).to.equal(1);
            expect(reply[0].objectives[0].objectiveCalories).to.equal(4000);
            expect(reply[0].objectives[0].currentCalories).to.equal(396);
            expect(reply[0].objectives[1].foodCategoryId).to.equal(2);
            expect(reply[0].objectives[1].objectiveCalories).to.equal(2000);
            expect(reply[0].objectives[1].currentCalories).to.equal(300);
            expect(reply[0].userId).to.equal(1);
            
        });
        it("should ONLY list meals in the goal period", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2021-09"};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            //Creo un foodCategory
            const aFoodCategory = await FoodCategory.create({name: "myFoodCategory"});
            const anotherFoodCategory = await FoodCategory.create({name: "myOtherFoodCategory"});


            //Creo foods asociadas (o no) a la foodCategory
            const aFood = await Food.create({name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198});
            const anotherFood = await Food.create({name: "Remolacha", recommendedServing: 85, caloriesPerServing: 100});

            const pizzaPalaAug = await Meal.create({name: "Milanesa con puré", dateEaten: "2021-08-08"}); //fecha anterior a estipulada en el goal
            const pizzaPalaSep = await Meal.create({name: "Milanesa con puré", dateEaten: "2021-09-08"}); //Notar que es en la fecha estipulada en el goal
            const pizzaPalaOct = await Meal.create({name: "Milanesa con puré", dateEaten: "2021-10-08"}); //fecha posterior a la fecha estipulada en el goal

            //associations

            await aUser.addGoal(aGoal);

            await aGoal.addFoodCategory(aFoodCategory, {through: {objectiveCalories: 4000}});
            await aGoal.addFoodCategory(anotherFoodCategory, {through: {objectiveCalories: 2000}});

            await aFoodCategory.addFood(aFood);
            await anotherFoodCategory.addFood(anotherFood);

            await pizzaPalaAug.addFood(aFood, {through: {quantity: 2}});
            await pizzaPalaAug.addFood(anotherFood, {through: {quantity: 3}});
            await pizzaPalaSep.addFood(aFood, {through: {quantity: 2}});
            await pizzaPalaSep.addFood(anotherFood, {through: {quantity: 3}});
            await pizzaPalaOct.addFood(aFood, {through: {quantity: 2}});
            await pizzaPalaOct.addFood(anotherFood, {through: {quantity: 3}});
            
            await aUser.addMeal(pizzaPalaAug);
            await aUser.addMeal(pizzaPalaSep);
            await aUser.addMeal(pizzaPalaOct);
            //Hacer el Get
            let resGet = await request(app).get("/api/goals?userId=1");

            expect(resGet.status).to.equal(200);
            let reply = resGet.body;
            //New
            expect(reply[0].name).to.equal("Goal1");
            expect(reply[0].objectives[0].foodCategoryId).to.equal(1);
            expect(reply[0].objectives[0].objectiveCalories).to.equal(4000);
            expect(reply[0].objectives[0].currentCalories).to.equal(396);
            expect(reply[0].objectives[1].foodCategoryId).to.equal(2);
            expect(reply[0].objectives[1].objectiveCalories).to.equal(2000);
            expect(reply[0].objectives[1].currentCalories).to.equal(300);
            expect(reply[0].userId).to.equal(1);
            
        });
        it("should give me the calorie count for all foods in a period, if I specify totalCalories", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2021-09", totalCalories: 1000};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            //Creo foods y dos meals
            const aFood = await Food.create({name: "Milanesa", recommendedServing: 85, caloriesPerServing: 200});
            const anotherFood = await Food.create({name: "Remolacha", recommendedServing: 85, caloriesPerServing: 100});
            const aMeal = await Meal.create({name: "Milanesa con puré", dateEaten: "2021-09-08"}); //Notar que es en la fecha estipulada en el goal
            const anotherMeal = await Meal.create({name: "Milanesa con puré", dateEaten: "2021-09-10"}); //Notar que es en la fecha estipulada en el goal
            const mealOutsideRange = await Meal.create({name: "Milanesa con puré", dateEaten: "2021-10-2"}); //Fuera de la fecha estipulada en el goal
            //associations

            await aUser.addGoal(aGoal);
            await aMeal.addFood(aFood, {through: {quantity: 1}});
            await anotherMeal.addFood(anotherFood, {through: {quantity: 1}});
            await mealOutsideRange.addFood(anotherFood, {through: {quantity: 1}});
            await aUser.addMeals([aMeal, anotherMeal, mealOutsideRange]);
            
            //Hacer el Get
            let resGet = await request(app).get("/api/goals?userId=1");

            expect(resGet.status).to.equal(200);
            let reply = resGet.body;
            //console.log(reply[0].FoodCategories[0].Food);
            expect(reply[0].totalCalories).to.equal(1000);
            expect(reply[0].currentTotalCalories).to.equal(300);
            
        });
    });
    describe("POST /goals", () => {
        it("should post a goal using a general calorie count, and return my goal list", async () => {

            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};

            await User.create(testUser);
            const testGoalData = {
                name: 'myGoal',
                dateStart: '2021-07',
                totalCalories: 40000
            }
            let reply = await request(app).post("/api/goals?userId=1").send(testGoalData);
            
            expect(reply.status).to.equal(200);
            expect(reply.body[0].name).to.equal("myGoal");
            expect(reply.body[0].userId).to.equal(1);
            expect(reply.body[0].totalCalories).to.equal(40000);
        });
        it("should error if no calorie count and no objectives are provided", async () => {

            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            await User.create(testUser);
            
            const testGoalData = {
                name: 'myGoal',
                dateStart: '2021-07',
                totalCalories: 0,
            };
            let reply = await request(app).post("/api/goals?userId=1").send(testGoalData);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal("Bad Goal format.");

        });
        it("should error if no userId is provided", async () => {

            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            await User.create(testUser);
            
            const testGoalData = {
                name: 'myGoal',
                dateStart: '2021-07',
                totalCalories: 0,
            };
            let reply = await request(app).post("/api/goals").send(testGoalData);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal("No userId provided.");

        });
        it("should error if a goal already exists for that date", async () => {

            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            await User.create(testUser);
            const testGoalData = {
                name: 'myGoal',
                dateStart: '2021-07',
                totalCalories: 100,
            };
            let reply = await request(app).post("/api/goals?userId=1").send(testGoalData);
            expect(reply.status).to.equal(200);
            const anotherTestGoalData = {
                name: 'myOtherGoal',
                dateStart: '2021-07',
                totalCalories: 200,
            };
            reply = await request(app).post("/api/goals?userId=1").send(anotherTestGoalData);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal("Goal already exists for that Date.");

        });
        
        it("should post a goal with objectives", async () => {

            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            
            await User.create(testUser);
            await FoodCategory.create({name: "Fruta"});
            await FoodCategory.create({name: "Verdura"});

            const testGoalData = {
                name: 'myGoal',
                dateStart: '2021-07',
                totalCalories: 5000,
                objectives: 
                [
                    {
                        objectiveCalories: 3000,
                        foodCategoryId: 1
                    },
                    {
                        objectiveCalories: 2000,
                        foodCategoryId: 2
                    },
                ]
            };
            let reply = await request(app).post("/api/goals?userId=1").send(testGoalData);
            expect(reply.status).to.equal(200);
            expect(reply.body[0].objectives.length).to.equal(2);
            expect(reply.body[0].objectives[0].objectiveCalories).to.equal(3000);
            expect(reply.body[0].objectives[0].foodCategory.name).to.equal('Fruta');
            expect(reply.body[0].objectives[1].objectiveCalories).to.equal(2000);
            expect(reply.body[0].objectives[1].foodCategory.name).to.equal('Verdura');

        });
        it("should post a goal with ONLY objectives", async () => {

            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            
            await User.create(testUser);
            await FoodCategory.create({name: "Fruta"});
            await FoodCategory.create({name: "Verdura"});

            const testGoalData = {
                name: 'myGoal',
                dateStart: '2021-07',
                totalCalories: 0,
                objectives: 
                [
                    {
                        objectiveCalories: 3000,
                        foodCategoryId: 1
                    },
                    {
                        objectiveCalories: 2000,
                        foodCategoryId: 2
                    },
                ]
            };
            let reply = await request(app).post("/api/goals?userId=1").send(testGoalData);
            expect(reply.status).to.equal(200);
            expect(reply.body[0].objectives.length).to.equal(2);
            expect(reply.body[0].objectives[0].objectiveCalories).to.equal(3000);
            expect(reply.body[0].objectives[0].foodCategory.name).to.equal('Fruta');
            expect(reply.body[0].objectives[1].objectiveCalories).to.equal(2000);
            expect(reply.body[0].objectives[1].foodCategory.name).to.equal('Verdura');

        });
        it("should error if a goal already exists for a given date", async () => {

            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            aUser = await User.create(testUser);
            const testGoalData = {
                name: 'myGoal',
                dateStart: '2021-07',
                totalCalories: 100,
            };

            let reply = await request(app).post("/api/goals?userId=1").send(testGoalData);
            expect(reply.status).to.equal(200);
            const anotherTestGoalData = {
                name: 'myOtherGoal',
                dateStart: '2021-07',
                totalCalories: 200,
            };
            reply = await request(app).post("/api/goals?userId=1").send(anotherTestGoalData);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal("Goal already exists for that Date.");

        });
        it("should error if totalCalories < the sum of objectives", async () => {

            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            
            await User.create(testUser);
            await FoodCategory.create({name: "Fruta"});
            await FoodCategory.create({name: "Verdura"});

            const testGoalData = {
                name: 'myGoal',
                dateStart: '2021-07',
                totalCalories: 4999,
                objectives: 
                [
                    {
                        objectiveCalories: 3000,
                        foodCategoryId: 1
                    },
                    {
                        objectiveCalories: 2000,
                        foodCategoryId: 2
                    },
                ]
            };
            let reply = await request(app).post("/api/goals?userId=1").send(testGoalData);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal("Bad Goal format.");
        });
    });
    describe("PUT /goals", () => {
        it("should be able to edit a future goal", async () => {
            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2021-11"};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            //Creo un foodCategory
            await FoodCategory.create({name: "Fruta"});
            await FoodCategory.create({name: "Verdura"});

            const aFoodCategory = await FoodCategory.create({name: "myFoodCategory"});
            const anotherFoodCategory = await FoodCategory.create({name: "myOtherFoodCategory"});

            //associations
            await aGoal.addFoodCategory(aFoodCategory, {through: {objectiveCalories: 4000}});
            await aGoal.addFoodCategory(anotherFoodCategory, {through: {objectiveCalories: 2000}});
            await aUser.addGoal(aGoal);

            const testGoalUpdate = {
                name: 'myGoal',
                dateStart: '2021-11',
                totalCalories: 6001,
                objectives: 
                [
                    {
                        objectiveCalories: 3000,
                        foodCategoryId: 1
                    },
                    {
                        objectiveCalories: 2000,
                        foodCategoryId: 2
                    },
                ]
            }

            let reply = await request(app).put("/api/goals?goalId=1&userId=1").send(testGoalUpdate);
            expect(reply.status).to.equal(200);
            expect(reply.body[0].totalCalories).to.equal(6001);
            expect(reply.body[0].objectives.length).to.equal(2);
            expect(reply.body[0].objectives[0].objectiveCalories).to.equal(3000);
            expect(reply.body[0].objectives[0].foodCategory.name).to.equal('Fruta');
            expect(reply.body[0].objectives[1].objectiveCalories).to.equal(2000);
            expect(reply.body[0].objectives[1].foodCategory.name).to.equal('Verdura');


        });
        it("should not be able to edit a past or current goal", async () => {
            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2020-11", totalCalories: 6000};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            await aUser.addGoal(aGoal);

            const testGoalUpdate = {
                name: 'myGoal',
                dateStart: '2020-11',
                totalCalories: 6001,
            }

            let reply = await request(app).put("/api/goals?goalId=1&userId=1").send(testGoalUpdate);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal('Cannot edit a past or current goal.');
            
        });
        it("should error if no userId or goalId is provided", async () => {
            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2020-11", totalCalories: 6000};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            await aUser.addGoal(aGoal);

            const testGoalUpdate = {
                name: 'myGoal',
                dateStart: '2020-11',
                totalCalories: 6001,
            }

            let reply = await request(app).put("/api/goals").send(testGoalUpdate);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal('No goalId or userId provided.');
            
        });
        it("should not be able to edit a goal's date to one where there is another goal already", async () => {
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2023-11", totalCalories: 6000};
            const testGoalAlreadyInDB = {name: "Goal2", dateStart: "2023-12", totalCalories: 6000};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);
            const anotherGoal = await Goal.create(testGoalAlreadyInDB);

            await aUser.addGoal(aGoal);
            await aUser.addGoal(anotherGoal);

            const testGoalUpdate = {
                name: 'myGoal',
                dateStart: '2023-12',
                totalCalories: 6001,
            }

            let reply = await request(app).put("/api/goals?goalId=1&userId=1").send(testGoalUpdate);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal('Goal already associated with provided date.');

        });
        it("should not edit to a date in the past", async () => {
            //Setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2023-11", totalCalories: 6000};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            await aUser.addGoal(aGoal);

            const testGoalUpdate = {
                name: 'myGoal',
                dateStart: '2020-11',
                totalCalories: 6001,
            }

            let reply = await request(app).put("/api/goals?goalId=1&userId=1").send(testGoalUpdate);
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal('Cannot edit a past or current goal.');
            
        });
    });
    describe("DELETE /goals", () => {
        it("should delete a goal", async () => {
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2023-11", totalCalories: 6000};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            await aUser.addGoal(aGoal);

            let reply = await request(app).delete("/api/goals?goalId=1&userId=1");
            expect(reply.status).to.equal(200);
            expect(reply.body.length).to.equal(0);
        });
        it("should error if goal was not found", async () => {
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testGoal = {name: "Goal1", dateStart: "2023-11", totalCalories: 6000};

            const aUser = await User.create(testUser);
            const aGoal = await Goal.create(testGoal);

            await aUser.addGoal(aGoal);

            let reply = await request(app).delete("/api/goals?goalId=2&userId=1");
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal("Cannot delete Goal with goalId=2. Maybe Goal was not found!");
        });
        it("should error if no userId or goalId is provided", async () => {
            
            let reply = await request(app).delete("/api/goals");
            expect(reply.status).to.equal(400);
            expect(reply.body.message).to.equal("No goalId or userId provided.");
        });
    });
});