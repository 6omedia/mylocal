const express = require('express');
const mainRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Listing = require('../models/listing');
const Review = require('../models/review');
const Post = require('../models/post');
const Message = require('../models/message');
const mid = require('../middleware/session');
const pagination = require('../helpers/pagination');
const Notification = require('../helpers/notification');
const nodemailer = require('nodemailer');
const moment = require('moment');

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

mainRoutes.get('/', function(req, res){

	if(req.session.user){

		Message.count({to: req.session.user._id, seen: false}, (err, count) => {
            if(err){
                return next(err);
            }
            res.locals.notifications = count;   
            
            return res.render('home', {
				home: true,
				user: req.session.user,
				redirect_url: req.query.redirect || null,
				error: ''
			});

        });

	}else{

		return res.render('home', {
			home: true,
			user: req.session.user,
			redirect_url: req.query.redirect || null,
			error: ''
		});

	}

});

mainRoutes.get('/login', mid.loggedIn, function(req, res){

	return res.render('login', {
		error: '',
		redirect_url: req.query.redirect || null
	});

});

mainRoutes.post('/login', function(req, res){

	var error = '';

	if(req.body.email && req.body.password){

		User.authenticate(req.body.email, req.body.password, function(err, user){

			if(err || !user){

				res.status(err.status);
				return res.render('login', {
					error: 'Incorrect Username / Password'
				});

			}

			// user exists
			req.session.userId = user._id;
			res.loggedInUser = user._id;
			req.session.user = user;

			if(user.user_role == 'Admin' || user.user_role == 'Super Admin'){
				return res.redirect('/admin');
			}else{

				console.log(req.body.url);
				let url = (req.body.url == undefined || req.body.url == 'null' ? '/dashboard' : req.body.url );
				return res.redirect(url);

			}

		});

	}else{

		error = 'Both email and password required';
		res.status(400);
		return res.render('login', {
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

        var pwSubmitted = false;

        if(req.body.password){
        	pwSubmitted = true;
        }

        if(err){

        	if(err == 'Passwords do not match'){
        		pwSubmitted = false;
        	}

            res.status(400);
            return res.render('register', {
            	submitted: {
            		name: req.body.name,
            		email: req.body.email,
            		password: pwSubmitted
            	},
                error: err
            });

        }

        let notification = new Notification({
			template_type: 'Subscriber Templates',
			template_name: 'register',
			email_to: user.email,
			email_from: 'mail@mylocal.co',
			email_respond: 'mail@mylocal.co',
			loggedinuserid: user._id,
			replace_func: (msg) => {
				return msg.replace('%name%', user.name);
			}
		});

		notification.send((err) => {

			if(err){
				return res.render('register', {
					submitted: {
						name: req.body.name,
						email: req.body.email,
						password: pwSubmitted
					},
					error: err
				});
			}

			// login and start session
		    req.session.userId = user._id;
		    req.session.user = user;
		    return res.redirect('/dashboard');

		});

    });

});

mainRoutes.get('/listing', mid.onlySubscriber, function(req, res){

	if(req.session.user.listing){
		
		Listing.findOne(req.session.user.listing, function(err, listing){
			return res.redirect('/listing/' + listing.slug);
		});

	}else{

		return res.render('listings/claim', {
	        error: '',
	        home: true,
	        title: 'Claim Listing | MyLocal',
	        user: req.session.user || false
	    });

	}

});

mainRoutes.get('/terms', function(req, res, next){

	if(!req.query.listing){

		return res.render('terms', {
	        error: '',
	        user: req.session.user || false
	    });

	}

	Listing.findOne({slug: req.query.listing})
		.select({_id: true, business_name: true, slug: true, userId: true})
		.lean()
		.exec(function(err, listing){

		if(err){
			next(err);
		}

		if(listing.userId){
			return res.redirect('/listing');
		}

		return res.render('terms', {
	        error: '',
	        user: req.session.user || false,
	        listing: listing
	    });

	});

});

mainRoutes.get('/listing/:slug', function(req, res, next){

	var canWriteReview = true;

	Listing.findOne({slug: req.params.slug})
		.populate({
			path: 'reviews',
			match: { approved: true},
			options: { 
				sort: { 'created_at': -1 },
				limit: 20
			},
			populate: {
				path: 'user'
			}
		})
		.exec(function(err, listing){

		if(err || !listing){
			return next(err);
		}

		var more_reviews = false;

		if(listing.reviews.length > 20){
			more_reviews = listing.reviews.length;
		}

		// listing.reviews = listing.reviews.sort().splice(0, 10);

		try {
	        listing.description = JSON.parse(listing.description);
	    } catch(e) {
	        listing.description = listing.description;
	    }

		Listing.find({
				'address.town': listing.address.town,
				industry: listing.industry
			})
			.where('slug').ne(req.params.slug)
			.limit(4).exec(function(err, moreListings){

				if(err){
					return next(err);
				}

				if(req.session.userId){

					User.findById(req.session.userId, function(err, user){

						if(err){
							return next(err);
						}

						if(user.listing && listing){
							if(user.listing.equals(listing._id)){
								canWriteReview = false;
							}
						}

						const userReview = listing.reviews.find(function(element) {
							return element.user.equals(user._id);
						});

						if(userReview != undefined){
							canWriteReview = false;
						}

						res.locals.title = res.locals.title.replace('%placeholder%', listing.business_name);
						res.locals.meta = res.locals.meta.replace('%placeholder%', listing.business_name);

						listing.update({$inc: {views: 1}})
							.then(() => {

								return res.render('listings/listing', {
									listing: listing,
									error: '',
									tab: req.query.tab || 'general',
									moreListings: moreListings,
									more_reviews: more_reviews,
									canWriteReview: canWriteReview,
									user: user || false,
									moment: moment
								});

							})
							.catch((e) => {
								return next(e);
							});

					});

				}else{

					res.locals.title = res.locals.title.replace('%placeholder%', listing.business_name);
					res.locals.meta = res.locals.meta.replace('%placeholder%', listing.business_name);

					return res.render('listings/listing', {
						listing: listing,
						//reviews: reviews,
				        error: '',
				        tab: req.query.tab || 'general',
				        moreListings: moreListings,
				        more_reviews: more_reviews,
				    	canWriteReview: canWriteReview,
				        user: req.session.user || false
				    });

				}

			});

	});

});

mainRoutes.get('/listing/add', mid.onlySubscriber, function(req, res, next){

	if(req.session.user.listing){
		return res.redirect('/');
	}

	res.locals.title = res.locals.title.replace('%placeholder%', '');
	res.locals.meta = res.locals.meta.replace('%placeholder%', '');

	return res.render('listings/edit', {
        error: '',
        home: true,
        user: req.session.user || false
    });

});

mainRoutes.get('/find/:industry/:town', function(req, res, next){

 	let data = {};
	data.success = 0;

	res.locals.title = res.locals.title.replace('%placeholder%', req.params.industry + ' in ' + req.params.town);
	res.locals.meta = res.locals.meta.replace('%placeholder%', req.params.industry + ' in ' + req.params.town);

	return res.render('results', {
		user: req.session.user,
		industry: req.params.industry,
		town: req.params.town,
		error: ''
	});

});

module.exports = mainRoutes;