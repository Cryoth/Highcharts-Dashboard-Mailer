const customCode = require('./config/customCode.js');

var weekFormat = false;

module.exports = class {
	constructor(format = "png", title = "", subtitle = "", series = []){
		
		this.outfile = "./test.png";
		this.type = format;
		this.options = {};
		this.options.title = {"text": title};
		this.options.subtitle = {"text": subtitle};
		this.options.series = series;
		this.options.xAxis = {};
		this.options.yAxis = {};
		this.options.yAxis.plotLines = [];
		this.options.annotations =  [{
								        labels: [{
								            point: { x: 52, y: 0 },
								            text: 'Label'
								        }]
								    }];
		this.customCode = "";
	}

	get title(){
		return this.options.title.text;
	}

	set title(title){
		this.options.title.text = title;
	}

	get subtitle(){
		return this.options.subtitle.text;
	}

	set subtitle(subtitle){
		this.options.subtitle.text = subtitle;
	}

	get allSeries(){
		return this.options.series;
	}

	set allSeries(series){
		if(Array.isArray(series)){
			this.options.series = series;
		}else{
			throw new Error('set series only accept array of data !');
		}
		
	}

	addSerie(data, type = 'column', name = '', color = '#00BFFF', dateDepart = false){
		if(Array.isArray(data)){
			if(!dateDepart){
				var serie = {
					type: type,
					name: name,
					color: color,
					data: data
				}
			}else{
				this.dateToWeek();
				var serie = {
					type: type,
					name: name,
					color: color,
					data: data,
					pointInterval: 7 * 24 * 36e5,
					pointStart: dateDepart
				}
			}
			
			this.options.series.push(serie);
		}else{
			throw new Error('addSerieAsLine function only accept array as first parameter !');
		}
	}

	addPlotline(text, color, value){
		this.options.yAxis.plotLines.push({
			color: color,
			value: value,
			width: 2,
			label: {
				text: text + " (" + value + ")",
			}
		});
	}

	dateToWeek(){
		this.options.xAxis = {
						        type: 'datetime',
						        tickInterval: 7 * 24 * 36e5, // une semaine
						        labels: {
						            format: '{value:Semaine %W}',
						            align: 'right'
						        }
						    };
		this.customCode = customCode.week;
	}

	toString(){
		return JSON.stringify(this);
	}

}