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
            db.manyOrNone('SELECT * FROM FCM_Token')
                .then(rows => {
                    rows.forEach(element => {
                        //console.log("GOT HERE");
                        fcm_functions.sendToIndividual(element['token'], message, email);
                    });
                    console.log("The message was succesful");
                    console.log("The chatID is", chatId);
                    res.send({
                        success: true
                    });
                }).catch(err => {
                    console.log("HERE1");
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

    let query = `SELECT Members.Email, Messages.Message, to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD HH24:MI:SS.US' ) AS Timestamp FROM Messages INNER JOIN Members ON Messages.MemberId=Members.MemberId WHERE ChatId=$1 ORDER BY Timestamp DESC`
    db.manyOrNone(query, [chatId])
        .then((rows) => {
            res.send({
                messages: rows,
                
            })
            console.log(rows.email);
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
});
module.exports = router;