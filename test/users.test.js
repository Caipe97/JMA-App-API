const db = require('../app/models');
const User = db.users;
const Record = db.records;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');


//Testeo de /api/users
describe("api/users", () => {
    beforeEach( async ()=> {
        //Elimino todo de la base de datos.
        await db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
          });
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
        })
    });

    describe("POST /", () => {
        it("should upload a new user", async () => {
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
            
            //await User.bulkCreate(testUser);
            var resGet;
            const resPost = await (request(app).post("/api/users/register").send(testUser).set('Accept', 'application/json'));
            resGet = await request(app).get("/api/users");
            
            
            //console.log(resGet);


            //console.log(resGet);
            expect(resPost.status).to.equal(200);
            expect(resGet.status).to.equal(200);
            expect(resGet.body.length).to.equal(1);


            
            
        })
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

            //console.log(resPost.body);

            //extraigo el id del user
            const idUser = (resPost.body).id;

            console.log("id del usuario" + idUser);
                
            
            resPost = await (request(app).put("/api/users/" + idUser).send(updateCreds).set('Accept', 'application/json'));

            
            
            //console.log(resPost);


            //console.log(resGet);
            expect(resPost.status).to.equal(200);
            //expect(resGet.status).to.equal(200);
            //expect(resGet.body.length).to.equal(1);

        })
    });
    after(function() { 
        console.log('All tests ran'); 
        db.sequelize.close();
        console.log(User);
    });

})
