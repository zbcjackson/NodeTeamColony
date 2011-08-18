var express = require('express');
var mustache = require('mustache');
var cradle = require('cradle');
var fs = require('fs');

var db = new(cradle.Connection)().database('colony');

var tmpl = {
	compile: function(source, options){
		if (typeof source == 'string'){
			return function(options){
				options.locals = options.locals || {};
				options.partials = options.partials || {};
				if (options.body){
					locals.body = options.body;
				}
				return mustache.to_html(source, options.locals, options.partials);
			};
		}
		else{
			return source;
		}
	},
	render: function(template, options){
		tempalte = this.compile(template, options);
		return template(options);
	}
};

var app = express.createServer(express.logger());
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.set("view options", {layout: false});
app.register('.mustache', tmpl);

app.get('/', function(request, response) {
	fs.readFile('index.html', function(err, text){
		response.write(text);
		response.end();
	});
//	db.view('task/all', function(err, doc){
//		var tasks = [];
//		doc.rows.forEach(function(row){
//			tasks.push(row.value);
//		});
//		response.render('index.mustache', {locals:{tasks: tasks}});
//	});
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});
