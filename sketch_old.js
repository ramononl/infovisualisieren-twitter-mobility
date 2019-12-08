/// <reference path="./libraries/p5.global-mode.d.ts" />

var data = [];
var ready = false;

var minTime, maxTime;
var minLat, maxLat, mapWidth, mapCenterX;
var minLong, maxLong, mapHeight, mapCenterY;
var mapScale;
var fr = 30;
var beforeIndex = 0;
var duringIndex = 0;
var timestamp = 0;

var phase = "before";

async function setup() {
  // setup canvas
  createCanvas(7680 / 2, 1080 / 2); // (4x1920) * 1080, remove "/2" for production
  var screenOneX = 0;
  var screenTwoX = width / 4;
  var screenThreeX = (width / 4) * 2;
  var screenFourX = (width / 4) * 3;

  // load CSV
  data = await loadData("data/natural_disaster_human_mobility_rammasun.csv");
  data = mapSetup(data, screenOneX);

  function mapSetup(data, offset) {
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
      x.millisecondsFromStart = x.time - minTime;
      return x;
    });

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
    mapScale = Math.min((width / 4 / mapWidth) * 3, (height / mapHeight) * 3);

    var long = parseFloat(data[0]["longitude.anon"]);
    var lat = parseFloat(data[0].latitude);

    // add entries for positionX and positionY
    for (var i = 0; i < data.length; i++) {
      data[i].positionX =
        (parseFloat(data[i]["longitude.anon"]) - mapCenterX) * mapScale +
        width / 4 / 2 +
        offset;
      data[i].positionY =
        (parseFloat(data[i].latitude) - mapCenterY) * mapScale + height / 2;
    }

    var before = data.slice(0, 39563);
    var during = data.slice(39563);

    return {
      before: before,
      during: during
    };
  }

  background(0, 0, 0);

  // guides for screens
  fill(255, 255, 255);
  stroke(255, 255, 255);
  line(width / 4, 0, width / 4, height);
  line((width / 4) * 2, 0, (width / 4) * 2, height);
  line((width / 4) * 3, 0, (width / 4) * 3, height);

  // citiy names
  text("Manila, Philippines", 50, 50);

  console.log(data);
  frameRate(fr);
  ready = true;
}

function draw() {
  if (!ready) {
    return;
  }

  var currentTime = (timestamp / fr) * 1000;

  beginShape(POINTS);

  if (phase === "before") {
    stroke(242, 221, 176, 50);
    while (
      data.before[beforeIndex] &&
      data.before[beforeIndex].millisecondsFromStart <= currentTime
    ) {
      vertex(
        data.before[beforeIndex].positionX,
        data.before[beforeIndex].positionY
      );
      beforeIndex++;
    }
    if (!data.before[beforeIndex]) {
      phase = "during";
      console.log(phase);
      timestamp = (data.during[0].millisecondsFromStart / 1000) * fr;
      text("Rammasun", width / 4 - 250, height / 2);
      text("Typhoon", width / 4 - 250, height / 2 + 20);
      text("Number of tweets: 817,516", width / 4 - 250, height / 2 + 40);
      text("Start: 2014-07-02", width / 4 - 250, height / 2 + 60);
      text("End: 2014-08-03", width / 4 - 250, height / 2 + 80);
    }
  }

  if (phase === "during") {
    stroke(255, 0, 0);
    while (
      data.during[duringIndex] &&
      data.during[duringIndex].millisecondsFromStart <= currentTime
    ) {
      vertex(
        data.during[duringIndex].positionX,
        data.during[duringIndex].positionY
      );
      duringIndex++;
    }
    if (!data.during[beforeIndex]) {
      phase = "end";
      console.log(phase);
      fill(0, 0, 0, 50);
      rect(0, 0, width / 4, height);
    }
  }

  endShape();

  // speed
  timestamp = timestamp + 20000;

  // if (frameCount % fr == 0) {
  //   console.log(frameRate());
  // }

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
