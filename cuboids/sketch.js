/*
 * @name Cuboids Mirror
 * @description Mirror consiting of cuboids and a single spotlight.
 * Inspired by Wooden Mirror by Daniel Rozin
 *
 * Jack B. Du (github@jackbdu.com)
 * Nov 19, 2021
 */

let bu;
let pw, ph, pd;

/* video capture */
let d; // screen pixel density
let capture; // video capture container
let pg; // p5.js graphics container
let isMirrored; // whether or not video capture is mirrored
let isCropped; // cropped or stretched to fit

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(30);
  capture = createCapture(VIDEO);
  capture.hide();
  d = pixelDensity();
  isMirrored = true;
  isCropped = true;
  reset();
}

function draw() {
  background(0);
  spotLight(255, 255, 255, 0, 0, bu / 2, 0, -height, -height * 4, PI / 2, 1);
  if (!capture.loadedmetadata) {
    /* loading screen before capture is ready */
    if (frameCount % 30 > 15) {
      circle(0, 0, bu / 64);
    }
  } else {
    if (pg === undefined) {
      // create graphics based on capture size when ready
      pg = createGraphics(floor(width / tileSize - 1), floor(height / tileSize -1));
    }
    if (isCropped) {
      /* cropped to fit */
      if (pg.width/pg.height > capture.width/capture.height) {
        let destHeight = pg.width*capture.height/capture.width;
        pg.image(capture, 0, -(destHeight-pg.height)/2, pg.width, destHeight);
      } else {
        let destWidth = pg.height*capture.width/capture.height;
        pg.image(capture, -(destWidth-pg.width)/2, 0, destWidth, pg.height);
      }
    } else {
      /* stretched to fit */
      pg.image(capture, 0, 0, pg.width, pg.height);
    }
    //image(pg, -width/2, -height/2, width, height);
    pg.loadPixels();
    translate(
      -width / 2 + (width % tileSize) / 2 + tileSize,
      -height / 2 + (height % tileSize) / 2 + tileSize,
      0
    );
    for (let i = 0; i < height / tileSize - 2; i++) {
      let j = 0;
      for (; j < width / tileSize - 2; j++) {
        /* rotate at mouse position */
        // if (
        //   j * tileSize + tileSize / 2 < mouseX &&
        //   j * tileSize + (tileSize * 3) / 2 > mouseX &&
        //   i * tileSize + tileSize / 2 < mouseY &&
        //   i * tileSize + (tileSize * 3) / 2 > mouseY
        // ) {
        //   box(pw, ph, pd);
        // } else {
        //   rotateX(0.5);
        //   box(pw, ph, pd);
        //   rotateX(-0.5);
        // }
        let c;
        if (isMirrored) {
          c=color(
            pg.pixels[(d * i * pg.width + pg.width - j - 1) * d * 4],
            pg.pixels[(d * i * pg.width + pg.width - j - 1) * d * 4 + 1],
            pg.pixels[(d * i * pg.width + pg.width - j - 1) * d * 4 + 2]
          ); // mirroring the color
        } else {
          c=color(
            pg.pixels[(d * i * pg.width + j) * d * 4],
            pg.pixels[(d * i * pg.width + j) * d * 4 + 1],
            pg.pixels[(d * i * pg.width + j) * d * 4 + 2]
          );
        }
        push()
        rotateX(PI/2 * brightness(c)/100); // brightness affects the rotate angle
        box(pw, ph, pd);
        pop();
        translate(tileSize, 0, 0); // shift right by one tileSize
      }
      translate(-tileSize * j, tileSize, 0); // shift down by one tileSize, and shift all the way back to left

    }
  }
}

function reset() {
  bu = width > height ? height : width; // shorter edge of the canvas
  pw = bu / 16; // piece width
  ph = pw; // piece height
  pd = pw / 4; // piece depth
  tileSize = pw + pd / 2; // width/height for each tile space
  pg = undefined;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight, WEBGL);
  reset();
}
