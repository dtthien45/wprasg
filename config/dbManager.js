const mysql = require("mysql2");
const dotenv = require("dotenv");

class DbManager {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
    });

    this.db = this.pool.promise();
  }

  async getUserById(id) {
    const [rows] = await this.db.execute("SELECT * FROM user WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  async getUserByEmail(email) {
    const [rows] = await this.db.execute("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  async getAllUsers() {
    const [rows] = await this.db.execute("SELECT * FROM user");
    return rows;
  }

  async createUser(userInfo) {
    const { name, email, password } = userInfo;
    const result = await this.db.execute(
      "INSERT INTO user (name, email, password) VALUES(?, ?, ?)",
      [name, email, password]
    );
  }

  async getEmailById(id) {
    const emailId = parseInt(id);
    if (emailId <= 0 || isNaN(emailId)) return null;

    const [rows] = await this.db.execute("SELECT * FROM email WHERE id = ?", [
      emailId,
    ]);

    return rows[0];
  }

  async getEmails(id, query, isOutbox) {
    if (!id) return [];
    const page = query.page;
    const limit = 5;
    const skip = page ? (parseInt(page) - 1) * limit : 0;

    let emails;
    if (isOutbox) {
      [emails] = await this.db.query(
        "SELECT email.*, user.name FROM email JOIN user ON email.recipientId = user.id WHERE email.senderHide = false AND email.senderId = ? ORDER BY email.createdAt DESC LIMIT ? OFFSET ?",
        [id, limit, skip]
      );
    } else {
      [emails] = await this.db.query(
        "SELECT email.*, user.name FROM email JOIN user ON email.senderId = user.id WHERE email.recipientHide = false AND email.recipientId = ? ORDER BY email.createdAt DESC LIMIT ? OFFSET ?",
        [id, limit, skip]
      );
    }

    const results = emails.map((email) => {
      return this.formatTime(email);
    });

    return results;
  }

  async createEmail(dto, userId, file) {
    const { recipientId, subject, content } = dto;

    const [result] = await this.db.execute(
      "INSERT INTO email (senderId, recipientId, subject, content, filename) VALUES (?, ?, ?, ?, ?)",
      [userId, recipientId, subject, content, file ? file.filename : null]
    );
  }

  async hideEmails(userId, emailIds, isOutbox) {
    if (!isOutbox) {
      await this.db.query(
        "UPDATE email SET recipientHide = true WHERE recipientId = ? AND id IN (?)",
        [userId, emailIds]
      );
    } else {
      await this.db.query(
        "UPDATE email SET senderHide = true WHERE senderId = ? AND id IN (?)",
        [userId, emailIds]
      );
    }
  }

  formatTime(email) {
    const options = {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    };

    const timestamp = new Date(email.createdAt);
    const formattedDate = timestamp.toLocaleString("en-US", options);

    return { ...email, createdAt: formattedDate };
  }
}

const dbManager = new DbManager();

module.exports = dbManager;
