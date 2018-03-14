process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Listing = require('../../../models/listing');
let Industry = require('../../../models/industry');
let Postcode = require('../../../models/postcode');
let Town = require('../../../models/town');
let Term = require('../../../models/term');
let Suburb = require('../../../models/suburb');
let mockCollections = require('../../helpers.js').mockCollections;
let mockJson = [
	{ jsonArray: require('../../mockdata/postcodes.json'), Model: Postcode },
	{ jsonArray: require('../../mockdata/towns.json'), Model: Town },
	{ jsonArray: require('../../mockdata/suburbs.json'), Model: Suburb },
	{ jsonArray: require('../../mockdata/terms.json'), Model: Term }
];
const pn = require('sync-node').createQueue();

let each = require('async-each');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);

describe('Main API', () => {

	before((done) => {
		mockCollections(mockJson, () => { done(); });
	});

	describe('GET /api/locations/search', () => {

		let term;

		it('should return 200 and an array of locations even if no term is given', (done) => {
			chai.request(server).get('/api/locations/search')
            .end((err, res) => {
                res.body.should.have.property('locations');
                res.should.have.status(200);
                done();
            });
		});

		it('should only return towns, suburbs and/or postcodes that begin with the term', (done) => {

			term = 'so';

			chai.request(server).get('/api/locations/search?term=' + term)
            .end((err, res) => {
                res.body.locations.length.should.equal(3);
                res.body.locations.should.contains('Southampton');
                res.body.locations.should.contains('Southbourne, Bournemouth');
                res.body.locations.should.not.contains('Swindon');

                term = 'b';

            	chai.request(server).get('/api/locations/search?term=' + term)
            	.end((err, res) => {
            		res.body.locations.length.should.equal(10);
            		res.body.locations.should.not.contains('Westbourne, Bournemouth');
	                done();
            	});
            });

		});

		it('should search for postcodes if no towns or suburbs are found for term', (done) => {

			term = 'so1';

			chai.request(server).get('/api/locations/search?term=' + term)
            .end((err, res) => {
     			res.body.locations.should.not.contains('Southampton');
     			res.body.locations.should.contains('SO14 3TN');
                done();
            });

		});

		it('should return maximun of 10 results', (done) => {
			
			term = 'b';

			chai.request(server).get('/api/locations/search?term=' + term)
            .end((err, res) => {
     			res.body.locations.length.should.equal(10);
                done();
            });

		});

	});

	describe('GET /api/terms/search', () => {

		let term;

		it('should return 200 and an array of services even if no term is given', (done) => {
			chai.request(server).get('/api/terms/search')
            .end((err, res) => {
                res.body.should.have.property('terms');
                res.should.have.status(200);
                done();
            });
		});

		it('should only return services, industries or problem that begin with the term', (done) => {
			term = 'tr';

			chai.request(server).get('/api/terms/search?term=' + term)
            .end((err, res) => {
                res.body.terms.length.should.equal(3);
                res.body.terms.should.contains('Transportation'); // industry
                res.body.terms.should.contains('Training, Fitness'); // service
                res.body.terms.should.contains('Tripped fuse'); // problem
                res.body.terms.should.not.contains('Timmy'); // problem
				done();
            });
		});

		it('should return maximun of 10 results', (done) => {
			term = 'b';

			chai.request(server).get('/api/terms/search?term=' + term)
            .end((err, res) => {
     			res.body.terms.length.should.equal(10);
                done();
            });
		});

	});

});