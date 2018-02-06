const express = require('express');
const blogRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Post = require('../../models/post');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

function slugify(text){

	return text.toString().toLowerCase().replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');

}

blogRoutes.get('/', function(req, res){

	let data = {};
	data.success = 0;

	const docsPerPage = 12;

	let query = {};

	if(req.query.search){
		query.title = new RegExp(req.query.search, 'gi');
	}

	Post.count(query)
		.then((count) => {
			Post.find(query)
				.sort({created_at: -1})
				.limit(docsPerPage)
				.skip(pagination.getSkip(req.query.page || 0, docsPerPage))
				.exec(function(err, posts){

					if(err){
						data.error = err.message || 'Internal Server Error';
				    	res.status(err.status || 500);
				    	return res.json(data);
					}

					data.success = 1;
					data.posts = posts;
					data.pagination = pagination.getLinks(count, docsPerPage, req.query.page || 0);
				    res.status(200);

			    	return res.json(data);

				});
		});

});

blogRoutes.post('/add', mid.jsonLoginRequired, function(req, res){

	var body = {};

	const role = req.session.user.user_role;

	if(role != 'Editor' && role != 'Admin' && role != 'Super Admin'){
		res.status(403);
		body.error = 'You do not have permission to add a post';
		return res.json(body);
	}

	console.log('BODY ', req.body.content);

	var post = new Post({
		title: req.body.title,
	    slug: slugify(req.body.title),
	    author: req.session.userId,
	    tags: req.body.tags || [],
	    body: req.body.content,
	    feat_img: req.body.featured_img
	});

	post.save()
		.then(() => {

			res.status(200);
			body.success = 'Post Created';
			return res.json(body);

		})
		.catch((err) => {
			res.status(err.status || 500);
			body.error = err.message || 'Internal Server Error';
			return res.json(body);
		})

});

blogRoutes.post('/update', mid.jsonLoginRequired, function(req, res){

	var body = {};

	const role = req.session.user.user_role;

	if(role != 'Editor' && role != 'Admin' && role != 'Super Admin'){
		res.status(403);
		body.error = 'You do not have permission to add a post';
		return res.json(body);
	}

	if(!req.body.postid){
		res.status(400);
		body.error = 'postid is missing';
		return res.json(body);
	}

	Post.findById(req.body.postid, function(err, post){

		if(err){
			res.status(err.status || 500);
			body.error = err.message || 'Internal Server Error';
			return res.json(body);
		}

		if(req.body.title){
			post.title = req.body.title;
		}

		if(req.body.content){
			post.body = req.body.content;
		}

		if(req.body.featured_img){
			post.feat_img = req.body.featured_img;
		}

		if(req.body.tags){
			post.tags = req.body.tags || [];
		}

		post.save()
			.then((whatsthis) => {

				body.whatsthis = whatsthis;
				body.success = 'Post Updated';
				res.status(200);
				return res.json(body);

			})
			.catch((err) => {

				res.status(err.status || 500);
				body.error = err.message || 'Internal Server Error';
				return res.json(body);

			});

	});

});

blogRoutes.delete('/:id', mid.jsonOnlyAdmin, function(req, res){

	let data = {};

	const postId = req.params.id;

	Post.findByIdAndRemove(postId, function(err, removed){

		if(err){
			data.error = 'Post ID does not exist';
			res.status(400);
			return res.send(data);
		}

		res.status(200);
		data.success = 1;
	    return res.send(data);
	
	});

});

module.exports = blogRoutes;