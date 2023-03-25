const database = require('../../database');
const joi = require("joi");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = process.env.secretKey;

const schema = joi.object({
  todo: joi.number().integer().positive().required()
});

exports.completeRequest = function completeRequest(request, response) {
  const token = request.cookies.jwt;

  const validation = schema.validate(request.query);
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

  const todoID = request.query.todo;

  if (!token) {
    response.status(401).redirect('/sample_data');
    return;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const username = decoded.username;

    if (username) {
      const userQuery = `SELECT id FROM users WHERE username = ?`;
      database.query(userQuery, [username], function(error, results, fields) {
        if (error) {
          response.status(500).send('Internal server error.');
        } else {
          const userId = results[0].id;
          const selectQuery = `SELECT * FROM todos WHERE todoID = ? AND userId = ?`;
          database.query(selectQuery, [todoID, userId], function(error, results, fields) {
            if (error) {
              response.status(500).send('Internal server error');
            } else if (results.length === 0) {
              response.status(404).send('Todo was not found');
            } else {
              const updateQuery = `UPDATE todos SET pendingState = 1 WHERE todoID = ? AND userId = ?`;
              database.query(updateQuery, [todoID, userId], function(error, results, fields) {
                if (error) {
                  response.status(500).send('Internal server error');
                } else {
                  response.render('sample_data', { title: 'Lucas todo application', action: 'finish' });
                }
              });
            }
          });
        }
      });
    } else {
      response.status(401).redirect('/sample_data');
    }
  } catch (error) {
    response.status(401).redirect('/sample_data');
  }
};

//Set pendingState to 0.
exports.open = function open(request, response) {
  const token = request.cookies.jwt; 
    const validation = schema.validate(request.query);
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
    const todoID = request.query.todo;
  
    if (!token) {
      //JWT cookie is not set, redirect to login page.
      response.status(401).redirect('/sample_data');
      return;
    }
    
    try {
      const decoded = jwt.verify(token, secretKey);
      //Get the session cookie data
      const username = decoded.username;  
      if (username) {
        //Update the todo to pending state if the user id matches the userId.
        const userQuery = `SELECT id FROM users WHERE username = ?`;
        database.query(userQuery, [username], function(error, results, fields) {
          if (error) {
            response.status(500).send('Error checking user');
          } else {
            const userId = results[0].id;
            const todoQuery = `UPDATE todos SET pendingState = 0 WHERE todoID = ? AND userId = ?`;
            database.query(todoQuery, [todoID, userId], function(error, results, fields) {
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
        response.status(401).redirect('/sample_data');
      }
    }
    catch (error) {
      //JWT verification failed, redirect to login page.
      response.status(401).redirect('/sample_data');
      return;
    } 
  };