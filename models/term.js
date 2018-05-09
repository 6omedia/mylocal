const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const termData = require('./data/terms.json');

let TermSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
    type: String // industry, alias, service, problem
});

TermSchema.statics.uploadFromJSON = function(termsArray, callback){

    let saved = 0;
    let failed = 0;
    let tasksToGo = termsArray.length;

    termsArray.forEach(function(term){

        pn.pushJob(function(){

            // console.log(listing);

            return new Promise(function(resolve, reject){

                var newTerm = new Term(term);

                newTerm.save()
                    .then((listing) => {

                        saved++;
                        readline.cursorTo(process.stdout, 0);
                        process.stdout.write(`Saved: ${saved} Failed: ${failed} \n out of ${termsArray.length} \r`);
                        resolve();

                    })
                    .catch((err) => {

                        failed++;
                        readline.cursorTo(process.stdout, 0);
                        process.stdout.write(`Saved: ${saved} Failed: ${failed} \n out of ${termsArray.length} \r`);
                        resolve();

                    });

            });
        });
    
    });

    pn.pushJob(function(){
        return new Promise(function(resolve, reject){
            callback(saved + ' out of ' + termsArray.length + ' terms saved');
            resolve();
        });
    });

};

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