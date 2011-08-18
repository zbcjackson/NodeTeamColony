$(function(){
	_.templateSettings = {
		interpolate : /\{\{(.+?)\}\}/g,
		evaluate: /\{\{#(.+?)\}\}/g
	};

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
		}
	});

	window.TaskList = Backbone.Collection.extend({
		model: Task,
		localStorage: new Store("tasks")

	});

	window.tasks = new TaskList;

	window.TaskView = Backbone.View.extend({
		tagName: "tr",
		template: $('#taskTemplate').html(),
		events: {
			"change tr input": "update"
		},
		render: function(){
			$(this.el).html(Mustache.to_html(this.template, this.model.toJSON()));
			return this;
		},
		update: function(e){
			var element = $(e.srcElement);
			var value = element.attr('type') === "text" ? element.val() : (element.attr("checked") ? true : false);
			var key = element.attr("data");
			console.log(key, value);
			this.model.attributes[key] = value;
			this.model.save();
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
			tasks.bind('all', this.render, this);
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
			this.$("table").append(view.render().el);
		},
		addAll: function(){
			tasks.each(this.addOne);
		}
	});

	window.app = new AppView;
});
