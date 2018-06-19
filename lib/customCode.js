//Scripts à executer dans customCode de la fonction Highcharts Export

// Ajoute les numéros de semaine à la liste des format de date possible
module.exports.week = "function(){Highcharts.dateFormats = { W: function (timestamp) { var date = new Date(timestamp), day = date.getUTCDay() === 0 ? 7 : date.getUTCDay(), dayNumber; date.setDate(date.getUTCDate() + 4 - day); dayNumber = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 1, -6)) / 86400000); return 1 + Math.floor(dayNumber / 7);}}}()";