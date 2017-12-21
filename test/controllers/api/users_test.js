process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
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

describe('User API Routes', () => {

    before(function(done){

        User.remove({}, function(err){

            franky = new User({
                name: 'Franky',
                email: 'frank@franky.com',
                password: 'abc',
                user_role: 'Subscriber',
                meta: {
                  age: 22,
                  website: 'www.franky.com'
                }
            })

            billy = new User({
                name: 'Bill',
                email: 'bill@billy.com',
                password: '123',
                confirm_password: '123',
                user_role: 'Subscriber',
                meta: {
                  age: 22,
                  website: 'www.billy.com'
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

            Promise.all([franky.save(), billy.save(), sally.save(), george.save()])
                .then(() => {
                    done();
                });

            // User.registerUser({
            //     name: 'Bill',
            //     email: 'bill@billy.com',
            //     password: '123',
            //     confirm_password: '123',
            //     user_role: 'Subscriber',
            //     meta: {
            //       age: 22,
            //       website: 'www.billy.com'
            //     }
            // }, function(err, user){

            //     if(!err){

            //         User.registerUser({
            //             name: 'Franky',
            //             email: 'frank@franky.com',
            //             password: 'abc',
            //             confirm_password: 'abc',
            //             user_role: 'Subscriber',
            //             meta: {
            //               age: 22,
            //               website: 'www.franky.com'
            //             }
            //         }, function(err, user){

            //             if(!err){

            //                 User.registerUser({
            //                     name: 'George',
            //                     email: 'george@georgy.com',
            //                     password: '456',
            //                     confirm_password: '456',
            //                     user_role: 'Admin',
            //                     meta: {
            //                       age: 22,
            //                       website: 'www.george.com'
            //                     }
            //                 }, function(err, user){

            //                     if(!err){
            //                         done();
            //                     }
                            
            //                 });
                            
            //             }
                    
            //         });

            //     }
            
            // });

        });

    });

    describe('GET /', () => {

        // ?role=admin

        it('should return 401 as noone is logged in', (done) => {

            chai.request(server)
                .get('/api/users')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

        });

        // subscriber

        it('should return 403 as subsribers cant view other users', (done) => {

            logBillyIn(function(agent){

                agent.get('/api/users')
                    .end(function (err, res) {
                        res.should.have.status(403);
                        done();
                    });

            });

        });

        // editor

        it('should return 200', (done) => {

            logSallyEditorIn(function(agent){

                agent.get('/api/users')
                    .end(function (err, res) {
                        res.should.have.status(200);
                        done();
                    });

            });

        });

        // admin

        it('should return 3 users', (done) => {

        });

        // return only subscribers

        it('should return 2 users', (done) => {

        });

        // return only admin

        it('should return 1 users', (done) => {

        });

    });

    describe('GET /user/:userId', () => {

    });

    describe('POST /add', () => {



    });

    describe('/POST /edit', () => {

        it('should update users name', (done) => {

            logBillyIn(function(agent){

                User.findOne({'email': 'bill@billy.com'}, function(err, billy){

                    var updatedUser = {
                        userId: billy._id,
                        name: 'james',
                        email: 'bill@billy.com',
                        meta: {
                            age: 24,
                            website: 'www.billy.com'
                        } 
                    };

                    setTimeout(function(){
                        
                        agent
                        .post('/api/users/edit')
                        .send(updatedUser)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.should.not.have.property('error');
                            res.body.success.should.equal('1');
                            res.body.updatedUser.name.should.equal('james');
                            res.body.updatedUser.updated_at.should.not.equal('');
                            res.body.updatedUser.updated_at.should.not.equal(res.body.updatedUser.created_at);
                            done();
                        });

                    }, 2000);

                });

            });

        });

        it('should update users name as logged in user is admin', (done) => {

            logGeorgeAdminIn(function(agent){

                User.findOne({'email': 'bill@billy.com'}, function(err, billy){

                    var updatedUser = {
                        userId: billy._id,
                        name: 'jimmy',
                        email: 'bill@billy.com',
                        meta: {
                            age: 24,
                            website: 'www.billy.com'
                        } 
                    };

                    setTimeout(function(){
                        
                        agent
                        .post('/api/users/edit')
                        .send(updatedUser)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.should.not.have.property('error');
                            res.body.success.should.equal('1');
                            res.body.updatedUser.name.should.equal('jimmy');
                            res.body.updatedUser.updated_at.should.not.equal('');
                            res.body.updatedUser.updated_at.should.not.equal(res.body.updatedUser.created_at);
                            done();
                        });

                    }, 2000);

                });

            });

        });

        it('should return error of user not found', (done) => {

            logBillyIn(function(agent){

                var updatedUser = {
                    userId: 'fgdbgfb',
                    name: 'james',
                    email: 'bill@bigglly.com',
                    meta: {
                        age: 24,
                        website: 'www.billy.com'
                    } 
                };
                    
                agent
                .post('/api/users/edit')
                .send(updatedUser)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.error.should.equal('unauthorized');
                    res.body.should.not.have.property('updatedUser');
                    done();
                });

            });

        });

        it('should return error of invalid data', (done) => {

            logBillyIn(function(agent){

                var updatedUser = {};
                    
                agent
                .post('/api/users/edit')
                .send(updatedUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.error.should.equal('Invalid Data');
                    res.body.should.not.have.property('updatedUser');
                    done();
                });

            });

        });

        it('should return error of unauthorised as the update is for another user', (done) => {

            logBillyIn(function(agent){

                User.findOne({'email': 'frank@franky.com'}, function(err, franky){

                    var updatedUser = {
                        userId: franky._id,
                        name: 'frank',
                        email: 'frank@franky.com',
                        meta: {
                            age: 24,
                            website: 'www.billy.com'
                        } 
                    };
                        
                    agent
                    .post('/api/users/edit')
                    .send(updatedUser)
                    .end((err, res) => {
                        res.should.have.status(403);
                        res.body.error.should.equal('unauthorized');
                        res.body.should.not.have.property('updatedUser');
                        done();
                    });

                });

            });

        });

        it('should return error of unauthorised as not logged in', (done) => {

            User.findOne({'email': 'bill@billy.com'}, function(err, billy){

                    var updatedUser = {
                        userId: billy._id,
                        name: 'james',
                        email: 'bill@billy.com',
                        meta: {
                            age: 24,
                            website: 'www.billy.com'
                        } 
                    };

                    chai.request(server)
                        .post('/api/users/edit')
                        .send(updatedUser)
                        .end((err, res) => {
                            res.should.have.status(401);
                            res.body.error.should.equal('unauthenticated');
                            done();
                        });

            });

        });

    });

    describe('/DELETE /:userId', () => {

        it('should return unauthenticated as user is not logged in', (done) => {

            User.findOne({'email': 'frank@franky.com'}, function(err, jon){

                chai.request(server)
                    .delete('/api/users/' + jon._id)
                    .end((err, res) => {
                        res.body.should.have.property('error');
                        res.body.error.should.equal('unauthenticated');
                        res.should.have.status(401);
                        done();
                    });

            });

        });

        it('should return unauthorised as user is not admin and cant delete others profiles', (done) => {
            
            logBillyIn(function(agent){

                User.findOne({'email': 'frank@franky.com'}, function(err, frank){

                    agent.delete('/api/users/' + frank._id)
                        .end((err, res) => {
                            res.body.should.have.property('error');
                            res.body.error.should.equal('unauthorized');
                            res.should.have.status(403);
                            done();
                        });

                });

            });

        });    

        it('should delete user as user is logged in and admin', (done) => {
            
            logGeorgeAdminIn(function(agent){

                User.findOne({'email': 'frank@franky.com'}, function(err, frank){

                    // console.log('is it frank? ', frank);

                    agent.delete('/api/users/' + frank._id)
                        .end((err, res) => {
                            res.body.should.not.have.property('error');
                            res.should.have.status(200);

                            User.findOne({'email': 'frank@franky.com'}, function(err, frank){
                                should.not.exist(frank);
                                done();
                            });

                        });

                });

            });

        });

        it('should return error user does not exist', (done) => {
            
            logGeorgeAdminIn(function(agent){

                agent.delete('/api/users/8978978978978979')
                        .end((err, res) => {
                            res.body.should.have.property('error');
                            res.body.error.should.equal('User ID does not exist');
                            res.should.have.status(400);
                            done();
                        });

            });

        });

        it('should delete user as user is logged in and are themselves', (done) => {
            
            logBillyIn(function(agent){

                User.findOne({'email': 'bill@billy.com'}, function(err, bill){

                    agent.delete('/api/users/' + bill._id)
                        .end((err, res) => {
                            res.body.should.not.have.property('error');
                            res.should.have.status(200);

                            User.findOne({'email': 'bill@billy.com'}, function(err, bill){
                                should.not.exist(bill);
                                done();
                            });
                        });

                });

            });

        });

    });

});