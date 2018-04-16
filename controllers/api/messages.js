const express = require('express');
const msgsRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Message = require('../../models/message');
const MessageChain = require('../../models/messagechain');
const path = require('path');
const mid = require('../../middleware/session');
const nodemailer = require('nodemailer');
const Notification = require('../../helpers/notification');
const utils = require('../../helpers/utilities');

msgsRoutes.get('/', mid.jsonLoginRequired, function(req, res, next){

	let data = {};
	data.success = 0;

	const skip = parseInt(req.query.skip) || 0;

	Message.find({to: req.session.userId})
		.limit(10).skip(skip).sort({created_at: -1})
		.populate('from')
		.populate('respondto')
		.then((messages) => {
			data.messages = messages;
			return res.json(data);
		})
		.catch((e) => {
			data.error = e.message || 'Internal Server Error';
			res.status(e.status || 500);
			return res.json(data);
		});

});

msgsRoutes.post('/send', mid.jsonLoginRequired, function(req, res, next){

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
		template_type: null,
		template_name: null,
		subject: req.body.subject || null,
		email_to: req.body.email_to || null,
		email_from: req.session.user.email,
		email_respond: req.session.user.email,
		loggedinuserid: req.session.userId,
		replace_func: (msg) => {
			return msg;
		}
	});

	notification.send((err, chainid) => {
		if(err){
			data.error = err;
			return res.json(data);
		}
		console.log('CHAINID');
		console.log(chainid);
		data.success = 'Message Sent';
		data.chainid = chainid;
	    return res.json(data);
	});

});

msgsRoutes.get('/chain/:chainid', mid.jsonLoginRequired, function(req, res, next){

	let data = {};
	data.success = 0;

	const skip = parseInt(req.query.skip) || 0;

	MessageChain.findById(req.params.chainid)
		.populate({
			path:'messages',
		    options: {
		        limit: 10,
		        sort: { created_at: -1},
		        skip: skip
		    },
		    populate: {
		    	path: 'from'
		    }
		})
		.then((msgChain) => {

			data.msgchain = msgChain;
			return res.json(data);

		})
		.catch((e) => {
			console.log(e);
			data.error = e.message || 'Internal Server Error';
			res.status(e.status || 500);
			return res.json(data);
		});

});

module.exports = msgsRoutes;