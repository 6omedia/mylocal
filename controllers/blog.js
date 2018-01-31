const express = require('express');
const blogRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const mid = require('../middleware/session');
const pagination = require('../helpers/pagination');

// blogRoutes.get('/blog', mid.loginRequired, function(req, res){

// 	return res.render('blog/blog', {
//         error: '',
//         user: req.session.user || false
//     });

// });

blogRoutes.get('/', function(req, res){

	return res.render('blog/blog', {
        error: '',
        user: req.session.user || false
    });

});

blogRoutes.get('/category/:cat', function(req, res){

	return res.render('blog/blog', {
        error: '',
        user: req.session.user || false
    });

});

blogRoutes.get('/:id', function(req, res, next){

	Post.findOne({slug: req.params.id}, function(err, post){

		if(err){
			return next(err);
		}

		try {
	        post.body = JSON.parse(post.body);
	    } catch(e) {
	        post.body = post.body;
	    }

		return res.render('blog/single', {
			post: post,
	        error: '',
	        user: req.session.user || false
	    });

	});

});

module.exports = blogRoutes;