const express = require("express");
const auth_controller = require("../controllers/auth.controller");

module.exports = (app) => {
  app.post("/auth/register", auth_controller.register);
  app.post("/auth/login", auth_controller.login);
};
