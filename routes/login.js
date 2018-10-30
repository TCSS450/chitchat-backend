//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    let email = req.body['email'];
    let theirPw = req.body['password'];
    const toSend = {"status": 4};
    if(email && theirPw) {
        db.any("SELECT Password, Salt FROM Members WHERE Email=$1", [email])
            .then(row => { // if query execution is valid
                console.log("Entered the Query!");
                if (row.length === 0) { // no rows returned
                    toSend.status = 2;
                } else  if (row.length === 1) { // single row returned
                    console.log("HERE 2");
                    //toSend.status = row;
                    let salt = row['salt'];
                    //Retrieve our copy of the password
                    let ourSaltedHash = row['password']; 
                    //Combined their password with our salt, then hash
                    let theirSaltedHash = getHash(theirPw, salt); 
                    //Did our salted hash match their salted hash?
                    const wasCorrectPw = ourSaltedHash === theirSaltedHash; 
                    console.log(wasCorrectPw);
                    toSend.status = (wasCorrectPw) ? 1 : 3;
                }
            })
            .catch(() => {
                toSend.status = 100;
            })
    } 
    res.send(toSend);
});
module.exports = router;