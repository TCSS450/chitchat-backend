const express = require('express');
//Create a new instance of express router
var router = express.Router();
const db = require('../utilities/utils').db;


router.get("/", (req, res) => {
    const searchstring = req.query['searchstring'];
    if (searchstring) {
        db.any("SELECT nickname, firstname, lastname, email FROM Members WHERE is_verified = true") // we only want verified users
            .then(rows => {
                let result = [];
                for (let i = 0; i < rows.length; i++) {
                    const fullName = (rows[i].firstname + " " + rows[i].lastname).toLowerCase();
                    const email = (rows[i].email).toLowerCase();
                    const nickname = (rows[i].nickname).toLowerCase();
                    let template = {"firstName": rows[i].firstname, "lastName": rows[i].lastname, "nickname": rows[i].nickname};
                    if (fullName.includes(searchstring) || email.includes(searchstring) 
                            ||  nickname.includes(searchstring)) {
                            result.push(template);
                    }
                }
                res.send({"length": result.length, "data": result});
            })
            .catch(() => {
                res.send({"status": 1});
            });
    } else { // invalid searchstring parameter return error status code
        res.send({"status": 1});
    }
});
module.exports = router;
