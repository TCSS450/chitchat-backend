const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;

router.post("/", (req, res) => {
    const defaultReturn = {"status": 3};
    const userId = req.body['loggedInUserId'];
    if (userId) {
        db.any(`SELECT * FROM Members, Contacts WHERE person_id_who_sent_request = memberid 
                    AND friend_request_recipient_id =$1 AND verified = 2`, [userId])
            .then(rows => {
                if (rows.length === 0) {res.send({"status": 1})}
                else {
                    let result = [];
                    for (let i = 0; i < rows.length; i++) {
                        const template = {"memberId": rows[i].memberid, "firstname": rows[i].firstname,
                             "lastname": rows[i].lastname, "nickname": rows[i].nickname};
                             result.push(template);
                    }
                    res.send({"status": 2, "data": result});
                }
            }).catch(() => res.send(defaultReturn))
    } else {res.send(defaultReturn)}
});
module.exports = router;