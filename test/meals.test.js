const db = require('../app/models');
const User = db.users;
const Meal = db.meals;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');


//Testeo de /api/users
describe("api/meals", () => {
    beforeEach( async ()=> {
        //Elimino todo de la base de datos.
       await db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
          });{ force: true }
    });

    describe("GET /byUserId", () => {
        it("should get all meals created by a user", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testMeals = [
                {name: "Pizza con pala", gramAmount: 150, dateEaten: "2017-09-08"},
                {name: "Milanesa con puré", gramAmount: 150, dateEaten: "2017-09-08"}
            ];

            const aUser = await User.create(testUser);
            const userMeals = await Meal.bulkCreate(testMeals);
            //userId va a ser 1 en este caso

            await aUser.addMeals(userMeals).then(data=> {console.log(data)});

            //Hacer el Get
            let resGet = await request(app).get("/api/meals?userId=1");

            expect(resGet.status).to.equal(200);
            //console.log(resGet.body);

            expect(resGet.body[1].name).to.equal("Milanesa con puré");
            expect(resGet.body[0].name).to.equal("Pizza con pala");
            expect(resGet.body[0].userId).to.equal(1);
            expect(resGet.body[1].userId).to.equal(1);

        });
    });
    describe("GET /", () => {
        it("should error out if no query parameters are provided ", async () => {

            //Hacer el Get
            let resGet = await request(app).get("/api/meals");

            expect(resGet.status).to.equal(400);
        });
    });

    describe("GET /byId/:id", () => {
        it("should get a meal by id ", async () => {

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

            //console.log(resGet);

            expect(resGet.body.name).to.equal("Pizza con pala");
        });
    });
    describe("POST /", () => {
        it("should create a meal ", async () => {
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
                
            await User.create(aUserData);

            //Hacer el POST
            let res = await request(app).post("/api/meals?userId=1").send(testMealData);

            expect(res.status).to.equal(200);

            let resGet = await request(app).get("/api/meals?mealId=1");

            expect(resGet.status).to.equal(200);
            expect(resGet.body.name).to.equal("Pizza con pala");
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
                dateEaten: "2014-09-08"
            };
                
            await User.create(aUserData);

            //Hacer el POST
            let res = await request(app).post("/api/meals?userId=1").send(testMealData);

            expect(res.status).to.equal(400);

        });
    });
    describe("PUT /byId/:id", () => {
        it("should update a meal", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const testMeal = {name: "Pizza con pala", gramAmount: 150, dateEaten: "2017-09-08"};
            const testUpdate = {name: "Pizza con pala", gramAmount: 200, dateEaten: "2017-09-08"};



            const aUser = await User.create(testUser);
            const userMeal = await Meal.create(testMeal);
            await aUser.addMeal(userMeal);

            let res = await request(app).put("/api/meals?mealId=1").send(testUpdate);

            expect(res.status).to.equal(200);

            let resGet = await request(app).get("/api/meals?mealId=1");

            expect(resGet.status).to.equal(200);
            expect(resGet.body.gramAmount).to.equal(200);

        });
    });



});