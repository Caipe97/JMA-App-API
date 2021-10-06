const db = require('../app/models');
const User = db.users;
const Food = db.foods;
const FoodCategory = db.foodCategories;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');


describe("api/foods", () => {
    beforeEach( async ()=> {

        //Elimino todo de la base de datos.
       await db.sequelize.sync({ force: true }).then(() => {
            //console.log("Drop and re-sync db.");
          });
    });

    describe("POST", () => {
        it("should create a food", async () => {

            //setup
            const testFood = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198};

            //Hacer el Post
            let res = await request(app).post("/api/foods").send(testFood);

            expect(res.status).to.equal(200);

            //Consulto la db
            const aFood = await Food.findByPk(1);

            expect(aFood.name).to.equal("Milanesa");
            expect(aFood.recommendedServing).to.equal(85);
            expect(aFood.caloriesPerServing).to.equal(198);
        });
        it("should error if there is a parameter missing", async () => {

            //setup
            const testFood = {name: "Milanesa", caloriesPerServing: 198};

            //Hacer el Post
            let res = await request(app).post("/api/foods").send(testFood);

            expect(res.status).to.equal(400);
        });
        it("should go to the generic foodCategory if it is not specified", async () => {

            //setup
            const testFood = {name: "Milanesa", caloriesPerServing: 198, recommendedServing: 100};

            //Hacer el Post
            let res = await request(app).post("/api/foods").send(testFood);
            console.log(res.body);

            expect(res.status).to.equal(200);
            expect(res.body[0].foodCategoryId).to.equal(null);
        });     

    });
    describe("GET /", () => {
        it("should error out if no query parameter is provided", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);

            //Hacer el Get
            let res = await request(app).get("/api/foods");

            expect(res.status).to.equal(200);

            expect(res.body[0].name).to.equal("Milanesa");
            expect(res.body[1].name).to.equal("Pizza con Pala");

        });    
    });

    describe("GET /:foodId", () => {
        it("should get a food in the database by the foodId", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);

            //Hacer el Get
            let res = await request(app).get("/api/foods?foodId=2");

            expect(res.status).to.equal(200);
            console.log(res.body);

            expect(res.body.name).to.equal("Pizza con Pala");
        });
        
        it("should give a 400 if the foodId is not found", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);

            //Hacer el Get
            let res = await request(app).get("/api/foods?foodId=3");

            expect(res.status).to.equal(400);
        });  
    });
    describe("PUT /:foodId", () => {
        it("should update a food based on its foodId", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);

            const testUpdate = {recommendedServing: 95};

            //Hacer el PUT
            let res = await request(app).put("/api/foods?foodId=2").send(testUpdate);

            expect(res.status).to.equal(200);

            //Busco en DB
            const aFood = await Food.findByPk(2);

            expect(aFood.recommendedServing).to.equal(95);
        });
        it("should error out if the foodId is not found", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);
            console.log("HEY HEEY");
            const testUpdate = {recommendedServing: 95};

            //Hacer el PUT
            let res = await request(app).put("/api/foods?foodId=5").send(testUpdate);

            expect(res.status).to.equal(400);
        });

        it("should error out if any other parameters are updated", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);

            const testUpdate = {fooBar: 95};

            //Hacer el PUT
            let res = await request(app).put("/api/foods?foodId=2").send(testUpdate);

            expect(res.status).to.equal(400);

            //Busco en DB
            const aFood = await Food.findByPk(2);

            expect(aFood.fooBar).to.equal(undefined);
        }); 
    });
    describe("DELETE /:foodId", () => {
        it("should delete a food based on its foodId", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);

            //Hacer el delete
            let res = await request(app).delete("/api/foods?foodId=2");

            expect(res.status).to.equal(200);

            //Busco en DB
            const aFood = await Food.findByPk(2);

            expect(aFood).to.equal(null);
        });
        it("should error out if the foodId didnt exist", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);

            //Hacer el delete
            let res = await request(app).delete("/api/foods?foodId=3");

            expect(res.status).to.equal(400);

        });
        it("should give all other foods as a response", async () => {

            //setup
            const testFoods = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Mayonesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await Food.bulkCreate(testFoods);

            //Hacer el delete
            let res = await request(app).delete("/api/foods?foodId=2");

            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            expect(res.body[0].name).to.equal("Milanesa");
            expect(res.body[1].name).to.equal("Pizza con Pala");

        });
        
    });
    describe("Custom Foods POST", () => {
        it("should create a custom food based on a userId", async () => {

            //setup
            const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};

            await User.create(testUser);

            const testUserFood = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198, userId: 1};
            const testFood = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198};

            //Hago un POST
            let res = await request(app).post("/api/foods").send(testFood);
            expect(res.status).to.equal(200);
            res = await request(app).post("/api/foods").send(testUserFood);

            expect(res.status).to.equal(200);
            expect(res.body[1].name).to.equal("Milanesa");
            expect(res.body[1].userId).to.equal(1);

        });
        it("should create a custom food with a foodCategoryId", async () => {

            //setup
            const aUserData = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const aUser = await User.create(aUserData);
            const testGenericFoodCategoryData = {name: "Fritos"};

            await FoodCategory.create(testGenericFoodCategoryData); //tiene id 1


            const testUserFood = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198, userId: 1, foodCategoryId: 1};

            //Hago un POST
            res = await request(app).post("/api/foods").send(testUserFood);

            expect(res.status).to.equal(200);
            expect(res.body[0].name).to.equal("Milanesa");
            expect(res.body[0].userId).to.equal(1);
            expect(res.body[0].foodCategoryId).to.equal(1);

        });
        it("should create a custom food with a custom foodCategoryId", async () => {

            const aUserData = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const aUserFoodCategoryData = {name: "Frituras del mediterraneo"};
            const aUser = await User.create(aUserData);
            aUser.addFoodCategory(await FoodCategory.create(aUserFoodCategoryData));

            const testUserFood = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198, userId: 1, foodCategoryId: 1};

            //Hago un POST
            res = await request(app).post("/api/foods").send(testUserFood);

            expect(res.status).to.equal(200);
            expect(res.body[0].name).to.equal("Milanesa");
            expect(res.body[0].userId).to.equal(1);
            expect(res.body[0].foodCategoryId).to.equal(1);

        });
        
    });
    describe("Custom Foods GET", () => {
        it("should only get custom foods for a specific user", async () => {

            //setup
            const aUserData = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const anotherUserData = { name: "Gertrudis", surname: "Crespo", email: "gertrudis@gmail.com", password: "1234", birthday: new Date("Jan 8, 1987"), gender: "female", weight: 75, height: 1.75};

            const aUser = await User.create(aUserData);
            const anotherUser = await User.create(anotherUserData);
            const testGenericFoodData = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198};

            await Food.create(testGenericFoodData);

            const aUserFoodData = {name: "Milanesa a la Romana", recommendedServing: 71, caloriesPerServing: 300};
            const anotherUserFoodData = {name: "Milanesa Napolitana Light", recommendedServing: 71, caloriesPerServing: 150};

            aUser.addFood(await Food.create(aUserFoodData));
            anotherUser.addFood(await Food.create(anotherUserFoodData));

            let res = await request(app).get("/api/foods?userId=1");
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            expect(res.body[0].name).to.equal("Milanesa");
            expect(res.body[0].userId).to.equal(null);
            expect(res.body[1].name).to.equal("Milanesa a la Romana");
            expect(res.body[1].userId).to.equal(1);

            res = await request(app).get("/api/foods?userId=2");
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            expect(res.body[0].name).to.equal("Milanesa");
            expect(res.body[0].userId).to.equal(null);
            expect(res.body[1].name).to.equal("Milanesa Napolitana Light");
            expect(res.body[1].userId).to.equal(2);
        });
        
    });
    describe("Custom Foods DELETE", () => {
        it("should return my custom foods only", async () => {

            //setup
            const aUserData = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const anotherUserData = { name: "Gertrudis", surname: "Crespo", email: "gertrudis@gmail.com", password: "1234", birthday: new Date("Jan 8, 1987"), gender: "female", weight: 75, height: 1.75};

            const aUser = await User.create(aUserData);
            const anotherUser = await User.create(anotherUserData);
            const testGenericFoodData = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198};

            await Food.create(testGenericFoodData);

            const aUserFoodData = {name: "Milanesa a la Romana", recommendedServing: 71, caloriesPerServing: 300};
            const aUserAnotherFoodData = {name: "papa frita", recommendedServing: 71, caloriesPerServing: 300};
            const anotherUserFoodData = {name: "Milanesa Napolitana Light", recommendedServing: 71, caloriesPerServing: 150};

            aUser.addFood(await Food.create(aUserFoodData));
            aUser.addFood(await Food.create(aUserAnotherFoodData));
            anotherUser.addFood(await Food.create(anotherUserFoodData));

            let res = await request(app).delete("/api/foods?foodId=3&userId=1");
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            expect(res.body[0].name).to.equal("Milanesa");
            expect(res.body[0].userId).to.equal(null);
            expect(res.body[1].name).to.equal("Milanesa a la Romana");
            expect(res.body[1].userId).to.equal(1);
        });
        
    });
    describe("Custom Foods PUT", () => {
        it("should return my custom foods only", async () => {

            //setup
            const aUserData = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const anotherUserData = { name: "Gertrudis", surname: "Crespo", email: "gertrudis@gmail.com", password: "1234", birthday: new Date("Jan 8, 1987"), gender: "female", weight: 75, height: 1.75};

            const aUser = await User.create(aUserData);
            const anotherUser = await User.create(anotherUserData);
            const testGenericFoodData = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198};

            await Food.create(testGenericFoodData);

            const aUserFoodData = {name: "Milanesa a la Romana", recommendedServing: 71, caloriesPerServing: 300};
            const aUserAnotherFoodData = {name: "papa frita", recommendedServing: 71, caloriesPerServing: 300};
            const anotherUserFoodData = {name: "Milanesa Napolitana Light", recommendedServing: 71, caloriesPerServing: 150};

            aUser.addFood(await Food.create(aUserFoodData));
            aUser.addFood(await Food.create(aUserAnotherFoodData));
            anotherUser.addFood(await Food.create(anotherUserFoodData));

            const foodUpdate = {name: "Papa Frita"}

            let res = await request(app).put("/api/foods?foodId=3&userId=1").send(foodUpdate);
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(3);
            expect(res.body[2].name).to.equal("Papa Frita");
        });
    });
    

    after(function() { 
        console.log('All tests ran'); 
        //db.sequelize.close();
        console.log(User);
    });




});