const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;
let fcm_functions = require('../utilities/utils').fcm_functions;
let utils = require('../utilities/utils');

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
                            console.log("Before the send notification!");
                            //let senderString = utils.getSenderStringByDisplayType(userA);
                            //let token = utils.utilityGetTokenForRecipient(userB);
                            //fcm_functions.sendNotificationFriendRequest(senderString, token);
                            res.send({"status": 1});
                        }).catch(() => {res.send("here0")});
                } else {res.send("here")}
            }).catch(() => {res.send("here2")})
    }
})
    
module.exports = router;