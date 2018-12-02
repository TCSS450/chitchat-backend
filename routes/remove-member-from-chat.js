const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
const fcm_functions = require('../utilities/utils').fcm_functions;

router.post('/', (req, res) => {
    const memberid = req.body['memberid'];
    const chatid = req.body['chatid'];
    if (memberid) {
        const query =
        `SELECT M.memberid, M.nickname, M.firstname, M.display_type, M.lastname, M.email, M.phone_number, M.display_type, F.token
         FROM FCM_Token F, Members M, Chatmembers C
         WHERE M.memberid = F.memberid AND C.memberid = M.memberid AND C.chatid = $1`;
        db.any(query, [chatid])
            .then(rows => {
                db.any('DELETE FROM Chatmembers WHERE chatid = $1 AND memberid = $2', [chatid, memberid])
                    .then(() => {
                        for (let i = 0; i < rows.length; i++) {
                            if (rows[i].memberid === memberid) { // send deleted person a firebase response
                                fcm_functions.notifyRemovedMember(rows[i].token, chatid);
                            } else { // existing chat member
                                fcm_functions.notifyStayingMembers(rows[i].token, chatid, memberid);
                            }
                        }
                        res.send({"status": 1});
                    }).catch(()=> {
                        res.send({"status": 2});
                    })
            }).catch(() => {
                res.send({"status": 2});
            })
    } else {
        res.send({"status" : 2});
    }
});
module.exports = router;