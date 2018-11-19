const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;


function getQuery(memberid) {
    return "SELECT chatid FROM chatmembers WHERE memberid = " + memberid;
}

function getFullQuery(query) {
    let toSend = query[0];
    for (let i = 1; i < query.length; i++) {
        toSend += ' INTERSECT ';
        toSend += query[i];
    }
    return toSend;
}

function arraysEqual(_arr1, _arr2) {

    if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length){
      return false;
    }
    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]){
            return false;
        }
    }
    return true;
}

function makeNewChat(chatname, defaultReturn, res, chatmembers) {
    chatidToSend = -1;
    console.log(chatmembers);
    db.any("INSERT INTO Chats (name) VALUES ($1)", [chatname])
    .then(() => {
        db.any("SELECT * FROM Chats WHERE chatid = (SELECT MAX(chatid) FROM Chats)")
            .then(rows => {
                chatid = rows[0].chatid;
                chatidToSend = chatid;
                var addChatMembersToTable = async () => {
                    for (let i = 0; i < chatmembers.length; i++) {
                        await db.any("INSERT INTO chatmembers (chatid, memberid) VALUES ($1, $2)", [chatid, chatmembers[i]])
                            .then(() => {
                                console.log("inserted");
                            }).catch((error) => {
                                i = chatmembers.length;
                            })
                    }
                }
                addChatMembersToTable()
                    .then(() => {
                        res.send({"status": 1, "chatid": chatidToSend});
                    }).catch(() => res.send(defaultReturn));
            }).catch(() => {res.send(defaultReturn)})
    }).catch(() => {res.send(defaultReturn)})
}

router.post("/", (req, res) => {
    const defaultReturn = {"status": 2};
    const chatmembers = req.body['chatmembers'];
    const chatname = req.body['chatname'];
    let chatid = -1;

    if (chatmembers && chatname) {
            let query = [];
            for (let i = 0; i < chatmembers.length; i++) {
                query.push(getQuery(chatmembers[i]));
            }
            let db_query = getFullQuery(query);
            let chat_id_in_common = [];
            let chats_with_member_id = [];
            db.any(db_query)
                .then(rows => {
                    if (rows.length === 0) { // new id needs to be returned
                        console.dir(chatmembers);
                        makeNewChat(chatname, defaultReturn, res, chatmembers);
                    } else {
                        console.log("# common chat id's " + rows.length);
                        var getMemberIdsForEachCommonChat = async () => {
                            for (let i = 0; i < rows.length; i++) {
                            
                                let template = {"chatid": rows[i].chatid, "members": []};
                                await db.any("SELECT * FROM chatmembers WHERE chatid = $1", template.chatid)
                                    .then(members => {
                                        for (let j = 0; j < members.length; j++) {
                                            template.members.push(members[j].memberid);
                                        }
                                    console.log("end inner loop");
                                    chats_with_member_id.push(template);
                                }).catch(() => res.send(defaultReturn)); 
                            }
                        }
                        getMemberIdsForEachCommonChat()
                            .then(() => {
                                var sent = false;
                                for (let i = 0; i < chats_with_member_id.length; i++) {
                                    let curr = chats_with_member_id[i];
                                    if (curr.members.length === chatmembers.length) {
                                        if (arraysEqual(curr.members, chatmembers)) {
                                            sent = true;
                                            res.send({"status": 1, "chatid": curr.chatid});
                                        }
                                    }
                                }
                                if (!sent) {
                                    makeNewChat(chatname, defaultReturn, res, chatmembers);
                                }
                            });
                    }
                }).catch(res.send(defaultReturn))
    }
})  
module.exports = router;