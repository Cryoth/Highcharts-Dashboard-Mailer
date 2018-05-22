var db = require('./db.js');

module.exports = {

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

	getSeriesData: function(params){
		database = db(params);
		database.query('', [chartId], function(err, result){
			if (err) throw err;
			return result;
		});
	},
}