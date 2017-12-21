const express = require('express');
const apiRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const mid = require('../../middleware/session');

// dashboard
apiRoutes.get('/', function(req, res){

	res.json({});

});

module.exports = apiRoutes;