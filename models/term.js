const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const termData = require('./data/terms.json');
const Industry = require('./industry');

var SN = require('sync-node');
var pn = SN.createQueue();

let TermSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
    type: String // industry, alias, service, problem
});

TermSchema.statics.createFromIndustries = function(type, callback){

    console.log('type ', type);

    Industry.find({})
    .then((industries) => {

        let saved = 0;

        switch(type) {
            case 'industry':

                industries.forEach((industry) => {

                    pn.pushJob(function(){
                        return new Promise(function(resolve, reject){

                            Term.find({name: industry.name})
                            .then((term) => {

                                if(term.length == 0){

                                    const aTerm = new Term({
                                        name: industry.name,
                                        type: 'industry'
                                    });

                                    aTerm.save()
                                    .then(() => {

                                        saved++;
                                        resolve();

                                    })
                                    .catch((e) => {
                                        return callback(e);
                                        reject();
                                    });

                                }else{
                                    resolve();
                                }

                            })
                            .catch((e) => {
                                return callback(e);
                                reject();
                            });

                        });
                    });

                });

                pn.pushJob(function(){
                    return new Promise(function(resolve, reject){
                        return callback(null, saved);
                        resolve();
                    });
                });

                break;
            case 'aliases':

                industries.forEach((industry) => {
                    industry.aliases.forEach((alias) => {
                        pn.pushJob(function(){
                            return new Promise(function(resolve, reject){

                                Term.find({name: alias})
                                .then((term) => {

                                    if(term.length == 0){

                                        const aTerm = new Term({
                                            name: alias,
                                            type: 'alias'
                                        });

                                        aTerm.save()
                                        .then(() => {

                                            saved++;
                                            resolve();

                                        })
                                        .catch((e) => {
                                            return callback(e);
                                            reject();
                                        });

                                    }else{
                                        resolve();
                                    }

                                })
                                .catch((e) => {
                                    return callback(e);
                                    reject();
                                });

                            });
                        });
                    });
                });

                pn.pushJob(function(){
                    return new Promise(function(resolve, reject){
                        return callback(null, saved);
                        resolve();
                    });
                });

                break;
            case 'services':

                industries.forEach((industry) => {
                    industry.services.forEach((service) => {
                        pn.pushJob(function(){
                            return new Promise(function(resolve, reject){

                                Term.find({name: service})
                                .then((term) => {

                                    if(term.length == 0){

                                        const aTerm = new Term({
                                            name: service,
                                            type: 'service'
                                        });

                                        aTerm.save()
                                        .then(() => {

                                            saved++;
                                            resolve();

                                        })
                                        .catch((e) => {
                                            return callback(e);
                                            reject();
                                        });

                                    }else{
                                        resolve();
                                    }

                                })
                                .catch((e) => {
                                    return callback(e);
                                    reject();
                                });

                            });

                        });
                    });
                });

                pn.pushJob(function(){
                    return new Promise(function(resolve, reject){
                        return callback(null, saved);
                        resolve();
                    });
                });

                break;
            default:
                return callback('not a valid type');

        }

    })
    .catch((e) => {
        callback(e);
    });

};

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