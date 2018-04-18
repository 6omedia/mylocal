const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Schema = mongoose.Schema;
const each = require('sync-each');
const pagination = require('../helpers/pagination');

const Postcode = require('./postcode');
const Town = require('./town');
const Suburb = require('./suburb');

var SN = require('sync-node');
var pn = SN.createQueue();

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
        description: {
            type: String,
            text: true
        },
        address: {
        	line_one: {
        		type: String,
        		required: true
        	},
        	line_two: String,
        	town: {
        		type: String,
        		required: true,
                text: true
        	},
        	post_code: {
        		type: String,
        		required: true,
                text: true
        	}
        },
        loc: { 
            type: [Number],
            index: '2d'
        },
        contact: {
        	website: String,
        	phone: String,
        	email: String
        },
        industry: {
            type: String,
            required: true,
            text: true
        },
        opening_hours: {
        	monday: {
        		open: {
                    type: String,
                    default: '-:-'
                },
        		close: {
                    type: String,
                    default: '-:-'
                }
        	},
        	tuesday: {
        		open: {
                    type: String,
                    default: '-:-'
                },
        		close: {
                    type: String,
                    default: '-:-'
                }
        	},
        	wednesday: {
        		open: {
                    type: String,
                    default: '-:-'
                },
        		close: {
                    type: String,
                    default: '-:-'
                }
        	},
        	thursday: {
        		open: {
                    type: String,
                    default: '-:-'
                },
        		close: {
                    type: String,
                    default: '-:-'
                }
        	},
        	friday: {
        		open: {
                    type: String,
                    default: '-:-'
                },
        		close: {
                    type: String,
                    default: '-:-'
                }
        	},
        	saturday: {
        		open: {
                    type: String,
                    default: '-:-'
                },
        		close: {
                    type: String,
                    default: '-:-'
                }
        	},
        	sunday: {
        		open: {
                    type: String,
                    default: '-:-'
                },
        		close: {
                    type: String,
                    default: '-:-'
                }
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
            trim: true,
            text: true
        },
        social: {
        	style: {
                type: String,
                default: 'Standard'
            },
        	icons: {
                type: Object,
                default: {}
            }
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
            type: Schema.Types.ObjectId,
            ref: 'Review'
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

ListingSchema.virtual('bgimage').get(function(){

    const bg = this.branding.background;

    if(bg != undefined && bg != '' && bg != '/static/img/admin/placeholder-bg.png'){
        return this.branding.background;
    }

    if(fs.existsSync(path.join(__dirname, '..', '/public/img/backgrounds/' + this.industry.toLowerCase() + '.jpg'))) {
        return '/static/img/backgrounds/' + this.industry.toLowerCase() + '.jpg';       
    }

    return '/static/img/backgrounds/default.jpg';

});

/*

    membership...
        inactive
        free
        premium

*/

ListingSchema.pre('save', function(next){

    var strg = this.business_name + '-' + this.address.town + '-' + this._id;

    this.slug = strg.toString().toLowerCase().replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');

    next();

});

ListingSchema.statics.uploadFromJSON = function(listingArray, callback){

    let saved = 0;
    let failed = 0;
    let tasksToGo = listingArray.length;

    listingArray.forEach(function(listing){

        pn.pushJob(function(){

           // console.log(listing);

            return new Promise(function(resolve, reject){

                var newListing = new Listing(listing);
                newListing.save()
                    .then((listing) => {

                        console.log('Saved ' + saved);
                        saved++;
                        resolve();

                    })
                    .catch((err) => {

                        console.log('Failed ' + err);
                        failed++;
                        resolve();

                    });

            });
        });
    
    });

    pn.pushJob(function(){
        return new Promise(function(resolve, reject){
            callback(saved + ' out of ' + listingArray.length + ' listings saved');
        });
    });

};

ListingSchema.statics.getLatLngsByTerm = function(term, callback){

    this.locationType(term, (err, type) => {
        if(err){ return callback(err); }
        switch(type.name){
            case 'postcode':
                Postcode.findOne({postcode: term.toUpperCase()}, (err, postcode) => {
                    if(err) return callback(err);
                    if(!postcode) return callback({message: 'No Postcode found'});
                    return callback(null, postcode.latitude, postcode.longitude);
                });
                break;
            case 'town':
                Town.findOne({name: term}, (err, town) => {
                    if(err){ return callback(err); }
                    if(!town){ return callback({message: 'No Town found'}); }
                    return callback(null, town.latitude, town.longitude);
                });
                break;
            case 'suburb':
                Suburb.findOne({name: term}, (err, suburb) => {
                    if(err){ return callback(err); }
                    if(!suburb) return callback({message: 'No Suburb found'});
                    return callback(null, suburb.latitude, suburb.longitude);
                });
                break;
            default:
                return callback({message: 'No LatLngs Found'});
        }
    });

};

ListingSchema.statics.locationType = function(term, callback){

    if(term.split(',').length > 1){
        return callback(null, {name: 'suburb', prop: 'address.line_two'});
    }

    Listing.count({'address.town': term})
    .then((count) => {  
        if(count > 0){
            return callback(null, {name: 'town', prop: 'address.town'});
        }else{
            return callback(null, {name: 'postcode'});
        }
    })
    .catch((err) => {
        return callback(err);
    });

}

ListingSchema.statics.getBySearchTerms = function(qService, qLocation, miles, page, callback){

    const EARTH_RAIDIUS_MILES = 3963.2;

    let searchForArr = [];
    let query = {};
    let docsPerPage = 15;

    searchForArr.push({ industry: new RegExp(qService, "i") });
    searchForArr.push({ services: new RegExp(qService, "i") });
    searchForArr.push({ description: new RegExp(qService, 'i') });

    this.getLatLngsByTerm(qLocation, (err, lat, lng) => {

        if(err){ return callback(err); }

        searchForArr.forEach((q) => {
            q.loc = {
                $geoWithin: { 
                    $centerSphere: [ 
                        [lng, lat],
                        miles / 3963.2
                    ] 
                }      
            };
        });

        this.count({$or: searchForArr})
            .then((count) => {

                const pageLinks = pagination.getLinks(count, docsPerPage, page, '/find/' + qService + '/' + qLocation);

                this.find({$or: searchForArr})
                    .limit(docsPerPage)
                    .skip(pagination.getSkip(page, docsPerPage))
                    .sort({loc: 'asc'}).exec((err, listings) => {

                    if(err){ return callback(err); }

                    if(!listings || listings.length == 0){
                        return callback(null, [], pageLinks, 'Sorry, could not find any listings for ' + qService + ' in ' + qLocation);
                    }

                    return callback(null, listings, pageLinks);

                });

            })
            .catch((e) => {
                return callback(e);
            });

    });

}

// ListingSchema.statics.findSimilar = function(qService, qLocation, callback){

//     this.find({}, (err, listings) => {
//         callback(null, '');
//     });

// }

var Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;