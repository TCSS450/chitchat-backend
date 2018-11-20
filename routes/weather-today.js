// weatherbit.io API KEY : 664bd258dd834025a742c18a03ddd8d6

const API_KEY = '664bd258dd834025a742c18a03ddd8d6';
//express is the framework we're going to use to handle requests
const express = require('express');
let db = require('../utilities/utils').db; // not needed
var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.get('/', (req, res) => {
    const userA = req.body['userAId'];

    if (userA) {
        db.any()
            .then(row => {
                res.send({"sucess": true});
                console.log("deleted friend");
            }).catch((error) => {
                res.send({"success": false});
                console.log("catch error: ", error);
            })
    } else { // did not supply right parameters
        res.send({"success": false});
    }
});
module.exports = router;
