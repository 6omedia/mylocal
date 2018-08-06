var exports = {};

const nodemailer = require('nodemailer');
const Setting = require('../models/setting');

function sendEmail(email_to, email_from, subject, message, callback){

	Setting.getEmailSettings(null, null, (err, settings) => {

		if(err){
			console.log(err);
			return callback(err);
		}

		// build email data
		let emailData = {
			email: settings.email,
			password: settings.password,
			to: email_to
		};

		// send email

		let transporter = nodemailer.createTransport({
			host: 'mail.mylocal.co',
			port: 465,
			secure: true, // true for 465, false for other ports
			auth: {
				user: emailData.email,
				pass: emailData.password  
			},
			tls: {
				rejectUnauthorized: false
			},
			debug: true
		});

		let mailOptions = {
			from: '"MyLocal" <' + emailData.email + '>', // mail@mylocal.co
			to: emailData.to, // 'mike@6omedia.co.uk', // list of receivers
			subject: subject || 'No Subject', // Subject line
			text: message, // plain text body
			html: message // html body
		};

		transporter.verify(function(error, success) {
		   if (error) {
		        console.log(error);
		   } else {
		        console.log('Server is ready to take our messages');
		   }

		   // send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {

				if(error){
					console.log(error);
					return callback(error.message || 'Mail Error');
				}
				
				return callback(null, info);

			});

		});

	});

}

exports.sendEmail = sendEmail;
module.exports = exports;