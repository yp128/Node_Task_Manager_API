"use strict";
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'patelyash99138@gmail.com',
      pass: 'Sakshu@128'
    },
    tls: {
        rejectUnauthorized: false
    }
  });
  
  const welcomeMesssage = (email, name) => {
    transporter.sendMail({
            from: 'patelyash99138@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            text: `helloo ${name} That was easy!`
        });
  }

  module.exports = {
      welcomeMesssage
  }