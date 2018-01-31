const express = require('express');
const apiRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Town = require('../../models/town');
const Industry = require('../../models/industry');
const mid = require('../../middleware/session');

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// dashboard
apiRoutes.get('/towns/search', function(req, res){

	let data = {};
	data.success = 0;

	let query = {};

	if(req.query.term){
		query.name = new RegExp(escapeRegex(req.query.term), 'gi');
	}

	Town.find(query).limit(10).exec(function(err, towns){

		if(err){
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}

		res.status(200);
		data.results = towns;
    	return res.json(data);

	});

});

module.exports = apiRoutes;