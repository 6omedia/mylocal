const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    body: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

var Message = mongoose.model("Message", MessageSchema);
module.exports = Message;