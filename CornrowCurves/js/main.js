/* eslint-disable */

// Application ID can be found via django admin panel
let applicationID = 99;

// Cornrow Curves Math variables
let hideGrid = false;
let addAtCurrentPoint = false;
let showCoordinatesInCorner = false;
let hideHighlight = false;
let showVector = false;
let midVectors = [];
let currBraidIndex = 0;
let Braids = [];
let goalDirectory = "braids/cc-";

// The canvas object that will be used
const braidCanvas = document.getElementById("braidCanvas");
const ctx = braidCanvas.getContext("2d");

// Data that gets passed to cloud framework
let currentProject = new Project(Braids, braidCanvas);
let currentUser = new User();

// Different highlight values to distinguish different braids
let braidHighlightColors = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#10B981",
  "#3B82F6",
  "#A855F7",
  "#EC4899",
];

// Default state values for a current braid
let defaultValues = {
  iteration: 0,
  x: 0,
  y: 0,
  startAngle: 0,
  startDilation: 100,
  reflectX: false,
  reflectY: false,
  translate: 50,
  rotate: 0,
  dilate: 100,
};

// Example state (i.e. the braid that gets loaded first to show off the software)
let exampleValues = {
  iteration: 16,
  x: -142,
  y: 140,
  startAngle: 0,
  startDilation: 161,
  reflectX: false,
  reflectY: false,
  translate: 50,
  rotate: -2,
  dilate: 97,
};

//DOM elements
const applicationTitle = document.getElementById("application-title");
const applicationContainer = document.getElementById("canvas-container");
const dataContainer = document.getElementById("data-container");
let coordinatePanel = document.querySelector("#showCoordinates");

let xParam = document.querySelector("#start-x");
let yParam = document.querySelector("#start-y");
let angleParam = document.querySelector("#start-angle");
let startDilationParam = document.querySelector("#start-dilation");
let iterationsParam = document.querySelector("#iterations");
let translateParam = document.querySelector("#x-translation");
let rotateParam = document.querySelector("#rotation");
let dilateParam = document.querySelector("#dilation");
let reflectXParam = document.querySelector("#reflect-x");
let reflectYParam = document.querySelector("#reflect-y");
let formData = document.querySelector("#data-form");

let exportToFileBtn = document.querySelector("#saveLocalProject");
let importFromFileBtn = document.querySelector("#loadLocalProject");
let createNewBraidBtn = document.querySelector("#new-braid");
let resetCurrentBraidBtn = document.querySelector("#reset-braid");
let toggleGridBtn = document.querySelector("#hideGrid");
let toggleInitPointBtn = document.querySelector("#addAtCurrentPoint");
let togglePointLocationBtn = document.querySelector("#showCoordinatesOption");
let togglePointHighlightBtn = document.querySelector("#hideHighlight");
let togglePointVectorBtn = document.querySelector("#showVector");
let deleteSelectedBtn = document.querySelector("#delete-braid");
let braidSelection = document.querySelector("#braid-select");
let printPageBtn = document.querySelector("#printAppPage");
let clearBtn = document.querySelector(".btn-clear");

/////////////////////////////////
//Braid Gallery
////////////////////////////////

class Gallery {
  constructor() {
    this.createGallery();
    this.populateGallery();
  }

  createGallery() {
    let modal = document.createElement("div");
    let modalDialog = document.createElement("div");
    let modalContent = document.createElement("div");
    let modalHeader = document.createElement("div");
    let header = document.createElement("h5");
    let modalBody = document.createElement("div");
    let braidContainer = document.createElement("div");
    let modalFooter = document.createElement("div");
    let modalFooterContainer = document.createElement("div");
    let cancel = document.createElement("button");

    modal.id = "braidGallery";
    modal.classList.add("modal", "fade");
    modal.setAttribute("tabindex", "-1");
    modal.setAttribute("aria-labelledby", "braidGalleryLabel");
    modal.setAttribute("aria-hidden", "true");

    modalDialog.classList.add(
      "modal-dialog",
      "modal-dialog-centered",
      "modal-dialog-scrollable",
      "modal-lg"
    );

    modalContent.classList.add("modal-content");

    modalHeader.classList.add("modal-header");

    header.id = "braidGalleryLabel";
    header.innerHTML = `Select an image`;
    header.classList.add("modal-title");

    modalBody.classList.add("modal-body");

    braidContainer.id = "braidGalleryContainer";
    braidContainer.classList.add("row");
    modalFooter.classList.add("modal-footer");

    cancel.innerHTML = "Cancel";
    cancel.classList.add("btn", "btn-danger");
    cancel.setAttribute("type", "button");
    cancel.setAttribute("data-dismiss", "modal");

    modalFooterContainer.append(cancel);
    modalFooter.appendChild(modalFooterContainer);

    modalBody.appendChild(braidContainer);

    modalHeader.appendChild(header);

    modalContent.append(modalHeader, modalBody, modalFooter);

    modalDialog.appendChild(modalContent);

    modal.appendChild(modalDialog);

    document.body.appendChild(modal);
  }

