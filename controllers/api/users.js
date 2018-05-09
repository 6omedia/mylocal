const express = require('express');
const userRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const pagination = require('../../helpers/pagination');
const bcrypt = require('bcrypt');
const mid = require('../../middleware/session');

userRoutes.get('/', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = 0;

	if(req.session.user.user_role == '' || req.session.user.user_role == 'Subscriber'){
		res.status(403);
		data.error = 'Permission Denied';
		return res.send(data);
	}

	let obj = {};

	if(req.query.role){
		obj.user_role = req.query.role;
	}

	var docsPerPage = 20;

	User.count({}, function(err, count){

		if(err){
			next(err);
		}

		User.find(obj)
			.sort({created_at: 1})
			.limit(docsPerPage)
			.skip(pagination.getSkip(req.query.page || 1, docsPerPage))
			.exec(function(err, users){

			if(err){
				data.error = err.message || 'Internal Server Error';
		    	res.status(err.status || 500);
		    	return res.json(data);
			}

			data.success = 1;
			data.users = users;
			paginationLinks = pagination.getLinks(count, docsPerPage, req.query.page || 1);
			res.status(200);
			return res.send(data);

		});

	});

});

userRoutes.get('/:userId', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = 0;

	if(req.session.user.user_role == 'Subscriber' || req.session.user.user_role == 'Editor'){
		if(req.session.user._id != req.params.userId){
			res.status(403);
			data.error = 'Permission Denied';
			return res.send(data);
		}		
	}

	User.findById(req.params.userId, function(err, user){

		if(err){
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}

		data.success = 1;
		data.user = user;
		res.status(200);
		return res.send(data);

	});

});

userRoutes.post('/add', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = 0;

	const userRole = req.session.user.user_role;

	// console.log('fvfbv ', req.body);

	if(userRole == '' || userRole == 'Subscriber' || userRole == 'Editor'){
		res.status(403);
		data.error = 'Permission Denied';
		return res.send(data);
	}

	if(userRole != 'Super Admin'){
		if(req.body.user_role == 'Super Admin'){
			res.status(403);
			data.error = userRole + ' Cannot Create a Super Admin';
			return res.send(data);
		}
	}

	if(!req.body.email || !req.body.name || !req.body.confirm_password || !req.body.password){
		res.status(400);
		data.error = 'Invalid Data';
		return res.send(data);
	}

	var userObj = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirm_password: req.body.confirm_password,
        user_role: req.body.user_role || 'Subscriber'
    };

    User.registerUser(userObj, function(err, user){

        var error = '';

        if(err){
            data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
        }

   		data.success = 1;
		data.user = user;
		res.status(200);
		return res.send(data);

    });

});

userRoutes.post('/edit', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = '0';

	const userRole = req.session.user.user_role;

	if(userRole == '' || userRole == 'Subscriber' || userRole == 'Editor'){
		if(req.session.userId.toString() != req.body.userId.toString()){
			res.status(403);
			data.error = 'Permission Denied';
			return res.send(data);
		}
	}

	if(userRole != 'Super Admin'){
		if(req.body.user_role == 'Super Admin'){
			res.status(403);
			data.error = userRole + ' Cannot Create a Super Admin';
			return res.send(data);
		}
	}

	if(!req.body.userId || !req.body.email || !req.body.name){
    	data.error = 'Invalid Data';
    	res.status(400);
    	return res.json(data);
    }

    var userObj = {
        name: req.body.name,
        updated_at: new Date(),
        email: req.body.email
    };

    if(req.body.townid){
    	userObj.home_town = req.body.townid; 
    }

    if(userRole == 'Admin' || userRole == 'Super Admin'){
		userObj.user_role = req.body.user_role || 'Subscriber';
	}

	// if(userRole != 'Admin' && userRole != 'Super Admin'){
	// 	if(req.session.userId != req.body.userId){
	// 		data.error = 'unauthorized';
	//     	res.status(403);
	//     	return res.json(data);
	// 	}
	// }

    if(req.body.password){
    	bcrypt.hash(req.body.password, 10, function(err, hash){

	        if(err){
	        	res.status(err.status || 500);
	            data.error = err.message || 'Internal Server Error';
				return res.json(data);
	        }

    		userObj.password = hash;

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
    }else{

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

    }

});

userRoutes.delete('/:userId', mid.jsonLoginRequired, function(req, res){

	let data = {};

	const userId = req.params.userId;

	if(req.session.user.user_role != 'Admin' && req.session.user.user_role != 'Super Admin'){
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
		data.success = 1;
	    return res.send(data);
	});

});

module.exports = userRoutes;