const express = require('express');
const reviewRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

// dashboard
reviewRoutes.get('/search', mid.onlyAdmin, function(req, res){

	res.render('admin/reviews/search', {
		section: 'reviews',
		error: ''
	});

});

reviewRoutes.get('/pending', mid.onlyAdmin, function(req, res){

	res.render('admin/reviews/pending', {
		section: 'reviews',
		error: ''
	});

});

module.exports = reviewRoutes;