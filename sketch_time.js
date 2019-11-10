/// <reference path="./libraries/p5.global-mode.d.ts" />

var data = [];
var ready = false;

var minLat, maxLat;
var minLong, maxLong;

async function setup() {
  createCanvas(800, 800);

  data = await loadData("natural_disaster_human_mobility_rammasun.csv");

  data = data.sort(compare);

  // data = data.slice(0, 1000);

  minTime = d3.min(data, function(d) {
    return Date.parse(d.time);
  });

  console.log(minTime);

  maxTime = d3.min(data, function(d) {
    return Date.parse(d.time);
  });

  console.log(maxTime);

  console.log(data);

  ready = true;
  frameRate(30);
}

function draw() {
  if (!ready) {
    background(255, 0, 0);
    return;
  } else {
    background(200);
  }

  for (var i = 0; i < data.length; i++) {
    var x = map(Date.parse(data[i].time), minTime, maxTime, 0, width);
    stroke(0, 0, 0, 20);
    line(x, 100, x, 400);
  }
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
