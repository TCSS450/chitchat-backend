//express is the framework we're going to use to handle requests
const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
router.post('/', (req, res) => {
    const memberid = req.body['memberid'];
    const displayType = req.body['displayType'];
    const query = 'UPDATE Members SET display_type = $1 WHERE memberid = $2';
    if (memberid && displayType) {
        db.any(query, [displayType, memberid])
            .then(() => {
                res.send({"status": 1});
            }).catch(() => {
                res.send({"status": 2});
            })
    } else {
        res.send({"status": 2});
    }
});
module.exports = router;