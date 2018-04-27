const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ReviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing'
    },
    rating: {
        type: Number,
        required: true,
        validate: {
            validator: (rating) => rating > 0 && rating < 11,
            message: 'Must be a number between 1 and 10'
        }
    },
    review: String,
    approved: {
        type: Boolean,
        default: false
    },
    messages: [{
        created_at: {
            type: Date,
            default: Date.now
        },
        from: {
            side: {
                type: String,
                validate: function(value){
                    if(value == 'owner' || value == 'author'){
                        return true;
                    }else{
                        return false;
                    }
                }
            },
            name: String,
            email: String
        },
        to: {
            side: {
                type: String,
                validate: function(value){
                    if(value == 'owner' || value == 'author'){
                        return true;
                    }else{
                        return false;
                    }
                }
            },
            name: String,
            email: String
        },
        message: String
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    curated: {
        review: String,
        img: String
    }
});

ReviewSchema.statics.overallRating = function(listingid, callback){

    console.log('HERE ====================================');

    Review.find({listing: listingid, approved: true})
        .then((reviews) => {

            if(!reviews){
                return callback(null, 0);
            }

            var reviewCount = reviews.length;
            var totalRating = 0;

            reviews.forEach(function(review){
                totalRating = totalRating + parseInt(review.rating);
            });

            console.log('TOTAL RATING ====================================', totalRating);

            return callback(null, Math.ceil(totalRating / reviewCount) / 2);

        })
        .catch((e) => {
            return callback(e);
        });

};

var Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;