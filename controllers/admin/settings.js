const express = require('express');
const settingsRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Setting = require('../../models/setting');
const Industry = require('../../models/industry');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

settingsRoutes.get('/seo', mid.onlyAdmin, function(req, res, next){

	Setting.findOne({name: 'SEO'}, function(err, settings){

		if(err){
			return next(err);
		}

		console.log(settings);

		res.render('admin/settings/seo', {
			section: 'settings',
			pages: settings.value.pages,
			error: ''
		});

	});

});

settingsRoutes.get('/emails', mid.onlyAdmin, function(req, res, next){

	Setting.find({group: 'Email'}, function(err, settings){

		if(err){
			return next(err);
		}

		const from_email = settings.find(function(obj){
			return obj.name === 'From Email';
		});
		const email_password = settings.find(function(obj){
			return obj.name === 'Password';
		});
		const subscriber_templates = settings.find(function(obj){
			return obj.name === 'Subscriber Templates';
		});
		const owner_templates = settings.find(function(obj){
			return obj.name === 'Business Owner Templates';
		});

		console.log(from_email);

		res.render('admin/settings/emails', {
			section: 'settings',
			// settings: settings,
			from_email: from_email,
			email_password: email_password,
			sub_emails: subscriber_templates.value,
			owner_emails: owner_templates.value,
			error: ''
		});

	});

});

module.exports = settingsRoutes;