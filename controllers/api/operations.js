const express = require('express');
const operationsRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Term = require('../../models/term');
const Industry = require('../../models/industry');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

operationsRoutes.post('/terms-form-industries', mid.onlyAdmin, function(req, res){

	let data = {};

	if(!req.body.type){
		data.error = 'type missing from body';
		return res.json(data);
	}

	Term.createFromIndustries(req.body.type, (err, saved) => {

		if(err){
			data.error = err;
			return res.json(data);
		}

		data.success = saved + ' ' + req.body.type + ' terms have been created';
		return res.json(data);

	});

});

module.exports = operationsRoutes;