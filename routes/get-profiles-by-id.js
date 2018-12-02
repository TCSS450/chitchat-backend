const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.post('/', (req, res) => {
    const chatmembers = req.body['chatmembers'];
    if (chatmembers && chatmembers.length > 0) {
        let query = 'SELECT memberid, email, firstname, lastname, nickname, phone_number, display_type FROM Members WHERE ' + 
            'is_verified = true AND memberid = ' + chatmembers[0];
        for (let i = 1; i < chatmembers.length; i++) {
            query += (' OR memberid = ') + chatmembers[i];
        }
        db.any(query)
            .then(rows => {
                res.send({"status": 1, "profiles": rows});
            }).catch(() => {res.send({"status" : 2})})
    } else {
        res.send({"status" : 2});
    }
});
module.exports = router;
