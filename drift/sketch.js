/*
 * @name Virtual Mirror - Drift
 * @description Mirror consisting of drifting strokes animated with simplex noise.
 * Inspired by macOS screen saver - Drift
 *
 * Jack B. Du (github@jackbdu.com)
 * Nov 19, 2021
 */

let d; // screen pixel density

let capture; // video capture container
let pg; // p5.js graphics container

let isMirrored;
let isCropped; // cropped or stretched to fit

const simplex = new SimplexNoise();
let bu; // base unit
let noiseDensity;
let furs;
let gradientStepQty;
let gradientStepSize;
let brightnessAdjustment;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  capture = createCapture(VIDEO);
  capture.hide();
  d = pixelDensity();
  speed = 1 / 2 ** 8; // speed of the movement
  res = 32; // size of a tile for each fur
  gradientStepQty = 8; // number of steps for fur gradient
  gradientStepSize = 0.9; // how much shorter for each step of gradient
  brightnessAdjustment = 1;
  isMirrored = true;
  isCropped = true;
  reset();
}

function draw() {
  background(0);
  if (!capture.loadedmetadata) {
    // loading screen if capture not ready
    fill(255);
    if (frameCount % 30 > 15) {
      circle(width / 2, height / 2, bu / 64);
    }
  } else {
    if (pg === undefined) {
      // create graphics based on capture size when ready
      pg = createGraphics(floor(width / tileSize), floor(height / tileSize));
    } else {
      if (isCropped) {
        /* cropped to fit */
        if (pg.width / pg.height > capture.width / capture.height) {
          let destHeight = (pg.width * capture.height) / capture.width;
          pg.image(
            capture,
            0,
            -(destHeight - pg.height) / 2,
            pg.width,
            destHeight
          );
        } else {
          let destWidth = (pg.height * capture.width) / capture.height;
          pg.image(
            capture,
            -(destWidth - pg.width) / 2,
            0,
            destWidth,
            pg.height
          );
        }
      } else {
        /* stretched to fit */
        pg.image(capture, 0, 0, pg.width, pg.height);
      }
      // image(pg, 0, 0, width, height);
      pg.loadPixels();
      //console.log(pg.pixels);
      try {
        for (let i = 0; i < floor(height / tileSize); i++) {
          for (let j = 0; j < floor(width / tileSize); j++) {
            let c;
            if (isMirrored) {
              c = color(
                pg.pixels[(d * i * pg.width + pg.width - j - 1) * d * 4],
                pg.pixels[(d * i * pg.width + pg.width - j - 1) * d * 4 + 1],
                pg.pixels[(d * i * pg.width + pg.width - j - 1) * d * 4 + 2]
              ); // mirroring the color
            } else {
              c = color(
                pg.pixels[(d * i * pg.width + j) * d * 4],
                pg.pixels[(d * i * pg.width + j) * d * 4 + 1],
                pg.pixels[(d * i * pg.width + j) * d * 4 + 2]
              );
            }
            //circle(furs[(i * width) / tileSize + j].pos.x, furs[(i * width) / tileSize + j].pos.y, 10);
            // rotation based on simplex noise
            furs[i * floor(width / tileSize) + j].rotate(
              2 *
                tileSize *
                simplex.noise3D(
                  i * noiseDensity,
                  j * noiseDensity,
                  frameCount * speed
                ),
              2 *
                tileSize *
                simplex.noise3D(
                  i * noiseDensity,
                  j * noiseDensity,
                  100 + frameCount * speed
                )
            );
            furs[i * floor(width / tileSize) + j].display(c);
          }
        }
      } catch (e) {
        // error when increasing window size, trying to access a pixel that does not exist
        console.log(e);
      }
    }
  }
}

function Drift(x, y) {
  this.pos = new createVector(x, y);
  this.dir = new createVector(x, y);
}

Drift.prototype.rotate = function (x, y) {
  this.dir = new createVector(x, y);
};

Drift.prototype.display = function (c) {
  c.setAlpha(
    ((255 * this.dir.mag()) / tileSize / gradientStepQty) * brightnessAdjustment
  );
  stroke(c);

  strokeWeight(this.dir.mag() / 8);
  let start = this.pos.copy();
  let end = p5.Vector.add(this.pos, this.dir.setMag(this.dir.mag() + tileSize));
  // my implementation of gradient
  for (let i = 0; i < gradientStepQty; i++) {
    line(start.x, start.y, end.x, end.y);
    this.dir.mult(gradientStepSize);
    start = p5.Vector.sub(end, this.dir);
  }
  //line(this.pos.x, this.pos.y, dest.x, dest.y);
  c.setAlpha(255 / 2);
  stroke(c);
  point(end.x, end.y);
};

function reset() {
  furs = [];
  bu = width > height ? height : width; // shorter edge of canvas
  noiseDensity = 0.03;
  tileSize = bu / res;
  pg = undefined;
  for (let i = 0; i < floor(height / tileSize); i++) {
    for (let j = 0; j < floor(width / tileSize); j++) {
      furs.push(
        new Drift(j * tileSize + tileSize / 2, i * tileSize + tileSize / 2)
      );
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reset();
}
