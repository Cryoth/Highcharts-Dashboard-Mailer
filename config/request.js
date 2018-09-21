const db = require('./db.js');
const log = require('../lib/logs.js').chart;
var moment = require('moment');

module.exports = {

	check : {

		getListDestinataire: function(params){
			
			return new Promise(function(resolve, reject){
				database = db(params);
				database.query("SELECT id, Login, Email FROM Client WHERE SendDashboard = 1 AND Email <> '' ", function(err, result) {
			      if (err){
			      	log.error(err);
			      	return reject(err);
			      }else{
			      	resolve(result);
			      }
			    });

			    database.end();
			});

		},

		getChartsToSend: function(params){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT DISTINCT(`idModele`) AS Id, Nom, FormeGraph, Periode  FROM `Modele` INNER JOIN Client_Modele ON Modele.id = Client_Modele.idModele INNER JOIN Client ON Client_Modele.idClient = Client.id WHERE SendDashboard = 1', function(err, result) {
			      if (err) {
			      	log.error(err);
			      	return reject(err);
			      }else{
			      	resolve(result);
			      }
			    });

			    database.end();
			});

		},

		getChartsFromClient: function(params, idClient){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT DISTINCT(`idModele`) AS Id, Nom FROM `Modele` INNER JOIN Client_Modele ON Modele.id = Client_Modele.idModele INNER JOIN Client ON Client_Modele.idClient = Client.id WHERE Client_Modele.Actif = 1 AND Client.id = ? ORDER BY Client_Modele.Place', [idClient], function(err, result) {
			      if (err) {
			      	log.error(err);
			      	return reject(err);
			      }else{
			      	array = result.map(function(obj){
						return obj.Id;
					});
			      	resolve(array);
			      }
			    });

			    database.end();
			});

		},

		getChartSeries: function(params, chartId){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT * FROM Identificateur_Modele WHERE Modele_id = ?', [chartId], function(err, result) {
			      if (err) {
			      	log.error(err);
			      	return reject(err);
			      }else{
			      	resolve(result);
			      }
			    });

			    database.end();
			});

		},

		getSeriesData: function(params, monetaire, frequence, periode, data, idSerie){

			return new Promise(function(resolve, reject){
				database = db(params);

				var dateStart = moment().startOf('isoweek').subtract(periode, 'week').format("YYYY-MM-DD"),
					dateEnd = moment().format("YYYY-MM-DD"),
					query = "",
					parameters = [];

				database.query("SELECT IF(EXISTS(SELECT Commentaire FROM Commentaire WHERE id_Identificateur = ?), 1, 0) AS value", [idSerie], function(err, exist, fields){
					if(exist[0].value == 1){

						if(frequence == 1){
							query = "SELECT (data.val / freq.val) AS Valeur, data.Date AS Date, IF(data.Date = comment.Date, comment.Commentaire, '') AS commentaire "
								  + "FROM "
								  + "(SELECT Valeur AS val, Date FROM Valeur WHERE Date >= ? AND Date <= ? AND Periodicite = 2 AND Donnees_id IN (?) GROUP BY Date ORDER BY Date) data, "
								  + "(SELECT Date, SUM(Valeur) AS val FROM Valeur, Donnees WHERE Donnees.id = Valeur.Donnees_id AND Date >= ? AND Date <= ? AND Periodicite = 2 AND Donnees_id IN (SELECT id FROM Donnees WHERE id IN (SELECT idDenominateur FROM Donnee_Liaison WHERE idNominateur IN (?))) GROUP BY Date ORDER BY Date) freq ,"
								  + "(SELECT Date, Commentaire FROM Commentaire WHERE id_Identificateur = ? GROUP BY Date ORDER BY Date) comment "
								  +	"WHERE data.Date = freq.Date GROUP BY Date";
							parameters = [dateStart, dateEnd, data, dateStart, dateEnd, data, idSerie];
						}else{
							query = "SELECT DISTINCT(data.Valeur) AS Valeur, data.Date AS Date, IF(data.Date = comment.Date, comment.Commentaire, '') AS commentaire "
								  + "FROM "
			                      + "(SELECT Valeur, Date FROM Valeur WHERE Date >= ? AND Date <= ? AND Periodicite = 2 AND Donnees_id IN (?) GROUP BY Date ORDER BY Date) data, "
			                      + "(SELECT Date, Commentaire FROM Commentaire WHERE id_Identificateur = ? GROUP BY Date ORDER BY Date) comment GROUP BY Date";
			                parameters = [dateStart, dateEnd, data, idSerie];
						}
						
						database.query(query, parameters, function(err, result, fields){

							var arrayData = []
								arrayComment = [];

							if(typeof result !== 'undefined' && result){

								arrayData = result.map(function(obj){
									if(obj.Valeur < 0){
										if(obj.commentaire != ""){
											return {y: 0, color: 'white', borderColor: "black"};
										}else{
											return 0;
										}
									}else{
										if(obj.commentaire != ""){
											return {y: Math.round(obj.Valeur * 100) / 100, color: 'white', borderColor: "black"};
										}else{
											return Math.round(obj.Valeur * 100) / 100;
										}
									}
								});

								arrayComment = result.map(function(obj){
									if(obj.Valeur < 0){
										return {date: obj.Date, text: obj.commentaire, valeur: 0};
									}else{
										return {date: obj.Date, text: obj.commentaire, valeur: obj.Valeur};
									}
								});
							}

							if(arrayData.length < periode){
								arrayData = new Array((periode - arrayData.length) + 1).join('0').split('').map(parseFloat).concat(arrayData);
							}

							if (err){
								log.error(err);
								reject(err);
							}else{
								resolve({data: arrayData, commentaires: arrayComment});
							}

							database.end();
						});

					}else{

						if(frequence == 1){
							query = "SELECT (data.val / freq.val) AS Valeur "
								  + "FROM "
								  + "(SELECT Date, SUM(Valeur) AS val FROM Valeur WHERE Date >= ? AND Date <= ? AND Periodicite = 2 AND Donnees_id IN (?) GROUP BY Date ORDER BY Date) data, "
								  + "(SELECT Date, SUM(Valeur) AS val FROM Valeur, Donnees WHERE Donnees.id = Valeur.Donnees_id AND Date >= ? AND Date <= ? AND Periodicite = 2 AND Donnees_id IN (SELECT id FROM Donnees WHERE id IN (SELECT idDenominateur FROM Donnee_Liaison WHERE idNominateur IN (?))) GROUP BY Date ORDER BY Date) freq "
								  +	"WHERE data.Date = freq.Date";
							parameters = [dateStart, dateEnd, data, dateStart, dateEnd, data];
						}else{
							query = "SELECT SUM(Valeur) AS Valeur FROM Valeur WHERE Date >= ? AND Date <= ? AND Periodicite = 2 AND Donnees_id IN (?) GROUP BY Date ORDER BY Date";
			                parameters = [dateStart, dateEnd, data];
						}
						
						database.query(query, parameters, function(err, result, fields){

							var arrayData = [];

							if(typeof result !== 'undefined' && result){
								arrayData = result.map(function(obj){
									if(obj.Valeur < 0){
										return 0;
									}else{
										return (Math.round(obj.Valeur * 100) / 100);	
									}
								})
							}

							if(arrayData.length < periode){
								arrayData = new Array((periode - arrayData.length) + 1).join('0').split('').map(parseFloat).concat(arrayData);
							}

							if (err){
								log.error(err);
								reject(err);
							}else{
								resolve({data: arrayData, commentaires: null});
							}

							database.end();
						});
					}

					});

			});
		},
	},

	cip : {
		getListDestinataire: function(params){
			
			return new Promise(function(resolve, reject){
				database = db(params);
				database.query("SELECT idClient, login, email FROM iaaservices_clients WHERE subscriptionNewDashboard = 1 AND email <> ''", function(err, result) {
			      if (err) {
			      	log.error(err);
			      	return reject(err);
			      }else{
			      	resolve(result);
			      }
			    });

			    database.end();
			});

		},

		getListDestinataireManual: function(params){
			
			return new Promise(function(resolve, reject){
				database = db(params);
				database.query("SELECT idClient, login, email FROM iaaservices_clients WHERE subscriptionValidateDashboard = 1 AND email <> ''", function(err, result) {
			      if (err) {
			      	log.error(err);
			      	return reject(err);
			      }else{
			      	resolve(result);
			      }
			    });

			    database.end();
			});

		},

		getChartsToSend: function(params){

			return new Promise(function(resolve, reject){
				database = db(params);
				database.query('SELECT * FROM indicateur', function(err, result) {
			      if (err) {
			      	log.error(err);
			      	return reject(err);
			      }else{
			      	resolve(result);
			      }
			    });

			    database.end();
			});

		},

		getChartsFromClient: function(params, clientId){

			return new Promise(function(resolve, reject){

				database = db(params);

				database.query('SELECT * FROM iaaservices_config_indicateurs WHERE idClient = ?', [clientId], function(err, result) {
			      if (err) {
			      	log.error(err);
			      	return reject(err);
			      }else{
			      	resolve(result);
			      }
			    });
			    
			    database.end();
			});

		},

		getChartData: function(params, id){

			return new Promise(function(resolve, reject){
				database = db(params);
				dateStart = moment().startOf('isoweek').subtract(52, 'week').format("YYYY-MM-DD");

				var query = "SELECT valeur, commentaire, date_debut_semaine FROM indicateurs_calcules "
						  + "WHERE idIndicateur = ? "
						  + "AND date_debut_semaine >= ? "
						  + "ORDER BY date_debut_semaine";
				database.query(query, [id, dateStart], function(err, result){

					var arrayData = []
						arrayComment = [];

					if(typeof result !== 'undefined' && result){
						arrayData = result.map(function(obj){
							return (Math.round(obj.Valeur * 100) / 100);
						});

						arrayComment = result.map(function(obj){
							return {date: obj.date_debut_semaine, text: obj.commentaire, valeur: (Math.round(obj.Valeur * 100) / 100)};
						});
					}

					if(arrayData.length < 52){
						arrayData = new Array((52 - arrayData.length) + 1).join('0').split('').map(parseFloat).concat(arrayData);
					}

					if (err){
						log.error(err);
						reject(err);
					}else{
						resolve({data: arrayData, commentaires: arrayComment});
					}
				});

				database.end();
			});
		},
	}
}