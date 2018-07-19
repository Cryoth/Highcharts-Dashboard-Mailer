// Framework web express
var express = require('express');
var app = express();
// Utilisation de underscore-express comme template
require('underscore-express')(app);

// Module de logs
const log = require('./logs').global;

const env = process.env.NODE_ENV || 'development';

// Récupère les identifiants serveurs depuis config.js
const config = require('../config.js')[env].Servers;

// Module de création des graphiques selon 
const chartProvider = require('../lib/chartProvider');


module.exports = {
	launch : function(servers){

		// Mets à disposition les fichiers statics
		log.info("Lancement du serveur web.");

		var bodyParser = require('body-parser')
		var session = require('express-session')
		app.use(bodyParser.json());       // to support JSON-encoded bodies
		app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
		  extended: true
		})); 
		app.use(session({
		  secret: 'test',
		}))
		app.set('views', __dirname + '/views')
		app.set('view engine', 'tmpl');
		app.use(express.static(__dirname + '/public'));
		app.use('/staticChart', express.static(__dirname + '/../tmpdir'));

		// Add headers
		app.use(function (req, res, next) {

		    // Website you wish to allow to connect
		    res.setHeader('Access-Control-Allow-Origin', 'null');

		    // Request methods you wish to allow
		    res.setHeader('Access-Control-Allow-Methods', 'GET');

		    // Request headers you wish to allow
		    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

		    // Pass to next layer of middleware
		    next();
		});


		app.get('/', function (req, res) {
		  if(req.session.authenticated == true){
		    res.render('admin', {login: true});
		  }else{
		  	res.render('login', {login: false});
		  }
		});

		app.get('/admin', function (req, res) {
		  if(req.session.authenticated == true){
		  	res.render('admin', {login: true, logs: listLogs()});
		  }else{
		  	res.redirect('/');
		  }
		})

		app.get('/command', function (req, res) {
		  if(req.session.authenticated == true){
		  	res.render('command', {login: true});
		  }else{
		  	res.redirect('/');
		  }
		})

		app.get('/galerie', function (req, res) {
		  if(req.session.authenticated == true){
		  	res.render('galerie', {login: true, list : listGallery(servers)});
		  }else{
		  	res.redirect('/');
		  }
		})

		app.get('/logout', function (req, res) {
		  req.session.destroy();
		  res.redirect('/');
		})

		app.get('/manualSend/:cip', function (req, res) {
		  if(req.query.pass == "test"){
		  	console.log("Lancement de l'envoi manuel pour " + req.params.cip);
		  	for(cip of config.CipAnywhere){
		  		if(cip.name == req.params.cip){
		  			chartProvider.cipanywhereManuel(cip);
		  		}
		  	}
		  	res.sendStatus(200);
		  }else{
		  	res.sendStatus(400);
		  }
		})

		app.post('/', function(req, res){
			if (req.body.username && req.body.username === 'user' && req.body.password && req.body.password === 'pass') {
				req.session.authenticated = true;
				res.redirect('/admin');
			} else {
				req.flash('error', 'Username and password are incorrect');
				res.redirect('/login');
			}
		})


		// Fait écouter notre serveur sur le port choisi (ici 3000)
		app.listen(3000);

	}
}

function listGallery(config){
	const fs = require('fs');
	const path = __dirname + '/../tmpdir';
	var list = {
		Cip : [],
		Check : []
	};

	fs.readdirSync(path + "/CheckAnywhere").forEach(folder => {
	  list.Check.push(folder);
	  list.Check[folder] = [];
	  fs.readdirSync(path + "/CheckAnywhere/" + folder).forEach(file => {
		list.Check[folder].push("staticChart/CheckAnywhere/" + folder + "/" + file);
	  });
	});

	fs.readdirSync(path + "/CipAnywhere").forEach(folder => {
	  list.Cip.push(folder);
	  list.Cip[folder] = [];
	  fs.readdirSync(path + "/CipAnywhere/" + folder).forEach(file => {
		list.Cip[folder].push("staticChart/CipAnywhere/" + folder + "/" + file);
	  });
	});

	return list;

}

function listLogs(){
	const fs = require('fs');
	const path = __dirname + '/logs';
	var list = {
		global: [],
		error: [],
		chart: [],
		mail: []
	};

	var lineReaderGlobal = require('readline').createInterface({
	  input: require('fs').createReadStream(path + "/global.log")
	});

	var lineReaderError = require('readline').createInterface({
	  input: require('fs').createReadStream(path + "/error.log")
	});

	var lineReaderChart = require('readline').createInterface({
	  input: require('fs').createReadStream(path + "/chart.log")
	});

	var lineReaderMail = require('readline').createInterface({
	  input: require('fs').createReadStream(path + "/mail.log")
	});

	lineReaderGlobal.on('line', function (line) {
	  list.global.unshift(JSON.parse(line));
	});

	lineReaderError.on('line', function (line) {
	  list.error.unshift(JSON.parse(line));
	});

	lineReaderChart.on('line', function (line) {
	  list.chart.unshift(JSON.parse(line));
	});

	lineReaderMail.on('line', function (line) {
	  list.mail.unshift(JSON.parse(line));
	});

	return list;

}