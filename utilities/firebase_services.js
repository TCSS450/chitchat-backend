var admin = require('firebase-admin');
var serviceAccount = require("./chitchat-fcm-group3-firebase-adminsdk-swjxf-05a80c87aa.json");
let utility = require('./utils').getSenderStringByDisplayType;
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
                data: {}
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


function sendToIndividual(token, msg, from, chatId) {

    //build the message for FCM to send
    var message = {
        android: {
            notification: {
                title: 'New Message from '.concat(from),
                body: msg,
                color: "#0000FF",
                icon: '@drawable/requests'
            },
            data: {
                "type": "contact",
                "sender": from,
                "message": msg,
                "chatId": chatId
            }
        },
        "token": token
    };
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
let fcm_functions = { sendToTopic, sendToIndividual, sendNotificationFriendRequest };
module.exports = {
    admin, fcm_functions
};