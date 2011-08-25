define(function(require, exports, module){
	var TaskView = require("view/task");
	var UserView = require("view/user");

	return Backbone.View.extend({
		el: $("body"),

		events: {
			"click #save": "save",
			"click #add": "add"
		},

		initialize: function(){
			this.el = $("body");

			tasks.bind('add', this.addOne, this);
			tasks.bind('reset', this.addAll, this);
			tasks.fetch();

			users.bind('reset', this.renderOnline, this);
			users.fetch();
		},

		save: function(){
			console.dir(tasks);
		},
		add: function(){
			var task = tasks.create();
		},
		addOne: function(task){
			var view = new TaskView({model: task});
			var row = $(view.render().el);
			this.$("table").append(row);
			row.removeClass("new");
		},
		addAll: function(){
			tasks.each(this.addOne);
		},
		checkChange: function(){
			$.post(
				"check", 
				{have: _.map(tasks.models, function(m){
					return {id: m.id, rev: m.attributes["_rev"]};
				})}, 
				function(update){
					for(var i = 0, length = update.changed.length; i < length; ++i){
						var model = tasks.get(update.changed[i]._id);
						model.attributes = update.changed[i];
						model.change();

					}
					for(var i = 0, length = update.added.length; i < length; ++i){
						tasks.add(update.added[i]);
					}
					if (update.added.length || update.changed.length){
						notifier.info("Change found.");
					}
				},
				"json"
			);
		},
		renderUser: function(user){
			var view = new UserView({model: user});
			this.$("#online").append(view.render().el);
		},
		renderOnline: function(){
			this.$("#online").html("");
			users.each(this.renderUser);
		}
	});
});
