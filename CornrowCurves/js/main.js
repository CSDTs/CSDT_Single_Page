// Button Operations
////////////////////////////////////////////////////////////////////

/**
 * Toggles the grid in canvas
 */
function toggleGrid() {
  hideGrid = !hideGrid;
  loadCanvas();
  $(appReferences.toggleGridBtn).text(hideGrid ? "Show Grid" : "Hide Grid");
}

/**
 * Toggles the starting point in canvas
 */
function toggleInitPointLocation() {
  $(appReferences.toggleInitPointBtn).text(
    addAtCurrentPoint ? "Add Braid at Current Point" : "Add Braid at Origin"
  );
  addAtCurrentPoint = !addAtCurrentPoint;
}

/**
 * Toggles the coordinate point display in the bottom right corner
 */
function togglePointDisplayLocation() {
  $(appReferences.togglePointLocationBtn).text(
    showCoordinatesInCorner ? "XY In Lower Right" : "XY Follows Mouse"
  );
  showCoordinatesInCorner = !showCoordinatesInCorner;
}

/**
 * Toggles the initial braid highlight
 */
function toggleBraidHighlight() {
  $(appReferences.togglePointHighlightBtn).text(
    hideHighlight ? "Hide Plait Highlight" : "Show Plait Highlight"
  );
  hideHighlight = !hideHighlight;
  loadCanvas();
}

/**
 * Toggles the vector visible on the braid
 */
function toggleVector() {
  $(appReferences.togglePointVectorBtn).text(
    showVector ? "Show Vector" : "Hide Vector"
  );
  showVector = !showVector;
  loadCanvas();
}

// Braid Operations
////////////////////////////////////////////////////////////////////
/**
 * Sets/Resets the braid to a default, predetermined state on the canvas.
 *
 * @param {*} data
 * @param {*} isReset
 */
function setCurrentBraidValues(data, isReset = false) {
  // Set all the braid's values
  $(appReferences.iterationsParam).val(data.iteration);
  // If the user doesn't want to add the braid at the current
  // point, or if the user is not currently resetting the braid
  if (!isReset && !addAtCurrentPoint) {
    $(appReferences.xParam).val(data.x);
    $(appReferences.yParam).val(data.y);
  }
  $(appReferences.angleParam).val(data.startAngle);
  $(appReferences.startDilationParam).val(data.startDilation);
  $(appReferences.reflectXParam).prop("checked", data.reflectX);
  $(appReferences.reflectYParam).prop("checked", data.reflectY);

  $(appReferences.translateParam).val(data.translate);
  $(appReferences.rotateParam).val(data.rotate);
  $(appReferences.dilateParam).val(data.dilate);
}

/**
 * Creates a new braid with the default values declared at the top of the file.
 */
function createNewBraid() {
  // First, prep the current braid values
  setCurrentBraidValues(defaultValues);

  // Add the braid to the stack and adjust the braid index
  Braids.push(
    new Braid(
      braidCanvas.width / 20,
      braidCanvas.width / 2,
      braidCanvas.height / 2,
      0,
      "",
      braidCanvas,
      false
    )
  );
  currBraidIndex = Braids.length - 1;

  // Finally, reload the canvas and braids.
  loadCanvas();
  updateBraidSelect();
  currentProject.modified = true;
  updateVisibleModifiedStatus();
}

/**
 * Deletes the currently selected braid.
 */
function deleteSelectedBraid() {
  // Grabs the latest braid
  Braids.splice(currBraidIndex, 1);

  // Update the index
  currBraidIndex = currBraidIndex - 1;
  currentProject.modified = true;
  updateVisibleModifiedStatus();
}

/**
 * Cycles through the defined colors to give different colors to each braid's highlight
 * @param {Number} num
 */
function changeBraidHighlightColor(num) {
  let availableColors = braidHighlightColors.length;

  if (num < availableColors) {
    return braidHighlightColors[num];
  } else {
    return braidHighlightColors[num % availableColors];
  }
}

/**
 * Sets parameters to those for a certain braid
 * @param {Braid} braid
 */
