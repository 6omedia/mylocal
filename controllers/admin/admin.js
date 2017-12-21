const express = require('express');
const adminRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const mid = require('../../middleware/session');

// dashboard
adminRoutes.get('/', mid.onlyAdmin, function(req, res){

	res.render('admin/dashboard', {
		error: ''
	});

});

// users
adminRoutes.get('/users', mid.onlyAdmin, function(req, res){

	res.render('admin/users', {
		error: ''
	});

});

// settings
adminRoutes.get('/settings', mid.onlyAdmin,function(req, res){

	res.render('admin/settings', {
		error: ''
	});

});

module.exports = adminRoutes;