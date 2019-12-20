// Global variables
var bMap, dMap, flash, backgroundGradient, info, glow, fontRegular;
var bMapWidth = (dMapWidth = flashWidth = 1920 * 4);
var bMapHeight = (dMapHeight = flashHeight = 1080 * 4);
var infoProperties = {
  width: 1000,
  height: 880,
  x: 6230,
  y: 120
};
var fr = 30;

// State variables
var fadeOut = 0;
var fadeIn = 255;
var ready = false;
var data = [],
  before = [],
  during = [];
var phase = "before";
var timestamp = 0,
  bIndex = 0,
  dIndex = 0;

function preload() {
  fontRegular = loadFont("assets/ShareTechMono.ttf");
}

async function setup() {
  createCanvas(1920 * 4, 1080);
  textFont(fontRegular);

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

  bMap = createGraphics(bMapWidth, bMapHeight);
  bMap.noStroke();
  dMap = createGraphics(dMapWidth, dMapHeight);
  dMap.noStroke();
  flash = createGraphics(flashWidth, flashHeight);
  flash.noStroke();
  info = createGraphics(infoProperties.width, infoProperties.height);
  infoContent();

  frameRate(fr);
  ready = true;
}

function draw() {
  if (!ready) {
    return;
  }
  var currentTime = (timestamp / fr) * 1000;

  flash.clear();

  // display dots before catastrophe
  if (phase === "before") {
    while (before[bIndex] && before[bIndex].timelineMs <= currentTime) {
      bMap.fill(65, 217, 242, 50);
      bMap.ellipse(before[bIndex].positionX, before[bIndex].positionY, 3, 3);
      bMap.fill(65, 217, 242, 30);
      bMap.ellipse(before[bIndex].positionX, before[bIndex].positionY, 6, 6);
      bMap.fill(65, 217, 242, 20);
      bMap.ellipse(before[bIndex].positionX, before[bIndex].positionY, 10, 10);
      bMap.fill(65, 217, 242, 10);
      bMap.ellipse(before[bIndex].positionX, before[bIndex].positionY, 15, 15);

      // flashing points
      flash.fill(65, 217, 242, 75);
      flash.ellipse(before[bIndex].positionX, before[bIndex].positionY, 20, 20);

      bIndex++;
    }
    if (!before[bIndex]) {
      phase = "during";
      console.log(phase);
    }
  }

  // display dots during catastrophe
  if (phase === "during") {
    while (during[dIndex] && during[dIndex].timelineMs <= currentTime) {
      dMap.fill(230, 5, 14, 50);
      dMap.ellipse(during[dIndex].positionX, during[dIndex].positionY, 3, 3);
      dMap.fill(230, 5, 14, 30);
      dMap.ellipse(during[dIndex].positionX, during[dIndex].positionY, 6, 6);
      dMap.fill(230, 5, 14, 20);
      dMap.ellipse(during[dIndex].positionX, during[dIndex].positionY, 10, 10);
      dMap.fill(230, 5, 14, 10);
      dMap.ellipse(during[dIndex].positionX, during[dIndex].positionY, 15, 15);

      // flashing points
      flash.fill(230, 5, 14, 75);
      flash.ellipse(during[dIndex].positionX, during[dIndex].positionY, 20, 20);

      dIndex++;
    }
    if (!during[dIndex]) {
      phase = "end";
      console.log(phase);
    }
  }

  // background canvas
  imageMode(CORNER);
  image(backgroundGradient, 0, 0, width, height);
  // display offscreen canvases
  image(bMap, 1920, 0, 1920 * 3, 1080, 950, 1800, 1920 * 3, 1080); // large map before
  image(dMap, 1920, 0, 1920 * 3, 1080, 950, 1800, 1920 * 3, 1080); // large map during
  image(flash, 1920, 0, 1920 * 3, 1080, 950, 1800, 1920 * 3, 1080); // flashing points

  // zoom indicator rectangle
  rectMode(CORNER);
  noFill();
  strokeWeight(4);
  if (phase === "before") {
    stroke(65, 217, 242);
  } else {
    stroke(230, 5, 14);
  }
  rect(420, 470, 1080, 202);
  noStroke();

  // Legend
  rectMode(CORNER);
  fill(65, 217, 242);
  strokeWeight(1);
  stroke(65, 217, 242);
  rect(2080, 80, 300, 20);
  fill(1, 6, 25, 220);
  rect(2080, 100, 300, 100);
  noStroke();

  fill(65, 217, 242);
  ellipse(2110, 130, 20);
  fill(230, 5, 14);
  ellipse(2110, 170, 20);

  textSize(20);
  textAlign(LEFT, TOP);
  fill(65, 217, 242);
  text("tweets before typhoon", 2110 + 20, 118);
  fill(230, 5, 14);
  text("tweets during typhoon", 2110 + 20, 158);

  // end overlay
  if (phase === "end") {
    rectMode(CORNER);
    fill(1, 6, 25, fadeOut);
    rect(0, 0, width, height);
    rectMode(CENTER);
    textSize(72);
    fill(65, 217, 242, fadeOut);
    textAlign(CENTER, CENTER);
    text("play  again", width / 2, height / 2);

    if (fadeOut < 220) {
      fadeOut += 2;
    }
  }

  imageMode(CORNER);
  image(info, infoProperties.x, infoProperties.y);

  imageMode(CENTER);
  image(bMap, 960, 540, 1920 * 0.75, 1080 * 0.75, 0, 0, 1920 * 4, 1080 * 4); //  mini map before
  image(dMap, 960, 540, 1920 * 0.75, 1080 * 0.75, 0, 0, 1920 * 4, 1080 * 4); //  mini map during

  // dynamic text
  var noTweets = (bIndex + dIndex)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

  var displayDate;
  if (phase === "before") {
    displayDate = before[bIndex].dateTime;
  } else if (phase === "during") {
    displayDate = during[dIndex].dateTime;
  } else {
    displayDate = during[during.length - 1].dateTime;
  }

  displayDate = displayDate.split(" ");
  displayDateDay = displayDate[0];
  displayDateTime = displayDate[1];

  textAlign(LEFT, TOP);
  textSize(30);
  fill(65, 217, 242);
  text("Manila, Philippines", 440, 265);

  fill(1, 6, 25, 220);
  strokeWeight(1);
  rectMode(CORNER);
  if (phase === "before") {
    stroke(65, 217, 242);
  } else {
    stroke(230, 5, 14);
  }
  rect(infoProperties.x, infoProperties.y + 700, info.width / 2, 135);
  rect(
    infoProperties.x + info.width / 2,
    infoProperties.y + 700,
    info.width / 2,
    135
  );
  if (phase === "before") {
    fill(65, 217, 242);
  } else {
    fill(230, 5, 14);
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

  // if (frameCount % fr == 0) {
  //   console.log(frameRate());
  // }
}

function radialGradient(x, y, w, h, inner, outer) {
  backgroundGradient.noStroke();
  backgroundGradient.fill(0);
  for (let i = Math.max(w, h); i > 0; i--) {
    const step = i / Math.max(w, h);
    const color = lerpColor(inner, outer, step);
    backgroundGradient.fill(color);
    backgroundGradient.ellipse(x, y, step * w, step * h);
  }

  backgroundGradient.noFill();
  backgroundGradient.stroke(65, 217, 242, 10);

  for (var x = 0; x < width; x += width / 128) {
    backgroundGradient.line(x, 0, x, height);
  }

  for (var y = 0; y < height; y += height / 18) {
    backgroundGradient.line(0, y, width, y);
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
        bMapWidth / 2,
      positionY:
        (csv[i].latitude - mapProperties.mapCenterY) * mapProperties.mapScale +
        bMapHeight / 2
    };
    data.push(obj);
  }

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
    (bMapWidth / 4 / mapWidth) * 3,
    (bMapHeight / mapHeight) * 3
  );

  return {
    mapCenterX: mapCenterX,
    mapCenterY: mapCenterY,
    mapScale: mapScale
  };
}

function compareMaps() {
  imageMode(CENTER);
  image(bMap, 960, 540, 1920 * 0.75, 1080 * 0.75, 0, 0, 1920 * 4, 1080 * 4); //  mini map before
  image(dMap, 960, 540, 1920 * 0.75, 1080 * 0.75, 0, 0, 1920 * 4, 1080 * 4); //  mini map during
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

function keyTyped() {
  console.log("saving canvas");
  saveCanvas();
  console.log("done");
}
