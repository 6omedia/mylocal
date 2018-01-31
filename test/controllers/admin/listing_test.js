process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Listing = require('../../../models/listing');
let Industry = require('../../../models/industry');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;

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

var franky, bob, jonny, jenny, sally, george, superadmin;
var johnsTattoos, jensFlowers, bobsBakers, brucesBar;

describe('Listing Admin Routes', () => {

	beforeEach(function(done){

	 	Promise.all([Industry.remove({}), Listing.remove({}), User.remove({})])
 		.then(() => {

 			bob = new User({
                name: 'Bobby',
                email: 'bob@bobert.com',
                password: 'abc',
                user_role: 'Subscriber',
                meta: {
                  age: 22,
                  website: 'www.bobby.com'
                }
            });

            franky = new User({
                name: 'Franky',
                email: 'frank@franky.com',
                password: 'abc',
                user_role: 'Subscriber',
                meta: {
                  age: 22,
                  website: 'www.franky.com'
                }
            });

            jonny = new User({
                name: 'John',
                email: 'jon@jonny.com',
                password: '123',
                confirm_password: '123',
                user_role: 'Subscriber',
                meta: {
                  age: 22,
                  website: 'www.john.com'
                }
            });

            jenny = new User({
                name: 'Jenny',
                email: 'jen@jenny.com',
                password: '123',
                confirm_password: '123',
                user_role: 'Subscriber',
                meta: {
                  age: 22,
                  website: 'www.john.com'
                }
            });

            sally = new User({
                name: 'Sally',
                email: 'sal@sally.com',
                password: '890',
                user_role: 'Editor',
                meta: {
                  age: 22,
                  website: 'www.sally.com'
                }
            });

            george = new User({
                name: 'Bill',
                email: 'george@georgy.com',
                password: '456',
                user_role: 'Admin',
                meta: {
                  age: 22,
                  website: 'www.george.com'
                }
            });

            superadmin = new User({
                name: 'Super',
                email: 'super@admin.com',
                password: '000',
                user_role: 'Super Admin',
                meta: {
                  age: 22,
                  website: 'www.superadmin.com'
                }
            });

			Promise.all([franky.save(), bob.save(), jonny.save(), jenny.save(), sally.save(), george.save(), superadmin.save()])
                .then(() => {

                	johnsTattoos = new Listing({
                		userId: jonny._id,
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
                	});

                	jensFlowers = new Listing({
                		userId: jonny._id,
				        business_name: 'Jennys Flowers',
				        address: {
				        	line_one: '45 Hmmm Road',
				        	line_two: 'Hmmmington',
				        	town: 'Poole',
				        	post_code: 'DFG 885'
				        },
				        contact: {
				        	website: 'www.jennysflowers.com',
				        	phone: '67867868',
				        	email: 'jen@flowers.com'
				        },
				        industry: 'florists'
                	});

                	bobsBakers = new Listing({
                		userId: bob._id,
				        business_name: 'Bobs Bakers',
				        address: {
				        	line_one: '67 Hmmm Road',
				        	line_two: 'Hmmklington',
				        	town: 'Bournemouth',
				        	post_code: 'DFG 990'
				        },
				        contact: {
				        	website: 'www.jennysflowers.com',
				        	phone: '546456',
				        	email: 'bob@bakers.com'
				        },
				        industry: 'bakers'
                	});

                	brucesBar = new Listing({
                		business_name: 'Bruces Bar',
				        address: {
				        	line_one: '67 Hmmm Road',
				        	line_two: 'Hmmklington',
				        	town: 'Bournemouth',
				        	post_code: 'DFG 990'
				        },
				        contact: {
				        	website: 'www.bruces.com',
				        	phone: '546456',
				        	email: 'bruce@bar.com'
				        },
				        industry: 'bars'
                	});

                	Promise.all([johnsTattoos.save(), jensFlowers.save(), bobsBakers.save(), brucesBar.save()])
                		.then(() => {

                			jonny.update({listing: johnsTattoos._id})
                				.then(() => {
                					jenny.update({listing: jensFlowers._id})
		                				.then(() => {
		                					bob.update({listing: bobsBakers._id})
		                						.then(() => {
		                							done();
		                						});

		                				});
                				});

                		});

                });

 		});

    });

	describe('GET /admin/listings/', () => {

		// no one logged in so redirect to /login

		it('should redirect to login', (done) => {

			chai.request(server)
	            .get('/admin/listings')
	            .end((err, res) => {
	            	// res.should.have.status(401);
	            	res.should.redirect;
	                done();
	            });

		});

		// subscriber so redirect to /login

		it('should redirect to login', (done) => {

			logIn('jon@jonny.com', '123', function(agent){

				agent.get('/admin/listings')
                    .end(function (err, res) {
                    	
                    	// res.should.have.status(403);
                    	res.should.redirect;
                    	done();

                    });

			});

		});

		// editor so 200

		it('should not redirect and return 200', (done) => {

			logIn('sal@sally.com', '890', function(agent){

				agent.get('/admin/listings')
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

		// admin so 200

		it('should not redirect and return 200', (done) => {

			logIn('george@georgy.com', '456', function(agent){

				agent.get('/admin/listings')
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

		// superadmin so 200

		it('should not redirect and return 200', (done) => {

			logIn('super@admin.com', '000', function(agent){

				agent.get('/admin/listings')
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

	});

	describe('GET /admin/listings/add', () => {

		// no one logged in so redirect to /login

		it('should redirect to login', (done) => {

			chai.request(server)
	            .get('/admin/listings/add')
	            .end((err, res) => {
	            	// res.should.have.status(401);
	            	res.should.redirect;
	                done();
	            });

		});

		// subscriber so redirect to /login

		it('should redirect to login', (done) => {

			logIn('jon@jonny.com', '123', function(agent){

				agent.get('/admin/listings/add')
                    .end(function (err, res) {
                    	
                    	// res.should.have.status(403);
                    	res.should.redirect;
                    	done();

                    });

			});

		});

		// editor so 200

		it('should redirect to /admin/listings', (done) => {

			logIn('sal@sally.com', '890', function(agent){

				agent.get('/admin/listings/add')
                    .end(function (err, res) {
                    	
                    	res.should.redirect;
                    	done();

                    });

			});

		});

		// admin so 200

		it('should not redirect and return 200', (done) => {

			logIn('george@georgy.com', '456', function(agent){

				agent.get('/admin/listings/add')
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

		// superadmin so 200

		it('should not redirect and return 200', (done) => {

			logIn('super@admin.com', '000', function(agent){

				agent.get('/admin/listings/add')
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

	});

	describe('GET /admin/listings/edit/:edit', () => {

		// no one logged in so redirect to /login

		it('should redirect to login', (done) => {

			chai.request(server)
	            .get('/admin/listings/edit/' + johnsTattoos._id)
	            .end((err, res) => {
	            	// res.should.have.status(401);
	            	res.should.redirect;
	                done();
	            });

		});

		// subscriber so redirect to /login

		it('should redirect to login', (done) => {

			logIn('jon@jonny.com', '123', function(agent){

				agent.get('/admin/listings/edit/' + johnsTattoos._id)
                    .end(function (err, res) {
                    	
                    	// res.should.have.status(403);
                    	res.should.redirect;
                    	done();

                    });

			});

		});

		// editor so 200

		it('should redirect to /admin/listings', (done) => {

			logIn('sal@sally.com', '890', function(agent){

				agent.get('/admin/listings/edit/' + johnsTattoos._id)
                    .end(function (err, res) {
                    	
                    	res.should.redirect;
                    	done();

                    });

			});

		});

		// admin so 200

		it('should not redirect and return 200', (done) => {

			logIn('george@georgy.com', '456', function(agent){

				agent.get('/admin/listings/edit/' + johnsTattoos._id)
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

		// superadmin so 200

		it('should not redirect and return 200', (done) => {

			logIn('super@admin.com', '000', function(agent){

				agent.get('/admin/listings/edit/' + johnsTattoos._id)
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

	});

	describe('GET /upload', () => {

		// no one logged in so redirect to /login

		it('should redirect to login', (done) => {

			chai.request(server)
	            .get('/admin/listings/upload')
	            .end((err, res) => {
	            	// res.should.have.status(401);
	            	res.should.redirect;
	                done();
	            });

		});

		// subscriber so redirect to /login

		it('should redirect to login', (done) => {

			logIn('jon@jonny.com', '123', function(agent){

				agent.get('/admin/listings/upload')
                    .end(function (err, res) {
                    	
                    	// res.should.have.status(403);
                    	res.should.redirect;
                    	done();

                    });

			});

		});

		// editor so redirect

		it('should redirect to /admin/listings', (done) => {

			logIn('sal@sally.com', '890', function(agent){

				agent.get('/admin/listings/upload')
                    .end(function (err, res) {
                    	
                    	res.should.redirect;
                    	done();

                    });

			});

		});

		// admin so 200

		it('should not redirect and return 200', (done) => {

			logIn('george@georgy.com', '456', function(agent){

				agent.get('/admin/listings/upload')
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

		// superadmin so 200

		it('should not redirect and return 200', (done) => {

			logIn('super@admin.com', '000', function(agent){

				agent.get('/admin/listings/upload')
                    .end(function (err, res) {
                    	
                    	res.should.have.status(200);
                    	res.should.not.redirect;
                    	done();

                    });

			});

		});

	})

});