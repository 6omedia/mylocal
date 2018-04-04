const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

//book schema definition
let UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        user_role: {
            type: String,
            default: 'Subscriber'
        },
        listing: {
            type: Schema.Types.ObjectId,
            ref: 'Listing'
        },
        membership: {
            type: String,
            default: 'free'
        },
        meta: {
            age: Number,
            website: String
        },
        reviews: [{
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }],
        message_chains: [{
            type: Schema.Types.ObjectId,
            ref: 'MessageChain'
        }],
        created_at: Date,
        updated_at: Date  
    }
);

// Sets the createdAt parameter equal to the current time
UserSchema.pre('save', function(next){

    var now = new Date();
 
    if(this.isNew) {
        this.created_at = now;
    }

    var user = this;

    bcrypt.hash(user.password, 10, function(err, hash){
        if(err){
            return next(err);
        }
        user.password = hash;
        next();
    });

});

UserSchema.statics.registerUser = function(userObj, callback){

    if(userObj.name == '' || userObj.name == undefined){
        return callback('Name required');
    }

    if(userObj.email == '' || userObj.email == undefined){
        return callback('Email required');
    }

    if(userObj.password == '' || userObj.password == undefined){
        return callback('Password required');
    }

    if(userObj.password != userObj.confirm_password){
        return callback('Passwords do not match');
    }

    this.create(userObj, function(err, user){

        if(err){
            if (err.name === 'MongoError' && err.code === 11000) {
                return callback('That email address allready exists');
            }
            return callback(err.message, null);
        }

        callback(null, user);

    });

};

UserSchema.statics.authenticate = function(email, password, callback){

    this.findOne({'email': email}, function(err, user){

        if(err){
            err.status = 400;
            return callback(err, null);
        }else if(!user){
            var err = new Error('User not found');
            err.status = 401;
            return callback(err, null);
        }

        bcrypt.compare(password, user.password, function(err, result){

            if(result === true){
                return callback(null, user);
            }else{
                var error = {};
                var err = new Error('Incorrect Password');
                err.status = 401;
                return callback(err, null);
            }

        });

    });

};

var User = mongoose.model("User", UserSchema);

User.find({}).exec(function(err, users){

    if(err){
        return next(err);
    }

    if(!users || users == ''){
        User.registerUser({
            name: 'mylocal',
            email: 'mail@mylocal.co',
            password: '123',
            confirm_password: '123',
            user_role: 'Super Admin'
        }, function(){
            
        });
    }

});

//Exports the BookSchema for use elsewhere.
module.exports = User;