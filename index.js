// Défini l'environnement selon que la variable d'environnement NODE_ENV soit défini ou non
const env = process.env.NODE_ENV || 'development';

// Récupère les identifiants serveurs depuis config.js
const config = require('./config.js')[env].Servers;

// Liste des fonctions liées au mailing
const mailer = require('./lib/mailer.js');

// Convertisseur au format JSON exploitable par Highcharts
const formatJSON = require('./lib/json-formatter.js');

// Serializer pour données depuis php
const PHPUnserialize = require('php-unserialize');

// Liste des requêtes aux serveurs BDD
var DB = require('./config/request.js');



// Annonce le mode développement si celui-ci est de rigueur
if(env == 'development'){
	console.log('\n===============  MODE DEVELOPMENT  ===============\n');
}



// Parcours les BDD de Check Anywhere
config.CheckAnywhere.forEach(function(db, index){

	// Récupération de la liste des destinataires
	var promiseClients = DB.getListDestinataire(db);

	// Récupération de la liste des graphiques
	var promiseCharts = DB.getChartsToSend(db);

	// Execute ce code une fois les deux éléments du dessus récupérés
	Promise.all([promiseClients, promiseCharts]).then(function([clients, charts]) {
  		
  		console.log("Clients et Graphs OK");

  		charts.forEach(function(chart){

  			DB.getChartSeries(db, chart["Id"]).then(function(series){

  				series.forEach(function(serie){

  					valeur = PHPUnserialize.unserialize(serie.Valeurs);

  				});

  			});

  		});

	}).catch(function(err){

		console.log(err);

	});

	// clients.forEach(function(client){
	// 	var mail =  mailer.prepare(client);
	// 	mailer.verify(mail);
	// 	mailer.send(mail);
	// });
	
});
