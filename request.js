var db = require('./db.js');

//Exemple de connection
function requete(params){
	database = db(params);
	database.query('SELECT 1 + 1 AS value', function(err, result) {
      if (err) throw err;
      console.log(result[0]);
    });

    database.end();
}

module.exports = requete;