  populateGallery() {
    // Current number of images available for the gallery
    let numOfImages = 23;
    for (let i = 0; i < numOfImages; i++) {
      // DOM element creation
      let parentContainer = document.querySelector("#braidGalleryContainer");
      let childContainer = document.createElement("div");
      let image = document.createElement("img");

      // Assigning all the classes and attributes
      childContainer.classList.add("col-md-4", "col-sm-1");
      image.classList.add("img-fluid", "mb-1", "mt-1", "braid-img");
      image.setAttribute(
        "src",
        `${isAppHomepage ? currentLocation : ""}img/${goalDirectory}${
          i + 1
        }.jpg`
      );

      // Appending the child to the parent container (image to gallery)
      childContainer.appendChild(image);
      parentContainer.appendChild(childContainer);

      // Add event handler to each image
      $(childContainer).on("click", (e) => {
        let img = document.querySelector("#goal-image");

        img.src = e.target.getAttribute("src");
        $(document.querySelector("#braidGallery")).modal("hide");
      });
    }
  }
}

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

let gallery = new Gallery();

/////////////////////////////////
//Form inputs
////////////////////////////////
/** Application event bindings**/

formData.addEventListener("change", () => {
  loadCanvas();
  currentProject.modified = true;
  currentProject.refreshModifiedStatusIndicator();
});

formData.addEventListener("keyup", () => {
  loadCanvas();
  currentProject.modified = true;
  currentProject.refreshModifiedStatusIndicator();
});

formData.addEventListener("input", () => {
  loadCanvas();
  currentProject.modified = true;
  currentProject.refreshModifiedStatusIndicator();
});

xParam.addEventListener("focusout", () => {
  if (xParam.value == "") {
    xParam.value = defaultValues.x;
  }
});
yParam.addEventListener("focusout", () => {
  if (yParam.value == "") {
    yParam.value = defaultValues.y;
  }
});
angleParam.addEventListener("focusout", () => {
  if (angleParam.value == "") {
    angleParam.value = defaultValues.startAngle;
  }
});
startDilationParam.addEventListener("focusout", () => {
  if (startDilationParam.value == "") {
    startDilationParam.value = defaultValues.startDilation;
  }
});
iterationsParam.addEventListener("focusout", () => {
  if (iterationsParam.value == "") {
    iterationsParam.value = defaultValues.iteration;
  }
});
translateParam.addEventListener("focusout", () => {
  if (translateParam.value == "") {
    translateParam.value = defaultValues.translate;
  }
});
rotateParam.addEventListener("focusout", () => {
  if (rotateParam.value == "") {
    rotateParam.value = defaultValues.rotate;
  }
});
dilateParam.addEventListener("focusout", () => {
  if (dilateParam.value == "") {
    dilateParam.value = defaultValues.dilate;
  }
});

/////////////////////////////////
//Form inputs
////////////////////////////////

exportToFileBtn.addEventListener("click", () => {
  cloud.exportToFile();
});

importFromFileBtn.addEventListener("change", (e) => {
  let file = e.target.files[0];
  cloud.importFromFile(file);
});

createNewBraidBtn.addEventListener("click", () => {
  createNewBraid();
});

resetCurrentBraidBtn.addEventListener("click", () => {
  setCurrentBraidValues(defaultValues, true);
  loadCanvas();
});

toggleGridBtn.addEventListener("click", () => {
  toggleGrid();
});

