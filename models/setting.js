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

SettingSchema.statics.getEmailSettings = function(template_type, template_name, callback){

    let settingsObj = {};

    Setting.find({group: 'Email'}, (err, settings) => {

        if(err){
            callback(err.message || 'Finding settings error');
        }

        settingsObj.email = settings.find(function(setting){
            return setting.name == 'From Email';
        }).value;

        settingsObj.password = settings.find(function(setting){
            return setting.name == 'Password';
        }).value;

        if(template_type && template_name){
            tempObj = settings.find(function(setting){
                return setting.name == template_type;
            }).value;
            if(tempObj == undefined){
                return callback(template_type + ' is not a type of email template found in settings');
            }
            settingsObj.template = tempObj[template_name];
        }

        callback(null, settingsObj);

    });

};

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