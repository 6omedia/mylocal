var exports = {};

const pn = require('sync-node').createQueue();
const nodemailer = require('nodemailer');

const User = require('../models/user');
const Setting = require('../models/setting');
const MessageChain = require('../models/messagechain');
const Message = require('../models/message');

const Town = require('../models/town');
const Suburb = require('../models/suburb');
const Postcode = require('../models/postcode');

// function emailSettings(type, template){

// 	if(!type || !template){

// 	}

// 	callback({

// 	});

// }

// function sendEmail(type, template, toEmail, fromEmail, custom, replaceFunc, callback){

// 	Setting.find({group: 'Email'}, (err, settings) => {

// 		if(err){
// 			callback(err.message || 'Finding settings error');
// 		}

// 		const email = settings.find(function(setting){
// 			return setting.name == 'From Email';
// 		});

// 		const pass = settings.find(function(setting){
// 			return setting.name == 'Password';
// 		});

// 		const templates = settings.find(function(setting){
// 			return setting.name == type;
// 		});

// 		let msgObj;

// 		if(templates != undefined){
// 			msgObj = templates.value[template];
// 		}else{
// 			if(!custom){
// 				return callback('No template exists called ' + template + ' and now custom message given');
// 			}
// 			msgObj = { message: custom };
// 		}

// 		console.log(3);

// 		let transporter = nodemailer.createTransport({
// 			host: 'mail.mylocal.co',
// 			port: 26,
// 			secure: false,
// 			auth: {
// 				user: email.value,
// 				pass: pass.value  
// 			},
// 			tls: {
// 				rejectUnauthorized: false
// 			}
// 		});

// 		Promise.all([
// 			User.findOne({email: toEmail}), 
// 			User.findOne({email: fromEmail})])
// 		.then((users) => {

// 			const userTo = users[0];
// 			const userFrom = users[1];

// 			if(!userTo){
// 				return callback('User with email ' + toEmail + ' not found');
// 			}

// 			if(!userFrom){
// 				return callback('User with email ' + fromEmail + ' not found');
// 			}

// 			let emailBody = msgObj.message.replace('%name%', userTo.name); // populateVars( user.name || '', );

// 			if(replaceFunc){
// 				emailBody = replaceFunc(msgObj.message);
// 			}

// 			let mailOptions = {
// 				from: '"MyLocal" <mail@mylocal.co>',
// 				to: userTo.email, // 'mike@6omedia.co.uk', // list of receivers
// 				subject: msgObj.subject || 'No Subject', // Subject line
// 				text: emailBody, // plain text body
// 				html: emailBody // html body
// 			};

// 			// send mail with defined transport object
// 			transporter.sendMail(mailOptions, (error, info) => {

// 				if(error){
// 					return callback(error.message || 'Mail Error');
// 				}

// 				console.log(5);

// 				MessageChain.findOne({$or: [
// 						{ user_one: userTo, user_two: userFrom},
// 						{ user_one: userFrom, user_two: userTo}
// 					]})
// 					.then((msgChain) => {

// 						let msg = new Message({
// 							from: userFrom, to: userTo, body: emailBody
// 						});

// 						console.log(6);

// 						if(msgChain){

// 							console.log(6.5);

// 							msgChain.messages.push(msg);
// 							msgChain.save().then(() => {
// 								return callback();
// 							}).catch((e) => { return callback(e.message || 'Internal Server Error'); });

// 						}else{

// 							console.log(6.8);

// 							let msgChain = new MessageChain({
// 								user_one: userTo._id,
// 							    user_two: userFrom._id,
// 								messages: [msg._id]
// 							});

// 							if(userTo.message_chains){
// 								userTo.message_chains.push(msgChain._id);
// 							}else{
// 								userTo.message_chains = [];
// 								userTo.message_chains.push(msgChain._id);
// 							}

// 							if(userFrom.message_chains){
// 								userFrom.message_chains.push(msgChain._id);
// 							}else{
// 								userFrom.message_chains = [];
// 								userFrom.message_chains.push(msgChain._id);
// 							}

// 							console.log(7);

// 							let saves = [];
// 							saves.push(msg.save());
// 							saves.push(msgChain.save());
// 							saves.push(User.update({_id: userTo._id}, {$push: {message_chains: msgChain}}));
// 							saves.push(User.update({_id: userFrom._id}, {$push: {message_chains: msgChain}}));

// 							Promise.all(saves).then(() => {
// 								console.log(8);
// 								return callback();
// 							}).catch((e) => { console.log(e); return callback(e.message || 'Internal Server Error'); });

// 						}

// 					})
// 					.catch((err) => {
// 						return callback(err.message || 'Internal Server Error');
// 					});

// 			});

// 		})
// 		.catch((err) => {
// 			return callback(err.message || 'Internal Server Error');
// 		});

// 	});

// }

function searchLocation(term, callback){

	term = new RegExp('^' + term, 'i');
    locations = [];

    pn.pushJob(function(){

		return new Promise(function(resolve, reject){

			Town.find({name: term}).limit(10).select({name: 1}).lean()
				.then((towns) => {
					// locations = locations.concat(towns);
					towns.forEach((town) => {
						locations.push(town.name);
					});
					resolve();
				})
				.catch((e) => {
					console.log(e);
					reject(e);
				});

		});
			
	});

	pn.pushJob(function(){

		return new Promise(function(resolve, reject){

			if(locations.length >= 10){
				return resolve();
			}

			Suburb.find({name: term}).limit(10 - locations.length).select({name: 1}).lean()
				.then((suburbs) => {
					// locations = locations.concat(suburbs);
					suburbs.forEach((suburb) => {
						locations.push(suburb.name);
					});
					resolve();
				})
				.catch((e) => {
					console.log(e);
					reject(e);
				});

		});
			
	});
    
	pn.pushJob(function(){

		return new Promise(function(resolve, reject){

			if(locations.length >= 10){
				return resolve();
			}

			Postcode.find({postcode: term}).limit(10 - locations.length).select({postcode: 1}).lean()
				.then((postcodes) => {
					// locations = locations.concat(postcodes);	
					postcodes.forEach((postcode) => {
						locations.push(postcode.postcode);
					});
					resolve();
				})
				.catch((e) => {
					console.log(e);
					reject(e);
				});

		});
			
	});

	pn.pushJob(function(){

		return new Promise(function(resolve, reject){

			callback(null, locations);
			resolve();

		});
			
	});

}

function searchServices(term, callback){

	

}

// exports.sendEmail = sendEmail;
exports.searchLocation = searchLocation;
exports.searchServices = searchServices;
module.exports = exports;