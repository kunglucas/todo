const database = require('../../database');
//Joi for validation on register process.
const joi = require("joi");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = process.env.secretKey;

//Set pendingState to 1.
exports.completeRequest = function completeRequest(request, response) {
  //Check if JWT cookie is set.
const token = request.cookies.jwt;
  //Declare friends id.
  const complete = request.query.todo;
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
                complete: joi.number().integer().positive().required()
              });

              const validation = schema.validate({complete: complete});
              if (!validation.error) 
              {
                const userId = results[0].id;
                const selectQuery = `SELECT * FROM todos WHERE todoID = ? AND userId = ?`;
                database.query(selectQuery, [complete, userId], function(error, results, fields) {
                  if (error) {
                    response.status(500).send('Internal server error');
                  } else if (results.length === 0) {
                    response.status(404).send('Todo was not found');
                  } else {
                    const updateQuery = `UPDATE todos SET pendingState = 1 WHERE todoID = ? AND userId = ?`;
                    database.query(updateQuery, [complete, userId], function(error, results, fields) {
                      if (error) {
                        response.status(500).send('Internal server error');
                      } else {
                        response.render('sample_data', { title: 'Lucas todo application', action: 'finish' });
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

//Set pendingState to 0.
exports.open = function open(request, response) {
    const token = request.cookies.jwt;  
    const todoId = request.query.todo;
  
    if (!token) {
      //JWT cookie is not set, redirect to login page
      response.status(401).redirect('/sample_data');
      return;
    }
    
    try {
      const decoded = jwt.verify(token, secretKey);
      //Get the session cookie data
      const username = decoded.username;  
      if (username) {

        const schema = joi.object({
          todoId: joi.number().integer().positive().required()
        });

        const validation = schema.validate({todoId: todoId});

        if (!validation.error) 
        {
        //Update the todo to pending state if the user id matches the userId.
        const userQuery = `SELECT id FROM users WHERE username = ?`;
        database.query(userQuery, [username], function(error, results, fields) {
          if (error) {
            response.status(500).send('Error checking user');
          } else {
            const userId = results[0].id;
            const todoQuery = `UPDATE todos SET pendingState = 0 WHERE todoID = ? AND userId = ?`;
            database.query(todoQuery, [todoId, userId], function(error, results, fields) {
              if (error) {
                console.log(error);
                response.status(500).send('Error updating todo');
              } else {
                response.render('sample_data', { title: 'Lucas todo application', action: 'open' });
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
      else 
      {
        response.status(401).redirect('/sample_data');
      }
    }
    catch (error) {
      //JWT verification failed, redirect to login page.
      response.status(401).redirect('/sample_data');
      return;
    } 
  };