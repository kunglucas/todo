const database = require('../../database');
//Joi for validation on register process.
const joi = require("joi");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = process.env.secretKey;

//Delete todo item.
exports.deletePost = function deletePost(request, response) {
    //Start to validate the todo item.
    const token = request.cookies.jwt;
    const schema = joi.object({
        item: joi.number().integer().positive().required()
    });

    const validation = schema.validate(request.query);
    
    if (!token) {
        // JWT cookie is not set, redirect to login page
        response.status(401).redirect('/sample_data');
        return;
    }

    if(!validation.error)
    {
        const item = request.query.item;
        try {
            const decoded = jwt.verify(token, secretKey);
            //Get the session cookie data
            const username = decoded.username;
            if (username) {
                const query = "SELECT * FROM users WHERE username=?";
                database.query(query, [username], function(error, data){
                    if (error) {
                        response.status(500).send('Internal Server Error');
                    } else {
                        // Check if the user exists in the users table.
                        if (data.length > 0) {
                            //Retrieve the user's ID.
                            const userId = data[0].id;
                            const query = "SELECT * FROM todos WHERE userId=? AND todoID=?";
                            database.query(query, [userId, item], function(error, data) {
                                if (error) {
                                    response.status(500).send('Internal server error.');
                                } if (data.length > 0) 
                                {
                                    //Send the actual request and check if the request user id exists in the users table.
                                    const deleteQuery = "DELETE FROM todos WHERE  todoID=?";
                                    const values = [item]; //Set pendingState to 0 for a new request
                                    database.query(deleteQuery, values, function (error, result) {
                                        if (error) {
                                            response.status(500).send('Internal Server Error');
                                        } else {
                                            response.status(201).render("sample_data", { title: "Lucas todo application",action: "removed"});
                                        }
                                    }); 
                                }
                                else
                                {
                                    console.log("We could not find the item you where looking for..");
                                } 
                            });
                        }
                    }
                });
            }
        } catch (error) {
            //JWT verification failed, redirect to login page.
            response.status(401).redirect('/sample_data');
            return;
        }
    }

    else
    {
        response.status(400).send(validation.error.details[0].message);
    }
};
