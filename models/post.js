const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const industryData = require('./data/industries.json');

//book schema definition
let PostSchema = new Schema({
	title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    meta_description: String,
    created_at: Date,
    updated_at: Date,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    body: String,
    blog_name: String, // when post will belong to only one blog eg, news, blog, howtos etc
    tags: Array, // for categorization
    feat_img: String,
    view_count: {
        type: Number,
        required: true,
        default: 0
    }
});

PostSchema.pre('save', function(next){

    var now = new Date();
 
    if(this.isNew) {
        this.created_at = now;
    }else{
        this.updated_at = now;
    }

    next();

});

var Post = mongoose.model("Post", PostSchema);
module.exports = Post;