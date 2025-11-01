const { app } = require("../../app");
const Game = require("../../models/Game");
const { seed_db, testUserPassword } = require("../util/seed_db");
const get_chai = require("../util/get_chai");
const { StatusCodes } = require("http-status-codes");

describe("testing CRUD operations", function () {
  /*
       1. Seed the database! You have a utility routine for that in util/seed_db.js
       2.Logon! You will have to get the logon page to get the CSRF token and cookie. 
       The seed_db.js module has a function to seed the database with a user entry, 
       and it also exports the user's password, so you can use those. You'll need to 
       save the session cookie. Steps 1 and 2 are not tests, but you need an async 
       before() call, inside your describe(), that does these things. 
    */
  before(async function () {
    const { expect, request } = await get_chai();
    this.test_user = await seed_db();
    let req = request.execute(app).get("/sessions/logon").send();
    let res = await req;

    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];

    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) => element.startsWith("__Host-csrfToken"));

    const dataToPost = {
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken,
    };

    req = request
      .execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);

    res = await req;
    cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) => element.startsWith("connect.sid"));
    //make sure setup worked
    expect(this.csrfToken).to.not.be.undefined;
    expect(this.sessionCookie).to.not.be.undefined;
    expect(this.csrfCookie).to.not.be.undefined;

     expect(res).to.have.status(StatusCodes.OK);
     const pageParts = res.text.split("<tr>");
     pageParts = await factory.createMany("game", 21, { createdBy: this.test_user._id });
     expect(pageParts).to.equal(21);
     const games = await Game.find({ createdBy: this.test_user._id });
     expect(games.length).to.equal(21);
  });

})