function setParamsForBraid(braid) {
  if (braid == undefined) {
    console.log("End of braid list. Add more braids to set parameters.");
  } else {
    $(appReferences.xParam).val(
      (braid._x - braidCanvas.width / 2) *
        (braid._reflection.includes("y") ? -1 : 1)
    );
    $(appReferences.yParam).val(
      -(braid._y - braidCanvas.height / 2) *
        (braid._reflection.includes("x") ? -1 : 1)
    );
    $(appReferences.angleParam).val(radToDeg(braid._rotation) * -1);
    $(appReferences.startDilationParam).val(
      (braid._size * 2000) / braidCanvas.width
    );
    $(appReferences.reflectXParam).prop(
      "checked",
      braid._reflection.includes("x")
    );
    $(appReferences.reflectYParam).prop(
      "checked",
      braid._reflection.includes("y")
    );
    $(appReferences.iterationsParam).val(braid.iteration.n);
    $(appReferences.translateParam).val(braid.iteration.translateX);
    $(appReferences.rotateParam).val(braid.iteration.rotationAngle * -1);
    $(appReferences.dilateParam).val(braid.iteration.dilation);
  }
}

// Canvas
////////////////////////////////////////////////////////////////////
/**
 * Clears entire canvas from braids.
 */
function clearCanvas() {
  //  Ask first if the user is ok with getting rid of all the braids
  if (confirm("WARNING, this will delete all braids")) {
    // Systematically pop each braid and decrement the index
    while (Braids.length > 0) {
      Braids.splice(currBraidIndex, 1);
      currBraidIndex = -1;
      loadCanvas();
      updateBraidSelect();
    }
    currentProject.modified = true;
    updateVisibleModifiedStatus();
  }
}

/**
 * loads canvas at the correct height and iterates with current settings
 *
 */
function loadCanvas() {
  // Wipes the entire canvas clean

  ctx.clearRect(0, 0, braidCanvas.width, braidCanvas.height);

  // Gets all form values
  let iterations = parseInt($(appReferences.iterationsParam).val());
  let startX =
    parseFloat($(appReferences.xParam).val()) *
    ($(appReferences.reflectYParam).is(":checked") ? -1 : 1);
  let startY = parseFloat(
    $(appReferences.yParam).val() *
      -1 *
      ($(appReferences.reflectXParam).is(":checked") ? -1 : 1)
  );
  let startAngle = parseFloat($(appReferences.angleParam).val() * -1);
  let startingDilation = parseFloat($(appReferences.startDilationParam).val());
  let xTranslation = parseFloat($(appReferences.translateParam).val());
  let rotation = parseFloat($(appReferences.rotateParam).val() * -1);
  let dilation = parseFloat($(appReferences.dilateParam).val());
  let xReflection = $(appReferences.reflectXParam).is(":checked");
  let yReflection = $(appReferences.reflectYParam).is(":checked");
  let reflection = "" + (xReflection ? "x" : "") + (yReflection ? "y" : "");

  // Handle blank values
  iterations = isNaN(iterations) ? defaultValues.iteration : iterations;
  startX = isNaN(startX) ? defaultValues.x : startX;
  startY = isNaN(startY) ? defaultValues.y : startY;
  startAngle = isNaN(startAngle) ? defaultValues.startAngle : startAngle;
  startingDilation = isNaN(startingDilation)
    ? defaultValues.startDilation
    : startingDilation;
  xTranslation = isNaN(xTranslation) ? defaultValues.translate : xTranslation;
  rotation = isNaN(rotation) ? defaultValues.rotate : rotation;
  dilation = isNaN(dilation) ? defaultValues.dilate : dilation;

  // Dynamically resizes canvas and data form
  if (
    $(window).width() < 992 &&
    $(appReferences.braidCanvasContainer).hasClass("col-6")
  ) {
    $(appReferences.braidCanvasContainer).toggleClass("col-6 col-12");
    $(appReferences.dataContainer).toggleClass("col-6 col-12");
  } else if (
    $(window).width() >= 992 &&
    $(appReferences.braidCanvasContainer).hasClass("col-12")
  ) {
    $(appReferences.braidCanvasContainer).toggleClass("col-12 col-6");
    $(appReferences.dataContainer).toggleClass("col-12 col-6");
  }

  // Set the width and height of the canvas
  braidCanvas.width = parseInt(window.getComputedStyle(braidCanvas).width) - 2;
  braidCanvas.height = braidCanvas.width;

  // Create/update the current braid values
  Braids[currBraidIndex] = new Braid(
    (braidCanvas.width * startingDilation) / 2000,
    braidCanvas.width / 2 + startX,
    braidCanvas.height / 2 + startY,
    startAngle,
    reflection,
    braidCanvas,
    false
  ).setIterationParameters(
    xTranslation,
    0,
    rotation,
    false,
    dilation,
    iterations
  );

  // Executes if the user toggles the grid off
  createGridLines();

  // Inits the vectors for the braid
  midVectors = [];

  // Iterates through each braid and draws them to the canvas
  for (let i = 0; i < Braids.length; i++) {
    if (i === currBraidIndex && !hideHighlight) {
      Braids[i]
        .clone()
        .translate(
          -2 * (yReflection ? -1 : 1),
          2 * (xReflection ? -1 : 1),
          0,
          0
        )
        .dilate(110)
        .stamp(changeBraidHighlightColor(i), 1.6 / 7);
    }
    Braids[i].iterate();
  }
}

