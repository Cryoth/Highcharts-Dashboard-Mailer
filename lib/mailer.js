const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const log = require('../lib/logs.js').mail;
const moment = require('moment');
const path = require('../config.js').Config.pathStatic;

var transporter = nodemailer.createTransport(smtpTransport({
    					host: 'smtp.auth.orange-business.com',
					    port: 587,
					    auth: {
					        user: 'cipanywhere@iaaservices.com',
					        pass: 'C1pAnywh3r3'
					    }
					}));

var mailOptions;

module.exports = {

	setMailOptions : function(email, type, client, listImg){

		var html = "", attachments = [];

		if(email.includes("gmail")){
			for (img of listImg){
				html += '<img src="cid:imgNumber' + img + '"/>';
				attachments.push({
			        filename: 'image.png',
			        path: './tmpdir/' + type + "/" + img + '.png',
			        cid: 'imgNumber' + img
			    });
			}
		}else{
			for (img of listImg){
				html += "<img src='http://" path + "/" + type + "/" + client + "/" + img + ".png'/>";
			}
		}

		// Configuration des options du mail
	    mailOptions = {
	        from: 'cipanywhere@iaaservices.com', // emetteur du mail
	        to: email, // destinataire du mail
	        subject: 'Rapport Hebdomadaire de consommation ' + type + ' : Semaine ' + moment().format("W"), // Objet du mail
	        text: '', // corps du mail en text plein
	        html: html, // corps du mail en html
	        attachments: attachments
	    };
	},

	sendMail : function(){

	    // Envoi du mail avec l'bjet de transport défini
	    transporter.sendMail(mailOptions, (error, info) => {
	        if (error) {
	        	log.error(error);
	            return error;
	        }
	        log.info('Message envoyé à : ' + mailOptions.to);
	    });
	}
}