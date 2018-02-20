const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const postcodeData = require('./data/postcodes.json');

//book schema definition
let PostcodeSchema = new Schema({
    postcode: {
        type: String,
        required: true,
        unique: true
    },
    county: String,
    town: String,
    suburb: String,
    latitude: Number,
    longitude: Number
});

// Postcode.find({}).exec(function(err, postcodes){

//     if(err){
//         return next(err);
//     }

//     if(!postcodes || postcodes == ''){
        
//         Postcode.insertMany(postcodeData)
//             .then(function(towns) {
//                 console.log('Postcodes Added');
//             })
//             .catch(function(err) {
//                 console.log('Err ', err);
//             });

//     }

// });

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

var Postcode = mongoose.model("Postcode", PostcodeSchema);
module.exports = Postcode;