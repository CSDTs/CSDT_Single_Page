class Wampum {
  /**
   * @param {number} start
   * @param {string} color
   * @param {HTMLElement} canvas
   * @param {string} pattern The design of the bead (bead, wampum, stitch, etc.)
   */
  constructor(start, color, isClone, pattern = beadDesign) {
    this._isClone = isClone;

    this._start = {
      x: this._isClone ? start.x : start.x * scale,
      y: this._isClone ? start.y : start.y * -1 * scale,
    };

    this._color = color;
    this._ctx = myCanvas.getContext("2d");

    this._pattern = pattern;
  }

  /** Stamps the image to the canvas
   *
   * @param {number} [point = this._initPoint] Location of the stamp.
   * @param {string} [color = this._initColor] Applies color to the stamp .
   */
  stamp(point = this._start, color = this._color) {
    this._ctx.save();
    this._ctx.scale(1, 1);

    this._ctx.beginPath();

    this._ctx.arc(point.x, point.y, beadSize, 0, Math.PI * 2, false); // Outer circle
    this._ctx.arc(
      point.x - 1.8,
      point.y - 1.8,
      scale / 5,
      0,
      Math.PI * 2,
      true
    );

    this._ctx.fillStyle = color;
    this._ctx.fill();

    this._ctx.restore();
  }

  /** Creates a line on the canvas
   *
   * @param {number} [start = this._initPoint] Start of the row.
   * @param {number} [end = this._endPoint]    End of the row.
   * @param {string} [color = this._initColor] Applies color to the stamp.
   *
   * @return {currentLine} Returns an array of points that creates the line.
   */
  line(start = this._start, end = this._end, color = this._color) {
    let xMin = Math.min(start.x, end.x);
    let yMin = Math.min(start.y, end.y);
    let xMax = Math.max(start.x, end.x);
    let yMax = Math.max(start.y, end.y);

    let m = (end.y - start.y) / (end.x - start.x);
    let b = start.y - m * start.x;

    // User enters same point twice
    if (start.x == end.x && start.y == end.y) {
      this.stamp();
      return;
    }

    //vertical lines
    if (start.x == end.x) {
      for (let i = yMin; i <= yMax; i = i + scale)
        createAndStamp(roundVal(start.x), roundVal(i), color, true);
      return;
    }

    //Horizontal lines
    if (start.y == end.y) {
      for (let i = xMin; i <= xMax; i = i + scale)
        createAndStamp(roundVal(i), roundVal(start.y), color, true);
      return;
    }

    //Typical slope case
    if (Math.abs(m) <= 1.0) {
      let startX = start.x < end.x ? start.x : end.x;
      let endX = start.x < end.x ? end.x : start.x;

      for (let i = startX; i <= endX; i = i + scale) {
        let doubleY = m * i + b;
        let intY = parseInt(doubleY);
        if (Math.abs(doubleY - intY) >= 0.5) {
          intY = doubleY >= 0.0 ? intY++ : intY--;
        }
        createAndStamp(roundVal(i, true), roundVal(intY, true), color, true);
      }
    } else {
      let startY = start.y < end.y ? start.y : end.y;
      let endY = start.y < end.y ? end.y : start.y;
      for (let i = startY; i <= endY; i = i + scale) {
        let doubleX = (i - b) / m;
        let intX = parseInt(doubleX);

        if (Math.abs(doubleX - intX) >= 0.5) {
          intX = doubleX >= 0.0 ? intX++ : intX--;
        }
        createAndStamp(roundVal(intX, true), roundVal(i, true), color, true);
      }
    }
  }

  createPattern() {
    this.stamp();
  }

  /** Based on the pattern name of the current bead, creates the pattern
   *
   */
  displayBeads() {
    this.stamp();
  }

  /** Creates object for saving
   * @return {Object} a serialized version of this bead for saving
   */
  serialize() {
    return {
      pattern: this._pattern,
      start: this._start,
      color: this._color,
    };
  }
}

class LinePattern extends Wampum {
  constructor(start, end, color, isClone) {
    super(start, color, isClone);
    this._end = scalePoint(end, isClone);
    this._pattern = "line";
  }

  createPattern() {
    this.line();
  }

  displayBeads() {
    this.createPattern();
  }

  serialize() {
    return {
      pattern: this._pattern,
      start: this._start,
      end: this._end,
      color: this._color,
    };
  }
}

class RectanglePattern extends Wampum {
  constructor(start, end, color, isClone) {
    super(start, color, isClone);
    this._start = this._start;
    this._end = scalePoint(end, isClone);
    this._color = this._color;
    this._pattern = "rectangle";

    this.xMin = Math.min(this._start.x, this._end.x);
    this.yMin = Math.min(this._start.y, this._end.y);
    this.xMax = Math.max(this._start.x, this._end.x);
    this.yMax = Math.max(this._start.y, this._end.y);
  }

