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
    created_at: {
        type: Date,
        default: Date.now
    },
    curated: {
        review: String,
        img: String
    }
});

ReviewSchema.statics.addReview = function(){



};

var Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;