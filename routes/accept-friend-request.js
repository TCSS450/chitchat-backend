const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;
let fcm_functions = require('../utilities/utils').fcm_functions;

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
                    db.any("UPDATE Contacts SET verified = 1 WHERE contact_key = $1", [rows[0].contact_key])
                        .then(() => {
                            db.any("SELECT * FROM FCM_Token WHERE memberid = $1", [userB])
                                .then(row => {
                                    let token = row[0].token;
                                    console.log("in then part");
                                    //fcm_functions.sendToIndividual(token, null, [userA], null);
                                    db.any("SELECT * FROM Members WHERE memberid = $1", [userA])
                                        .then(rows => {
                                            console.log("final then");
                                            let displayString = '';
                                            if (rows[0].display_type === 1) { // nickname
                                                displayString = rows[0].nickname;
                                            } else if (rows[0].display_type === 2) { // full name
                                                displayString = rows[0].firstname + " " + rows[0].lastname;
                                            } else { // email
                                                displayString= rows[0].email;
                                            }
                                                console.log(displayString, "display string");
                                                fcm_functions.sendToIndividual(token, null, null, [displayString]);
                                        }).catch((err) => {console.log(err)})
                                }).catch((err) => {console.log(err)})
                            
                            //fcm_functions.sendToIndividual(token, null, null, [])
                            res.send({"status": 1});
                            
                        }).catch(() => res.send(defaultReturn))
                }
            }).catch(() => res.send(defaultReturn))
    } else {res.send(defaultReturn)}
});
module.exports = router;
