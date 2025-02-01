// Dependencies
const path = require("path");
const cors = require("cors");
const chalk = require("chalk");
const express = require("express");
const mongoose = require("mongoose");

const auth_middleware = require("./middlewares/auth.middleware");

// Configurations
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

const success = chalk.green;
const failure = chalk.red;
const info = chalk.blue;

// Database connnection initiation
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;

db.on("error", () => {
  console.log("Database Connection:", failure("FAILED"));
});
db.once("open", () => {
  console.log("Database Connection:", success("SUCCESS"));
});

// app.use(auth_middleware.validateToken);
require("./routes/resources.route")(app);
require("./routes/views.route")(app);


app.get("/request", (req, res) => {
  console.log("Request received");
  res.send("Request received");
})

app.listen(process.env.PORT, () => {
  console.log("Server active at PORT:", info(process.env.PORT));
});
