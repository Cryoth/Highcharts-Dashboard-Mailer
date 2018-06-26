// Défini l'environnement selon que la variable d'environnement NODE_ENV soit défini ou non
// Doit être égal à 'production' pour ne pas être en développement
const env = process.env.NODE_ENV || 'development';

// Récupère les identifiants serveurs depuis config.js
const config = require('./config.js')[env].Servers;

// Framework web express
var express = require('express');
var app = express();

// Module de création des graphiques selon 
const chartProvider = require('./lib/chartProvider');

// Tâches cron
const CronJob = require('cron').CronJob;

// Fonctions de vérification de l'état du serveur
const verify = require('./lib/checkUp')
const log = require('./lib/logs.js').global;


// Lancement de la génération au démarrage de l'Appli en mode développement
if(env == 'development'){
	log.info('===============  MODE DEVELOPMENT  ===============\n');

	// Verifie la présence de tous les dossiers tmp
	verify.dossiers(config);

	// Mets à disposition les fichiers statics
	log.info("Mise à disposition des fichiers statics ...");

	app.use(express.static(__dirname + '/tmpdir'));
	app.listen(3000);

	log.info('OK - Fichiers statics accessibles.');

	log.info("Vérification de l'état du réseau ...");

	verify.internet();
	verify.serveurs(config.CheckAnywhere);
	verify.serveurs(config.CipAnywhere);

	log.info("CIP Anywhere : Lancement de la génération des graphiques ...");
	eachCip(0);

}

// Lance la tâche cron pour les lundi à 3h du matin
new CronJob('00 00 03 * * 1', function() {

	// Verifie la présence de tous les dossiers tmp
	verify.dossiers(config);

	// Mets à disposition les fichiers statics
	log.info("Mise à disposition des fichiers statics ...");

	app.use(express.static(__dirname + '/tmpdir'));
	app.listen(3000);

	log.info('OK - Fichiers statics accessibles.');

	log.info("Vérification de l'état du réseau ...");

	verify.internet();
	verify.serveurs(config.CheckAnywhere);
	verify.serveurs(config.CipAnywhere);

	log.info("CIP Anywhere : Lancement de la génération des graphiques ...");
	eachCip(0);
	
}, null, true, 'Europe/Paris');

function eachCip(x){
    chartProvider.cipanywhere(config.CipAnywhere[x]).then(function(){
    	if( x < config.CipAnywhere.length - 1 ) {
    		eachCip(x+1);
    	}else{
    		log.info("Check Anywhere : Lancement de la génération des graphiques ...");
			eachCheck(0);
    	}
    	
    });
};

function eachCheck(x){
    chartProvider.checkanywhere(config.CheckAnywhere[x]).then(function(){
    	if( x < config.CheckAnywhere.length - 1 ) {
    		eachCheck(x+1);
    	}
    })
};