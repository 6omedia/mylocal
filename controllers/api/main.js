const express = require('express');
const apiRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Town = require('../../models/town');
const Industry = require('../../models/industry');
const Postcode = require('../../models/postcode');
const Term = require('../../models/term');
const path = require('path');
const fs = require('fs');
const mid = require('../../middleware/session');
const backup = require('mongodb-backup');
const searchLocation = require('../../helpers/dbhelpers').searchLocation;
const nodemailer = require('nodemailer');
const Notification = require('../../helpers/notification');
const utils = require('../../helpers/utilities');
var csv = require('csvtojson');

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

apiRoutes.get('/locations/search', function(req, res, next){

	let data = {};
	data.success = 0;

	if(!req.query.term || req.query.term == 'noterm'){

		data.locations = [];
		return res.json(data);

	}else{

		searchLocation(req.query.term, (err, locations) => {

			if(err){
				res.status(err.status || 500);
				return res.json(data);
			}

	 		data.locations = locations;
	 		return res.json(data);
			
		});

	}

});

apiRoutes.get('/terms/search', function(req, res, next){

	let data = {};
	data.success = 0;
	data.terms = [];

	if(!req.query.term || req.query.term == 'noterm'){
		return res.json(data);
	}

	const term = new RegExp('^' + req.query.term, 'ig');

	Term.find({name: term}).limit(10).exec((err, terms) => {

		if(err){
			res.status(err.status || 500); 
			return res.json(data);
		}

		terms.forEach((term) => {
			data.terms.push(term.name);
		});

 		return res.json(data);

 	});

});

apiRoutes.get('/towns/search', function(req, res, next){

	let data = {};
	data.success = 0;
	data.terms = [];

	if(!req.query.term || req.query.term == 'noterm'){
		return res.json(data);
	}

	const term = new RegExp('^' + req.query.term, 'ig');

	Postcode.find({town: term}).distinct('town').lean().exec((err, terms) => {

		if(err){
			res.status(err.status || 500); 
			return res.json(data);
		}

		data.towns = terms;
 		return res.json(data);

 	});

});

apiRoutes.get('/postcodes/search', function(req, res, next){

	let data = {};
	data.success = 0;
	data.terms = [];

	if(!req.query.term || req.query.term == 'noterm'){
		return res.json(data);
	}

	const term = new RegExp('^' + req.query.term, 'ig');

	Postcode.find({town: term}).lean().exec((err, terms) => {

		if(err){
			res.status(err.status || 500); 
			return res.json(data);
		}

		data.postcodes = terms;
 		return res.json(data);

 	});

});

apiRoutes.post('/sendnotification', mid.jsonLoginRequired, function(req, res, next){

	/** REMOVE THIS ROUTE BEFORE PRODUCTION **/

	let data = {};

	const valid = utils.requiredPostProps(['email_to', 'email_from', 'email_respond'], req.body);

	if(valid != true){
		data.error = valid;
		res.status(400);
		return res.json(data);
	}

	// TODO: only allow to send from own email (and mylocal?)

	let notification = new Notification({
		htmlBody: req.body.htmlBody || null,
		template_type: req.body.template_type || null,
		template_name: req.body.template_name || null,
		subject: req.body.subject || null,
		email_to: req.body.email_to || null,
		email_from: req.body.email_from || null,
		email_respond: req.body.email_respond || null,
		loggedinuserid: req.session.userId,
		replace_func: (msg) => {
			return msg.replace('%name%', 'Avenger')
					  .replace('%listing%', 'this listing')
					  .replace('%rating%', '2400');
		}
	});

	notification.send((err) => {
		if(err){
			data.error = err;
			return res.json(data);
		}
		data.success = 'All good lets go';
	    return res.json(data);
	});

});

apiRoutes.post('/postcodes/upload', mid.jsonLoginRequired, function(req, res){

	let body = {};
	body.success = 0;

	let postcodesToSave = [];

	if(!req.files){
		body.error = 'No files were uploaded.';
    	return res.status(400).json(body);
	}

	if(!req.files.postcodes){
		body.error = 'No postcodes property found';
    	return res.status(400).json(body);
	}

	var ext = req.files.postcodes.name.substr(req.files.postcodes.name.lastIndexOf('.') + 1);

	if(ext != 'json' && ext != 'csv'){
		body.error = 'file type is not supported please upload a json file';
    	return res.status(400).json(body);
	}

	/* DO THE UPLOADING!!! */
	const uploads = path.join(__dirname, '../..', '/public/uploads/');
	const filePath = uploads + '/' + req.files.postcodes.name;

	if(!fs.existsSync(uploads)){
		fs.mkdirSync(uploads);
	}

	req.files.postcodes.mv(filePath, function(err) {
	    
	    if(err){
      		body.error = err;
			return res.json(body);
	    }

		if(ext == 'json'){

			let rawdata = fs.readFileSync(filePath);  
			let postcodeArray = JSON.parse(rawdata);

			Postcode.uploadFromJSON(postcodeArray, function(message){

				body.success = message;
				res.status(200);
				return res.json(body);

			});

		}else{

			let jsonArr = [];

			csv()
			.fromFile(filePath)
			.on('json',(jsonObj)=>{
			    jsonArr.push(jsonObj);
			})
			.on('done',(error)=>{

				Postcode.uploadFromJSON(jsonArr, function(message){

					body.success = message;
					res.status(200);
					return res.json(body);

				});

			})
			.on('error',(err)=>{
			    body.error = err;
				res.status(err.status || 500);
				return res.json(body);
			});

		}	

	});

});

module.exports = apiRoutes;