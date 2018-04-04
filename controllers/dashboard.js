const express = require('express');
const dashboardRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Listing = require('../models/listing');
const mid = require('../middleware/session');
const pagination = require('../helpers/pagination');

dashboardRoutes.get('/', mid.onlySubscriber, function(req, res, next){

	res.locals.title = res.locals.title.replace('%placeholder%', '');
	res.locals.meta = res.locals.meta.replace('%placeholder%', '');

	return res.render('dashboard/dashboard', {
        error: '',
        user: req.session.user || false,
        tab: 'overview'
    });

});

dashboardRoutes.get('/profile', mid.loginRequired, function(req, res){

	res.locals.title = res.locals.title.replace('%placeholder%', 'Profile');
	res.locals.meta = res.locals.meta.replace('%placeholder%', 'Profile');

	var user = req.session.user;

    return res.render('dashboard/profile', {
    	id: req.session.user._id,
        name: user.name,
       	user: user,
       	tab: 'profile'
    });

});

dashboardRoutes.get('/reviews', mid.loginRequired, function(req, res){

	res.locals.title = res.locals.title.replace('%placeholder%', 'Reviews');
	res.locals.meta = res.locals.meta.replace('%placeholder%', 'Reviews');

	var user = req.session.user;

    return res.render('dashboard/reviews', {
    	id: req.session.user._id,
        name: user.name, 
       	user: user,
       	tab: 'reviews'
    });

});

dashboardRoutes.get('/notifications', mid.loginRequired, function(req, res, next){

	res.locals.title = res.locals.title.replace('%placeholder%', 'Notifications');
	res.locals.meta = res.locals.meta.replace('%placeholder%', 'Notifications');

	var user = req.session.user;

	User.findById(req.session.user._id)
		.populate({
			path: 'message_chains',
			model: 'MessageChain',
			populate: {
				path: 'user_one',
				model: 'User'
			},
			populate: {
				path: 'user_two',
				model: 'User'
			}
		})
		.then((user) => {

			console.log('user ', user);

			return res.render('dashboard/notifications', {
				id: req.session.user._id,
			    name: user.name,
			   	user: user,
			   	tab: 'notifications'
			});

		})
		.catch((e) => { next(e); });		

});

dashboardRoutes.get('/listing', mid.onlySubscriber, function(req, res, next){

	Listing.findById(req.session.user.listing, (err, listing) => {

		if(err){
			return next(err);
		}

		if(!listing){
			return next(new Error('No Listing Found'));
		}

		const oh = listing.opening_hours;

		let hours = {
			mon:   { o: oh.monday.open || '00:00',    c: oh.monday.close || '00:00' },
			tues:  { o: oh.tuesday.open || '00:00',   c: oh.tuesday.close || '00:00' },
			wed:   { o: oh.wednesday.open || '00:00', c: oh.wednesday.close || '00:00' },
			thurs: { o: oh.thursday.open || '00:00',  c: oh.thursday.close || '00:00' },
			fri:   { o: oh.friday.open || '00:00',    c: oh.friday.close || '00:00' },
			sat:   { o: oh.saturday.open || '00:00',  c: oh.saturday.close || '00:00' },
			sun:   { o: oh.sunday.open || '00:00',    c: oh.sunday.close || '00:00' }
		};

		const icons = listing.social.icons;

		let social = {
			facebook: (icons.facebook ? icons.facebook.link : ''),
			twitter: (icons.twitter ? icons.twitter.link : ''),
			instagram: (icons.instagram ? icons.instagram.link : ''),
			googleplus: (icons.googleplus ? icons.googleplus.link : ''),
			youtube: (icons.youtube ? icons.youtube.link : ''),
			linkedin: (icons.linkedin ? icons.linkedin.link : ''),
			pinterest: (icons.pinterest ? icons.pinterest.link : '')
		};

		res.locals.title = res.locals.title.replace('%placeholder%', 'Listing');
		res.locals.meta = res.locals.meta.replace('%placeholder%', 'Listing');

		return res.render('dashboard/listing', {
	        error: '',
	        user: req.session.user || false,
	        listing: listing,
	        tab: 'listing',
	        hours: hours,
	    	social: social,
	    	logo: listing.branding.logo || '/static/img/raster.png',
	    	background: listing.branding.background || '/static/img/raster.png'
	    });

	});

});

// dashboardRoutes.get('/listing/edit', mid.onlySubscriber, function(req, res, next){

// 	if(req.session.user.listing){
// 		return res.redirect('/');
// 	}

// 	return res.render('listings/edit', {
//         error: '',
//         user: req.session.user || false
//     });

// });

module.exports = dashboardRoutes;