function createGridLines() {
  if (hideGrid) return;

  // Draws the grid lines
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#8e8e8e55";
  for (let i = braidCanvas.width / 2; i >= 0; i -= 10) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, braidCanvas.height);
    ctx.moveTo(0, i);
    ctx.lineTo(braidCanvas.width, i);
    ctx.moveTo(braidCanvas.width - i, 0);
    ctx.lineTo(braidCanvas.width - i, braidCanvas.height);
    ctx.moveTo(0, braidCanvas.width - i);
    ctx.lineTo(braidCanvas.width, braidCanvas.width - i);
  }
  ctx.closePath();
  ctx.stroke();

  //Draws the X and Y axis
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(braidCanvas.width / 2, 0);
  ctx.lineTo(braidCanvas.width / 2, braidCanvas.height);
  ctx.moveTo(0, braidCanvas.height / 2);
  ctx.lineTo(braidCanvas.width, braidCanvas.height / 2);
  ctx.closePath();
  ctx.stroke();
}

// Dictates how the canvas will act on mouse move
braidCanvas.addEventListener("mousemove", (e) => {
  $(appReferences.coordinatePanel).attr("hidden", false);
  loadCanvas();

  const ctx = braidCanvas.getContext("2d");
  const x = e.offsetX;
  const y = e.offsetY;

  if (!showCoordinatesInCorner) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y - 12, 60, 15);
    ctx.fillStyle = "#000000";
    ctx.fillText(
      "(" +
        (x - braidCanvas.width / 2) +
        "," +
        (y - braidCanvas.width / 2) * -1 +
        ")",
      x,
      y
    );
    mouseText = {
      x,
      y,
    };
    $(appReferences.coordinatePanel).text("");
    $(appReferences.coordinatePanel).removeClass("coordinate-backing");
  } else {
    $(appReferences.coordinatePanel).text(
      "(" +
        (x - braidCanvas.width / 2) +
        "," +
        (y - braidCanvas.width / 2) * -1 +
        ")"
    );
    $(appReferences.coordinatePanel).addClass("coordinate-backing");
  }
  for (let i = 0; i < Braids.length; i++) {
    if (Braids[i].contains(x, y) && !hideHighlight) {
      Braids[i].stamp(changeBraidHighlightColor(i));
    }
  }
});

// Dictates how the canvas will act on mouse leave
$(appReferences.braidCanvas).on("mouseleave", (e) => {
  $(appReferences.coordinatePanel).attr("hidden", true);
  loadCanvas();
});

// Dictates how the canvas will act on mouse click
$(appReferences.braidCanvas).on("click", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  for (let i = 0; i < Braids.length; i++) {
    if (Braids[i].contains(x, y)) {
      currBraidIndex = i;
      setParamsForBraid(Braids[i]);
      loadCanvas();
      updateBraidSelect();
      break;
    }
  }
});

