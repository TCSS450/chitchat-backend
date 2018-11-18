const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;

router.post("/", (req, res) => {
    const defaultReturn = {"status": 2};
    const chatmembers = req.body['chatmembers'];
    const chatname = req.body['chatname'];
    let chatid = -1;
    if (chatmembers && chatname) {
        db.any("INSERT INTO Chats (name) VALUES ($1)", [chatname])
            .then(() => {
                db.any("SELECT * FROM Chats WHERE chatid = (SELECT MAX(chatid) FROM Chats)")
                    .then(rows => {
                        chatid = rows[0].chatid;
                        for (let i = 0; i < chatmembers.length; i++) {
                            db.any("INSERT INTO chatmembers (chatid, memberid) VALUES ($1, $2)", [chatid, chatmembers[i]])
                                .then(() => {
                                    if (i + 1 === chatmembers.length) {res.send({"status": 1, "chatid": chatid})}
                                }).catch(() => res.send(defaultReturn))
                        }
                    }).catch(() => {res.send(defaultReturn)})
            }).catch(() => {res.send(defaultReturn)})
    } else { res.send(defaultReturn)}
})
    
module.exports = router;