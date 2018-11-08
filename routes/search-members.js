const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;

router.get("/", (req, res) => {
    const searchstring = req.query['searchstring'].toLowerCase();
    const searchtype = parseInt(req.query['searchtype']);
    if (searchstring) {
        db.any(`SELECT nickname, firstname, lastname,
             email FROM Members WHERE is_verified = true`) // we only want verified users
        .then(rows => {
            let result = [];
            for (let i = 0; i < rows.length; i++) {
                const fullName = (rows[i].firstname + " " + rows[i].lastname);
                const email = rows[i].email;
                const nickname = (rows[i].nickname);
                let template = {"firstName": rows[i].firstname,
                "lastName": rows[i].lastname, "nickname": rows[i].nickname};
                if (searchtype === 1) { // NN
                    if (nickname.toLowerCase().includes(searchstring)) {
                        result.push(template);
                    }
                } else if (searchtype === 2) { // Full name
                    if (fullName.toLowerCase().includes(searchstring)) {
                        result.push(template);
                    }
                } else if (searchtype === 3) { // email
                    if (email.toLowerCase().includes(searchstring)) {
                        result.push(template);
                    }
                } else if (searchtype === 4) { // NN, Full name, email
                    if (fullName.toLowerCase().includes(searchstring) ||
                             email.toLowerCase().includes(searchstring) 
                                ||  nickname.toLowerCase().includes(searchstring)) {
                        result.push(template);
                    }
                } else { // searchtype was something other than 1,2,3
                    res.send({"status": 1});
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
