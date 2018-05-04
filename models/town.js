const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const townData = require('./data/towns.json');

let TownSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
    capital: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: '/static/img/locations/default.jpg'
    },
    county: String,
    latitude: Number,
    longitude: Number
});

var Town = mongoose.model("Town", TownSchema);

Town.find({}).exec(function(err, towns){

    if(err){
        return next(err);
    }

    if(!towns || towns == ''){
        
        Town.insertMany(townData)
            .then(function(towns) {
                // console.log('Towns Added');
            })
            .catch(function(err) {
                // console.log('Err ', err);
            });

    }

});

module.exports = Town;