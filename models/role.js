const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//book schema definition
let RoleSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        permissions: [String]
    }
);

RoleSchema.methods.can = function(){



};

var Role = mongoose.model("Role", RoleSchema);
module.exports = Role;