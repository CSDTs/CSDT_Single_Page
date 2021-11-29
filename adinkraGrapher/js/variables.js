/* eslint-disable */

// Application ID can be found via django admin panel
let applicationID = 144;

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
  iterationsParam: "#iterations",
  xParam: "#start-x",
  yParam: "#start-y",
  angleParam: "#start-angle",
  startDilationParam: "#start-dilation",
  reflectXParam: "#reflectx",
  reflectYParam: "#reflecty",
  translateParam: "#x-translation",
  rotateParam: "#rotation",
  dilateParam: "#dilation",

  braidSelection: "#braid-select",
  printPageBtn: "#printAppPage",
  clearEquationsBtn: "#clearEquations",
  loadLocalProject: "#loadLocalProject",
  saveLocalProject: "#saveLocalProject",
  braidCanvas: "#braidCanvas",
  braidCanvasContainer: "#canvas-container",

  braidGoal: ".braid-img",
  braidGoalPlaceholder: "#goal-image",
  symbolGallery: "#symbolGallery",
  symbolGalleryContainer: "symbolGalleryContainer",

  newBraidBtn: "#new-braid",
  resetCurrentBtn: "#reset-braid",
  deleteSelectedBtn: "#delete-braid",
  toggleGridBtn: "#hideGrid",
  toggleInitPointBtn: "#addAtCurrentPoint",
  togglePointLocationBtn: "#showCoordinatesOption",
  togglePointHighlightBtn: "#hideHighlight",
  togglePointVectorBtn: "#showVector",

  dataContainer: "#data-container",
  coordinatePanel: "#showCoordinates",

  formData: "#data-form",
};
// Cornrow Curves Math variables
let hideGrid = false;
let addAtCurrentPoint = false;
let showCoordinatesInCorner = false;
let hideHighlight = false;
let showVector = false;
let midVectors = [];
let currBraidIndex = 0;
let Braids = [];

let elt = document.getElementById("calculator");
let calculator = Desmos.GraphingCalculator(elt, {
  keypad: false,
});

const equationInput = document.getElementById("equation");
const equationStartX = document.getElementById("start-x");
const equationEndX = document.getElementById("end-x");
const equationRadius = document.getElementById("radius");
const drawEquationBtn = document.getElementById("drawEquation");
const equationTemplate = document.getElementById("equationExamples");
const linearParameters = document.getElementById("linearParameters");
const circleParameters = document.getElementById("circleParameters");
const redoBtn = document.getElementById("redo");
const undoBtn = document.getElementById("undo");

// Data that gets passed to cloud framework
let saveObject = {
  project: calculator.getState(),
  image: calculator.screenshot(),
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

//DOM elements

const goalImages = document.querySelectorAll(".braid-img");
const currentGoalImage = document.getElementById("goal-image");
const goalImageModal = document.getElementById("symbolGallery");
const goalImageContainer = document.getElementById("symbolGalleryContainer");

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
  classroom: "/api/classroom",
  file: "/api/files/",
  user: "/api/user",
  login: "/accounts/login/",
  loadProject: "/projects/",
  logout: "/accounts/logout/",
};

//Quick and dirty approach to handling broken images for new project saves
let currentApplicationSplit = "index.html";
let currentLocation = window.location.href.split(currentApplicationSplit)[0];
let isAppHomepage = currentLocation.includes("CSDT_Single_Page");
let goalDirectory = "braids/adinkra-";
