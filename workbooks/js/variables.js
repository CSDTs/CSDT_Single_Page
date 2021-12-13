/* eslint-disable */

// Application ID can be found via django admin panel
let applicationID = 99;

// Create cloud instance
window.csdtCloud;

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

// IDs and classes of the application. Makes refactoring way easier...
let appReferences = {
  variantText: ".wb-variant",
  lengthText: ".wb-length",
  lessonText: ".wb-lesson",
  lessonCounter: ".wb-lesson-total",
  lessonTitle: ".wb-title",
  lessonInformation: ".wb-info",
  progressBar: ".progress-bar",
  lessonNav: "wb-lesson-links",
  loadingScreen: ".loading-overlay",
  prevButton: ".prev",
  nextButton: ".next",
  lessonSubtitle: ".wb-lesson-title",
  lessonTotalDisplay: ".step-h",
  saveContinueBtn: "#save-continue",
  autosaveText: ".autosave-text",
  standardPrompt: "#standard-prompt",
  interHomePrompt: "#interactive-homepage-prompt ",
  confirmModal: "#confirmation",
  confirmBtn: "#confirm-btn",
  confirmText: "#confirm-body",
  notification: "#notification",
  notificationMsg: "#notification-msg",
};

// Data that gets passed to cloud framework
let currentAnswers = {};

let saveObject = {
  project: currentAnswers,
  image: "",
};
let currentProject = {
  id: "",
  modified: false,
  new: true,
  name: "Untitled Project",
  description: "",
  classroom: "",
  application: applicationID,
  data_id: "",
  screenshot_id: "",
  created_at: "",
  modified_at: "",
};

let currentUser = {
  id: "",
  name: "",
  loggedIn: false,
};
let workbook;

let csWorkbooks = {
  intro: {
    name: "Introduction",
    location: "./computerscience/introduction/",
  },
  loops: {
    name: "Loops",
    location: "./computerscience/loops/",
  },
};

let mathWorkbooks = {
  intro: {
    name: "Introduction",
    location: "./computerscience/introduction/",
  },
};

let tagOptions = {
  response: ".response-div",
  csnap: "#csnap-pro",
  homepage: "#interactive-homepage",
  login: "#interactive-login",
};

let userInteractions = {
  userInput: "#user-response",
  verify: "#interactive-verification",
  login: "#interactive-signin",
  passwordCheck: "#passCheck",
  passwordField: "#userPassword",
  usernameField: "#userName",
  validateField: ".interactive-login-field",
  loginModal: "#loginModal",
};

//DOM elements

const goalImages = document.querySelectorAll(".braid-img");
const currentGoalImage = document.getElementById("goal-image");
const goalImageModal = document.getElementById("braidGallery");
const goalImageContainer = document.getElementById("braidGalleryContainer");

const applicationTitle = document.getElementById("application-title");
const applicationContainer = document.getElementById("canvas-container");
const dataContainer = document.getElementById("data-container");

const loadProjectPreview = document.getElementById("loadProjectPreview");
const loadProjectCreatedDate = document.getElementById(
  "loadProjectCreatedDate"
);
const loadProjectModifiedDate = document.getElementById(
  "loadProjectModifiedDate"
);
const loadProjectClassroom = document.getElementById("loadProjectClassroom");

const loadProjectComponent = document.getElementById("loadProjectComponent");

const detailsProjectComponent = document.getElementById(
  "detailsProjectComponent"
);

//API Links
const csdtAPI = {
  project: "/api/projects/",
  classroom: "/api/team",
  file: "/api/files/",
  user: "/api/user",
  login: "/accounts/login/",
  loadProject: "/projects/",
  logout: "/accounts/logout/",
};

//Quick and dirty approach to handling broken images for new project saves
let currentApplicationSplit = "cornrows.html";
let currentLocation = window.location.href.split(currentApplicationSplit)[0];
let isAppHomepage = currentLocation.includes("CSDT_Single_Page");
let goalDirectory = "braids/cc-";
