
//.   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome  --disable-web-security --allow-file-access-from-files! 

function cacheTout(){
	$(".contenant").hide()
}

function cache(element){
	var id = "#" + element
	$(id).hide()
}

function montre(liste){
	for (var i = 0; i < liste.length; i++) {
		id = "#" + liste[i]
		$(id).show()
	}
}

var unitesPossibles = {
	temp : ["°C", "°F", "K"],
	vent : ["km/h", "m/s"],
	pression : ["bar", "hPa"]
}

var unitesChoisies = {
	temp : 0,
	vent : 0,
	pression : 0
}

var valeursCourantes = {
	temp : -42,
	vent : 100,
	pression : 1,
	couverture : "Nuageux",
	lever_sol : "12h",
	coucher_sol : "16h"

}

var villeCourante = {
    nom : "Paris",
    pays: "Fr"
}

function CtoF(val){
	return ((val * 9 / 5) + 32).toFixed(1);
}

function CtoK(val){
	return (parseInt(val) + 273.15).toFixed(1);
}

function KtoC(val){
	return (val - 273.15).toFixed(1);
}

function KMHtoMS(val){
	return (val / 3.6).toFixed(0);
}

function MStoKMH(val){
	return (val * 3.6).toFixed(0);
}

function bartohPa(val){
	return (val * 1000).toFixed(0)
}

function hPatobar(val){
	return (val / 1000).toFixed(2)
}

function toDate(val){
	var date = new Date(val * 1000);
	return date.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
}

function affiche(){
	//Température
	val_temp = valeursCourantes.temp;
	unite_temp = "°C";
	if (unitesChoisies.temp == 1) {
		val_temp = CtoF(val_temp);
		unite_temp = "°F";
	} else if (unitesChoisies.temp == 2) {
		val_temp = CtoK(val_temp);
		unite_temp = "K";
	}
	$("#temperature .contenu").text(val_temp)
	$("#temperature .unite").text(unite_temp)

	//Vent
	val_vent = valeursCourantes.vent;
	unite_vent = "km/h";
	if (unitesChoisies.vent == 1) {
		val_vent = KMHtoMS(val_vent);
		unite_vent = "m/s"
	}
	$("#vent .contenu").text(val_vent)
	$("#vent .unite").text(unite_vent)

	//Pression
	val_pression = valeursCourantes.pression;
	console.log("pression=" + unitesChoisies.pression)
	unite_pression = "bar"
	if(unitesChoisies.pression == 1){
		val_pression = bartohPa(val_pression);
		unite_pression = "hPa"
	}
	$("#pression .contenu").text(val_pression)
	$("#pression .unite").text(unite_pression)

	//Soleil
	$("#soleil .lever").text(valeursCourantes.lever_sol);
	$("#soleil .coucher").text(valeursCourantes.coucher_sol);

	//Ville
	ville = villeCourante.nom
	$("#ville").text(ville)

	//Couverture
	$("#couverture").text(valeursCourantes.couverture)

	console.log("affiche")

}

function litConfig(){
	$.ajax({url:"/config",
			success: updateByConfig, 
			error: traiteErreur,
			dataType:"json"});
}



function updateByConfig(jsondoc){
	console.log("Update by Config")
	unitesChoisies.temp = jsondoc.temp.unite
	unitesChoisies.vent = jsondoc.vent.unite
	unitesChoisies.pression = jsondoc.pression.unite
	villeCourante.nom = jsondoc.lieu.ville
	villeCourante.pays = jsondoc.lieu.pays
	if (jsondoc.ephemeride.status == 0){
		cache("soleil")
	}
	console.log(villeCourante)
	litWiki()
	litDonnees()
}

//Lit la ville dans les tableaux et appelle les API en fonction et update les autres tableaux
function litDonnees(){
	var lieu = villeCourante.nom + "," + villeCourante.pays
	var s = "http://api.openweathermap.org/data/2.5/weather?q=" + lieu + "&appid=22e21ef649526ef2b1be4db6d2b0857d&lang=fr";
	$.ajax({ url: s,
             dataType: "json",
             success: update,
             error: traiteErreur });
}

function update(jsondoc){
	valeursCourantes.temp = KtoC(jsondoc.main.temp);
	valeursCourantes.vent = MStoKMH(jsondoc.wind.speed);
	valeursCourantes.pression = hPatobar(jsondoc.main.pressure);
	valeursCourantes.couverture = jsondoc.weather[0].description;
	valeursCourantes.lever_sol = toDate(jsondoc.sys.sunrise);
	valeursCourantes.coucher_sol = toDate(jsondoc.sys.sunset);
	console.log(jsondoc.main.pressure);
	console.log(valeursCourantes)
	afficheMap(jsondoc.coord.lat, jsondoc.coord.lon, jsondoc.weather[0].icon)
}

//Lit la ville et va chercher la description dans le wiki
function litWiki(){
	console.log(villeCourante.nom)
	var s = "https://fr.wikipedia.org/w/api.php?"
	$.ajax({ url: s,
			data : {action : "query", prop : "extracts", exintro:"", explaintext : "", titles:villeCourante.nom, format : "json"},
             dataType: "jsonp",
             success: updateDescr,
             error: traiteErreur });
}

function updateDescr(data){
	console.log("data")
	console.log(data)
	var keys = Object.keys(data.query.pages)
	var key = keys[0]
	$("#descriptionVille").text(data.query.pages[key].extract)
}

function traiteErreur(jqXHR, textStatus, errorThrown) {
				alert("Erreur " + errorThrown + " : " + textStatus);
				console.log(textStatus)
      }

function afficheMap(lat, lon, icon) {
	$("#uneJoliCarte").empty()

    var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
    var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

    var position = new OpenLayers.LonLat(lon, lat).transform( fromProjection, toProjection);

    map = new OpenLayers.Map("uneJoliCarte");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);

    var size = new OpenLayers.Size(100,100);
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    var icon = new OpenLayers.Icon("http://openweathermap.org/img/w/" + icon + ".png", size, offset);

    var marker = new OpenLayers.Marker(position, icon.clone());

    var markers = new OpenLayers.Layer.Markers();
    map.addLayer(markers);
    markers.addMarker(marker);

    var zoom           = 10;
    map.setCenter(position, zoom);
}



function toutLancer(){
	console.log("init")
	litConfig();
	console.log("wait")
	setTimeout(affiche, 1000);

}
//lancer encore affiche

function initConfig(){
	$.ajax({url:"/config",
			success: updateDefaultConfig, 
			error: traiteErreur,
			dataType:"json"});
}

function updateDefaultConfig(json){
	console.log(json.temp.unite);
	switch (json.temp.unite){
		case 0 :
			$("#Celsius").attr("checked", true);
			break;
		case 1 :
			$("#Farenheit").attr("checked", true);
			break;
		case 2 :
			$("#Kelvin").attr("checked", true);
			break;	
	}

	switch (json.pression.unite){
		case 0 :
			$("#bar").attr("checked", true);
			break;
		case 1 :
			$("#hPa").attr("checked", true);
			break;
	}

	switch (json.vent.unite){
		case 0 :
			$("#kmh").attr("checked", true);
			break;
		case 1 :
			$("#ms").attr("checked", true);
			break;
	}

	if (json.ephemeride.status == 1){
		$("[name=ephemeride]").attr("checked", true);
	}

	$("[name=location]").attr("value",json.lieu.ville)
}
