//Display user error.
exports.userDoesNotExist = function userDoesNotExist(request, response)
{
	response.render('sample_data', {title:'Lucas todo application', action:'userDoesNotExist'});
    return;
}
