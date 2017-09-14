var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt'); //used to encrypt the password
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model
var https = require('https');
var querystring = require('querystring');
var fs = require('fs')
var crypto = require('crypto');
var path = require('path');
var codejira;

app.use(bodyParser.json());

///////public/////////////////////////////////
app.use('/', express.static('web/'));

app.post('/register', function (req, res) {
	var hash = crypto.createHash('sha256').update(req.body.hash, 'utf8').digest("hex");
	User.findOne({
		_id: req.body.login
	}, function (err, user) {
		if (err)
			throw err;
			var nick = new User({
					_id: req.body.login,
					salt: req.body.salt,
					superhash: hash
				});
			if (!user) {
				nick.save(function (err) {
					if (err)
						throw err;
					console.log('User saved successfully');
				})
			} else {
				res.send("already");
				// console.log(req.body.login);
				// User.update({
					// _id: req.body.login
				// }, {
					// salt: req.body.salt,
					// superhash: hash
				// }, function (err, affected, resp) {
					// console.log(resp);
				// })
			}
			res.send(200);
	})
});

app.post('/getSalt', function (req, res) {
	User.findOne({
		_id: req.body.login
	}, function (err, user) {
		if (err)
			throw err;
		if (!user) {
			res.json({
				success: false,
				message: 'Authentication failed. User not found.'
			});
			console.log("login false ")
		} else if (user) {
			res.json({
				"salt": user.salt
			});
		}
	});
});

app.post('/login', function (req, res) {
	console.log("login : " + req.body.hash)
	var userHash = crypto.createHash('sha256').update(req.body.hash, 'utf8').digest("hex");
	User.findOne({
		_id: req.body.login
	}, function (err, user) {
		if (err)
			throw err;
		if (user.superhash != userHash) {
			console.log("login pwd false ")
			res.json({
				success: false,
				message: 'Authentication failed. Wrong password.'
			});
		} else {
			console.log("login ok ")
			// if user is found and password is right
			var idnum = Math.floor((Math.random() * 10000) + 1)
				// create a token
				var token = jwt.sign({
					Session: idnum
				}, app.get('superSecret'), {
					expiresIn: 1440 // expires in 24 hours
				});
			// return the information including token as JSON
			res.json({
				token: token
			});
		}
	});
});

var port = process.env.PORT || 8089; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({
		extended: false
	}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

//////////////////////////////route///////////////////////////////////////
var apiRoutes = express.Router();

//////////////////////////////verify token /api  secure///////////////////////////////////////
apiRoutes.use(function (req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
	if (token) {
		jwt.verify(token, app.get('superSecret'), function (err, decoded) {
			if (err) {
				return res.status(401).send({
					success: false,
					message: 'bad token provided.'
				});
			} else {
				req.decoded = decoded;
				next();
			}
		});

	} else {
		// if there is no token
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}
});

///////secure////////////////
app.use('/authtickets/', apiRoutes);
apiRoutes.use('/form', express.static('secure/tickets.html'));
apiRoutes.use('/changepass', express.static('secure/changepass.html'));
apiRoutes.all('/create', function (req, ack, next) {
	console.log(req.body)
	var body = req.body;
	var postdata = JSON.stringify({
			"fields": {
				"project": {
					"key": "keyjira"
				},
				"priority": {
					"id": body.priority
				},
				"summary": body.summary,
				"description": body.description,
				"customfield_10013": body.email,
				"customfield_10900": body.cc,
				"issuetype": {
					"name": "Fault"
				}
			}
		});

	var options = {
		host: "jira.example.fr",
		ca: [fs.readFileSync("certs/ca.pem", {
				encoding: 'utf-8'
			})],
		port: 10443,
		path: "/rest/api/2/issue/",
		method: "POST",
		headers: {
			"Authorization": "Basic passwordbase64",
			"Content-Type": "application/json"
		}
	};
	var req = https.request(options, function (res) {
			res.on('data', function (chunk) {
				var data = JSON.parse(chunk)
					console.log(data);
				ack.send(data.key);
			});

			res.on('error', function (err) {
				console.log(err);
			})
		});
	// req error
	req.on('error', function (err) {
		console.log(err);
	});
	//send request with the postData form
	req.write(postdata);
	req.end();
});

// start the server
app.listen(port);
console.log('server started http://localhost:' + port);
