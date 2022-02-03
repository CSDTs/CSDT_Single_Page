//Cloud references
let cloudUI = {
  projects: "user-projects",
  classrooms: "user-classrooms",
  logout: "logout-btn",

  loadProject: "load-project",
  saveProjectAs: "save-project-as",
  applicationProjects: "project-list",
  classroomName: "classroom-name",

  signInPrompt: "signInPrompt",
  signInSubmit: "signUserIn",
  signInLoader: "signInLoader",
  signInErrorMsg: "signInErrorMsg",
  passwordVisibility: "show_hide_password-addon",
  passwordEyeIcon: "passwordEye",
  usernameField: "usernameField",
  passwordField: "passwordField",

  signOutPrompt: "signOutPrompt",
  signOutSubmit: "signUserOut",
  signOutLoader: "signOutLoader",
  signOutErrorMsg: "signOutErrorMsg",

  loadingOverlay: "loading-overlay",

  userAlertModal: "userAlert",
  userAlertMsg: "userAlertMsg",

  saveProjectPrompt: "saveProjectPrompt",
  saveProjectSubmit: "saveUserProject",
  saveProjectSignIn: "saveProjectSignIn",
  projectNameField: "projectNameField",
  saveProjectConfirm: "saveProjectConfirm",
  saveConfirmedSignIn: "saveProjectConfirmSignIn",
  saveConfirmedSubmit: "saveUserProjectConfirmed",
  saveConfirmMsg: "saveProjectConfirmMsg",

  loadProjectPrompt: "loadProjectPrompt",
  loadProjectSubmit: "loadUserProject",
  loadProjectList: "loadProjectList",
  loadProjectSignIn: "loadProjectSignIn",
  loadProjectMsg: "loadProjectPromptMsg",
  loadProjectLoader: "loadProjectLoader",

  loadLocalProject: "loadLocalProject",
  saveLocalProject: "saveLocalProject",

  navSignUp: "navSignUp",
  navUserStatus: "navUserStatus",
  navUserProjects: "navUserProjects",
  navUserProfile: "",
  navUserClassrooms: "navUserClassrooms",
  navSignOut: "navSignOut",
  navUserIcon: "navUserIcon",
  navUserDropdown: "navUserDropdown",
  navUserContainer: "navUserContainer",

  visibleModifiedStatus: "visibleModifiedStatus",
  saveProjectClassroomSelect: "saveProjectClassroomSelect",
};
//API Links
const api = {
  project: "/api/projects/",
  classroom: "/api/team",
  file: "/api/files/",
  user: "/api/user",
  login: "/accounts/login/",
  loadProject: "/projects/",
  logout: "/accounts/logout/",
};

//Quick and dirty approach to handling broken images for new project saves
let currentApplicationSplit = window.location.href.split("/").slice(-1);
let currentLocation = window.location.href.split(currentApplicationSplit)[0];
let isAppHomepage = currentLocation.includes("CSDT_Single_Page");

/////////////////////////////////
//Base Class
/////////////////////////////////

class Modal {
  constructor(id, label) {
    this.label = label;
    this.id = id;
  }
  createHeader(text) {
    let container = document.createElement("div");
    let header = document.createElement("h5");

    container.classList.add("modal-header");
    header.classList.add("modal-title");
    header.id = this.label;
    header.innerHTML = text;

    container.append(header);
    return container;
  }

  createModal(contentObj) {
    let dialog = this.createDialog();

    this.modal = document.createElement("div");
    this.modal.id = this.id;
    this.modal.classList.add("modal", "fade");
    this.modal.setAttribute("tabindex", "-1");
    this.modal.setAttribute("aria-labelledby", this.label);
    this.modal.setAttribute("aria-hidden", "true");

    dialog.appendChild(contentObj);

    this.modal.appendChild(dialog);
  }

  createDialog() {
    let dialog = document.createElement("div");
    dialog.classList.add("modal-dialog", "modal-dialog-centered");

    return dialog;
  }

  createFooter(args) {
    let container = document.createElement("div");
    container.classList.add("modal-footer");

    args.forEach((item) => {
      container.appendChild(item);
    });

    return container;
  }
  createLoginBtn(id) {
    let loginBtn = document.createElement("button");
    loginBtn.id = id;
    loginBtn.innerHTML = "Login to Load";
    loginBtn.setAttribute("type", "button");
    loginBtn.setAttribute("data-toggle", "modal");
    loginBtn.setAttribute("data-target", "#signInPrompt");
    loginBtn.classList.add("btn", "btn-primary");

    this.loginBtn = loginBtn;
    return loginBtn;
  }

  createCancelBtn() {
    let cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = "Cancel";
    cancelBtn.classList.add("btn", "btn-secondary");
    cancelBtn.setAttribute("type", "button");
    cancelBtn.setAttribute("data-dismiss", "modal");

    return cancelBtn;
  }

  createBody(args) {
    let body = document.createElement("div");
    body.classList.add("modal-body");
    args.forEach((item) => {
      body.appendChild(item);
    });
    return body;
  }

