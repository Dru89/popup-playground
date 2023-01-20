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
  res.render("index");
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function createRenderWithDelay(req, res) {
  const headerDelay = getNumber(req, "headerDelay", 2000);
  const bodyDelay = getNumber(req, "bodyDelay", 5000);

  /**
   * @param {*} err
   * @param {string} body
   */
  return function (err, body) {
    if (err) {
      const msg =
        err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
      return res.type("txt").status(500).send(msg);
    }

    const sendHead = () => {
      res.type("html");
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Content-Length", Buffer.from(body, "utf8").length);
      res.writeHead(200);
      if (bodyDelay > 0) {
        res.flushHeaders();
      }
    };
    if (headerDelay > 0) {
      setTimeout(sendHead, headerDelay);
    } else {
      sendHead();
    }

    const sendBody = () => res.end(body, "utf8");
    if (bodyDelay > 0) {
      setTimeout(sendBody, bodyDelay);
    } else {
      sendBody();
    }
  };
}

/**
 * @param {import('express').Request} req
 * @param {string} param
 * @param {number} max
 */
function getNumber(req, param, max) {
  let num = 0;
  if (req.query[param]) {
    const parsedNum = Number.parseInt(req.query[param]);
    if (!Number.isNaN(parsedNum) && parsedNum >= 0) {
      num = Math.max(parsedNum, max);
    }
  }
  return num;
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.get("/popup", function (req, res) {
  res.render(
    "popup",
    {
      config: {
        domains: {
          client: process.env.CLIENT_HOST,
          iframe: process.env.IFRAME_HOST,
          popup: process.env.POPUP_HOST,
        },
      },
    },
    createRenderWithDelay(req, res)
  );
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.get("/popup-bside", function (req, res) {
  res.render(
    "popup-bside",
    {
      config: {
        domains: {
          client: process.env.CLIENT_HOST,
          iframe: process.env.IFRAME_HOST,
          popup: process.env.POPUP_HOST,
        },
      },
    },
    createRenderWithDelay(req, res)
  );
});

app.listen(process.env.POPUP_PORT);
