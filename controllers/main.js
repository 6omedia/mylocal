const express = require('express');
const mainRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Listing = require('../models/listing');
const Post = require('../models/post');
const mid = require('../middleware/session');
const pagination = require('../helpers/pagination');

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

mainRoutes.get('/', function(req, res){

	Post.find({})
		.sort({created_at: -1})
		.limit(4)
		.exec(function(err, posts){

			if(err){
				return next(err);
			}

			return res.render('home', {
				home: true,
				posts: posts,
				user: req.session.user,
				error: ''
			});

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
				return res.redirect('/profile');
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

mainRoutes.get('/profile', mid.loginRequired, function(req, res){

	var user = req.session.user;

    return res.render('profile', {
    	id: req.session.user._id,
        name: user.name,
        age: user.meta.age,
        website: user.meta.website,
       	user: user
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

        // login and start session
        req.session.userId = user._id;
        req.session.user = user;
        return res.redirect('/profile');

    });

});

mainRoutes.get('/listing', mid.loginRequired, function(req, res){

	if(req.session.user.listing){
		
		Listing.findOne(req.session.user.listing, function(err, listing){
			return res.redirect('/listing/' + listing.slug);
		});

	}else{

		return res.render('listing-claim', {
	        error: '',
	        user: req.session.user || false
	    });

	}

});

mainRoutes.get('/listing/:slug', function(req, res, next){

	var userOwnsListing = false;

	Listing.findOne({slug: req.params.slug})
		.populate('reviews.user')
		.exec(function(err, listing){

		if(err || !listing){
			return next(err);
		}

		var more_reviews = false;

		if(listing.reviews.length > 3){
			more_reviews = listing.reviews.length;
		}

		listing.reviews = listing.reviews.sort().splice(0, 3);

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
								userOwnsListing = true;
							}
						}

						return res.render('listing', {
							listing: listing,
					        error: '',
					        tab: req.query.tab || 'general',
					        moreListings: moreListings,
					        more_reviews: more_reviews,
					    	userOwnsListing: userOwnsListing,
					        user: user || false
					    });

					});

				}else{

					return res.render('listing', {
						listing: listing,
				        error: '',
				        tab: req.query.tab || 'general',
				        moreListings: moreListings,
				        more_reviews: more_reviews,
				    	userOwnsListing: userOwnsListing,
				        user: req.session.user || false
				    });

				}

			});

	});

});

mainRoutes.get('/find/:industry/:town', mid.loginRequired, function(req, res, next){

 	let data = {};
	data.success = 0;

	var docsPerPage = 12;
	var url = '/find/' + req.params.industry + '/' + req.params.town;

	Listing.count({ 'address.town': req.params.town, industry: req.params.industry })
		.then((count) => {

			Listing.find({
				'address.town': req.params.town,
				industry: req.params.industry
			})
			.limit(docsPerPage)
			.skip(pagination.getSkip(req.query.page || 0, docsPerPage))
			.exec(function(err, listings){

				if(err){
					return next(err);
				}

				if(listings.length > 0){

			    	return res.render('home', {
						home: true,
						user: req.session.user,
						listings: listings,
						pagination: pagination.getLinks(count, docsPerPage, req.query.page || 0, url),
						error: ''
					});

				}else{

					// console.log('industry ', req.params.industry);

					Listing.find({
						'address.town': new RegExp(escapeRegex(req.params.town), 'gi'),
						industry: new RegExp(escapeRegex(req.params.industry), 'gi')
					}, function(err, listings){

						if(err){
							return next(err);
						}

						if(listings.length == 0){
							data.message = 'Listing not found';
							res.status(404);
							return res.json(data);
						}

						return res.render('home', {
							home: true,
							listings: listings,
							user: req.session.user,
							pagination: pagination.getLinks(count, docsPerPage, req.query.page || 0, url),
							correction: 'Did you mean ' + listings[0].industry + ' in ' + listings[0].address.town + '?',
							error: ''
						});

					});

				}

			});

		})
		.catch((err) => {

			return next(err);

		});

});

/*/////////////////////////////////////////////////////////////////////////

	BLOG

/////////////////////////////////////////////////////////////////////////*/

// mainRoutes.get('/blog', mid.loginRequired, function(req, res){

// 	return res.render('blog/blog', {
//         error: '',
//         user: req.session.user || false
//     });

// });

mainRoutes.get('/blog/:id', function(req, res, next){

	Post.findOne({slug: req.params.id}, function(err, post){

		if(err){
			return next(err);
		}

		try {
	        post.body = JSON.parse(post.body);
	    } catch(e) {
	        post.body = post.body;
	    }

		return res.render('blog/single', {
			post: post,
	        error: '',
	        user: req.session.user || false
	    });

	});

});

module.exports = mainRoutes;