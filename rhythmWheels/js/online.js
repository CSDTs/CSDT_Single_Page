/* eslint-disable */

// CSRF functionality
// //////////////////////////////////////////////////////////////
/**
 * Gets a cookie of a specific type from the page
 * @param {String} name - should pretty much always be csrftoken
 * @return {String} - returns the cookie
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie != "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) == name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Tests if this is csrf safe
 * @param {String} method - tests the given method
 * @return {Boolean} - is safe
 */
function csrfSafeMethod(method) {
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

/**
 * Test that a given url is a same-origin URL
 * @param {String} url - the URL to test
 * @return {Boolean} - is same origin
 */
function sameOrigin(url) {
  const host = document.location.host; // host + port
  const protocol = document.location.protocol;
  const srOrigin = "//" + host;
  const origin = protocol + srOrigin;
  return (
    url == origin ||
    url.slice(0, origin.length + 1) == origin + "/" ||
    url == srOrigin ||
    url.slice(0, srOrigin.length + 1) == srOrigin + "/" ||
    !/^(\/\/|http:|https:).*/.test(url)
  );
}

/**
 * Gets a CSRF token for the user
 */
function getCSRFToken() {
  const csrftoken = getCookie("csrftoken");

  $.ajaxSetup({
    beforeSend: function (xhr, settings) {
      if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    },
  });
}

// General project management functionality
// //////////////////////////////////////////////////////////////

/**
 * Based on current modified project status, updates the helpful text
 * letting the user know they have unsaved changes or not.
 */
function updateVisibleModifiedStatus() {
  $(`#${cloudUI.visibleModifiedStatus}`).html(
    currentProject.modified
      ? "<strong>You have unsaved changes.</strong> "
      : `Last saved on: <strong>${currentProject.created_at}</strong>`
  );
}

/**
 * One of the first functions to run, sets the application up for cloud
 * saving and loading
 */
function initCloudServices() {
  //Gets the CSRF token
  getCSRFToken();

  // Check for current user and project
  fetchCurrentUser()
    .then((data) => {
      currentUser.loggedIn = !(data.id == null);
      currentUser.id = data.id || "";
      currentUser.name = data.username || "";

      //Fetches the classroom list for a logged in user
      if (currentUser.loggedIn) {
        fetchUserClassroomList(
          (data) => {
            updateProjectSaveClassroomSelect(data);
          },
          (err) => {
            console.error(
              `Error: Failed to get a classroom list -- ${JSON.stringify(err)}`
            );
          }
        );
        checkForConfigFile();
      }
      // Update layout and project list status
      updateGlobalLayout();
      updateProjectList();
    })
    .catch((err) => {
      currentUser.id, (currentUser.name = "");
      currentUser.loggedIn = false;
      updateGlobalLayout();
      // Lack of internet connection, wrong password, other errors
      console.error(
        `Error: Failed to get a current user -- ${JSON.stringify(err)}`
      );
    });
}

//Load Project functionality
////////////////////////////////////////////////////////////////

/**
 * Creates a new option for selects
 * @param {object} data Attributes to be assigned to the new option
 * @param {*} type 'classroom' attaches just the value, 'project' attaches everything else
 * @returns A new option element
 */
function createNewOption(data, type) {
  let newOption = document.createElement("option");
  newOption.value = data.id;
  newOption.innerHTML = data.name;

  //If the type is classroom, then there is no need to add the remainder of the attributes that relate to projects
  if (type == "classroom") return newOption;

  newOption.setAttribute("data-classroom", data.classroom);
  newOption.setAttribute("data-classroom_name", data.classroom_name || "");
  newOption.setAttribute("data-screenshot_url", data.screenshot_url);
  newOption.setAttribute("data-when_modified", data.when_modified);
  newOption.setAttribute("data-when_created", data.when_created);
  return newOption;
}

/**
 * Creates a fresh project load component based on a given state
 * @param {string} state A defined state determining how the load project component will look
 * @returns The completed component for project loads
 */
function createLoadProjectComponent(state) {
  let component = document.createElement("div");
  let message = document.createElement("strong");
  let select = document.createElement("select");
  let loader = document.createElement("img");
  let loaderContainer = document.createElement("div");
  let prompt = document.createElement("p");

  loadProjectComponent.innerHTML = "";

  prompt.innerHTML = "Select Project";
  prompt.classList.add("text-muted");

  message.classList.add("text-center", "ml-auto", "mx-auto");
  message.id = "loadProjectPromptMsg";
  message.innerHTML =
    state == "sign-in"
      ? "Sign in to view projects..."
      : state == "checking"
      ? "Checking for projects..."
      : state == "loading"
      ? ""
      : "There are no projects compatible with the current application.";

  component.appendChild(prompt);
  component.appendChild(message);

  if (state == "sign-in") return component;

  if (state == "checking") {
    loaderContainer.classList.add("loader");
    loaderContainer.id = "loadProjectLoader";
    loader.setAttribute(
      "src",
      `${isAppHomepage ? currentLocation : ""}img/loader.svg`
    );
    loaderContainer.appendChild(loader);
    component.appendChild(loaderContainer);
    return component;
  }

  if (state == "loading") {
    select.classList.add("form-control");
    select.id = "loadProjectList";
    select.addEventListener("change", (e) => {
      let optionAttributes = {
        classroom:
          e.target.options[e.target.selectedIndex].getAttribute(
            "data-classroom"
          ),
        classroom_name: e.target.options[e.target.selectedIndex].getAttribute(
          "data-classroom_name"
        ),
        screenshot_url: e.target.options[e.target.selectedIndex].getAttribute(
          "data-screenshot_url"
        ),
        when_modified:
          e.target.options[e.target.selectedIndex].getAttribute(
            "data-when_modified"
          ),
        when_created:
          e.target.options[e.target.selectedIndex].getAttribute(
            "data-when_created"
          ),
      };
      //Updates the project details to the right of the select
      updateProjectDetails(optionAttributes, "show");
    });
    component.appendChild(select);
    return component;
  }

  //Default component state gets returned regardless
  return component;
}

/**
 * Callback for a successful response from our projects API
 * @param {array} projects The API response containing the relevant projects
 */
function successfullyFetchedProjects(projects) {
  let mostRecentProject;
  // Create how the project load component will look
  loadProjectComponent.appendChild(createLoadProjectComponent("loading"));

  //If the user has no projects, then update loading options and component
  if (!projects.length) {
    loadProjectComponent.appendChild(createLoadProjectComponent("empty"));
    handleLoadProjectOptions("empty");
    return;
  }

  // Create new options for project load select (if projects are available)
  projects.forEach((project) => {
    $(`#${cloudUI.loadProjectList}`).append(
      createNewOption(project, "project")
    );
  });

  //Assign to the most recent project (as of now, it is the last project in the array)
  mostRecentProject = projects.slice(-1)[0];

  //Make the most recent project the selected
  document.querySelector(
    `#${cloudUI.loadProjectList} [value="${mostRecentProject.id}"]`
  ).selected = true;

  //Update project details
  updateProjectDetails(mostRecentProject, "show");

  //Update loading options
  handleLoadProjectOptions("loading");
}

/**
 * Callback on erroneous API response for project list
 * @param {object} err Error JSON object
 */
function errorFetchingProjects(err) {
  console.error(
    `Error Message: Failed to fetch current user's projects -- ${JSON.stringify(
      err
    )}`
  );
  loadProjectComponent.appendChild(createLoadProjectComponent("error"));
  handleLoadProjectOptions("error");
}

/**
 * Determines what buttons are available based on the user's state for project loading
 * @param {string} state Defined state for what button options are available for loading projects
 */
function handleLoadProjectOptions(state) {
  //Not logged in: Default
  let loginBtnStatus = false;
  let loadBtnStatus = true;

  //Logged in, no projects
  if (state == "empty" || state == "error" || state == "checking")
    loginBtnStatus = true;

  // Logged in, projects to load
  if (state == "loading" || state == "update") {
    loginBtnStatus = true;
    loadBtnStatus = false;
  }
  $(`#${cloudUI.loadProjectSubmit}`).attr("hidden", loadBtnStatus);
  $(`#${cloudUI.loadProjectSignIn}`).attr("hidden", loginBtnStatus);
}

/**
 * Updates the project details aside with the current selected project information
 * @param {object} data An object containing the project data
 * @param {*} state Defined state that determines how the project details will appear
 * @returns
 */
function updateProjectDetails(data, state) {
  detailsProjectComponent.hidden = state == "hide";

  //TODO: Add garbage collection for when the project details are hidden (meaning that they have no projects, error occurred, or they logged out)
  if (state == "hide") return;

  //If shown, update the details
  // loadProjectPreview.setAttribute("src", data.screenshot_url);
  loadProjectPreview.setAttribute(
    "src",
    `${isAppHomepage ? currentLocation : ""}img/project_default.png`
  );

  loadProjectPreview.hidden = false;

  loadProjectModifiedDate.innerHTML = data.when_modified;

  // loadProjectCreatedDate.innerHTML = data.when_created;
  loadProjectClassroom.innerHTML =
    data.classroom == "undefined" ||
    data.classroom == null ||
    data.classroom == "null"
      ? "Not assigned a classroom."
      : data.classroom_name;
}

/**
 * Handles the project list based on user status and current project(s)
 */
function updateProjectList() {
  //Load the sign in prompt if user isn't logged in
  if (!currentUser.loggedIn) {
    loadProjectComponent.appendChild(createLoadProjectComponent("sign-in"));
    handleLoadProjectOptions("sign-in");
    updateProjectDetails({}, "hide");
    return;
  }

  // Load the 'checking projects' prompt
  loadProjectComponent.appendChild(createLoadProjectComponent("checking"));
  handleLoadProjectOptions("checking");

  /**
   * Proceed with checking the user's projects
   * @param {function} successfullyFetchedProjects On success, create the options for project select, attach event listeners
   * @param {function} errorFetchingProjects On error, load the error prompt, letting the user know that something happened
   *
   * */
  fetchUserProjectList(successfullyFetchedProjects, errorFetchingProjects);
}

/**
 * Updates the page's url with the current project's id
 */
function updateCurrentURL() {
  if (window.history !== undefined && window.history.pushState !== undefined) {
    window.history.pushState({}, "", `/projects/${currentProject.id}/run`);
  }
}

function loadProjectFromCloud(id, serializeCallback) {
  // Handle the loading modal and alert the user that project is loading
  // $(`#${cloudUI.loadProjectPrompt}`).modal("hide");
  alertUser("Loading project. Please wait...");

  // If the project find was successful, load the file recieved
  let successfulProjectLoad = function (data, proj) {
    // Helper function to perform the load
    serializeCallback(proj);

    // Update flags and globals
    currentProject.modified, (currentProject.new = false);

    currentProject.id = id;
    currentProject.name = data.name;
    currentProject.created_at = data.when_created;
    currentProject.classroom = data.classroom;
    updateVisibleModifiedStatus();

    // Update the url
    updateCurrentURL();

    // Update project name
    $(`#${cloudUI.projectNameField}`).attr("value", currentProject.name);
    $(`#${cloudUI.visibleModifiedStatus}`).html(
      `Last saved on: <strong>${currentProject.created_at}</strong>`
    );

    // Alert the user that it was a success
    alertUser("Successfully loaded the project.", 2000);
  };

  let failedProjectLoad = function (data) {
    alertUser("Error loading your project. Please try again", 4000);
    console.error(`Note to Developer: Failed cloud project fetch.`);
    console.error(`Error Message: ${data}`);
  };
  fetchProject(id, successfulProjectLoad, failedProjectLoad);
}

//API Calls for
////////////////////////////////////////////////////////////////

function fetchCurrentUser() {
  return new Promise((resolve, reject) => {
    $.ajax({
      dataType: "json",
      url: csdtAPI.user,
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

function fetchUserProjectList(success, error) {
  $.get(
    `${csdtAPI.project}?owner=${currentUser.id}&application=${applicationID}`,
    null,
    success,
    "json"
  ).fail(error);
}

function fetchProject(id, success, error) {
  $.get(`${csdtAPI.project}${id}/`, null, (data) => {
    $.get(data.project_url, null, (proj) => {
      success(data, proj);
    }).fail(error);
  }).fail(error);
}

function fetchUserClassroomList(success, error) {
  $.get(
    `${csdtAPI.classroom}?user=${currentUser.id}`,
    null,
    (data) => {
      success(data);
    },
    "json"
  ).fail(error);
}

function saveNewFile(file) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "PUT",
      url: csdtAPI.file,
      data: file,
      processData: false,
      contentType: false,
      success: function (data) {
        resolve(data.id);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

//Save Project functionality
////////////////////////////////////////////////////////////////
function createNewProject(project) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: csdtAPI.project,
      data: {
        name: project.name,
        description: project.description,
        classroom: project.classroom,
        application: project.application,
        project: project.data_id,
        screenshot: project.screenshot_id,
      },
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

function updateExistingProject(project) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "PUT",
      url: `${csdtAPI.project}${currentProject.id}/`,
      data: {
        name: project.name,
        description: project.description,
        classroom: project.classroom,
        application: project.application,
        project: project.data_id,
        screenshot: project.screenshot_id,
        // when_created: project.created_at,
      },
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

function updateCurrentProjectSettings(id) {
  currentProject.id = id;
  currentProject.modified = false;
  currentProject.new = false;
  updateVisibleModifiedStatus();
  updateCurrentURL();
  alertUser("Success. Your project was saved.", 2500);
  updateProjectList();
}

function setNewProjectStatus(state) {
  console.log(`Saving ${state ? "new" : "current"} project...`);
  currentProject.new = state;
  console.log(`isNewProject: ${currentProject.new}`);
}

function generateSaveFormData(data, type) {
  let projectForm = new FormData();
  let projectData = dataToBlob(data, type);
  projectForm.append("file", projectData);
  return projectForm;
}

function generateRhythmSaveFormData(data, type) {
  let projectForm = new FormData();
  let projectData = {};
  projectData.string = data;

  let projectBlob = new Blob([JSON.stringify(projectData)], {
    type: type,
  });
  projectForm.append("file", projectBlob);
  return projectForm;
}

function saveProjectToCloud() {
  // First, get a CSRF Token
  getCSRFToken();
  // Second, alert the user that their project is saving
  alertUser("Saving your project. Please wait...");

  let projectForm = generateRhythmSaveFormData(
    saveObject.project,
    "application/json"
  );
  // let imageForm = generateSaveFormData(saveObject.image, "image/png");

  // const imgPromise = saveNewFile(imageForm).catch((err) => {
  //   console.error(err);
  // });
  const dataPromise = saveNewFile(projectForm).catch((err) => {
    console.error(err);
  });

  Promise.all([dataPromise]).then((values) => {
    currentProject.screenshot_id = saveObject.image;
    currentProject.data_id = values[0];
    currentProject.classroom = currentProject.new
      ? parseInt($(`#${cloudUI.saveProjectClassroomSelect}`).val())
      : currentProject.classroom;

    if (currentProject.new || currentProject.id == "") {
      createNewProject(currentProject)
        .then((data) => {
          currentProject.created_at = data.when_created;

          updateCurrentProjectSettings(data.id);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      updateExistingProject(currentProject)
        .then((data) => {
          currentProject.created_at = new Date().toLocaleString("en-US");

          updateCurrentProjectSettings(data.id);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
}

function updateProjectSaveClassroomSelect(arr) {
  arr.forEach((classroom) => {
    let classroomOption = document.createElement("option");
    classroomOption.value = classroom.team;
    classroomOption.innerHTML = classroom.team_name;

    $(`#${cloudUI.saveProjectClassroomSelect}`).append(classroomOption);
  });
}

function switchSaveBtnFunctionality(status) {}
//Helpers functionality
////////////////////////////////////////////////////////////////
function alertUser(message, timeout) {
  $(`.modal:not(#userAlert)`).modal("hide");
  $(`#${cloudUI.userAlertMsg}`).html(message);
  $(`#${cloudUI.userAlertModal}`).modal("show");

  if (timeout > 0) {
    setTimeout(function () {
      $(`#${cloudUI.userAlertModal}`).modal("hide");
    }, timeout);
  }
}

function checkForConfigFile() {
  if (typeof config === "undefined") return;

  console.log("Project found. Proceeding with project load.");
  loadProjectFromCloud(parseInt(config.project.id), loadRWFile);
}

function dataURItoBlob(dataURI, type) {
  var binary;
  if (dataURI.split(",")[0].indexOf("base64") >= 0)
    binary = atob(dataURI.split(",")[1]);
  else binary = unescape(dataURI.split(",")[1]);
  //var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: type,
  });
}

function dataToBlob(data, type) {
  let data_str;
  if (type.includes("image")) {
    data_str = data.toDataURL();
    return dataURItoBlob(data_str, "image/png");
  } else {
    data_str = serializeData(data);
    return new Blob([data_str], {
      type: "application/json",
    });
  }
}

function serializeData(data) {
  return JSON.stringify(data.map((b) => b.serialize()));
}

/**
 *  Prints the page in landscape for the user
 */
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

/**
 *  Downloads a text string as a file. Used in CC Math.
 * @param {string} filename
 * @param {string} text
 */
function downloadStringAsFile(filename, text) {
  let element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/**
 * Used to load files (Most useful for rhythm wheels) modified from stackoverflow
 */
function readSingleFile(e, callback) {
  let file = e.target.files[0];
  if (!file) {
    return;
  }
  let reader = new FileReader();
  reader.onload = function (e) {
    let contents = e.target.result;
    let data = {
      string: contents,
    };

    callback(JSON.stringify(data));
  };
  reader.readAsText(file);
}

/**
 * Toggles the visibility of the user's password for more user friendly interaction
 *
 * @param {bool} forceHidden Set if the password should be hidden or not. Default is false
 */
function togglePasswordVisibility(forceHidden = false) {
  let eyeStatus = forceHidden
    ? false
    : $(`#${cloudUI.passwordEyeIcon}`).hasClass("fa-eye-slash");
  $(`#${cloudUI.passwordEyeIcon}`).removeClass(
    eyeStatus ? "fa-eye-slash" : "fa-eye"
  );
  $(`#${cloudUI.passwordEyeIcon}`).addClass(
    eyeStatus ? "fa-eye" : "fa-eye-slash"
  );
  $(`#${cloudUI.passwordField}`).attr("type", eyeStatus ? "text" : "password");
}

//Layout functionality
////////////////////////////////////////////////////////////////

/**
 * Sets the duration of the loading overlay.
 *
 * @param {bool} isHidden Force a visibility state
 * @param {bool} hasTimeout Times out the loading overlay after 3 seconds (mostly for testing). Default is false.
 */
function setLoadingOverlay(isHidden, hasTimeout = false) {
  $(`.${cloudUI.loadingOverlay}`).attr("hidden", isHidden);

  if (hasTimeout) {
    setTimeout(function () {
      $(`.${cloudUI.loadingOverlay}`).attr("hidden", true);
    }, 3000);
  }
}

function updateNavigationBar() {
  let currentUserProfileURL = `/users/${currentUser.id}`;
  let currentUserClassroomsURL = `${currentUserProfileURL}/classes`;
  // Update navigation to either show the sign in / login, or the username
  $(`#${cloudUI.navSignUp}`).attr("hidden", currentUser.loggedIn);
  $(`#${cloudUI.navUserStatus}`).html(
    `<i class='${currentUser.loggedIn ? "fas" : "far"} fa-user'></i>&nbsp; ${
      currentUser.loggedIn ? currentUser.name : "Login"
    }`
  );
  $(`#${cloudUI.navUserProjects}`).attr(
    "href",
    currentUser.loggedIn ? currentUserProfileURL : ""
  );
  $(`#${cloudUI.navUserClassrooms}`).attr(
    "href",
    currentUser.loggedIn ? currentUserClassroomsURL : ""
  );
  $(`#${cloudUI.navSignOut}`).attr("hidden", !currentUser.loggedIn);

  $(`#${cloudUI.navUserStatus}`).addClass(
    currentUser.loggedIn ? "dropdown-toggle" : ""
  );
  $(`#${cloudUI.navUserStatus}`).removeClass(
    !currentUser.loggedIn ? "dropdown-toggle" : ""
  );
  $(`#${cloudUI.navUserStatus}`).attr(
    "data-toggle",
    currentUser.loggedIn ? "dropdown" : "modal"
  );
  $(`#${cloudUI.navUserStatus}`).attr(
    "data-target",
    currentUser.loggedIn ? "" : "#signInPrompt"
  );
  $(`#${cloudUI.navUserStatus}`).attr("aria-expanded", false);
  // $(`#${cloudUI.navUserStatus}`).attr('aria-haspopup', currentUser.loggedIn);
  $(`#${cloudUI.navUserDropdown}`).removeClass(
    !currentUser.loggedIn ? "show" : ""
  );
  $(`#${cloudUI.navUserContainer}`).removeClass(
    !currentUser.loggedIn ? "show" : ""
  );
  if (!currentUser.loggedIn) {
    $(`#${cloudUI.navUserStatus}`).dropdown("dispose");
  }
}

function updateSaveProjectPrompt() {
  // Set the state of project saves (either having users login first or allow them to save)
  $(`#${cloudUI.saveProjectSubmit}`).attr("hidden", !currentUser.loggedIn);
  $(`#${cloudUI.saveProjectSignIn}`).attr("hidden", currentUser.loggedIn);

  //Set the state of the save confirmation alert
  $(`#${cloudUI.saveConfirmedSubmit}`).attr("hidden", !currentUser.loggedIn);
  $(`#${cloudUI.saveConfirmedSignIn}`).attr("hidden", currentUser.loggedIn);
  $(`#${cloudUI.saveConfirmMsg}`).html(
    currentUser.loggedIn
      ? "Are you sure you want to replace your current project?"
      : "Sign in to save your work."
  );
}

function updateGlobalLayout() {
  updateNavigationBar();
  updateSaveProjectPrompt();
  updateProjectList();
}

//Sign out functionality
////////////////////////////////////////////////////////////////
function attemptSignOut() {
  // Grab a CSRF Token
  getCSRFToken();

  updateSignOutPrompt("show");

  submitSignOutRequest()
    .then((data) => {
      //Update project globals
      currentUser.id, (currentUser.name = "");
      currentUser.loggedIn = false;
      emptyClassroomList();
      //Update the sign out prompt
      updateSignOutPrompt("hide");

      // Alert the user that they were successful
      alertUser(`Logout was successful`, 2000);

      // Update the layout and projects
      updateGlobalLayout();
    })
    .catch((err) => {
      //Update the sign out prompt
      updateSignOutPrompt("error");

      // Let the user know that there was an error
      alertUser(
        "There was an error when signing you out. Please try again.",
        3500
      );
      //Log the issue
      console.error(`Error Message: ${JSON.stringify(err)}`);
    });
}

function emptyClassroomList() {
  $(`#${cloudUI.saveProjectClassroomSelect}`)
    .empty()
    .append("<option>Choose...</option>");
}
function updateSignOutPrompt(status) {
  // Hide the loading indicator

  if (status == "show") {
    $(`#${cloudUI.signOutLoader}`).removeClass("d-none");
    $(`#${cloudUI.signOutLoader}`).addClass("d-flex");
  } else {
    $(`#${cloudUI.signOutLoader}`).addClass("d-none");
    $(`#${cloudUI.signOutLoader}`).removeClass("d-flex");
  }
  // Show the form
  $(`#${cloudUI.signOutPrompt} div div div.modal-body`).attr(
    "hidden",
    status == "show"
  );

  // Handle potential errors
  if (status == "error") {
    // Show the error msg to user
    $(`#${cloudUI.signOutErrorMsg}`).attr("hidden", false);

    // Add events to username and password that will hide the error msg when user starts editing either.
    $(`#${cloudUI.signOutPrompt}`).on("click", (e) => {
      if (!$(`#${cloudUI.signOutErrorMsg}`).attr("hidden")) {
        $(`#${cloudUI.signOutErrorMsg}`).attr("hidden", true);
      }
    });
  }
}

function submitSignOutRequest() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: csdtAPI.logout,
      data: {},
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

//Sign in functionality
////////////////////////////////////////////////////////////////

function attemptSignIn() {
  // Grab a CSRF Token
  getCSRFToken();

  // Grab username and password
  let username = $(`#${cloudUI.usernameField}`).val();
  let password = $(`#${cloudUI.passwordField}`).val();

  updateSignInPrompt("show");

  submitSignInRequest({ username: username, password: password })
    .then((data) => {
      return fetchCurrentUser(data);
    })
    .then((data) => {
      currentUser.id = data.id;
      currentUser.name = data.username;
      currentUser.loggedIn = true;

      // Reset loading indicator
      updateSignInPrompt("hide");

      // Alert the user that they were successful
      alertUser(`Sign in successful,  ${currentUser.name}`, 2000);

      // Update the layout and projects
      updateGlobalLayout();

      fetchUserClassroomList(
        (data) => {
          emptyClassroomList();
          updateProjectSaveClassroomSelect(data);
        },
        (err) => {
          console.error(
            `Error: Failed to get a classroom list -- ${JSON.stringify(err)}`
          );
        }
      );
    })
    .catch((err) => {
      currentUser.loggedIn = false;

      // Hide the loading indicator
      updateSignInPrompt("error");

      // Log the error in console
      console.error(`Error Message:  ${JSON.stringify(err)}`);
    });
}

function updateSignInPrompt(status) {
  if (status == "show") {
    // Show a loading indicator
    $(`#${cloudUI.signInLoader}`).addClass("d-flex");
    $(`#${cloudUI.signInLoader}`).removeClass("d-none");
  } else {
    $(`#${cloudUI.signInLoader}`).addClass("d-none");
    $(`#${cloudUI.signInLoader}`).removeClass("d-flex");
  }

  // Hide the form
  $(`#${cloudUI.signInPrompt} div div div.modal-body`).attr(
    "hidden",
    status == "show"
  );

  if (status == "error") {
    // Show the error msg to user
    $(`#${cloudUI.signInErrorMsg}`).attr("hidden", false);

    // Add events to username and password that will hide the error msg when user starts editing either.
    $(`#${cloudUI.usernameField}, #${cloudUI.passwordField}`).on(
      "keyup",
      (e) => {
        if (!$(`#${cloudUI.signInErrorMsg}`).attr("hidden")) {
          $(`#${cloudUI.signInErrorMsg}`).attr("hidden", true);
        }
      }
    );
  }
}

function submitSignInRequest(data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: csdtAPI.login,
      data: {
        login: data.username,
        password: data.password,
      },
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

//Kindly donated by http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata

/**
 *
 * ? Should we have a replacement location state, rather than a push state?
 * ? Should we refresh the page for every state on the location stack?
 * ? Should we do anything further for password encryption ? The connection is made over SSL, so it is as secure as possible....
 *
 */

/**
 
 * Todo: Tinker with CSS
 * Todo: Possibly replace save and save as with login
 * Todo: Add ability to include notes and descriptions to project
 *
 */
