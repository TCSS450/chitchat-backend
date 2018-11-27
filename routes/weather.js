
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
 * Get the weather for the past n days.
 * app.../weather
 * input: {lat: lattitude, lon: longitude, days: n} where 0 < n < 17
 * output: {weather: [data for n days of weather], success: boolean}
 */
const days = 10;
router.post('/', (req, res) => {
    const lat = req.body['lat'];
    const lon = req.body['lon'];
    const days = req.body['days'];
    if (lat && lon && days) {
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

module.exports = router;
