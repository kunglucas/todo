const mysql = require('mysql2');
const dotenv = require('dotenv');
require('dotenv').config();
const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
});

connection.getConnection((err, connection) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Database is connected Successfully');
  connection.release();
});

module.exports = connection;