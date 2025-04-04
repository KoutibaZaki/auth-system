const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, 'public')));

const users = {
  testuser: { password: "password123", twoFactorCode: "123456" },
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/", (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username].password === password) {
    req.session.username = username;
    res.redirect("/2fa");
  } else {
    res.redirect("/invalid-credentials");
  }
});

app.get("/2fa", (req, res) => {
    if (!req.session.username) return res.redirect("/"); 
    res.sendFile(path.join(__dirname, "2fa.html"));
});

app.post("/2fa", (req, res) => {
  if (!req.session.username) return res.redirect("/");

  const { code } = req.body;
  if (code === users[req.session.username].twoFactorCode) {
    req.session.authenticated = true;
    res.redirect("/dashboard");
  } else {
    res.redirect("/invalid-2fa");
  }
});

app.get("/dashboard", (req, res) => {
  if (!req.session.authenticated) return res.redirect("/");
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.get("/bypass", (req, res) => {
  if (req.session.username) {
    req.session.authenticated = true;
    res.sendFile(path.join(__dirname, "bypass.html"));
  } else {
    res.redirect("/");
  }
});

app.get("/invalid-2fa", (req, res) => {
  res.sendFile(path.join(__dirname, "invalid-2fa.html"));
});

app.get("/invalid-credentials", (req, res) => {
  res.sendFile(path.join(__dirname, "invalid-credentials.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
