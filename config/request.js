const db = require('./db.js');
var moment = require('moment');

module.exports = {

	check : {

		getListDestinataire: function(params){
			
			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT id, Login, Email FROM Client WHERE SendDashboard = 1', function(err, result) {
			      if (err) 
			      	return reject(err);
			      else
			      	resolve(result);
			    });

			    database.end();
			});

		},

		getChartsToSend: function(params){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT DISTINCT(`idModele`) AS Id, Nom, FormeGraph, Periode  FROM `Modele` INNER JOIN Client_Modele ON Modele.id = Client_Modele.idModele INNER JOIN Client ON Client_Modele.idClient = Client.id WHERE SendDashboard = 1', function(err, result) {
			      if (err) 
			      	return reject(err);
			      else
			      	resolve(result);
			    });

			    database.end();
			});

		},

		getChartsFromClient: function(params, idClient){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT DISTINCT(`idModele`) AS Id, Nom FROM `Modele` INNER JOIN Client_Modele ON Modele.id = Client_Modele.idModele INNER JOIN Client ON Client_Modele.idClient = Client.id WHERE Client_Modele.Actif = 1 AND Client.id = ?', [idClient], function(err, result) {
			      if (err) 
			      	return reject(err);
			      else
			      	array = result.map(function(obj){
						return obj.Id;
					})
			      	resolve(array);
			    });

			    database.end();
			});

		},

		getChartSeries: function(params, chartId){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT * FROM Identificateur_Modele WHERE Modele_id = ?', [chartId], function(err, result) {
			      if (err) 
			      	return reject(err);
			      else
			      	resolve(result);
			    });

			    database.end();
			});

		},

		getSeriesData: function(params, monetaire, frequence, periode, data){

			return new Promise(function(resolve, reject){
				database = db(params);

				var dateStart = moment().startOf('isoweek').subtract(periode, 'week').format("YYYY-MM-DD"),
					dateEnd = moment().format("YYYY-MM-DD");

				var query = "SELECT Valeur FROM Valeur "
	                      + "WHERE Date >= ? "
	                      + "AND Date <= ? "
	                      + "AND Periodicite = 2 "
	                      + "AND Donnees_id = ?"
	                      + "ORDER BY Date";
				database.query(query, [dateStart, dateEnd, data], function(err, result, fields){
					array = result.map(function(obj){
						return obj.Valeur;
					})

					if(array.length < periode){
						array = new Array((periode - array.length) + 1).join('0').split('').map(parseFloat).concat(array);
					}

					if (err)
						reject(err);
					else
						resolve(array);
				});

				database.end();
			});
		},

		getSerieComment: function(params, chartId){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT * FROM Identificateur_Modele WHERE Modele_id = ?', [chartId], function(err, result) {
			      if (err) 
			      	return reject(err);
			      else
			      	resolve(result);
			    });

			    database.end();
			});

		},
	},

	cip : {
		getListDestinataire: function(params){
			
			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT idClient, login, email FROM iaaservices_clients WHERE subscriptionNewDashboard = 1', function(err, result) {
			      if (err) 
			      	return reject(err);
			      else
			      	resolve(result);
			    });

			    database.end();
			});

		},

		getChartsToSend: function(params){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT * FROM indicateur', function(err, result) {
			      if (err) 
			      	return reject(err);
			      else
			      	resolve(result);
			    });

			    database.end();
			});

		},

		getChartData: function(params, id){

			return new Promise(function(resolve, reject){
				database = db(params);
				dateStart = moment().startOf('isoweek').subtract(52, 'week').format("YYYY-MM-DD");

				var query = "SELECT valeur FROM indicateurs_calcules "
						  + "WHERE idIndicateur = ? "
						  + "AND date_debut_semaine >= ? "
						  + "ORDER BY date_debut_semaine";
				database.query(query, [id, dateStart], function(err, result){
					var array = result.map(function(obj){
						return obj.valeur;
					});

					if (err)
						reject(err);
					else
						resolve(array);
				});

				database.end();
			});
		},
	}
}