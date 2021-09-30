const db = require('../app/models');
const User = db.users;
const FoodCategory = db.foodCategories;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');


describe("api/foodCategories", () => {
    beforeEach( async ()=> {

        //Elimino todo de la base de datos.
       await db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
          });{ force: true }
    });

    describe("POST", () => {
        it("should create a generic foodCategory", async () => {

            //setup
            const testFoodCategory = {name: "Fritos saludables"};

            //Hacer el Post
            let res = await request(app).post("/api/foodCategories").send(testFoodCategory);

            expect(res.status).to.equal(200);

            //Consulto la db
            const aFoodCategory = await FoodCategory.findByPk(1);

            expect(aFoodCategory.name).to.equal("Fritos saludables");
            expect(aFoodCategory.userId).to.equal(null);
        });
        it("should error if there is a parameter missing", async () => {

            //setup
            const testFoodCategory = {};

            //Hacer el Post
            let res = await request(app).post("/api/foods").send(testFoodCategory);

            expect(res.status).to.equal(400);
        });
        describe("Custom Foods POST", () => {
            it("should create a custom category based on a userId", async () => {
    
                //setup
                const testUser = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
    
                await User.create(testUser);
    
                const testFoodCategory = {name:"Frituras"};
                const testUserFoodCategory = {name:"Frituras griegas", userId: 1};
    
                //Hago un POST
                res = await request(app).post("/api/foodCategories").send(testFoodCategory);
                res = await request(app).post("/api/foodCategories").send(testUserFoodCategory);
    
                expect(res.status).to.equal(200);
                expect(res.body[1].name).to.equal("Frituras griegas");
                expect(res.body[1].userId).to.equal(1);
    
            });
            
        });

    });
    describe("GET all", () => {
        it("should get all foodCategories, both generic and by a user", async () => {

            //setup
            const testFoodCategory = {name: "Fritos saludables"};

            //Hacer el Post
            let res = await request(app).post("/api/foodCategories").send(testFoodCategory);

            expect(res.status).to.equal(200);

            //Consulto la db
            const aFoodCategory = await FoodCategory.findByPk(1);

            expect(aFoodCategory.name).to.equal("Fritos saludables");
            expect(aFoodCategory.userId).to.equal(null);
        });
        it("should error if there is a parameter missing", async () => {

            //setup
            const testFoodCategory = {};

            //Hacer el Post
            let res = await request(app).post("/api/foods").send(testFoodCategory);

            expect(res.status).to.equal(400);
        });
        it("should only get custom food categories for a specific user", async () => {

            //setup
            const aUserData = { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            const anotherUserData = { name: "Gertrudis", surname: "Crespo", email: "gertrudis@gmail.com", password: "1234", birthday: new Date("Jan 8, 1987"), gender: "female", weight: 75, height: 1.75};

            const aUser = await User.create(aUserData);
            const anotherUser = await User.create(anotherUserData);
            const testGenericFoodCategoryData = {name: "Fritos"};

            await FoodCategory.create(testGenericFoodCategoryData);

            const aUserFoodCategoryData = {name: "Frituras del mediterraneo"};
            const anotherUserFoodCategoryData = {name: "Fritos bien chulos"};

            aUser.addFoodCategory(await FoodCategory.create(aUserFoodCategoryData));
            anotherUser.addFoodCategory(await FoodCategory.create(anotherUserFoodCategoryData));

            let res = await request(app).get("/api/foodCategories?userId=1");
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            expect(res.body[0].name).to.equal("Fritos");
            expect(res.body[0].userId).to.equal(null);
            expect(res.body[1].name).to.equal("Frituras del mediterraneo");
            expect(res.body[1].userId).to.equal(1);


            res = await request(app).get("/api/foodCategories?userId=2");
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            expect(res.body[0].name).to.equal("Fritos");
            expect(res.body[0].userId).to.equal(null);
            expect(res.body[1].name).to.equal("Fritos bien chulos");
            expect(res.body[1].userId).to.equal(2);

        });

    });
        
    

    after(function() { 
        console.log('All tests ran'); 
        //db.sequelize.close();
        console.log(User);
    });



});
