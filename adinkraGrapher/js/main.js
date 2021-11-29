let equationCount = 0;
let currentTemplate = "linear";
calculator.setExpression({
  id: "a",
  latex: "x^2+(y+9)^2=36",
  lineWidth: 10,
});
calculator.setExpression({
  id: "b",
  latex: "y=1.6x+7\\left\\{-6<x<0\\right\\}",
  lineWidth: 10,
  color: Desmos.Colors.BLUE,
});
calculator.setExpression({
  id: "c",
  latex: "y=-3\\left\\{-6<x<6\\right\\}",
  lineWidth: 10,
  color: Desmos.Colors.BLUE,
});
calculator.setExpression({
  id: "d",
  latex: "y=-1.6x+7\\left\\{0<x<6\\right\\}",
  lineWidth: 10,
  color: Desmos.Colors.BLUE,
});

function drawEquation(equation) {
  equation = cleanEquation(equation);
  if (equationTemplate.value == "circle") {
    let radius = equationRadius.value;
    calculator.setExpression({
      id: equationCount,
      latex: `${equation}`,
      lineWidth: 10,
      color: Desmos.Colors.BLUE,
    });
  } else {
    linearParameters.hidden = false;
    circleParameters.hidden = true;
    let startX = equationStartX.value;
    let endX = equationEndX.value;
    calculator.setExpression({
      id: equationCount,
      latex: `${equation}\\left\\{${startX}<x<${endX}\\right\\}`,
      lineWidth: 10,
      color: Desmos.Colors.BLUE,
    });
  }

  equationCount++;
}

function cleanEquation(equation) {
  let cleanEquation = equation;
  cleanEquation = cleanEquation.replaceAll("pi", "\\pi");

  cleanEquation = cleanEquation.replaceAll("arcsin(", "\\arcsin(");
  cleanEquation = cleanEquation.replaceAll("arccos(", "\\arccos(");
  cleanEquation = cleanEquation.replaceAll("arctan(", "\\arctan(");
  cleanEquation = cleanEquation.replaceAll("arccot(", "\\arccot(");
  cleanEquation = cleanEquation.replaceAll("arcsec(", "\\arcsec(");
  cleanEquation = cleanEquation.replaceAll("arccsc(", "\\arccsc(");

  cleanEquation = cleanEquation.replaceAll("ln(", "\\ln(");
  cleanEquation = cleanEquation.replaceAll("log(", "\\log(");

  cleanEquation = cleanEquation.replaceAll("sin(", "\\sin(");
  cleanEquation = cleanEquation.replaceAll("cos(", "\\cos(");
  cleanEquation = cleanEquation.replaceAll("tan(", "\\tan(");
  cleanEquation = cleanEquation.replaceAll("cot(", "\\cot(");
  cleanEquation = cleanEquation.replaceAll("sec(", "\\sec(");
  cleanEquation = cleanEquation.replaceAll("csc(", "\\csc(");

  cleanEquation = cleanEquation.replaceAll("arc\\sin(", "arcsin(");
  cleanEquation = cleanEquation.replaceAll("arc\\cos(", "arccos(");
  cleanEquation = cleanEquation.replaceAll("arc\\tan(", "arctan(");
  cleanEquation = cleanEquation.replaceAll("arc\\cot(", "arccot(");
  cleanEquation = cleanEquation.replaceAll("arc\\sec(", "arcsec(");
  cleanEquation = cleanEquation.replaceAll("arc\\csc(", "arccsc(");

  cleanEquation = cleanEquation.replaceAll("sqrt", "\\sqrt");

  return cleanEquation;
}

drawEquationBtn.addEventListener("click", (e) => {
  drawEquation(equationInput.value);
});

equationExamples.addEventListener("change", (e) => {
  let current = e.target.selectedOptions[0].value;
  linearParameters.hidden = current == "linear" ? false : true;
  circleParameters.hidden = current == "circle" ? false : true;
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
function createSymbolGallery() {
  // Current number of images available for the gallery
  let numOfImages = 47;
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

function loadFromJSON(data) {
  calculator.setState(data);
}

equationInput.addEventListener("keyup", (e) => {
  console.log(e.target.value);
});

function switchTemplate(context) {
  context = context.split(" ").join("");
  if (context.indexOf("y=") > -1) return "linear";
  if (context.indexOf("r^2") > -1) return "circular";
}
