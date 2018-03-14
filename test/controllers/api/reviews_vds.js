process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Listing = require('../../../models/listing');
let Industry = require('../../../models/industry');
let Postcode = require('../../../models/postcode');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;
let each = require('async-each');
let async = require('async');

let mockCollection = require('../../helpers.js').mockCollection;
let emptyReviews = require('../../helpers_reviews.js').emptyReviews;
let addReview = require('../../helpers_reviews.js').addReview;

// let mockJsonPostcodes = require('../../mockdata/postcodes.json');
let mockJsonUsers = require('../../mockdata/users.json');
let mockJsonListings = require('../../mockdata/listings.json');
let bobsReviews = require('../../mockdata/bobsreviews.json');

chai.use(chaiHttp);

var agent = chai.request.agent(server);

function logIn(user, pass, callback){

    agent
        .post('/login')
        .send({ email: user, password: pass, test: true})
        .end(function (err, res) {

            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

var franky, bob, jonny, jenny, sally, george;
var johnsTattoos, jensFlowers, bobsBakers, brucesBar;

var users = {franky: "", bob: "", jonny: "", jenny: "", sally: "", george: ""};
// var listings = [johnsTattoos, jensFlowers, bobsBakers, brucesBar];
var listings = {johnsTattoos: "", jensFlowers: "", bobsBakers: "", brucesBar: ""};

describe('Reviews API', () => {

    beforeEach(function(done){

        Promise.all([Industry.remove({}), Listing.remove({}), User.remove({})])
        .then(() => {

            var userSaves = [];
            var listingSaves = [];

            var index = 0;

            for(var user in users) {
                if(users.hasOwnProperty(user)) {
                    users[user] = new User(mockJsonUsers[index]);
                    userSaves.push(users[user].save());
                }
                index++;
            }
    
            index = 0;

            mockJsonListings.forEach(function(listingObj){

                var aListing = new Listing(listingObj);

                switch(aListing.business_name){
                    case "Jonnys Tattoos":
                        aListing.userId = users['jonny']._id;
                        users['jonny'].listing = aListing._id;
                        listings.johnsTattoos = aListing;
                        break;
                    case "Jennys Flowers":
                        aListing.userId = users['jenny']._id;
                        users['jenny'].listing = aListing._id;
                        listings.jensFlowers = aListing;
                        break;
                    case "Bobs Bakers":
                        aListing.userId = users['bob']._id;
                        users['bob'].listing = aListing._id;
                        listings.bobsBakers = aListing;
                        break;
                    case "Bruces Bar":
                        listings.brucesBar = aListing;
                        break;
                    default:
                }

                listingSaves.push(aListing.save());
                index++;

            });

            var index = 0;

            Promise.all(userSaves.concat(listingSaves)).then(() => {
                done();
            })
            .catch((e) => {
                console.log(e);
            });

        });

    });

    describe('GET /api/reviews/:listingid', () => {

        beforeEach((done) => {

            emptyReviews(users, listings.bobsBakers._id, (err) => {

                if(err){ console.log(err); }

                var reviewUsers = ['franky', 'jonny', 'jenny', 'sally', 'george'];
                var index = 0;

                async.each(bobsReviews, (review, next) => {
                    addReview(review, users[reviewUsers[index]], listings.bobsBakers, (err, user, listing) => {
                        if(err){ console.log(err); }
                        users[reviewUsers[index]] = user;
                        listings.bobsBakers = listing;
                        index++;
                        next();
                    });
                }, (err) => {
                    if(err){console.log(err)}
                    done();
                });

            });

        });

        it.only('should return both published and unpublished reviews if user is editor', (done) => {
            
            logIn('sal@sally.com', '890', function(agent){

                agent.get('/api/reviews/' + listings.bobsBakers._id)
                    .end((err, res) => {
                        res.body.reviews.length.should.equal(5); 
                        done();
                    });

            });

        });

        it('should login ', (done) => {

            logIn('frank@franky.com', 'abc', function(agent){

                agent.get('/api/listings/uihuih89yu89h')
                    .send({})
                    .end(function (err, res) {
                        done();
                    });

            });

        });

    });

});