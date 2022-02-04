/* eslint-disable */
let applicationID = "";
let gridScale = 2;
let currBufferLength = 0;

let Braids = [];
let currBraidIndex = 0;

const myCanvas = document.getElementById("myCanvas");

let currentProject = new Project(Braids, myCanvas);
let currentUser = new User();

/////////////////////////////////
//Braid
////////////////////////////////

class Braid {
  /**
   * @param {number} size width of the braid in pixels
   * @param {number} x
   * @param {number} y
   * @param {number} startAngle
   * @param {string} startReflection
   * @param {HTMLElement} canvas
   * @param {boolean} inRadians
   */
  constructor(
    size,
    x,
    y,
    startAngle,
    startReflection,
    canvas,
    inRadians = true
  ) {
    this._size = size;
    this._x = x;
    this._y = y;
    this._rotation = 0;
    this._ctx = canvas ? canvas.getContext("2d") : undefined;
    this._midpoint = {
      x: this._x + this._size / 2,
      y: this._y + this._size / 2,
    };
    this.translate(0, 0, startAngle, inRadians);
    this._reflection = startReflection;
    this._encryptedMessage = false;
    this._colorArray = [];
  }

  /** Clone constructor
   * @return {Braid} returns a copy of the current braid
   */
  clone() {
    const newBraid = new Braid(
      this._size,
      this._x,
      this._y,
      this._startAngle,
      this._reflection
    );
    newBraid._ctx = this._ctx;
    newBraid._rotation = this._rotation;
    newBraid._x = this._x;
    newBraid._y = this._y;
    newBraid._midpoint = {
      x: this._x + this._size / 2,
      y: this._y + this._size / 2,
    };
    newBraid.collisionParams = [];
    newBraid._colorArray = this._colorArray;
    return newBraid;
  }

  /** Moves the braid on the x,y plane without rotating or resizing
   * @param {number} dx Amount x should change by in percent
   * @param {number} dy Amount x should change by in percent
   * @param {number} angle Angle of rotation
   * @param {boolean} inRadians Whether "angle" was given in radians
   *
   * @return {Braid} returns "this" for chaining
   */
  translate(dx, dy, angle, inRadians) {
    this._rotation += inRadians ? angle : degToRad(angle);
    let reflectionX =
      this._reflection == null ? 1 : this._reflection.includes("y") ? -1 : 1;
    let reflectionY =
      this._reflection == null ? 1 : this._reflection.includes("x") ? -1 : 1;
    // console.log(reflection);
    const newMidpoint = rotateAroundPoint(
      {
        x: (this._size * dx) / 100,
        y: (this._size * dy) / 100,
      },
      this._rotation,
      {
        x: 0,
        y: 0,
      }
    );
    this._x += newMidpoint.x * reflectionX;
    this._y += newMidpoint.y * reflectionY;
    this._midpoint.x += newMidpoint.x;
    this._midpoint.y += newMidpoint.y;
    this.collisionParams = [];

    return this;
  }

  /** Reflects the braid across x or y axis
   * @param {string} axis the axis of reflection (x,y)
   *
   * @return {Braid} returns "this" for chaining
   */
  setReflection(axis) {
    this._reflection = axis;
    return this;
  }

  /** Changes the size of the braid
   * @param {number} dilation percentage of the current size
   *
   * @return {Braid} returns "this" for chaining
   */
  dilate(dilation) {
    this._size *= dilation / 100;
    this._midpoint = {
      x: this._x + this._size / 2,
      y: this._y + this._size / 2,
    };
    return this;
  }

