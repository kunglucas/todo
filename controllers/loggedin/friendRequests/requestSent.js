//Display user error.
exports.requestSent = function requestSent(request, response)
{
	response.render('sample_data', {title:'Lucas todo application', action:'requestSent'});
    return;
}