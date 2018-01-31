const express = require('express');
const listingRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Listing = require('../../models/listing');
const pagination = require('../../helpers/pagination');
const bcrypt = require('bcrypt');
const mid = require('../../middleware/session');

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function slugify(text){

	return text.toString().toLowerCase().replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');

}

// GET / 	(use query string to serach ?search=name);

listingRoutes.get('/', function(req, res){

	let data = {};
	data.success = 0;

	const docsPerPage = 12;

	let query = {};

	if(req.query.search){
		query.business_name = new RegExp(req.query.search, 'gi');
	}

	Listing.count(query)
		.then((count) => {
			Listing.find(query)
				.limit(docsPerPage)
				.skip(pagination.getSkip(req.query.page || 0, docsPerPage))
				.populate('userId')
				.exec(function(err, listings){

					if(err){
						data.error = err.message || 'Internal Server Error';
				    	res.status(err.status || 500);
				    	return res.json(data);
					}

					data.success = 1;
					data.listings = listings;
					data.pagination = pagination.getLinks(count, docsPerPage, req.query.page || 0);
				    res.status(200);
			    	return res.json(data);

				});
		});

});

// GET /:id 

listingRoutes.get('/:id', function(req, res){

	let data = {};
	data.success = 0;

	Listing.findById(req.params.id, function(err, listing){

		if(err){

			if(err.name == 'CastError'){
				res.status(404);
			}else{
				res.status(err.status || 500);
			}

			data.error = err.message || 'Internal Server Error';
	    	return res.json(data);

		}

		if(!listing || listing == null){
			data.message = 'Listing not found';
			res.status(404);
			return res.json(data);
		}

		data.success = 1;
		data.listing = listing;
	    res.status(200);
    	return res.json(data);

	});

});

// GET /industry/:industry

listingRoutes.get('/industry/:industry', function(req, res){

	let data = {};
	data.success = 0;

	Listing.find({industry: req.params.industry}, function(err, listings){

		if(err){
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}

		if(listings.length > 0){

			data.success = 1;
			data.listings = listings;
		    res.status(200);
	    	return res.json(data);

		}else{

			// console.log('industry ', req.params.industry);

			Listing.find({industry: new RegExp(escapeRegex(req.params.industry), 'gi')}, function(err, listings){

				if(err){
					data.error = err.message || 'Internal Server Error';
			    	res.status(err.status || 500);
			    	return res.json(data);
				}

				// console.log('listinga ', listings);

				if(listings.length == 0){
					data.message = 'Listing not found';
					res.status(404);
					return res.json(data);
				}

				// console.log('DATA ', data);

				data.success = 1;
				data.listings = listings;
				data.correction = 'Did you mean ' + listings[0].industry + '?';
			    res.status(200);
		    	return res.json(data);


			});

		}

	});

});

// GET /town/:town

listingRoutes.get('/town/:town', function(req, res){

	let data = {};
	data.success = 0;

	Listing.find({'address.town': req.params.town}, function(err, listings){

		if(err){
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}

		if(listings.length > 0){

			data.success = 1;
			data.listings = listings;
		    res.status(200);
	    	return res.json(data);

		}else{

			// console.log('industry ', req.params.industry);

			Listing.find({'address.town': new RegExp(escapeRegex(req.params.town), 'gi')}, function(err, listings){

				if(err){
					data.error = err.message || 'Internal Server Error';
			    	res.status(err.status || 500);
			    	return res.json(data);
				}

				if(listings.length == 0){
					data.message = 'Listing not found';
					res.status(404);
					return res.json(data);
				}

				data.success = 1;
				data.listings = listings;
				data.correction = 'Did you mean ' + listings[0].address.town + '?';
			    res.status(200);
		    	return res.json(data);


			});

		}

	});

});

// GET /find/:industry/:town

