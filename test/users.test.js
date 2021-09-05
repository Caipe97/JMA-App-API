const db = require('../app/models');
const User = db.users;

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');

describe("api/users", () => {
    beforeEach( async ()=> {
        await db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
          });
    });

    describe("GET /", () => {
        it("should return all users", async () => {
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
    })
})
