//Display the main page.
exports.Register = function Register(request, response)
{
	response.render("sample_data", {title:'Register account to create todo list/s', action:'add'});
}