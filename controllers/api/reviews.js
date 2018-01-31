const express = require('express');
const reviewRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Listing = require('../../models/listing');
const mid = require('../../middleware/session');

reviewRoutes.post('/add', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = 0;

	if(!req.body.listingid){
		data.error = 'Missing lisingid';
		res.status(400);
		return res.json(data);
	}

	if(!req.body.rating){
		data.error = 'No rating given';
		res.status(400);
		return res.json(data);
	}

	Listing.findById(req.body.listingid, function(err, listing){

		if(err){
			data.error = err.message || 'Missing lisingid';
			res.status(err.status || 500);
			return res.json(data);
		}

		var review = {
			rating: req.body.rating,
			user: req.session.userId,
            review: req.body.review || ''
		};

		if(listing.reviews){
		
			let userHasReview = false;

			listing.reviews.forEach(function(review){
				if(review.user.equals(req.session.userId)){
					userHasReview = true;
				}
			});

			if(userHasReview){
				data.error = 'You have allready wrote a review for this listing';
				res.status(200);
				return res.json(data);
			}

			listing.reviews.push(review);

		}else{
			listing = [review];
		}

		listing.save()
			.then(() => {
				data.success = 'Review Saved';
				res.status(200);
				return res.json(data);
			})
			.catch((err) => {
				data.error = err.message || 'Missing lisingid';
				res.status(err.status || 500);
				return res.json(data);
			});

	});

});

module.exports = reviewRoutes;