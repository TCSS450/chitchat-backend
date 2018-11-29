const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;

router.post("/", (req, res) => {
    const defaultReturn = {"status": 5};
    const userA = req.body['userAId'];
    const userB = req.body['userBId'];
    if (userA && userB) {
        db.any(`SELECT verified FROM Contacts WHERE person_id_who_sent_request = $1 
        AND friend_request_recipient_id = $2`, [userA, userB])
            .then(rows => {
                if (rows.length === 0) { 
                    // no record, they userA is not friends with user b (user b can be friends with user a though)
                    res.send({"status": 1});
                } else if (rows.length === 1) {
                    const verified = rows[0].verified;
                    if (verified === 1) { // already friends
                        res.send({"status": 2});
                    } else if (verified === 2) {
                        res.send({"status": 3});
                    } else {res.send({"status": 5})}
                } else {
                    res.send(defaultReturn);
                }
                // 1 -> friends, 2 - User A Sent User B but User B has not responed
                // Verified column number representation
            }).catch(() => {res.send(defaultReturn)})
    } else { res.send(defaultReturn)}
})
    
module.exports = router;