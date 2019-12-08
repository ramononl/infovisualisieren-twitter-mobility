// Global variables
var pg, flash, backgroundGradient, glow, fontRegular;
var pgWidth = (flashWidth = 1920 * 4);
var pgHeight = (flashHeight = 1080 * 4);
var ready = false;
var data = [],
  before = [],
  during = [];
var phase = "before";
var fr = 30;
var timestamp = 0,
  bIndex = 0,
  dIndex = 0;

function preload() {
  fontRegular = loadFont("assets/ShareTechMono.ttf");
}

async function setup() {
  createCanvas(1920 * 4, 1080);

  // radial gradient background
  var outer = color(1, 6, 25);
  var inner = color(0, 60, 91);
  backgroundGradient = createGraphics(width, height);
  radialGradient(width / 2, height / 2, width * 1.2, width * 1.2, inner, outer);

  var csv = await loadData("data/natural_disaster_human_mobility_rammasun.csv");

  var mapProperties = mapScale(csv);

  data = formatData(csv, mapProperties);

  before = data.slice(39563, 257670); // 2014-07-02 to 2014-07-11: 9 days
  during = data.slice(257670, 521008); // 2014-07-12 to 2014-07-21: 9 days – hit on 2014-07-16

  console.log(before, during);

  pg = createGraphics(pgWidth, pgHeight);
  pg.noStroke();

  frameRate(fr);
  ready = true;
}

function draw() {
  if (!ready) {
    return;
  }
  var currentTime = (timestamp / fr) * 1000;

  flash = createGraphics(flashWidth, flashHeight);
  flash.noStroke();

  if (phase === "before") {
    while (before[bIndex] && before[bIndex].timelineMs <= currentTime) {
      pg.fill(65, 217, 242, 50);
      pg.ellipse(before[bIndex].positionX, before[bIndex].positionY, 3, 3);
      pg.fill(65, 217, 242, 30);
      pg.ellipse(before[bIndex].positionX, before[bIndex].positionY, 6, 6);
      pg.fill(65, 217, 242, 20);
      pg.ellipse(before[bIndex].positionX, before[bIndex].positionY, 10, 10);
      pg.fill(65, 217, 242, 10);
      pg.ellipse(before[bIndex].positionX, before[bIndex].positionY, 15, 15);

      // flashing points
      flash.fill(65, 217, 242, 100);
      flash.ellipse(before[bIndex].positionX, before[bIndex].positionY, 20, 20);

      bIndex++;
    }
    if (!before[bIndex]) {
      phase = "during";
      console.log(phase);
    }
  }

  if (phase === "during") {
    while (during[dIndex] && during[dIndex].timelineMs <= currentTime) {
      pg.fill(230, 5, 14, 50);
      pg.ellipse(during[dIndex].positionX, during[dIndex].positionY, 3, 3);
      pg.fill(230, 5, 14, 30);
      pg.ellipse(during[dIndex].positionX, during[dIndex].positionY, 6, 6);
      pg.fill(230, 5, 14, 20);
      pg.ellipse(during[dIndex].positionX, during[dIndex].positionY, 10, 10);
      pg.fill(230, 5, 14, 10);
      pg.ellipse(during[dIndex].positionX, during[dIndex].positionY, 15, 15);

      // flashing points
      flash.fill(230, 5, 14, 100);
      flash.ellipse(before[bIndex].positionX, before[bIndex].positionY, 20, 20);

      dIndex++;
    }
    if (!during[dIndex]) {
      phase = "end";
      console.log(phase);
    }
  }

  imageMode(CORNER);
  image(backgroundGradient, 0, 0, width, height);
  image(pg, 1920, 0, 1920 * 2, 1080, 1920, 1800, 1920 * 2, 1080); // large map
  image(flash, 1920, 0, 1920 * 2, 1080, 1920, 1800, 1920 * 2, 1080); // flashing points
  imageMode(CENTER);
  image(pg, 960, 540, 1920 * 0.75, 1080 * 0.75, 0, 0, 1920 * 4, 1080 * 4); // small map
  rectMode(CENTER);
  noFill();
  strokeWeight(5);
  stroke(230, 5, 14);
  rect(960, 580, (1920 * 0.75) / 2, (1080 * 0.75) / 3);
  noStroke();

  timestamp = timestamp + 10000; // speed

  var noTweets = (bIndex + dIndex)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

  var displayDate;
  if (phase === "before") {
    displayDate = before[bIndex].dateTime;
  } else if (phase === "before") {
    displayDate = during[dIndex].dateTime;
  } else {
    displayDate = during[during.length - 1].dateTime;
  }

  var description =
    "Typhoon Rammasun, known in the Philippines as Typhoon Glenda,\nwas one of the only two Category 5 super typhoons on record in the\nSouth China Sea, with the other one being Pamela in 1954.\n\nRammasun had destructive impacts across the Philippines,\nSouth China, and Vietnam in July 2014.\n\nThough initially forecast to make landfall in Cagayan Valley, the\nstorm followed a more westerly path and was later forecast to make\nlandfall in the Bicol Region and then pass through Bataan and\nZambales before brushing past Metro Manila.";

  rectMode(CORNER);
  textSize(32);
  textFont(fontRegular);
  fill(65, 217, 242);
  text("Manila, Philippines", 100, 100);
  text("Nº tweets: " + noTweets, 5860, 100);
  text(displayDate, 5860, 200);
  text("Rammasun – god of thunder", 5860, 300);
  text(
    "Formed: July 9, 2014 | Brushed past Metro Manila: July 15, 2014",
    5860,
    400
  );
  text(description, 5860, 500);

  if (frameCount % fr == 0) {
    console.log(frameRate());
  }
}

