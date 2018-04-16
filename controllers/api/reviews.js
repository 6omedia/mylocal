const express = require('express');
const reviewRoutes = express.Router();
const mongoose = require('mongoose');
const utils = require('../../helpers/utilities.js');
const sendEmail = require('../../helpers/dbhelpers.js').sendEmail;
const User = require('../../models/user');
const Listing = require('../../models/listing');
const Review = require('../../models/review');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

reviewRoutes.get('/', function(req, res){

	let data = {};
	let query = {
		approved: true
	};

	if(req.session.user){
		
		const role = req.session.user.user_role;

		if(role == 'Editor' || role == 'Admin' || role == 'Super Admin'){

			if(req.query.approved){
				switch(req.query.approved){
					case '1':
						query.approved = true;
						break;
					case '0':
						query.approved = false;
						break;
					default:
				}
			}else{

				delete query.approved;

			}

		}
	}

	Review.find(query)
		.then((reviews) => {
			data.reviews = reviews;
			return res.json(data);
		})
		.catch((e) => {
			data.error = e.message || 'Internal Server Error';
			res.status = e.status || 500;
			return res.json(data);
		});
});

reviewRoutes.get('/:listingid', function(req, res){

	let data = {};
	let query = {
		listing: req.params.listingid, 
		approved: true
	};

	if(req.session.user){
		
		const role = req.session.user.user_role;

		if(role == 'Editor' || role == 'Admin' || role == 'Super Admin'){

			if(req.query.approved){
				switch(req.query.approved){
					case '1':
						query.approved = true;
						break;
					case '0':
						query.approved = false;
						break;
					default:
				}
			}else{

				delete query.approved;

			}

		}
	}

	Review.find(query)
		.then((reviews) => {
			data.reviews = reviews;
			return res.json(data);
		})
		.catch((e) => {
			data.error = e.message || 'Internal Server Error';
			res.status = e.status || 500;
			return res.json(data);
		});

});

reviewRoutes.post('/add', mid.jsonLoginRequired, function(req, res){

	let data = {};
	const validProps = utils.requiredPostProps(['listingid', 'rating'], req.body);

	if(validProps != true){
		data.error = validProps;
		res.status(400);
		return res.json(data);
	}

	if(req.session.user.listing){
		if(req.session.user.listing.equals(req.body.listingid)){
			data.error = 'You cannot review your own listing';
			res.status(403);
			return res.json(data); 
		}
	}

	const role = req.session.user.user_role;

	let review = new Review({
		user: req.session.user._id,
		listing: req.body.listingid,
		rating: req.body.rating,
		review: req.body.review || '',
		curated: {
		    review: req.body.curated_review || '',
		    img: req.body.curated_img || ''
		}
	});

	if(req.body.rating >= 6){
		review.approved = true;
	}

	Review.find({user: req.session.user._id, listing: req.body.listingid}, (err, reviews) => {

		if(err){
			data.error = e.message || 'Internal Server Error';
			res.status = e.status || 500;
			return res.json(data);
		}

		if(reviews.length > 0){
			data.error = 'You have allready reviewed this listing';
			res.status(403);
			return res.json(data);
		}

		review.save()
		.then((review) => {

			Promise.all(
				[
					req.session.user.update({$push: {reviews: review}}),
					Listing.findOneAndUpdate({_id: req.body.listingid}, {$push: {reviews: review}}, {new: true})
				])
				.then((yeah) => {

					Listing.findById(req.body.listingid)
						.populate('userId')
						.exec((err, listing) => {

						if(err){ console.log(err); }

						sendEmail(
							'Subscriber Templates',
							'reviewed',
							req.session.user.email,
							'mail@mylocal.co', //listing.userId.email,
							null,
							(msg) => {
								return msg.replace('%name%', req.session.user.name)
										  .replace('%listing%', listing.business_name);
							}, 
							(err) => {
								if(err){ console.log(err); }
							}
						);

						let template;

						if(req.body.rating >= 6){
							template = 'goodreview';
						}else{
							template = 'badreview';
						}

						sendEmail(
							'Business Owner Templates',
							template,
							listing.userId.email,
							'mail@mylocal.co', // req.session.user.email,
							null,
							(msg) => {
								return msg.replace('%name%', '')
										  .replace('%rating%', req.body.rating);
							}, 
							(err) => {
								if(err){ console.log(err); }
							}
						);

					});

					data.review = review;
					data.success = 'Review Saved';
					res.status(200);
					return res.json(data);
				})	
				.catch((e) => {
					console.log(e);
					data.error = e.message || 'Internal Server Error';
					res.status = e.status || 500;
					return res.json(data);
				});

		})
		.catch((e) => {
			data.error = e.message || 'Internal Server Error';
			res.status = e.status || 500;
			return res.json(data);
		});

	});

});

