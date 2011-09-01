var cradle = require('cradle');
var _ = require('underscore');

var db = new(cradle.Connection)('http://localhost', 5984).database('colony');
var Controller = module.exports = function Controller(){
};

Controller.prototype = {
	getTask: function(id, callback){
		console.log("Read the task " + id);
		db.get(id, function(err, doc){
			console.log(doc);
			callback(doc);
		});
	},
	getAllTasks: function(callback){
		console.log("Read tasks");
		db.view('tasks/all', function(err, doc){
			var tasks = [];
			doc.rows.forEach(function(row){
				tasks.push(row.value);
			});
			callback(tasks);
		});
	},
	createTask: function(task, callback){
		console.log("Create a task");
		console.log(task);
		db.save(task, function(err, doc) {
			callback(true, doc);
		});
	},
	updateTask: function(id, task, callback){
		console.log("Update the task " + id);
		db.save(id, task, function(err, doc){
			if (err){
				callback(false, "Update conflict!");
			}
			else{
				callback(true, doc);
			}
		});
	},
	deleteTask: function(id, callback){
		console.log("Delete the task " + id);
		db.get(id, function(getErr, doc){
			db.remove(id, doc._rev, function(removeErr, removedDoc){
				console.log("Remove Handler");
			});
			callback();
		});
	},
	checkUpdates: function(have, callback){
		db.view('tasks/all', function(err, doc){
			var added = [], changed = [];
			if (doc && doc.rows){
				doc.rows.forEach(function(row){
					var existingTask = _.detect(have, function(task){
						return row.value._id === task.id;
					});
					if (existingTask){
						if (row.value._rev != existingTask.rev){
							changed.push(row.value);
						}
					}
					else{
						added.push(row.value);
					}
				});
			}
			callback(added, changed);
		});
	}
};

