const database = require('../../database');

exports.timeline = function timeline(request, response) {

	const jwt = require('jsonwebtoken');
	const dotenv = require('dotenv');
	dotenv.config();
	const secretKey = process.env.secretKey;
	//Check if JWT cookie is set.
	const token = request.cookies.jwt;

  if (!token) {
    // JWT cookie is not set, redirect to login page
    response.redirect('/sample_data');
    return;
  }
  let sessionData = null;
  try {
    sessionData = jwt.verify(token, secretKey);
  } catch (error) {
    // JWT is invalid, redirect to login page
    response.redirect('/sample_data');
    return;
  }

  const username = sessionData.username;

  const query = "SELECT id FROM users WHERE username = ?";
  database.query(query, [username], function (error, result) {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else {
      const userId = result[0].id;

      // Fetch data from database
      const query = `
        SELECT DISTINCT todos.*, 
          (CASE
            WHEN (friendrequest.pendingStatus = 1 AND (friendrequest.requestToId = ? OR friendrequest.requestFromId = ?))
            THEN 1
            ELSE 0
          END) AS isFriends,
          users.username AS username
        FROM todos
        LEFT JOIN friendrequest ON (
          friendrequest.requestToId = todos.userId 
          OR friendrequest.requestFromId = todos.userId
        ) 
        AND friendrequest.pendingStatus = 1 
        LEFT JOIN users ON users.id = todos.userId 
        ORDER BY todoID DESC
        LIMIT 30
      `;
      database.query(query, [userId, userId], function (error, data) {
        if (error) {
          throw error;
        } else {
          // Fetch data from database
          const query = "SELECT * FROM users WHERE id = ?";
          database.query(query, [userId], function (error, fetched) {
            if (error) {
              throw error;
            } else {
              // Render the template with the fetched data and the username
              const user = {
                id: userId,
                username: username,
              };
              response.status(201).render("sample_data", { title: "Lucas todo application",action: "timeline", feedData: data, userFeed: fetched, user: user });
            }
          });
        }
      });
      
      
    }
  });
};