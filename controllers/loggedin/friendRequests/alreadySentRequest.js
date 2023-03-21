//Display user error.
exports.alreadySentRequest = function alreadySentRequest(request, response)
{
	response.render('sample_data', {title:'Lucas todo application', action:'requestAlreadySent'});
    return;
}