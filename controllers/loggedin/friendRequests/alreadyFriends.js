//Display user error.
exports.alreadyFriends = function alreadyFriends(request, response)
{
	response.render('sample_data', {title:'Lucas todo application', action:'alreadyFriends'});
    return;
}