const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const serviceData = require('./data/services.json');

//book schema definition
let ServiceSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
    industry: String
});

var Service = mongoose.model("Service", ServiceSchema);

Service.find({}).exec(function(err, services){

    if(err){
        return next(err);
    }

    if(!services || services == ''){
        
        Service.insertMany(serviceData)
            .then(function(industies) {
                console.log('Services Added');
            })
            .catch(function(err) {
                console.log('Err ', err);
            });

    }

});

module.exports = Service;