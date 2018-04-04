const express = require('express');
const mailRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Town = require('../../models/town');
const Setting = require('../../models/setting');
const mid = require('../../middleware/session');
const nodemailer = require('nodemailer');

const fromMyLocal = '"MyLocal" <info@mylocal.co>';

const transporterOptions = {
	host: 'mail.mylocal.co',
	port: 26,
	secure: false,
	auth: {
		user: 'mail@mylocal.co',
		pass: 'jv{:*/G)83mp' 
	},
	tls: {
		rejectUnauthorized: false
	}
};

mailRoutes.post('/subscriber/:template', function(req, res, next){

	let data = {};

	if(!req.body.userid){
		res.stats(400);
		data.error = 'userid required';
		return res.send(data);
	}

	// get template

	Setting.find({group: 'Email'}, (err, settings) => {

		if(err){
			data.error = err.message || 'Something went wrong';
			res.status(err.status || 500);
			return res.json(data);
		}

		if(!settings){
			data.error = 'No Settings found';
			res.status(404);
			return res.json(data);
		}

		User.findById(req.body.userid)
			.then((user) => {

				data.success = 'Proceed';
				return res.send(data);

			})
			.catch((err) => {
				data.error = err.message || 'Something went wrong';
				res.status(err.status || 500);
				return res.json(data);
			});

	});

	// get email to send to

	// get from (either mylocal or other user)

	// let transporter = nodemailer.createTransport(transporterOptions);

	// const mailOptions = {
	// 	from: fromMyLocal,	// sender address
	// 	to: 'mike@6omedia.co.uk',	// list of receivers
	// 	subject: 'Hello ✔',	// Subject line
	// 	text: 'Yeah man',	// plain text body
	// 	html: '<b>Hello world?</b>' // html body
	// };

	// transporter.sendMail(mailOptions, (error, info) => {

	//     if(error){
	//         return console.log(error);
	//     }

	//     console.log('nlslsdksdkmlsd');
	//     console.log(info);

	// });

});

mailRoutes.post('/owner/:template', function(req, res, next){

	let data = {};


});

module.exports = mailRoutes;