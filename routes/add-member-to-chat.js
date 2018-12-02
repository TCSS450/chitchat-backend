const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.post('/', (req, res) => {
    const memberids = req.body['memberids'];
    if (memberids.length > 0) {
        const query = ''
        db.any('')
    } else {
        res.send({"status" : 2});
    }
});
module.exports = router;
