var admin = require('firebase-admin');
var serviceAccount = require("./chitchat-fcm-group3-firebase-adminsdk-swjxf-05a80c87aa.json");
let getDisplayType = require('./utils').getSenderStringByDisplayType;
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://lab5-fcm-cfb3.firebaseio.com'
});
//use to send message to all clients register to the Topoic (ALL)
function sendToTopic(msg, from, topic) {
    //build the message for FCM to send
    var message = {
        notification: {
            title: 'New Message from '.concat(from),
            body: msg,
        },
        data: {
            "type": "contact",
            "sender": from,
            "message": msg,
        },
        "topic": topic
    };
    console.log(message);
    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message 1:', response);
        })
        .catch((error) => {
            console.log('Error sending message 1:', error);
        });
}
//use to send message to a specific client by the token

function sendNotificationFriendRequest(senderString, token) {
    console.log("entered the method!");

    if (senderString !== -1 || token !== -1) {
        var message = {
            android: {
                notification: {
                    title: 'Incoming friend request!',
                    body: senderString + ' sent you a friend request',
                    color: "#32CD32",
                    icon: '@drawable/requests'
                },
                data: {
                    "type": "friend-request",
                    "senderString": senderString
                }
            },
            "token": token
        }
        admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message 2:', response);
        })
        .catch((error) => {
            console.log('Error sending message 2:', error);
        });
    } else {
        console.log("ERROR!!!");
    }
}

 function getChatNotificationMessage(dataPackage, token) {
     /*1: Display user with their NICKNAME
2: Display user with their FULL NAME (FIRST + LAST)
3: Display user with EMAIL
*/
    let rowWithoutCurrentUser = [];
    let buildUp = "";
    for (let i = 0; i < dataPackage.sqlOutput.length; i++) {
        if (dataPackage.sqlOutput[i].memberid !== dataPackage.currentMember) {
            rowWithoutCurrentUser.push(dataPackage.sqlOutput[i]);
        }
    }
    for (let i = 0; i < rowWithoutCurrentUser.length; i++) {
        const displayType = rowWithoutCurrentUser[i].display_type;
        if (displayType === 1) { //nn
            buildUp += rowWithoutCurrentUser[i].nickname + ', ';
        } else if (displayType === 2) { // full name
            buildUp += rowWithoutCurrentUser[i].firstname + ' ' + rowWithoutCurrentUser[i].lastname + ', ';
        } else if (displayType === 3) { // email
            buildUp += rowWithoutCurrentUser[i].email + ', ';
        }
    }
    buildUp = buildUp.slice(0, -1);
    buildUp = buildUp.slice(0, -1);

     return {
        android: {
            notification: {
                title: 'New Message from '.concat(dataPackage.email),
                body: dataPackage.message,
                color: "#0000FF",
                icon: '@drawable/requests'
            },
            data: {
                "type": "contact",
                "sender": dataPackage.email,
                "message": dataPackage.message,
                "chatId": ''+dataPackage.chatId,
                "otherMembers": buildUp
            }
        },
        "token": token
     }
 }

 function getFriendRequestSent(senderString, token) {
     console.log("in getFreindRequestSent method");
    console.log(senderString, 'senderString');
     return {
        android: {
            notification: {
                title: 'New Request from '.concat(senderString),
                body: senderString + ' sent you a friend request!',
                color: "#0000FF",
                icon: '@drawable/requests'
            },
            data: {
                "type": "sent"
            }
        },
        "token": token
     };
     
 }

 function getFriendRequestAccepted(senderString, token) {
    return {
        android: {
            notification: {
                title: 'Friend Request Accepted!',
                body: senderString + ' accepted your friend request!',
                color: "#0000FF",
                icon: '@drawable/requests'
            },
            data: {
                "type": "accepted"
            }
        },
        "token": token
     };
 }

function sendToIndividual(token, chatNotif, friendSentNotif, friendAcceptedNotif) {

    if (friendSentNotif === null && friendAcceptedNotif === null) {
        //from (email), msg, chatId
        message = getChatNotificationMessage(chatNotif, token);
    } else if (chatNotif === null && friendAcceptedNotif === null) {
        message = getFriendRequestSent(friendSentNotif[0], token);
    } else if (chatNotif === null && friendSentNotif === null) {
        message = getFriendRequestAccepted(friendAcceptedNotif[0], token);
    }

    console.log(message);
    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message 2:', response);
        })
        .catch((error) => {
            console.log('Error sending message 2:', error);
        });
}

function sendIsTypingPing(token, member, chatid, memberid) {

    var message = {
        android: {
            data: {
                "type": "typing",
                "members": member,
                "chatid": "" + chatid,
                "memberid_whos_typing": ''+memberid
            }
        },
        "token": token
    }
    admin.messaging().send(message)
        .then(() => {
            console.log("sent is typing ping");
            console.log(message);
        })

}

function sendDoneTypingPing(token, member, chatid, memberid) {
    var message = {
        android: {
            data: {
                "type": "done-typing",
                "members": member,
                "chatid": "" + chatid,
                "memberid_whos_typing": ''+memberid
            }
        },
        "token": token
    }
    admin.messaging().send(message)
        .then(() => {
            console.log("sent done typing ping");
            console.log(message);
        })
}

function notifyStayingMembers(token, chatid, deletedMember) {
    var message = {
        android: {
            data: {
                "type": "notify-staying",
                "deletedMemberId": ''+deletedMember,
                "chatid": '' + chatid
            }
        },
        "token": token
    }
    admin.messaging().send(message).then(() => {console.log(message)});
} 

function notifyRemovedMember(token, chatid) {
    var message = {
        android: {
            data: {
                "type": "notify-removed",
                "chatid": '' + chatid
            }
        },
        "token": token
    }
    admin.messaging().send(message).then(() => {console.log(message)});
}

let fcm_functions = { sendToTopic, sendToIndividual, sendNotificationFriendRequest,
     sendIsTypingPing, sendDoneTypingPing, notifyRemovedMember, notifyStayingMembers };
module.exports = {
    admin, fcm_functions
};