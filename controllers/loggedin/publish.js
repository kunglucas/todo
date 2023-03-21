const database = require('../../database');
const he = require('he');
//Create a new todo.
exports.CreateTodo = function CreateTodo(request, response)
{
		//Joi for validation on posts.
        const joi = require("joi");
        const schema = joi.object({
            textContent: joi.string().min(6).max(3000).required(),
            title: joi.string().min(3).max(100).required(),
        });
    
        const jwt = require('jsonwebtoken');
        const dotenv = require('dotenv');
        dotenv.config();
        const secretKey = process.env.secretKey;
        const title = request.body.title;
        const textContent = he.decode(request.body.text);
        const token = request.cookies.jwt;
    
        const validation = schema.validate({textContent: textContent, title: title});
        if (!validation.error) 
        {
            if (!token) 
            {
                //JWT cookie is not set, redirect to login page
                response.status(401).redirect('/sample_data');
                return;
            }
            try
            {
              const decoded = jwt.verify(token, secretKey);
              //Get the session cookie data
              const username = decoded.username;	
                if (username) 
                {
                  const dbusername = username;
                  const query = "SELECT * FROM users WHERE username='" + dbusername + "'";
                  database.query(query, function(error, data){
                    if (error) 
                    {
                      throw error;
                    }
                    else
                    {
                      //Retrieve the user's ID.
                      const userId = data[0].id;
                      const strippedContent = textContent.replace(/(<([^>]+)>)/gi, ""); //strip HTML tags
                      const query = 'INSERT INTO todos (userId, dbUsername, title, description) VALUES (?, ?, ?, ?)';
                      const values = [userId, dbusername, title, strippedContent];
                      database.query(query, values, function(error, data){
                      if (error) 
                      {
                          response.status(500).send('Internal Server Error');
                      }
                      else
                      {
                          //Redirect the user to the todo feed.
                          response.status(202).redirect(`/sample_data/timeline`);
                          response.end();
                      }
                      });
    
                    }
                  });
                }
              }
              catch (error) {
                  // JWT verification failed, redirect to login page.
                  console.error(error);
                  response.redirect('/sample_data');
                  return;
                } 
        }
    
        else 
        {
            response.status(406).send(validation.error.message);
        }
}