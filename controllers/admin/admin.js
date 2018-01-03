const express = require('express');
const adminRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

// dashboard
adminRoutes.get('/', mid.onlyAdmin, function(req, res){

	res.render('admin/dashboard', {
		section: 'dashboard',
		error: ''
	});

});

// users
adminRoutes.get('/users', mid.onlyAdmin, function(req, res){

	const docsPerPage = 20;

	User.count({}, function(err, count){

		if(err){
			next(err);
		}

		User.find({})
			.sort({created_at: 1})
			.limit(docsPerPage)
			.skip(pagination.getSkip(req.query.page || 1, docsPerPage))
			.exec(function(err, users){

			if(err){
				next(err);
			}

			res.render('admin/users/users', {
				section: 'users',
				paginationLinks: pagination.getLinks(count, docsPerPage, req.query.page || 1),
				users: users,
				error: ''
			});

		});

	});

});

adminRoutes.get('/users/add', mid.onlyAdmin, function(req, res){

	res.render('admin/users/add', {
		user: req.session.user,
		section: 'users',
		error: ''
	});

});

adminRoutes.get('/users/edit/:userId', mid.onlyAdmin, function(req, res){

	User.findById(req.params.userId, function(err, theUser){

		if(err){
			next(err);
		}

		res.render('admin/users/edit', {
			user: req.session.user,
			theUser: theUser,
			section: 'users',
			error: ''
		});

	});

});

// settings
adminRoutes.get('/settings', mid.onlyAdmin,function(req, res){

	res.render('admin/settings', {
		section: 'settings',
		error: ''
	});

});

module.exports = adminRoutes;