const exporter = require('highcharts-export-server');
const log = require('../lib/logs.js').chart;

module.exports = {

	generateGraph : function(params){

		return new Promise(function(resolve, reject){

			//Set up a pool of PhantomJS workers
			exporter.initPool();
			
			exporter.export(params, function (err, res) {

			    if(err){
			    	log.error(err);
			    }
			    
			    exporter.killPool();
			    resolve(res.data);

			});
		});
	},
}