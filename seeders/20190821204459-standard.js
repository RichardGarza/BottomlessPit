"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "regular@dontworry.com",
          password: "123456789",
          role: "member",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: "demo@demo.com",
          password: "asd121125498",
          role: "member",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: "crazy@felon.com",
          password: "45612sad65",
          role: "member",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: "hand@sanitation.com",
          password: "9876543219",
          role: "member",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
