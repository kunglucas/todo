//Display the main page.
exports.Main = function Main(request, response)
{
	response.render("sample_data", {title:'Enter login credentials', action:'list'});
}