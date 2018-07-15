const winston = require("winston");

const loggerChart = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD hh:mm:ss'
            }),
            winston.format.json()
          ),
  transports: [
    new winston.transports.File({ filename: __dirname + '/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: __dirname + '/logs/chart.log' })
  ], timestamp: true
});

const loggerMail = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD hh:mm:ss'
            }),
            winston.format.json()
          ),
  transports: [
    new winston.transports.File({ filename: __dirname + '/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: __dirname + '/logs/mail.log' })
  ], timestamp: true
});

const loggerGlobal = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD hh:mm:ss'
            }),
            winston.format.json()
          ),
  transports: [
    new winston.transports.File({ filename: __dirname + '/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: __dirname + '/logs/global.log' })
  ], timestamp: true
});

if (!process.env.NODE_ENV || process.env.NODE_ENV == "developpement") {

  loggerChart.add(new winston.transports.Console({
    format: winston.format.simple()
  }));

  loggerMail.add(new winston.transports.Console({
    format: winston.format.simple()
  }));

  loggerGlobal.add(new winston.transports.Console({
    format: winston.format.simple()
  }));

}

module.exports = {
	chart : loggerChart,
	mail : loggerMail,
  global : loggerGlobal,
}