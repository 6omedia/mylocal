const express = require('express');
const mainRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const mid = require('../middleware/session');

mainRoutes.get('/', function(req, res){

	res.render('home', {
		error: ''
	});

});

mainRoutes.get('/login', mid.loggedIn, function(req, res){

	res.render('login', {
		error: ''
	});

});

mainRoutes.post('/login', function(req, res){

	var error = '';

	if(req.body.email && req.body.password){

		User.authenticate(req.body.email, req.body.password, function(err, user){

			if(err || !user){

				res.status(err.status);
				return res.render('login', {
					error: error
				});

			}

			// user exists
			req.session.userId = user._id;
			res.loggedInUser = user._id;

			if(user.user_role == 'Admin' || user.user_role == 'Super Admin'){
				return res.redirect('/admin');
			}else{
				return res.redirect('/profile');
			}

		});

	}else{

		error = 'Both email and password required';
		res.status(400);
		return res.render('home', {
			error: error
		});

	}

});

mainRoutes.get('/logout', function(req, res){

	if (req.session) {
		// delete session object
		req.session.destroy(function(err) {
			if(err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}

});

mainRoutes.get('/profile', mid.loginRequired, function(req, res){

    User.findById(req.session.userId, function(err, user){

        if(err){
            return next(err);
        }

        return res.render('profile', {
        	id: user._id,
            name: user.name,
            age: user.meta.age,
            website: user.meta.website
        });

    });

});

mainRoutes.get('/register', mid.loggedIn, function(req, res){

    res.render('register', {
        error: ''
    });

});

mainRoutes.post('/register', function(req, res){

	var userObj = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirm_password: req.body.confirm_password
    };

    User.registerUser(userObj, function(err, user){

        var error = '';

        if(err){
            res.status(400);
            return res.render('register', {
                error: err
            });
        }

        // login and start session
        req.session.userId = user._id;
        return res.redirect('/profile');

    });

});

module.exports = mainRoutes;