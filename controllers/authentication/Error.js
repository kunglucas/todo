//Display user error.
exports.Error = function Error(request, response)
{
    response.render("sample_data", {title:'Faulty login credentials', action:'Error'});
}