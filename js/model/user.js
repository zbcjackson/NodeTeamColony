define(function(require, exports, module){	
	var User = Backbone.Model.extend({
		
	});

	return Backbone.Collection.extend({
		model: User,
		url: '/users'
	});
});
