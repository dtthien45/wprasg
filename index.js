const dotenv = require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const {
  rerouteAuth,
  checkUser,
  rerouteEmail,
  notFound,
} = require("./middleware/middleware");
const authController = require("./controllers/auth");
const emailController = require("./controllers/mainbox");

const port = process.env.APP_PORT;
const upload = require("./config/multer");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("static"));
app.use(express.static("uploads"));
app.set("view engine", "ejs");

app.use(checkUser);

app.get("/", rerouteAuth, authController.getHomePage);

app.post("/", rerouteAuth, authController.login);

app.get("/signup",rerouteAuth, authController.signupPage);

app.post("/signup", rerouteAuth, authController.signUp);

app.get("/logout", authController.logout);

app.get("/compose", rerouteEmail, emailController.compose);

app.get("/inbox", rerouteEmail, emailController.inbox);

app.get("/outbox", rerouteEmail, emailController.outbox);

app.get("/email", rerouteEmail, emailController.email);

app.get("/email/:id", rerouteEmail, emailController.email);

app.post(
  "/email",
  rerouteEmail,
  upload.single("file"),
  emailController.createEmail
);

app.put("/inbox", rerouteEmail, emailController.deleteInbox);

app.put("/outbox", rerouteEmail, emailController.deleteOutbox);

app.get("/download/:filename",rerouteEmail, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "upload", filename);

  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.setHeader("Content-Type", "application/octet-stream");

  res.status(200).sendFile(filePath);
});

app.use(notFound);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
