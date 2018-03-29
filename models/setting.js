const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settingsData = require('./data/settings_default.json');

let SettingSchema = new Schema({
	name: {
        type: String,
        unique: true
    },
    group: String,
    value: Schema.Types.Mixed
});

var Setting = mongoose.model("Setting", SettingSchema);

Setting.find({}).exec(function(err, settings){

    if(err){
        return next(err);
    }

    if(!settings || settings == ''){
        
        Setting.insertMany(settingsData)
            .then(function(industies) {
                console.log('Setting Added');
            })
            .catch(function(err) {
                console.log('Err ', err);
            });

    }

});

module.exports = Setting;