  createLoader(msg, type = "dots") {
    let img = document.createElement("img");
    let container = document.createElement("div");
    let p = document.createElement("p");

    if (type == "dots") {
      img.setAttribute(
        "src",
        `${isAppHomepage ? currentLocation : ""}img/three-dots.svg`
      );
    } else {
      img.setAttribute(
        "src",
        `${isAppHomepage ? currentLocation : ""}img/loader.svg`
      );
    }

    img.hidden = true;

    p.innerHTML = msg;
    p.hidden = true;
    container.append(img, p);
    // container.hidden = true;

    this.loaderImg = img;
    this.loaderMsg = p;
    return container;
  }
}

class Project {
  constructor(saveObject) {
    this.id = "";
    this.modified = false;
    this.new = true;
    this.name = "Untitled Project";
    this.description = "";
    this.classroom = "";
    this.application = applicationID;
    this.data_id = "";
    this.screenshot_id = "";
    this.created_at = "";
    this.modified_at = "";
    this.object = saveObject;
  }
  setFromLoad(id, data) {
    this.id = id;
    this.modified = false;
    this.new = false;

    this.name = data.name;
    this.created_at = data.when_created;
    this.classroom = data.classroom;

    this.refreshModifiedStatusIndicator();
    this.refreshProjectNameField();
  }

  setFromSave(id) {
    currentProject.id = id;
    currentProject.modified = false;
    currentProject.new = false;
  }
  refreshModifiedStatusIndicator() {
    let indicator = document.querySelector("#visibleModifiedStatus");

    if (this.modified) {
      indicator.innerHTML = `<strong>You have unsaved changes</strong>`;
    } else {
      if (this.created_at != "")
        indicator.innerHTML = `Last saved on: <strong>${this.created_at}</strong>`;
      else indicator.innerHTML = ``;
    }
  }

  refreshProjectNameField() {
    let field = document.querySelector("#projectNameField");
    field.value = this.name;
  }
}

class User {
  constructor() {
    this.id = "";
    this.name = "";
    this.loggedIn = false;
  }

  clearUser() {
    this.id = "";
    this.name = "";
    this.loggedIn = false;

    // this.clearClassrooms();
    // updateUserNavigation();
  }

  setUserData(data) {
    if (data.id) {
      this.id = data.id;
      this.name = data.username;
      this.loggedIn = true;
    }
  }

  clearClassrooms() {
    let div = document.querySelector("#projectClassroomContainer > div");
    let container = document.querySelector("#projectClassroomContainer");

    if (container && div) container.removeChild(div);
  }
}

class Cloud {
  constructor() {}

  init() {
    //Gets the CSRF token
    getCSRFToken();

    // Check for current user and project
    this.getFromAPI(api.user)
      .then((data) => {
        currentUser.setUserData(data);
        userNavigation.updateUserNavigation();
        saveAsPrompt.update();
        savePrompt.update();
      })
      .then(() => {
        saveAsPrompt.fetchUserClassrooms();
        loadPrompt.fetchUserProjects();
        this.checkForConfigFile();
      })
      .catch((err) => {
        currentUser.clearUser();
        userNavigation.updateUserNavigation();
        savePrompt.update();
        console.error(
          `Error: Failed to get a current user -- ${JSON.stringify(err)}`
        );
      });
  }

  updateCurrentURL() {
    if (
      window.history !== undefined &&
      window.history.pushState !== undefined
    ) {
      window.history.pushState({}, "", `/projects/${currentProject.id}/run`);
    }
  }

  checkForConfigFile() {
    if (typeof config === "undefined") return;

    console.log("Project found. Proceeding with project load.");
    // loadProjectFromCloud(parseInt(config.project.id), loadFromJSON);
    this.load(parseInt(config.project.id), loadFromJSON);
  }

