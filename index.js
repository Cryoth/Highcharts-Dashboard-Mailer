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


// Annonce le mode développement si celui-ci est de rigueur
if(env == 'development'){
	console.log('\n===============  MODE DEVELOPMENT  ===============\n');
}else{
	console.log('\n===============  MODE PRODUCTION  ===============\n');
}


// Mets à disposition les fichiers statics

console.log("\nMise à disposition des fichiers statics ...");

app.use(express.static(__dirname + '/tmpdir'));
app.listen(3000);

console.log('\x1b[32m%s\x1b[0m', 'OK - Fichiers statics accessibles.\n');


console.log("\nCIP Anywhere : Lancement de la génération des graphiques ...\n");
chartProvider.cipanywhere(config.CipAnywhere);

// Lance la tâche cron pour les lundi à 3h du matin
new CronJob('00 00 03 * * 1', function() {

	console.log("\nCheck Anywhere : Lancement de la génération des graphiques ...\n");
	chartProvider.checkanywhere(config.CheckAnywhere);

	console.log("\nCIP Anywhere : Lancement de la génération des graphiques ...\n");
	chartProvider.cipanywhere(config.CipAnywhere);

}, null, true, 'Europe/Paris');