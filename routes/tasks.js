var express = require('express');
var router = express.Router();
var Task = require('../models/task.js').Model;
var User = require('../models/user.js').Model;
var Tag = require('../models/tag.js').Model;

router.get('/', function(req, res, next){
	// get user id for query
	var user_id = req.query.user_id;
	// query for tasks in user doc
	User.findById(user_id, function (err, user) {
		if(err) {
			res.status(400).send(err.message);
		}
		// if the array is empty, display nothing
		if(user.tasks.length == 0) {
			res.send('No tasks created.');
		}else {
			// send back tasks array as json
			res.status(200).json(user.tasks);
		}
	});
});

router.post('/', function(req, res, next) {
	if(req.body.user_id === undefined || !req.body.user_id.length) {
		res.status(400).send("No user sent.");
	}else if(req.body.task === undefined) {
		res.status(400).send("No task sent.");
	}else {
		// save task to temp for modification
		var temp = req.body.task;
		// get user id for queries
		var user_id = req.body.user_id;
		// clear out the start_date property if not set, model will update that
		if (temp.start_date == null || temp.start_date === "undefined") {
			delete temp["start_date"];
		}
		var task = new Task(temp);

		// insert task to user, complete with tag ids array
		Tag.processTags(user_id, temp.tags, function (tags) {
			task.tags = [];
			task.tags = tags;
			// push new task to user
			User.findByIdAndUpdate(user_id, {$push: {'tasks': task}}, {
				safe: true,
				upsert: false,
				new: true
			}, function (err, user) {
				if (err) {
					console.log(err, err.message);
					res.status(400).send(err.message);
				} else {
					res.status(200).send("Successfully inserted new task.");
				}
			});
		});
	}
});

module.exports = router;