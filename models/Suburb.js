const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const townData = require('./data/towns.json');

let SuburbSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
    county: String,
    latitude: Number,
    longitude: Number
});

var Suburb = mongoose.model("Suburb", SuburbSchema);
module.exports = Suburb;