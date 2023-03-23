const database = require('../../database');

//Display the main page.
exports.Profile = function Profile(request, response)
{
    const jwt = require('jsonwebtoken');
	const dotenv = require('dotenv');
	dotenv.config();
	const secretKey = process.env.secretKey;
	//Check if JWT cookie is set.
	const token = request.cookies.jwt;
	if (!token) 
	{
	  //JWT cookie is not set, redirect to login page.
	  response.status(401).redirect('/sample_data');
	  return;
	}
  
	// verify the JWT data
	try {
	  const decoded = jwt.verify(token, secretKey);
	  // extract the username from the JWT data
	  const username = decoded.username;
	  //Use the username variable for the logged in page.
	  if (username) 
	  {
		const dbusername = username;
		const query = "SELECT * FROM users WHERE username='" + dbusername + "' ORDER BY id ASC";
		database.query(query, function(error, data)
		{
		  if(error)
		  {
			throw error; 
		  }
		  else
		  {
			response.render('sample_data', {title:'Lucas todo application', action:'LoggedIn', sampleData:data});
		  }
  
		});
	  } else 
	  {
		response.status(401).redirect('/sample_data');
	  }
	} catch (error) {
	  // JWT verification failed, redirect to login page.
	  response.status(401).redirect('/sample_data');
	  return;
	}
}