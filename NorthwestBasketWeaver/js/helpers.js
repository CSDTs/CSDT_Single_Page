// Calculations for bead designs
////////////////////////////////////////////////////////////////////
/** Calculates the area of a triangle given three points
 *
 * @param {Object} p1 Bead coordinates (x,y) for initPoint
 * @param {Object} p2 Bead coordinates (x,y) for topPoint
 * @param {Object} p3 Bead coordinates (x,y) for endPoint
 *
 * @return {number} The area of the triangle
 */
function triangleArea(p1, p2, p3) {
	return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2.0);
}
/** Checks whether a point is inside or outside a triangle's area
 *
 * @param {Object} p1 Bead coordinates for initPoint
 * @param {Object} p2 Bead coordinates for topPoint
 * @param {Object} p3 Bead coordinates for endPoint
 * @param {Object} p  Bead coordinates for a given point
 *
 * @return{boolean} Returns if the given bead is within the triangle
 */
function isInside(p1, p2, p3, p) {
	let area = triangleArea(p1, p2, p3); //area of (init, top, end)
	let area1 = triangleArea(p, p2, p3); //area of (point, top, end)
	let area2 = triangleArea(p1, p, p3); //area of (init, point, end)
	let area3 = triangleArea(p1, p2, p); //area of (init, top, point)

	return area == area1 + area2 + area3;
}
////////////////////////////////////////////////////////////////////

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
	var valClampRGB = [val2RGB[0] - val1RGB[0], val2RGB[1] - val1RGB[1], val2RGB[2] - val1RGB[2]];

	// build the color array out with color steps
	for (var i = 0; i < stepsInt; i++) {
		var clampedR =
			valClampRGB[0] > 0
				? pad(Math.round((valClampRGB[0] / 100) * (stepsPerc * (i + 1))).toString(16), 2)
				: pad(Math.round(val1RGB[0] + (valClampRGB[0] / 100) * (stepsPerc * (i + 1))).toString(16), 2);

		var clampedG =
			valClampRGB[1] > 0
				? pad(Math.round((valClampRGB[1] / 100) * (stepsPerc * (i + 1))).toString(16), 2)
				: pad(Math.round(val1RGB[1] + (valClampRGB[1] / 100) * (stepsPerc * (i + 1))).toString(16), 2);

		var clampedB =
			valClampRGB[2] > 0
				? pad(Math.round((valClampRGB[2] / 100) * (stepsPerc * (i + 1))).toString(16), 2)
				: pad(Math.round(val1RGB[2] + (valClampRGB[2] / 100) * (stepsPerc * (i + 1))).toString(16), 2);
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

// Project Handling
////////////////////////////////////////////////////////////////////
function loadFromJSON(text) {
	const generalizeText = text.charAt(0) === '"' ? JSON.parse(text) : text;
	try {
		beadStack.length = 0;
		stackLength = -1;

		JSON.parse(generalizeText).forEach((obj) => {
			beadStack.push(new Wampum(obj.initPoint, obj.initColor, myCanvas, true, obj.pattern));
			++stackLength;
			beadStack[stackLength].setAdditionalParams(
				obj.endPoint,
				obj.topPoint,
				obj.rows,
				obj.iterColor,
				obj.linearRowLength,
				obj.linearPreNum,
				obj.linearPostNum,
				obj.triRowGroup,
				obj.triRowPrePost,
				obj.direction
			);
		});

		for (var i = 0; i < beadStack.length; i++) {
			beadStack[i].displayBeads();
		}
		if (beadStack.length === 0) {
			// setInputsToDefaults();
		} else {
			// setParamsForBead(Beads[currBeadIndex]);
		}

		// loadCanvas();
		stackLength++;
		// $("#loadingProject").modal("hide");
		updateCanvas();
	} catch (e) {
		console.error("Note to Developer: Failed to load the given local file.");
		console.error(`Error Output: ${JSON.stringify(e)}`);
	}
}
