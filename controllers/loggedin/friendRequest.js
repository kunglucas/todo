const { alreadyFriends } = require('./friendRequests/alreadyFriends');
const { alreadySentRequest } = require('./friendRequests/alreadySentRequest');
const { requestSent } = require('./friendRequests/requestSent');
const { userDoesNotExist } = require('./friendRequests/userDoesNotExist');
const joi = require("joi");
const database = require('../../database');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = process.env.secretKey;

//Send friend request.
exports.friendRequest = function friendRequest(request, response) 
{	
    const token = request.cookies.jwt;
    const schema = joi.object({
        friendId: joi.number().integer().positive().required()
    });

    const validation = schema.validate(request.query);
    if (validation.error) {
        response.status(400).send(validation.error.details[0].message);
        return;
    }

    const friendId = request.query.friendId;

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
            const dbusername = username;
            const query = "SELECT * FROM users WHERE username='" + dbusername + "'";
            database.query(query, function(error, data){
                if (error) {
                    response.status(500).send('Internal Server Error');
                } else {
                    // Check if the user exists in the users table.
                    if (data.length > 0) {
                        //Retrieve the user's ID.
                        const userId = data[0].id;
                        const query = "SELECT requestFromId, requestToId, pendingStatus FROM `friendrequest` LEFT JOIN users on users.id=friendrequest.requestFromId AND users.id=friendrequest.requestToId WHERE requestFromId=? AND requestToId=?";
                        database.query(query, [userId, friendId], function(error, data) {
                            if (error) {
                                console.log("Error: ", error);
                            } else if (data.length > 0) {
                                const status = data[0].pendingStatus;
                                console.log(status);
                                if(status == 1) {
                                    //Render that you already are friends with the user.
                                    alreadyFriends(request, response);
                                } else {
                                    //Render a message to user that request is already sent.
                                    alreadySentRequest(request, response);
                                }
                            } else {
                                //Send the actual request and check if the request user id exists in the users table.
                                const insertQuery = "INSERT INTO `friendrequest` (`requestFromId`, `requestToId`, `pendingStatus`) VALUES (?, ?, ?)";
                                const values = [userId, friendId, 0]; //Set pendingState to 0 for a new request
                                database.query(insertQuery, values, function (error, result) {
                                    if (error) {
                                        userDoesNotExist(request, response);
                                    } else {
                                        requestSent(request, response);
                                    }
                                });
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
};
