// Save and Load Locally
////////////////////////////////////////////////////////////////////

$(`#${cloudUI.saveLocalProject}`).on("click", () => {
  let filename = currentProject.name;
  let text = JSON.stringify(Braids.map((b) => b.serialize()));
  downloadStringAsFile(`${filename}.json`, text);
});

$(`#${cloudUI.loadLocalProject}`).on("change", (e) => {
  let file = e.target.files[0];
  if (!file) {
    return;
  }
  let reader = new FileReader();
  reader.onload = (e) => {
    loadFromJSON(e.target.result);
  };
  reader.readAsText(file);
});
////////////////////////////////////////////////////////////////////

// Save and Load via the Cloud
////////////////////////////////////////////////////////////////////
$(`#${cloudUI.signInSubmit}`).on("click", () => {
  attemptSignIn();
});

$(`#${cloudUI.signInPrompt}`).on("keydown", function (e) {
  var key = e.which || e.keyCode;
  if (key == 13) {
    attemptSignIn();
  }
});

$(`#${cloudUI.signOutSubmit}`).on("click", () => {
  attemptSignOut();
});

$(`#${cloudUI.loadProjectSubmit}`).on("click", () => {
  loadProjectFromCloud($(`#${cloudUI.loadProjectList}`).val(), loadFromJSON);
});

$(`#${cloudUI.saveProjectSubmit}`).on("click", () => {
  setNewProjectStatus(true);
  saveProjectToCloud();
});

$(`#${cloudUI.saveConfirmedSubmit}`).on("click", () => {
  setNewProjectStatus(false);
  saveProjectToCloud();
});

////////////////////////////////////////////////////////////////////

// Canvas Operations
////////////////////////////////////////////////////////////////////
$(appReferences.newBraidBtn).on("click", () => {
  createNewBraid();
});

$(appReferences.resetCurrentBtn).on("click", () => {
  setCurrentBraidValues(defaultValues, true);
  loadCanvas();
});

$(appReferences.toggleGridBtn).on("click", () => {
  toggleGrid();
});

$(appReferences.toggleInitPointBtn).on("click", () => {
  toggleInitPointLocation();
});

$(appReferences.togglePointLocationBtn).on("click", () => {
  togglePointDisplayLocation();
});

$(appReferences.togglePointHighlightBtn).on("click", () => {
  toggleBraidHighlight();
});

$(appReferences.togglePointVectorBtn).on("click", () => {
  toggleVector();
});

$(appReferences.deleteSelectedBtn).on("click", () => {
  // let toBeDeleted =
  deleteSelectedBraid();
  setParamsForBraid(Braids[currBraidIndex]);
  // Reload the canvas and braids
  loadCanvas();
  updateBraidSelect();
});

$(appReferences.braidSelection).on("change", (e) => {
  loadBraidFromSelect(e.target.value);
});

$(appReferences.printPageBtn).on("click", () => {
  printApplicationPage();
});

$(appReferences.clearBraidsBtn).on("click", () => {
  clearCanvas();
});

// coordinateLocationBtn.addEventListener("click", () => {
//   toggleMoveCoordinateLocation();
// });

// gridBtn.addEventListener("click", () => {
//   toggleHideGrid();
// });

// printBtn.addEventListener("click", () => {
//   window.print();
// });

// clearBtn.addEventListener("click", () => {
//   clearCanvas();
// });

// Toggles the visibility of the user's password
$(`#${cloudUI.passwordVisibility}`).on("click", () => {
  togglePasswordVisibility();
});

// Toggles password visibility back to hidden, then clear password (for security purposes)
$(`#${cloudUI.signInPrompt}`).on("hide.bs.modal", function (event) {
  togglePasswordVisibility(true);
  $(`#${cloudUI.passwordField}`).val("");
});

// Updates global project name when user makes any changes to it
$(`#${cloudUI.projectNameField}`).on("keyup", () => {
  $(`#${cloudUI.projectNameField}`).attr(
    "value",
    $(`#${cloudUI.projectNameField}`).val()
  );
  currentProject.name = $(`#${cloudUI.projectNameField}`).val();
});

window.addEventListener("beforeunload", function (e) {
  var confirmationMessage =
    "It looks like you have been editing something. " +
    "If you leave before saving, your changes will be lost.";

  let saveStatus =
    visibleModifiedStatus.innerHTML.indexOf("unsaved changes") >= 0;
  console.log();
  if (saveStatus) {
    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
  }
  return;
});
