const express = require('express');
const blogRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const mid = require('../middleware/session');
const pagination = require('../helpers/pagination');

blogRoutes.get('/', function(req, res, next){

	const docsPerPage = 9;
	const query = {};

	if(req.query.tag){
		query.tags = req.query.tag;
	}

	Post.count(query)
		.then((count) => {

			Post.find(query)
				.limit(docsPerPage)
				.skip(pagination.getSkip(req.query.page || 0, docsPerPage))
				.exec(function(err, posts){

				if(err){
					return next(err);
				}

				console.log(res.locals.title);

				res.locals.title = res.locals.title.replace('%placeholder%', '');
				res.locals.meta = res.locals.meta.replace('%placeholder%', '');

				return res.render('blog/blog', {
			        error: '',
			        user: req.session.user || false,
			        page: req.query.page || 1,
			        paginationLinks: pagination.getLinks(count, docsPerPage, req.query.page),
			        posts: posts
			    });

			});

		})
		.catch((err) => {
			return next(err);
		});

});

blogRoutes.get('/category/:cat', function(req, res){

	res.locals.title = res.locals.title.replace('%placeholder%', '');
	res.locals.meta = res.locals.meta.replace('%placeholder%', '');

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

	    res.locals.title = res.locals.title.replace('%placeholder%', post.title);
		res.locals.meta = res.locals.meta.replace('%placeholder%', post.title);

		return res.render('blog/single', {
			post: post,
	        error: '',
	        user: req.session.user || false
	    });

	});

});

module.exports = blogRoutes;