// Défini l'environnement selon que la variable d'environnement NODE_ENV soit défini ou non
const env = process.env.NODE_ENV || 'development';

// Récupère les identifiants serveurs depuis config.js
const config = require('./config.js')[env].Servers;

// Liste des fonctions liées au mailing
const mailer = require('./lib/mailer.js');

// Convertisseur au format JSON exploitable par Highcharts
const formatJSON = require('./lib/json-formatter.js');

// Liste des requêtes aux serveurs BDD
var DB = require('./config/request.js');


if(env == 'development'){
	console.log('\n===============  MODE DEVELOPMENT  ===============\n');
}



config.CheckAnywhere.forEach(function(db, index){

	var clients = DB.getListDestinataire(db); // Inclus les id de graphiques à envoyer
	var charts = DB.getChartsToSend(db);

	for (chart in charts){
		
	}

	// clients.forEach(function(client){
	// 	var mail =  mailer.prepare(client);
	// 	mailer.verify(mail);
	// 	mailer.send(mail);
	// });
	
});
