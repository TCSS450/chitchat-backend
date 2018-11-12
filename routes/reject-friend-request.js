const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;
router.post("/", (req, res) => {
    const defaultReturn = {"status": 2};
    const userA = req.body['userAId'];
    const userB = req.body['userBId'];
    if (userA && userB) {
        db.any(`SELECT * FROM Contacts WHERE person_id_who_sent_request = $1 AND
                     friend_request_recipient_id = $2 AND verified = $3`, [userB, userA, 2])
            .then(rows => {
                if (rows.length === 0) {res.send(defaultReturn)}
                else {
                    db.any("UPDATE Contacts SET verified = 3 WHERE contact_key = $1", [rows[0].contact_key])
                        .then(() => {
                            res.send({"status": 1});
                        }).catch(() => res.send(defaultReturn))
                }
            }).catch(() => res.send(defaultReturn))
    } else {res.send(defaultReturn)}
});
module.exports = router;