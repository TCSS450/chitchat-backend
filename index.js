//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON

app.use(bodyParser.json());
app.use('/login', require('./routes/login.js'));
app.use('/register', require('./routes/register.js'));
app.use('/verify', require('./routes/verify.js'));
app.use('/resend', require('./routes/resend.js'));
app.use('/password-forgot', require('./routes/password-forgot.js'));
app.use('/password-change', require('./routes/password-change.js'));
app.use('/search-members', require('./routes/search-members.js'));
app.use('/messaging', require('./routes/messaging.js'));
app.use('/friend-status', require('./routes/friend-status.js'));
app.use('/send-friend-request', require('./routes/send-friend-request'));
app.use('/accept-friend-request', require('./routes/accept-friend-request'));
app.use('/reject-friend-request', require('./routes/reject-friend-request'));
app.use('/view-request-sent-to-me', require('./routes/view-request-sent-to-me'));
app.use('/view-request-I-sent', require('./routes/view-requests-I-sent'));
app.use('/view-friends', require('./routes/view-friends.js'));

app.use('/token-test', require('./routes/token-test.js'));



//app.use('/weather', require('./routes/weather.js'));


/*
 * Return HTML for the / end point. 
 * This is a nice location to document your web service API
 * Create a web page in HTML/CSS and have this end point return it. 
 * Look up the node module 'fs' ex: require('fs');
 */
app.get("/", (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    for (i = 1; i < 7; i++) {
        //write a response to the client
        res.write('<h' + i + ' style="color:blue">Hello World!</h' + i + '>'); 
    }
    res.end(); //end the response
});

app.listen(process.env.PORT || 5000, () => {
    console.log("Server up and running on port: " + (process.env.PORT || 5000));
});