$(function(){
	Backbone.sync = function(method, model, options){
		console.log(method, model);
		options.success(model);
	};

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
		model: Task

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
		update: function(){
			console.dir(arguments);			
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
			this.addOne(task);
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
