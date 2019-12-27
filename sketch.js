// global variables
var fontRegular, bgSound;
var fr = 30;

// offscreen canvases
var bMap, dMap, flash, canvasBackground, info;
var canvasProperties = {
  width: 1920 * 4,
  height: 1080 * 4
};
var infoProperties = {
  width: 1000,
  height: 880,
  x: 6230,
  y: 120
};

// color variables
var cDarkBlue = [1, 6, 25]; // r, g, b
var cLightBlue = [0, 60, 91]; // r, g, b
var cTurquoise = [65, 217, 242]; // r, g, b
var cRed = [230, 5, 14]; // r, g, b

// state variables
var fadeOut = 0;
var ready = false;
var phase = "before";
var data = (before = during = []);
var timestamp = (bIndex = dIndex = 0);

// canvas capturer instance
// var capturer = new CCapture({ format: "png", framerate: fr });

function preload() {
  fontRegular = loadFont("assets/ShareTechMono.ttf");
  soundFormats("wav");
  bgSound = loadSound("assets/sound.wav");
}

async function setup() {
  // create main canvas
  createCanvas(1920 * 4, 1080);

  // set default font
  textFont(fontRegular);

  // create offscreen canvases
  canvasBackground = createGraphics(width, height);
  createBackground(
    width / 2,
    height / 2,
    width * 1.2,
    width * 1.2,
    color(cLightBlue[0], cLightBlue[1], cLightBlue[2]),
    color(cDarkBlue[0], cDarkBlue[1], cDarkBlue[2])
  );
  bMap = createGraphics(canvasProperties.width, canvasProperties.height);
  bMap.noStroke();
  dMap = createGraphics(canvasProperties.width, canvasProperties.height);
  dMap.noStroke();
  flash = createGraphics(canvasProperties.width, canvasProperties.height);
  flash.noStroke();
  info = createGraphics(infoProperties.width, infoProperties.height);
  infoContent();

  // load csv
  var csv = await loadData("data/natural_disaster_human_mobility_rammasun.csv");

  // calculate map scale
  var mapProperties = mapScale(csv);

  // format entries, calculate coordinates, sort entries
  data = formatData(csv, mapProperties);

  // slice data into before/during arrays
  before = data.slice(39563, 257670); // 2014-07-02 - 2014-07-11
  during = data.slice(257670, 521008); // 2014-07-12 - 2014-07-21
  // console.log(before, during);

  frameRate(fr);
  ready = true;
}

