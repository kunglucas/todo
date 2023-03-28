const database = require('../../database');
const bcrypt = require('bcryptjs');

const joi = require("joi");
const schema = joi.object({
    username: joi.string().min(6).max(255).required(),
    password: joi.string().min(6).max(255).required(),
  });
//Register account process.
exports.loginAcc = function loginAcc(request, response)
{
	const dotenv = require('dotenv');
	dotenv.config();
	const secretKey = process.env.secretKey;
	const jwt = require('jsonwebtoken');

	const validation = schema.validate(request.body);
	//For security purposes I do not want to display validation error message after this if statement. Instead I render out my own Error message.
	if (!validation.error) {
		const username = request.body.username;
		const inputPassword = request.body.password;
		const dbPassword = `SELECT password FROM users WHERE username = ?`;
		database.query(dbPassword, [`${username}`], function(error, results) {
		  if (error) {
			// Handle the error
			response.status(500).redirect("/sample_data/Error");
			return;
		  }
		  if (results.length === 0) {
			// No user with this username was found in the database
			response.status(401).redirect("/sample_data/Error");
			return;
		  }
		  const storedPassword = results[0].password;
		  bcrypt.compare(inputPassword, storedPassword, function(error, result) {
			if (error) {
			  // Handle the error
			  response.status(500).redirect("/sample_data/Error");
			} else if (result === true) {
			  // Login successful.
			  const token = jwt.sign({ username: username }, secretKey, { expiresIn: 120 });
			  response.cookie("jwt", token, {
				httpOnly: true,
				sameSite: "lax", //Remove sameSite if login is not working.
				maxAge: 360000
			  });
			  response.status(200).redirect("/sample_data/LoggedIn");
			} 
			else 
			{
			  // Faulty password.
			  response.status(401).redirect("/sample_data/Error");
			}
		  });
		});
	  }
	  else 
	  {
		response.status(401).redirect("/sample_data/Error");
	  }
}