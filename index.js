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


// Annonce le mode développement si celui-ci est de rigueur
if(env == 'development'){
	console.log('\n===============  MODE DEVELOPMENT  ===============\n');
}

// Mets à disposition les fichiers statics

log.info("\nMise à disposition des fichiers statics ...");

app.use(express.static(__dirname + '/tmpdir'));
app.listen(3000);

log.info('OK - Fichiers statics accessibles.');

log.info("Vérification de l'état du réseau ...");

verify.internet();
verify.serveurs(config.CheckAnywhere);
verify.serveurs(config.CipAnywhere);

log.info("CIP Anywhere : Lancement de la génération des graphiques ...");
chartProvider.cipanywhere(config.CipAnywhere).then(function(){

	log.info("Check Anywhere : Lancement de la génération des graphiques ...");
	chartProvider.checkanywhere(config.CheckAnywhere);

});


// Lance la tâche cron pour les lundi à 3h du matin
new CronJob('00 00 03 * * 1', function() {

	console.log("\nCheck Anywhere : Lancement de la génération des graphiques ...\n");
	chartProvider.checkanywhere(config.CheckAnywhere);

	console.log("\nCIP Anywhere : Lancement de la génération des graphiques ...\n");
	chartProvider.cipanywhere(config.CipAnywhere);

}, null, true, 'Europe/Paris');