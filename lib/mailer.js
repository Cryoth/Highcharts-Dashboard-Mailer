const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const log = require('../lib/logs.js').mail;
const moment = require('moment');
const path = require('../config.js').Config.pathStatic;

var transporter = nodemailer.createTransport(smtpTransport({
    					host: 'smtp.auth.orange-business.com',
					    port: 587,
					    auth: {
					        user: 'guillaume.schneyder@bleuzevs.fr.fto',
					        pass: 'Gu12l0m3'
					    }
					}));

module.exports = {

	setMailOptions : function(email, type, client, listImg){

		var html = "", attachments = [];

		for (img of listImg){
			html += '<img src="cid:imgNumber' + img + '"/>';
			attachments.push({
		        filename: 'image.png',
		        path: './tmpdir/' + type + "/" + client + "/" + img + '.png',
		        cid: 'imgNumber' + img
		    });
		}

		// Configuration des options du mail
	    var mailOptions = {
	        from: 'cipanywhere@iaaservices.com', // emetteur du mail
	        to: email, // destinataire du mail
	        subject: 'Rapport Hebdomadaire de consommation ' + type + ' ' + client + ' : Semaine ' + moment().format("W"), // Objet du mail
	        text: '', // corps du mail en text plein
	        html: html, // corps du mail en html
	        attachments: attachments
	    };

	     // Envoi du mail avec l'bjet de transport défini
	    transporter.sendMail(mailOptions, (error, info) => {
	        if (error) {
	        	log.error(error);
	            return error;
	        }else{
	        	log.info('Message envoyé à : ' + mailOptions.to + ' ' + client);
	        }
	    });

	},

}