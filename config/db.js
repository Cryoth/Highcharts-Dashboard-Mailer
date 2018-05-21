const mysql = require('mysql');

function connectDB(params){
	var connection = mysql.createConnection(params);

	connection.connect(function(err) {
	    if (err) throw err;
	});
	
	return connection;
}

module.exports = connectDB;