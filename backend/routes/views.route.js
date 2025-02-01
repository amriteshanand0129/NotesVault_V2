// Middlewares and Controllers
const views_controller = require("../controllers/views.controller");

module.exports = (app) => {
  app.get("/subject_list", views_controller.getSubjects);
  app.get("/subject_files/:subject_code", views_controller.getSubjectFiles);
};
