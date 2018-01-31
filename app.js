var express = require('express');
var session = require('express-session');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var config = '';
var cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

if(process.env.NODE_ENV == 'test'){
	config = require('./config/test.json');
}else{
	config = require('./config/dev.json');
}

// var user = require('./controllers/user.js');

let options = { 
	server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
	replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } 
};

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

//db connection      
mongoose.connect(config.db, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(session({
	secret: 'hhhmmmm',
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({
        mongooseConnection: db
    })
}));

app.use(cookieParser());

//parse application/json and look for raw text                                        
app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));
app.use(fileUpload());

app.use('/static', express.static('public'));

// main routes
app.use('/', require('./controllers/main.js'));

// admin routes
app.use('/admin', require('./controllers/admin/admin.js'));
app.use('/admin/listings', require('./controllers/admin/listings.js'));
app.use('/admin/blog', require('./controllers/admin/blog.js'));

// api routes
app.use('/api', require('./controllers/api/main.js'));
app.use('/api/users', require('./controllers/api/users.js'));
app.use('/api/listings', require('./controllers/api/listings.js'));
app.use('/api/reviews', require('./controllers/api/reviews.js'));
app.use('/api/industries', require('./controllers/api/industries.js'));
app.use('/api/image_library', require('./controllers/api/image_library.js'));
app.use('/api/blog', require('./controllers/api/blog.js'));

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
    	message: err.message,
    	error: err
	});
});

app.listen(9000, function () {
	console.log('App running on port 9000');
});

module.exports = app;