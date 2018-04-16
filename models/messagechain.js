const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageChainSchema = new Schema({
	user_one: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    user_two: {
        type: Schema.Types.ObjectId,
	    ref: 'User'
	},
    messages: [{        
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }]
    // messages: [{
    //     seen: {
    //         type: Boolean,
    //         default: false
    //     },
    //     msg: {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Message'
    //     }
    // }]
});

var MessageChain = mongoose.model("MessageChain", MessageChainSchema);
module.exports = MessageChain;