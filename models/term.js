const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const termData = require('./data/terms.json');

let TermSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
    type: String
});

var Term = mongoose.model("Term", TermSchema);

Term.find({}).exec(function(err, terms){

    if(err){
        return next(err);
    }

    if(!terms || terms == ''){
        
        Term.insertMany(termData)
            .then(function(terms) {
                // console.log('Terms Added');
            })
            .catch(function(err) {
                // console.log('Err ', err);
            });

    }

});

module.exports = Term;