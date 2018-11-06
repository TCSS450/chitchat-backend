//express is the framework we're going to use to handle requests
const express = require('express');

//We use this create the SHA256 hash
const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;
let getHash = require('../utilities/utils').getHash;
let sendEmail = require('../utilities/utils').sendEmail;
let utility = require('../utilities/utils');
var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    res.type("application/json");

    //Retrieve data from query params
    let email = req.body['email'];
    let password = req.body['password'];
    let nickname = req.body['nickname'];
    let first = req.body['first'];
    let last = req.body['last'];
    let phoneNumber = req.body['phoneNumber'];
    let displayType = req.body['displayType'];
    let authNumber = Math.floor(1000 + Math.random() * 9000); 

    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(email && password && nickname && first && last 
        && phoneNumber && displayType) {


        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);
        let params = [first, last, email, salted_hash, salt, authNumber, nickname, false, displayType, phoneNumber];

        db.any("SELECT email, is_verified FROM Members WHERE email = $1", [email])
            .then(rows => {
                if (rows.length > 0) { // Member with email already exists in DB
                    res.send({"status": (rows[0].is_verified) ? 3 : 2});
                } else if (rows.length === 0) { // Email is not in DB, but we need to check for duplicate NN
                    db.any("SELECT nickname FROM Members WHERE nickname = $1", [nickname]) 
                        .then(rows => {
                            if (rows.length === 0) { // nickname does not exists, attempt to verification mail to user
                                if (utility.isEmailValid(email)) { // email is valid
                                    db.any(`INSERT INTO Members (firstname, lastname, email, password,
                                         salt, verification, nickname, is_verified, display_type, phone_number) VALUES 
                                         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, params)
                                         .then(() => {
                                            utility.sendEmail(email, authNumber);
                                            res.send({"status": 1});
                                         })
                                         .catch(() => {
                                            res.send({"status": 6});
                                         })
                                } else  { // email is not valid, ask for another email address
                                    res.send({"status": 5});
                                }
                            } else if (rows.length > 0) { // nickname already exists, ask user for another nickname
                                res.send({"status": 4});
                            }
                        })
                        .catch(() => {
                            res.send({"status": 6});
                        })
                }
            })
    } else {
        res.send({"status": 6});
    }
    /*1- Register Successful (Tell User to verify, send authNumber to their email)
        2- Email already exists without verification (Prompt user to verify)
        3- Email already exists with verification (Tell user to login)
        4- Nickname already exists (tell user to provide another nickname)
        5- Email is invalid (prompt user to enter a valid email)
        6- Incorrect Input to endpoint / any other error*/
});

module.exports = router;