function draw() {
  if (!ready) {
    return;
  }

  // start sound on when ready
  if (ready && timestamp === 0) {
    bgSound.setVolume(1);
    bgSound.play();
  }

  // clear flash canvas
  flash.clear();

  // calculate current time based on frame rate
  var currentTime = (timestamp / fr) * 1000;

  // add dots before catastrophe
  if (phase === "before") {
    while (before[bIndex] && before[bIndex].timelineMs <= currentTime) {
      // create "blurry" permanent dots
      bMap.fill(cTurquoise[0], cTurquoise[1], cTurquoise[2], 50);
      bMap.ellipse(before[bIndex].positionX, before[bIndex].positionY, 3, 3);
      bMap.fill(cTurquoise[0], cTurquoise[1], cTurquoise[2], 30);
      bMap.ellipse(before[bIndex].positionX, before[bIndex].positionY, 6, 6);
      bMap.fill(cTurquoise[0], cTurquoise[1], cTurquoise[2], 20);
      bMap.ellipse(before[bIndex].positionX, before[bIndex].positionY, 10, 10);
      bMap.fill(cTurquoise[0], cTurquoise[1], cTurquoise[2], 10);
      bMap.ellipse(before[bIndex].positionX, before[bIndex].positionY, 15, 15);

      // create temporary, flashing points
      flash.fill(cTurquoise[0], cTurquoise[1], cTurquoise[2], 75);
      flash.ellipse(before[bIndex].positionX, before[bIndex].positionY, 20, 20);

      bIndex++;
    }
    // end of before array
    if (!before[bIndex]) {
      phase = "during";
      console.log(phase);
      // start the recording
      // capturer.start();
    }
  }

  // add dots during catastrophe
  if (phase === "during") {
    while (during[dIndex] && during[dIndex].timelineMs <= currentTime) {
      // create "blurry" permanent dots
      dMap.fill(cRed[0], cRed[1], cRed[2], 50);
      dMap.ellipse(during[dIndex].positionX, during[dIndex].positionY, 3, 3);
      dMap.fill(cRed[0], cRed[1], cRed[2], 30);
      dMap.ellipse(during[dIndex].positionX, during[dIndex].positionY, 6, 6);
      dMap.fill(cRed[0], cRed[1], cRed[2], 20);
      dMap.ellipse(during[dIndex].positionX, during[dIndex].positionY, 10, 10);
      dMap.fill(cRed[0], cRed[1], cRed[2], 10);
      dMap.ellipse(during[dIndex].positionX, during[dIndex].positionY, 15, 15);

      // create temporary, flashing points
      flash.fill(cRed[0], cRed[1], cRed[2], 75);
      flash.ellipse(during[dIndex].positionX, during[dIndex].positionY, 20, 20);

      dIndex++;
    }
    // end of during array
    if (!during[dIndex]) {
      phase = "end";
      console.log(phase);
    }
  }

  // display centecRed background gradient canvas
  imageMode(CORNER);
  image(canvasBackground, 0, 0, width, height);

  // display bMap, dMap and flash canvas
  image(bMap, 1920, 0, 1920 * 3, 1080, 950, 1800, 1920 * 3, 1080);
  image(dMap, 1920, 0, 1920 * 3, 1080, 950, 1800, 1920 * 3, 1080);
  image(flash, 1920, 0, 1920 * 3, 1080, 950, 1800, 1920 * 3, 1080);

  // definition figure
  rectMode(CORNER);
  fill(cTurquoise[0], cTurquoise[1], cTurquoise[2]);
  strokeWeight(1);
  stroke(cTurquoise[0], cTurquoise[1], cTurquoise[2]);
  rect(2080, 80, 300, 20);
  fill(cDarkBlue[0], cDarkBlue[1], cDarkBlue[2], 220);
  rect(2080, 100, 300, 100);
  noStroke();

  fill(cTurquoise[0], cTurquoise[1], cTurquoise[2]);
  ellipse(2110, 130, 20);
  fill(cRed[0], cRed[1], cRed[2]);
  ellipse(2110, 170, 20);

  textSize(20);
  textAlign(LEFT, TOP);
  fill(cTurquoise[0], cTurquoise[1], cTurquoise[2]);
  text("tweets before typhoon", 2110 + 20, 118);
  fill(cRed[0], cRed[1], cRed[2]);
  text("tweets during typhoon", 2110 + 20, 158);

  // ending overlay
  if (phase === "end") {
    rectMode(CORNER);
    fill(cDarkBlue[0], cDarkBlue[1], cDarkBlue[2], fadeOut);
    rect(0, 0, width, height);
    rectMode(CENTER);
    textSize(72);
    fill(cTurquoise[0], cTurquoise[1], cTurquoise[2], fadeOut);
    textAlign(CENTER, CENTER);
    text("play  again", width / 2, height / 2);

    if (fadeOut <= 220) {
      fadeOut += 2;
    } else {
      // capturer.stop();
      // capturer.save();
    }
  }

  // display info table
  imageMode(CORNER);
  image(info, infoProperties.x, infoProperties.y);

  // display bMap and dMap mini maps
  imageMode(CENTER);
  image(bMap, 960, 540, 1920 * 0.75, 1080 * 0.75, 0, 0, 1920 * 4, 1080 * 4);
  image(dMap, 960, 540, 1920 * 0.75, 1080 * 0.75, 0, 0, 1920 * 4, 1080 * 4);

  // mini map city label
  textAlign(LEFT, TOP);
  textSize(30);
  fill(cTurquoise[0], cTurquoise[1], cTurquoise[2]);
  text("Manila, Philippines", 460, 265);

  // detail area indicator rectangle
  rectMode(CORNER);
  noFill();
  strokeWeight(4);
  if (phase === "before") {
    stroke(cTurquoise[0], cTurquoise[1], cTurquoise[2]);
  } else {
    stroke(cRed[0], cRed[1], cRed[2]);
  }
  if (phase !== "end") {
    rect(420, 470, 1080, 202);
  }
  noStroke();

  // get current number of tweets, format with thousand seperator
  var noTweets = (bIndex + dIndex)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

  // get current date and time (timestamp)
  var displayDate;
  if (phase === "before") {
    displayDate = before[bIndex].dateTime;
  } else if (phase === "during") {
    displayDate = during[dIndex].dateTime;
  } else {
    // last date
    displayDate = during[during.length - 1].dateTime;
  }

  // split timestamp into date and time
  displayDate = displayDate.split(" ");
  displayDateDay = displayDate[0];
  displayDateTime = displayDate[1];

  // display tweet counter, date and time
  fill(cDarkBlue[0], cDarkBlue[1], cDarkBlue[2], 220);
  strokeWeight(1);
  rectMode(CORNER);
  if (phase === "before") {
    stroke(cTurquoise[0], cTurquoise[1], cTurquoise[2]);
  } else {
    stroke(cRed[0], cRed[1], cRed[2]);
  }
  rect(infoProperties.x, infoProperties.y + 700, info.width / 2, 135);
  rect(
    infoProperties.x + info.width / 2,
    infoProperties.y + 700,
    info.width / 2,
    135
  );
  if (phase === "before") {
    fill(cTurquoise[0], cTurquoise[1], cTurquoise[2]);
  } else {
    fill(cRed[0], cRed[1], cRed[2]);
  }
  noStroke();
  rect(infoProperties.x, infoProperties.y + 700, info.width, 20);
  textSize(30);
  textAlign(LEFT, BASELINE);
  text("Nº tweets", infoProperties.x + 20, infoProperties.y + 810);
  text(
    "Date",
    infoProperties.x + infoProperties.width / 2 + 20,
    infoProperties.y + 810
  );
  textSize(38);
  textAlign(RIGHT, BASELINE);
  text(
    noTweets,
    infoProperties.x + infoProperties.width / 2 - 20,
    infoProperties.y + 810
  );
  text(
    displayDateTime,
    infoProperties.x + infoProperties.width - 20,
    infoProperties.y + 770
  );
  text(
    displayDateDay,
    infoProperties.x + infoProperties.width - 20,
    infoProperties.y + 810
  );

  // playback speed
  timestamp = timestamp + 15000;

  // check frame rate
  // if (frameCount % fr == 0) {
  //   console.log(frameRate());
  // }

  // selecte canvas to capture
  // capturer.capture(document.getElementById("defaultCanvas0"));
}

