//express is the framework we're going to use to handle requests
const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();

const bodyParser = require("body-parser");

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    const userA = req.body['userAId'];
    const userB = req.body['userBId'];

    if (userA && userB) {
        db.any("DELETE FROM Contacts " +
               "WHERE person_id_who_sent_request = $1 " +
               "AND friend_request_recipient_id = $2", [userA, userB])
            .then(row => {
                res.send({"status": 1});
                console.log("deleted friend");
            }).catch((error) => {
                res.send({"status": 2});
                console.log("catch error: ", error);
            })
    } else { // userA or userB not found
        res.send({"status": 2});
    }
});

module.exports = router; 

/*
Delete-Friend
Status: In Progress
Type: POST
EndPoint: https://group3-backend.herokuapp.com/delete-friend
Input: Requires JSON containing the two members ids. 
	Ex: {“userAId”: 61, “userBId”: 63}
In this case user A is deleting user B.

Output: A JSON object with status condition
Ex: {“status”: N}
Where N is {1,2}
1- Success. User A deleted User B
2- Incorrect Input to endpoint / any other error
*/