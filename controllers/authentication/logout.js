const cookie = require('cookie');
//Display user error.
exports.logout = function logout(request, response)
{
  // Clear the JWT cookie
  response.clearCookie('jwt');

  // Redirect the user to the login page or any other page of your choice
  response.redirect('/sample_data');
}