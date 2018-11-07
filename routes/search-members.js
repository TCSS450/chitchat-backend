const express = require('express');
//Create a new instance of express router
var router = express.Router();
const db = require('../utilities/utils').db;


router.get("/", (req, res) => {
    const searchstring = req.query['searchstring'];
    if (searchstring) {
        db.any("SELECT nickname, firstname, lastname FROM Members")
            .then(rows => {
                res.send(rows);
            });
        /*res.send({
            //req.query is a reference to arguments in the url
            message: "Hello, " + req.query['searchstring'] + "!"
        });*/
    } else { // invalid searchstring parameter return error status code
        res.send({"status": 1});
    }
});
module.exports = router;
