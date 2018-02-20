process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();

chai.use(chaiHttp);

describe('Listing Model', () => {

	describe('findNearest', () => {

		it('should ', (done) => {

		});

	});

});