const each = require('sync-each');
const geocodePostcode = require('../operations/functions').geocodePostcode;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const postcodeData = require('./data/postcodes.json');

//book schema definition
let PostcodeSchema = new Schema(
    {
        postcode: {
            type: String,
            required: true,
            unique: true
        },
        county: String,
        town: String,
        suburb: String,
        suburb_town: String,
        latitude: Number,
        longitude: Number
    }
);

PostcodeSchema.statics.uploadFromJSON = function(postcodeArray, callback){

    let saved = 0;
    let failed = 0;
    let tasksToGo = postcodeArray.length;

    postcodeArray.forEach(function(pcObj){

        var postcode = new Postcode({
        	postcode: pcObj.Postcode,
		    county: pcObj.County,
		    town: pcObj.District,
		    suburb: pcObj.Ward,
		    latitude: pcObj.Latitude,
		    longitude: pcObj.Longitude
        });

        postcode.save()
            .then((postcode) => {

                process.stdout.write(' + ');

                saved++;

                if(--tasksToGo === 0) {
                    callback(saved + ' out of ' + postcodeArray.length + ' postcodes saved');
                }

            })
            .catch((err) => {
                process.stdout.write(' - ');

                if(err.code != '11000'){
                    process.stdout.write(err);
                }

                failed++;

                if(--tasksToGo === 0) {
                    callback(saved + ' out of ' + postcodeArray.length + ' postcodes saved');
                }

            });
    
    });

};

PostcodeSchema.statics.searchByTerm = function(term, callback){

    const props = ['town', 'suburb_town', 'postcode'];
    term = new RegExp('^' + term, 'i');
    locations = [];

    each(props, (prop, eNxt) => {

        Postcode.find({[prop]: term}).distinct(prop).lean()
        .then((locs) => {
            
            locs = locs.slice(0, (5 - locations.length));
            locations = locations.concat(locs);

            if(locations.length >= 5){
                return callback(null, locations);
            }
            eNxt(); 

        })
        .catch(err => {
            res.status(err.status || 500); 
            return callback(err);
        });

    }, (err) => {
        if(err){ return callback(err) }
        return callback(null, locations);
    });

};

PostcodeSchema.statics.getLatlngs = function(postcode, callback){

    Postcode.findOne({postcode: postcode})
        .then((foundPostcode) => {

            if(foundPostcode && foundPostcode != undefined){
                return callback(null, foundPostcode.longitude, foundPostcode.latitude);
            }

            geocodePostcode(postcode, function(err, lng, lat, town){
                    
                if(err){
                    let pcError = new Error('Not a valid Postcode');
                    pcError.status = 400;
                    return callback(pcError);
                }

                return callback(null, lng, lat);

            });

        })
        .catch((err) => {
            return callback(err);
        });

};

var Postcode = mongoose.model("Postcode", PostcodeSchema);
module.exports = Postcode;