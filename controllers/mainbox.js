const dbManager = require("../config/dbManager");

const compose = async (req, res) => {
  const result = await dbManager.getAllUsers();
  const users = result.filter((user) => user.id !== req.user.id);

  return res.status(200).render("compose", {
    users,
    name: req.user.name,
  });
};

const inbox = async (req, res) => {
  const user = req.user;
  const page = req.query.page;
  const currentPage = page && page > 0 ? parseInt(page) : 1;

  const emails = await dbManager.getEmails(
    user.id,
    { page: currentPage },
    false
  );

  return res.status(200).render("mail-list", {
    emails,
    currentPage,
    title: "Inbox",
    name: user.name,
  });
};

const outbox = async (req, res) => {
  const user = req.user;
  const page = req.query.page;
  const currentPage = page && page > 0 ? parseInt(page) : 1;

  const emails = await dbManager.getEmails(
    user.id,
    { page: currentPage },
    true
  );

  return res.status(200).render("mail-list", {
    emails,
    currentPage,
    title: "Outbox",
    name: user.name,
  });
};

const email = async (req, res) => {
  const { id } = req.params;

  const email = await dbManager.getEmailById(id);

  if (
    !email ||
    (email.senderId !== req.user.id && email.recipientId !== req.user.id)
  ) {
    return res.status(400).render("email-detail", {
      name: req.user.name,
    });
  }
  const sender = await dbManager.getUserById(email.senderId);
  const recipient = await dbManager.getUserById(email.recipientId);

  return res.status(200).render("email-detail", {
    email: { ...email, sender, recipient },
    name: req.user.name,
  });
};

const createEmail = async (req, res) => {
  const dto = req.body;
  const file = req.file;

  const result = await dbManager.getAllUsers();
  const users = result.filter((user) => user.id !== req.user.id);

  if (!dto.recipientId) {
    return res.status(400).render("compose", {
      users,
      error: "User receiver is invalid. Please send again",
      name: req.user.name,
    });
  }

  const email = await dbManager.createEmail(dto, req.user.id, file);

  return res.status(200).render("compose", {
    users,
    success: "Email has been created successfully!",
    name: req.name,
  });
};

const deleteInbox = async (req, res) => {
  const emailIds = req.body.emailIds;

  const result = await dbManager.hideEmails(req.user.id, emailIds, false);

  return res.status(200).send("Hide emails successfully");
};

const deleteOutbox = async (req, res) => {
  const emailIds = req.body.emailIds;

  const result = await dbManager.hideEmails(req.user.id, emailIds, true);

  return res.status(200).send("Hide emails successfully");
};

module.exports = {
  compose,
  inbox,
  outbox,
  email,
  createEmail,
  deleteInbox,
  deleteOutbox,
};
