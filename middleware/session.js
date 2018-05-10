const User = require('../models/user');
const Setting = require('../models/setting');
const Message = require('../models/message');

// redered rounte

function loggedIn(req, res, next) {

    if(req.session && req.session.userId) {

        User.findById(req.session.userId, function(err, user){
            if(user.user_role === 'Admin'){
                return res.redirect('/admin');
            }else{
                return res.redirect('/dashboard');
            }
            return next();
        });

    }else{
        return next();
    }

}

function loginRequired(req, res, next) {
    if(req.session && req.session.userId) {
        User.findById(req.session.userId, function(err, user){
            if(err){
                return next(err);
            }
            req.session.user = user;
            Message.count({to: user._id, seen: false}, (err, count) => {
                if(err){
                    return next(err);
                }
                res.locals.notifications = count;   
                return next();
            });
        });
    }else{
        return res.redirect('/');
    }
}

function onlyAdmin(req, res, next) {
    if(req.session && req.session.userId) {

        User.findById(req.session.userId, function(err, user){
            if(err){
                return next(err);
            }
            if(user.user_role == 'Editor' || user.user_role == 'Admin' || user.user_role == 'Super Admin'){
                req.session.user = user;
                return next();
            }
            res.status(403);
            return res.redirect('/login');
        });

    }else{
        res.status(401);
        return res.redirect('/');
    }
}

function onlySubscriber(req, res, next) {
    if(req.session && req.session.userId) {

        User.findById(req.session.userId, function(err, user){
            if(err){
                return next(err);
            }
            if(user.user_role == 'Subscriber'){
                req.session.user = user;
                Message.count({to: user._id, seen: false}, (err, count) => {
                    if(err){
                        return next(err);
                    }
                    res.locals.notifications = count;   
                    return next();
                });
            }else{
                req.session.user = user;
                return res.redirect('/admin');
            }
        });

    }else{
        res.status(401);
        return res.redirect('/');
    }
}

// json routes

function jsonOnlyAdmin(req, res, next){
    if(req.session && req.session.userId) {

        User.findById(req.session.userId, function(err, user){
            if(err){
                return next(err);
            }
            if(user.user_role == 'Editor' || user.user_role == 'Admin' || user.user_role == 'Super Admin'){
                req.session.user = user;
                return next();
            }
            res.status(403);
            return res.json({error: 'Unathorized'});
        });

    }else{
        res.status(401);
        return res.json({error: 'unauthenticated'});
    }
}

function jsonLoginRequired(req, res, next){
    if(req.session && req.session.userId) {
        User.findById(req.session.userId, function(err, user){
            if(err) return next(err);
            req.session.user = user;
            return next();
        });
    }else{
        res.status(401);
        return res.json({error: 'unauthenticated'});
    }
}

function isHomeTown(req, res, next){

    if(req.query.notown){
        return next();
    }

    if(req.session && req.session.userId) {
        User.findById(req.session.userId)
        .populate('home_town')
        .exec(function(err, user){
            if(err) return next(err);
            req.session.user = user;

            if(!user.home_town){
                return next();
            }

            if(user.home_town.name) {
                return res.redirect('/town/' + user.home_town.name);
            }

            return next();

        });
    }else{
        next();
    }

}

module.exports.loggedIn = loggedIn;

module.exports.loginRequired = loginRequired;
module.exports.onlyAdmin = onlyAdmin;
module.exports.onlySubscriber = onlySubscriber;

module.exports.jsonLoginRequired = jsonLoginRequired;
module.exports.jsonOnlyAdmin = jsonOnlyAdmin;

module.exports.isHomeTown = isHomeTown;