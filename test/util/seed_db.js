const Game = require("../../models/Game");
const User = require("../../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("@eflexsystems/factory-bot");
require("dotenv").config();

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();

factory.setAdapter(factoryAdapter);

factory.define("game", Game, {
  difficulty: () =>
    ["Easy", "Medium", "Hard", "Extreme"][Math.floor(Math.random() * 4)],
  mistakes: () => faker.number.int({ min: 0, max: 5 }),
  hints: () => faker.number.int({ min: 0, max: 5 }),
  status: () =>
    ["Not started", "In progress", "Completed", "Restarted"][
      Math.floor(Math.random() * 4)
    ],
});

factory.define("user", User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

const seed_db = async function () {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await Game.deleteMany({}); // deletes all game records
    await User.deleteMany({}); // and all the users
    testUser = await factory.create("user", { password: testUserPassword });
    await factory.createMany("game", 20, { createdBy: testUser._id }); // put 20 Game entries in the database.
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

module.exports = { testUserPassword, factory, seed_db };
