const database = require('../../database');
//Joi for validation on register process.
const joi = require("joi");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = process.env.secretKey;

//Set pendingState to 1.
exports.accept = function accept(request, response) {
  const schema = joi.object({
    userId: joi.number().integer().positive().required()
  });
  const validation = schema.validate(request.query);
  //Check if JWT cookie is set.
  const token = request.cookies.jwt;
  if (validation.error) {
    if(token)
    {
      response.status(400).send(validation.error.message);
    }
    else
    {
    //JWT cookie is not set, redirect to login page.
    response.status(401).redirect('/sample_data');
    }
    return;
  }
    //Declare friends id.
    const acceptId = request.query.userId;
    if(!token)
    {
    //JWT cookie is not set, redirect to login page.
    response.status(401).redirect('/sample_data');
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