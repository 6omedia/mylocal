const express = require('express');
const userRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const mid = require('../../middleware/session');

userRoutes.get('/', mid.jsonLoginRequired, function(req, res){

	res.send({});

});

userRoutes.post('/add', mid.jsonLoginRequired, function(req, res){

	res.send({});

});

userRoutes.post('/edit', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = '0';

	if(!req.body.userId || !req.body.email || !req.body.meta.age || !req.body.meta.website){
    	data.error = 'Invalid Data';
    	res.status(400);
    	return res.json(data);
    }

    User.findById(req.session.userId, function(err, user){

    	if(user.user_role != 'Admin'){
			if(req.session.userId != req.body.userId){
				data.error = 'unauthorized';
		    	res.status(403);
		    	return res.json(data);
			}
		}

		var userObj = {
	        name: req.body.name,
	        updated_at: new Date(),
	        email: req.body.email,
	        meta: {
				age: req.body.meta.age,
				website: req.body.meta.website
	        }  
	    };

		User.update({"_id": req.body.userId}, userObj, function(err, numberAffected){

			if(err){
				if (err.name === 'MongoError' && err.code === 11000) {
					data.error = 'That email address allready exists';
					return res.json(data);
	            }
	            data.error = 'User not found';
	            res.status(404);
				return res.json(data);
			}

			if(numberAffected.nModified == 0){
				data.error = 'User not found';
				res.status(404);
				return res.json(data);
			}

			User.findById(req.body.userId, function(err, updatedUser){

				data.success = '1';
				data.updatedUser = updatedUser;
				return res.json(data);

			});

		});

    });

});

userRoutes.delete('/:userId', mid.jsonLoginRequired, function(req, res){

	let data = {};

	const userId = req.params.userId;

	User.findById(req.session.userId, function(err, user){

		if(user.user_role != 'Admin'){
			if(req.session.userId != userId){
				data.error = 'unauthorized';
		    	res.status(403);
		    	return res.json(data);
			}
		}

		User.findByIdAndRemove(userId, function(err, user){  
    		if(err){
    			data.error = 'User ID does not exist';
    			res.status(400);
    			return res.send(data);
    		}

    		res.status(200);
		    return res.send(data);
		});

	});

});

module.exports = userRoutes;