reviewRoutes.post('/update', mid.jsonLoginRequired, function(req, res){

	let data = {};

	if(!req.body.reviewid){
		data.error = 'Missing reviewid';
		res.status(400);
		return res.json(data);
	}

	const role = req.session.user.user_role;
	let isAdmin = false;

	if(role == 'Editor' || role == 'Admin' || role == 'Super Admin'){
		isAdmin = true;
	}

	Review.findById(req.body.reviewid, (e, review) => {

		if(e){
			data.error = e.message || 'Internal Server Error';
			res.status = e.status || 500;
			return res.json(data);
		}

		if(!review.user.equals(req.session.user._id) && !isAdmin){
			data.error = 'You dont have permission to update review';
			res.status(403);
			return res.json(data);
		}

		let updateObj = {};

		if(req.body.rating)
			updateObj.rating = req.body.rating;

		if(req.body.review)
			updateObj.review = req.body.review;

		let curatedObj = {};

		if(req.body.curated_review)
			curatedObj.review = req.body.curated_review;

		if(req.body.curated_img)
			curatedObj.img = req.body.curated_img;

		if(Object.getOwnPropertyNames(curatedObj).length > 0)
			updateObj.curated = curatedObj;

		if(isAdmin){
			if(req.body.hasOwnProperty('approved')){
				updateObj.approved = req.body.approved;
			}
		}else{
			if(req.body.hasOwnProperty('approved')){
				data.success = 'Review Updated';
				data.review = review;
				data.error = 'You dont have permission to approve reviews';
				res.status(403);
				return res.json(data);
			}
		}

		Review.update({_id: req.body.reviewid}, updateObj)
			.then(() => {
				
				Review.findById(req.body.reviewid)
					.then((review) => {
						data.success = 'Review Updated';
						data.review = review;
						res.status(200);
						return res.json(data);
					})
					.catch((e) => {
						data.error = e.message || 'Internal Server Error';
						res.status = e.status || 500;
						return res.json(data);
					});

			})
			.catch((e) => {
				data.error = e.message || 'Internal Server Error';
				res.status = e.status || 500;
				return res.json(data);
			});

	});

});

reviewRoutes.post('/publish', mid.jsonOnlyAdmin, function(req, res){

	let data = {};
	const validProps = utils.requiredPostProps(['approved', 'reviewid'], req.body);

	if(validProps != true){
		data.error = validProps;
		res.status(400);
		return res.json(data);
	}

	Review.findByIdAndUpdate(req.body.reviewid, {approved: req.body.approved}, {new: true}, (err, review) => {

		if(err){
			data.error = err.message || 'Internal Server Error';
			res.status = err.status || 500;
			return res.json(data);
		}

		data.success = 'Review Updated';
		data.review = review;
		res.status(200);
		return res.json(data);

	});

});

reviewRoutes.delete('/:reviewid', mid.jsonLoginRequired, function(req, res){

	let data = {};

	const role = req.session.user.user_role;

	Review.findById(req.params.reviewid, (err, review) => {

		if(err){
			data.error = err.message || 'Internal Server Error';
			res.status = err.status || 500;
			return res.json(data);
		}

		if(role != 'Editor' && role != 'Admin' && role != 'Super Admin'){
			if(!req.session.user._id.equals(review.user)){
				data.error = 'Unathorized';
				res.status(403);
				return res.json(data);
			}
		}

		let userUpdate = User.findByIdAndUpdate(req.session.user._id, {$pull: { reviews: req.params.reviewid } });
		let listingUpdate = Listing.findByIdAndUpdate(review._id, {$pull: { reviews: req.params.reviewid } });
		let reviewRemove = Review.remove({_id: review._id});

		Promise.all([userUpdate, listingUpdate, reviewRemove])
			.then((a) => {
				data.success = 'Review Deleted';
				res.status(200);
				return res.json(data);
			})
			.catch((e) => {
				data.error = e.message || 'Internal Server Error';
				res.status = e.status || 500;
				return res.json(data);
			});

	});

});

module.exports = reviewRoutes;