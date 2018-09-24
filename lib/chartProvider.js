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

const log = require('../lib/logs.js');

const _ = require('lodash');

// Liste des requêtes aux serveurs BDD
var check_DB = require('../config/request.js').check;
var cip_DB = require('../config/request.js').cip;


module.exports = {
	checkanywhere: function(db){

		return new Promise(function(resolve, reject){

			// Récupération de la liste des destinataires
			var promiseClients = check_DB.getListDestinataire(db);

			// Récupération de la liste des graphiques
			var promiseCharts = check_DB.getChartsToSend(db);

			// Execute ce code une fois les deux éléments du dessus récupérés
			Promise.all([promiseClients, promiseCharts]).then(function([clients, charts]) {

		  		sendMailsCheck(db, charts, clients).then(function(){
		  			return resolve();
				});

			}).catch(function(err){

				return reject(err);

			});
			
		});
	},

	cipanywhere: function(db){

		return new Promise(function(resolve, reject){

			// Récupération de la liste des destinataires
			var promiseClients = cip_DB.getListDestinataire(db);

			// Récupération de la liste des graphiques
			var promiseCharts = cip_DB.getChartsToSend(db);

			// Execute ce code une fois les deux éléments du dessus récupérés
			Promise.all([promiseClients, promiseCharts]).then(function([clients, charts]) {

				sendMailsCip(db, charts, clients).then(function(){
					return resolve();
				});

			}).catch(function(err){

				return reject(err);

			});
				
		});
	},

		cipanywhereManuel: function(db){

		return new Promise(function(resolve, reject){

			// Récupération de la liste des destinataires
			var promiseClients = cip_DB.getListDestinataireManual(db);

			// Récupération de la liste des graphiques
			var promiseCharts = cip_DB.getChartsToSend(db);

			// Execute ce code une fois les deux éléments du dessus récupérés
			Promise.all([promiseClients, promiseCharts]).then(function([clients, charts]) {

				sendMailsCip(db, charts, clients).then(function(){
					return resolve();
				});

			}).catch(function(err){

				return reject(err);

			});
				
		});
	},
}


// Fonctions asynchrones destinés à Checkanywhere

async function sendMailsCheck(db, charts, clients){

	var p = await loopChartCheck(db, charts);

	if(p){

		recursiveCheckMail(0, clients, charts, db);

	}
}

async function loopChartCheck(db, charts){

	for(chartData of charts){

		var chart = new Chart();

		chart.title = chartData["Nom"];

		var series = await check_DB.getChartSeries(db, chartData["Id"]),
			chart = await loopSerieCheck(db, chart, chartData, series);

		//log.chart.info(chart.toString());
		var img = await highcharts.generateGraph(chart);

		fs.writeFile("tmpdir/CheckAnywhere/" + db.name + '/' + chartData["Id"] + ".png", img, 'base64', function(err) {
		  	if(err){
		  		log.global.error(err);
		  	};
		  	log.chart.info("OK - Fichier : [CHECK] " + db.name + " " + chartData["Nom"]);
		});
	}

	return true;
}

async function loopSerieCheck(db, chart, chartData, series){

	for (serie of series){

		var idData,
    		valeurs = PHPUnserialize.unserialize(serie.Valeurs),
    		year = moment().startOf('isoweek').subtract(chartData["Periode"], 'week').format('YYYY'),
	    	month = moment().startOf('isoweek').subtract(chartData["Periode"], 'week').format('M') - 1,
	    	day = moment().startOf('isoweek').subtract(chartData["Periode"], 'week').format('D'),
	    	dateStart = Date.UTC(year, month, day);

	    if(Object.keys(valeurs).length > 1){
	    	idData = [];
	    	Object.keys(valeurs).forEach(function(key){
			    idData.push(valeurs[key][2]);
			}); 
	    }else{
		    if("0" in valeurs){
		    	idData = valeurs[0][2];
		    }else{
		    	idData = valeurs[1][2];
		    }
		}

	    if(serie.Objectif_Libelle != "" && serie.Objectif_Val != null){
	    	chart.addPlotline(serie.Objectif_Libelle, serie.Couleur, serie.Objectif_Val);
	    }

	    var promise_Data = await check_DB.getSeriesData(db, serie["Monetaire"], serie["Ratio"], chartData["Periode"], idData, serie["id"]).then(function(result){
	    	
	    	if(result.data.length > parseInt(chartData["Periode"])){
	    		chart.addSerie(_.takeRight(result.data, chartData["Periode"]), 'column', serie["Nom"], serie["Couleur"], dateStart);
	    		//log.chart.error("Le nombre de données est plus élevé que le nombre de semaines à afficher !");
	    	}else{
	    		chart.addSerie(result.data, 'column', serie["Nom"], serie["Couleur"], dateStart);
	    	}

	    	if(result.commentaires != null){

		    	for(commentaire of result.commentaires){

		    		if(commentaire.text != ""){

		    			var year = moment(commentaire.Date).format('YYYY'),
					    	month = moment(commentaire.Date).format('M') - 1,
					    	day = moment(commentaire.Date).format('D');

			    		chart.addAnnotation(Date.UTC(year, month, day), commentaire.valeur, commentaire.text);
		    		}

		    	}
	    	}
	    });
	}

	return chart;

}

