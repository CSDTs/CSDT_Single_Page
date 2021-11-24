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
  braidGallery: "#braidGallery",
  braidGalleryContainer: "braidGalleryContainer",

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

// The canvas object that will be used
// const braidCanvas = document.getElementById("braidCanvas");
// const ctx = braidCanvas.getContext("2d");
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

// Data that gets passed to cloud framework
let saveObject = {
  project: Braids,
  image: "braidCanvas",
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
let currentApplicationSplit = "index.html";
let currentLocation = window.location.href.split(currentApplicationSplit)[0];
let isAppHomepage = currentLocation.includes("CSDT_Single_Page");
let goalDirectory = "braids/adinkra-";
