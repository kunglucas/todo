const database = require('../../database');
//Joi for validation on register process.
const joi = require("joi");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = process.env.secretKey;

//Set pendingState to 1.
exports.accept = function accept(request, response) {
  //Check if JWT cookie is set.
const token = request.cookies.jwt;
  //Declare friends id.
  const acceptId = request.query.userId;
  if (!token) {
    // JWT cookie is not set, redirect to login page
    response.status(401).redirect('/sample_data');
    return;
  }
  try {
	  const decoded = jwt.verify(token, secretKey);
        //Get the session cookie data
        const username = decoded.username;
        if (username) {
          //Complete the todo id if the user id matches the userId.
          const userQuery = `SELECT id FROM users WHERE username = ?`;
          database.query(userQuery, [username], function(error, results, fields) {
            if (error) {
              response.status(500).send('Internal server error.');
            } 
            else 
            {
              const schema = joi.object({
                acceptId: joi.number().integer().positive().required()
              });

              const validation = schema.validate({acceptId: acceptId});
              if (!validation.error) 
              {
                const userId = results[0].id;
                const selectQuery = `SELECT * FROM friendrequest WHERE requestFromId = ? AND requestToId = ?`;
                database.query(selectQuery, [acceptId, userId], function(error, results, fields) {
                  if (error) {
                    response.status(500).send('Internal server error');
                  } else if (results.length === 0) {
                    response.status(404).send('Todo was not found');
                  } else {
                    const updateQuery = `UPDATE friendrequest SET pendingStatus = 1 WHERE requestFromId = ? AND requestToId = ?`;
                    database.query(updateQuery, [acceptId, userId], function(error, results, fields) {
                      if (error) {
                        response.status(500).send('Internal server error');
                      } else {
                        response.status(200).redirect("/sample_data/request");
                      }
                    });
                  }
                });
              }
              else 
              {
                response.status(406).send(validation.error.message);
              }
            }
          });
        }
        else {
          response.status(401).redirect('/sample_data');
          }
  }
  
  catch (error) {
	  //JWT verification failed, redirect to login page.
	  response.status(401).redirect('/sample_data');
	  return;
	} 
};