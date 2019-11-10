/// <reference path="./libraries/p5.global-mode.d.ts" />

var data = [];
var splittedData = {};
var ready = false;

var minTime, maxTime;
var minLat, maxLat, mapWidth, mapCenterX;
var minLong, maxLong, mapHeight, mapCenterY;
var mapScale;

var varFrameRate = 30;
var sceneLength = 100000; //100'000 milliseconds = 100 seconds
var numberOfCycles = varFrameRate * sceneLength;

async function setup() {
  createCanvas(800, 800);

  data = await loadData("data/natural_disaster_human_mobility_rammasun.csv");

  // data = data.slice(0, 10000);

  // parse time to javascript date object
  data = data.map(function(x) {
    x.time = Date.parse(x.time);
    return x;
  });

  // sort array by time
  data = data.sort(compare);

  // get first and last timestamp
  minTime = d3.min(data, d => d.time);
  maxTime = d3.max(data, d => d.time);

  // add entry for milliseconds since first timestamp
  data = data.map(function(x) {
    x.millisecondsFromZero = x.time - minTime;
    return x;
  });

  console.log("First tweet: " + minTime);
  console.log("Last tweet: " + maxTime);
  console.log("Number of Days: " + (maxTime - minTime) / 1000 / 60 / 60 / 24);

  // get longitude center
  minLong = d3.min(data, d => d["longitude.anon"]);
  maxLong = d3.max(data, d => d["longitude.anon"]);
  mapWidth = maxLong - minLong;
  mapCenterX = (maxLong + minLong) / 2;

  // get latitude center
  minLat = d3.min(data, d => d.latitude);
  maxLat = d3.max(data, d => d.latitude);
  mapHeight = maxLat - minLat;
  mapCenterY = (maxLat + minLat) / 2;

  // define map scale dimension (longitude or latitude)
  mapScale = Math.min(width / mapWidth, height / mapHeight);

  // add entries for positionX and positionY
  for (var i = 0; i < data.length; i++) {
    data[i].positionX = (parseFloat(data[i]["longitude.anon"]) - mapCenterX) * mapScale + width / 2;
    data[i].positionY = (parseFloat(data[i].latitude) - mapCenterY) * mapScale + height / 2;
  }

  console.log(data);
  ready = true;
}

function draw() {
  if (!ready) {
    background(255, 0, 0);
    return;
  } else {
    background(0, 0, 0);
  }

  // loop over data

  for (var i = 0; i < data.length; i++) {
    // milliseconds since start
    var currentTime = millis() * 1000;
    var timestamp = data[i].time;
    stroke(242, 221, 176, 60);
    if (timestamp <= minTime + currentTime) {
      point(data[i].positionX, data[i].positionY);
    }
  }
  console.log(frameRate());

  // connect user test

  // noFill();
  // stroke(255, 0, 0, 50);
  // beginShape();
  // for (var i = 0; i < data.length; i++) {
  //   var x = (parseFloat(data[i]["longitude.anon"]) - mapCenterX) * mapScale + width / 2;
  //   var y = (parseFloat(data[i].latitude) - mapCenterY) * mapScale + height / 2;
  //   if (data[i]["user.anon"] == 4997) {
  //     vertex(x, y);
  //   }
  // }
  // endShape();
}

function compare(a, b) {
  var dateA = a.time;
  var dateB = b.time;

  var comparison = 0;

  if (dateA > dateB) {
    comparison = 1;
  } else if (dateA < dateB) {
    comparison = -1;
  }
  return comparison;
}
