var exports = {};

// const pn = require('sync-node').createQueue();
const nodemailer = require('nodemailer');

const User = require('../models/user');
const Setting = require('../models/setting');
const MessageChain = require('../models/messagechain');
const Message = require('../models/message');

/************************

	Notification:
	Constructor returns either true if options are ok or a string if required options are missing 
	
*************************/

function Notification(options){

	this.htmlBody = options.htmlBody || null;
	this.template_type = options.template_type || null;
	this.template_name = options.template_name || null;
	this.subject = options.subject || null;
	this.email_to = options.email_to || null;
	this.email_from = options.email_from || null;
	this.email_respond = options.email_respond || null;
 	this.replace_func = options.replace_func || null;
 	this.loggedinuserid = options.loggedinuserid || null;

 	if(!this.loggedinuserid){
 		return 'Notification requires a loggedinuserid';
 	}

 	if(!this.replace_func){
 		this.replace_func = (msg) => { return msg; };
 	}

	// check input decide if template or not

	this.useTemplate;

	if(this.htmlBody){
		this.useTemplate = false;
	}else{
		this.useTemplate = true;
		if(!this.template_type || !this.template_name){
			return 'Notification requires either an htmlBody parameter or both template_type and template_name';
		}
	}

	return true;

}

Notification.prototype.send = function(callback) {

	const thisNotification = this;

	// get email info and templates
	Setting.getEmailSettings(this.template_type, this.template_name, (err, settings) => {

		if(err){
			console.log(err);
			return callback(err);
		}

		// build email data
		let emailData = {
			email: settings.email,
			password: settings.password,
			to: thisNotification.email_to
		};

		if(thisNotification.subject){
			emailData.subject = thisNotification.subject;
		}else{
			if(settings.template){
				emailData.subject = settings.template.subject || 'No Subject';
			}else{
				emailData.subject = 'No Subject';
			}
		}

		if(thisNotification.htmlBody){
			emailData.emailBody = thisNotification.htmlBody;
		}else{
			if(settings.template){
				emailData.emailBody = settings.template.message || 'No Body';
			}else{
				return callback('No Email Body');
			}
		}

		emailData.emailBody = this.replace_func(emailData.emailBody);	

		// can send custom email without a template
		thisNotification.sendEmail(emailData, (err) => {

			if(err){
				console.log(err);
				return callback(err);
			}

			thisNotification.updateMessageChains(emailData, (err, chainid) => {

				if(err){
					console.log(err);
					return callback(err);
				}

				return callback(null, chainid);

			});

		});

	});

};

Notification.prototype.sendEmail = function(emailData, callback){

	let transporter = nodemailer.createTransport({
		host: 'mail.mylocal.co',
		port: 26,
		secure: false,
		auth: {
			user: emailData.email,
			pass: emailData.password  
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	let mailOptions = {
		from: '"MyLocal" <' + emailData.email + '>', // mail@mylocal.co
		to: emailData.to, // 'mike@6omedia.co.uk', // list of receivers
		subject: emailData.subject || 'No Subject', // Subject line
		text: emailData.emailBody, // plain text body
		html: emailData.emailBody // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {

		if(error){
			console.log(error);
			return callback(error.message || 'Mail Error');
		}

		return callback();

	});

}

Notification.prototype.updateMessageChains = function(emailData, callback){

	const thisNotification = this;
	let userTo, userFrom, userRespond;

	Promise.all([
		User.findOne({email: this.email_to}).lean(), 
		User.findOne({email: this.email_from}).lean(),
		User.findOne({email: this.email_respond}).lean()
	])
	.then((users) => {

		const userTo = users[0];
		const userFrom = users[1];
		const userRespond = users[2];

		// let seen = false;

		// if(userFrom._id.equals(thisNotification.loggedinuserid)){
		// 	seen = true;
		// }

		if(!userTo){
			return callback('User with email ' + this.email_to + ' not found');
		}

		if(!userFrom){
			return callback('User with email ' + this.email_from + ' not found');
		}

		MessageChain.findOne({$or: [
			{ user_one: userTo, user_two: userFrom},
			{ user_one: userFrom, user_two: userTo}
		]})
		.then((msgChain) => {

			let msg = new Message({
				from: userFrom, 
				to: userTo, 
				body: emailData.emailBody, 
				// seen: seen,
			    subject: emailData.subject,
			    respondto: userRespond
			});

			if(msgChain){

				msg.chain = msgChain._id;
				msg.save()
				.then(() => {

					msgChain.messages.push(msg);
					msgChain.save().then((chainSave) => {
						return callback(null, chainSave._id);
					}).catch((e) => { return callback(e.message || 'Internal Server Error'); });
					
				}).catch((e) => { return callback(e.message || 'Internal Server Error'); });

			}else{

				let msgChain = new MessageChain({
					user_one: userTo._id,
				    user_two: userFrom._id,
					messages: [msg._id]
				});

				msg.chain = msgChain._id;

				if(userTo.message_chains){
					userTo.message_chains.push(msgChain._id);
				}else{
					userTo.message_chains = [];
					userTo.message_chains.push(msgChain._id);
				}

				if(userFrom.message_chains){
					userFrom.message_chains.push(msgChain._id);
				}else{
					userFrom.message_chains = [];
					userFrom.message_chains.push(msgChain._id);
				}

				let saves = [];
				saves.push(msg.save());
				saves.push(msgChain.save());
				saves.push(User.update({_id: userTo._id}, {$push: {message_chains: msgChain}}));
				saves.push(User.update({_id: userFrom._id}, {$push: {message_chains: msgChain}}));

				Promise.all(saves).then((savesArr) => {
					return callback(null, savesArr[1]._id);
				}).catch((e) => { console.log(e); return callback(e.message || 'Internal Server Error'); });

			}

		})
		.catch((err) => {
			return callback(err.message || 'internal server error');
		});

	})
	.catch((err) => {
		return callback(err.message || 'internal server error');
	});

}

exports = Notification;
module.exports = exports;