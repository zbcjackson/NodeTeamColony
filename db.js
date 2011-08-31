console.log("DB initialization started...");
var cradle = require('cradle');

var db = new(cradle.Connection)('http://localhost', 5984).database('colony');

console.log("Check whether db exists...");
db.exists(function(err, exists){
	if (!exists){
		console.log("DB not found");
		console.log("Creating db...");
		db.create();
		console.log("Done");
	}
	else{
		console.log("DB found");
	}

	console.log("Creating a tasks view...");
	db.save('_design/tasks', {
		all: {
			map: function(doc) {
				emit(doc.order, doc);
			}
		}
	});
	console.log("Done");
});

console.log("DB initialization done");
