//Display user error.
exports.UserError = function UserError(request, response)
{

	response.render("sample_data", {title:'Faulty login credentials', action:'User'});
    return;
}