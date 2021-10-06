const db = require('../app/models');
const User = db.users;
const Meal = db.meals;
const Food = db.foods;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');


//Testeo de /api/users
describe("api/meals", () => {
    beforeEach( async ()=> {
        //Elimino todo de la base de datos.
       await db.sequelize.sync({ force: true }).then(() => {
            //console.log("Drop and re-sync db.");
          });{ force: true }
    });

    describe("GET /byUserId", () => {
        it("should get all meals created by a user", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testMeals = [
                {name: "Pizza con pala", dateEaten: "2017-09-08"},
                {name: "Milanesa con puré", dateEaten: "2017-09-08"}
            ];


            const foods = [
                {name: "Pizza", recommendedServing: 100, caloriesPerServing: 108},
                {name: "Pala", recommendedServing: 100, caloriesPerServing: 108},
                {name: "Milanesa", recommendedServing: 100, caloriesPerServing: 108},
                {name: "Puré", recommendedServing: 100, caloriesPerServing: 108},
            ]

            const aUser = await User.create(testUser);

            const pizzaPala = await Meal.create(testMeals[0]);
            const milaPure = await Meal.create(testMeals[1]);

            const pizza = await Food.create(foods[0]);
            const pala = await Food.create(foods[1]);
            const mila = await Food.create(foods[2]);
            const pure = await Food.create(foods[3]);

            //associations

            await aUser.addMeals([pizzaPala, milaPure]);

            await pizzaPala.addFood(pizza, {through: {quantity: 1}});
            await pizzaPala.addFood(pala, {through: {quantity: 5}});

            await milaPure.addFood(mila, {through: {quantity: 2}});
            await milaPure.addFood(pure, {through: {quantity: 1}});
            


            //Hacer el Get
            let resGet = await request(app).get("/api/meals?userId=1");

            expect(resGet.status).to.equal(200);
            let reply = resGet.body;

            expect(reply[1].name).to.equal("Milanesa con puré");
            expect(reply[0].name).to.equal("Pizza con pala");
            expect(reply[0].userId).to.equal(1);
            expect(reply[1].userId).to.equal(1);

            expect(reply[0].FoodList[0].quantity).to.equal(1);
            expect(reply[0].FoodList[0].food.name).to.equal("Pizza");
            expect(reply[0].FoodList[1].quantity).to.equal(5);
            expect(reply[0].FoodList[1].food.name).to.equal("Pala");
            expect(reply[1].FoodList[0].quantity).to.equal(2);
            expect(reply[1].FoodList[0].food.name).to.equal("Milanesa");
            expect(reply[1].FoodList[1].quantity).to.equal(1);
            expect(reply[1].FoodList[1].food.name).to.equal("Puré");

        });
    });
    describe("GET /", () => {
        it("should error out if no query parameters are provided ", async () => {

            //Hacer el Get
            let resGet = await request(app).get("/api/meals");

            expect(resGet.status).to.equal(400);
        });
    });

    describe("GET /:mealId", () => {
        it("should get a meal by id (empty meal) ", async () => {

            //setup
            const aUserData =
                { 
                    name: "Manuel",
                    surname: "Crespo",
                    email: "manu.crespo97@gmail.com",
                    password: "1234",
                    birthday: new Date("Jan 8, 1997"),
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            const testMealData = 
            {
                name: "Pizza con pala",
                gramAmount: 150,
                dateEaten: "2014-09-08"
            };
                
            const aUser = await User.create(aUserData);
            const aMeal = await Meal.create(testMealData);

            await aUser.addMeal(aMeal);

            //Hacer el Get
            let resGet = await request(app).get("/api/meals?mealId=1");

            expect(resGet.status).to.equal(200);


            expect(resGet.body.name).to.equal("Pizza con pala");
        });
        it("should get a meal with its foods included ", async () => {

            //setup
            const aUserData =
            { 
                name: "Manuel",
                surname: "Crespo",
                email: "manu.crespo97@gmail.com",
                password: "1234",
                birthday: new Date("Jan 8, 1997"),
                gender: "male",
                weight: 75,
                height: 1.75
            };

            const testMealData = 
            {
                name: "Revuelto Gramajo",
                gramAmount: 150, //No me van a importar jamás
                dateEaten: "2014-09-08"
            };

            const aUser = await User.create(aUserData);
            const aMeal = await Meal.create(testMealData);

            const fideos = await Food.create({name: "Fideos", recommendedServing: 100, caloriesPerServing: 108});
            const arroz = await Food.create({name: "Arroz", recommendedServing: 100, caloriesPerServing: 80});
            const huevo = await Food.create({name: "Huevo", recommendedServing: 40, caloriesPerServing: 150});

            await aUser.addMeal(aMeal);
             //Agregar las foods a la meal
            await aMeal.addFood(fideos, {through: {quantity: 1}});
            await aMeal.addFood(arroz, {through: {quantity: 1}});
            await aMeal.addFood(huevo, {through: {quantity: 3}});


            const mealId = aMeal.mealId;
            

            //Hacer el Get
            let resGet = await request(app).get("/api/meals?mealId=" + mealId);

            expect(resGet.status).to.equal(200);
            let reply = resGet.body;
            expect(reply.mealId).to.equal(1);
            expect(reply.name).to.equal("Revuelto Gramajo");
            expect(reply.FoodList[0].quantity).to.equal(1);
            expect(reply.FoodList[0].food.name).to.equal("Fideos");
            expect(reply.FoodList[1].quantity).to.equal(1);
            expect(reply.FoodList[1].food.name).to.equal("Arroz");
            expect(reply.FoodList[2].quantity).to.equal(3);
            expect(reply.FoodList[2].food.name).to.equal("Huevo");

        });
        it("should get meals by date, if discriminated ", async () => {

            //setup
            const aUserData =
            { 
                name: "Manuel",
                surname: "Crespo",
                email: "manu.crespo97@gmail.com",
                password: "1234",
                birthday: new Date("Jan 8, 1997"),
                gender: "male",
                weight: 75,
                height: 1.75
            };

            const testMealsData = [
                {
                    name: "Meal1 no en timeframe",
                    gramAmount: 150, //No me van a importar jamás
                    dateEaten: "2014-09-05"
                },
                {
                    name: "Meal1 en timeframe",
                    gramAmount: 150, //No me van a importar jamás
                    dateEaten: "2014-09-06"
                },
                {
                    name: "Meal2 en timeframe",
                    gramAmount: 150, //No me van a importar jamás
                    dateEaten: "2014-09-07"
                },
                {
                    name: "Meal3 en timeframe",
                    gramAmount: 150, //No me van a importar jamás
                    dateEaten: "2014-09-08"
                },
                {
                    name: "Meal33 en timeframe",
                    gramAmount: 150, //No me van a importar jamás
                    dateEaten: "2014-09-09"
                },
                {
                    name: "Meal34 en timeframe",
                    gramAmount: 150, //No me van a importar jamás
                    dateEaten: "2014-09-10"
                },
                {
                    name: "Meal4 NO timeframe",
                    gramAmount: 150, //No me van a importar jamás
                    dateEaten: "2014-09-11"
                },
            ];

            const aUser = await User.create(aUserData);
            const meals = await Meal.bulkCreate(testMealsData);

            await aUser.addMeals(meals);

            //Hacer el Get
            let resGet = await request(app).get("/api/meals?userId=1&dateStart=2014-09-06&dateEnd=2014-09-10");

            expect(resGet.status).to.equal(200);
            let reply = resGet.body;
            expect(reply.length).to.equal(5);
            expect(reply[0].name).to.equal("Meal1 en timeframe");
            expect(reply[1].name).to.equal("Meal2 en timeframe");
            expect(reply[2].name).to.equal("Meal3 en timeframe");
            expect(reply[3].name).to.equal("Meal33 en timeframe");
            expect(reply[4].name).to.equal("Meal34 en timeframe");

        });
    });
    describe("POST /", () => {
        it("should create a meal (empty food list) ", async () => {
            //setup
            const aUserData =
                { 
                    name: "Manuel",
                    surname: "Crespo",
                    email: "manu.crespo97@gmail.com",
                    password: "1234",
                    birthday: new Date("Jan 8, 1997"),
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
                
            await User.create(aUserData);

            const frontEndRequest = {
                name: "Pizza con Pala",
                dateEaten: "2014-09-08",
                userId: 1,
                FoodList: [] 

            }

            //Hacer el POST
            let res = await request(app).post("/api/meals?userId=1").send(frontEndRequest);

            expect(res.status).to.equal(200);

            let resGet = await request(app).get("/api/meals?mealId=1");

            expect(resGet.status).to.equal(200);
            expect(resGet.body.name).to.equal("Pizza con Pala");
            expect(resGet.body.userId).to.equal(1);
        });
      
        it("should error on an incomplete format ", async () => {
            //setup
            const aUserData =
                { 
                    name: "Manuel",
                    surname: "Crespo",
                    email: "manu.crespo97@gmail.com",
                    password: "1234",
                    birthday: new Date("Jan 8, 1997"),
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            const testMealData = 
            {
                name: "Pizza con pala",
                //dateEaten: "2014-09-08"
            };
                
            await User.create(aUserData);

            //Hacer el POST
            let res = await request(app).post("/api/meals?userId=1").send(testMealData);

            expect(res.status).to.equal(400);

        });
        it("should post a meal with food quantities", async () => {
            //setup
            const aUserData =
                { 
                    name: "Manuel",
                    surname: "Crespo",
                    email: "manu.crespo97@gmail.com",
                    password: "1234",
                    birthday: new Date("Jan 8, 1997"),
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            
            await User.create(aUserData);

            await Food.create({name: "Pizza", recommendedServing: 100, caloriesPerServing: 108});
            await Food.create({name: "Pala", recommendedServing: 100, caloriesPerServing: 80});

            
            const frontEndRequest = {
                name: "Pizza con Pala",
                dateEaten: "2014-09-08",
                FoodList: [
                    {
                        quantity: 1,
                        food: {
                            foodId: 1,
                            name: "Pizza",
                            recommendedServing: 108,
                            caloriesPerServing: 150,
                            createdAt: "2014-09-08",
                            updatedAt: "2014-09-08"
                        }
                    },
                    {
                        quantity: 5,
                        food: {
                            foodId: 2,
                            name: "Pala",
                            recommendedServing: 108,
                            caloriesPerServing: 150,
                            createdAt: "2014-09-08",
                            updatedAt: "2014-09-08"
                        }
                    },
                ] 

            }

            //Hacer el POST
            let res = await request(app).post("/api/meals?userId=1").send(frontEndRequest);

            expect(res.status).to.equal(200);

            let resGet = await request(app).get("/api/meals?mealId=1");

            expect(resGet.status).to.equal(200);

            let reply = resGet.body;

            expect(reply.mealId).to.equal(1);
            expect(reply.name).to.equal("Pizza con Pala");
            expect(reply.FoodList[0].quantity).to.equal(1);
            expect(reply.FoodList[0].food.name).to.equal("Pizza");
            expect(reply.FoodList[1].quantity).to.equal(5);
            expect(reply.FoodList[1].food.name).to.equal("Pala");
        });
    });

        

    describe("PUT ?mealId", () => {
        it("should update a meal", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testMeal = {name: "Pizza con pala", dateEaten: "2017-09-08"};
            const testUpdate = {name: "Pizza con pala", dateEaten: "2017-09-08"};



            const aUser = await User.create(testUser);
            const userMeal = await Meal.create(testMeal);
            await aUser.addMeal(userMeal);

            let res = await request(app).put("/api/meals?mealId=1").send(testUpdate);

            expect(res.status).to.equal(200);

            let resGet = await request(app).get("/api/meals?mealId=1");

            expect(resGet.status).to.equal(200);

        });
        it("should error out on updating a non existant meal", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testMeal = {name: "Pizza con pala", dateEaten: "2017-09-08"};
            const testUpdate = {name: "Pizza con pala", dateEaten: "2017-09-08"};



            const aUser = await User.create(testUser);
            const userMeal = await Meal.create(testMeal);
            await aUser.addMeal(userMeal);

            let res = await request(app).put("/api/meals?mealId=2").send(testUpdate);

            expect(res.status).to.equal(400);

        });
        it("should update all foods it has", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            //const testMeal = {name: "Pizza con pala", dateEaten: "2017-09-08"};

            await Food.create({name: "Pizza", recommendedServing: 100, caloriesPerServing: 108});
            await Food.create({name: "Pala", recommendedServing: 100, caloriesPerServing: 80});

            const aUser = await User.create(testUser);

            

            const createdFood = {
                name: "Pizza con Pala",
                dateEaten: "2014-09-08",
                FoodList: [
                    {
                        quantity: 1,
                        food: {
                            foodId: 1,
                            name: "Pizza",
                            recommendedServing: 108,
                            caloriesPerServing: 150,
                            createdAt: "2014-09-08",
                            updatedAt: "2014-09-08"
                        }
                    },
                    {
                        quantity: 5,
                        food: {
                            foodId: 2,
                            name: "Pala",
                            recommendedServing: 108,
                            caloriesPerServing: 150,
                            createdAt: "2014-09-08",
                            updatedAt: "2014-09-08"
                        }
                    },
                ] 
            }
            let res = await request(app).post("/api/meals?userId=1").send(createdFood);

            expect(res.status).to.equal(200);
            //un commentario
            const testUpdate = {
                name: "Mas Pizza que Pala",
                dateEaten: "2014-09-08",
                FoodList: [
                    {
                        quantity: 3,
                        food: {
                            foodId: 1,
                            name: "Pizza",
                            recommendedServing: 108,
                            caloriesPerServing: 150,
                            createdAt: "2014-09-08",
                            updatedAt: "2014-09-08"
                        }
                    },
                    {
                        quantity: 1,
                        food: {
                            foodId: 2,
                            name: "Pala",
                            recommendedServing: 108,
                            caloriesPerServing: 150,
                            createdAt: "2014-09-08",
                            updatedAt: "2014-09-08"
                        }
                    },
                ] 
            }

             res = await request(app).put("/api/meals?mealId=1").send(testUpdate);

            expect(res.status).to.equal(200);
            console.log("The res", res.body);
            expect(res.body[0].name).to.equal("Mas Pizza que Pala");
            expect(res.body[0].FoodList[0].quantity).to.equal(3);
            expect(res.body[0].FoodList[1].quantity).to.equal(1);

        });
    });
    describe("DELETE /:mealId", () => {
        it("should delete a meal", async () => {
            //setup
            const aUserData =
                { 
                    name: "Manuel",
                    surname: "Crespo",
                    email: "manu.crespo97@gmail.com",
                    password: "1234",
                    birthday: new Date("Jan 8, 1997"),
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            const testMealData = 
            {
                name: "Pizza con pala",
                //gramAmount: 150,
                dateEaten: "2014-09-08"
            };
            const aUser = await User.create(aUserData);
            const userMeal = await Meal.create(testMealData);

            await aUser.addMeal(userMeal);

            //Hacer el POST
            let res = await request(app).delete("/api/meals?mealId=1");

            expect(res.status).to.equal(200);

            //Me deberia traer los meals restantes

            let resGet = await request(app).get("/api/meals?mealId=1");

            expect(resGet.status).to.equal(400);
        });
        it("should bring all remaining user meals after deletion, if I pass the userId", async () => {
            //setup
            const aUserData =
                { 
                    name: "Manuel",
                    surname: "Crespo",
                    email: "manu.crespo97@gmail.com",
                    password: "1234",
                    birthday: new Date("Jan 8, 1997"),
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            const testMealData = 
            {
                name: "Pizza con pala",
                //gramAmount: 150,
                dateEaten: "2014-09-08"
            };
            const testOtherMealData = 
            {
                name: "Mila con pure",
                //gramAmount: 150,
                dateEaten: "2014-09-08"
            };
            const aUser = await User.create(aUserData);
            const userMeal = await Meal.create(testMealData);
            const otherUserMeal = await Meal.create(testOtherMealData);

            await aUser.addMeal(userMeal);
            await aUser.addMeal(otherUserMeal);

            //Hacer el POST
            let res = await request(app).delete("/api/meals?mealId=1&userId=1");

            expect(res.status).to.equal(200);

            //Me deberia traer los meals restantes
            console.log(res.body);
            expect(res.body[0].name).to.equal("Mila con pure");

            

        });
    })



});