  /** Draws braid based on current data stored in braid
   * @param {string} color an optional hex code containt the color to stamp
   * @param {number} width an optional width for the braid strokes
   *
   * @return {Braid} returns "this" for chaining
   */
  stamp(color = "#000000", width = 1 / 7) {
    // 7 is an arbitrary number for lineWidth that seems to look good
    const lineWidth = this._size * width;
    // Offset keeps all corners of the lines within the size x size square
    const offset = lineWidth / 2;
    // Rotate all points to be used around corner
    const position = {
      x: this._x,
      y: this._y,
    };
    let upperLeftCorner = rotateAroundPoint(
      {
        x: this._x + offset,
        y: this._y + offset,
      },
      this._rotation,
      position
    );
    upperLeftCorner = reflect(
      upperLeftCorner.x,
      upperLeftCorner.y,
      this._midpoint.x,
      this._midpoint.y,
      this._reflection
    );
    let midPoint = rotateAroundPoint(
      {
        x: this._midpoint.x,
        y: this._midpoint.y,
      },
      this._rotation,
      position
    );
    midPoint = reflect(
      midPoint.x,
      midPoint.y,
      this._midpoint.x,
      this._midpoint.y,
      this._reflection
    );
    let upperRightCorner = rotateAroundPoint(
      {
        x: this._x + this._size - offset,
        y: this._y + offset,
      },
      this._rotation,
      position
    );
    upperRightCorner = reflect(
      upperRightCorner.x,
      upperRightCorner.y,
      this._midpoint.x,
      this._midpoint.y,
      this._reflection
    );
    let lowerLeftCorner = rotateAroundPoint(
      {
        x: this._x + offset,
        y: this._y + this._size - offset,
      },
      this._rotation,
      position
    );
    lowerLeftCorner = reflect(
      lowerLeftCorner.x,
      lowerLeftCorner.y,
      this._midpoint.x,
      this._midpoint.y,
      this._reflection
    );
    this._ctx.beginPath();
    this._ctx.lineWidth = lineWidth;
    this._ctx.strokeStyle = color;

    // Draws left arm
    this._ctx.moveTo(upperLeftCorner.x, upperLeftCorner.y);
    this._ctx.lineTo(midPoint.x, midPoint.y);
    this.collisionParams[0] = {
      x0: upperLeftCorner.x,
      y0: upperLeftCorner.y,
      x1: midPoint.x,
      y1: midPoint.y,
    };
    // Draws right arm
    this._ctx.moveTo(upperRightCorner.x, upperRightCorner.y);
    this._ctx.lineTo(lowerLeftCorner.x, lowerLeftCorner.y);
    this.collisionParams[1] = {
      x0: upperRightCorner.x,
      y0: upperRightCorner.y,
      x1: lowerLeftCorner.x,
      y1: lowerLeftCorner.y,
    };

    this._ctx.closePath();
    this._ctx.stroke();

    return this;
  }

  /** Draws extended vector based on current data stored in braid
   * @param {string} color an optional hex code containt the color to stamp
   * @param {number} width an optional width for the braid strokes
   *
   * @return {Braid} returns "this" for chaining
   */
  vectorFix(color = "#000000", width = 1 / 7) {
    // 7 is an arbitrary number for lineWidth that seems to look good
    const lineWidth = this._size * width;
    // Offset keeps all corners of the lines within the size x size square
    const offset = lineWidth / 2;
    // Rotate all points to be used around corner
    const position = {
      x: this._x,
      y: this._y,
    };
    let upperLeftCorner = rotateAroundPoint(
      {
        x: this._x + offset,
        y: this._y + offset,
      },
      this._rotation,
      position
    );
    upperLeftCorner = reflect(
      upperLeftCorner.x,
      upperLeftCorner.y,
      this._midpoint.x,
      this._midpoint.y,
      this._reflection
    );
    let midPoint = rotateAroundPoint(
      {
        x: this._midpoint.x,
        y: this._midpoint.y,
      },
      this._rotation,
      position
    );
    midPoint = reflect(
      midPoint.x,
      midPoint.y,
      this._midpoint.x,
      this._midpoint.y,
      this._reflection
    );
    let upperRightCorner = rotateAroundPoint(
      {
        x: this._x + this._size - offset,
        y: this._y + offset,
      },
      this._rotation,
      position
    );
    upperRightCorner = reflect(
      upperRightCorner.x,
      upperRightCorner.y,
      this._midpoint.x,
      this._midpoint.y,
      this._reflection
    );
    let lowerLeftCorner = rotateAroundPoint(
      {
        x: this._x + offset,
        y: this._y + this._size - offset,
      },
      this._rotation,
      position
    );
    lowerLeftCorner = reflect(
      lowerLeftCorner.x,
      lowerLeftCorner.y,
      this._midpoint.x,
      this._midpoint.y,
      this._reflection
    );

    return this;
  }

