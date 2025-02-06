// Middlewares and Controllers
const views_controller = require("../controllers/views.controller");

// Route handler for views
module.exports = (app) => {
  app.get("/subject_list", views_controller.getSubjects);
  app.get("/subject_files/:subject_code", views_controller.getSubjectFiles);
  app.get("/file/:file_id", views_controller.getFileDetails);  
  app.get("getPendingContributions", views_controller.getPendingContributions);
};
