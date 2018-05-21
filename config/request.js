var db = require('./db.js');

module.exports = {

	getListDestinataire: function(params){
		database = db(params);
		database.query('SELECT id, Login, Email FROM Client WHERE SendDashboard = 1', function(err, result) {
	      if (err) throw err;
	      console.log(result);
	      return result;
	    });

	    database.end();
	},

	getChartsToSend: function(params){
		database = db(params);
		database.query('SELECT DISTINCT(`idModele`) FROM `Client_Modele` INNER JOIN Client ON Client_Modele.idClient = Client.id WHERE SendDashboard = 1', function(err, result) {
	      if (err) throw err;
	      console.log(result);
	      return result;
	    });

	    database.end();
	},
}