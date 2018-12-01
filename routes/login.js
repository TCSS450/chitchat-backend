//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;
let getHash = require('../utilities/utils').getHash;
var router = express.Router();
const bodyParser = require("body-parser");
const crypto = require("crypto");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
        /*
	    1- Successful Login
		2- Email/NN doesn’t exist in DB (prompt user to register)
		3- Email/NN exists in DB, but password was incorrect (tell user to re-enter pass)
        4- Email/NN exists, but user is still not verified
        5- Incorrect Input to endpoint / any other error */

        
router.post('/with_token', (req, res) => {
    const emailNN = req.body['email'];
    const token = req.body['token'];
    const theirPw = req.body['password'];
    if (emailNN && theirPw && token) {
        db.any("SELECT MemberID, email, firstname, lastname, phone_number, display_type, Password, Salt, nickname, is_verified FROM Members WHERE Email=$1 OR Nickname=$1", [emailNN])
            .then(row => { //if query execution is valid
                if (row.length === 0) { // Email or NN DNE in DB
                    res.send({"status" : 2});
                } else if (row.length === 1) { // single row returßned
                    if (row[0].is_verified) { // if that account is verified
                        let salt = row[0].salt;
                        let ourSaltedHash = row[0].password; 
                        let theirSaltedHash = getHash(theirPw, salt); 
                        const wasCorrectPw = ourSaltedHash === theirSaltedHash;                        
                        if (wasCorrectPw) {    
                            //password and email match. Save the current FB Token
                            let id = row[0].memberid;
                            let params = [id, token];
                            console.log(row);

                            db.manyOrNone('INSERT INTO FCM_Token (memberId, token) VALUES ($1, $2) ON CONFLICT (memberId) DO UPDATE SET token = $2; ', params)
                                .then(() => {
                                    res.send({
                                        "status": 1,
                                        "memberProfile": {
                                            "memberid": row[0].memberid,
                                            "email": row[0].email,
                                            "firstname": row[0].firstname,
                                            "lastname": row[0].lastname,
                                            "nickname": row[0].nickname,
                                            "display_type": row[0].display_type,
                                            "phone_number": row[0].phone_number
                                        }
                                    });
                                })
                                .catch(err => {
                                    res.send({
                                        success: false,
                                        message: err,
                                    });
                                })
                        } else { // incorrect password
                            res.send({
                                "status": 3,
                                "memberId": row[0].memberid
                            })
                        }  
                    } else { // user not verified
                        res.send({"status": 4});
                    }
                }
            })
            .catch(() => {
                res.send({"status" : 5});
            });
    } else {
        res.send({"status" : 5});
    }
});

/*
router.post('/', (req, res) => {
    const emailNN = req.body['email'];
    const theirPw = req.body['password'];
    if (emailNN && theirPw) {
        db.any("SELECT Password, Salt, is_verified FROM Members WHERE Email=$1 OR Nickname=$1", [emailNN])
            .then(row => { //if query execution is valid
                if (row.length === 0) { // Email or NN DNE in DB
                    res.send({"status" : 2});
                } else if (row.length === 1) { // single row returned
                    if (row[0].is_verified) { // if that account is verified
                        let salt = row[0].salt;
                        let ourSaltedHash = row[0].password; 
                        let theirSaltedHash = getHash(theirPw, salt); 
                        const wasCorrectPw = ourSaltedHash === theirSaltedHash; 
                        console.log(theirPw);
                        res.send({"status": (wasCorrectPw) ? 1 : 3});
                    }
                    else { // Email or NN exists in DB but unverified account
                        console.log(row[0].is_verified);
                        console.log(row);
                        res.send({"status" : 4});
                    }
                }
            })
            .catch(() => {
                res.send({"status" : 5});
            });
    } else {
        res.send({"status" : 5});
    }
});*/


module.exports = router;
