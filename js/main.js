define(function(require, exports, module){
	var TaskList = require("model/task");
	var UserList = require("model/user");
	var App = require("view/app");
	var Notifier = require("notify");

	$(function(){
		window.tasks = new TaskList;
		window.users = new UserList;
		window.app = new App;
		window.notifier = new Notifier;

		setInterval(function(){
			app.checkChange();
			users.fetch();	
		}, 60000);
	});
});
