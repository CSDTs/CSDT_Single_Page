/** Class representing a single braid and containing methods for drawing it */
class Braid {
  /**
   * @param {number} size width of the braid in pixels
   * @param {number} x x coordinate point
   * @param {number} y y coordinate point
   * @param {number} startAngle the starting angle of the braid
   * @param {string} startReflection the starting reflection of the braid
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
      x: x,
      y: y,
    };
    this.translate(0, 0, startAngle, inRadians);
    this._reflection = startReflection;
  }

  /** Clone constructor
   * Note: this._y + this._size / 2 (if point is in corner or not..)
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
      x: this._x,
      y: this._y,
    };
    newBraid.collisionParams = [];
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
      x: this._x,
      y: this._y,
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
        x: this._x - this._size / 2 + offset,
        y: this._y - this._size / 2 + offset,
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
        x: this._x + this._size - this._size / 2 - offset,
        y: this._y - this._size / 2 + offset,
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
        x: this._x - this._size / 2 + offset,
        y: this._y + this._size - this._size / 2 - offset,
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

  /** Draws vector based on current data stored in braid
   * @param {string} color an optional hex code containt the color to stamp
   * @param {number} width an optional width for the braid strokes
   *
   * @return {Braid} returns "this" for chaining
   */
  vector(midA, midB, color = "#33ff33", width = 1 / 8) {
    // 7 is an arbitrary number for lineWidth that seems to look good
    const lineWidth = this._size * width;
    // Offset keeps all corners of the lines within the size x size square
    const offset = lineWidth / 2;

    this._ctx.beginPath();
    this._ctx.lineWidth = lineWidth;
    this._ctx.strokeStyle = color;

    // Draws arrow body
    this._ctx.moveTo(midA.x, midA.y);
    this._ctx.lineTo(midB.x, midB.y);
    this.collisionParams[0] = {
      x0: midA.x,
      y0: midA.y,
      x1: midB.x,
      y1: midB.y,
    };

    this._ctx.closePath();
    this._ctx.stroke();

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
    const vectorStamp = this.stamp().clone();
    let midA = {
      x: this._x,
      y: this._y,
    };
    let midB = {
      x: this._x,
      y: this._y,
    };

    // Steps into first iteration for the vector to extend (there's probably a better way to do this, but....)
    if (showVector) {
      vectorStamp
        .translate(
          this.iteration.translateX,
          this.iteration.translateY,
          this.iteration.rotationAngle,
          this.iteration.inRadians
        )
        .dilate(this.iteration.dilation);
    }

    for (let i = 0; i < (n ? n : this.iteration.n); i++) {
      if (showVector) {
        midA.x = braidToStamp._midpoint.x;
        midA.y = braidToStamp._midpoint.y;
      }

      braidToStamp
        .translate(
          this.iteration.translateX,
          this.iteration.translateY,
          this.iteration.rotationAngle,
          this.iteration.inRadians
        )
        .dilate(this.iteration.dilation)
        .stamp("#000000");
      if (showVector) {
        vectorStamp
          .translate(
            this.iteration.translateX,
            this.iteration.translateY,
            this.iteration.rotationAngle,
            this.iteration.inRadians
          )
          .dilate(this.iteration.dilation);
        midB.x = braidToStamp._midpoint.x;
        midB.y = braidToStamp._midpoint.y;

        vectorStamp.vector(midA, midB);
      }
    }
    // Allows the vector to extend to its next iteration.
    if (showVector) {
      let vectorN = n ? n : this.iteration.n;
      midA.x = vectorN == 0 ? midA.x : vectorStamp._midpoint.x;
      midA.y = vectorN == 0 ? midA.y : vectorStamp._midpoint.y;
      vectorStamp.vector(midA, midB);
    }
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
}
