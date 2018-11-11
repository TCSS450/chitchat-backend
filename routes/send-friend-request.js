const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;

router.post("/", (req, res) => {
    const defaultReturn = {"status": 2};
    const userA = req.body['userAId'];
    const userB = req.body['userBId'];
    if (userA && userB) {
        db.any(`SELECT * FROM Contacts WHERE person_id_who_sent_request = $1 
                    AND friend_request_recipient_id = $2`, [userA, userB])
            .then(rows => {
                if (rows.length === 0) {
                    db.any(`INSERT INTO Contacts (person_id_who_sent_request, friend_request_recipient_id, verified) VALUES 
                        ($1, $2, $3)`, [userA, userB, 2])
                        .then(() => {
                            res.send({"status": 1})
                        }).catch(() => {res.send(defaultReturn)});
                } else {res.send(defaultReturn)}
            }).catch(() => {res.send(defaultReturn)})
    }
})
    
module.exports = router;