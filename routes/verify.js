//express is the framework we're going to use to handle requests
const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
router.post('/', (req, res) => {
    const email = req.body['email'];
    const inputedNumber = req.body['inputToken'];
    
    if (email && inputedNumber) {
        db.any("SELECT verification, is_verified, memberid FROM Members WHERE Email = $1", [email])
            .then(rows => {
                if (rows.length === 1) {
                    if (rows[0].verification != inputedNumber) { // numbers don't match
                        res.send({"status": 2});
                    } else { // inputed verification matched thats in the DB
                        db.any("UPDATE Members SET is_verified = true WHERE memberid = $1", [rows[0].memberid])
                            .then(() => {
                                res.send({"status": 1});
                            }).catch(() => {
                                res.send({"status": 3}); // This should not happen unless server crashes or something
                            })
                    }
                } else {
                    res.send({"status": 3});
                }
            })
            .catch(() => {
                res.send({"status": 3});
            })
    } else {
        res.send({"status": 3});
    }  
});
module.exports = router;