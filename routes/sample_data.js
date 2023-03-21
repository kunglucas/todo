/*
Core file to handle all actions on the crud application.
*/
const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();
router.use(cookieParser());
const database = require('../database');
const sample_data = express.Router();
/* Declare all controllers below. */
const { logout } = require('../controllers/authentication/logout');
const { timeline } = require('../controllers/loggedin/timeline');
const { friendRequest } = require('../controllers/loggedin/friendRequest');
const { completeRequest } = require('../controllers/loggedin/editItem');
const { open } = require('../controllers/loggedin/editItem');
const { accept } = require('../controllers/loggedin/acceptRequest');
const { Error } = require('../controllers/authentication/Error');
const { CreateTodo } = require('../controllers/loggedin/publish');
const { registerAcc } = require('../controllers/authentication/registerAccount');
const { loginAcc } = require('../controllers/authentication/login');
//Pages.
const { Main } = require('../controllers/pages/main.js');
const { Register } = require('../controllers/pages/register');
const { Profile } = require('../controllers/pages/LoggedIn');
const { checkRequest } = require('../controllers/pages/request');


//Routes.
router.get('/', Main);
router.get('/add', Register);
router.get('/accept', accept);
router.get('/logout', logout);
router.get('/LoggedIn', Profile);
router.get('/timeline', timeline);
router.get('/request', checkRequest);
router.get('/friendId', friendRequest);
router.get('/complete', completeRequest);
router.get('/Error', Error);
router.get('/reopen', open);
router.post('/add_sample_data', registerAcc);
router.post('/publish', CreateTodo);
router.post('/login_sample_data', loginAcc);
exports.sample_data = sample_data;



module.exports = router;