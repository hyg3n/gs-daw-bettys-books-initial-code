const express = require("express");
const router = express.Router();
const request = require("request");

router.get("/londonnow", (req, res, next) => {
  const apiKey = "2fad934ddf4d487f97ae9414c8cfded7";
  const city = "london"; 
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  request(url, (err, response, body) => {
    if (err) {
      return next(err); // Passes error to express error handler
    }

    try {
      const weather = JSON.parse(body);

      // Check if expected data is present
      if (weather && weather.main && weather.weather) {
        res.render("weather", {
          temp: weather.main.temp,
          city: weather.name,
          humidity: weather.main.humidity,
          windSpeed: weather.wind.speed,
          windDeg: weather.wind.deg,
          description: weather.weather[0].description,
        });
      } else {
        res.status(404).send("Weather data not found for the specified location.");
      }
    } catch (parseError) {
      res.status(500).send("Error processing weather data.");
    }
  });
});

module.exports = router;
