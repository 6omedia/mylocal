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
	// 	from: {
 //            type: Schema.Types.ObjectId,
 //            ref: 'User'
 //        },
 //        to: {
 //            type: Schema.Types.ObjectId,
 //            ref: 'User'
 //        },
 //        body: String,
 //        created_at: {
 //            type: Date,
 //            default: Date.now
 //        }
	// }]
});

var MessageChain = mongoose.model("MessageChain", MessageChainSchema);
module.exports = MessageChain;