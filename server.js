var express = require('express'); //import de la bibliothèque Express
var app = express(); //instanciation d'une application Express
console.log("run server")
 


app.get('/set/*', function(req, res) {
    console.log(req.url);
    res.sendFile(__dirname + req.url);
});

var config = {
	 "temp": {
	    "unite": 1,
	    "state": 1
	    },
	 "pression": {
	    "unite": 1,
	    "state": 1
	 },
	 "vent": {
	    "unite": 0,
	    "state": 1
	 },
	 "lieu": {
	    "ville":"Paris",
	    "pays": "fr"
	 },
	 "ephemeride" : {
	    "status": 1
	 }
}

app.get('/config', function(req, res) {
	 console.log(req.url);
	 console.log("config = ", config)
    res.json(config);
});

app.get('/set', function(req, res) {
	console.log("try")
	console.log(req.url)
	console.log("try")
	console.log(req.query)
	console.log("try")
 	config.temp.unite = parseInt(req.query.temperature);
 	config.vent.unite = parseInt(req.query.vent);
 	config.pression.unite = parseInt(req.query.pression);
  	config.lieu.ville = req.query.location;
  	if (req.query.ephemeride == 'on') {
  		config.ephemeride.status = 1;
  	} else {
		config.ephemeride.status = 0;
	  }
	console.log("try")
 	res.sendFile(__dirname + "/meteo/home.html");
});

app.get('/meteo/*', function(req, res) {
	console.log(req.url);
	res.sendFile(__dirname + req.url);
});
 
 
app.listen(8000); //commence à accepter les requêtes
console.log("App listening on port 8000...");






