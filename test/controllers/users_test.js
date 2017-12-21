process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();

chai.use(chaiHttp);

describe('user routes', () => {

	before(function(done){
        User.remove({}, function(err){
            User.create({
                name: 'Bill',
                email: 'bill@billy.com',
                password: '123',
                admin: false,
                meta: {
                  age: 22,
                  website: 'www.billy.com'
                }
            }, function(err, user){
                if(!err){

                	// login user

                    done();
                }else{
                    console.log('ERR: ', err);
                }
            });
        });
    });

	beforeEach(function(done){

		User.remove({'email': 'frank@franky.com'}, function(err){

			User.create({
				name: 'frank',
                email: 'frank@franky.com',
                password: '123',
                admin: false,
                meta: {
                  age: 31,
                  website: 'www.franky.com'
                }
			}, function(err){
				done();
			});

		});

	});

});