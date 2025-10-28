const puppeteer = require("puppeteer");
require("../../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Game = require("../../models/Game");
const { app } = require("../../app");
const get_chai = require("../util/get_chai");

let testUser = null;

let page = null;
let browser = null;

describe("games-ejs puppeteer test", function () {
  before(async function () {
    this.timeout(10000);
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

  describe("puppeteer game operations", function () {
    this.timeout(10000);

    it("should click on link in games list", async () => {
      const { expect } = await get_chai();

      // Clean up any existing games first
      await Game.deleteMany({ createdBy: testUser._id });

      // Create 20 test games for the ALREADY logged in testUser
      const gamesToCreate = [];
      for (let i = 0; i < 20; i++) {
        gamesToCreate.push({
          name: `Test Game ${i}`,
          createdBy: testUser._id,
          // add any other required fields for your Game model
        });
      }
      await Game.insertMany(gamesToCreate);

      // Use Puppeteer to click on the games list link
      const gamesLink = await page.waitForSelector("a ::-p-text(games)");
      await gamesLink.click();
      await page.waitForNavigation();

      // Get the entire HTML page content
      const htmlContent = await page.content();

      // Split by <tr> to count table rows
      const pageParts = htmlContent.split("<tr>");

      // Debug: log the count
      console.log("Number of <tr> elements found:", pageParts.length - 1);

      // Verify there are 20 game entries
      expect(pageParts.length - 1).to.equal(20);

      // Also verify in database
      const games = await Game.find({ createdBy: testUser._id });
      expect(games.length).to.equal(20);
    });
  });
});