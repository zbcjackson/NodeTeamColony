$(function(){
	setInterval(function(){
		app.checkChange();
		users.fetch();	
	}, 60000);
});
