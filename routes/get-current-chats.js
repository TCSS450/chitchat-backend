const express = require('express');
let db = require('../utilities/utils').db;
let getHash = require('../utilities/utils').getHash;
var router = express.Router();
const bodyParser = require("body-parser");
const crypto = require("crypto");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    const member = req.body['memberid'];
    const defaultReturn = {"status": 2};
    if (member) {

        const query = `
        SELECT C.chatid, H.last_activity, H.name 
        FROM Chatmembers C, Chats H 
        WHERE memberid = $1 AND C.chatid = H.chatid
        ORDER BY last_activity DESC;
        `;
        db.any(query, [member])
        .then(rows => {
            let chatDetails = [];
            for (let i = 0; i < rows.length; i++) {
                console.log(rows[i].chatid);
                let subTemplate = {"chatid": rows[i].chatid, "memberProfiles": []}
                chatDetails.push(subTemplate);
            }
            var getMembersInChat = async () => {
                for (let i = 0; i < chatDetails.length; i++) {
                    let template = chatDetails[i];
                    await db.any(`SELECT M.memberid, firstname, lastname, email, nickname, display_type, phone_number
                                    FROM chatmembers C, members M
                                    WHERE chatid = $1 AND C.memberid = M.memberid AND is_verified = true`, [chatDetails[i].chatid])
                            .then(rows => {
                                memberProfile = rows;
                                chatDetails[i].memberProfiles.push(rows);
                                console.log("here");
                            }).catch(() => res.send(defaultReturn))
                }
            }
            getMembersInChat()
                .then(() => {
                    for (let i = 0; i < chatDetails.length; i++) {
                        for (let j = 0; j < chatDetails[i].memberProfiles[0].length; j++) {
                            let profiles = chatDetails[i].memberProfiles[0]
                            chatDetails[i].memberProfiles = [];
                            for (let k = 0; k < profiles.length; k++) {
                                chatDetails[i].memberProfiles.push(profiles[k]);
                            }
                        }
                    }
                    res.send({"status": 1, "chatDetails": chatDetails});
                }).catch(() => res.send(defaultReturn))
        }).catch(() => res.send(defaultReturn))
    } else {
        res.send(defaultReturn);
    }
});
module.exports = router;