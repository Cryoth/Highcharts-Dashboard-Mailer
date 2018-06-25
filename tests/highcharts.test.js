const highcharts = require('../lib/highcharts.js');
const basicChart = require('./Modele/basicChart.js');
const bigChart = require('./Modele/bigChart.js');

test("Chart - Test sur création d'un graphique basic", () => {
	var img = highcharts.generateGraph(basicChart);
	expect(img).not.toBeNull();
	expect(img).not.toBe("");
});

test("Chart - Test sur création d'un plus grand graphique", () => {
	var img = highcharts.generateGraph(bigChart);
	expect(img).not.toBeNull();
	expect(img).not.toBe("");
});