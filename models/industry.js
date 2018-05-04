const fs = require('fs');
const path = require('path');
const random = require('mongoose-simple-random');
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
    aliases: [String],
    services: [String],
    allow_featured: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Number,
        default: 0
    }
});

IndustrySchema.plugin(random);

IndustrySchema.virtual('bgimage').get(function(){

    if(fs.existsSync(path.join(__dirname, '..', '/public/img/backgrounds/' + this.name.toLowerCase() + '.jpg'))) {
        return '/static/img/backgrounds/' + this.name.toLowerCase() + '.jpg';       
    }

    return '/static/img/backgrounds/default.jpg';

});

IndustrySchema.statics.getFeatured = function(callback){

    let finds = [];

    finds.push(Industry.find({allow_featured: true, featured: 1}));
    finds.push(Industry.find({allow_featured: true, featured: 2}));
    finds.push(Industry.find({allow_featured: true, featured: 3}));
    finds.push(Industry.find({allow_featured: true, featured: 4}));
    finds.push(Industry.find({allow_featured: true, featured: 5}));

    Promise.all(finds)
    .then((results) => {

        let featured = [];

        let found = 0;

        results.forEach(function(result){

            var obj = {};

            if(result.length > 0){
                found++;
                obj.id = result[0]._id;
                obj.name = result[0].name;
                obj.bgimage = result[0].bgimage;
            }else{
                obj.id = null;
                obj.name = '';
            }

            featured.push(obj);

        });

        if(found == 5){
            return callback(null, featured);
        }

        Industry.findRandom(
            {allow_featured: true, featured: 0}, 
            {}, 
            {limit: 5 - found}, (err, random) => {

                if(err){
                    return callback(err);
                }

                let posInRandom = 0;

                featured.forEach(function(item){
                    if(item.name == ''){
                        item.id = random[posInRandom]._id;
                        item.name = random[posInRandom].name;
                        item.bgimage = random[posInRandom].bgimage;
                        posInRandom++;
                    }
                });

                return callback(null, featured);

            });       

    })
    .catch((e) => {
        callback(e);
    });

};

IndustrySchema.statics.getFixedFeatured = function(callback){

    let finds = [];

    finds.push(Industry.find({allow_featured: true, featured: 1}));
    finds.push(Industry.find({allow_featured: true, featured: 2}));
    finds.push(Industry.find({allow_featured: true, featured: 3}));
    finds.push(Industry.find({allow_featured: true, featured: 4}));
    finds.push(Industry.find({allow_featured: true, featured: 5}));

    Promise.all(finds)
    .then((results) => {

        let featured = [];

        results.forEach(function(result){

            var obj = {};

            if(result.length > 0){
                obj.id = result[0]._id;
                obj.name = result[0].name;
            }else{
                obj.id = null;
                obj.name = '';
            }

            featured.push(obj);

        });

        callback(null, featured);

    })
    .catch((e) => {
        callback(e);
    });

};

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