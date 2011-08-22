var express = require('express');
var mustache = require('mustache');
var cradle = require('cradle');
var fs = require('fs');

var db = new(cradle.Connection)('http://teamcolony.iriscouch.com', 80).database('colony');

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

var app = express.createServer(express.logger(), express.bodyParser());
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.get('/', express.static(__dirname +'/'));
app.set("view options", {layout: false});
app.register('.mustache', tmpl);

//app.get('/', function(request, response, next) {
//	db.view('task/all', function(err, doc){
//		var tasks = [];
//		doc.rows.forEach(function(row){
//			tasks.push(row.value);
//		});
//		response.render('index.mustache', {locals:{tasks: tasks}});
//	});
//});

app.get('/tasks/:id?', function(request, response) {
	if (request.params.id) {
		console.log("Read the task " + request.params.id);
	}
	else {
		console.log("Read tasks");
		db.view('tasks/all', function(err, doc){
			var tasks = [];
			doc.rows.forEach(function(row){
				tasks.push(row.value);
			});
			response.send(tasks);
		});
	}
});

app.post('/tasks', function(request, response) {
	console.log("Create a task");
	console.log(request.body);
	db.save(request.body, function(err, doc) {
		response.send({_id: doc.id, _rev: doc.rev});
	});
});

app.put('/tasks/:id', function(request, response) {
	console.log("Update the task " + request.params.id);
	console.log(request.body);
	db.save(request.params.id, request.body, function(err, doc){
		console.log(err);
		console.log(doc);
		response.send({});
	});
});

app.delete('/tasks/:id', function(request, response) {
	console.log("Delete the task " + request.params.id);
	consoel.log(request.body);
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});
