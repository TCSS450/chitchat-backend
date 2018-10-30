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

router.post('/', (req, res) => {
    let email = req.body['email'];
    let theirPw = req.body['password'];
    if(email && theirPw) {
        db.any("SELECT Password, Salt FROM Members WHERE Email=$1", [email])
            .then(row => { // if query execution is valid
                if (row.length === 0) { // no rows returned
                    res.send({"status" : 2});
                } else  if (row.length === 1) { // single row returned
                    let salt = row[0].salt;
                    let ourSaltedHash = row[0].password; 
                    let theirSaltedHash = getHash(theirPw, salt); 
                    const wasCorrectPw = ourSaltedHash === theirSaltedHash; 
                    res.send({"status": (wasCorrectPw) ? 1 : 3});
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