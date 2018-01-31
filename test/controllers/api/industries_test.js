process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Listing = require('../../../models/listing');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);

function logBillyIn(callback){

    agent
        .post('/login')
        .send({ email: 'bill@billy.com', password: '123', test: true})
        .end(function (err, res) {

            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

function logSallyEditorIn(callback){

    agent
        .post('/login')
        .send({ email: 'sal@sally.com', password: '890', test: true})
        .end(function (err, res) {

            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

function logGeorgeAdminIn(callback){

    agent
        .post('/login')
        .send({ email: 'george@georgy.com', password: '456', test: true, admin: true})
        .end(function (err, res) {

            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

var franky, billy, sally, george;

/**************** TESTS ******************/

describe('Industries API Routes', () => {



});