listingRoutes.get('/find/:industry/:town', function(req, res){

	let data = {};
	data.success = 0;

	var docsPerPage = 12;
	var url = '/find/' + req.params.industry + '/' + req.params.town;

	Listing.count({ 'address.town': req.params.town, industry: req.params.industry })
		.then((count) => {

			Listing.find({ $or: 
					[
						{
							'address.town': req.params.town,
							industry: req.params.industry
						},
						{
							'address.town': req.params.town,
							services: req.params.industry
						}
					]
			})
			.limit(docsPerPage)
			.skip(pagination.getSkip(req.query.page || 0, docsPerPage))
			.exec(function(err, listings){

				if(err){
					data.error = err.message || 'Internal Server Error';
			    	res.status(err.status || 500);
			    	return res.json(data);
				}

				if(listings.length > 0){

					data.success = 1;
					data.listings = listings;
					data.pagination = pagination.getLinks(count, docsPerPage, req.query.page || 0, url);
				    res.status(200);
			    	return res.json(data);

				}else{

					// console.log('industry ', req.params.industry);

					Listing.find({
						'address.town': new RegExp(escapeRegex(req.params.town), 'gi'),
						industry: new RegExp(escapeRegex(req.params.industry), 'gi')
					}, function(err, listings){

						if(err){
							data.error = err.message || 'Internal Server Error';
					    	res.status(err.status || 500);
					    	return res.json(data);
						}

						// console.log('listinga ', listings);

						if(listings.length == 0){
							data.message = 'Listing not found';
							res.status(404);
							return res.json(data);
						}

						// console.log('DATA ', data);

						data.success = 1;
						data.listings = listings;
						data.pagination = pagination.getLinks(count, docsPerPage, req.query.page || 0, url);
						data.correction = 'Did you mean ' + listings[0].industry + ' in ' + listings[0].address.town + '?';
					    res.status(200);
				    	return res.json(data);

					});

				}

			});

		})
		.catch((err) => {

			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.send(data);

		});

});

// POST /add