toggleInitPointBtn.addEventListener("click", () => {
  toggleInitPointLocation();
});

togglePointLocationBtn.addEventListener("click", () => {
  togglePointDisplayLocation();
});

togglePointHighlightBtn.addEventListener("click", () => {
  toggleBraidHighlight();
});

togglePointVectorBtn.addEventListener("click", () => {
  toggleVector();
});

deleteSelectedBtn.addEventListener("click", () => {
  deleteSelectedBraid();
  setParamsForBraid(Braids[currBraidIndex]);
  loadCanvas();
  updateBraidSelect();
});

braidSelection.addEventListener("change", (e) => {
  loadBraidFromSelect(e.target.value);
});

printPageBtn.addEventListener("click", () => {
  printApplicationPage();
});

clearBtn.addEventListener("click", () => {
  clearCanvas();
});

/////////////////////////////////
//Event Functions
////////////////////////////////

/**Toggles the grid in canvas */
function toggleGrid() {
  hideGrid = !hideGrid;
  loadCanvas();
  toggleGridBtn.innerHTML = hideGrid ? "Show Grid" : "Hide Grid";
}

/**Toggles the starting point in canvas*/
function toggleInitPointLocation() {
  toggleInitPointBtn.innerHTML = addAtCurrentPoint
    ? "Add Braid at Current Point"
    : "Add Braid at Origin";
  addAtCurrentPoint = !addAtCurrentPoint;
}

/** Toggles the coordinate point display in the bottom right corner*/
function togglePointDisplayLocation() {
  togglePointLocationBtn.innerHTML = showCoordinatesInCorner
    ? "XY In Lower Right"
    : "XY Follows Mouse";
  showCoordinatesInCorner = !showCoordinatesInCorner;
}

/**Toggles the initial braid highlight*/
function toggleBraidHighlight() {
  togglePointHighlightBtn.innerHTML = hideHighlight
    ? "Hide Plait Highlight"
    : "Show Plait Highlight";
  hideHighlight = !hideHighlight;
  loadCanvas();
}

/** Toggles the vector visible on the braid*/
function toggleVector() {
  togglePointVectorBtn.innerHTML = showVector ? "Show Vector" : "Hide Vector";
  showVector = !showVector;
  loadCanvas();
}

/** Prints the page in landscape for the user*/
function printApplicationPage() {
  // Injects style into the document in order for window.print() to print in landscape
  let css = "@page { size: landscape; }",
    head = document.head || document.getElementsByTagName("head")[0],
    style = document.createElement("style");

  style.type = "text/css";
  style.media = "print";

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);

  // Prints the body of the page (everything under the navigation bar)
  window.print();
}

/**Sets/Resets the braid to a default, predetermined state on the canvas.*/
function setCurrentBraidValues(data, isReset = false) {
  // Set all the braid's values
  iterationsParam.value = data.iteration;
  // If the user doesn't want to add the braid at the current
  // point, or if the user is not currently resetting the braid
  if (!isReset && !addAtCurrentPoint) {
    xParam.value = data.x;
    yParam.value = data.y;
  }
  angleParam.value = data.startAngle;
  startDilationParam.value = data.startDilation;
  reflectXParam.checked = data.reflectX;
  reflectYParam.checked = data.reflectY;

  translateParam.value = data.translate;
  rotateParam.value = data.rotate;
  dilateParam.value = data.dilate;
}

/** Creates a new braid with the default values declared at the top of the file.*/
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
  currentProject.refreshModifiedStatusIndicator();
}

/** Deletes the currently selected braid.*/
function deleteSelectedBraid() {
  // Grabs the latest braid
  Braids.splice(currBraidIndex, 1);

  // Update the index
  currBraidIndex = currBraidIndex - 1;
  currentProject.modified = true;
  currentProject.refreshModifiedStatusIndicator();
}

/**Cycles through the defined colors to give different colors to each braid's highlight*/
function changeBraidHighlightColor(num) {
  let availableColors = braidHighlightColors.length;

  if (num < availableColors) {
    return braidHighlightColors[num];
  } else {
    return braidHighlightColors[num % availableColors];
  }
}

