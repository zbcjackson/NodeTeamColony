var express = require('express');
var Controller = require('./controller');
var _ = require('underscore');

var controller = new Controller;
var sessionStore = new express.session.MemoryStore;
var server = express.createServer(express.bodyParser());
var port = process.env.PORT || 3000;

var App = module.exports = function App(){
	this.config();
};

App.prototype = {
	start: function(){
		server.listen(port, function(){
		  console.log("Listening on " + port);
		});
	},
	config: function(){
		this.session();
		this.static();
		this.routes();
	},
	session: function(){
		server.use(express.cookieParser());
		server.use(express.session({ secret: "secret_key", store: sessionStore, cookie: {maxAge: 300000} }));

		setInterval(this.clearExpiredSession, 100000);
	},
	clearExpiredSession: function(){
		_.each(sessionStore.sessions, function(sessionString, id){
			var session = JSON.parse(sessionString),
				expires = 'string' == typeof session.cookie.expires ? new Date(session.cookie.expires) : session.cookie.expires;
			if (!expires || new Date >= expires) {
				sessionStore.destroy(id);
			}
		});
	},
	static: function(){
		server.use('/css', express.static(__dirname + '/css'));
		server.use('/js', express.static(__dirname + '/js'));
		server.use('/img', express.static(__dirname + '/img'));
	},
	routes: function(){
		this.home();
		this.fetchTask();
		this.createTask();
		this.updateTask();
		this.deleteTask();
		this.checkUpdates();
		this.onlineUsers();
	},
	home: function(){
		server.get('/', function(request, response, next){
			express.static(__dirname + '/')(request, response, next);
		});
	},
	fetchTask: function(){
		server.get('/tasks/:id?', function(request, response) {
			if (request.params.id) {
				controller.getTask(request.params.id, function(task){
					response.json(task);
				});
			}
			else {
				controller.getAllTasks(function(tasks){
					response.json(tasks);
				});
			}
		});
	},
	createTask: function(){
		server.post('/tasks', function(request, response) {
			controller.createTask(request.body, function(success, task){
				response.json({_id: task.id, _rev: task.rev});
			});
		});
	},
	updateTask: function(){
		server.put('/tasks/:id', function(request, response) {
			controller.updateTask(request.params.id, request.body, function(success, result){
				if (success){
					response.json({_rev: result.rev});
				}
				else{
					response.send(result, 500);
				}
			});
		});
	},
	deleteTask: function(){
		server.delete('/tasks/:id', function(request, response) {
			controller.deleteTask(request.params.id, function(){
				response.send(204);
			});
		});
	},
	checkUpdates: function(){
		server.post('/check', function(request, response){
			controller.checkUpdates(request.body.have, function(added, changed){
				response.json({added: added, changed: changed});
			});
		});
	},
	onlineUsers: function(){
		server.get('/users', function(request, response){
			response.json(_.map(sessionStore.sessions, function(sessionString, id){
				var session = new express.session.Session(request, JSON.parse(sessionString));
				var expires = session.cookie.expires;
				session.cookie = new express.session.Cookie(session.cookie);
				if ('string' == typeof expires) session.cookie.expires = new Date(expires);
				return {id: id, maxAge: session.cookie.maxAge, expires: session.cookie.expires};
			}));
		});
	}
};