listingRoutes.post('/add', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = 0;

	if(!req.body.business_name){
		res.status(400);
		data.error = 'Business Name Required';
		return res.send(data);
	}

	if(!req.body.address.line_one){
		res.status(400);
		data.error = 'First line of Address Required';
		return res.send(data);
	}

	if(!req.body.address.town){
		res.status(400);
		data.error = 'Town Required';
		return res.send(data);
	}

	if(!req.body.address.post_code){
		res.status(400);
		data.error = 'Postcode Required';
		return res.send(data);
	}

	console.log('BODY ', req.body.description);

	let listingObj = { 
        business_name: req.body.business_name,
        slug: slugify(req.body.business_name),
        industry: req.body.industry || '',
        services: req.body.services || [],
        gallery: req.body.gallery || [],
        description: req.body.description || ''
    };

    if(req.body.address){
    	listingObj.address = {
    		line_one: req.body.address.line_one || '',
	    	line_two: req.body.address.line_two || '',
	    	town: req.body.address.town || '',
	    	post_code: req.body.address.post_code || ''
    	};
    }

    if(req.body.contact){
    	listingObj.contact = {
    		website: req.body.contact.website || '',
        	phone: req.body.contact.phone || '',
        	email: req.body.contact.email || ''
    	};
    }

    if(req.body.opening_hours){
    	listingObj.opening_hours = {
    		monday: {
        		open: req.body.opening_hours.Monday.open || '',
        		close: req.body.opening_hours.Monday.close || ''
        	},
        	tuesday: {
        		open: req.body.opening_hours.Tuesday.open || '',
        		close: req.body.opening_hours.Tuesday.close || ''
        	},
        	wednesday: {
        		open: req.body.opening_hours.Wednesday.open || '',
        		close: req.body.opening_hours.Wednesday.close || ''
        	},
        	thursday: {
        		open: req.body.opening_hours.Thursday.open || '',
        		close: req.body.opening_hours.Thursday.close || ''
        	},
        	friday: {
        		open: req.body.opening_hours.Friday.open || '',
        		close: req.body.opening_hours.Friday.close || ''
        	},
        	saturday: {
        		open: req.body.opening_hours.Saturday.open || '',
        		close: req.body.opening_hours.Saturday.close || ''
        	},
        	sunday: {
        		open: req.body.opening_hours.Sunday.open || '',
        		close: req.body.opening_hours.Sunday.close || ''
        	}
        	// chirstmas_eve: {
        	// 	open: req.body.opening_hours.chirstmas_eve.open || '',
        	// 	close: req.body.opening_hours.chirstmas_eve.close || ''
        	// },
        	// christmas: {
        	// 	open: req.body.opening_hours.christmas.open || '',
        	// 	close: req.body.opening_hours.christmas.close || ''
        	// },
        	// boxing_day: {
        	// 	open: req.body.opening_hours.boxing_day.open || '',
        	// 	close: req.body.opening_hours.boxing_day.close || ''
        	// },
        	// newyears_eve: {
        	// 	open: req.body.opening_hours.newyears_eve.open || '',
        	// 	close: req.body.opening_hours.newyears_eve.close || ''
        	// },
        	// newyears_day: {
        	// 	open: req.body.opening_hours.newyears_day.open || '',
        	// 	close: req.body.opening_hours.newyears_day.close || ''
        	// }
    	};	
    }

    // console.log(req.body);

    if(req.body.social){
    	listingObj.social = {
    		style: req.body.social.style || 'standard',
        	icons: {
        		init: 'init'
        	}
    	};

    	if(req.body.social.icons.facebook)
    	    listingObj.social.icons.facebook = {platform: 'facebook', link: req.body.social.icons.facebook};

    	if(req.body.social.icons.twitter)
    	    listingObj.social.icons.twitter = {platform: 'twitter', link: req.body.social.icons.twitter};

    	if(req.body.social.icons.instagram)
    	    listingObj.social.icons.instagram = {platform: 'instagram', link: req.body.social.icons.instagram};

    	if(req.body.social.icons.googleplus)
    	    listingObj.social.icons.googleplus = {platform: 'googleplus', link: req.body.social.icons.googleplus};

    	if(req.body.social.icons.youtube)
    	    listingObj.social.icons.youtube = {platform: 'youtube', link: req.body.social.icons.youtube};

    	if(req.body.social.icons.linkedin)
    	    listingObj.social.icons.linkedin = {platform: 'linkedin', link: req.body.social.icons.linkedin};

    	if(req.body.social.icons.pinterest)
    	    listingObj.social.icons.pinterest = {platform: 'pinterest', link: req.body.social.icons.pinterest};

    }

    if(req.body.branding){
		listingObj.branding = {
			logo: req.body.branding.logo,
	    	background: req.body.branding.background,
	    	primary_color: req.body.branding.primary_color,
	    	secondary_color: req.body.branding.secondary_color,
	    	accent: req.body.branding.accent
    	};
    }

	if(req.body.userId){
		listingObj.userId = req.body.userId;
	}

	if(req.body.gallery){
		listingObj.gallery = req.body.gallery;
	}

	const listing = new Listing(listingObj);

	switch(req.session.user.user_role) {
		case 'Subscriber':
		case 'Editor':

			if(req.session.user.listing){
				data.error = 'You allready own a listing';
				res.status(409);
				return res.send(data);
			}

			listing.save({})
				.then(() => {

					req.session.user.update({listing: listing})
						.then(() => {

							data.success = 'Listing added and assigned to ' + req.session.user.name;
							res.status(200);
							return res.send(data);

						})
						.catch((err) => {
							data.error = err.message || 'Internal Server Error';
							res.status(err.status || 500);
							return res.send(data);
						});

				})
				.catch((err) => {
					data.error = err.message || 'Internal Server Error';
					res.status(err.status || 500);
					return res.send(data);
				});

			break;
		case 'Admin':
		case 'Super Admin':

			listing.save({})
				.then(() => {

					if(req.body.userId){

						User.update({_id: req.body.userId}, {listing: listing})
						.then((user) => {

							data.success = 'Listing added and assigned to ' + user.name;
							res.status(200);
							return res.send(data);

						})
						.catch((err) => {
							console.error('Err ', err);
							data.error = err.message || 'Internal Server Error';
							res.status(err.status || 500);
							return res.send(data);
						});

					}else{

						data.success = 'Listing added';
						res.status(200);
						return res.send(data);

					}

				})
				.catch((err) => {
					console.error('Err ', err);
					data.error = err.message || 'Internal Server Error';
					res.status(err.status || 500);
					return res.send(data);
				});

			break;
		default:
			data.error = 'User has no permissions';
			res.status(403);
			return res.send(data);
	}

});

// POST /update