function radialGradient(x, y, w, h, inner, outer) {
  backgroundGradient.noStroke();
  backgroundGradient.fill(0);
  backgroundGradient.rect(100, 100, 100, 100);
  for (let i = Math.max(w, h); i > 0; i--) {
    const step = i / Math.max(w, h);
    const colour = lerpColor(inner, outer, step);
    backgroundGradient.fill(colour);
    backgroundGradient.ellipse(x, y, step * w, step * h);
  }
}

function formatData(csv, mapProperties) {
  var startTime = Date.parse("2014-07-02 03:00:32");

  for (var i = 0; i < csv.length; i++) {
    var obj = {
      long: csv[i]["longitude.anon"],
      lat: csv[i].latitude,
      timestamp: Date.parse(csv[i].time),
      dateTime: csv[i].time, // YYYY-MM-DD hh:mm:ss
      timelineMs: Date.parse(csv[i].time) - startTime,
      positionX:
        (csv[i]["longitude.anon"] - mapProperties.mapCenterX) *
          mapProperties.mapScale +
        pgWidth / 2,
      positionY:
        (csv[i].latitude - mapProperties.mapCenterY) * mapProperties.mapScale +
        pgHeight / 2
    };
    data.push(obj);
  }

  data = data.sort(compare);

  return data;
}

function compare(a, b) {
  var dateA = a.timestamp;
  var dateB = b.timestamp;

  var comparison = 0;

  if (dateA > dateB) {
    comparison = 1;
  } else if (dateA < dateB) {
    comparison = -1;
  }
  return comparison;
}

function mapScale(data) {
  // get longitude center
  var minLong = d3.min(data, d => d["longitude.anon"]);
  var maxLong = d3.max(data, d => d["longitude.anon"]);
  var mapWidth = maxLong - minLong;
  var mapCenterX = (maxLong + minLong) / 2;

  // get latitude center
  var minLat = d3.min(data, d => d.latitude);
  var maxLat = d3.max(data, d => d.latitude);
  var mapHeight = maxLat - minLat;
  var mapCenterY = (maxLat + minLat) / 2;

  // define map scale dimension (longitude or latitude)
  var mapScale = Math.min(
    (pgWidth / 4 / mapWidth) * 3,
    (pgHeight / mapHeight) * 3
  );

  return {
    mapCenterX: mapCenterX,
    mapCenterY: mapCenterY,
    mapScale: mapScale
  };
}