  createPattern() {
    for (let i = this.yMin; i <= this.yMax; i = i + scale)
      for (let j = this.xMin; j <= this.xMax; j = j + scale)
        createAndStamp(j, i, this._color, true);
  }

  displayBeads() {
    this.createPattern();
  }

  serialize() {
    return {
      pattern: this._pattern,
      start: this._start,
      end: this._end,
      color: this._color,
    };
  }
}

class TrianglePattern extends Wampum {
  constructor(start, mid, end, color, isClone) {
    super(start, color, isClone);
    this._end = scalePoint(end, isClone);
    this._mid = scalePoint(mid, isClone);
    this._pattern = "triangle";
  }

  /** Calculates the area of a triangle given three points
   *
   * @param {Object} p1 Bead coordinates (x,y) for initPoint
   * @param {Object} p2 Bead coordinates (x,y) for topPoint
   * @param {Object} p3 Bead coordinates (x,y) for endPoint
   *
   * @return {number} The area of the triangle
   */
  triangleArea(p1, p2, p3) {
    return Math.abs(
      (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2.0
    );
  }

  /** Checks whether a point is inside or outside a triangle's area
   *
   * @param {Object} p1 Bead coordinates for initPoint
   * @param {Object} p2 Bead coordinates for topPoint
   * @param {Object} p3 Bead coordinates for endPoint
   * @param {Object} current  Bead coordinates for a given point
   *
   * @return{boolean} Returns if the given bead is within the triangle
   */
  isInside(current) {
    let area = this.triangleArea(this._start, this._mid, this._end); //area of (init, top, end)
    let area1 = this.triangleArea(current, this._mid, this._end); //area of (point, top, end)
    let area2 = this.triangleArea(this._start, current, this._end); //area of (init, point, end)
    let area3 = this.triangleArea(this._start, this._mid, current); //area of (init, top, point)

    return area == area1 + area2 + area3;
  }

  createPattern() {
    this.line(this._start, this._mid);
    this.line(this._end, this._mid);
    this.line(this._start, this._end);

    for (let i = -300; i <= 300; i = i + scale)
      for (let j = -300; j <= 300; j = j + scale)
        if (this.isInside({ x: j, y: i }))
          createAndStamp(j, i, this._color, true);
  }

  displayBeads() {
    this.createPattern();
  }

  serialize() {
    return {
      pattern: this._pattern,
      start: this._start,
      mid: this._mid,
      end: this._end,
      color: this._color,
    };
  }
}

class LinearIteration extends Wampum {
  constructor(length, start, pre, post, rows, dir, colorA, colorB, isClone) {
    super(start, colorA, isClone);
    this._length = length;
    this._pre = pre;
    this._post = post;

    this._rows = rows;
    this._direction = dir;
    this._iterColor = colorB;
    this.gradient = updateSpitter(colorA, colorB, rows);
    this._pattern = "linear-iteration";
  }

  createPattern() {
    let isAxisY = this._direction.includes("y");
    let isPos =
      this._direction.includes("-y") || this._direction.includes("+x");

    let start = { x: this._start.x, y: this._start.y };

    if (isAxisY) {
      let newX = start.x + this._length * scale - scale;

      for (let i = 0; i < this._rows; i++) {
        if (newX < start.x) {
          for (let j = newX; j <= start.x; j = j + scale)
            this.stampInDirection(true, j, i, start.y);
        } else {
          for (let j = start.x; j <= newX; j = j + scale)
            this.stampInDirection(true, j, i, start.y);
        }

        start.y = isPos ? start.y + scale : start.y - scale;
        start.x -= this._pre * scale;
        newX += this._post * scale;
      }
    } else {
      let newY = start.y + this._length * scale - scale;

      for (let i = 0; i < this._rows; i++) {
        if (newY < start.y) {
          for (let j = newY; j <= start.y; j = j + scale)
            this.stampInDirection(false, j, i, start.x);
        } else {
          for (let j = start.y; j <= newY; j = j + scale)
            this.stampInDirection(false, j, i, start.x);
        }

        start.x = isPos ? start.x + scale : start.x - scale;
        start.y -= this._pre * scale;
        newY += this._post * scale;
      }
    }
  }

  displayBeads() {
    this.createPattern();
  }

