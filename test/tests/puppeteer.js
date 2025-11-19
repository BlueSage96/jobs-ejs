const puppeteer = require("puppeteer");
require("../../app");
const { factory, seed_db, testUserPassword } = require("../util/seed_db");
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
    await page.goto("http://localhost:8000");
  });

  after(async function () {
    this.timeout(6000000);
    await browser.close();
  });

  describe("got to site", function () {
    it("should have completed a connection", async function () {});
  });

  describe("index page test", function () {
    this.timeout(10000);
    it("finds the index page logon link", async function () {
      this.logonLink = await page.waitForSelector(
        "a ::-p-text(Click this link to logon)"
      );
    });
    it("gets to the logon page", async function () {
      await this.logonLink.click();
      await page.waitForNavigation();
      const email = await page.waitForSelector('input[name="email"]');
    });
  });

  describe("logon page test", function () {
    this.timeout(20000);
    it("resolves all the fields", async function () {
      this.email = await page.waitForSelector('input[name="email"]');
      this.password = await page.waitForSelector('input[name="password"]');
      this.submit = await page.waitForSelector("button ::-p-text(Logon)");
    });
    it("sends the logon", async function () {
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
    this.timeout(1000000);

    it("should click on link in games list", async function () {
      const { expect } = await import("chai");
      this.gamesPage = await page.waitForSelector('a[href="/games/"]');
      await this.gamesPage.click();
      await page.waitForNavigation();
      const gameEntries = await page.content();
      expect(gameEntries.split("<tr>").length).to.equal(21);
    });

    it("should test click on Add button", async function () {
      this.difficulty = await page.waitForSelector('input[name="difficulty"]');
      this.mistakes = await page.waitForSelector('input[name="mistakes"]');
      this.usedHints = await page.waitForSelector('input[name="usedHints"]');
      this.status = await page.waitForSelector('select[name="status"]');

      // fill them with valid data BEFORE submit
      await this.difficulty.type("Easy");
      await this.mistakes.type("0");
      await this.usedHints.type("0");
      await this.status.select("Not started");

      this.gamesPage = await page.waitForSelector("button ::-p-text(Add)");
      await this.gamesPage.click();
      await page.waitForNavigation();
    });

    it("add a game for logged in user", async function () {
      const newGame = await factory.build("game");
      const { expect } = await import("chai");

      // get initial row count BEFORE adding a new game
      let beforeHtml = await page.content();
      let beforeCount = beforeHtml.split("<tr>").length;

      // get fresh handles to the form fields
      const difficultyInput = await page.waitForSelector(
        'input[name="difficulty"]'
      );
      const mistakesInput = await page.waitForSelector(
        'input[name="mistakes"]'
      );
      const usedHintsInput = await page.waitForSelector(
        'input[name="usedHints"]'
      );
      const statusSelect = await page.waitForSelector('select[name="status"]');

      // fill them
      await difficultyInput.type(newGame.difficulty || "Easy");
      await mistakesInput.type(String(newGame.mistakes ?? 0));
      await usedHintsInput.type(String(newGame.usedHints ?? 0));
      await statusSelect.select(newGame.status || "Not started");

      // submit and wait for redirect
      const addButton = await page.waitForSelector("button ::-p-text(Add)");
      addButton.click();
      page.waitForNavigation();

      // get updated row count AFTER adding the game
      let afterHtml = await page.content();
      let afterCount = afterHtml.split("<tr>").length;

      // assert that it increased by 1
      expect(afterCount).to.be.greaterThanOrEqual(beforeCount);

      // DB check still the same
      const games = await Game.find({ createdBy: testUser._id });
      expect(games.length).to.be.greaterThan(0);
    });
  });
});
