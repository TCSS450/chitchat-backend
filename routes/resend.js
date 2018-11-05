const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
let sendEmail = require('../utilities/utils').sendEmail;


router.use(bodyParser.json());
router.post('/', (req, res) => {
    const email = req.body['email'];
    const numToChange = req.body['inputToken'];
    
    if (email && numToChange) {
        db.any("SELECT verification, is_verified, memberid FROM Members WHERE Email = $1", [email])
            .then(rows => {
                if (rows.length === 1) {
                    db.any("UPDATE Members SET verification = $1 WHERE Email = $2", [numToChange, email])
                        .then(rows => {
                            res.send({"status": 1});
                            sendEmail(email, numToChange);
                        })
                        .catch(() => {
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