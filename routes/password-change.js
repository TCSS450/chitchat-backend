//express is the framework we're going to use to handle requests
const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();
let getHash = require('../utilities/utils').getHash;

const bodyParser = require("body-parser");

//We use this create the SHA256 hash
const crypto = require("crypto");

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
// console.log("in password change");
router.post('/', (req, res) => {
    const user = req.body['user'];
    const password = req.body['password'];
    
    if (user && password) {

        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);

        // SELECT * FROM Members WHERE Email = 'joshua9@uw.edu' or nickname = 'nick';
        db.any("SELECT * FROM Members WHERE Email = $1 or nickname = $1", [user])
            .then(rows => {
                if (rows.length === 1) {
         
                    db.any("UPDATE Members SET password = $1, salt = $2 WHERE memberid = $3", 
                                                                [salted_hash, salt, rows[0].memberid])
                        .then(() => {
                            res.send({"status": 1}); // password updated 
                        }).catch(() => {
                            res.send({"status": 2}); // This should not happen unless server crashes or something
                        })
 
                } else {
                    res.send({"status": 2}); // error user or nickname not found
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




/*
ChangePassword
Status: Not Implemented
Constraint: only present to logged in users
Type: POST
EndPoint: https://group3-backend.herokuapp.com/password-change
Input: Requires JSON containing email of verified user and the new password
	Ex: {“user “myemail@mydomail.com”, "password": password}  or  {“user”: “nickname”, "password": password}
INPUT CONDITIONS:
User field in json 
Email or nickname is a verified user
Output Response: Returns a JSON object with status condition
Ex: {“status”: N} 
	N can be numbers {1, 2 }
		1- Successful password change
        2- Incorrect Input to endpoint / any other error 
*/