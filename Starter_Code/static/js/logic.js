// Store url as a variable
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

function createMap(quakeMarkers) {
  // Create the tile layer that will be the background of the map.
  var myMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object to hold the base layer.
  var baseMaps = {
    "World Map": myMap
  };

  // Create an overlayMaps object to hold the earthquake layer.
  var overlayMaps = {
    "Earthquakes": quakeMarkers
  };

  // Create the map object with options.
  var map = L.map("map", {
    center: [36.17, -86.76],
    zoom: 3,
    layers: [myMap, quakeMarkers]
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  function chooseColor(depth) {
    if (depth < 10) return "green";
    else if (depth < 30) return "greenyellow";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "orangered";
    else return "red";
  }

  // Add legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend"),
      depth = [-10, 10, 30, 50, 70, 90];

    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";

    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
        '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      }

    return div;
  };

  legend.addTo(map);
}

// Set marker size function
function markerSize(magnitude) {
  return magnitude * 7;
}

// Set marker color by depth
function chooseColor(depth) {
  if (depth < 10) return "green";
  else if (depth < 30) return "greenyellow";
  else if (depth < 50) return "yellow";
  else if (depth < 70) return "orange";
  else if (depth < 90) return "orangered";
  else return "red";
}

function createMarkers(response) {
  // Initialize an array to hold quake markers.
  var quakeMarkers = [];

  // Loop through the features array.
  for (var i = 0; i < response.features.length; i++) {
    var location = response.features[i].geometry.coordinates;
    var magnitude = response.features[i].properties.mag;
    var depth = location[2];

    // For each feature, create a circle marker with the specified properties.
    var quakeMarker = L.circleMarker([location[1], location[0]], {
      radius: markerSize(magnitude),
      fillColor: chooseColor(depth),
      fillOpacity: 0.7,
      color: "black",
      stroke: true,
      weight: 0.5
    }).bindPopup("<h3>" + response.features[i].properties.place + "</h3><h3>Magnitude: " + magnitude + "</h3>");

    // Add the marker to the quakeMarkers array.
    quakeMarkers.push(quakeMarker);
  }

  // Create a layer group from the quake markers array.
  var quakeLayer = L.layerGroup(quakeMarkers);

  // Call the createMap function with the quakeLayer.
  createMap(quakeLayer);
}

// Perform an API call to retrieve the earthquake data and call the createMarkers function.
d3.json(url).then(createMarkers);