const db = require('../app/models');
const User = db.users;
const Meal = db.meals;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');


//Testeo de /api/users
describe("api/users", () => {
    beforeEach( async ()=> {
        //Elimino todo de la base de datos.
       await db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
          });{ force: true }
    });

    describe("GET /", () => {
        it("should return all users", async () => {
            //setup
            const testUsers = [
                { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75},
                { name: "Julian", surname: "Livrone", email: "julianlivrone@gmail.com", password: "1234", birthday: new Date("Jul 9, 1999"), gender: "male", weight: 75, height: 1.75},
                { name: "Andre", surname: "Cueva", email: "andrecueva@gmail.com", password: "1234", birthday: new Date("Mar 26, 1997"), gender: "male", weight: 75, height: 1.75},
            ];
            await User.bulkCreate(testUsers);
            

            const res = await request(app).get("/api/users")
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(3);
        });
    });
/*
    describe("GET /:userId", () => {
        it("should return one user", async () => {
            //setup
            const testUsers = [
                { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75},
                { name: "Julian", surname: "Livrone", email: "julianlivrone@gmail.com", password: "1234", birthday: new Date("Jul 9, 1999"), gender: "male", weight: 75, height: 1.75},
                { name: "Andre", surname: "Cueva", email: "andrecueva@gmail.com", password: "1234", birthday: new Date("Mar 26, 1997"), gender: "male", weight: 75, height: 1.75},
            ];
            await User.bulkCreate(testUsers);
            
            const res = await request(app).get("/api/users?userId=1")
            expect(res.status).to.equal(200);
            expect(res.body.email).to.equal("manu.crespo97@gmail.com");
        })
    });
*/
    describe("POST /", () => {
        it("should upload a new user", async () => {
            const testUser = 
                { 
                    name: "testuser",
                    surname: "testuser",
                    email: "test@gmail.com",
                    password: "1234",
                    birthday: '1997-01-08',
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            
            
            const resPost = await (request(app).post("/api/users/register").send(testUser).set('Accept', 'application/json'));
            var resGet = await request(app).get("/api/users");
            
            expect(resPost.status).to.equal(200);
            expect(resGet.status).to.equal(200);
            expect(resGet.body[0].email).to.equal("test@gmail.com");

        });
        it("should give an error if a parameter is missing", async () => {

            //aca falta email, por ejemplo
            const testUser = 
                { 
                    name: "testuser",
                    surname: "testuser",
                    password: "1234",
                    birthday: '1997-01-08',
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            
            
            const resPost = await (request(app).post("/api/users/register").send(testUser).set('Accept', 'application/json'));
            
            expect(resPost.status).to.equal(400);

        });

        it("should give an error if the date format is wrong", async () => {
            //date here is wrong
            const testUser = 
                { 
                    name: "testuser",
                    surname: "testuser",
                    email: "test@gmail.com",
                    password: "1234",
                    birthday: '1997-32-64',
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            
            
            const resPost = await (request(app).post("/api/users/register").send(testUser).set('Accept', 'application/json'));
            
            expect(resPost.status).to.equal(400);

        });
    });

    describe("PUT /", () => {
        it("should update a user", async () => {
            const testUser = 
                { 
                    name: "testuser",
                    surname: "testuser",
                    email: "test@gmail.com",
                    password: "1234",
                    birthDay: 8,
                    birthMonth: "Jan",
                    birthYear: 1997,
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            await User.create(testUser);

            //Obtengo los datos del usuario
            const loginCreds = {
                email: "test@gmail.com",
                password: "1234"
            }
            const updateCreds = {
                email: "test@gmail.com",
                password: "asd"
            }

            var resPost = await (request(app).post("/api/users/login").send(loginCreds).set('Accept', 'application/json'));

            //extraigo el id del user
            const idUser = (resPost.body).userId;
            //console.log("id del usuario" + idUser);             
            resPost = await (request(app).put("/api/users?userId=" + idUser).send(updateCreds).set('Accept', 'application/json'));
            
            expect(resPost.status).to.equal(200);

            const resGet = await request(app).get("/api/users?userId=" + idUser);

            expect(resGet.status).to.equal(200);
            expect(resGet.body.password).to.equal("asd");

        });
        it("should give an error if i update a non-existent user", async () => {
            const testUser = 
                { 
                    name: "testuser",
                    surname: "testuser",
                    email: "test@gmail.com",
                    password: "1234",
                    birthDay: 8,
                    birthMonth: "Jan",
                    birthYear: 1997,
                    gender: "male",
                    weight: 75,
                    height: 1.75
                };
            await User.create(testUser);

            //Obtengo los datos del usuario

            const updateCreds = {
                email: "test@gmail.com",
                password: "asd"
            }
          
            resPost = await (request(app).put("/api/users?userId=7").send(updateCreds).set('Accept', 'application/json'));
            
            expect(resPost.status).to.equal(400);

        });
    });
    describe("POST /login", () => {
        it("should login a user", async () => {
            //setup
            const testUsers = 
                { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            
                await User.create(testUsers);

            const loginCreds = {
                email: "manu.crespo97@gmail.com",
                password: "1234"
            }

            var resPost = await (request(app).post("/api/users/login").send(loginCreds).set('Accept', 'application/json'));

            expect(resPost.status).to.equal(200);
            

        });

        it("should error out on logging in a non-existent user", async () => {
            //setup
            const testUsers = 
                { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            
            await User.create(testUsers);

            const loginCreds = {
                email: "manu.crespo97@gmail.com",
                password: "123"
            }

            var resPost = await (request(app).post("/api/users/login").send(loginCreds).set('Accept', 'application/json'));

            expect(resPost.status).to.equal(400);
            

        });
    });

    describe("DELETE /:userId", () => {
        it("should delete a user", async () => {
            //setup
            const testUsers = 
                { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            await User.create(testUsers);
            
            //user deletion

            let res = await request(app).delete("/api/users?userId=1");
            expect(res.status).to.equal(200);

            let resGet = await request(app).get("/api/users?userId=1")
            expect(resGet.status).to.equal(400);
        });

        it("should error out on deleting a non-existent user", async () => {
            //setup
            const testUsers = 
                { name: "Manuel", surname: "Crespo", email: "manu.crespo97@gmail.com", password: "1234", birthday: new Date("Jan 8, 1997"), gender: "male", weight: 75, height: 1.75};
            await User.create(testUsers);
            
            //user deletion

            let res = await request(app).delete("/api/users?userId=45")
            expect(res.status).to.equal(400);
        });
    });

    after(function() { 
        console.log('All tests ran'); 
        //db.sequelize.close();
        console.log(User);
    });

})
