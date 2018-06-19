// Convertisseur au format JSON exploitable par Highcharts
const Chart = require('../lib/json-formatter.js');
const highcharts = require('../lib/highcharts.js');

// Serializer pour données depuis php
const PHPUnserialize = require('php-unserialize');

// Accès aux fichiers du systeme
const fs = require("fs");

// Gestionnaire de dates
const moment = require('moment');

// Liste des fonctions liées au mailing
const mailer = require('../lib/mailer.js');

// Liste des requêtes aux serveurs BDD
var check_DB = require('../config/request.js').check;
var cip_DB = require('../config/request.js').cip;


module.exports = {
	checkanywhere: function(server){

		// Parcours les BDD de Check Anywhere
		server.forEach(function(db, index){

			// Récupération de la liste des destinataires
			var promiseClients = check_DB.getListDestinataire(db);

			// Récupération de la liste des graphiques
			var promiseCharts = check_DB.getChartsToSend(db);

			// Execute ce code une fois les deux éléments du dessus récupérés
			Promise.all([promiseClients, promiseCharts]).then(function([clients, charts]) {

		  		sendMailsCheck(db, charts, clients);

			}).catch(function(err){

				console.log(err);

			});
			
		});
	},

	cipanywhere: function(server){

		// Parcours les BDD de Cip Anywhere
		server.forEach(function(db, index){

			// Récupération de la liste des destinataires
			var promiseClients = cip_DB.getListDestinataire(db);

			// Récupération de la liste des graphiques
			var promiseCharts = cip_DB.getChartsToSend(db);

			// Execute ce code une fois les deux éléments du dessus récupérés
			Promise.all([promiseClients, promiseCharts]).then(function([clients, charts]) {

				sendMailsCip(db, charts, clients);

			}).catch(function(err){

				console.log(err);

			});
			
		});
	}
}


// Fonctions asynchrones destinés à Checkanywhere

async function sendMailsCheck(db, charts, clients){

	var p = await loopChartCheck(db, charts);

	if(p){

		for (client of clients){
			check_DB.getChartsFromClient(db, client.id).then(function(listChart){

				// Envoi du mail en incluant les graphiques
				mailer.setMailOptions(client.Email, "Check Anywhere", listChart);
				mailer.sendMail();

			});
		}

	}
}

async function loopChartCheck(db, charts){

	for(chartData of charts){

		var chart = new Chart();

		chart.title = chartData["Nom"];
		
		var series = await check_DB.getChartSeries(db, chartData["Id"]),
			chart = await loopSerieCheck(db, chart, chartData, series);

		//console.log(chart.toString());
		var img = await highcharts.generateGraph(chart);

		fs.writeFile("tmpdir/CheckAnywhere/" + chartData["Id"] + ".png", img, 'base64', function(err) {
		  	if(err){
		  		console.log(err);
		  	};
		  	console.log('\x1b[32m%s\x1b[0m', "OK - Fichier : [CHECK] " + db.name + " " + chartData["Nom"]);
		});
	}

	return true;
}

async function loopSerieCheck(db,chart ,chartData, series){

	for (serie of series){
		var idData,
    		valeurs = PHPUnserialize.unserialize(serie.Valeurs),
    		year = moment().startOf('isoweek').subtract(chartData["Periode"], 'week').format('YYYY'),
	    	month = moment().startOf('isoweek').subtract(chartData["Periode"], 'week').format('M') - 1,
	    	day = moment().startOf('isoweek').subtract(chartData["Periode"], 'week').format('D'),
	    	dateStart = Date.UTC(year, month, day);

	    if(serie.Objectif_Libelle != "" && serie.Objectif_Val != null){
	    	chart.addPlotline(serie.Objectif_Libelle, serie.Couleur, serie.Objectif_Val);
	    }

	    if("0" in valeurs){
	    	idData = valeurs[0][2];
	    }else{
	    	idData = valeurs[1][2];
	    }
	    
	    var serie_Promise = await cip_DB.getSeriesData(db, 0, 0, chartData["Periode"], idData).then(function(data){
	    	chart.addSerie(data, 'column', serie["Nom"], serie["Couleur"], dateStart);
	    });
	}

	return chart;

}

// Fonctions asynchrones destinés à CipAnywhere

async function sendMailsCip(db, charts, clients){

	var promise = await loopChartCip(db, charts);

	if(promise){

		for (client of clients){

			cip_DB.getChartsFromClient(db, client.id).then(function(listChart){

			// Envoi du mail en incluant les graphiques
			mailer.setMailOptions(client.Email, "CIP Anywhere", listChart);
			mailer.sendMail();

			});
		}

	}
}

async function loopChartCip(db, charts){

	for(chartData of charts){

		var chart = new Chart();

		chart.title = chartData["labelIndicateur"];
		
		var year = moment().startOf('isoweek').subtract(52, 'week').format('YYYY'),
	    	month = moment().startOf('isoweek').subtract(52, 'week').format('M') - 1,
	    	day = moment().startOf('isoweek').subtract(52, 'week').format('D'),
	    	dateStart = Date.UTC(year, month, day);

		var serie_Promise = await cip_DB.getChartData(db, chartData["idIndicateur"]).then(function(data){
	    	chart.addSerie(data, 'column', chartData["labelIndicateur"], "blue", dateStart);
	    });

	    if(chartData["objectif"] != 0){
	    	chart.addPlotline("objectif", "blue", chartData["objectif"]);
	    }

		var img = await highcharts.generateGraph(chart);

		fs.writeFile("tmpdir/CipAnywhere/" + chartData["idIndicateur"] + ".png", img, 'base64', function(err) {
		  	if(err){
		  		console.log(err);
		  	};
		  	console.log('\x1b[32m%s\x1b[0m', "OK - Fichier : [CIP] " + db.name + " " + chartData["labelIndicateur"]);
		});
	}

	return true;
}