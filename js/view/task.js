define(function(require, exports, module){
	return Backbone.View.extend({
		tagName: "tr",
		template: "",
		events: {
			"change input": "updateOnChange",
			"keypress input[type='text']": "updateOnEnter",
			"click .delete": "remove"
		},
		initialize: function(){
			this.template = $("#taskTemplate").html();
			this.model.bind("change", this.render, this);
			this.model.bind("change:order", this.saveOrder, this);
			this.model.bind("destroy", this.removeEl, this);
		},
		saveOrder: function(){
			console.log("save order");
			this.model.save();
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
		},
		remove: function(){
			this.model.destroy();
		},
		removeEl: function(){
			$(this.el).remove();
		}
	});
});
