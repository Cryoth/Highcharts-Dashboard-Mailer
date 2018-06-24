const dns = require('dns');
const ping = require('ping');
const log = require('../lib/logs.js').global;

module.exports = {
    internet: function() {

        checkInternet(function(isConnected) {
            if (isConnected) {
                log.info("[INTERNET] - CONNEXION => OK");
            } else {
                log.erreur("[INTERNET] - CONNEXION => ERREUR !");
            }
        });

    },

    serveurs: function(servers) {
        var allAlive = true;

        servers.forEach(function(server){
            ping.sys.probe(server.host, function(isAlive){
                if(isAlive){
                    log.info("[SERVEUR][" + server.name + "] IP:" + server.host + " - IS ALIVE => OK");
                }else{
                    log.erreur("[SERVEUR][" + server.name + "] IP:" + server.host + " - IS ALIVE => ERREUR !");
                    allAlive = false;
                }
            });
        });
    }
}

function checkInternet(cb) {

    dns.lookup('google.com',function(err) {
        if (err && err.code == "ENOTFOUND") {
            cb(false);
        } else {
            cb(true);
        }
    })

}