listingRoutes.post('/update', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = 0;

	if(!req.body.listingid){
		res.status(400);
		data.error = 'listingid required';
		return res.send(data);
	}

	Listing.findById(req.body.listingid, function(err, listing){

		if(err){

			if(err.name == 'CastError'){
				data.error = 'Invalid Listing ID';
				res.status(400);
				return res.send(data);
			}

			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.send(data);

		}

		if(!listing || listing == null){
			data.error = 'listing not found';
			res.status(404);
			return res.send(data);
		}

		let updateObj = {};

		if(req.body.business_name){
			updateObj.business_name = req.body.business_name; 
			updateObj.slug = slugify(req.body.business_name);
		}

		if(req.body.industry)
			updateObj.industry = req.body.industry;

		if(req.body.services)
			updateObj.services = req.body.services;

		if(req.body.gallery)
			updateObj.gallery = req.body.gallery;

		if(req.body.description)
			updateObj.description = req.body.description;

		if(req.body.address){
			updateObj.address = {
				line_one: req.body.address.line_one || '',
		    	line_two: req.body.address.line_two || '',
		    	town: req.body.address.town || '',
		    	post_code: req.body.address.post_code || ''
			};
		}
	
		if(req.body.contact){
	    	updateObj.contact = {
	    		website: req.body.contact.website || '',
	        	phone: req.body.contact.phone || '',
	        	email: req.body.contact.email || ''
	    	};
	    }

	    if(req.body.opening_hours){
	    	updateObj.opening_hours = {
	    		monday: {
	        		open: req.body.opening_hours.Monday.open || '',
	        		close: req.body.opening_hours.Monday.close || ''
	        	},
	        	tuesday: {
	        		open: req.body.opening_hours.Tuesday.open || '',
	        		close: req.body.opening_hours.Tuesday.close || ''
	        	},
	        	wednesday: {
	        		open: req.body.opening_hours.Wednesday.open || '',
	        		close: req.body.opening_hours.Wednesday.close || ''
	        	},
	        	thursday: {
	        		open: req.body.opening_hours.Thursday.open || '',
	        		close: req.body.opening_hours.Thursday.close || ''
	        	},
	        	friday: {
	        		open: req.body.opening_hours.Friday.open || '',
	        		close: req.body.opening_hours.Friday.close || ''
	        	},
	        	saturday: {
	        		open: req.body.opening_hours.Saturday.open || '',
	        		close: req.body.opening_hours.Saturday.close || ''
	        	},
	        	sunday: {
	        		open: req.body.opening_hours.Sunday.open || '',
	        		close: req.body.opening_hours.Sunday.close || ''
	        	}
	        	// chirstmas_eve: {
	        	// 	open: req.body.opening_hours.chirstmas_eve.open || '',
	        	// 	close: req.body.opening_hours.chirstmas_eve.close || ''
	        	// },
	        	// christmas: {
	        	// 	open: req.body.opening_hours.christmas.open || '',
	        	// 	close: req.body.opening_hours.christmas.close || ''
	        	// },
	        	// boxing_day: {
	        	// 	open: req.body.opening_hours.boxing_day.open || '',
	        	// 	close: req.body.opening_hours.boxing_day.close || ''
	        	// },
	        	// newyears_eve: {
	        	// 	open: req.body.opening_hours.newyears_eve.open || '',
	        	// 	close: req.body.opening_hours.newyears_eve.close || ''
	        	// },
	        	// newyears_day: {
	        	// 	open: req.body.opening_hours.newyears_day.open || '',
	        	// 	close: req.body.opening_hours.newyears_day.close || ''
	        	// }
	    	};	
	    }

	    if(req.body.social){
	    	updateObj.social = {
	    		style: req.body.social.style || 'default',
	        	icons: {}
	    	};
	    	if(req.body.social.icons.facebook)
    	   		updateObj.social.icons.facebook = {platform: 'facebook', link: req.body.social.icons.facebook};

	    	if(req.body.social.icons.twitter)
	    	    updateObj.social.icons.twitter = {platform: 'twitter', link: req.body.social.icons.twitter};

	    	if(req.body.social.icons.instagram)
	    	    updateObj.social.icons.instagram = {platform: 'instagram', link: req.body.social.icons.instagram};

	    	if(req.body.social.icons.googleplus)
	    	    updateObj.social.icons.googleplus = {platform: 'googleplus', link: req.body.social.icons.googleplus};

	    	if(req.body.social.icons.youtube)
	    	    updateObj.social.icons.youtube = {platform: 'youtube', link: req.body.social.icons.youtube};

	    	if(req.body.social.icons.linkedin)
	    	    updateObj.social.icons.linkedin = {platform: 'linkedin', link: req.body.social.icons.linkedin};

	    	if(req.body.social.icons.pinterest)
	    	    updateObj.social.icons.pinterest = {platform: 'pinterest', link: req.body.social.icons.pinterest};
	    	
	    }

	    if(req.body.branding){
			updateObj.branding = {
				logo: req.body.branding.logo,
		    	background: req.body.branding.background,
		    	primary_color: req.body.branding.primary_color,
		    	secondary_color: req.body.branding.secondary_color,
		    	accent: req.body.branding.accent
	    	};
	    }

	    console.log('GALLERY ', req.body.gallery);

	    if(req.body.gallery){
			updateObj.gallery = req.body.gallery;
		}

		switch(req.session.user.user_role) {
			case 'Subscriber':
			case 'Editor':

				if(!listing.userId.equals(req.session.user._id)){
					data.error = 'Cant edit someone elses listing';
					res.status(403);
					return res.send(data);
				}

				listing.update(updateObj)
					.then(() => {

						data.success = 'listing updated';
						res.status(200);
						return res.send(data);

					})
					.catch((err) => {
						data.error = err.message || 'Internal Server Error';
						res.status(err.status || 500);
						return res.send(data);
					});

				break;
			case 'Admin':
			case 'Super Admin':

				listing.update(updateObj)
					.then(() => {

						data.success = 'listing updated';
						res.status(200);
						return res.send(data);

					})
					.catch((err) => {
						data.error = err.message || 'Internal Server Error';
						res.status(err.status || 500);
						return res.send(data);
					});

				break;
			default:
				data.error = 'User has no permissions';
				res.status(403);
				return res.send(data);
		}

	});

});

