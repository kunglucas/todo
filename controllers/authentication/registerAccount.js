const { UserError } = require('./UserError');

const database = require('../../database');
const bcrypt = require('bcryptjs');
//Joi for validation on register process.
const joi = require("joi");
const schema = joi.object({
    username: joi.string().min(6).max(255).required(),
    password: joi.string().min(6).max(255).required(),
    first_name: joi.string().min(2).max(255).required(),
    last_name: joi.string().min(2).max(255).required(),
  });

//Register account process...
exports.registerAcc = function registerAcc(request, response)
{
	const validation = schema.validate(request.body);
	const first_name = request.body.first_name;
	const last_name = request.body.last_name;
	const username = request.body.username;
	const password = request.body.password;
	if (!validation.error) 
	{
		const saltRounds = 10;
		const query = `SELECT * FROM users WHERE username="${username}"`;
		database.query(query, function(error, data){
	
			if(error)
			{
				throw error;
			}	
			else
			{
	
				if(data.length > 0) //Username already registered.
				{
					UserError(request, response);
				}
				//Insert information inside table.
				else 
				{
	
					bcrypt.hash(password, saltRounds, function(err, hash) {
						//Store hash in database
						const query = `INSERT INTO users (username, firstname, surname, password) VALUES ("${username}", "${first_name}", "${last_name}", "${hash}")`;
						database.query(query, function(error, data){
						if (error) 
						  {
							throw error;
						  }
						  else
						  {
							//Redirect to root.
							response.status(202).redirect("/sample_data/");
						  }
						});
	
					  });
				}
			}
	
		});

	} 
	else 
	{
		response.status(401).send(validation.error.message);
	}
}