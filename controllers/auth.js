const dbManager = require("../config/dbManager");

const getHomePage = async (req, res) => {
  return res.status(200).render("homepage");
};

const validateUser = async ({ email, password }) => {
  if (!email || !password) return false;
  const user = await dbManager.getUserByEmail(email);
  if (!user || password !== user.password) return false;
  return user;
};

const login = async (req, res) => {
  const user = await validateUser(req.body);

  if (!user)
    return res.status(400).render("homepage", {
      error: "The username or password is incorrect",
    });

  res.cookie("user", { email: user.email, password: user.password });

  return res.status(200).redirect("/inbox");
};

const signupPage = async (req, res) => {
  res.status(200).render("signup");
};

const signUp = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).render("signup", {
      error: "All fields are required",
    });
  }

  const existUser = await dbManager.getUserByEmail(email);
  let error = null;
  if (existUser) error = "Email already in use";
  if (password.length < 6) error = "Password must be longer than 6 characters";
  if (password !== confirmPassword) error = "Re-enter password does not match";
  if (error) {
    return res.status(400).render("signup", { error });
  }

  const createUser = await dbManager.createUser(req.body);
  return res.status(202).render("signup", { name });
};

const logout = (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
};

module.exports = {
  getHomePage,
  login,
  validateUser,
  signUp,
  signupPage,
  logout,
};
