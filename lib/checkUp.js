const dns = require('dns');
const ping = require('ping');
const fs = require('fs');
const log = require('../lib/logs.js').global;

module.exports = {
    internet: function() {

        checkInternet(function(isConnected) {
            if (isConnected) {
                log.info("[INTERNET] - CONNEXION => OK");
            } else {
                log.error("[INTERNET] - CONNEXION => ERREUR !");
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
                    log.error("[SERVEUR][" + server.name + "] IP:" + server.host + " - IS ALIVE => ERREUR !");
                    allAlive = false;
                }
            });
        });
    },

    dossiers: function(servers) {
        if (!fs.existsSync('./tmpdir')){
            log.info("Création du dossier tmpdir !");
            fs.mkdirSync('./tmpdir');
        }

        Object.keys(servers).forEach(function(key) {
            var array = servers[key];
            if (!fs.existsSync('./tmpdir/' + key)){
                log.info("Création du fichier tmpdir/" + key + " !");
                fs.mkdirSync('./tmpdir/' + key);
            }
            
            for(server of array){
                if (!fs.existsSync('./tmpdir/' + key + '/' + server.name)){
                    log.info("Création du fichier tmpdir/" + key + "/" + server.name + " !");
                    fs.mkdirSync('./tmpdir/' + key + '/' + server.name);
                }
            }
        });

        log.info("Tous les dossiers tmp sont présent.");
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