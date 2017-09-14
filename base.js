// =======================
// get the packages we need ============
// =======================
	var express     = require('express');
	var app         = express();
	var bodyParser  = require('body-parser');
	var morgan      = require('morgan');
	var mongoose    = require('mongoose');
	var bcrypt 		= require('bcrypt');  //used to encrypt the password
	var jwt    		= require('jsonwebtoken'); // used to create, sign, and verify tokens
	var config 		= require('./config'); // get our config file
	var User   		= require('./app/models/user'); // get our mongoose model
	var bcrypt 		= require('bcrypt');
	var fs 			= require('fs');
	var generator 	= require('generate-password');

//packages hashclient
	var crypto 		= require('crypto');
	var path 		= require('path');
	const args = process.argv;

///connection to database
	mongoose.connect(config.database);

	switch (args[2]) {
		case "create":
			create();
			break;
		case "list":
			list();
			break;
		case "remove":
			remove(args[3]);
			break;
		case "update":
			remove(args[3]);
			create(args[3]);
			break;
		default: 
			console.log("options:\n         create \n         list \n         remove user@mail.fr");
	}
	
	function remove(id) {
		User.findByIdAndRemove(id, function(err) {
		if (err) throw err;
		  console.log('User '+id+' deleted!');
		});
	}
	
	function create() {
		var contents = fs.readFileSync("newusers.json");
		var jsonContent = JSON.parse(contents);
		for (i = 0; i < jsonContent.login.length; i++) {
				var password = generator.generate({
					length: 7,
					numbers: true
				});
				
				var newsalt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(password, newsalt);
				var suphash = crypto.createHash('sha256').update(hash, 'utf8').digest("hex");
				
				var nick = new User({ 
					_id: jsonContent.login[i]._id,
					salt: newsalt,
					superhash: suphash
					});

					nick.save(function(err) {
					if (err) throw err;
					}) 
				console.log('Mail: '+jsonContent.login[i]._id+'  Mot de passe: '+password);
		}	
	}
		
	function list() {	
		User.find({}, function(err, users) {
			console.log(users);
		});
	}
	
	
	function update(id) {
		var password = generator.generate({
			length: 7,
			numbers: true
		});
		User.findOneAndUpdate({_id:id}, req.body, function (err, place) {
		});
	}
