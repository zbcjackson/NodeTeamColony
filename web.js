var express = require('express');
var mustache = require('mustache');
var cradle = require('cradle');
var fs = require('fs');
var _=require('underscore');

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

var sessionStore = new express.session.MemoryStore;
var app = express.createServer(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: "secret_key", store: sessionStore, cookie: {maxAge: 300000} }));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));
app.set("view options", {layout: false});
app.register('.mustache', tmpl);

app.get('/', function(request, response, next){
	express.static(__dirname + '/')(request, response, next);
});

app.get('/tasks/:id?', function(request, response) {
	if (request.params.id) {
		console.log("Read the task " + request.params.id);
		db.get(request.params.id, function(err, doc){
			console.log(doc);
			response.json(doc);
		});
	}
	else {
		console.log("Read tasks");
		db.view('tasks/all', function(err, doc){
			var tasks = [];
			doc.rows.forEach(function(row){
				tasks.push(row.value);
			});
			response.json(tasks);
		});
	}
});

app.post('/tasks', function(request, response) {
	console.log("Create a task");
	console.log(request.body);
	db.save(request.body, function(err, doc) {
		response.json({_id: doc.id, _rev: doc.rev});
	});
});

app.put('/tasks/:id', function(request, response) {
	console.log("Update the task " + request.params.id);
	console.log(request.body);
	db.save(request.params.id, request.body, function(err, doc){
		console.log(err);
		console.log(doc);
		if (err){
			response.send("Update conflict!", 500);
		}
		else{
			response.json({_rev: doc.rev});
		}
	});
});

app['delete']('/tasks/:id', function(request, response) {
	console.log("Delete the task " + request.params.id);
	db.get(request.params.id, function(getErr, doc){
		db.remove(request.params.id, doc._rev, function(removeErr, removedDoc){
			console.log("Remove Handler");
		});
		response.send(204);
	});
});

app.post('/check', function(request, response){
	db.view('tasks/all', function(err, doc){
		var result = {added: [], changed: []};
		var have = request.body.have;
		if (doc && doc.rows){
			doc.rows.forEach(function(row){
				var existingTask = _.detect(have, function(task){
					return row.value._id === task.id;
				});
				if (existingTask){
					if (row.value._rev != existingTask.rev){
						result.changed.push(row.value);
					}
				}
				else{
					result.added.push(row.value);
				}
			});
		}
		response.json(result);
	});
});

app.get('/users', function(request, response){
	response.json(_.map(sessionStore.sessions, function(sessionString, id){
		var session = new express.session.Session(request, JSON.parse(sessionString));
		var expires = session.cookie.expires;
		session.cookie = new express.session.Cookie(session.cookie);
		if ('string' == typeof expires) session.cookie.expires = new Date(expires);
		return {id: id, maxAge: session.cookie.maxAge, expires: session.cookie.expires};
	}));
});

setInterval(function(){
	_.each(sessionStore.sessions, function(sessionString, id){
		var session = JSON.parse(sessionString),
			expires = 'string' == typeof session.cookie.expires ? new Date(session.cookie.expires) : session.cookie.expires;
		if (!expires || new Date >= expires) {
			sessionStore.destroy(id);
		}
	});
}, 100000);

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});
