$(function(){
	window.Task = Backbone.Model.extend({
		defaults: {
			"name": "",
			"estimation": 1,
			"translator": "",
			"translateFinish": false,
			"reviewer1": "",
			"review1Finish": false,
			"reviewer2": "",
			"review2Finish": false
		},
		idAttribute: "_id"
	});

	window.TaskList = Backbone.Collection.extend({
		model: Task,
		url: '/tasks'
	});

	window.tasks = new TaskList;

	window.TaskView = Backbone.View.extend({
		tagName: "tr",
		template: $('#taskTemplate').html(),
		events: {
			"change input": "updateOnChange",
			"keypress input[type='text']": "updateOnEnter"
		},
		initialize: function(){
			this.model.bind("change", this.render, this);
		},
		render: function(){
			$(this.el).addClass("new").html(Mustache.to_html(this.template, this.model.toJSON()));
			var self = this;
			setTimeout(function(){$(self.el).removeClass("new");}, 1000);
			return this;
		},
		updateOnChange: function(e){
			this.update(e);
		},
		updateOnEnter: function(e){
			if (e.keyCode == 13){
				this.update(e);
			}
		},
		update: function(e){
			var element = $(e.srcElement);
			var value = element.attr("type") === "text" ? element.val() : (element.attr("checked") ? true : false);
			var key = element.attr("data");
			var updateData = {};
			updateData[key] = value;
			this.model.save(updateData, 
				{
					error: function(model, jqXhr, options) {
						notifier.error(jqXhr.responseText);
						model.fetch();
					}
				});
		}
	});

	window.AppView = Backbone.View.extend({
		el: $("body"),

		events: {
			"click #save": "save",
			"click #add": "add"
		},

		initialize: function(){
			tasks.bind('add', this.addOne, this);
			tasks.bind('reset', this.addAll, this);
			tasks.fetch();
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
		}
	});

	window.app = new AppView;
});
