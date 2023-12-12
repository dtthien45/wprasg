const authController = require("../controllers/auth");

const checkUser = async (req, res, next) => {
  const userInfo = req.cookies.user;
  if (userInfo) {
    const user = await authController.validateUser(userInfo);
    if (user) {
      req.user = user;
    }
  }
  next();
};

const rerouteAuth = (req, res, next) => {
  if (req.user) {
    return res.status(200).redirect("/inbox");
  }
  next();
};

const rerouteEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(403).render("403");
  }
  next();
};

const notFound = (req, res, next) => {
  res.status(404).render("404");
};

module.exports = { checkUser, rerouteAuth, rerouteEmail, notFound };