// Braid Gallery
////////////////////////////////////////////////////////////////////
/**
 * Populates the modal within the html with the clickable images users can select as a guide/goal
 *
 * Goes off the assumption that all gallery images you want to populate follow this format "cc-#.jpg" inside the img folder.
 *
 * Note: We should probably make this more dynamic by detecting how many images are in the folder, but the number '24' has been
 * consistent for years...
 *
 */
function createBraidGallery() {
  // Current number of images available for the gallery
  let numOfImages = 23;
  for (let i = 0; i < numOfImages; i++) {
    // DOM element creation
    let parentContainer = goalImageContainer;
    let childContainer = document.createElement("div");
    let image = document.createElement("img");

    // Assigning all the classes and attributes
    childContainer.classList.add("col-md-4", "col-sm-1");
    image.classList.add("img-fluid", "mb-1", "mt-1", "braid-img");
    image.setAttribute(
      "src",
      `${isAppHomepage ? currentLocation : ""}img/${goalDirectory}${i + 1}.jpg`
    );

    // Appending the child to the parent container (image to gallery)
    childContainer.appendChild(image);
    parentContainer.appendChild(childContainer);

    // Add event handler to each image
    $(childContainer).on("click", (e) => {
      $(currentGoalImage).attr("src", e.target.getAttribute("src"));
      $(goalImageModal).modal("hide");
    });
  }
}

// Misc
////////////////////////////////////////////////////////////////////
/**
 * Updates the braid select input with the current braids
 *
 */
function updateBraidSelect() {
  // Clear the current options
  $(appReferences.braidSelection).html("");

  // Iterates through the braids and appends the updated options
  for (let i = 0; i < Braids.length; i++) {
    $(appReferences.braidSelection).append(
      $("<option>", {
        value: i,
        text: `Braid ${i + 1}`,
        selected: currBraidIndex == i ? true : false,
      })
    );
  }
}

/**
 * Based on user selection, load in braid
 * @param {num} value input value
 */
function loadBraidFromSelect(value) {
  if (value > Braids.length || value < 0) {
    console.error(
      "Note to Developer: Invalid value given from braid selection."
    );
  } else {
    currBraidIndex = parseInt(value);
    setParamsForBraid(Braids[value]);
    loadCanvas();
    updateBraidSelect();
  }
}

/**
 * Initializes the application
 *
 */
function initApplication() {
  initCloudServices();
  loadCanvas();
  updateBraidSelect();
  createBraidGallery();
  setLoadingOverlay(true, false);
}

window.addEventListener("resize", loadCanvas);
document.querySelector("body").addEventListener("resize", loadCanvas);

/** Application event bindings**/

$(appReferences.formData).on("change keyup input", () => {
  loadCanvas();
  currentProject.modified = true;
  updateVisibleModifiedStatus();
});

// Update form values to match

$(appReferences.xParam).on("focusout", () => {
  if ($(appReferences.xParam).val() == "") {
    $(appReferences.xParam).val(defaultValues.x);
  }
});
$(appReferences.yParam).on("focusout", () => {
  if ($(appReferences.yParam).val() == "") {
    $(appReferences.yParam).val(defaultValues.y);
  }
});
$(appReferences.angleParam).on("focusout", () => {
  if ($(appReferences.angleParam).val() == "") {
    $(appReferences.angleParam).val(defaultValues.startAngle);
  }
});
$(appReferences.startDilationParam).on("focusout", () => {
  if ($(appReferences.startDilationParam).val() == "") {
    $(appReferences.startDilationParam).val(defaultValues.startDilation);
  }
});
$(appReferences.iterationsParam).on("focusout", () => {
  if ($(appReferences.iterationsParam).val() == "") {
    $(appReferences.iterationsParam).val(defaultValues.iteration);
  }
});
$(appReferences.translateParam).on("focusout", () => {
  if ($(appReferences.translateParam).val() == "") {
    $(appReferences.translateParam).val(defaultValues.translate);
  }
});
$(appReferences.rotateParam).on("focusout", () => {
  if ($(appReferences.rotateParam).val() == "") {
    $(appReferences.rotateParam).val(defaultValues.rotate);
  }
});
$(appReferences.dilateParam).on("focusout", () => {
  if ($(appReferences.dilateParam).val() == "") {
    $(appReferences.dilateParam).val(defaultValues.dilate);
  }
});
