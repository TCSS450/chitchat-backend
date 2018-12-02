const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
const request = require('request');

router.use(bodyParser.json());
router.post('/', (req, res) => {
    const memberids = req.body['memberids'];
    const chatid = req.body['chatid'];
    res.send("Not Implemented Yet");
    /*request.post({
        url:'https://group3-backend.herokuapp.com/create-chat',
        form: {
            chatmembers: memberids,
            chatname: 'test'
        }},
        function(err,httpResponse,body) {
            console.log(err, httpResponse, body);
        });*/
});
module.exports = router;
