const equationMenu = document.getElementById("equationMenu");
const equationSelect = document.getElementById("equationTemplates");
const equationDisplay = document.getElementById("equationTemplateDisplay");
let currentTemplate = "linear";

equationSelect.addEventListener("change", (e) => {
  document.getElementById(`${currentTemplate}Template`).hidden = true;
  document.getElementById(`${e.target.value}Template`).hidden = false;
  currentTemplate = e.target.value;
});

const drawGraph = function (equation0, stax, endx) {
  //Generalize form between possible equation variations
  equation0 = generalizeForm(equation0);

  //Flag user for duplicate equations
  if (checkForDuplicates(equation0, stax, endx)) return 1;

  const equationList = equation0.split("=");

  if (equationList.length != 2) {
    displayInfo("Invalid Equation", "orange");
    return 1;
  }

  if (currentTemplate == "linear") equation = parseEquation(equationList);
  else equation = parseEquation(equationList);

  document.getElementById(
    `${currentTemplate}TestLabel`
  ).innerHTML = `General Form: ${equation}`;


  if (currentTemplate == "linear"){
    for (
      let xc = parseFloat(stax);
      xc < parseFloat(endx) + minTrailLen;
      xc += minTrailLen
    ) {
      trail.push({ x: xc, y: calculateY(xc, equation) });
    }
  }else{
    parseCircle(equation)
  }


    trails.push(trail);
    graphs.push(equation0);
    gpinfo.push([stax, endx]);
    trail = [];
    createEquationBtn(equation0, stax, endx);
    updateScreen();
  
};

// ensures y=0.9(x-6)^2 is the same as y=0.9*(x-6)^2
function generalizeForm(equation) {
  let i = 1;
  const array = equation.split("");
  while (i < array.length) {
    if (array[i] == "(" && "01234567890x".indexOf(array[i - 1]) != -1) {
      array.splice(i, 0, "*");
      i += 2;
    } else {
      i++;
    }
  }
  return array.join("");
}

function checkForDuplicates(equation, startX, endX) {
  // checks if graph with same params exists
  for (let i = 0; i < graphs.length; i++) {
    if (graphs[i] == equation) {
      if (
        gpinfo[i][0].toString() == startX.toString() &&
        gpinfo[i][1].toString() == endX.toString()
      ) {
        // deleteGraph(graphs.indexOf(equaequationton0));
        displayMessage(
          "Graph Already Drawn!",
          undefined,
          undefined,
          undefined,
          "rgb(255 0 100)"
        );
        return true;
      }
    }
  }
  return false;
}

// function validateEquation(equation) {
// continue;
// }

function parseEquation(equationList) {
  let equation = equationList[1];
  if (equation[0] == "-") {
    equation = "0" + equation;
  }
  for (let id = 0; id < equation.length; id++) {
    if (legitSymbols.indexOf(equation[id]) > -1) {
      equation =
        equation.slice(0, id) +
        " " +
        equation[id] +
        " " +
        equation.slice(id + 1, equation.length);
      id += 2;
    } else if (
      equation[id + 1] == "x" &&
      "0123456789".indexOf(equation[id]) != -1
    ) {
      equation =
        equation.slice(0, id + 1) +
        " * " +
        equation.slice(id + 1, equation.length);
      id += 3;
    }
  }
  for (let id = 0; id < legitFunctions.length; id++) {
    const idx = equation.indexOf(legitFunctions[id]);
    if (idx > 0 && "0123456789".indexOf(equation[idx - 1]) != -1) {
      equation =
        equation.slice(0, idx) +
        " * " +
        legitFunctions[id] +
        " " +
        equation.slice(idx + legitFunctions[id].length, equation.length);
    } else if (idx > -1) {
      equation =
        equation.slice(0, idx) +
        " " +
        legitFunctions[id] +
        " " +
        equation.slice(idx + legitFunctions[id].length, equation.length);
    }
  }

  return equation;
}

function parseCircle(equation){
  // y=sqrt(9-(x^2))+8
  for (
    let xc = parseFloat(-3);
    xc < parseFloat(3) + minTrailLen;
    xc += minTrailLen
  ) {
    trail.push({ x: xc, y: calculateY(xc, equation) });
  }
}