  stampInDirection(isIncY, j, i, point) {
    if (isIncY) {
      if (j >= -500 && j <= 500 && point >= -500 && point <= 500)
        createAndStamp(j, point, this.gradient[i], true);
    } else {
      if (point <= 500 && point >= -500 && j <= 500 && j >= -500)
        createAndStamp(point, j, this.gradient[i], true);
    }
  }

  serialize() {
    return {
      pattern: this._pattern,
      length: this._length,
      start: this._start,
      pre: this._pre,
      post: this._post,
      rows: this._rows,
      direction: this._direction,
      colorA: this._color,
      colorB: this._iterColor,
    };
  }
}

class TriangleIteration extends Wampum {
  constructor(start, group, extra, rows, direction, colorA, colorB, isClone) {
    super(start, colorA, isClone);
    this._group = group;
    this._extra = extra;
    this._rows = rows;
    this._direction = direction;
    this._iterColor = colorB;
    this.gradient = updateSpitter(colorA, colorB, Math.ceil(rows / group));
    this._pattern = "triangle-iteration";
  }

  displayBeads() {
    this.createPattern();
  }

  createPattern() {
    let start = { x: this._start.x, y: this._start.y };
    let counter = 0; //Counter for gradient levels
    let forward, back;
    let inc = 0;

    if (this._direction.includes("-")) {
      let yAxis = this._direction.includes("y");
      for (let i = 0; i < this._rows * scale; i = i + scale) {
        if (i % (this._group * scale) == 0 && i != 0) {
          inc = inc + this._extra;
          counter++;
        }
        for (let j = 0; j <= inc; j++) {
          forward = {
            x: yAxis ? start.x + inc * scale : start.x - i,
            y: yAxis ? start.y + i : start.y + inc * scale,
          };
          back = {
            x: yAxis ? start.x - inc * scale : start.x - i,
            y: yAxis ? start.y + i : start.y - inc * scale,
          };
          if (inc == 0)
            createAndStamp(
              yAxis ? start.x : start.x - i,
              yAxis ? start.y + i : start.y,
              this.gradient[counter],
              true
            );
          else this.line(back, forward, this.gradient[counter]);
        }
      }
    } else {
      let yAxis = this._direction.includes("y");
      for (let i = 0; i < this._rows * scale; i = i + scale) {
        if (i % (this._group * scale) == 0 && i != 0) {
          inc = inc + this._extra;
          counter++;
        }
        for (let j = 0; j <= inc; j++) {
          forward = {
            x: yAxis ? start.x + inc * scale : start.x + i,
            y: yAxis ? start.y - i : start.y + inc * scale,
          };
          back = {
            x: yAxis ? start.x - inc * scale : start.x + i,
            y: yAxis ? start.y - i : start.y - inc * scale,
          };
          if (inc == 0)
            createAndStamp(
              yAxis ? start.x : start.x + i,
              yAxis ? start.y - i : start.y,
              this.gradient[counter],
              true
            );
          else this.line(back, forward, this.gradient[counter]);
        }
      }
    }
  }

