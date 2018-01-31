const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const industryData = require('./data/industries.json');

//book schema definition
let IndustrySchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
    category: String,
    services: Array
});

var Industry = mongoose.model("Industry", IndustrySchema);

Industry.find({}).exec(function(err, industies){

    if(err){
        return next(err);
    }

    if(!industies || industies == ''){
        
        Industry.insertMany(industryData)
            .then(function(industies) {
                console.log('Industies Added');
            })
            .catch(function(err) {
                console.log('Err ', err);
            });

    }

});

module.exports = Industry;