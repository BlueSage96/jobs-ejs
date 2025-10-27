const { app } = require("../../app");
const { factory, seed_db } = require("../util/seed_db");
const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../util/get_chai");

const User = require("../../models/User");

describe("test for logoff", function () {
    it("should log the user off", async () => {
        const dataToPost = {
            _csrf: this.csrfToken
        }
        const { expect, request } = await get_chai();
        const req = request
            .execute(app)
            .post("/sessions/logoff")
            .set("Cookie", this.csrfToken + ";" + this.sessionCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .send(dataToPost)
    });

    it("should get the index page", async () => {
        const { expect, request } = await get_chai();
        const req = request
            .execute(app)
            .get("/")
            .set("Cookie", this.csrfCookie)
            .set("Cookie", this.sessionCookie)
            .send();
    })
});