/** rotateAroundPoint: Rotates one point around another
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

/** reflect: reflects a braid based on the given info
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

/** degToRad: Convert degrees to radians
 * @param {number} angle
 *
 * @return {number}
 */
function degToRad(angle) {
  return (angle * Math.PI) / 180;
}

/** radToDeg: Convert radians to degrees
 * @param {number} angle
 *
 * @return {number}
 */
function radToDeg(angle) {
  return (angle * 180) / Math.PI;
}
/**
 * Load a project into memory
 *
 * @param {string} text a JSON string
 */
function loadFromJSON(text) {
  try {
    // Reset the length of the braids and index
    Braids.length = 0;
    currBraidIndex = -1;

    // Attempt to parse the text into the braids
    JSON.parse(text).forEach((obj) => {
      // Create a new braid from the current data set
      let currentBraid = new Braid(
        obj.size,
        obj.x,
        obj.y,
        obj.rotation,
        obj.reflection,
        braidCanvas
      );

      // Push the braid onto the stack and increment
      Braids.push(currentBraid);
      ++currBraidIndex;

      // Set the braid's iteration parameters
      Braids[currBraidIndex].setIterationParameters(
        obj.iteration.translateX,
        obj.iteration.translateY,
        obj.iteration.rotationAngle,
        obj.iteration.inRadians,
        obj.iteration.dilation,
        obj.iteration.n
      );
    });

    // Either create a new braid since the file was blank, or establish the params for each braid
    if (Braids.length === 0) {
      setCurrentBraidValues(defaultValues);
    } else {
      setParamsForBraid(Braids[currBraidIndex]);
    }

    // Reload the canvas and braids.
    loadCanvas();
    updateBraidSelect();
  } catch (e) {
    console.error("Note to Developer: Failed to load the given local file.");
    console.error(`Error Output: ${JSON.stringify(e)}`);
  }
}
