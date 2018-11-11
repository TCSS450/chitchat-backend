//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;
let sendEmail = require('../utilities/utils').sendEmail;
let utility = require('../utilities/utils');
var router = express.Router();

const bodyParser = require("body-parser");

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
router.post('/', (req, res) => {
    const email = req.body['email'];
    // console.log("in newPin");
    if (email) {
        // console.log("email is valid");
        // console.log(email);
        db.any("SELECT memberid, verification, nickname, email, phone_number FROM Members WHERE Email = $1 or nickname = $1", [email])
            .then(rows => {
                if (rows.length == 1) {
                    // console.log(rows[0]);
                    let authNumber = Math.floor(1000 + Math.random() * 9000); 
                    db.any("UPDATE Members SET verification = $1 WHERE memberid = $2", [authNumber, rows[0].memberid])
                            .then(() => { 
                                // console.log("send email?");
                                utility.sendEmail(rows[0].email, authNumber);
                                res.send(
                                    {"status": 1, "email": email, 
                                     "nickname": rows[0].nickname, "phone_number": rows[0].phone_number
                                    });
                            }).catch(() => {
                                // console.log("catch after sql ");
                                res.send({"status": 2});
                        })
                } else {
                    res.send({"status": 2});
                }
            })
            .catch(() => {
                res.send({"status": 2});
            })
    } else {
        res.send({"status": 2});
    }  
});

module.exports = router;