function createBackground(x, y, w, h, inner, outer) {
  // create radial gradient
  canvasBackground.noStroke();
  canvasBackground.fill(0);
  for (let i = Math.max(w, h); i > 0; i--) {
    const step = i / Math.max(w, h);
    const color = lerpColor(inner, outer, step);
    canvasBackground.fill(color);
    canvasBackground.ellipse(x, y, step * w, step * h);
  }

  // create grid
  canvasBackground.noFill();
  canvasBackground.stroke(cTurquoise[0], cTurquoise[1], cTurquoise[2], 10);
  for (var x = 0; x < width; x += width / 128) {
    canvasBackground.line(x, 0, x, height);
  }
  for (var y = 0; y < height; y += height / 18) {
    canvasBackground.line(0, y, width, y);
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
        canvasProperties.width / 2,
      positionY:
        (csv[i].latitude - mapProperties.mapCenterY) * mapProperties.mapScale +
        canvasProperties.height / 2
    };
    data.push(obj);
  }

  // sort entries by date/time
  data = data.sort(compare);

  return data;
}

function infoContent() {
  info.rectMode(CORNER);
  info.noStroke();
  info.fill(1, 6, 25, 220);
  info.rect(0, 0, info.width, 660);
  info.fill(65, 217, 242);
  info.rect(0, 0, info.width, 20);
  info.rect(0, 0, 1, 660);
  info.rect(info.width - 1, 0, 1, 660);
  info.rect(0, 660, info.width, 1);

  info.textFont(fontRegular);

  var description =
    "Typhoon Rammasun, known in the Philippines as Typhoon Glenda, was one of the only two Category 5 super typhoons on record in the South China Sea, with the other one being Pamela in 1954.\n\nRammasun had destructive impacts across the Philippines, South China, and Vietnam in July 2014. Though initially forecast to make landfall in Cagayan Valley, the storm followed a more westerly path and was later forecast to make landfall in the Bicol Region and then pass through Bataan and Zambales before brushing past Metro Manila.\n\nAt least 90% of the total residents of Metro Manila lost power, as poles were toppled and lines downed. Strong winds from the storm destroyed several homes in the slums. Most of the capital area was also completely shut down.";

  info.fill(65, 217, 242);
  info.textSize(54);
  info.text("Rammasun", 20, 75);
  info.textSize(30);
  info.text("god of thunder", 270, 75);
  info.rect(0, 95, info.width, 1);

  info.textAlign(LEFT, TOP);
  info.textSize(20);
  info.text("Formed:", 20, 109);
  info.text("July 9, 2014, brushed past Metro Manila July, 15th", 200, 109);

  info.rect(0, 140, info.width, 1);
  info.text("Highest winds:", 20, 152);
  info.text("10-minute sustained – 165 km/h (105 mph)", 200, 152);
  info.text("1-minute sustained – 260 km/h (160 mph)", 200, 177);

  info.rect(0, 208, info.width, 1);
  info.text("Fatalities:", 20, 220);
  info.text("222 total", 200, 220);
  info.rect(0, 251, info.width, 1);
  info.text("Damage:", 20, 263);
  info.text("$8.03 billion (2014 USD)", 200, 263);

  info.rect(0, 294, info.width, 1);
  info.text(description, 20, 326, info.width - 40, 400);
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
    (canvasProperties.width / 4 / mapWidth) * 3,
    (canvasProperties.height / mapHeight) * 3
  );

  return {
    mapCenterX: mapCenterX,
    mapCenterY: mapCenterY,
    mapScale: mapScale
  };
}

function mousePressed() {
  // reset if sketch is finished
  if (phase === "end") {
    phase = "before";
    timestamp = 0;
    bIndex = 0;
    dIndex = 0;
    fadeOut = 0;
    bMap.clear();
    dMap.clear();
  }
}

// function keyTyped() {
//   console.log("saving canvas");
//   saveCanvas();
//   console.log("done");
// }
