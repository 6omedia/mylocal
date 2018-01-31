const express = require('express');
const listingRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Listing = require('../../models/listing');
const Industry = require('../../models/industry');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

listingRoutes.get('/', mid.onlyAdmin, function(req, res){

	const docsPerPage = 20;

	Listing.count({}, function(err, count){

		if(err){
			next(err);
		}

		Listing.find({})
			.sort({created_at: 1})
			.limit(docsPerPage)
			.skip(pagination.getSkip(req.query.page || 1, docsPerPage))
			.populate('userId')
			.exec(function(err, listings){

			if(err){
				next(err);
			}

			// console.log(listings);

			res.render('admin/listings/all', {
				section: 'listings',
				listings: listings,
				paginationLinks: pagination.getLinks(count, docsPerPage, req.query.page || 1),
				error: ''
			});

		});

	});

});

listingRoutes.get('/add', mid.onlyAdmin, function(req, res){

	if(req.session.user.user_role == 'Editor'){
		return res.redirect('/admin/listings');
	}

	res.render('admin/listings/add', {
		section: 'listings',
		error: ''
	});

});

listingRoutes.get('/edit/:listingid', mid.onlyAdmin, function(req, res, next){

	if(req.session.user.user_role == 'Editor'){
		return res.redirect('/admin/listings');
	}

	Listing.findById(req.params.listingid, function(err, listing){

		if(err){
			next(err);
		}

		console.log('LISTING: ', listing);

		var openingtimes = {};

		if(listing.opening_hours){
			if(listing.opening_hours.monday != 'closed'){
				var open = listing.opening_hours.monday.open.split(':');
				var close = listing.opening_hours.monday.close.split(':');
				openingtimes.monday = {
					open: {hours: open[0], mins: open[1]},
					close: {hours: close[0], mins: close[1]}
				}
			}
			if(listing.opening_hours.tuesday != 'closed'){
				var open = listing.opening_hours.tuesday.open.split(':');
				var close = listing.opening_hours.tuesday.close.split(':');
				openingtimes.tuesday = {
					open: {hours: open[0], mins: open[1]},
					close: {hours: close[0], mins: close[1]}
				}
			}
			if(listing.opening_hours.wednesday != 'closed'){
				var open = listing.opening_hours.wednesday.open.split(':');
				var close = listing.opening_hours.wednesday.close.split(':');
				openingtimes.wednesday = {
					open: {hours: open[0], mins: open[1]},
					close: {hours: close[0], mins: close[1]}
				}
			}
			if(listing.opening_hours.thursday != 'closed'){
				var open = listing.opening_hours.thursday.open.split(':');
				var close = listing.opening_hours.thursday.close.split(':');
				openingtimes.thursday = {
					open: {hours: open[0], mins: open[1]},
					close: {hours: close[0], mins: close[1]}
				}
			}
			if(listing.opening_hours.friday != 'closed'){
				var open = listing.opening_hours.friday.open.split(':');
				var close = listing.opening_hours.friday.close.split(':');
				openingtimes.friday = {
					open: {hours: open[0], mins: open[1]},
					close: {hours: close[0], mins: close[1]}
				}
			}
			if(listing.opening_hours.saturday != 'closed'){
				var open = listing.opening_hours.saturday.open.split(':');
				var close = listing.opening_hours.saturday.close.split(':');
				openingtimes.saturday = {
					open: {hours: open[0], mins: open[1]},
					close: {hours: close[0], mins: close[1]}
				}
			}
			if(listing.opening_hours.sunday != 'closed'){
				var open = listing.opening_hours.sunday.open.split(':');
				var close = listing.opening_hours.sunday.close.split(':');
				openingtimes.sunday = {
					open: {hours: open[0], mins: open[1]},
					close: {hours: close[0], mins: close[1]}
				}
			}
		}

		try {
	        listing.description = JSON.parse(listing.description);
	    } catch(e) {
	        listing.description = listing.description;
	    }

		return res.render('admin/listings/edit', {
			section: 'listings',
			openingtimes: openingtimes,
			listing: listing,
			error: ''
		});

	});

});

listingRoutes.get('/upload', mid.onlyAdmin, function(req, res){

	if(req.session.user.user_role == 'Editor'){
		return res.redirect('/admin/listings');
	}

	res.render('admin/listings/upload', {
		section: 'listings',
		error: ''
	});

});

module.exports = listingRoutes;