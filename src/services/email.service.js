require('dotenv').config();
const nodemailer = require('nodemailer');

// for communicating with google server   transporter is created 

const transporter = nodemailer.createTransport({      
  service: 'gmail',
  auth: {                            // on the basics of these properties
    type: 'OAuth2',
    user: process.env.EMAIL_USER,        
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"backend-ledger" <${process.env.EMAIL_USER}>`,      // sender address
      to,                                                       // list of receivers
      subject,                                                 // Subject line
      text,                                                   // plain text body
      html,                                                  // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail,name){

    const subject  = "welcome to backend-ledger!";
    const text = `Hello ${name},\n\n Thank you for registering at backend-ledger.
                We're  exicted to have you on board! \n\n Best regards, \n The Backend ledger Team `;

    const html =`<p> Hello ${name},</p> <p>Thank you for registering at Backend-ledger </p>`          

    await sendEmail(userEmail, subject, text, html) ;

}

async function sendTransactionEmail(userEmail,name,amount,toAccount) {

 const subject = 'Transaction Successfull';
 const text =`Hello ${name}, \n\n Your transaction of $${amount} to account ${toAccount} was sucessfull. \n\n\ Best regards ,\n The Backend Team`;

 const html =`<p>Hello ${name},</p><p> Your transaction of $${amount} to account ${toAccount}. \n\n\ Best regards ,\n The Backend Team`; 

 await sendEmail ( userEmail, subject, text, html) ; 
}

async function sendTransactionfailureEmail(userEmail,name,amount,toAccount) {

 const subject = 'Transaction failed';
 const text =`Hello ${name}, \n\n Your transaction of $${amount} to account ${toAccount} was failed . \n\n\ Best regards ,\n The Backend Team`;

 const html =`<p>Hello ${name},</p><p> Your transaction of $${amount} to account ${toAccount}. \n\n\ Best regards ,\n The Backend Team`; 

 await sendEmail ( userEmail, subject, text, html) ; 
}



module.exports = {sendRegistrationEmail,
                  sendTransactionEmail,
                  sendTransactionfailureEmail  } ;