listingRoutes.post('/assign_owner', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = 0;

	if(!req.body.listingid){
		data.error = 'listingid required';
		res.status(400);
		return res.send(data);
	}

	Listing.findById(req.body.listingid, function(err, listing){

		if(err){
			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.send(data);
		}

		switch(req.session.user.user_role) {
			case 'Subscriber':
			case 'Editor':

				// does subscriber own a listing?

				if(req.session.user.listing){
					data.error = 'You allready own a listing';
					res.status(409);
					return res.send(data);
				}

				// is this listing owned?

				if(listing.userId){
					data.error = 'Another user owns this listing';
					res.status(403);
					return res.send(data);
				}

				var listingUpdate = listing.update({userId: req.session.user._id});
				var userUpdate = req.session.user.update({listing: req.body.listingid});

				Promise.all([listingUpdate, userUpdate])
 				.then(() => {

					data.success = 'Listing Reassigned';
					res.status(200);
					return res.send(data);

 				})
 				.catch((err) => {

 					data.error = err.message || 'Internal Server Error';
					res.status(err.status || 500);
					return res.send(data);

 				});

				break;
			case 'Admin':
			case 'Super Admin':

				if(!req.body.userId){
					data.error = 'userId required';
					res.status(400);
					return res.send(data);
				}

				var listingUpdate = listing.update({ userId: req.body.userId });

				User.findById(req.body.userId, function(err, user){

					if(err){
						data.error = err.message || 'Internal Server Error';
						res.status(err.status || 500);
						return res.send(data);
					}

					var userUpdate = user.update({ listing: req.body.listingid });

					Promise.all([listingUpdate, userUpdate])
	 				.then(() => {

						data.success = 'Listing Reassigned';
						res.status(200);
						return res.send(data);

	 				})
	 				.catch((err) => {
	 					data.error = err.message || 'Internal Server Error';
						res.status(err.status || 500);
						return res.send(data);
	 				});

				});

				break;
			default:
				data.error = 'User has no permissions';
				res.status(403);
				return res.send(data);

		}

	});

});

// DELETE /:id

listingRoutes.delete('/:id', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = 0;

	switch(req.session.user.user_role) {
		case 'Subscriber':
		case 'Editor':

			data.error = 'unauthorized';
			res.status(403);
			return res.send(data);

			break;
		case 'Admin':
		case 'Super Admin':

			Listing.remove({_id: req.params.id}, function(err, removed){

				if(err){
					data.error = err.message || 'Internal Server Error';
					res.status(err.status || 500);
					return res.send(data);
				}

				if(removed.result.n == 0){
					data.error = 'Remove Failed';
					res.status(500);
					return res.send(data);
				}

				data.success = 'listing deleted';
				res.status(200);
				return res.send(data);

			});

			break;
		default:
			data.error = 'User has no permissions';
			res.status(403);
			return res.send(data);
	}

});

module.exports = listingRoutes;