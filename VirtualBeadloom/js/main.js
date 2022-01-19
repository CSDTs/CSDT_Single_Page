function redo() {
  if (beadUndoBuffer <= 0) {
    alertUser("There is nothing else you can redo", 5000);
    return;
  }
  beadStack[stackLength] = beadUndoBuffer.pop();
  stackLength++;
  currBufferLength--;
  updateCanvas();
  currentProject.modified = true;
  updateVisibleModifiedStatus();
}

function undo() {
  if (beadStack.length <= 0) {
    alertUser("There is nothing else you can undo", 5000);
    return;
  }
  beadUndoBuffer[currBufferLength] = beadStack.pop();
  currBufferLength++;
  stackLength--;
  updateCanvas();
  currentProject.modified = true;
  updateVisibleModifiedStatus();
}

function toggleHideGrid() {
  hideGrid = !hideGrid;
  updateCanvas();
  gridBtn.innerHTML = hideGrid ? "Show Grid" : "Hide Grid";
}

function toggleMoveCoordinateLocation() {
  showCoordinatesInCorner = !showCoordinatesInCorner;
  updateCanvas();
  coordinateLocationBtn.innerHTML = showCoordinatesInCorner
    ? "XY Follows Mouse"
    : "XY In Lower Right";
}
////////////////////////////////////////////////////////////////////

// Bead Gallery
////////////////////////////////////////////////////////////////////
goalImages.forEach((el) =>
  el.addEventListener("click", (e) => {
    currentGoal = e.target.getAttribute("src");
    currentGoalImage.src = currentGoal;
    $(goalImageModal).modal("hide");
  })
);