  /** Iterates, creating n stamped copies of the braid,
   * each using the same translation
   * @param {number} translateX percentage
   * @param {number} translateY percentage
   * @param {number} rotationAngle
   * @param {boolean} inRadians
   * @param {number} dilation percentage
   * @param {number} n number of iterations
   *
   * @return {Braid} returns this for chaining
   */
  iterate(translateX, translateY, rotationAngle, inRadians, dilation, n) {
    if (dilation || n) {
      this.setIterationParameters(
        translateX,
        translateY,
        rotationAngle,
        inRadians,
        dilation,
        n
      );
    }
    const braidToStamp = this.stamp().clone();
    for (let i = 0; i < (n ? n : this.iteration.n); i++) {
      braidToStamp
        .translate(
          this.iteration.translateX,
          this.iteration.translateY,
          this.iteration.rotationAngle,
          this.iteration.inRadians
        )
        .dilate(this.iteration.dilation)
        .stamp(this._colorArray[i]);
    }
    // Extends the initial vector todo
    braidToStamp
      .translate(
        this.iteration.translateX + 30,
        this.iteration.translateY,
        this.iteration.rotationAngle,
        this.iteration.inRadians
      )
      .dilate(this.iteration.dilation)
      .vectorFix();
    return this;
  }

  /** Save or edit paramters for iteration
   * @param {number} translateX percentage
   * @param {number} translateY percentage
   * @param {number} rotationAngle
   * @param {boolean} inRadians
   * @param {number} dilation percentage
   * @param {number} n number of iterations
   *
   * @return {Braid} returns this for chaining
   */
  setIterationParameters(
    translateX,
    translateY,
    rotationAngle,
    inRadians,
    dilation,
    n
  ) {
    this.iteration = {
      translateX,
      translateY,
      rotationAngle,
      inRadians,
      dilation,
      n,
    };
    return this;
  }

  /** Returns whether or not the braid contains the given coordinate
   * @param {number} x
   * @param {number} y
   *
   * @return {boolean}
   */
  contains(x, y) {
    const dx = this._midpoint.x - x;
    const dy = this._midpoint.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= this._size / 2;
  }

  /**
   * @return {Object} a serialized version of this braid for saving
   */
  serialize() {
    return {
      size: this._size,
      x: this._x,
      y: this._y,
      rotation: this._rotation,
      reflection: this._reflection,
      iteration: this.iteration,
    };
  }

  /**Sets each stamp to a color based on string
   * @param{string} message
   *
   * @return {Braid} returns this for chaining
   */
  setEncryptedMessage(message) {
    let colorArr = [];
    // message = message.ignoreCase;
    for (let i = 0; i < message.length; i++) {
      colorArr[i] =
        "hsl(" +
        Math.round(message.charCodeAt(i) - 65 / 15) * 15 +
        ",100%, 50%)";
    }

    // Math.round(message.charCodeAt(i)-65/ 10) * 10,

    this._encryptedMessage = true;
    this._colorArray = colorArr;
    return this;
  }
}

/////////////////////////////////
//Helper Functions
////////////////////////////////

/** Rotates one point around another
 * @param {object} A
 * @param {number} angle
 * @param {object} B
 *
 * @return {object} returns "A" rotated "angle" radians around "B"
 */
function rotateAroundPoint(A, angle, B) {
  return {
    x: (A.x - B.x) * Math.cos(angle) - (A.y - B.y) * Math.sin(angle) + B.x,
    y: (A.y - B.y) * Math.cos(angle) + (A.x - B.x) * Math.sin(angle) + B.y,
  };
}

/** Reflect
 * @param {number} x starting x
 * @param {number} y starting y
 * @param {number} midX x coordinate of the point of reflection
 * @param {number} midY y coordinate of the point of reflection
 * @param {string} axis axis of reflection (x, y, xy)
 *
 * @return {object} a point containing the reflected x and y
 */
function reflect(x, y, midX, midY, axis) {
  return {
    x: axis.includes("y") ? 2 * midX - x : x,
    y: axis.includes("x") ? 2 * midY - y : y,
  };
}

/** Convert degrees to radians
 * @param {number} angle
 *
 * @return {number}
 */
function degToRad(angle) {
  return (angle * Math.PI) / 180;
}

/** Convert radians to degrees
 * @param {number} angle
 *
 * @return {number}
 */
function radToDeg(angle) {
  return (angle * 180) / Math.PI;
}

/** Sets parameters to those for a certain braid*/
function setParamsForBraid(braid) {
  $("#start-x").val(braid._x - myCanvas.width / 2);
  $("#start-y").val(-(braid._y - myCanvas.height / 2));
  $("#start-angle").val(radToDeg(braid._rotation));
  $("#start-dilation").val((braid._size * 2000) / myCanvas.width);
  $("#reflectx").prop("checked", braid._reflection.includes("x"));
  $("#reflecty").prop("checked", braid._reflection.includes("y"));
  $("#iterations").val(braid.iteration.n);
  $("#x-translation").val(braid.iteration.translateX);
  $("#rotation").val(braid.iteration.rotationAngle);
  $("#dilation").val(braid.iteration.dilation);
}

