const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const townData = require('./data/towns.json');
const fs = require('fs');
const path = require('path');

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
        default: '/static/img/towns/default.jpg'
    },
    loc: { 
        type: [Number],
        index: '2d'
    },
    county: String,
    latitude: Number,
    longitude: Number
});

TownSchema.virtual('bgimage').get(function(){

    if(fs.existsSync(path.join(__dirname, '..', '/public/img/towns/' + this.name.toLowerCase() + '.jpg'))) {
        return '/static/img/towns/' + this.name.toLowerCase() + '.jpg';       
    }

    return '/static/img/towns/default.jpg';

});

TownSchema.methods.nearestCapital = function(callback){

    const miles = 20;

    this.model('Town').findOne({
        capital: true,
        loc: { 
            $geoWithin: {
                $centerSphere: [
                    [this.longitude, this.latitude],
                    miles / 3963.2
                ]
            }      
        }
    })
    .then((towns) => {
        return callback(null, towns);
    })
    .catch((e) => {
        return callback(e);
    });

};

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