var elt = document.getElementById("calculator");
var calculator = Desmos.GraphingCalculator(elt);

const equationInput = document.getElementById("equation");
const equationStartX = document.getElementById("start-x");
const equationEndX = document.getElementById("end-x");
const equationRadius = document.getElementById("radius");
const drawEquationBtn = document.getElementById("drawEquation");
const equationTemplate = document.getElementById("equationExamples");
const linearParameters = document.getElementById("linearParameters");
const circleParameters = document.getElementById("circleParameters");
let equationCount = 0;
let currentTemplate = "linear";
calculator.setExpression({
  id: "0",
  latex: "x^2+(y+9)^2=36",
  lineWidth: 10,
});
calculator.setExpression({
  id: "1",
  latex: "y=1.6x+7\\left\\{-6<x<0\\right\\}",
  lineWidth: 10,
});
calculator.setExpression({
  id: "2",
  latex: "y=-3\\left\\{-6<x<6\\right\\}",
  lineWidth: 10,
});
calculator.setExpression({
  id: "3",
  latex: "y=-1.6x+7\\left\\{0<x<6\\right\\}",
  lineWidth: 10,
});
function drawEquation(equation) {
  if (equationTemplate.value == "circle") {
    let radius = equationRadius.value;
    calculator.setExpression({
      id: equationCount,
      latex: `${equation}`,
    });
  } else {
    linearParameters.hidden = false;
    circleParameters.hidden = true;
    let startX = equationStartX.value;
    let endX = equationEndX.value;
    calculator.setExpression({
      id: equationCount,
      latex: `${equation}\\left\\{${startX}<x<${endX}\\right\\}`,
    });
  }

  equationCount++;
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
function createBraidGallery() {
  // Current number of images available for the gallery
  let numOfImages = 4;
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

$(appReferences.clearEquationsBtn).on("click", () => {
  let equations = calculator.getExpressions();
  equations.forEach(function (state) {
    calculator.removeExpression(state);
  });
  // calculator.clearHistory();
});
