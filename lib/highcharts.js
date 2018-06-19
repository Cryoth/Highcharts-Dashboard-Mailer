const exporter = require('highcharts-export-server');


module.exports = {

	generateGraph : function(params){

		return new Promise(function(resolve, reject){

			//Set up a pool of PhantomJS workers
			exporter.initPool();

			exporter.export(params, function (err, res) {

			    //The export result is now in res.
			    //If the output is not PDF or SVG, it will be base64 encoded (res.data).
			    //If the output is a PDF or SVG, it will contain a filename (res.filename).
			    exporter.killPool();
			    resolve(res.data);

			});
		});
	},
}