//express is the framework we're going to use to handle requests
const express = require('express');
//Create connection to Heroku Database
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
let fcm_functions = require('../utilities/utils').fcm_functions;
//send a message to all users "in" the chat session with chatId
router.post("/send", (req, res) => {
    let email = req.body['email'];
    let message = req.body['message'];
    let chatId = req.body['chatId'];
    if (!email || !message || !chatId) {
        res.send({
            success: false,
            error: "email, message, or chatId not supplied"
        });
        return;
    }
    //add the message to the database
    let insert = `INSERT INTO Messages(ChatId, Message, MemberId) SELECT $1, $2, MemberId FROM Members WHERE email=$3`
    db.none(insert, [chatId, message, email])
        .then(() => {
            //send a notification of this message to ALL members with registered tokens
            let test = `
            SELECT M.memberid, M.nickname, M.firstname, M.lastname, M.email, M.phone_number, M.display_type, F.token 
            FROM FCM_Token F, Members M, Chatmembers C 
            WHERE M.memberid = F.memberid AND C.memberid = M.memberid AND C.chatid = $1`;
            db.manyOrNone(test, [chatId])
                .then(rows => {
                    for (let i = 0; i < rows.length; i++) {
                        let objectToSend = {
                            message: message,
                            email: email,
                            chatId: chatId,
                            sqlOutput: rows,
                            currentMember: rows[i].memberid
                        }
                        fcm_functions.sendToIndividual(rows[i].token, objectToSend, null, null);
                    }

                    const subQuery = `UPDATE Chats SET last_activity = CURRENT_TIMESTAMP WHERE chatid = $1;`
                    db.any(subQuery, [chatId])
                        .then(() => {
                            //res.send({"status": 1});
                            res.send({success: true});
    
                    })
                    /*res.send({
                        success: true
                    });*/
                }).catch(err => {
                    console.log(err);
                    res.send({
                        success: false,
                        error: err,
                        "status": "Error in option 1"
                    });
                })
        }).catch((err) => {
            console.log("HERE2");

            res.send({
                success: false,
                error: err,
                "status": "Error in option 2"
            });
        });
});
//Get all of the messages from a chat session with id chatid
router.post("/getAll", (req, res) => {
    let chatId = req.body['chatId'];
    let result = [];
    let query = `SELECT Members.nickname, Members.firstname, Members.lastname, Members.Email, Members.display_type, 
        Messages.Message, to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD HH24:MI:SS.US' ) AS Timestamp FROM Messages 
        INNER JOIN Members ON Messages.MemberId=Members.MemberId WHERE ChatId=$1 ORDER BY Timestamp DESC`
    db.manyOrNone(query, [chatId])
        .then((rows) => {
            for(let i = 0; i < rows.length; i++){
                temp = {
                    "nickname": rows[i].nickname,
                    "firstname": rows[i].firstname,
                    "lastname": rows[i].lastname,
                    "email": rows[i].email,
                    "message": rows[i].message,
                    "timestamp": rows[i].timestamp,
                    "display_type": rows[i].display_type
                };
                result.push(temp);
            }
            res.send({
                messages: result
            })
            console.log(result);
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
});


router.post("/is-typing", (req, res) => {
    const chatid = req.body['chatid'];
    const membername = req.body['membername']; 
    const memberid = req.body['memberid'];
    const query = `
    SELECT M.memberid, M.nickname, M.firstname, M.display_type, M.lastname, M.email, M.phone_number, M.display_type, F.token
    FROM FCM_Token F, Members M, Chatmembers C
    WHERE M.memberid = F.memberid AND C.memberid = M.memberid AND C.chatid = $1 AND M.memberid != $2`;
    if (chatid && memberid && membername) {
        db.any(query, [chatid, memberid])
            .then(rows => {
                for (let i = 0; i < rows.length; i++) {
                    fcm_functions.sendIsTypingPing(rows[i].token, membername);
                }
                res.send({"status": 1});
            }).catch(() => res.send({"status": 2}));
    } else {
        res.send({"status": 2});
    }
});

router.post("/done-typing", (req, res) => {
    const chatid = req.body['chatid'];
    const membername = req.body['membername']; 
    const memberid = req.body['memberid'];
    const query = `
    SELECT M.memberid, M.nickname, M.firstname, M.display_type, M.lastname, M.email, M.phone_number, M.display_type, F.token
    FROM FCM_Token F, Members M, Chatmembers C
    WHERE M.memberid = F.memberid AND C.memberid = M.memberid AND C.chatid = $1 AND M.memberid != $2`;
    if (chatid && memberid && membername) {
        db.any(query, [chatid, memberid])
            .then(rows => {
                for (let i = 0; i < rows.length; i++) {
                    fcm_functions.sendDoneTypingPing(rows[i].token, membername);
                }
                res.send({"status": 1});
            }).catch(() => res.send({"status": 2}));
    } else {
        res.send({"status": 2});
    }
});

module.exports = router;