  serialize() {
    return {
      pattern: this._pattern,
      start: this._start,
      group: this._group,
      extra: this._extra,
      rows: this._rows,
      direction: this._direction,
      colorA: this._color,
      colorB: this._iterColor,
    };
  }
}

function createAndStamp(a, b, ...params) {
  let temp = new Wampum({ x: a, y: b }, ...params);
  temp.stamp();
}

function scalePoint(point, isClone = false) {
  if (isClone) return { x: point.x, y: point.y };
  return { x: point.x * scale, y: point.y * -1 * scale };
}

function roundVal(val, isNeg = false) {
  if (isNeg) return round(val / 10) * 10;
  return Math.round(val / 10) * 10;
}

// Color Functions
////////////////////////////////////////////////////////////////////

/** Get's the type of color for iteration gradients
 *
 * source: https://codepen.io/BangEqual/pen/VLNowO
 *
 * @param{string} val Color value ('#ffffff)
 *
 * @return {string} The type of color value being passed (HEX/RGB/RGBA)
 *
 */
function getType(val) {
  if (val.indexOf("#") > -1) return "HEX";
  if (val.indexOf("rgb(") > -1) return "RGB";
  if (val.indexOf("rgba(") > -1) return "RGBA";
}

/** Process the value irrespective of representation type for the gradients
 *
 * source: https://codepen.io/BangEqual/pen/VLNowO
 *
 * @param{string} type Color type (HEX/RGB/RGBA)
 * @param{string} val Color value ('#ffffff)
 *
 * @return {array} ProcessValue returning the processed value based on type
 *
 */
function processValue(type, value) {
  switch (type) {
    case "HEX": {
      return processHEX(value);
    }
    case "RGB": {
      return processRGB(value);
    }
    case "RGBA": {
      return processRGB(value);
    }
  }
}

/** Return a workable RGB int array [r,g,b] from rgb/rgba representation
 *
 * source: https://codepen.io/BangEqual/pen/VLNow
 * @param{string} val Color value ('#ffffff)
 *
 * @return {array} Returning the processed value based on RGB
 *
 */
function processRGB(val) {
  var rgb = val.split("(")[1].split(")")[0].split(",");
  alert(rgb.toString());
  return [parseInt(rgb[0], 10), parseInt(rgb[1], 10), parseInt(rgb[2], 10)];
}

/** Return a workable RGB int array [r,g,b] from hex representation
 *
 * source: https://codepen.io/BangEqual/pen/VLNow
 * @param{string} val Color value
 *
 * @return {array} Returning the processed value based on HEX
 *
 */
function processHEX(val) {
  //does the hex contain extra char?
  var hex = val.length > 6 ? val.substr(1, val.length - 1) : val;
  // is it a six character hex?
  if (hex.length > 3) {
    //scrape out the numerics
    var r = hex.substr(0, 2);
    var g = hex.substr(2, 2);
    var b = hex.substr(4, 2);

    // if not six character hex,
    // then work as if its a three character hex
  } else {
    // just concat the pieces with themselves
    var r = hex.substr(0, 1) + hex.substr(0, 1);
    var g = hex.substr(1, 1) + hex.substr(1, 1);
    var b = hex.substr(2, 1) + hex.substr(2, 1);
  }
  // return our clean values
  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
}

/** Creates array of colors stepping between two colors
 *
 * source: https://codepen.io/BangEqual/pen/VLNow
 * @param{string} val1El Initial Color
 * @param{string} val2E1 Iteration Color
 * @param{number} stepsEl Number of steps between the colors
 *
 * @return {array} Returning the list of colors stepping from the user's initColor to iterColor
 *
 */
function updateSpitter(val1El, val2El, stepsEl) {
  //attach start value
  var hasSpun = 0;
  var val1RGB = processValue(getType(val1El), val1El);
  var val2RGB = processValue(getType(val2El), val2El);
  var colors = [
    // somewhere to dump gradient
  ];
  // the pre element where we spit array to user
  var spitter = document.getElementById("spitter");

  //the number of steps in the gradient
  var stepsInt = parseInt(stepsEl - 2, 10);
  //the percentage representation of the step
  var stepsPerc = 100 / (stepsInt + 1);

  // diffs between two values
  var valClampRGB = [
    val2RGB[0] - val1RGB[0],
    val2RGB[1] - val1RGB[1],
    val2RGB[2] - val1RGB[2],
  ];

  // build the color array out with color steps
  for (var i = 0; i < stepsInt; i++) {
    var clampedR =
      valClampRGB[0] > 0
        ? pad(
            Math.round((valClampRGB[0] / 100) * (stepsPerc * (i + 1))).toString(
              16
            ),
            2
          )
        : pad(
            Math.round(
              val1RGB[0] + (valClampRGB[0] / 100) * (stepsPerc * (i + 1))
            ).toString(16),
            2
          );

    var clampedG =
      valClampRGB[1] > 0
        ? pad(
            Math.round((valClampRGB[1] / 100) * (stepsPerc * (i + 1))).toString(
              16
            ),
            2
          )
        : pad(
            Math.round(
              val1RGB[1] + (valClampRGB[1] / 100) * (stepsPerc * (i + 1))
            ).toString(16),
            2
          );

    var clampedB =
      valClampRGB[2] > 0
        ? pad(
            Math.round((valClampRGB[2] / 100) * (stepsPerc * (i + 1))).toString(
              16
            ),
            2
          )
        : pad(
            Math.round(
              val1RGB[2] + (valClampRGB[2] / 100) * (stepsPerc * (i + 1))
            ).toString(16),
            2
          );
    colors[i] = ["#", clampedR, clampedG, clampedB].join("");
  }
  colors.unshift(val1El);
  colors.push(val2El);
  return colors;
}

/** Padding function for splitter
 * ==================================
 * source: http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
 */
function pad(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function LightenColor(color, percent) {
  var num = parseInt(color, 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    B = ((num >> 8) & 0x00ff) + amt,
    G = (num & 0x0000ff) + amt;

  return (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
    (G < 255 ? (G < 1 ? 0 : G) : 255)
  )
    .toString(16)
    .slice(1);
}

/**Rounding fix for negative numbers
 *
 * @param {number} v The number to round.
 *
 * @return {number} The number being rounded
 */
function round(v) {
  return (v >= 0 || -1) * Math.round(Math.abs(v));
}
////////////////////////////////////////////////////////////////////
