const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const log = require('../lib/logs.js').mail;
const moment = require('moment');

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

	setMailOptions : function(email, type, listImg){

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
	            return console.log(error);
	        }
	        console.log('Message sent: %s', info.messageId);
	        // Preview only available when sending through an Ethereal account
	        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

	        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
	    });
	}
}