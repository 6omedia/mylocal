const Review = require('../models/review');
const Listing = require('../models/listing');
const User = require('../models/user');
const each = require('async-each'); 

function emptyReviews(userObj, listingId, callback){

	Review.remove({}, (err) => {

		if(err){console.log(err)}

		let userSaves = [];

		for(var key in userObj){
			if(userObj.hasOwnProperty(key)){
				userSaves.push(userObj[key].update({reviews: []}));
			}
		}

		Promise.all(userSaves)
			.then(() => {
				Listing.findOneAndUpdate({_id: listingId}, {reviews: []}, (err, listing) => {
					if(err){console.log(err)}
					callback(null);
				});
			})
			.catch((e) => {
				console.log(e);
			});

	});

}


function addReview(review, user, listing, callback){

	var aReview = new Review({
        rating: review.rating,
        review: review.review,
        approved: review.approved
    });

    aReview.user = user._id;
    aReview.listing = listing._id;

	listing.reviews.push(aReview._id);

	aReview.save()
		.then((review) => {

			user.update({$push: {reviews: aReview._id}})
				.then((results) => {

					listing.save()
						.then((listing) => {

							User.findById(user._id, (err, user) => {
								return callback(null, user, listing, review);
							});
							
						})
						.catch((e) => {
							return callback(e);
						});

				})
				.catch((e) => {
					return callback(e);
				});

		})
		.catch((e) => {
			return callback(e);
		});

}

exports.emptyReviews = emptyReviews;
exports.addReview = addReview;
module.exports = exports;