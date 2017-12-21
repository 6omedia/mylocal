process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../models/user');
let Role = require('../../models/role');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();
let expect = chai.expect();

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

describe('main routes', () => {

    // before these tests, delete all users, and create one user

    before(function(done){

        User.remove({}, function(err){
            User.registerUser({
                name: 'Bill',
                email: 'bill@billy.com',
                password: '123',
                confirm_password: '123',
                user_role: 'Subscriber',
                meta: {
                  age: 22,
                  website: 'www.billy.com'
                }
            }, function(err, user){

                if(!err){

                    User.registerUser({
                        name: 'Franky',
                        email: 'frank@franky.com',
                        password: 'abc',
                        confirm_password: 'abc',
                        user_role: 'Subscriber',
                        meta: {
                          age: 22,
                          website: 'www.franky.com'
                        }
                    }, function(err, user){

                        if(!err){

                            User.registerUser({
                                name: 'George',
                                email: 'george@georgy.com',
                                password: '456',
                                confirm_password: '456',
                                user_role: 'Admin',
                                meta: {
                                  age: 22,
                                  website: 'www.george.com'
                                }
                            }, function(err, user){

                                if(!err){
                                    done();
                                }
                            
                            });
                            
                        }
                    
                    });

                }
            
            });

        });

    });

    describe('/GET home', () => {

        it('should render the home page', (done) => {

            chai.request(server)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.not.redirect;
                    done();
                }); 

        });

    });

    describe('/GET login', () => {

        it('user logged in so it should redirect to profile page or admin', (done) => {

            logBillyIn(function(agent){

                agent.get('/login')
                    .end(function (err, res) {
                        res.should.redirect;
                        done();
                    });

            });

        });

        it('it should render the home page with info about bastion and a login/regester box', (done) => {
            
            chai.request(server)
                .get('/login')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.not.redirect;
                    done();
                });  
            
        });

    });

    describe('/POST login', () => {

        // correct login

        var email = 'bill@billy.com';
        var password = '123';
        var wrongEmail = 'bill@ly.com';
        var wrongPassword = '1432';

        it('should find the user and identify the correct password, then redirect to /profile', (done) => {
            chai.request(server)
            .post('/login').send({email: email, password: password})
            .end((err, res) => {
                // res.body.should.not.have.property('error');
                res.should.redirect;
                done();
            });
        });

        // incorrect email

        it('should not login user as email is incorrect', (done) => {
            chai.request(server)
            .post('/login').send({email: wrongEmail, password: password})
            .end((err, res) => {
                res.should.have.status(401);
                res.should.not.redirect;
                done();
            });
        });

        // incorrect password

        it('should not login user as password is incorrect', (done) => {
            chai.request(server)
            .post('/login').send({email: email, password: wrongPassword})
            .end((err, res) => {
                res.should.have.status(401);
                res.should.not.redirect;
                done();
            });
        });

        it('should return error', (done) => {
            chai.request(server)
            .post('/login').send('dsvdsvvdsvsd')
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

    });

    describe('/GET profile', () => {

        // if logged in

        it('it should render the profile page, with correct user from session', (done) => {

            logBillyIn(function(agent){

                agent.get('/profile')
                    .end(function (err, res) {
                        res.should.have.status(200);
                        res.should.not.redirect;
                        done();
                    });

            });

        });

        // if not logged in

        it('it should redirect to the home page', (done) => {
            chai.request(server)
            .get('/profile')
            .end((err, res) => {
                res.should.not.have.cookie;
                res.should.redirect;
                done();
            });
        });

    });

    describe('/GET register', () => {

        // if logged in
        it('should redirect to profile page', (done) => {

            logBillyIn(function(agent){

                agent.get('/register')
                    .end(function (err, res) {
                        res.should.redirect;
                        done();
                    });

            });

        });

        it('should render register page', (done) => {
            chai.request(server)
            .get('/register')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.not.redirect;
                done();
            });
        });

    });

    describe('/POST register', () => {

        it('should add a user to the database', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: 'jon@jonny.com',
                password: '123',
                confirm_password: '123'
            })
            .end((err, res) => {
                res.should.redirect;
                done();
            });
        });

        it('should respond with an error of email address already exists', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: 'bill@billy.com',
                password: '123',
                confirm_password: '123'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.should.not.redirect;
                done();
            });
        });

        it('should respond with an error that name is required', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: '',
                email: 'vfds@vfdcv.com',
                password: '123',
                confirm_password: '123'
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should respond with an error that email is required', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: '',
                password: '123',
                confirm_password: '123'
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should respond with an error that password is required', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: 'dfcdsfds@vfdvfd.com',
                password: '',
                confirm_password: 'abc'
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should respond with an error that password confirm password doesnot match password', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: 'dfcdsfds@vfdvfd.com',
                password: '123',
                confirm_password: 'abc'
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

    });

});