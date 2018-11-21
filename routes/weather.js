// weatherbit.io API KEY : 664bd258dd834025a742c18a03ddd8d6
const API_KEY = process.env.WEATHER_API;

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
 * app.../weather
 * input: {lat: lattitude, lon: longitude}
 * output: {weather: [data for n days of weather], success: boolean}
 */
const days = 10;
router.get('/', (req, res) => {
    const lat = req.body['lat'];
    const lon = req.body['lon'];
    if (lat && lon) {
        let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&units=I&days=${days}&key=${API_KEY}`;

        //When this web service gets a request, make a request to the Weather Web service
        request(url, function (error, response, body) {
            if (error) {
                res.send(error);
            } else {
                // parse out the weather data for today
                let weather = JSON.parse(body);
                res.send({"weather":weather.data, "success": true});
            }
        }); 
    } else { // did not supply right parameters
        res.send({"success": false});
    }
});

/**
 * Get the weather for one day.
 * app.../weather/today
 * input: {lat: lattitude, lon: longitude}
 * output: {weather: [data for todays weather], success: boolean}
 */
router.get('/today', (req, res) => {
    const lat = req.body['lat'];
    const lon = req.body['lon'];

    if (lat && lon) {

        let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&units=I&days=1&key=${API_KEY}`;

        //When this web service gets a request, make a request to the Weather Web service
        request(url, function (error, response, body) {
            if (error) {
                res.send(error);
            } else {
                // parse out the weather data for today
                let weather = JSON.parse(body);
                res.send({"weather":weather.data, "success": true});
            }
        }); 
    } else { // did not supply right parameters
        res.send({"success": false});
    }
});

module.exports = router;
