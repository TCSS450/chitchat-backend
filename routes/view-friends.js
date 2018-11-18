//express is the framework we're going to use to handle requests
const express = require('express');
let db = require('../utilities/utils').db;
var router = express.Router();

const bodyParser = require("body-parser");
//friends list to return
var friends = []; // used to hold the final list of friends
var memberidNumber = 0;

//get values from the memberid
async function getValues(memberid) {
    let userInfo;
    console.log("getValues mebid: ", memberid);
    userInfo = await db.any("SELECT * FROM Members WHERE memberid = $1", [memberid])
        .then(row => {
            // {"first" : firstname, "last": lastname, "email": email, "phone": phone}
            // console.log("getValues row: ", row);
            userInfo = {
                "firstname": row[0].firstname,
                "lastname": row[0].lastname,
                "email": row[0].email,
                "phone": row[0].phone_number
            };
            // userInfo.push(row[0].firstname);
            // userInfo.push(row[0].lastname);
            // userInfo.push(row[0].nickname);

            // friends.push(userInfo);
            // console.log("getValues userInfor: ", userInfo);
            return userInfo;
        })
        .catch(() => {
            console.log("error in getValues");
        })
    return userInfo; // not needed???
}
//get all the friends values
async function getAllFriendsList(data) {
    let friendList = [];
    // console.log("getAllFriends: ", data);
    for (let i in data) {
        // console.log("user ids: ", data[i].u1, data[i].u2, memberidNumber.memberid);
        if (data[i].u1 == memberidNumber.memberid) {
            try {
                // console.log("get all friends before push call 1", friendList);
                friendList.push(await getValues(data[i].u2));
                // console.log("friends after push call 1", friendList);
            } catch (e) {
                console.log("getAllFriendsList error", e);
            } 
        } else if (data[i].u2 == memberidNumber.memberid) {
            try {
                // console.log("get all friends before push call 2", friendList);
                friendList.push(await getValues(data[i].u1));
                // console.log("friends after push call 2", friendList);
            } catch (e) {
                console.log("getAllFriendsList error", e);
            } 
        }
    }
    return friendList;
}
//set all values for the friends list
async function setFriendsList(data) {
    let friendList = [];
    try {
        friendList = await getAllFriendsList(data)
            .then(function(result) {
                // console.log("************* ****** ** result: ", result);
                friends = result;
            })
    } catch (e) {
        console.log("setFriendsList error", e);
    }
    return friendList;
}
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    const user = req.body['user'];
    
    if (user) {
        // get the member id from nickname or email and a list of verified contacts of that user
        db.task('my-task', function * (t) {
            memberidNumber = yield t.one('SELECT memberid FROM Members WHERE Email = $1 or nickname = $1', [user]);
            // console.log(memberidNumber.memberid);
            return yield t.any("select person_id_who_sent_request as u1, friend_request_recipient_id as u2 " +  
                        "from contacts where verified = 1 and ( " +
                        "person_id_who_sent_request = $1 " + 
                        "or friend_request_recipient_id = $1 )", [memberidNumber.memberid]);
        })
        .then(data => {
            console.log(data.length);
            // success
            // data = as returned from the task's callback
            if (data.length > 0) {
                // friends = getAllFriendsList(data);
                // console.log("data > 0: ", data);

                friends = setFriendsList(data)
                    .then( () => { // already handled ?????
                        // console.log("function then setFriendsList");
                        // console.log("after setFriends friends: ", friends);
                        // console.log("friends final result: ", friends);
                        res.send({'friends':friends, "error": false});
                    })
                    .catch((e) => {
                        // console.log("setFriendsfunction error catch", e);
                        res.send({'friends': [], "error": true});
                    });
            } else {
                res.send({'friends': [], 'status': 1, "error": false});
                console.log("friends final result: ", friends);
            }
        })
        .catch(error => { // user not found
            // error
            // console.log("error", error);
            res.send({'friends': [], "error": true});
        });
    } else {
        res.send({'friends': [], "error": true}); 
    }
});
module.exports = router;  

/*
view-friends
Status: Implemented 
Constraint: only present to logged in users
Type: POST
EndPoint: https://group3-backend.herokuapp.com/view-friends
Input: Requires JSON containing email of verified user or nickname (currently front end does email)
	Ex: {“user “myemail@mydomail.com”}  or  {“user”: “nickname”}
INPUT CONDITIONS:
User field in json 
Email or nickname is a verified user
Output Response: Returns a JSON object list of user friends and boolean
Ex: {friends: [fname, lname, nickname], error: boolean, status: n} 

    Returns: a friends list with the given data,
        error = true if error found
*/