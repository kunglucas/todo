const database = require('../../database');
//Send friend request.
exports.checkRequest = function checkRequest(request, response) 
{	
            const jwt = require('jsonwebtoken');
            const dotenv = require('dotenv');
            dotenv.config();
            const secretKey = process.env.secretKey;
			const token = request.cookies.jwt;			 

			if (!token) {
				// JWT cookie is not set, redirect to login page
				response.status(401).redirect('/sample_data');
				return;
			  }
			  try
			  {
				const decoded = jwt.verify(token, secretKey);
				//Get the session cookie data
				const username = decoded.username;
                if (username) {
                    const dbusername = username;
                    const query = "SELECT * FROM users WHERE username='" + dbusername + "'";
                    database.query(query, function(error, data) {
                      if (error) {
                        response.status(500).send('Internal Server Error');
                      } else {
                        // Retrieve the user ID from the first row of the data object
                        const userId = data[0].id;
                        // Use the user ID to fetch additional user data
                        const userQuery = "SELECT * FROM friendrequest LEFT JOIN users on users.id=friendrequest.requestFromId WHERE requestToId = ? AND pendingStatus=0";
                        database.query(userQuery, [userId], function(error, fetched) {
                          if (error) {
                            throw error;
                          } else {
                            // Render the template with the fetched data and the username
                            const user = {
                              id: userId,
                              username: username,
                            };
                            response.status(201).render('sample_data', { title: 'Lucas todo application', action: 'request', numbReq: fetched, user: user });
                          }
                        });
                      }
                    });
                  }
	
				}

				catch (error) {
					//JWT verification failed, redirect to login page.
					response.status(401).redirect('/sample_data');
					return;
				  } 

};