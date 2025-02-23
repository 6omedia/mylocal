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

let mockCollection = require('../../helpers.js').mockCollection;

let mockJsonPostcodes = require('../../mockdata/postcodes.json');
let mockJsonUsers = require('../../mockdata/users.json');
let mockJsonListings = require('../../mockdata/listings.json');

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
var listings = {johnsTattoos: "", jensFlowers: "", bobsBakers: "", brucesBar: ""};

/**************** TESTS ******************/

describe('Listing API Routes', () => {

    before((done) => {
        mockCollection(mockJsonPostcodes, Postcode, () => { done(); });
    });

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
            });

        });

    });

	// no login or permission required

    describe('GET /', () => {

    	it('should return 3 listings', (done) => {
    		
    		chai.request(server)
                .get('/api/listings')
                .end((err, res) => {
                    res.body.listings.length.should.equal(6);
                    done();
                });

    	});

    	it('should return only johns tattoos', (done) => {
    		
    		chai.request(server)
                .get('/api/listings?search=onny')
                .end((err, res) => {
                    res.body.listings.length.should.equal(1);
                    res.body.listings[0].business_name.should.equal('Jonnys Tattoos');
                    done();
                });

    	});

    	it('should return only jennysflowers', (done) => {
    		
    		chai.request(server)
                .get('/api/listings?search=flow')
                .end((err, res) => {
                    res.body.listings.length.should.equal(1);
                    res.body.listings[0].business_name.should.equal('Jennys Flowers');
                    done();
                });

    	});

    	it('should return pagination html', (done) => {
    		
    		chai.request(server)
                .get('/api/listings')
                .end((err, res) => {
                    expect(res.body.pagination).to.exist;
                    done();
                });

    	});

    });

    // GET /:id 

    describe('GET /:id', () => {

    	it('should return johnsTattoos', (done) => {
    		
    		chai.request(server)
                .get('/api/listings/' + listings.johnsTattoos._id)
                .end((err, res) => {
                    res.body.listing.business_name.should.equal('Jonnys Tattoos');
                    done();
                });

    	});

    	it('should return 404 not found', (done) => {
    		
    		chai.request(server)
                .get('/api/listings/8978978979')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });

    	});

    });

    // GET /industry/:industry

    describe('GET /industry/:industry', () => {

    	it('should return jennysflowers', (done) => {
    		
    		chai.request(server)
                .get('/api/listings/industry/florists')
                .end((err, res) => {
                    res.body.listings[0].business_name.should.equal('Jennys Flowers');
                    done();
                });

    	});

    	it('should return jennysflowers', (done) => {
    		
    		chai.request(server)
                .get('/api/listings/industry/flori')
                .end((err, res) => {
                	// console.log('res ', res.body);
                	res.body.correction.should.equal('Did you mean florists?');
                    res.body.listings[0].business_name.should.equal('Jennys Flowers');
                    done();
                });

    	});

    	it('should return 404 not found', (done) => {
    		
    		chai.request(server)
                .get('/api/listings/industry/thisisnotanindustry')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });

    	});

    });

    // GET /town/:town

    describe('GET /town/:town', () => {

    	it('should return johnsTattoos', (done) => {
    		
    		chai.request(server)
                .get('/api/listings/town/Bournemouth')
                .end((err, res) => {
                    res.body.listings.length.should.equal(4);
                    done();
                });

    	});

    	it('should return jonnystattoos and bobsBakers', (done) => {
    		
    		chai.request(server)
                .get('/api/listings/town/Bournemou')
                .end((err, res) => {
                	res.body.correction.should.equal('Did you mean Bournemouth?');
                    res.body.listings.length.should.equal(4);
                    done();
                });

    	});

    	it('should return 404 not found', (done) => {
    		
    		chai.request(server)
                .get('/api/listings/town/thisisnotatown')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });

    	});

    });

    // GET /find/:industry/:town

    describe('GET /find/:industry/:town', () => {

        it('should return listings in or near the town searched for', (done) => {

            chai.request(server)
                .get('/api/listings/find/tattooing/Bournemouth')
                .end((err, res) => {
                    res.body.listings.length.should.equal(1);
                    res.body.listings[0].business_name.should.equal('Jonnys Tattoos');
                    done();
                });

        });

        it('should return listings in or near the suburb searched for', (done) => {

            chai.request(server)
                .get('/api/listings/find/bakers/Southbourne, Bournemouth')
                .end((err, res) => {
                    res.body.listings.length.should.equal(2);
                    res.body.listings[0].business_name.should.equal('Wildflour Bakery');
                    done();
                });

        });

        it('should return listings within 5 miles of the postcode searched for', (done) => {

            chai.request(server)
                .get('/api/listings/find/bakers/BH6 3SU')
                .end((err, res) => {
                    res.body.listings.length.should.equal(2);
                    res.body.listings[0].business_name.should.equal('Wildflour Bakery'); // Wildflour Bakery
                    done();
                });

        });

        it('should return 404 as nothing was found and nothing could be suggested', (done) => {

            chai.request(server)
                .get('/api/listings/find/knlkksj/Bournemouth')
                .end((err, res) => {
                    res.body.listings.length.should.equal(0);
                    res.body.message.should.equal('Sorry, could not find any listings for knlkksj in Bournemouth');
                    done();
                });

        });

        it('should return correct listings for industry searched', (done) => {

            chai.request(server)
                .get('/api/listings/find/florists/Poole')
                .end((err, res) => {
                    res.body.listings.length.should.equal(1);
                    res.body.listings[0].business_name.should.equal('Jennys Flowers');
                    done();
                });

        });

        it('should return correct listings for service searched', (done) => {

            chai.request(server)
                .get('/api/listings/find/weddings/Poole')
                .end((err, res) => {
                    res.body.listings.length.should.equal(2);
                    res.body.listings[0].business_name.should.equal('Jennys Flowers');
                    done();
                });
            
        });

        it('should return correct listings for problem searched', (done) => {

            chai.request(server)
                .get('/api/listings/find/get drunk/Bournemouth')
                .end((err, res) => {
                    res.body.listings.length.should.equal(1);
                    res.body.listings[0].business_name.should.equal('Bruces Bar');
                    done();
                });
            
        });

        it('should return correct listings for term searched in details', (done) => {

            chai.request(server)
                .get('/api/listings/find/beer garden/Bournemouth')
                .end((err, res) => {
                    res.body.listings.length.should.equal(1);
                    res.body.listings[0].business_name.should.equal('Bruces Bar');
                    done();
                });
            
        });

        it('should return message with a suggestion for similar search term and return results for that term', (done) => {

            chai.request(server)
                .get('/api/listings/find/bakrs/Bournemouth')
                .end((err, res) => {
                    res.body.listings.length.should.equal(2);
                    res.body.correction.should.equal('bakers');
                    done();
                });

        });

    });

    // POST /add
    		// need to login - either subscriber or admin can add, need to claim ownership if subscriber
    		// if subscriber then update user

    describe('POST /add', () => {

    	var industryObj = {
	        business_name: 'Frankys Hotel',
	        address: {
	        	line_one: '55 Hmmm Street',
	        	line_two: 'Yearington',
	        	town: 'Bournemouth',
	        	post_code: 'ABC 898'
	        },
	        contact: {
	        	website: 'www.frankyshotel.com',
	        	phone: '09090909',
	        	email: 'frank@hotel.com'
	        },
	        industry: 'hotels'
    	};

    	beforeEach((done) => {

    		users.franky.update({listing: null})
    			.then(() => {
    				Listing.remove({business_name: 'Frankys Hotel'}, function(err){
		    			done();
		    		});
    			});

    	});

    	// not logged in so... 401

    	it('should return 401 as no one is logged in', (done) => {

    		chai.request(server)
                .post('/api/listings/add')
                .send(industryObj)
                .end((err, res) => {
                	res.body.error.should.equal('unauthenticated');
                    res.should.have.status(401);
                    done();
                });

    	});

    	// logged in as subcriber so add and a user

    	it('should add listing and franky should own listing', (done) => {

    		logIn('frank@franky.com', 'abc', function(agent){

    			agent.post('/api/listings/add')
    				.send(industryObj)
                    .end(function (err, res) {
                    	User.findById(users.franky._id).populate('listing').exec(function(err, uFranky){
                    		uFranky.listing.business_name.should.equal('Frankys Hotel');
                    		done();
                    	});
                    });

        	});

    	});

    	// subcriber you allready own a listing

    	it('should not add listing as user allready owns listing', (done) => {

    		logIn('jon@jonny.com', '123', function(agent){

    			agent.post('/api/listings/add')
    				.send(industryObj)
                    .end(function (err, res) {
                        res.should.have.status(409);
                        res.body.error.should.equal('You allready own a listing');
                    	done();

                    });

        	});

    	});

    	// logged in as admin but no user sent

    	it('should add listing and franky should not own listing', (done) => {

    		logIn('george@georgy.com', '456', function(agent){

    			agent.post('/api/listings/add')
    				.send(industryObj)
                    .end(function (err, res) {
                    	Listing.findOne({business_name: 'Frankys Hotel'}, function(err, listing){
                            listing.industry.should.equal('hotels');
                    		done();
                    	});

                    });

        	});

    	});

    	// admin, assign to another user

    	it('should add listing and franky should own listing', (done) => {

    		logIn('george@georgy.com', '456', function(agent){

    			industryObj.userId = users.franky._id;

    			agent.post('/api/listings/add')
    				.send(industryObj)
                    .end(function (err, res) {
                    	User.findById(users.franky._id).populate('listing').exec(function(err, uFranky){
                    		uFranky.listing.business_name.should.equal('Frankys Hotel');
                    		done();
                    	});

                    });

        	});

    	});

    });

    // POST /update

    describe('POST /update', () => {

        beforeEach((done) => {

            listings.johnsTattoos.update({
                    business_name: 'Jonnys Tattoos',
                    address: {
                        line_one: '134 Yeah Street',
                        line_two: 'Yearington',
                        town: 'Bournemouth',
                        post_code: 'ABC 123'
                    },
                    contact: {
                        website: 'www.jonnystattoos.com',
                        phone: '09090909',
                        email: 'jon@tattoos.com'
                    },
                    industry: 'tattooing'
                })
                .then(() => {

                    done();

                });

        });

    	// var updateObj = {
     //        business_name: 'Jonnys Tattoos',
     //        address: {
     //            line_one: '134 Yeah Street',
     //            line_two: 'Yearington',
     //            town: 'Bournemouth',
     //            post_code: 'ABC 123'
     //        },
     //        contact: {
     //            website: 'www.jonnystattoos.com',
     //            phone: '09090909',
     //            email: 'jon@tattoos.com'
     //        },
     //        industry: 'tattooing'
    	// };

    	// not logged in so... 401

    	it('should return 401 as no one is logged in', (done) => {

    		chai.request(server)
                .post('/api/listings/update')
                .send({
                    listingid: listings.johnsTattoos._id,
                    address: {
                        line_two: 'Somewhere Else'
                    },
                    industry: 'body art'
                })
                .end((err, res) => {
                	res.body.error.should.equal('unauthenticated');
                    res.should.have.status(401);
                    done();
                });

    	});

        it('should return 400 as no listing id was given', (done) => {

            logIn('george@georgy.com', '456', function(agent){

                agent.post('/api/listings/update')
                    .send({
                        address: {
                            line_two: 'Somewhere Else'
                        },
                        industry: 'body art'
                    })
                    .end(function (err, res) {
                        
                        res.should.have.status(400);
                        done();

                    });

            });

        });

        it('should return 400 as no listingid is not an id was not found', (done) => {

            logIn('george@georgy.com', '456', function(agent){

                agent.post('/api/listings/update')
                    .send({
                        listingid: '989088907',
                        address: {
                            line_two: 'Somewhere Else'
                        },
                        industry: 'body art'
                    })
                    .end(function (err, res) {
                        
                        res.should.have.status(400);
                        done();

                    });

            });

        });

    	// logged in as subcriber and owns listing so update

        it('should update address line_two and industry, business_name should be the same', (done) => {

            logIn('jon@jonny.com', '123', function(agent){

                agent.post('/api/listings/update')
                    .send({
                        listingid: listings.johnsTattoos._id,
                        address: {
                            line_one: '134 Yeah Street',
                            line_two: 'Somewhere Else'
                        },
                        industry: 'body art'
                    })
                    .end(function (err, res) {

                        Listing.findById(listings.johnsTattoos._id, function(err, jTattoos){
                            jTattoos.address.line_two.should.equal('Somewhere Else');
                            jTattoos.address.line_one.should.equal('134 Yeah Street');
                            jTattoos.business_name.should.equal('Jonnys Tattoos');
                            done();
                        });

                    });

            });

        });        

    	// logged in as subscriber not own listing so 403

        it('should return 403 as listing is not owned by the subscriber', (done) => {

            logIn('jon@jonny.com', '123', function(agent){

                agent.post('/api/listings/update')
                    .send({
                        listingid: listings.bobsBakers._id,
                        address: {
                            line_two: 'Somewhere Else'
                        },
                        industry: 'other things'
                    })
                    .end(function (err, res) {
                        
                        res.should.have.status(403);
                        done();

                    });

            });

        });

    	// logged in as editor cant update listings

        it('should return 403 as editors cant update listings', (done) => {

            logIn('sal@sally.com', '890', function(agent){

                agent.post('/api/listings/update')
                    .send({
                        listingid: listings.bobsBakers._id,
                        address: {
                            line_two: 'Somewhere Else'
                        },
                        industry: 'other things'
                    })
                    .end(function (err, res) {
                        
                        res.should.have.status(403);
                        done();

                    });

            });

        });

    	// logged in as admin not own listing but can update

        it('should update despite not own listing', (done) => {

            logIn('george@georgy.com', '456', function(agent){

                agent.post('/api/listings/update')
                    .send({
                        listingid: listings.johnsTattoos._id,
                        address: {
                            line_two: 'Somewhere Else'
                        },
                        industry: 'other things'
                    })
                    .end(function (err, res) {
                        
                        res.should.have.status(200);
                        Listing.findById(listings.johnsTattoos._id, function(err, jTattoos){
                            jTattoos.industry.should.equal('other things');
                            done();
                        });

                    });

            });

        });

    });

    describe('POST /assign_owner', () => {

    	var bruce, obj;

    	beforeEach((done) => {
    		User.remove({email: 'bruce@brucy.com'})
    			.then(() => {

    				bruce = new User({
    					name: 'Bruce',
		                email: 'bruce@brucy.com',
		                password: 'abc',
		                user_role: 'Subscriber',
		                meta: {
		                  age: 22,
		                  website: 'www.brucy.com'
		                }
    				});

                    bruce.save().then(() => {

    					listings.brucesBar.update({userId: null})
    						.then(() => {
    							obj = {
					    			userId: bruce._id,
						    		listingid: listings.brucesBar._id
						    	};
		    					done();	
    						});

    				});

    			});
    	});

    	// not logged in so... 401

    	it('should return 401 as no one is logged in', (done) => {

    		chai.request(server)
                .post('/api/listings/assign_owner')
                .send(obj)
                .end((err, res) => {
                	res.body.error.should.equal('unauthenticated');
                    res.should.have.status(401);
                    done();
                });

    	});

    	// logged in as subcriber and listing is unowned so 200

        it('should return 200 and bruce should own brucesbar', (done) => {

            // brucesBar

            logIn('bruce@brucy.com', 'abc', function(agent){

                agent.post('/api/listings/assign_owner')
                    .send({ listingid: listings.brucesBar._id })
                    .end(function (err, res) {
                        
                        res.should.have.status(200);
                        User.findById(bruce._id).populate('listing').exec(function(err, bruce){
                            bruce.listing.business_name.should.equal('Bruces Bar');

                            Listing.findById(bruce.listing._id).populate('userId').exec(function(err, listing){

                                (listing.userId._id.equals(bruce._id)).should.be.true;
                                done();

                            });

                        });

                    });

            });

        });

    	// logged in as subscriber but allready owns listing so dont assign

        it('should return 409 and error of user allready owns a listing', (done) => {

            logIn('jon@jonny.com', '123', function(agent){

                agent.post('/api/listings/assign_owner')
                    .send(obj)
                    .end(function (err, res) {
                        
                        res.should.have.status(409);
                        res.body.error.should.equal('You allready own a listing');
                        done();

                    });

            });

        });

    	// logged in but listing is owned so 403 someone owns this allready

        it('should return 403 as listing is owned by bob', (done) => {

            logIn('bruce@brucy.com', 'abc', function(agent){

                agent.post('/api/listings/assign_owner')
                    .send({ listingid: listings.bobsBakers._id })
                    .end(function (err, res) {
                        
                        res.should.have.status(403);
                        res.body.error.should.equal('Another user owns this listing');
                        done();

                    });

            });

        });

    	// logged in as admin so can reassign user

        it('admin can reassign user of any listing', (done) => {

            logIn('george@georgy.com', '456', function(agent){

                agent.post('/api/listings/assign_owner')
                    .send(obj)
                    .end(function (err, res) {
                        
                        User.findById(bruce._id).populate('listing').exec(function(err, brucey){

                            brucey.listing.business_name.should.equal('Bruces Bar');

                            Listing.findById(brucey.listing._id).populate('userId').exec(function(err, listing){
                                (listing.userId._id.equals(bruce._id)).should.be.true;
                                done();
                            });

                        });

                    });

            });

        });

    });

    // DELETE /:id

    describe('DELETE /:id', () => {

    	// not logged in so... 401

    	it('should return 401 as no one is logged in', (done) => {

    		chai.request(server)
                .delete('/api/listings/' + users.franky._id)
                .end((err, res) => {
                	res.body.error.should.equal('unauthenticated');
                    res.should.have.status(401);
                    done();
                });

    	});

    	// logged in as subcriber so 403

    	it('should return 403 as subscriber', (done) => {

    		logIn('bob@bobert.com', 'abc', function(agent){

    			agent.delete('/api/listings/' + listings.bobsBakers._id)
                    .end(function (err, res) {
                        
                    	res.should.have.status(403);
                    	done();

                    });

    		});

    	});

    	// logged in as editor cant delete listings

    	it('should return 403 as subscriber', (done) => {

    		logIn('sal@sally.com', '890', function(agent){

    			agent.delete('/api/listings/' + listings.bobsBakers._id)
                    .end(function (err, res) {
                        
                    	res.should.have.status(403);
                    	done();

                    });

    		});

    	});

    	// logged in as admin can delete

    	it('should return 200 as admin', (done) => {

    		logIn('george@georgy.com', '456', function(agent){

    			agent.delete('/api/listings/' + listings.bobsBakers._id)
                    .end(function (err, res) {
                        
                    	res.should.have.status(200);

                    	Listing.findById(listings.bobsBakers._id, function(err, listing){
                    		expect(listing).to.not.exist;
                    		done();
                    	});

                    });

    		});

    	});

    	// return 404 listing not found

    	it('should return 500', (done) => {

    		logIn('george@georgy.com', '456', function(agent){

    			agent.delete('/api/listings/897897898789')
                    .end(function (err, res) {
                    	res.should.have.status(500);
                    	done();

                    });

    		});

    	});

    });

});