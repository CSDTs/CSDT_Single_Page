class Wampum {
  /**
   * @param {number} initPoint
   * @param {string} initColor
   * @param {HTMLElement} canvas
   * @param {string} pattern The design of the bead (bead, wampum, stitch, etc.)
   */
  constructor(initPoint, initColor, canvas, isClone, pattern = beadDesign) {
    this._isClone = isClone;

    this._isClone
      ? (this._initPoint = {
          x: initPoint.x,
          y: initPoint.y,
        })
      : (this._initPoint = {
          x: initPoint.x * scale,
          y: initPoint.y * -1 * scale,
        });

    this._initColor = initColor;
    this._ctx = canvas ? canvas.getContext("2d") : undefined;

    this._endPoint = {
      x: 0,
      y: 0,
    };
    this._topPoint = {
      x: 0,
      y: 0,
    };

    this._rows = 0;
    this._iterColor = "#ffffff";

    this._linearRowLength = 0;
    this._linearPreNum = 0;
    this._linearPostNum = 0;

    this._triRowGroup = 0;
    this._triRowPrePost = 0;

    this._direction = 0;

    this._pattern = pattern;
  }

  /** Sets an end point for a line or a rectangle
   *
   * @param {number} endPoint
   */
  setEndPoint(endPoint) {
    this._endPoint = {
      x: endPoint.x * scale,
      y: endPoint.y * -1 * scale,
    };
  }

  /** Sets a top and an end point for a triangle
   *
   * @param {number} topPoint
   * @param {number} endPoint
   */
  setTriangle(topPoint, endPoint) {
    this._topPoint = {
      x: topPoint.x * scale,
      y: topPoint.y * -1 * scale,
    };

    this._endPoint = {
      x: endPoint.x * scale,
      y: endPoint.y * -1 * scale,
    };
  }

  /** Sets the corresponding params for a linear iteration
   *
   * @param {number} rowLength The starting lenght of the row
   * @param {number} pre The value added at the start of each row
   * @param {number} post The value added at the end of each row
   * @param {number} rows Number of rows total
   * @param {string} direction X+, X-, Y+, Y-
   * @param {string} color The additional color for the iteration gradient
   */
  setLinearIteration(rowLength, pre, post, rows, direction, color) {
    this._linearRowLength = rowLength;
    this._linearPreNum = pre;
    this._linearPostNum = post;

    this._rows = rows;
    this._direction = direction;
    this._iterColor = color;
  }

  /** Sets the corresponding params for a triangle iteration
   *
   * @param {number} group The number of rows for each grouping
   * @param {number} num The value added at the start and end of each row
   * @param {number} rows Number of rows total
   * @param {string} direction X+, X-, Y+, Y-
   * @param {string} color The additional color for the iteration gradient
   */
  setTriangleIteration(group, num, rows, direction, color) {
    this._triRowGroup = group;
    this._triRowPrePost = num;

    this._rows = rows;
    this._direction = direction;
    this._iterColor = color;
  }

  /** Stamps the image to the canvas
   *
   * @param {number} [point = this._initPoint] Location of the stamp.
   * @param {string} [color = this._initColor] Applies color to the stamp .
   */
  stamp(point = this._initPoint, color = this._initColor) {
    this._ctx.save();
    this._ctx.scale(1, 1);

    this._ctx.beginPath();

    if (navajoKnots) {
      this._ctx.ellipse(
        point.x,
        point.y,
        beadSize,
        beadSize / 2,
        -0.08 * Math.PI,
        0,
        2 * Math.PI,
        false
      );
      this._ctx.ellipse(
        point.x + beadSize,
        point.y + beadSize,
        beadSize,
        beadSize / 2,
        -0.08 * Math.PI,
        0,
        2 * Math.PI,
        false
      );
      this._ctx.ellipse(
        point.x - beadSize,
        point.y - beadSize,
        beadSize,
        beadSize / 2,
        -0.08 * Math.PI,
        0,
        2 * Math.PI,
        false
      );
      this._ctx.ellipse(
        point.x + beadSize,
        point.y - beadSize,
        beadSize,
        beadSize / 2,
        -0.08 * Math.PI,
        0,
        2 * Math.PI,
        false
      );
      this._ctx.ellipse(
        point.x - beadSize,
        point.y + beadSize,
        beadSize,
        beadSize / 2,
        -0.08 * Math.PI,
        0,
        2 * Math.PI,
        false
      );
    } else if (basketWeaving) {
      let darkenedColor = LightenColor(color, 18);

      // Create gradient
      let grd = this._ctx.createLinearGradient(
        point.x - beadSize,
        point.y - beadSize,
        point.x - beadSize,
        point.y - beadSize + scale
      );
      grd.addColorStop(0, "#" + darkenedColor);
      grd.addColorStop(0.3, color);
      grd.addColorStop(0.7, color);
      grd.addColorStop(1, "#" + darkenedColor);
      this._ctx.fillStyle = grd;
      this._ctx.shadowColor = "#000000";
      this._ctx.shadowBlur = beadSize - 2;
      this._ctx.shadowOffsetX = 0;
      this._ctx.shadowOffsetY = 0;

      if (
        ((point.x / scale) % 2 == 0 && (point.y / scale) % 2 == 0) ||
        ((point.x / scale) % 2 != 0 && (point.y / scale) % 2 != 0)
      ) {
        this._ctx.fillRect(
          point.x - basketSize,
          point.y - beadSize,
          scale - basketSize * 2,
          scale
        );
      } else {
        this._ctx.fillRect(
          point.x - beadSize,
          point.y - basketSize,
          scale,
          scale - basketSize * 2
        );
      }
    } else {
      this._ctx.arc(point.x, point.y, beadSize, 0, Math.PI * 2, false); // Outer circle
      this._ctx.arc(
        point.x - 1.8,
        point.y - 1.8,
        scale / 5,
        0,
        Math.PI * 2,
        true
      );
    }

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
  line(start = this._initPoint, end = this._endPoint, color = this._initColor) {
    let currentLine = {
      points: [],
      steep: false,
    };
    // User enters same point twice
    if (start.x == end.x && start.y == end.y) {
      this.stamp();
      currentLine.points.push(this._initPoint);
    } else if (start.x == end.x) {
      //vertical lines
      for (
        let i = Math.min(start.y, end.y);
        i <= Math.max(start.y, end.y);
        i = i + scale
      ) {
        let current = {
          x: Math.round(start.x / 10) * 10,
          y: Math.round(i / 10) * 10,
        };
        let currentBead = new Wampum(current, color, myCanvas, true);
        currentBead.stamp();
        currentLine.points.push(current);
      }
    } else if (start.y == end.y) {
      //Horizontal lines
      for (
        let i = Math.min(start.x, end.x);
        i <= Math.max(start.x, end.x);
        i = i + scale
      ) {
        let current = {
          x: Math.round(i / 10) * 10,
          y: Math.round(start.y / 10) * 10,
        };
        let currentBead = new Wampum(current, color, myCanvas, true);
        currentBead.stamp();
        currentLine.points.push(current);
      }
    } else {
      let m = (end.y - start.y) / (end.x - start.x);
      let b = start.y - m * start.x;

      if (Math.abs(m) <= 1.0) {
        let startX = start.x < end.x ? start.x : end.x;
        let endX = start.x < end.x ? end.x : start.x;

        for (let i = startX; i <= endX; i = i + scale) {
          let doubleY = m * i + b;
          let intY = parseInt(doubleY);
          if (Math.abs(doubleY - intY) >= 0.5) {
            intY = doubleY >= 0.0 ? intY++ : intY--;
            currentLine.steep = true;
          }
          let current = {
            x: round(i / 10) * 10,
            y: round(intY / 10) * 10,
          };

          let currentBead = new Wampum(current, color, myCanvas, true);
          currentBead.stamp();
          currentLine.points.push(current);
        }
      } else {
        let startY = start.y < end.y ? start.y : end.y;
        let endY = start.y < end.y ? end.y : start.y;
        for (let i = startY; i <= endY; i = i + scale) {
          let doubleX = (i - b) / m;
          let intX = parseInt(doubleX);

          if (Math.abs(doubleX - intX) >= 0.5) {
            intX = doubleX >= 0.0 ? intX++ : intX--;
            currentLine.steep = true;
          }

          let current = {
            x: round(intX / 10) * 10,
            y: round(i / 10) * 10,
          };

          let currentBead = new Wampum(current, color, myCanvas, true);
          currentBead.stamp();
          currentLine.points.push(current);
        }
      }
    }

    return currentLine;
  }

  /** Creates a rectangle on the canvas
   *
   */
  rectangle() {
    let start = this._initPoint;
    let end = this._endPoint;

    for (
      let i = Math.min(start.y, end.y);
      i <= Math.max(start.y, end.y);
      i = i + scale
    ) {
      for (
        let j = Math.min(start.x, end.x);
        j <= Math.max(start.x, end.x);
        j = j + scale
      ) {
        let current = {
          x: j,
          y: i,
        };
        let currentBead = new Wampum(current, this._initColor, myCanvas, true);
        currentBead.stamp();
      }
    }
  }

  /** Creates a triangle on the canvas
   *
   */
  triangle() {
    let start = this._initPoint;
    let end = this._endPoint;
    let top = this._topPoint;

    let line1 = this.line(start, top);
    let line2 = this.line(end, top);
    let line3 = this.line(start, end);

    for (let i = -300; i <= 300; i = i + scale) {
      for (let j = -300; j <= 300; j = j + scale) {
        let current = {
          x: j,
          y: i,
        };
        let currentBead = new Wampum(current, this._initColor, myCanvas, true);
        if (isInside(start, top, end, current)) {
          currentBead.stamp();
        }
      }
    }
  }

  /** Creates a linear iteration on the canvas
   *
   */
  linearIteration() {
    let incY, posDir;
    let gradient = updateSpitter(this._initColor, this._iterColor, this._rows);

    if (this._direction == "+y") {
      incY = true;
      posDir = false;
    } else if (this._direction == "-y") {
      incY = true;
      posDir = true;
    } else if (this._direction == "+x") {
      incY = false;
      posDir = true;
    } else {
      incY = false;
      posDir = false;
    }

    let linePoints = [];
    let start = {
      x: this._initPoint.x,
      y: this._initPoint.y,
    };
    let startLength = this._linearRowLength;
    let inc1 = this._linearPreNum;
    let inc2 = this._linearPostNum;
    let rows = this._rows;

    if (incY) {
      let newX = start.x + startLength * scale - scale;

      for (let i = 0; i < rows; i++) {
        if (newX < start.x) {
          for (let j = newX; j <= start.x; j = j + scale) {
            if (j >= -500 && j <= 500 && start.y >= -500 && start.y <= 500) {
              let current = {
                x: j,
                y: start.y,
              };
              let currentBead = new Wampum(
                current,
                gradient[i],
                myCanvas,
                true
              );
              currentBead.stamp();
              linePoints.push(current);
            }
          }
        } else {
          for (let j = start.x; j <= newX; j = j + scale) {
            if (j >= -500 && j <= 500 && start.y >= -500 && start.y <= 500) {
              let current = {
                x: j,
                y: start.y,
              };
              let currentBead = new Wampum(
                current,
                gradient[i],
                myCanvas,
                true
              );
              currentBead.stamp();
              linePoints.push(current);
            }
          }
        }
        if (posDir) {
          start.y = start.y + scale;
        } else {
          start.y = start.y - scale;
        }
        start.x -= inc1 * scale;
        newX += inc2 * scale;
      }
    } else {
      let newY = start.y + startLength * scale - scale;
      for (let i = 0; i < rows; i++) {
        if (newY < start.y) {
          for (let j = newY; j <= start.y; j = j + scale) {
            if (start.x <= 500 && start.x >= -500 && j <= 500 && j >= -500) {
              let current = {
                x: start.x,
                y: j,
              };
              let currentBead = new Wampum(
                current,
                gradient[i],
                myCanvas,
                true
              );
              currentBead.stamp();
            }
          }
        } else {
          for (let j = start.y; j <= newY; j = j + scale) {
            if (start.x >= -500 && start.x <= 500 && j >= -500 && j <= 500) {
              let current = {
                x: start.x,
                y: j,
              };
              let currentBead = new Wampum(
                current,
                gradient[i],
                myCanvas,
                true
              );
              currentBead.stamp();
            }
          }
        }
        if (posDir) {
          start.x = start.x + scale;
        } else {
          start.x = start.x - scale;
        }
        start.y -= inc1 * scale;
        newY += inc2 * scale;
      }
    }
    return linePoints;
  }

  /** Creates a triangle iteration on the canvas
   *
   */
  triangleIteration() {
    let start = {
      x: this._initPoint.x,
      y: this._initPoint.y,
    };
    let steps = this._triRowGroup;
    let gradientCounter = 0;
    let exSteps = this._triRowPrePost;
    let cycles = this._rows;
    let direction = this._direction;

    let forward, main, back;
    let currentBead;
    let gradient = updateSpitter(
      this._initColor,
      this._iterColor,
      Math.ceil(cycles / steps)
    );
    let inc = 0;

    if (direction == "-y") {
      for (let i = 0; i < this._rows * scale; i = i + scale) {
        if (i % (this._triRowGroup * scale) == 0 && i != 0) {
          inc = inc + exSteps;
          gradientCounter++;
        }

        for (let j = 0; j <= inc; j++) {
          forward = {
            x: start.x + inc * scale,
            y: start.y + i,
          };
          back = {
            x: start.x - inc * scale,
            y: start.y + i,
          };
          main = {
            x: start.x,
            y: start.y + i,
          };
          if (inc == 0) {
            currentBead = new Wampum(
              main,
              gradient[gradientCounter],
              myCanvas,
              true
            );
            currentBead.stamp();
          } else {
            this.line(back, forward, gradient[gradientCounter]);
          }
        }
      }
    } else if (direction == "-x") {
      for (let i = 0; i < this._rows * scale; i = i + scale) {
        if (i % (this._triRowGroup * scale) == 0 && i != 0) {
          inc = inc + exSteps;
          gradientCounter++;
        }

        for (let j = 0; j <= inc; j++) {
          forward = {
            x: start.x - i,
            y: start.y + inc * scale,
          };
          back = {
            x: start.x - i,
            y: start.y - inc * scale,
          };
          main = {
            x: start.x - i,
            y: start.y,
          };
          if (inc == 0) {
            currentBead = new Wampum(
              main,
              gradient[gradientCounter],
              myCanvas,
              true
            );
            currentBead.stamp();
          } else {
            this.line(back, forward, gradient[gradientCounter]);
          }
        }
      }
    } else if (direction == "+y") {
      for (let i = 0; i < this._rows * scale; i = i + scale) {
        if (i % (this._triRowGroup * scale) == 0 && i != 0) {
          inc = inc + exSteps;
          gradientCounter++;
        }
        for (let j = 0; j <= inc; j++) {
          forward = {
            x: start.x + inc * scale,
            y: start.y - i,
          };
          back = {
            x: start.x - inc * scale,
            y: start.y - i,
          };
          main = {
            x: start.x,
            y: start.y - i,
          };
          if (inc == 0) {
            currentBead = new Wampum(
              main,
              gradient[gradientCounter],
              myCanvas,
              true
            );
            currentBead.stamp();
          } else {
            this.line(back, forward, gradient[gradientCounter]);
          }
        }
      }
    } else {
      for (let i = 0; i < this._rows * scale; i = i + scale) {
        if (i % (this._triRowGroup * scale) == 0 && i != 0) {
          inc = inc + exSteps;
          gradientCounter++;
        }

        for (let j = 0; j <= inc; j++) {
          forward = {
            x: start.x + i,
            y: start.y + inc * scale,
          };
          back = {
            x: start.x + i,
            y: start.y - inc * scale,
          };
          main = {
            x: start.x + i,
            y: start.y,
          };
          if (inc == 0) {
            currentBead = new Wampum(
              main,
              gradient[gradientCounter],
              myCanvas,
              true
            );
            currentBead.stamp();
          } else {
            this.line(back, forward, gradient[gradientCounter]);
          }
        }
      }
    }
  }

  /** Based on the pattern name of the curren bead, creates the pattern
   *
   */
  displayBeads() {
    if (this._pattern == "point") {
      this.stamp();
    } else if (this._pattern == "line") {
      this.line();
    } else if (this._pattern == "rectangle") {
      this.rectangle();
    } else if (this._pattern == "triangle") {
      this.triangle();
    } else if (this._pattern == "linear-iteration") {
      this.linearIteration();
    } else if (this._pattern == "triangle-iteration") {
      this.triangleIteration();
    }
  }

  /** Sets the bead's entire params list for loading
   * @param {number} endPoint
   * @param {number} topPoint
   * @param {number} rows
   * @param {string} iterColor
   * @param {number} linearRowLength
   * @param {number} linearPreNum
   * @param {number} linearPostNum
   * @param {number} triRowGroup
   * @param {number} triRowPrePost
   * @param {string} direction
   */
  setAdditionalParams(
    endPoint,
    topPoint,
    rows,
    iterColor,
    linearRowLength,
    linearPreNum,
    linearPostNum,
    triRowGroup,
    triRowPrePost,
    direction
  ) {
    this._endPoint = {
      x: endPoint.x,
      y: endPoint.y,
    };
    this._topPoint = {
      x: topPoint.x,
      y: topPoint.y,
    };

    this._rows = rows;
    this._iterColor = iterColor;

    this._linearRowLength = linearRowLength;
    this._linearPreNum = linearPreNum;
    this._linearPostNum = linearPostNum;

    this._triRowGroup = triRowGroup;
    this._triRowPrePost = triRowPrePost;

    this._direction = direction;
  }

  /** Creates object for saving
   * @return {Object} a serialized version of this bead for saving
   */
  serialize() {
    return {
      initPoint: this._initPoint,
      initColor: this._initColor,
      endPoint: this._endPoint,
      topPoint: this._topPoint,
      rows: this._rows,
      iterColor: this._iterColor,
      linearRowLength: this._linearRowLength,
      linearPreNum: this._linearPreNum,
      linearPostNum: this._linearPostNum,
      triRowGroup: this._triRowGroup,
      triRowPrePost: this._triRowPrePost,
      direction: this._direction,
      pattern: this._pattern,
    };
  }
}
