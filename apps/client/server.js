require("dotenv").config();

const path = require("node:path");
const express = require("express");
const { engine } = require("express-handlebars");

const app = express();

app.engine(
  "handlebars",
  engine({
    helpers: {
      json: function (obj) {
        return JSON.stringify(obj);
      },
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.get("/", function (req, res) {
  res.render("index", {
    config: {
      domains: {
        client: process.env.CLIENT_HOST,
        iframe: process.env.IFRAME_HOST,
        popup: process.env.POPUP_HOST,
      },
    },
  });
});

app.listen(process.env.CLIENT_PORT);
