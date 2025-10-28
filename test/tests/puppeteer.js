const puppeteer = require("puppeteer");
require("../../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Game = require("../../models/Game");
const { app } = require("../../app");
const get_chai = require("../util/get_chai");

let testUser = null;

let page = null;
let browser = null;
// Launch the browser and open a new blank page
describe("games-ejs puppeteer test", function () {
    before(async function () {
        this.timeout(10000);
        //await sleeper(5000)
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.goto("http://localhost:3000");
    });
    after(async function () {
        this.timeout(5000);
        await browser.close();
    });
    describe("got to site", function () {
        it("should have completed a connection", async function () {});
    });
    describe("index page test", function () {
        this.timeout(10000);
        it("finds the index page logon link", async () => {
        this.logonLink = await page.waitForSelector(
            "a ::-p-text(Click this link to logon)"
        );
        });
        it("gets to the logon page", async () => {
        await this.logonLink.click();
        await page.waitForNavigation();
        const email = await page.waitForSelector('input[name="email"]');
        });
    });
    describe("logon page test", function () {
        this.timeout(20000);
        it("resolves all the fields", async () => {
        this.email = await page.waitForSelector('input[name="email"]');
        this.password = await page.waitForSelector('input[name="password"]');
        this.submit = await page.waitForSelector("button ::-p-text(Logon)");
        });
        it("sends the logon", async () => {
        testUser = await seed_db();
        await this.email.type(testUser.email);
        await this.password.type(testUserPassword);
        await this.submit.click();
        await page.waitForNavigation();
        await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
        await page.waitForSelector("a ::-p-text(change the secret)");
        await page.waitForSelector('a[href="/secretWord"]');
        const copyr = await page.waitForSelector("p ::-p-text(copyright)");
        const copyrText = await copyr.evaluate((el) => el.textContent);
        console.log("copyright text: ", copyrText);
        });
    });
    describe("puppeteer game operations", function() {
      /**
        (test1) Make the test do a click on the link for the jobs list. 
        Verify that the job listings page comes up, and that there are 
        20 entries in that list. A hint here: page.content() can be 
        used to get the entire HTML page, and you can use the split() 
        function on that to find the <tr>entries.

        (test2) Have the test click on the "Add A Job" button and to 
        wait for the form to come up. Verify that it is the expected 
        form, and resolve the company and position fields and add button.

        (test3) Type some values into the company and position fields. 
        Then click on the add button. Wait for the jobs list to come back 
        up, and verify that the message says that the job listing has been 
        added. Check the database to see that the latest jobs entry has the 
        data entered. You also use Job.find() as in the previous exercise.)
         */
        it("should click on link in games list", async () => {
             this.test_user = await seed_db();
             const dataToPost = {
               _csrf: this.csrfToken,
             };

             const { expect, request } = await get_chai();
             const req = request
               .execute(app)
               .post("/games/")
               .set("Cookie", this.csrfCookie)
               .set("content-type", "application/x-www-form-urlencoded")
               .send(dataToPost);

             const res = await req;
             let cookies = res.headers["set-cookie"];
             console.log("Cookies received", cookies);
             if (!cookies) {
                throw new Error("No cookies in response");
             }

             this.csrfCookie = cookies.find((element) => element.startsWith("__csrf"));
             if (!this.csrfCookie) {
                 throw new Error("CSRF cookie no found - database or auth failed");
             }
    
             this.sessionCookie = cookies.find((element) => element.startsWith("connect.sid"));
             if (!this.sessionCookie) {
                throw new Error(
                "No session cookie no found - database or auth failed"
                );
             }

             //make sure setup worked
             expect(this.csrfToken).to.not.be.undefined;
             expect(this.sessionCookie).to.not.be.undefined;
             expect(this.csrfCookie).to.not.be.undefined;

             const pageParts = res.text.split("<tr>");
             pageParts = await factory.createMany("game", 21, { createdBy: this.test_user._id });
             expect(pageParts).to.equal(21);
             const games = await Game.find({ createdBy: this.test_user._id });
             expect(games.length).to.equal(21);
        });
    });
});