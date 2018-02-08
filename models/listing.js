const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//book schema definition
let ListingSchema = new Schema(
    {
        userId: {
        	type: Schema.Types.ObjectId,
            ref: 'User'
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        business_name: {
        	type: String,
        	required: true
        },
        slug: {
            type: String,
            unique: true
        },
        description: String,
        address: {
        	line_one: {
        		type: String,
        		required: true
        	},
        	line_two: String,
        	town: {
        		type: String,
        		required: true
        	},
        	post_code: {
        		type: String,
        		required: true
        	}
        },
        contact: {
        	website: String,
        	phone: String,
        	email: String
        },
        industry: String,
        opening_hours: {
        	monday: {
        		open: String,
        		close: String
        	},
        	tuesday: {
        		open: String,
        		close: String
        	},
        	wednesday: {
        		open: String,
        		close: String
        	},
        	thursday: {
        		open: String,
        		close: String
        	},
        	friday: {
        		open: String,
        		close: String
        	},
        	saturday: {
        		open: String,
        		close: String
        	},
        	sunday: {
        		open: String,
        		close: String
        	},
        	chirstmas_eve: {
        		open: String,
        		close: String
        	},
        	christmas: {
        		open: String,
        		close: String
        	},
        	boxing_day: {
        		open: String,
        		close: String
        	},
        	newyears_eve: {
        		open: String,
        		close: String
        	},
        	newyears_day: {
        		open: String,
        		close: String
        	}
        },
        services: {
            type: Array,
            trim: true
        },
        social: {
        	style: String,
        	icons: Object
	    },
	    branding: {
	    	logo: String,
	    	background: String,
	    	primary_color: {
                type: String,
                default: 'fff'
            },
	    	secondary_color: {
                type: String,
                default: '000'
            },
	    	accent: {
                type: String,
                default: '38c2dc'
            }
	    },
	    reviews: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
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
            created_at: {
                type: Date,
                default: Date.now
            }
        }],
	    gallery: Array
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

ListingSchema.virtual('rating').get(function(){

    if(!this.reviews || this.reviews.length == 0){
        return null;
    }

    var reviewCount = this.reviews.length;
    var totalRating = 0;

    this.reviews.forEach(function(review){
        totalRating = totalRating + parseInt(review.rating);
    });

    return Math.ceil(totalRating / reviewCount);

});

/*

    membership...
        inactive
        free
        premium

*/

ListingSchema.pre('save', function(next){

    this.slug = this.business_name.toString().toLowerCase().replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');

    next();

});

// ListingSchema.pre('update', function(next){

//     this.slug = this.business_name.toString().toLowerCase().replace(/\s+/g, '-')
//         .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
//         .replace(/^-+/, '').replace(/-+$/, '');

//     next();

// });

ListingSchema.statics.uploadFromJSON = function(listingArray, callback){

    let saved = 0;
    let failed = 0;
    let tasksToGo = listingArray.length;

    listingArray.forEach(function(listing){

        listing.business_name = listing.business_name.substring(0, listing.business_name.indexOf('('));

        var listing = new Listing(listing);
        listing.save()
            .then((listing) => {

                saved++;

                if(--tasksToGo === 0) {
                    callback(saved + ' out of ' + listingArray.length + ' listings saved');
                }

            })
            .catch((err) => {
                console.log('err: ', err.errmsg);
                failed++;

                if(--tasksToGo === 0) {
                    callback(saved + ' out of ' + listingArray.length + ' listings saved');
                }

            });
    
    });

}

var Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;