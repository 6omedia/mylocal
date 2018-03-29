const express = require('express');
const settingRoutes = express.Router();
const mongoose = require('mongoose');
const utils = require('../../helpers/utilities.js');
const User = require('../../models/user');
const Listing = require('../../models/listing');
const Setting = require('../../models/setting');
const mid = require('../../middleware/session');

settingRoutes.post('/seo', function(req, res){

	let data = {};

	const valid = utils.requiredPostProps(['q_home_title', 'q_home_meta', 'q_listing_title', 'q_listing_meta', 'q_blog_title',
	    			'q_blog_meta', 'q_post_title', 'q_post_meta', 'q_default_title', 'q_default_meta'], req.body);

	if(valid != true){
		data.error = valid;
		res.status(400);
		return res.json(data);
	}

	Setting.update({name: 'SEO'}, {
		value: {
	    	pages: {
	    		home: {
	    			title: req.body.q_home_title,
	    			meta: req.body.q_home_meta
	    		},
	    		listing: {
	    			title: req.body.q_listing_title,
	    			meta: req.body.q_listing_meta
	    		},
	    		blog: {
	    			title: req.body.q_blog_title,
	    			meta: req.body.q_blog_meta
	    		},
	    		post: {
	    			title: req.body.q_post_title,
	    			meta: req.body.q_post_meta
	    		},
	    		default: {
	    			title: req.body.q_default_title,
	    			meta: req.body.q_default_meta
	    		}
	    	}
	    }
	}).then((results) => {
		// console.log(results);
		res.status(200);
		return res.json(data);
	})
	.catch((err) => {
		data.error = err;
		res.status(err.status || 500);
		return res.json(data);
	});

});

settingRoutes.post('/emails', function(req, res){

	let data = {};

	const valid = utils.requiredPostProps(
		['email', 'password', 'registered', 'reviewed', 'posreview', 'negreview'], req.body);

	if(valid != true){
		data.error = valid;
		res.status(400);
		return res.json(data);
	}

	let updateArr = [];

	updateArr.push(Setting.update({name: 'From Email'}, {value: req.body.email}));
	updateArr.push(Setting.update({name: 'Password'}, {value: req.body.password}));
	updateArr.push(Setting.update({name: 'Subscriber Templates'}, {value: {
		"register": {
			message: req.body.registered.message,
			send: (req.body.registered.active == 'true' ? true : false)
		},
		"reviewed": {
			message: req.body.reviewed.message,
			send: (req.body.reviewed.active == 'true' ? true : false)
		}
	}}));
	updateArr.push(Setting.update({name: 'Business Owner Templates'}, {value: {
		"goodreview": {
			message: req.body.posreview.message,
			send: (req.body.posreview.active == 'true' ? true : false)
		},
		"badreview": {
			message: req.body.negreview.message,
			send: (req.body.negreview.active == 'true' ? true : false)
		} 
	}}));

	Promise.all(updateArr)
		.then((results) => {
			data.success = 'Email Settings Updated';
			res.status(200);
			return res.json(data);
		})
		.catch((err) => {
			data.error = err;
			res.status(err.status || 500);
			return res.json(data);
		});

});

module.exports = settingRoutes;