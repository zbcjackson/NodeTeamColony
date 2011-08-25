define(function(require, exports, module){
	var Task = Backbone.Model.extend({
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

	return Backbone.Collection.extend({
		model: Task,
		url: '/tasks'
	});
});
