const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageSchema = new Schema({
    chain: {
        type: Schema.Types.ObjectId,
        ref: 'MessageChain'
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    seen: {
        type: Boolean,
        default: false
    },
    subject: String,
    body: String,
    meta: Object,
    respondto: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

MessageSchema.virtual('preview').get(function(){
    if(this.body){
        return this.body.replace(/<(?:.|\n)*?>/gm, '').substring(0, 45) + '...'; // strip out any html and limit chars to asomthing
    }
    return '';
});

var Message = mongoose.model("Message", MessageSchema);
module.exports = Message;