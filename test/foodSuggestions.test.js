const db = require('../app/models');
const User = db.users;
const Meal = db.meals;
const FoodSuggestion = db.foodSuggestions;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');


describe("api/foodSuggestions", () => {
    beforeEach( async ()=> {

        //Elimino todo de la base de datos.
       await db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
          });{ force: true }
    });

    describe("POST /byUserId", () => {
        it("should create a food", async () => {

            //setup
            const testFoodSuggestion = {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198};

            //Hacer el Post
            let res = await request(app).post("/api/foodSuggestions").send(testFoodSuggestion);

            expect(res.status).to.equal(200);

            //Consulto la db
            const aFoodSuggestion = await FoodSuggestion.findByPk(1);

            expect(aFoodSuggestion.name).to.equal("Milanesa");
            expect(aFoodSuggestion.recommendedServing).to.equal(85);
            expect(aFoodSuggestion.caloriesPerServing).to.equal(198);


        });
        it("should error if there is a parameter missing", async () => {

            //setup
            const testFoodSuggestion = {name: "Milanesa", caloriesPerServing: 198};

            //Hacer el Post
            let res = await request(app).post("/api/foodSuggestions").send(testFoodSuggestion);

            expect(res.status).to.equal(400);
        });      

    });
    describe("GET /", () => {
        it("should error out if no query parameter is provided", async () => {

            //setup
            const testFoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testFoodSuggestions);

            //Hacer el Get
            let res = await request(app).get("/api/foodSuggestions");

            expect(res.status).to.equal(200);

            expect(res.body[0].name).to.equal("Milanesa");
            expect(res.body[1].name).to.equal("Pizza con Pala");


        });    
    });

    describe("GET /:foodId", () => {
        it("should get a food in the database by the foodId", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            //Hacer el Get
            let res = await request(app).get("/api/foodSuggestions?foodId=2");

            expect(res.status).to.equal(200);
            console.log(res.body);

            expect(res.body.name).to.equal("Pizza con Pala");
        });
        
        it("should give a 400 if the foodId is not found", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            //Hacer el Get
            let res = await request(app).get("/api/foodSuggestions?foodId=3");

            expect(res.status).to.equal(400);
        });  
    });
    describe("PUT /:foodId", () => {
        it("should update a food based on its foodId", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            const testUpdate = {recommendedServing: 95};

            //Hacer el PUT
            let res = await request(app).put("/api/foodSuggestions?foodId=2").send(testUpdate);

            expect(res.status).to.equal(200);

            //Busco en DB
            const aFoodSuggestion = await FoodSuggestion.findByPk(2);

            expect(aFoodSuggestion.recommendedServing).to.equal(95);
        });
        it("should error out if the foodId is not found", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            const testUpdate = {recommendedServing: 95};

            //Hacer el PUT
            let res = await request(app).put("/api/foodSuggestions?foodId=5").send(testUpdate);

            expect(res.status).to.equal(400);
        });

        it("should error out if any other parameters are updated", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            const testUpdate = {fooBar: 95};

            //Hacer el PUT
            let res = await request(app).put("/api/foodSuggestions?foodId=2").send(testUpdate);

            expect(res.status).to.equal(400);

            //Busco en DB
            const aFoodSuggestion = await FoodSuggestion.findByPk(2);

            expect(aFoodSuggestion.fooBar).to.equal(undefined);
        }); 
    });
    describe("DELETE ?foodId", () => {
        it("should delete a food based on its foodId", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            //Hacer el delete
            let res = await request(app).delete("/api/foodSuggestions?foodId=2");

            expect(res.status).to.equal(200);

            //Busco en DB
            const aFoodSuggestion = await FoodSuggestion.findByPk(2);

            expect(aFoodSuggestion).to.equal(null);
        });
        it("should error out if the foodId didnt exist", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            //Hacer el delete
            let res = await request(app).delete("/api/foodSuggestions?foodId=3");

            expect(res.status).to.equal(400);

        });
    });
    describe("DELETE ?foodId", () => {
        it("should delete a food based on its foodId", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            //Hacer el delete
            let res = await request(app).delete("/api/foodSuggestions?foodId=2");

            expect(res.status).to.equal(200);

            //Busco en DB
            const aFoodSuggestion = await FoodSuggestion.findByPk(2);

            expect(aFoodSuggestion).to.equal(null);
        });
        it("should error out if the foodId didnt exist", async () => {

            //setup
            const testfoodSuggestions = [
                {name: "Milanesa", recommendedServing: 85, caloriesPerServing: 198},
                {name: "Pizza con Pala", recommendedServing: 100, caloriesPerServing: 200},
            ];

            await FoodSuggestion.bulkCreate(testfoodSuggestions);

            //Hacer el delete
            let res = await request(app).delete("/api/foodSuggestions?foodId=3");

            expect(res.status).to.equal(400);

        });
    });
    

    after(function() { 
        console.log('All tests ran'); 
        //db.sequelize.close();
        console.log(User);
    });




});