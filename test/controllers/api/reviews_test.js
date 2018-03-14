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

            Promise.all(userSaves.concat(listingSaves))
                .then(() => {
                    done();
                })
                .catch((e) => {
                    console.log(e);
                });

        });

    });

	describe('GET /api/reviews/:listingid', () => {

		// anyone can view published reviews, if admin can view all and can filter by published
		// get up to 10 of the most recent reviews
		// retrive pagination

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

        it('should return only published reviews when no user or user is a subscriber', (done) => {

            chai.request(server)
                .get('/api/reviews/' + listings.bobsBakers._id)
                .end((err, res) => {
                    res.body.reviews.length.should.equal(3);                    
                    logIn('frank@franky.com', 'abc', function(agent){

                        agent.get('/api/reviews/' + listings.bobsBakers._id)
                            .end((err, res) => {
                                res.body.reviews.length.should.equal(3); 
                                done();
                            });

                    });
                });

        });

        it('should return both published and unpublished reviews if user is editor', (done) => {
            
            logIn('sal@sally.com', '890', function(agent){

                agent.get('/api/reviews/' + listings.bobsBakers._id)
                    .end((err, res) => {
                        res.body.reviews.length.should.equal(5); 
                        done();
                    });

            });

        });

        it('should return both published and unpublished reviews if user is admin or superadmin', (done) => {
            
            logIn('george@georgy.com', 'abc', function(agent){

                agent.get('/api/reviews/' + listings.bobsBakers._id)
                    .end((err, res) => {
                        res.body.reviews.length.should.equal(5); 
                        done();
                    });

            });

        });

        it('should return either published or unpublished reviews if user is editor and published filter is requested in the query string', (done) => {
            
            logIn('sal@sally.com', '890', function(agent){

                agent.get('/api/reviews/' + listings.bobsBakers._id + '?approved=1')
                    .end((err, res) => {
                        res.body.reviews.length.should.equal(3); 
                        agent.get('/api/reviews/' + listings.bobsBakers._id + '?approved=0')
                            .end((err, res) => {
                                res.body.reviews.length.should.equal(2); 
                                done();
                            });
                    });

            });

        });

        it('should return either published or unpublished reviews if user is admin or superadmin and published filter is requested in the query string', (done) => {
            
            logIn('george@georgy.com', 'abc', function(agent){

                agent.get('/api/reviews/' + listings.bobsBakers._id + '?approved=1')
                    .end((err, res) => {
                        res.body.reviews.length.should.equal(3); 
                        agent.get('/api/reviews/' + listings.bobsBakers._id + '?approved=0')
                            .end((err, res) => {
                                res.body.reviews.length.should.equal(2); 
                                done();
                            });
                    });

            });

        });

        it('approved query key should have no effect when not editor, admin or superadmin', (done) => {
            chai.request(server)
                .get('/api/reviews/' + listings.bobsBakers._id + '?approved=0')
                .end((err, res) => {
                    res.body.reviews.length.should.equal(3); 
                    done();
                });
        });

        it('should return no more than 10 reviews', (done) => {
            chai.request(server)
                .get('/api/reviews/' + listings.bobsBakers._id)
                .end((err, res) => {
                    res.body.reviews.length.should.be.below(11); 
                    done();
                });
        });

	});

	describe('POST /api/reviews/add', () => {

		// add review but have unpublished if review is under 3 stars
		// only logged in subscribers can add the review apart from the owner

        beforeEach((done) => {

            var review = {
                user: users.jonny._id,
                rating: 2,
                review: "Was not good at all"
            };

            emptyReviews(users, listings.bobsBakers._id, (err) => {
                addReview(review, users.jonny, listings.bobsBakers, (err, user, listing) => {
                    users.jonny = user;
                    listings.bobsBakers = listing;
                    done();
                });
            });

        });

        it('should return 401 when no on is logged in', (done) => {

            chai.request(server)
                .post('/api/reviews/add')
                .send({})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });

        });

        it('should add a published review when the rating is 3 stars or above', (done) => {
            
            logIn('frank@franky.com', 'abc', function(agent){

                agent.post('/api/reviews/add')
                    .send({
                        listingid: listings.bobsBakers._id,
                        rating: 6,
                        review: 'Was ok could be better'
                    })
                    .end((err, res) => {
                        res.body.review.approved.should.be.true;
                        done();
                    });

            });

        });

        it('should add an unpublished review when the rating is less than 3 stars', (done) => {
            
            logIn('frank@franky.com', 'abc', function(agent){

                agent.post('/api/reviews/add')
                    .send({
                        listingid: listings.bobsBakers._id,
                        rating: 5,
                        review: 'Was ok could be better'
                    })
                    .end((err, res) => {
                        res.body.review.approved.should.be.false;
                        done();
                    });

            });

        });

        it('should return 403 when user logged in but owns the listing', (done) => {

            logIn('bob@bobert.com', 'abc', function(agent){

                agent.post('/api/reviews/add')
                    .send({
                        listingid: listings.bobsBakers._id,
                        rating: 6,
                        review: 'Was ok could be better'
                    })
                    .end((err, res) => {
                        res.should.have.status(403);
                        res.body.error.should.equal('You cannot review your own listing');
                        done();
                    });

            });

        });

        it('should return 403 when user has allready reviewed listing', (done) => {

            logIn('jon@jonny.com', '123', function(agent){

                agent.post('/api/reviews/add')
                    .send({
                        listingid: listings.bobsBakers._id,
                        rating: 6,
                        review: 'Was ok could be better'
                    })
                    .end((err, res) => {
                        res.should.have.status(403);
                        res.body.error.should.equal('You have allready reviewed this listing');
                        done();
                    });

            });

        });

	});

	describe('POST /api/reviews/update', () => {

		// only editor, admin, superadmin or author of review can update reviews

        var jonnysReview;

        beforeEach((done) => {

            var review = {
                rating: 2,
                review: "Was not good at all"
            };

            emptyReviews(users, listings.bobsBakers._id, (err) => {
                addReview(review, users.jonny, listings.bobsBakers, (err, user, listing, review) => {
                    users.jonny = user;
                    listings.bobsBakers = listing;
                    jonnysReview = review;
                    done();
                });
            });
        
        });

        it('should return 401 when no on is logged in', (done) => {
            
            chai.request(server)
                .post('/api/reviews/update')
                .send({})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });

        });

        it('should return 403 when user logged in but is not editor, admin, superadmin or author of the review', (done) => {
           
            logIn('jen@jenny.com', '123', function(agent){

                agent.post('/api/reviews/update')
                    .send({
                        reviewid: jonnysReview._id,
                        rating: 6,
                        review: 'Actually it wasent too bad',
                        curated_review: 'No it was Actually Awesome',
                        curated_img: '/static/img/curated.png'
                    })
                    .end((err, res) => {
                        res.should.have.status(403);
                        res.body.error = 'You dont have permission to update this review';
                        done();
                    });

            });

        });

        it('should update if user is the author of the review', (done) => {
            
            logIn('jon@jonny.com', '123', function(agent){

                agent.post('/api/reviews/update')
                    .send({
                        reviewid: jonnysReview._id,
                        rating: 6,
                        review: 'Actually it wasent too bad',
                        curated_review: 'No it was Actually Awesome',
                        curated_img: '/static/img/curated.png'
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.not.have.property('error');
                        res.body.review.rating.should.equal(6);
                        res.body.review.review.should.equal('Actually it wasent too bad');
                        res.body.review.curated.review.should.equal('No it was Actually Awesome');
                        res.body.review.curated.img.should.equal('/static/img/curated.png');
                        done();
                    });

            });

        });

        it('should not update published when user is not editor, admin or superadmin', (done) => {
            
            logIn('jon@jonny.com', '123', function(agent){

                agent.post('/api/reviews/update')
                    .send({
                        reviewid: jonnysReview._id,
                        rating: 6,
                        review: 'Actually it wasent too bad',
                        curated_review: 'No it was Actually Awesome',
                        curated_img: '/static/img/curated.png',
                        approved: true
                    })
                    .end((err, res) => {
                        res.should.have.status(403);
                        res.body.error.should.equal('You dont have permission to approve reviews');
                        done();
                    });

            });

        });

        it('should update review when loggedin as editor, admin, superadmin', (done) => {
            
            logIn('george@georgy.com', '456', function(agent){

                agent.post('/api/reviews/update')
                    .send({
                        reviewid: jonnysReview._id,
                        rating: 6,
                        review: 'Actually it wasent too bad',
                        curated_review: 'No it was Actually Awesome',
                        curated_img: '/static/img/curated.png',
                        approved: true
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.review.rating.should.equal(6);
                        res.body.review.review.should.equal('Actually it wasent too bad');
                        res.body.review.curated.review.should.equal('No it was Actually Awesome');
                        res.body.review.curated.img.should.equal('/static/img/curated.png');
                        res.body.review.approved.should.be.true;
                        done();
                    });

            });

        });

        it('should update when user is the author of the review', (done) => {

            logIn('jon@jonny.com', '123', function(agent){

                agent.post('/api/reviews/update')
                    .send({
                        reviewid: jonnysReview._id,
                        rating: 6,
                        review: 'Actually it wasent too bad',
                        curated_review: 'No it was Actually Awesome',
                        curated_img: '/static/img/curated.png'
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.review.rating.should.equal(6);
                        res.body.review.review.should.equal('Actually it wasent too bad');
                        res.body.review.curated.review.should.equal('No it was Actually Awesome');
                        res.body.review.curated.img.should.equal('/static/img/curated.png');
                        done();
                    });

            });

        });

	});

	describe('POST /api/reviews/publish', (done) => {

		// only editor, admin or superadmin can publish review

        var jonnysReview;

        beforeEach((done) => {

            var review = {
                rating: 2,
                review: "Was not good at all"
            };

            emptyReviews(users, listings.bobsBakers._id, (err) => {
                addReview(review, users.jonny, listings.bobsBakers, (err, user, listing, review) => {
                    users.jonny = user;
                    listings.bobsBakers = listing;
                    jonnysReview = review;
                    done();
                });
            });
        
        });

        it('should return 401 when no on is logged in', (done) => {

            chai.request(server)
                .post('/api/reviews/publish')
                .send({})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });

        });

        it('should return 403 when user logged in but is not editor, admin or superadmin', (done) => {
            
            logIn('jon@jonny.com', '123', function(agent){

                agent.post('/api/reviews/publish')
                    .send({
                        reviewid: jonnysReview._id,
                        approved: true
                    })
                    .end((err, res) => {
                        res.should.have.status(403);
                        res.body.error.should.equal('Unathorized');
                        done();
                    });

            });

        });

        it('should update review to published when loggedin as editor, admin or superadmin', (done) => {
            
            logIn('sal@sally.com', '890', function(agent){

                agent.post('/api/reviews/publish')
                    .send({
                        reviewid: jonnysReview._id,
                        approved: true
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.review.approved.should.be.true;
                        done();
                    });

            });

        });

	});

	describe('DELETE /api/reviews/:reviewid', () => {

		// only editor, admin, superadmin or author of review can delete review

        var jonnysReview;

        beforeEach((done) => {

            var review = {
                rating: 2,
                review: "Was not good at all"
            };

            emptyReviews(users, listings.bobsBakers._id, (err) => {
                addReview(review, users.jonny, listings.bobsBakers, (err, user, listing, review) => {
                    users.jonny = user;
                    listings.bobsBakers = listing;
                    jonnysReview = review;
                    done();
                });
            });
        
        });

        it('should return 401 when no on is logged in', (done) => {
            
            chai.request(server)
                .delete('/api/reviews/' + jonnysReview._id)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });

        });

        it('should return 403 when user logged in but is not editor, admin, superadmin or author of the review', (done) => {
            
            logIn('jen@jenny.com', '123', function(agent){

                agent.delete('/api/reviews/' + jonnysReview._id)
                    .end((err, res) => {
                        res.should.have.status(403);
                        done();
                    });

            });

        });

        it('should remove review when logged in as editor, admin, superadmin or author of the review', (done) => {
            
            logIn('jon@jonny.com', '123', function(agent){

                agent.delete('/api/reviews/' + jonnysReview._id)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });

            });

        });

	});
	
});