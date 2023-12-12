require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

db.query(
  `
  DROP TABLE IF EXISTS email;
`,
  (err, results) => {
    if (err) {
      console.error("Error deleting email:", err);
      return;
    }
    console.log("Email table deleted successfully");
  }
);

db.query(
  `
  DROP TABLE IF EXISTS user;
`,
  (err, results) => {
    if (err) {
      console.error("Error deleting user:", err);
      return;
    }
    console.log("User table deleted successfully");
  }
);

db.query(
  `
  CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY UQ_fa890441710991f23916ba85599 (email)
  );
`,
  (err, results) => {
    if (err) {
      console.error("Error creating user table:", err);
      return;
    }
    console.log("User table created successfully");
  }
);

db.query(
  `
  INSERT INTO user (name, email, password) VALUES
    ('Dinh Thanh Hien', 'hien@example.com', 'password'),
    ('Taylor Swift', 'taylor@example.com', 'password'),
    ('Fit2023', 'a@a.com', 'password')
`,
  (err, results) => {
    if (err) {
      console.error("Error inserting users:", err);
      return;
    }
    console.log("Users inserted successfully");
  }
);

db.query(
  `
  CREATE TABLE email (
    id INT AUTO_INCREMENT,
    senderId INT NOT NULL,
    recipientId INT NOT NULL,
    subject VARCHAR(255) NOT NULL DEFAULT '(no subject)',
    filename VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    senderHide BOOLEAN NOT NULL DEFAULT false,
    recipientHide BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT PK_69ec19d1a168e63e9de1730a6aa PRIMARY KEY (id),
    CONSTRAINT FK_0f4f9779bd023d4a30113092d62 FOREIGN KEY (recipientId)
      REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT FK_7f8569ba66480b947ba365d7f2f FOREIGN KEY (senderId)
      REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE
  )
`,
  (err, results) => {
    if (err) {
      console.error("Error creating email table:", err);
      return;
    }
    console.log("Email table created successfully");
  }
);

db.query(
  `
  INSERT INTO email (senderId, recipientId, subject, content, createdAt) VALUES
  (1, 3, 'Message 1', 'Content 1', NOW()),
  (1, 3, 'Message 2', 'Content 2', NOW()),
  (2, 1, 'Message 3', 'Content 3', NOW()),
  (2, 3, 'Message 4', 'Content 4', NOW()),
  (3, 1, 'Message 5', 'Content 5', NOW()),
  (3, 2, 'Message 6', 'Content 6', NOW()),
  (3, 1, 'Message 7', 'Content 7', NOW()),
  (1, 3, 'Message 8', 'Content 8', NOW());`,
  (err, result) => {
    if (err) {
      console.error("Error inserting email messages:", err);
      return;
    }
    console.log("Email inserted successfully");
  }
);

db.end((err) => {
  if (err) {
    console.error("Error closing MySQL connection:", err);
  } else {
    console.log("MySQL connection closed");
  }
});
