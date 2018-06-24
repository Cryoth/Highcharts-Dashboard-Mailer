const winston = require("winston");

const loggerChart = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: __dirname + '/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: __dirname + '/logs/chart.log' })
  ]
});

const loggerMail = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: __dirname + '/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: __dirname + '/logs/mail.log' })
  ]
});

const loggerGlobal = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: __dirname + '/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: __dirname + '/logs/global.log' })
  ]
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