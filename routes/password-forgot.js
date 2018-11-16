//express is the framework we're going to use to handle requests
const express = require('express');
//create connection to database
let db = require('../utilities/utils').db;
var router = express.Router();

let sendEmail = require('../utilities/utils').sendEmail;
let utility = require('../utilities/utils');

const bodyParser = require("body-parser");

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
// console.log("in password change");
router.post('/', (req, res) => {
    const user = req.body['user'];
    
    if (user) {

        // SELECT * FROM Members WHERE Email = 'joshua9@uw.edu' or nickname = 'nick';
        db.any("SELECT * FROM Members WHERE Email = $1 or nickname = $1", [user])
            .then(rows => {
				if (rows.length === 1) { // found 1 user
					console.log('is_verified=', rows[0].is_verified, 'compare result: ', rows[0].is_verified == true);
					// let result = rows[0].is_verified;
					// console.log(typeof(result));
					// console.log(result == 'true');
					if (rows[0].is_verified == true) { // user is verified
						console.log("is verified yes");
						let email = rows[0].email;
						let authNumber = Math.floor(1000 + Math.random() * 9000); 
						db.any("UPDATE Members SET verification = $1 WHERE memberid = $2", [authNumber, rows[0].memberid])
							.then(() => {
								console.log("seding email");
								utility.sendEmail(email, authNumber);
								res.send({"status": 1, "email": rows[0].email}); // password updated 
							}).catch(() => {
								res.send({"status": 4}); // This should not happen unless server crashes or something
							})
					} else { // user exists but is not verified
						res.send({"status": 3});
					}
                } else {
                    res.send({"status": 2}); // error user or nickname not found
                }
            })
            .catch(() => {
                res.send({"status": 4});
            })
    } else {
        res.send({"status": 4});
    }  
});
module.exports = router;


/*
ResetPassword  (forgot password)
Status: Implemented
Type: POST
EndPoint: https://group3-backend.herokuapp.com/password-reset
Input: Requires JSON containing email and password
	Ex: {“user”: “myemail@mydomail.com”} or  {“user”: “nickname”}
INPUT CONDITIONS:
User field in json 	
Sends an email to user email address with verification pin
Output Response: Returns a JSON object with status condition and email
Ex: {“status”: N, "email": email} 
	N can be numbers {1, 2, 3, 4}
		1- Successful email sent (load LoginForgotPassVerificationFrag -use verify
      endpoint to verify number entered)
		2- User doesn’t exist in DB
		3- User exists but user is not verified
		4- Incorrect Input to endpoint / any other error 
*/