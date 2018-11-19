//Get the connection to Heroku Database
let db = require('./sql_conn.js');
let admin = require('./firebase_services.js').admin;
let fcm_functions = require('./firebase_services.js').fcm_functions;

//We use this create the SHA256 hash
const crypto = require("crypto");

var nodemailer = require('nodemailer');

var validator = require('validator');
 

function isEmailValid(email) {
    console.log("inside isEmailValid(), email is: " + validator.isEmail(email) + " " + email);
    return validator.isEmail(email);
}

function getSenderStringByDisplayType(senderId) {
    console.log("display type extract method");
    db.any("SELECT * Members WHERE memberid = $1", [senderId])
        .then(rows => {
            if (rows[0].display_type === 1) { // nickname
                return rows[0].nickname;
            } else if (rows[0].display_type === 2) { // full name
                return rows[0].firstname + " " + rows[0].lastname;
            } else { // email
                return rows[0].email;
            }
        }).catch(() => {return -1})
}

function utilityGetTokenForRecipient(recipientId) {
    console.log("In method?");
    var result = -1;
    var getToken = async () => {
        await db.any("SELECT * FROM FCM_Token WHERE memberid = $1", [recipientId])
        .then(row => {
            console.log("in then");
            console.log(row);
            console.log(row[0].token);
            result = row[0].token;
        }).catch(() => {result = -1})
    }
    getToken()
        .then(() => {
            return result;
        })
}

function sendEmail(receiver, verificationCode) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            //TODO Make these Heroku Variables
            user: "cc.chitchatbot@gmail.com",
            pass: "_1134206!"
        }
      });
      
      var mailOptions = {
        from: 'cc.chitchatbot@gmail.com',
        to: receiver,
        subject: 'Welcome to Chit Chat!',
        text: 'Please verify your account using the code: ' + verificationCode
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

/**
 * Method to get a salted hash.
 * We put this in its own method to keep consistency
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
function getHash(pw, salt) {
    return crypto.createHash("sha256").update(pw + salt).digest("hex");
}


module.exports = { 
    db, getHash, sendEmail, isEmailValid, admin, fcm_functions, getSenderStringByDisplayType, utilityGetTokenForRecipient
};
