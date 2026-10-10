require("dotenv").config();                                              // loads .env

const nodemailer = require("nodemailer");                                // email library

// create transporter to talk to Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",                                                  // OAuth login
        user: process.env.EMAIL_USER,                                    // sender email
        clientId: process.env.CLIENT_ID,                                 // from Google Cloud
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});

// check if email config works on startup
transporter.verify((error, success) => {
    if (error) {
        console.log("Email server error:", error.message);
    } else {
        console.log("Email server is ready");
    }
});

// base function - sends any email
async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,        // sender name + email
            to: to,                                                      // recipient
            subject: subject,                                            // subject line
            text: text,                                                  // plain text version
            html: html                                                   // html version
        });

        console.log("Email sent:", info.messageId);
    } catch (error) {
        console.log("Error sending email:", error.message);              // don't crash on email fail
    }
}

// send welcome email after registration
async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to Backend Ledger!";

    const text = `Hello ${name},\n\n` +
                 `Thank you for registering at Backend Ledger. ` +
                 `We are excited to have you on board!\n\n` +
                 `Best regards,\nThe Backend Ledger Team`;

    const html = `<p>Hello ${name},</p>` +
                 `<p>Thank you for registering at Backend Ledger.</p>` +
                 `<p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);                     // call base function
}

// send email after successful transfer
async function sendTransactionEmail(userEmail, name, amount, toAccount, fromAccount) {
    const subject = "Transaction Successful";

    const text = `Hello ${name},\n\n` +
                 `Your transaction of ${amount} from account ${fromAccount} ` +
                 `to account ${toAccount} was successful.\n\n` +
                 `Best regards,\nThe Backend Ledger Team`;

    const html = `<p>Hello ${name},</p>` +
                 `<p>Your transaction of <b>${amount}</b> from account ` +
                 `<b>${fromAccount}</b> to account <b>${toAccount}</b> was successful.</p>` +
                 `<p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

// send email when a transaction fails
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = "Transaction Failed";

    const text = `Hello ${name},\n\n` +
                 `Your transaction of ${amount} to account ${toAccount} failed.\n` +
                 `Please try again or contact support.\n\n` +
                 `Best regards,\nThe Backend Ledger Team`;

    const html = `<p>Hello ${name},</p>` +
                 `<p>Your transaction of <b>${amount}</b> to account ` +
                 `<b>${toAccount}</b> failed.</p>` +
                 `<p>Please try again or contact support.</p>` +
                 `<p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};