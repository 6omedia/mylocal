const express = require('express');
const townRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Town = require('../../models/town');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

townRoutes.get('/capitals', mid.onlyAdmin,function(req, res, next){

	var docsPerPage = 50;
	var page = req.query.page || 1;

	Town.count({capital: true})
	.then((count) => {

		Town.find({capital: true})
			.limit(docsPerPage)
			.skip(pagination.getSkip(page, docsPerPage))
			.then((towns) => {

				res.render('admin/towns/capitals', {
					section: 'towns',
					towns: towns,
					pagination: pagination.getLinks(count, docsPerPage, page, '/admin/towns/capitals'),
					error: ''
				});

			})
			.catch((err) => {
				next(err);
			});

	})
	.catch((err) => {
		next(err);
	});

});

module.exports = townRoutes;