  exportToFile() {
    let filename = `${currentProject.name}.json`;
    let text;
    try {
      text = JSON.stringify(currentProject.object.map((b) => b.serialize()));
    } catch (e) {
      console.error(
        "The current save object array is missing a serialize function."
      );
    }

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

  importFromFile(file) {
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload = (e) => {
      loadFromJSON(e.target.result);
    };
    reader.readAsText(file);
  }

  importFromRW(e, callback) {
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

  load(id, callback) {
    alertPrompt.alertUser("Loading project. Please wait...");
    let myself = this;
    let successfulProjectLoad = function (data, proj) {
      callback(proj);
      currentProject.setFromLoad(id, data);
      myself.updateCurrentURL();
      alertPrompt.alertUser("Successfully loaded the project.", 2000);
    };

    let failedProjectLoad = function (data) {
      alertPrompt.alertUser(
        "Error loading your project. Please try again",
        4000
      );
      console.error(`Note to Developer: Failed cloud project fetch.`);
      console.error(`Error Message: ${data}`);
    };

    myself.getProject(id, successfulProjectLoad, failedProjectLoad);
  }

  save() {
    let myself = this;
    // First, get a CSRF Token
    getCSRFToken();
    // Second, alert the user that their project is saving
    alertPrompt.alertUser("Saving your project. Please wait...");

    let projectForm = generateSaveFormData(
      saveObject.project,
      "application/json"
    );
    let imageForm = generateSaveFormData(saveObject.image, "image/png");

    const imgPromise = this.saveNewFile(imageForm).catch((err) => {
      console.error(err);
    });
    const dataPromise = this.saveNewFile(projectForm).catch((err) => {
      console.error(err);
    });

    Promise.all([imgPromise, dataPromise]).then((values) => {
      currentProject.screenshot_id = values[0];
      currentProject.data_id = values[1];
      currentProject.classroom = currentProject.new
        ? $(`#${cloudUI.saveProjectClassroomSelect}`).val() == "Choose..."
          ? null
          : parseInt($(`#${cloudUI.saveProjectClassroomSelect}`).val())
        : currentProject.classroom;

      if (currentProject.new || currentProject.id == "") {
        myself
          .createNewProject(currentProject)
          .then((data) => {
            currentProject.created_at = data.when_created;

            updateCurrentProjectSettings(data.id);
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        myself
          .updateExistingProject(currentProject)
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

  serializeData(data) {}

  //API Calls for
  postToAPI(payload, url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: url,
        data: payload,
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

  getFromAPI(url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        success: function (data) {
          resolve(data);
        },
        error: function (error) {
          reject(error);
        },
      });
    });
  }

  getProject(id, success, error) {
    $.get(`${api.project}${id}/`, null, (data) => {
      $.get(data.project_url, null, (proj) => {
        success(data, proj);
      }).fail(error);
    }).fail(error);
  }

  saveNewFile(file) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "PUT",
        url: api.file,
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

  createNewProject(project) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: api.project,
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

  updateExistingProject(project) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "PUT",
        url: `${api.project}${currentProject.id}/`,
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
}

/////////////////////////////////
//Alert Prompt
////////////////////////////////

class AlertPrompt {
  constructor() {
    this.createModal();
  }
  createModal() {
    let modal = document.createElement("div");
    let dialog = document.createElement("div");
    let alert = document.createElement("div");
    this.msg = document.createElement("strong");

    modal.id = "userAlert";
    modal.classList.add("modal", "fade");
    modal.setAttribute("tabindex", "-1");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-labelledby", "userAlertLabel");

    dialog.classList.add(
      "modal-dialog",
      "modal-dialog-centered",
      "justify-content-center"
    );

    alert.classList.add("alert", "alert-light", "text-center", "fade", "show");
    alert.setAttribute("role", "alert");

    this.msg.id = "userAlertMsg";
    this.msg.innerHTML = "Loading Project...";

    alert.appendChild(this.msg);
    dialog.appendChild(alert);
    modal.appendChild(dialog);

    document.body.appendChild(modal);
  }

  alertUser(message, timeout) {
    $(`.modal:not(#userAlert)`).modal("hide");
    this.msg.innerHTML = message;
    $(`#userAlert`).modal("show");

    if (timeout > 0) {
      setTimeout(function () {
        $(`#userAlert`).modal("hide");
      }, timeout);
    }
  }
}
/////////////////////////////////
//Sign Out Prompt
////////////////////////////////

class SignOutPrompt extends Modal {
  constructor() {
    super("signOutPrompt", "signOutPromptLabel");
    this.createPrompt();
  }

  createPrompt() {
    let content = document.createElement("div");
    let myself = this;

    content.classList.add("modal-content");

    content.append(
      super.createHeader("Signing out"),
      super.createLoader(
        "There was an error with signing you out. Please try again.",
        "circle"
      ),
      this.createBody(),
      this.createFooter()
    );

    super.createModal(content);

    myself.modal.addEventListener("click", () => {
      if (myself.loaderMsg.hidden == false) {
        myself.loaderMsg.hidden = true;
      }
    });

    document.body.appendChild(myself.modal);
  }

  createBody() {
    let body = document.createElement("div");
    let msg = document.createElement("p");

    body.classList.add("modal-body");
    msg.innerHTML = `Are you sure you want to sign out? By doing this, you won't be able to save your work.`;
    body.append(msg);

    this.bodyMsg = msg;
    return body;
  }

  createFooter() {
    let myself = this;
    let signOut = document.createElement("button");

    signOut.classList.add("btn", "btn-danger");
    signOut.setAttribute("data-dismiss", "modal");
    signOut.setAttribute("type", "button");
    signOut.innerHTML = "Sign Out";

    signOut.addEventListener("click", () => {
      myself.attemptSignOut();
    });

    return super.createFooter([super.createCancelBtn(), signOut]);
  }

  updateSignOutPrompt(status) {
    this.loaderImg.hidden = status != "show";
    this.bodyMsg.hidden = status == "show";
  }

  attemptSignOut() {
    let myself = this;

    getCSRFToken();

    myself.updateSignOutPrompt("show");

    cloud
      .postToAPI({}, api.logout)
      .then(() => {
        currentUser.clearUser();
        loadPrompt.clearData();
        saveAsPrompt.clearData();
        savePrompt.update();
        myself.updateSignOutPrompt("hide");

        // Alert the user that they were successful
        alertPrompt.alertUser(`Logout was successful`, 2000);

        userNavigation.updateUserNavigation();
        // updateProjectSaveAlert();
        saveAsPrompt.update();
      })
      .catch((err) => {
        //Update the sign out prompt
        myself.updateSignOutPrompt("error");

        // Let the user know that there was an error
        alertPrompt.alertUser(
          "There was an error when signing you out. Please try again.",
          3500
        );
        //Log the issue
        console.error(`Error Message: ${JSON.stringify(err)}`);
      });
  }
}

/////////////////////////////////
//Load From Cloud Prompt
////////////////////////////////

class LoadPrompt extends Modal {
  constructor() {
    super("loadProjectPrompt", "loadProjectPromptLabel");
    this.createPrompt();
  }

  createPrompt() {
    let content = document.createElement("div");
    let myself = this;

    content.classList.add("modal-content");

    content.append(
      super.createHeader("Load Project"),
      this.createBody(),
      this.createFooter()
    );

    super.createModal(content);

    document.body.appendChild(myself.modal);
  }

  createBody() {
    let form = document.createElement("form");
    let row = document.createElement("div");
    this.projectSelectContainer = document.createElement("section");
    let detailProjectContainer = this.createProjectDetailContainer();

    this.projectSelectContainer.id = "projectSelectContainer";
    this.projectSelectContainer.classList.add("col-md-7");
    this.projectSelectContainer.append(
      super.createLoader("Login to load a project")
    );

    row.classList.add("row");
    row.append(this.projectSelectContainer, detailProjectContainer);

    form.appendChild(row);

    return super.createBody([form]);
  }

  createProjectDetailContainer() {
    let container = document.createElement("div");
    let title = document.createElement("p");
    let preview = document.createElement("img");
    let updatedLabel = document.createElement("p");
    let classroomLabel = document.createElement("p");
    let updated = document.createElement("strong");
    let classroom = document.createElement("strong");

    container.classList.add("col-md-5");
    container.id = "projectDetailContainer";
    container.hidden = true;

    title.innerHTML = "<strong>Details</strong>";

    preview.src = "";
    preview.classList.add("img-fluid", "rounded");

    preview.addEventListener("error", () => {
      preview.src = "./img/project_placeholder.jpg";
    });

    updatedLabel.classList.add("text-muted", "small");
    updatedLabel.innerHTML = "Last updated: ";

    updated.classList.add("text-muted", "text-small");

    classroomLabel.classList.add("text-muted", "small");
    classroomLabel.innerHTML = "Classroom: ";

    classroom.classList.add("text-muted", "text-small");

    container.append(
      title,
      preview,
      updatedLabel,
      updated,
      classroomLabel,
      classroom
    );
    this.preview = preview;
    this.updated = updated;
    this.classroom = classroom;
    this.detailContainer = container;

    return container;
  }

  createFooter() {
    let importContainer = document.createElement("div");
    let importBtn = document.createElement("button");
    let loadContainer = document.createElement("div");
    let myself = this;
    this.loadBtn = document.createElement("button");

    importBtn.innerHTML = "Import file";
    importBtn.hidden = true;
    importBtn.setAttribute("type", "button");
    importBtn.classList.add("btn", "btn-link", "pl-0");

    importContainer.appendChild(importBtn);

    this.loadBtn.id = "loadUserProject";
    this.loadBtn.setAttribute("type", "button");
    this.loadBtn.classList.add("btn", "btn-success");
    this.loadBtn.innerHTML = "Load";
    this.loadBtn.addEventListener("click", () => {
      if (myself.projectList) {
        cloud.load(myself.projectList.value, loadFromJSON);
      }
    });

    loadContainer.append(
      super.createCancelBtn(),
      super.createLoginBtn("loadProjectSignIn"),
      this.loadBtn
    );

    return super.createFooter([importContainer, loadContainer]);
  }

  fetchUserProjects() {
    let url = `${api.project}?owner=${currentUser.id}&application=${applicationID}`;

    this.loaderMsg.innerHTML = currentUser.loggedIn
      ? "You currently have no projects available for this tool"
      : "Login to load a project";

    this.updateLoadPrompt(false);
    if (currentUser.loggedIn)
      cloud
        .getFromAPI(url)
        .then((data) => {
          if (data && data.length > 0) {
            this.createProjectSelect(data);
          } else {
            this.loaderMsg.hidden = false;
            this.loaderImg.hidden = true;
          }
        })
        .catch((error) => {
          console.error(error);
        });
  }

  createProjectSelect(data) {
    let myself = this;
    let select = document.createElement("select");

    select.classList.add("form-control");
    select.addEventListener("change", (e) => {
      if (e.target.value == "") {
        myself.detailContainer.hidden = true;
        return;
      }
      let selected = e.target.selectedIndex;
      myself.updateProjectDetails(e.target.options[selected]);
    });

    let choose = document.createElement("option");
    choose.innerHTML = "Choose...";
    choose.value = "";
    select.appendChild(choose);

    data.forEach((project) => {
      select.appendChild(this.createProjectOption(project));
    });

    this.projectList = select;
    this.projectSelectContainer.appendChild(select);
    this.updateLoadPrompt(true);
  }

  createProjectOption(project) {
    let option = document.createElement("option");
    option.value = project.id;
    option.innerHTML = project.name;
    option.setAttribute("data-classroom", project.classroom || "");
    option.setAttribute(
      "data-classroom_name",
      project.classroom_name || "Not part of a classroom."
    );
    option.setAttribute("data-screenshot_url", project.screenshot_url || "");
    option.setAttribute("data-when_modified", project.when_modified || "");
    option.setAttribute("data-when_created", project.when_created || "");
    return option;
  }

  updateProjectDetails(data) {
    if (currentUser) {
      this.preview.src = data.getAttribute("data-screenshot_url");
      this.updated.innerHTML = data.getAttribute("data-when_modified");
      this.classroom.innerHTML = data.getAttribute("data-classroom_name");
      this.detailContainer.hidden = false;
    }
  }

  updateLoadPrompt(status) {
    if (currentUser.loggedIn) {
      this.loaderImg.hidden = status;
      this.loaderMsg.hidden = true;
      this.loginBtn.hidden = true;
      this.loadBtn.hidden = !status;
    } else {
      this.loaderImg.hidden = true;
      this.loaderMsg.hidden = false;
      this.loadBtn.hidden = true;
    }
  }

  appendToProjectList(project) {
    let option = document.createElement("option");
    option.value = project.id;
    option.innerHTML = project.name;
    option.setAttribute("data-classroom", project.classroom || "");
    option.setAttribute(
      "data-classroom_name",
      project.classroom_name || "Not part of a classroom."
    );
    option.setAttribute("data-screenshot_url", project.screenshot_url || "");
    option.setAttribute("data-when_modified", project.when_modified || "");
    option.setAttribute("data-when_created", project.when_created || "");

    this.projectList.appendChild(option);
  }

  clearData() {
    this.projectSelectContainer.removeChild(this.projectList);
    this.loaderMsg.hidden = false;
    this.loadBtn.hidden = true;
    this.loginBtn.hidden = false;
    this.loaderMsg.innerHTML = "Login to load a project";
    this.detailContainer.hidden = true;
  }
}

/////////////////////////////////
//Navigation
////////////////////////////////
class Navigation {
  createUserNavigation() {
    let projectLink = document.createElement("a");
    let classroomLink = document.createElement("a");
    let signOutLink = document.createElement("a");
    let dropdown = document.createElement("div");
    let profileLink = document.createElement("a");
    let profileContainer = document.querySelector(".user-nav");

    dropdown.classList.add("dropdown-menu");
    dropdown.setAttribute("aria-labelledby", "profileDropdown");

    profileLink.innerHTML = `<i class='fas fa-user'></i> ${currentUser.name}`;
    profileLink.href = "#";
    profileLink.classList.add("nav-link", "dropdown-toggle");
    profileLink.setAttribute("role", "button");
    profileLink.setAttribute("aria-expanded", "false");
    profileLink.setAttribute("data-toggle", "dropdown");

    projectLink.innerHTML = "My Projects";
    projectLink.href = `/users/${currentUser.id}`;
    projectLink.classList.add("dropdown-item");

    classroomLink.innerHTML = "My Classrooms";
    classroomLink.href = `/users/${currentUser.id}`;
    classroomLink.classList.add("dropdown-item");

    signOutLink.innerHTML = "Not you? (LOGOUT)";
    signOutLink.href = `#`;
    signOutLink.classList.add("dropdown-item");
    signOutLink.setAttribute("data-toggle", "modal");
    signOutLink.setAttribute("data-target", "#signOutPrompt");

    dropdown.appendChild(projectLink);
    dropdown.appendChild(classroomLink);
    dropdown.appendChild(signOutLink);

    profileContainer.appendChild(profileLink);
    profileContainer.appendChild(dropdown);

    document.querySelector(".sign-in-nav").hidden = true;
    document.querySelector(".sign-up-nav").hidden = true;
  }
  clearUserNavigation() {
    let profileNav = document.querySelector(".user-nav a");
    let profileContainer = document.querySelector(".user-nav");
    if (profileNav) profileContainer.innerHTML = "";

    document.querySelector(".sign-in-nav").hidden = false;
    document.querySelector(".sign-up-nav").hidden = false;
  }

  updateUserNavigation() {
    if (currentUser.loggedIn) {
      if (document.querySelector(".user-nav a")) return;
      this.createUserNavigation(currentUser);
      return;
    }
    this.clearUserNavigation();
  }
}

/////////////////////////////////
//Save to Cloud Prompt
////////////////////////////////
class SavePrompt extends Modal {
  constructor() {
    super("saveProjectConfirm", "saveProjectConfirmLabel");
    this.createPrompt();
  }

  createPrompt() {
    let myself = this;
    let content = document.createElement("div");

    content.classList.add("modal-content");
    content.append(
      super.createHeader("Saving current project"),
      this.createBody(),
      this.createFooter()
    );
    super.createModal(content);

    document.body.appendChild(myself.modal);
  }

  createBody() {
    let body = document.createElement("div");
    let msg = document.createElement("p");

    body.classList.add("modal-body");

    msg.innerHTML = "Are you sure you want to replace your current project?";

    body.appendChild(msg);

    this.bodyMsg = msg;

    return body;
  }

  createFooter() {
    let container = document.createElement("div");

    this.confirmBtn = document.createElement("button");

    this.confirmBtn.innerHTML = "Yes";
    this.confirmBtn.classList.add("btn", "btn-success");
    this.confirmBtn.setAttribute("type", "button");
    this.confirmBtn.setAttribute("data-dismiss", "modal");

    this.confirmBtn.addEventListener("click", () => {
      currentProject.new = false;
      cloud.save();
    });

    container.append(
      super.createCancelBtn(),
      super.createLoginBtn("saveSignIn"),
      this.confirmBtn
    );

    return super.createFooter([container]);
  }

  update() {
    this.bodyMsg.innerHTML = currentUser.loggedIn
      ? "Are you sure you want to replace your current project?"
      : "Sign in to save your work.";

    this.loginBtn.hidden = currentUser.loggedIn;
    this.confirmBtn.hidden = !currentUser.loggedIn;
  }
}

class SaveAsPrompt extends Modal {
  constructor() {
    super("saveProjectPrompt", "saveProjectPromptLabel");
    this.createPrompt();
  }

  createPrompt() {
    let content = document.createElement("div");
    let myself = this;

    content.classList.add("modal-content");

    content.append(
      super.createHeader("Project saving"),
      this.createBody(),
      this.createFooter()
    );

    super.createModal(content);

    document.body.appendChild(myself.modal);
  }

  createBody() {
    let container = document.createElement("div");
    let form = document.createElement("form");

    container.classList.add("modal-body");

    form.append(this.createProjectName(), this.createClassroomName());

    container.appendChild(form);

    return container;
  }

  createFooter() {
    let exportContainer = document.createElement("div");
    let exportBtn = document.createElement("button");

    let saveContainer = document.createElement("div");
    this.saveBtn = document.createElement("button");

    exportBtn.hidden = true;
    exportBtn.classList.add("btn", "btn-link", "pl-0");
    exportBtn.innerHTML = "Export file";
    exportBtn.setAttribute("type", "button");

    exportContainer.appendChild(exportBtn);

    this.saveBtn.id = "saveUserProject";
    this.saveBtn.innerHTML = "Save";
    this.saveBtn.setAttribute("type", "button");
    this.saveBtn.classList.add("btn", "btn-success");
    this.saveBtn.addEventListener("click", () => {
      currentProject.new = true;
      cloud.save();
    });

    saveContainer.append(
      super.createCancelBtn(),
      super.createLoginBtn("saveProjectSignIn"),
      this.saveBtn
    );

    return super.createFooter([exportContainer, saveContainer]);
  }

  createProjectName() {
    let row = document.createElement("div");
    let labelColumn = document.createElement("div");
    let formColumn = document.createElement("div");
    let formContainer = document.createElement("div");
    let input = document.createElement("input");

    row.classList.add("row");

    labelColumn.classList.add("col-md-4");
    labelColumn.innerHTML = "<div><p>Project Name</p></div>";

    formColumn.classList.add("col-md-8");

    formContainer.classList.add("form-group");

    input.id = "projectNameField";
    input.classList.add("form-control");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "ex. My Cool Design");
    input.value = "Untitled Project";

    formContainer.appendChild(input);
    formColumn.appendChild(formContainer);

    row.append(labelColumn, formColumn);

    // Updates global project name when user makes any changes to it
    // $(`#${cloudUI.projectNameField}`).on("keyup", () => {
    //   $(`#${cloudUI.projectNameField}`).attr(
    //     "value",
    //     $(`#${cloudUI.projectNameField}`).val()
    //   );
    //   currentProject.name = $(`#${cloudUI.projectNameField}`).val();
    // });

    input.addEventListener("keyup", () => {
      currentProject.name = input.value;
    });

    return row;
  }

  createClassroomName() {
    let row = document.createElement("div");
    let labelColumn = document.createElement("div");
    let formColumn = document.createElement("div");
    let formContainer = document.createElement("div");
    // let select = document.createElement("select");
    // let img = document.createElement("img");

    row.classList.add("row");

    labelColumn.classList.add("col-md-4");
    labelColumn.innerHTML = "<div><p>Classroom</p></div>";

    formColumn.classList.add("col-md-8");

    formContainer.classList.add("form-group");
    formContainer.id = "projectClassroomContainer";
    this.classroomContainer = formContainer;

    // img.hidden = true;
    // img.src = "./img/three-dots.svg";

    formContainer.appendChild(
      super.createLoader("Sign in to view your classrooms.")
    );
    formColumn.appendChild(formContainer);

    row.append(labelColumn, formColumn);

    return row;
  }

  fetchUserClassrooms() {
    let url = `${api.classroom}?user=${currentUser.id}`;
    this.updateSavePrompt(false);
    saveAsPrompt.update();

    if (currentUser.loggedIn)
      cloud
        .getFromAPI(url)
        .then((data) => {
          if (data) {
            this.createClassroomSelect(data);
          }
        })
        .catch((error) => {
          console.error(error);
        });
  }

  createClassroomSelect(data) {
    let select = document.createElement("select");
    // let selectContainer = document.getElementById("projectClassroomContainer");
    let group = document.createElement("div");
    group.classList.add("form-group");

    select.id = "saveProjectClassroomSelect";

    select.classList.add("form-control");

    select.innerHTML = "<option selected>Choose...</option>";
    select.addEventListener("change", (e) => {
      console.log(e.target.value);
      currentUser.classroom = e.target.value;
    });

    data.forEach((classroom) => {
      let option = document.createElement("option");
      option.value = classroom.team;
      option.innerHTML = classroom.team_name;

      select.appendChild(option);
    });
    group.appendChild(select);
    this.classroomContainer.appendChild(group);
    this.updateSavePrompt(true);
  }

  clearData() {
    // let div = document.querySelector("#projectClassroomContainer > div");
    // let container = document.querySelector("#projectClassroomContainer");

    this.classroomContainer.innerHTML = "";
    this.classroomContainer.appendChild(
      super.createLoader("Sign in to view your classrooms.")
    );

    // container.removeChild(div);
  }

  updateSavePrompt(status) {
    if (currentUser.loggedIn) {
      this.loaderImg.hidden = status;

      this.loginBtn.hidden = true;
      this.saveBtn.hidden = !status;
    } else {
      this.loaderImg.hidden = true;
    }
  }

  update() {
    this.loginBtn.hidden = currentUser.loggedIn;
    this.saveBtn.hidden = !currentUser.loggedIn;
    this.loaderMsg.hidden = currentUser.loggedIn;
  }
}

/////////////////////////////////
//Sign In Prompt
////////////////////////////////

class SignInPrompt extends Modal {
  constructor() {
    super("signInPrompt", "signInPromptLabel");
    this.createPrompt();
  }

  createPrompt() {
    let content = document.createElement("div");
    let myself = this;

    content.classList.add("modal-content");

    content.append(
      super.createHeader("Welcome back!"),
      this.createBody(),
      this.createFooter()
    );

    super.createModal(content);

    myself.modal.addEventListener("keydown", function (e) {
      var key = e.which || e.keyCode;
      if (key == 13) {
        myself.attemptSignIn();
      }
    });

    myself.modal.addEventListener("hide.bs.modal", function (e) {
      myself.togglePasswordVisibility(true);
      myself.passwordField.value = "";
    });

    document.body.appendChild(myself.modal);
  }

  createSignInForm() {
    let form = document.createElement("form");
    this.form = form;

    form.append(
      this.createUsernameField(),
      this.createPasswordField(),
      this.createCheckbox(),
      this.createForgotPassword()
    );

    return form;
  }

  createUsernameField() {
    let usernameGroup = document.createElement("div");
    let usernameInput = document.createElement("input");
    this.username = usernameInput;

    usernameGroup.classList.add("form-group");

    usernameInput.id = "usernameField";
    usernameInput.classList.add("form-control");
    usernameInput.setAttribute("type", "text");
    usernameInput.setAttribute("placeholder", "Username");
    usernameGroup.appendChild(usernameInput);

    usernameInput.addEventListener("keyup", (e) => {
      if (document.querySelector("#signInErrorMsg").hidden == false) {
        document.querySelector("#signInErrorMsg").hidden = true;
      }
    });

    return usernameGroup;
  }

  createPasswordField() {
    let passwordGroup = document.createElement("div");
    let passwordInputGroup = document.createElement("div");
    let passwordInput = document.createElement("input");
    let passwordAppend = document.createElement("div");
    let passwordEye = document.createElement("span");
    let myself = this;
    this.password = passwordInput;

    passwordGroup.classList.add("form-group");

    passwordInputGroup.id = "show_hide_password";
    passwordInputGroup.classList.add("input-group");

    passwordInput.id = "passwordField";
    passwordInput.setAttribute("autocomplete", "off");
    passwordInput.setAttribute("type", "password");
    passwordInput.setAttribute("placeholder", "Password");
    passwordInput.setAttribute("aria-describedby", "show_hide_password-addon");
    passwordInput.classList.add("form-control");

    passwordAppend.classList.add("input-group-append");

    passwordEye.classList.add("input-group-text");
    passwordEye.id = "show_hide_password-addon";
    passwordEye.innerHTML = `<i class = 'fas fa-eye-slash' id='passwordEye' aria-hidden='true'></i>`;
    passwordEye.addEventListener("click", function () {
      myself.togglePasswordVisibility();
    });

    passwordAppend.appendChild(passwordEye);
    passwordInputGroup.append(passwordInput, passwordAppend);
    passwordGroup.appendChild(passwordInputGroup);

    passwordInput.addEventListener("keyup", (e) => {
      if (document.querySelector("#signInErrorMsg").hidden == false) {
        document.querySelector("#signInErrorMsg").hidden = true;
      }
    });

    return passwordGroup;
  }

  createCheckbox() {
    let checkboxGroup = document.createElement("div");
    let checkboxInput = document.createElement("input");
    let checkboxLabel = document.createElement("label");

    checkboxGroup.classList.add("form-group", "form-check", "d-inline-block");

    checkboxInput.id = "rememberMe";
    checkboxInput.setAttribute("type", "checkbox");
    checkboxInput.classList.add("form-check-input");

    checkboxLabel.classList.add("form-check-label");
    checkboxLabel.setAttribute("for", "rememberMe");
    checkboxLabel.innerHTML = "Remember me";

    checkboxGroup.append(checkboxInput, checkboxLabel);

    return checkboxGroup;
  }

  createForgotPassword() {
    let forgotPasswordGroup = document.createElement("div");
    let forgotPasswordText = document.createElement("strong");

    forgotPasswordGroup.classList.add("form-forgot-password");
    forgotPasswordText.innerHTML = `<a href='/accounts/password/reset/'>Forgot your password?</a>`;

    forgotPasswordGroup.appendChild(forgotPasswordText);
    return forgotPasswordGroup;
  }

  createLoader() {
    let loaderContainer = document.createElement("div");
    let loader = document.createElement("img");

    let loaderErrorContainer = document.createElement("div");
    let loaderErrorText = document.createElement("p");

    this.loader = loaderContainer;
    this.errorMsg = loaderErrorContainer;

    loaderContainer.id = "signInLoader";
    loaderContainer.hidden = true;
    loaderContainer.classList.add("loader");
    loader.setAttribute(
      "src",
      `${isAppHomepage ? currentLocation : ""}img/loader.svg`
    );

    loaderErrorContainer.id = "signInErrorMsg";
    loaderErrorContainer.hidden = true;
    loaderErrorText.innerHTML =
      "The username and password you entered did not match our records. Please double-check and try again.";

    loaderErrorContainer.appendChild(loaderErrorText);

    loaderContainer.appendChild(loader);

    return [loaderContainer, loaderErrorContainer];
  }

  createBody() {
    let body = document.createElement("div");
    let signIn = document.createElement("button");
    let loader = this.createLoader();
    let myself = this;

    body.classList.add("modal-body");

    signIn.id = "signUserIn";
    signIn.setAttribute("type", "button");
    signIn.classList.add("btn", "btn-primary", "btn-block");
    signIn.innerHTML = "Sign in";

    signIn.addEventListener("click", () => {
      myself.attemptSignIn();
    });

    body.append(loader[0], loader[1], this.createSignInForm(), signIn);

    return body;
  }

  createFooter() {
    let msg = document.createElement("p");

    msg.innerHTML =
      "Don't have an account? <strong><a href='/accounts/signup'>Sign up</a></strong>";

    return super.createFooter([msg]);
  }

  getPayload() {
    return {
      login: this.username.value,
      password: this.password.value,
    };
  }

  attemptSignIn() {
    let myself = this;

    getCSRFToken();

    myself.updateSignInPrompt("show");

    cloud
      .postToAPI(this.getPayload(), api.login)
      .then(() => {
        cloud
          .getFromAPI(api.user)
          .then((data) => {
            currentUser.setUserData(data);
            userNavigation.updateUserNavigation();
            savePrompt.update();
            saveAsPrompt.update();
            // updateGlobalLayout();
          })
          .then(() => {
            if (currentUser.id) {
              saveAsPrompt.fetchUserClassrooms();
              loadPrompt.fetchUserProjects();

              alertPrompt.alertUser(
                `Sign in successful,  ${currentUser.name}`,
                2000
              );
              myself.updateSignInPrompt("hide");
              // Alert the user that they were successful
            }
          })
          .catch((err) => {
            currentUser.clearUser();
            userNavigation.updateUserNavigation();
            savePrompt.update();
            saveAsPrompt.update();

            // Lack of internet connection, wrong password, other errors
            console.error(
              `Error: Failed to get a current user -- ${JSON.stringify(err)}`
            );
          });
      })

      .catch((err) => {
        currentUser.loggedIn = false;

        // Hide the loading indicator
        myself.updateSignInPrompt("error");

        // Log the error in console
        console.error(`Error Message:  ${JSON.stringify(err)}`);
      });
  }

  updateSignInPrompt(status) {
    this.loader.hidden = status != "show";
    this.form.hidden = status == "show";
    this.errorMsg.hidden = status != "error";
  }

  togglePasswordVisibility(forceHidden = false) {
    let eye = document.querySelector("#passwordEye");
    let eyeStatus = forceHidden
      ? false
      : eye.classList.contains("fa-eye-slash");
    eye.classList.remove(eyeStatus ? "fa-eye-slash" : "fa-eye");
    eye.classList.add(eyeStatus ? "fa-eye" : "fa-eye-slash");
    this.password.setAttribute("type", eyeStatus ? "text" : "password");
  }
}

/////////////////////////////////
//Declarations Class
/////////////////////////////////

let userNavigation = new Navigation();
let signOutPrompt = new SignOutPrompt();
let loadPrompt = new LoadPrompt();

let savePrompt = new SavePrompt();
let saveAsPrompt = new SaveAsPrompt();
let signInPrompt = new SignInPrompt();
let alertPrompt = new AlertPrompt();
let cloud = new Cloud();
/////////////////////////////////
//Cloud helper functions
////////////////////////////////

/**Gets a cookie of a specific type from the page*/
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

/*** Gets a CSRF token for the user*/
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

/**Test that a given url is a same-origin URL*/
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

/** Tests if this is csrf safe*/
function csrfSafeMethod(method) {
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

function generateSaveFormData(data, type) {
  let projectForm = new FormData();
  let projectData = dataToBlob(data, type);
  projectForm.append("file", projectData);
  return projectForm;
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
function updateVisibleModifiedStatus() {
  $(`#${cloudUI.visibleModifiedStatus}`).html(
    currentProject.modified
      ? "<strong>You have unsaved changes.</strong> "
      : `Last saved on: <strong>${currentProject.created_at}</strong>`
  );
}

function updateCurrentProjectSettings(id) {
  currentProject.setFromSave(id);
  cloud.updateCurrentURL();
  updateVisibleModifiedStatus();
  alertPrompt.alertUser("Success. Your project was saved.", 2500);

  loadPrompt.fetchUserProjects();
}

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

function setLoadingOverlay(isHidden, hasTimeout = false) {
  let overlay = document.querySelector(".loading-overlay");
  overlay.hidden = isHidden;
  if (hasTimeout)
    setTimeout(() => {
      overlay.hidden = true;
    }, 3000);
}
// Imports should trigger modified status
// CTRL + S should save the project
