const express = require('express');
const imgLibraryRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const mid = require('../../middleware/session');
const ImageLibrary = require('../../helpers/image_library.js');
const fileUpload = require('express-fileupload');

imgLibraryRoutes.post('/add_image', mid.jsonLoginRequired, function(req, res){

	let body = {};

	if(!req.files){
		body.error = 'No files were uploaded.';
    	return res.status(400).json(body);
	}

	if(!req.files.imglib_image){
		body.error = 'No imglib_image property found';
    	return res.status(400).json(body);
	}

	var ext = req.files.imglib_image.name.substr(req.files.imglib_image.name.lastIndexOf('.') + 1);

	if(ext != 'png' && ext != 'jpg' && ext != 'JPEG' && ext != 'gif'){
		body.error = 'file type is not supported please use either: png, jpg, JPEG or gif';
    	return res.status(400).json(body);
	}

	User.findById(req.session.userId, function(err, user){

		if(err){
			body.error = err.message;
			res.status(err.status || 500);
			return res.json(body);
		}

		var folder = user.email;

		if(req.body.folder){
			folder = req.body.folder;
		}

		const imageLibrary = new ImageLibrary(folder);
		imageLibrary.add_image(req.files, function(obj){

			if(obj.error){
				res.status(200);
				body.error = obj.error;
				return res.json(body);
			}else{
				res.status(200);
				body.message = 'Image Added';
				return res.json(body);
			};
			
		});

	});

});

imgLibraryRoutes.get('/get_images', mid.jsonLoginRequired, function(req, res){

	let body = {};

	User.findById(req.session.userId, function(err, user){

		if(err){
			res.status(err.status || 500);
			body.error = err.message;
			return res.json(body);
		}

		if(!user){
			res.status(404);
			body.error = 'User not found';
			return res.json(body);
		}

		var folder = user.email;

		if(req.body.folder){
			folder = req.body.folder;
		}

		const imageLibrary = new ImageLibrary(folder);
		const images = imageLibrary.getImages();

		if(!images){
			res.status(500);
			body.error = 'Something went wrong';
			return res.json(body);
		};

		body.images = images;
		res.status(200);
		return res.json(body);

	});

});

imgLibraryRoutes.delete('/remove_image/:fileName', mid.jsonLoginRequired, function(req, res){

	let body = {};

	User.findById(req.session.userId, function(err, user){

		if(err){
			res.status(err.status || 500);
			body.error = err.message;
			return res.json(body);
		}

		if(!user){
			res.status(404);
			body.error = 'User not found';
			return res.json(body);
		}

		var folder = user.email;

		if(req.body.folder){
			folder = req.body.folder;
		}

		const imageLibrary = new ImageLibrary(folder);

		if(imageLibrary.removeImage(req.params.fileName) == false){
			res.status(400);
			body.error = 'file not found';
			return res.json(body);
		}

		res.status(200);
		body.message = 'File Removed';
		return res.json(body);

	});

});

module.exports = imgLibraryRoutes;