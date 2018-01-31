const express = require('express');
const blogRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Post = require('../../models/post');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

blogRoutes.get('/', mid.onlyAdmin, function(req, res){

	const docsPerPage = 20;

	Post.count({}, function(err, count){

		if(err){
			next(err);
		}

		Post.find({})
			.sort({created_at: -1})
			.limit(docsPerPage)
			.skip(pagination.getSkip(req.query.page || 1, docsPerPage))
			.exec(function(err, posts){

			if(err){
				return next(err);
			}

			return res.render('admin/blog/all', {
				section: 'blog',
				posts: posts,
				paginationLinks: pagination.getLinks(count, docsPerPage, req.query.page || 1),
				error: ''
			});

		});

	});

});

blogRoutes.get('/add', mid.onlyAdmin, function(req, res){



	return res.render('admin/blog/add', {
		section: 'blog',
		error: ''
	});

});

blogRoutes.get('/edit/:id', mid.onlyAdmin, function(req, res, next){

	Post.findById(req.params.id, function(err, post){

		if(err){
			return next(err);
		}

		try {
	        post.body = JSON.parse(post.body);
	    } catch(e) {
	        post.body = post.body;
	    }

		return res.render('admin/blog/edit', {
			section: 'blog',
			post: post,
			error: ''
		});

	});

});

module.exports = blogRoutes;