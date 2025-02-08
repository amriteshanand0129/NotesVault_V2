// Dependencies
const multer = require("multer");

// Middlewares and Controllers
const auth_middleware = require("../middlewares/auth.middleware");
const resource_controller = require("../controllers/resources.controller");
const resource_middleware = require("../middlewares/resources.middleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: "File upload error: " + err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

const upload = multer({ storage: storage });

module.exports = (app) => {
  app.post("/upload", [auth_middleware.validateToken, auth_middleware.addUserData, upload.single("fileInput"), resource_middleware.validateUploadForm, multerErrorHandler], resource_controller.uploadResource);
  app.post("/acceptContribution", [upload.none(), auth_middleware.validateToken, auth_middleware.addUserData, auth_middleware.isAdmin], resource_controller.acceptContribution);
  app.post("/rejectContribution", [upload.none(), auth_middleware.validateToken, auth_middleware.addUserData, auth_middleware.isAdmin], resource_controller.rejectContribution);
  //   app.delete("/deleteResource/:id", [auth_middleware.verifyToken, auth_middleware.isAdmin], resource_controller.deleteResource);
};
