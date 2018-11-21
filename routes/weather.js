// weatherbit.io API KEY : 664bd258dd834025a742c18a03ddd8d6
const API_KEY = process.env.WEATHER_API;
// const API_KEY = '664bd258dd834025a742c18a03ddd8d6';

//express is the framework we're going to use to handle requests
const express = require('express');
//request module is needed to make a request to a web service
const request = require('request');

var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
/**
 * Get the weather for the past 10 days.
 */
router.get('/', (req, res) => {
    const lat = req.body['lat'];
    const long = req.body['long'];

    if (lat && long) {
        let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=Raleigh,NC&key=${API_KEY}`;

        //find the query string (parameters) sent to this end point and pass them on 
        // let n = req.originalUrl.indexOf('?') + 1;
        // if(n > 0) {
        //     url += '&' + req.originalUrl.substring(n);
        // }
        console.log('url: ', url);

        //When this web service gets a request, make a request to the Weather Web service
        request(url, function (error, response, body) {
            if (error) {
                res.send(error);
            } else {
                // res.send(response);
                
                // or just pass on the body
                res.send(body);
            }
        });
    } else { // did not supply right parameters
        res.send({"success": false});
    }
});

/**
 * Get the weather for one day.
 */
router.get('/today', (req, res) => {
    const lat = req.body['lat'];
    const long = req.body['long'];

    if (lat && long) {

        let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=Raleigh,NC&key=${API_KEY}`;

        //find the query string (parameters) sent to this end point and pass them on 
        // let n = req.originalUrl.indexOf('?') + 1;
        // if(n > 0) {
        //     url += '&' + req.originalUrl.substring(n);
        // }
        console.log('url: ', url);

        //When this web service gets a request, make a request to the Weather Web service
        request(url, function (error, response, body) {
            if (error) {
                res.send(error);
            } else {
                // res.send(response);
                
                // or just pass on the body
                res.send(body);
            }
        }); 
    } else { // did not supply right parameters
        res.send({"success": false});
    }
});

module.exports = router;