// Fonctions asynchrones destinés à CipAnywhere

async function sendMailsCip(db, charts, clients){

	var promise = await loopChartCip(db, charts);

	if(promise){

		recursiveCipMail(0, clients, charts, db);

	}
}

async function loopChartCip(db, charts){

	const colors = require('../config.js').Config.couleurCip;

	for(chartData of charts){

		var chart = new Chart();

		chart.title = chartData["labelIndicateur"];
		
		var year = moment().startOf('isoweek').subtract(52, 'week').format('YYYY'),
	    	month = moment().startOf('isoweek').subtract(52, 'week').format('M') - 1,
	    	day = moment().startOf('isoweek').subtract(52, 'week').format('D'),
	    	dateStart = Date.UTC(year, month, day);

		var serie_Promise = await cip_DB.getChartData(db, chartData["idIndicateur"]).then(function(result){

	    	chart.addSerie(result.data, 'column', chartData["labelIndicateur"], colors[chartData["labelIndicateur"]], dateStart);
	    	
	    	for(commentaire of result.commentaires){

	    		if(commentaire.text != ""){
	    			var year = moment(commentaire.date).format('YYYY'),
				    	month = moment(commentaire.date).format('M') - 1,
				    	day = moment(commentaire.date).format('D');

		    		chart.addAnnotation(Date.UTC(year, month, day), commentaire.valeur, commentaire.text);
	    		}

	    	}

	    });

	    if(chartData["objectif"] != 0){
	    	chart.addPlotline("objectif", "red", chartData["objectif"]);
	    }

		var img = await highcharts.generateGraph(chart);

		fs.writeFile("tmpdir/CipAnywhere/" + db.name + '/' + chartData["idIndicateur"] + ".png", img, 'base64', function(err) {
		  	if(err){
		  		log.global.error(err);
		  	}
		  	log.chart.info("OK - Fichier : [CIP] " + db.name + " " + chartData["labelIndicateur"]);
		});
	}

	return true;
}

function chartCipListConvert(listToConvert, charts){

	var listToReturn = [];

	for (chart of charts){
		if(listToConvert[0][chart.labelIndicateur].split(";")[1] == 1){
			listToReturn.push(chart.idIndicateur);
		}
	}

	return Promise.resolve(listToReturn);

}

function recursiveCipMail(x, clients, charts, db){

	return new Promise(function(resolve, reject){

		cip_DB.getChartsFromClient(db, clients[x].idClient).then(function(listToConvert){

			chartCipListConvert(listToConvert, charts).then(function(listChart, emailClient){

				// Envoi du mail en incluant les graphiques
				mailer.setMailOptions(clients[x].email, "CipAnywhere", db.name, listChart);

				if( x < clients.length - 1) {
		    		recursiveCipMail(x + 1, clients, charts, db);
		    	}else{
		    		resolve();
		    	}

			});

		}).catch(function(err){
			reject(err);
		});
	});
};

function recursiveCheckMail(x, clients, charts, db){

	return new Promise(function(resolve, reject){

		if( x < clients.length) {

			check_DB.getChartsFromClient(db, clients[x].id).then(function(listChart){

				// Envoi du mail en incluant les graphiques
				if(listChart != null){
					mailer.setMailOptions(clients[x].Email, "CheckAnywhere", db.name, listChart);
				}

				if( x < clients.length) {
		    		recursiveCheckMail(x + 1, clients, charts, db);
		    	}else{
		    		resolve();
		    	}

			});
		}else{
    		resolve();
    	}

	});
};