function createBeadGallery() {
  // Current number of images available for the gallery
  let numOfImages = 8;
  for (let i = 0; i < goalImageTotal; i++) {
    // DOM element creation
    let parentContainer = goalImageContainer;
    let childContainer = document.createElement("div");
    let image = document.createElement("img");

    // Assigning all the classes and attributes
    childContainer.classList.add("col-md-4", "col-sm-1");
    image.classList.add("img-fluid", "mb-1", "mt-1", "braid-img");
    image.setAttribute(
      "src",
      `${isAppHomepage ? currentLocation : ""}img/${goalDirectory}${i + 1}.png`
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

// Canvas
////////////////////////////////////////////////////////////////////

beadCanvas.addEventListener("mousemove", (e) => {
  coordinatePanel.hidden = false;
  updateCanvas();

  const x = e.offsetX - 2;
  const y = e.offsetY - 2;
  let currentX = ((x - myCanvas.width / 2) / scale).toFixed(0);
  currentX == -0 ? (currentX = 0) : currentX;
  let currentY = ((y - myCanvas.width / 2) / scale).toFixed(0) * -1;
  currentY == -0 ? (currentY = 0) : currentY;

  if (!showCoordinatesInCorner) {
    ctx.font = "12px Arial";

    ctx.fillStyle = basketWeaving ? "#f8eac5" : "#ffffff";

    ctx.fillRect(x - myCanvas.width / 2, y - myCanvas.width / 2 - 12, 45, 15);
    ctx.fillStyle = "#000000";
    ctx.fillText(
      `(${currentX}, ${currentY})`,
      x - myCanvas.width / 2,
      y - myCanvas.width / 2
    );

    mouseText = { x, y };
    coordinatePanel.innerHTML = "";
    coordinatePanel.classList.remove("coordinate-backing");
  } else {
    coordinatePanel.innerHTML = `[ x= ${currentX}, y= ${currentY} ]`;
    coordinatePanel.classList.add("coordinate-backing");
  }
});

function createGrid() {
  let num_lines_x = getNumberOfGridLines("x");
  let num_lines_y = getNumberOfGridLines("y");

  ctx.translate(getGridAdjustment("x"), getGridAdjustment("y"));

  drawGridLines("x", num_lines_x);
  drawGridLines("y", num_lines_y);

  // Translate to the new origin. Now Y-axis of the canvas is opposite to the Y-axis of the graph. So the y-coordinate of each element will be negative of the actual
  ctx.translate(
    getDistanceGridLines(num_lines_y) * scale,
    getDistanceGridLines(num_lines_x) * scale
  );

  drawGridTickMarks("x", true, num_lines_y);
  drawGridTickMarks("x", false, num_lines_y);
  drawGridTickMarks("y", true, num_lines_x);
  drawGridTickMarks("y", false, num_lines_x);
}

function getGridWidth() {
  return Math.floor(myCanvas.width / 100) * 100;
}
function getGridHeight() {
  return Math.floor(myCanvas.width / 100) * 100;
}
function getDistanceGridLines(numOfLines) {
  return parseInt(numOfLines / 2);
}

function getNumberOfGridLines(axis) {
  return Math.floor((axis == "x" ? getGridHeight() : getGridWidth()) / scale);
}
function getGridAdjustment(axis) {
  return ((axis == "x" ? myCanvas.height : myCanvas.width) % 100) / 2;
}

function drawGridLines(axis, numOfLines) {
  let adjustmentFactor = i == numOfLines ? 0 : 0.5;
  let distanceGridLines = getDistanceGridLines(numOfLines);
  // Draw grid lines along X-axis
  for (var i = 0; i <= numOfLines; i++) {
    ctx.beginPath();
    ctx.lineWidth = 1;

    // If line represents X-axis draw in different color
    if (i == distanceGridLines) ctx.strokeStyle = "#000000";
    else ctx.strokeStyle = gridColor;

    if (axis == "x") {
      ctx.moveTo(0, scale * i + adjustmentFactor);
      ctx.lineTo(getGridWidth(), scale * i + adjustmentFactor);
    } else {
      ctx.moveTo(scale * i + adjustmentFactor, 0);
      ctx.lineTo(scale * i + adjustmentFactor, getGridHeight());
    }
    ctx.stroke();
  }
}

function drawGridTickMarks(axis, isPositive, numOfLines) {
  let tickValue = 1;
  let distanceGridLines = getDistanceGridLines(numOfLines);
  let gridLines = isPositive
    ? numOfLines - distanceGridLines
    : distanceGridLines;

  let gridScale = scale * (isPositive ? 1 : -1);
  let factor = isPositive ? 1 : -1;

  // Ticks marks along the positive X-axis
  for (i = 5; i < gridLines; i = i + 5) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";

    if (axis == "x") {
      // Draw a tick mark 6px long (-3 to 3)
      ctx.moveTo(gridScale * i + 0.5, -3);
      ctx.lineTo(gridScale * i + 0.5, 3);
    } else {
      // Draw a tick mark 6px long (-3 to 3)
      ctx.moveTo(-3, gridScale * i + 0.5);
      ctx.lineTo(3, gridScale * i + 0.5);
    }

    ctx.stroke();

    // Text value at that point
    ctx.font = "9px Arial";
    ctx.textAlign = "start";

    if (axis == "x")
      ctx.fillText(tickValue * factor * i, gridScale * i - 3, 15);
    else ctx.fillText(-tickValue * factor * i, 8, gridScale * i + 3);
  }
}

function resizeApplication() {
  // Dynamically resizes canvas and data form
  if ($(window).width() < 992 && $(applicationContainer).hasClass("col-6")) {
    $(applicationContainer).toggleClass("col-6 col-12");
    $(dataContainer).toggleClass("col-6 col-12");
  } else if (
    $(window).width() >= 992 &&
    $(applicationContainer).hasClass("col-12")
  ) {
    $(applicationContainer).toggleClass("col-12 col-6");
    $(dataContainer).toggleClass("col-12 col-6");
  }
}

function updateCanvas() {
  myCanvas.style.backgroundColor = basketWeaving ? "#f8eac5" : "#ffffff";
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  resizeApplication();

  myCanvas.width = parseInt(window.getComputedStyle(myCanvas).width) - 4;
  myCanvas.height = myCanvas.width;

  if (!hideGrid) {
    createGrid();
  } else {
    let num_lines_x = getNumberOfGridLines("x");
    let num_lines_y = getNumberOfGridLines("y");

    ctx.translate(getGridAdjustment("x"), getGridAdjustment("y"));
    ctx.translate(
      getDistanceGridLines(num_lines_y) * scale,
      getDistanceGridLines(num_lines_x) * scale
    );
  }

  beadStack.forEach((pattern) => pattern.displayBeads());
}

function clearCanvas() {
  if (confirm("WARNING, this will delete all beads")) {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

    // Dynamically resizes canvas and data form
    if ($(window).width() < 992 && $(applicationContainer).hasClass("col-6")) {
      $(applicationContainer).toggleClass("col-6 col-12");
      $(dataContainer).toggleClass("col-6 col-12");
    } else if (
      $(window).width() >= 992 &&
      $(applicationContainer).hasClass("col-12")
    ) {
      $(applicationContainer).toggleClass("col-12 col-6");
      $(dataContainer).toggleClass("col-12 col-6");
    }

    myCanvas.width = parseInt(window.getComputedStyle(myCanvas).width) - 2;
    myCanvas.height = myCanvas.width;

    createGrid();
    beadStack = [];
    stackLength = 0;
  }
}

////////////////////////////////////////////////////////////////////

let currentFieldset = "point--field";
let defaultColorFieldset = "color--field";
let iterationColorFieldset = "iteration-color--field";

createBtn.addEventListener("click", function (e) {
  createDesign();
});

beadStyleSelect.addEventListener("change", (e) => {
  if (currentFieldset == e.target.value) return;

  document.getElementById(currentFieldset).hidden = true;
  document.getElementById(e.target.value).hidden = false;
  currentFieldset = e.target.value;

  patternImage.src = `${isAppHomepage ? currentLocation : ""}img/${
    e.target.value.split("--")[0]
  }.png`;
  beadDesign = e.target.value.split("--")[0];

  document.getElementById(iterationColorFieldset).hidden =
    currentFieldset.indexOf("iteration") == -1 ? true : false;
  document.getElementById(defaultColorFieldset).hidden =
    currentFieldset.indexOf("iteration") == -1 ? false : true;

  $("#pos-y").prop(
    "checked",
    currentFieldset == "linear-iteration--field" ? true : false
  );
  $("#neg-y2").prop(
    "checked",
    currentFieldset == "triangle-iteration--field" ? true : false
  );
});

function createDesign() {
  if (beadDesign == "point") createSinglePoint();
  if (beadDesign == "line") createLine();
  if (beadDesign == "rectangle") createRectangle();
  if (beadDesign == "triangle") createTriangle();
  if (beadDesign == "linear-iteration") createLinearIteration();
  if (beadDesign == "triangle-iteration") createTriangleIteration();

  beadStack[stackLength].createPattern();

  stackLength++;
  currentProject.modified = true;
  updateVisibleModifiedStatus();
}

// Creates the bead design / collects and sets user input
function createSinglePoint() {
  let initPoint = { x: pointX.value, y: pointY.value };
  let color = defaultColorSelect.value;

  beadStack[stackLength] = new Wampum(initPoint, color, false);
  beadStack[stackLength].createPattern();
}

function createLine() {
  let start = { x: lineX1.value, y: lineY1.value };
  let end = { x: lineX2.value, y: lineY2.value };
  let color = defaultColorSelect.value;

  beadStack[stackLength] = new LinePattern(start, end, color, false);
}

function createRectangle() {
  let start = { x: rectangleX1.value, y: rectangleY1.value };
  let end = { x: rectangleX2.value, y: rectangleY2.value };
  let color = defaultColorSelect.value;

  beadStack[stackLength] = new RectanglePattern(start, end, color, false);
}

function createTriangle() {
  let start = { x: triangleX1.value, y: triangleY1.value };
  let mid = { x: triangleX2.value, y: triangleY2.value };
  let end = { x: triangleX3.value, y: triangleY3.value };
  let color = defaultColorSelect.value;

  beadStack[stackLength] = new TrianglePattern(start, mid, end, color, false);
}

function createLinearIteration() {
  let start = { x: linearIterationX.value, y: linearIterationY.value };
  let colorA = firstIterationColorSelect.value;
  let colorB = secondIterationColorSelect.value;
  let rows = parseInt(linearRowTotal.value);
  let length = parseInt(linearRowLength.value);
  let pre = parseInt(linearFirstEnd.value);
  let post = parseInt(linearSecondEnd.value);
  let direction = $("#linear-iteration--field input:radio:checked").val();

  beadStack[stackLength] = new LinearIteration(
    length,
    start,
    pre,
    post,
    rows,
    direction,
    colorA,
    colorB,
    false
  );
}

function createTriangleIteration() {
  let start = { x: triangleIterationX.value, y: triangleIterationY.value };
  let colorA = firstIterationColorSelect.value;
  let colorB = secondIterationColorSelect.value;
  let rows = parseInt(triangleRowTotal.value);
  let group = parseInt(triangleRowGrouping.value);
  let num = parseInt(triangleEnds.value);
  let direction = $("#triangle-iteration--field input:radio:checked").val();

  beadStack[stackLength] = new TriangleIteration(
    start,
    group,
    num,
    rows,
    direction,
    colorA,
    colorB,
    false
  );
}

let appData = {
  id: 100,
  gridColor: "#e9e9e9",
  img: "loom/bl-",
  examples: 8,
  title: "Virtual Bead Loom",
  appSplit: "beadloom.html",
  isActive: false,
};

function switchApplications(app) {
  applicationID = app.id;
  currentProject.application = applicationID;
  // applicationTitle.innerHTML = app.title;
  gridColor = app.gridColor;
  goalDirectory = app.img;
  goalImageTotal = app.examples;
  currentApplicationSplit = app.appSplit;

  //Quick and dirty approach to handling broken images for new project saves
  currentLocation = window.location.href.split(currentApplicationSplit)[0];
  isAppHomepage = currentLocation.includes("CSDT_Single_Page");

  if (app.title.includes("Navajo")) navajoKnots = true;
  if (app.title.includes("Basket")) basketWeaving = true;
}

function initApplication() {
  switchApplications(appData);
  initCloudServices();
  updateCanvas();
  createBeadGallery();
  setLoadingOverlay(true, false);
}
window.addEventListener("resize", updateCanvas);
document.querySelector("body").addEventListener("resize", updateCanvas);

////////////////////////////////////////////////////////////////

initApplication();
