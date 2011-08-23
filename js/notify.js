var Notifier = function(){
	this.init();
};
Notifier.prototype = {
	container: null,
	init: function(){
		this.container = $("<div id='notify'></div>").appendTo("body");
		$("<div id='info'><p>#{text}</p></div>").appendTo(this.container);
		$("<div id='error' class='ui-state-error'><a class='ui-notify-close' href='#'><span class='ui-icon ui-icon-close' style='float:right'></span></a><span style='float:left; margin:2px 5px 0 0;' class='ui-icon ui-icon-alert'></span><p>#{text}</p></div>").appendTo(this.container);
		this.container.notify();
	},
	error: function(text){
		this.container.notify("create", "error", {text: text}, {custom: true});
	},
	info: function(text){
		this.container.notify("create", "info", {text: text});
	}
};
$(function(){
	window.notifier = new Notifier;
});