/////////////////////////////////
//App Functions
////////////////////////////////

/** loads canvas at the correct height and iterates with current settings */
function loadCanvas() {
  // Gets all form values
  const ctx = myCanvas.getContext("2d");
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

  const iterations = $("#message").val();
  const startX = -200.0;
  const startY = -100.0;
  const startAngle = 0;
  const startingDilation = 200.0;
  const xTranslation = parseFloat($("#x-translation").val());
  const rotation = parseFloat($("#rotation").val() * -1);
  const dilation = parseFloat($("#dilation").val());
  const xReflection = false;
  const yReflection = false;
  const reflection = "" + (xReflection ? "x" : "") + (yReflection ? "y" : "");

  // Dynamically resizes canvas and data form
  if ($(window).width() < 992 && $("#canvas-container").hasClass("col-6")) {
    $("#canvas-container").toggleClass("col-6 col-12");
    $("#data-container").toggleClass("col-6 col-12");
  } else if (
    $(window).width() >= 992 &&
    $("#canvas-container").hasClass("col-12")
  ) {
    $("#canvas-container").toggleClass("col-12 col-6");
    $("#data-container").toggleClass("col-12 col-6");
  }

  myCanvas.width = parseInt(window.getComputedStyle(myCanvas).width) - 2;

  myCanvas.height = myCanvas.width;

  Braids[currBraidIndex] = new Braid(
    (myCanvas.width * startingDilation) / 2000,
    myCanvas.width / 2 + startX,
    myCanvas.height / 2 + startY,
    startAngle,
    reflection,
    myCanvas,
    false
  )
    .setIterationParameters(
      xTranslation,
      0,
      rotation,
      false,
      dilation,
      iterations.length
    )
    .setEncryptedMessage(iterations);

  ctx.beginPath();

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#8e8e8e55";
  for (let i = myCanvas.width / 2; i >= 0; i -= 10) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, myCanvas.height);
    ctx.moveTo(0, i);
    ctx.lineTo(myCanvas.width, i);
    ctx.moveTo(myCanvas.width - i, 0);
    ctx.lineTo(myCanvas.width - i, myCanvas.height);
    ctx.moveTo(0, myCanvas.width - i);
    ctx.lineTo(myCanvas.width, myCanvas.width - i);
  }
  ctx.closePath();
  ctx.stroke();

  //Draws the X and Y axis
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(myCanvas.width / 2, 0);
  ctx.lineTo(myCanvas.width / 2, myCanvas.height);
  ctx.moveTo(0, myCanvas.height / 2);
  ctx.lineTo(myCanvas.width, myCanvas.height / 2);
  ctx.closePath();
  ctx.stroke();

  for (let i = 0; i < Braids.length; i++) {
    if (i === currBraidIndex) {
      Braids[i]
        .clone()
        .translate(
          -5 * (yReflection ? -1 : 1),
          -5 * (xReflection ? -1 : 1),
          0,
          0
        )
        .dilate(110)
        .stamp("#FF0000", 12 / 70);
    }
    Braids[i].iterate();
  }
}

/** loads current braids into select for easier navigation */
function loadBraids() {
  $("#braid-select").html("");
  for (let i = 0; i < Braids.length; i++) {
    $("#braid-select").append(
      $("<option>", {
        value: i,
        text: "Braid " + (i + 1),
        selected: currBraidIndex == i ? true : false,
      })
    );
  }
}

/** Initializes the application */
function initApplication() {
  cloud.initBasic();
  loadCanvas();
  setLoadingOverlay(true, false);
}

window.addEventListener("resize", loadCanvas);

document.querySelector("body").addEventListener("resize", () => {
  loadCanvas();
});
document.querySelector("#data-form").addEventListener("change", () => {
  loadCanvas();
});
document.querySelector("#data-form").addEventListener("keyup", () => {
  loadCanvas();
});
document.querySelector("#data-form").addEventListener("input", () => {
  loadCanvas();
});

document.querySelector("#myCanvas").addEventListener("mouseleave", () => {
  loadCanvas();
});
document.querySelector("#myCanvas").addEventListener("click", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  for (let i = 0; i < Braids.length; i++) {
    if (Braids[i].contains(x, y)) {
      currBraidIndex = i;
      setParamsForBraid(Braids[i]);
      loadCanvas();
      loadBraids();
      break;
    }
  }
});

initApplication();
