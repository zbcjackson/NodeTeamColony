define(function(require, exports, module){
	return Backbone.View.extend({
		tagName: "img",
		render: function(){
			$(this.el).attr("src", "pic/avatar.png");
			return this;
		}
	});
});
