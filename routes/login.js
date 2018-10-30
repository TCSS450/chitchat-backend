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
    let wasSuccessful = false;
    const toSend = {"status": 4};
    if(email && theirPw) {
        db.any("SELECT Password, Salt FROM Members WHERE Email=$1", [email])
            .then(row => {
                res.send({"rowCount": row.length});
            })
            .catch(() => { 
                //db.many expects 1 or more rows, if it get 0 rows we must catch error
                //If we get back zero rows then the credentials never existed in DB
                toSend.status = 2;
                res.send(toSend);
            });
    } else {
        res.send(toSend);
        /*res.send({
            success: false,
            message: 'missing credentials'
        });*/
    }
});
module.exports = router;