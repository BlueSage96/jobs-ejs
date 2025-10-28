const { app } = require("../../app");
const get_chai = require("../util/get_chai");

describe("test for logoff", function () {
    it("should log the user off", async () => {
        const dataToPost = {
            _csrf: this.csrfToken
        }
        const { request } = await get_chai();
        request
            .execute(app)
            .post("/sessions/logoff")
            .set("Cookie", this.csrfToken + ";" + this.sessionCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .send(dataToPost)
    });

    it("should get the index page", async () => {
        const { request } = await get_chai();
          request
            .execute(app)
            .get("/")
            .set("Cookie", this.csrfCookie)
            .set("Cookie", this.sessionCookie)
            .send();
    })
});