/**Sets parameters to those for a certain braid */
function setParamsForBraid(braid) {
  if (braid == undefined) {
    console.log("End of braid list. Add more braids to set parameters.");
  } else {
    xParam.value =
      (braid._x - braidCanvas.width / 2) *
      (braid._reflection.includes("y") ? -1 : 1);
    yParam.value =
      -(braid._y - braidCanvas.height / 2) *
      (braid._reflection.includes("x") ? -1 : 1);
    angleParam.value = radToDeg(braid._rotation) * -1;
    startDilationParam.value = (braid._size * 2000) / braidCanvas.width;
    reflectXParam.checked = braid._reflection.includes("x");
    reflectYParam.checked = braid._reflection.includes("y");
    iterationsParam.value = braid.iteration.n;
    translateParam.value = braid.iteration.translateX;
    rotateParam.value = braid.iteration.rotationAngle * -1;
    dilateParam.value = braid.iteration.dilation;
  }
}

/////////////////////////////////
//Canvas
////////////////////////////////
/** Clears entire canvas from braids.*/
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
    currentProject.refreshModifiedStatusIndicator();
  }
}

/** loads canvas at the correct height and iterates with current settings*/
function loadCanvas() {
  // Wipes the entire canvas clean

  ctx.clearRect(0, 0, braidCanvas.width, braidCanvas.height);

  // Gets all form values
  let iterations = parseInt(iterationsParam.value);
  let startX = parseFloat(xParam.value) * (reflectYParam.checked ? -1 : 1);
  let startY = parseFloat(yParam.value * -1 * (reflectXParam.checked ? -1 : 1));
  let startAngle = parseFloat(angleParam.value * -1);
  let startingDilation = parseFloat(startDilationParam.value);
  let xTranslation = parseFloat(translateParam.value);
  let rotation = parseFloat(rotateParam.value * -1);
  let dilation = parseFloat(dilateParam.value);
  let xReflection = reflectXParam.checked;
  let yReflection = reflectYParam.checked;
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
    applicationContainer.classList.contains("col-6")
  ) {
    applicationContainer.classList.toggle("col-6");
    applicationContainer.classList.toggle("col-12");
    dataContainer.classList.toggle("col-6");
    dataContainer.classList.toggle("col-12");
  } else if (
    $(window).width() >= 992 &&
    applicationContainer.classList.contains("col-12")
  ) {
    applicationContainer.classList.toggle("col-12");
    applicationContainer.classList.toggle("col-6");
    dataContainer.classList.toggle("col-12");
    dataContainer.classList.toggle("col-6");
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

/**Creates the grid lines for the canvas */
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
  coordinatePanel.setAttribute("hidden", false);

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
    mouseText = { x, y };
    coordinatePanel.innerHTML = "";
    coordinatePanel.classList.remove("coordinate-backing");
  } else {
    coordinatePanel.innerHTML = `(${x - braidCanvas.width / 2}, ${
      (y - braidCanvas.width / 2) * -1
    })`;

    coordinatePanel.classList.add("coordinate-backing");
  }
  for (let i = 0; i < Braids.length; i++) {
    if (Braids[i].contains(x, y) && !hideHighlight) {
      Braids[i].stamp(changeBraidHighlightColor(i));
    }
  }
});

// Dictates how the canvas will act on mouse leave
braidCanvas.addEventListener("mouseleave", (e) => {
  coordinatePanel.setAttribute("hidden", true);
  loadCanvas();
});

// Dictates how the canvas will act on mouse click
braidCanvas.addEventListener("click", (e) => {
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

// Misc
////////////////////////////////////////////////////////////////////
/** Updates the braid select input with the current braids */
function updateBraidSelect() {
  // Clear the current options
  braidSelection.innerHTML = "";

  // Iterates through the braids and appends the updated options
  for (let i = 0; i < Braids.length; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = `Braid ${i + 1}`;
    option.selected = currBraidIndex == i ? true : false;
    braidSelection.appendChild(option);
  }
}

/** Based on user selection, load in braid*/
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

/** Initializes the application */
function initApplication() {
  cloud.init();
  loadCanvas();
  updateBraidSelect();

  setLoadingOverlay(true, false);
}

window.addEventListener("resize", loadCanvas);
document.querySelector("body").addEventListener("resize", loadCanvas);
