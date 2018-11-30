const express = require('express');
let db = require('../utilities/utils').db;
let utility = require('../utilities/utils');
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.post('/', (req, res) => {
    res.type("application/json");
    const email = req.body['email'];
    const memberid = req.body['memberid'];
    const defaultReturn = {"status": 3};
    if (email && memberid) {
        db.any("SELECT firstname, lastname FROM members WHERE memberid = $1", [memberid])
            .then(rows => {
                if (rows.length === 1) {
                    db.any("SELECT email FROM members WHERE email = $1", [email])
                        .then(secRows => {
                            if (secRows.length === 0) {
                                utility.sendReferalEmail(email, rows[0].firstname + ' ' + rows[0].lastname);
                                res.send({"status": 1});
                            } else {
                                res.send({"status": 2});
                            }
                        }).catch(() => {res.send(defaultReturn)})
                } else {
                    res.send(defaultReturn);
                }
            }).catch(() => {res.send(defaultReturn)})
    } else {
        res.send(defaultReturn);
    }
});
module.exports = router;