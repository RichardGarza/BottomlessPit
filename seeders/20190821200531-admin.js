"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "regular@asdas.com",
          password: "78954621",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: "treafc@weser.com",
          password: "789654123",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: "wirjske@dontask.com",
          password: "7895462315",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: "wheried@wosid.com",
          password: "5468712365",
          role: "admin",
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
