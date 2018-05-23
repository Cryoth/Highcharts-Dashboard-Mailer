
module.exports = class {
	constructor(type = "column", title = "", subtitle = "", series = []){
		
		this.chart = {"type": type};
		this.title = {"text": title};
		this.subtitle = {"text": subtitle};
		this.series = series;

	}

	get Title(){
		return this.title.text;
	}

	set Title(title){
		this.title.text = title;
	}

	get Subtitle(){
		return this.subtitle.text;
	}

	set Subtitle(subtitle){
		this.subtitle.text = subtitle;
	}

	get Series(){
		return this.series;
	}

	set Series(series){
		if(series.isArray()){
			this.series = series;	
		}else{
			throw new Error('set series only accept array of data !');
		}
		
	}

	addSeriesData(data){
		if(series.isArray()){
			this.series.push(data);
		}else{
			throw new Error('addSeriesData function only accept array of data as parameters !');
		}
	}

}