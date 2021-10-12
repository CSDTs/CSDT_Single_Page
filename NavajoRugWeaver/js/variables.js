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
let applicationID = 100;
let goalDirectory = "loom/bl-";
let goalImageTotal = 8;
let gridColor = "#e9e9e9";

window.csdtCloud;

const myCanvas = document.querySelector("canvas");
const ctx = myCanvas.getContext("2d");
let beadCostume = "./img/bead-default.png";
let wampumCostume = "";
let beadDesign = "point";
let scale = 10;
let beadSize = scale / 2;
let basketSize = scale / 2 / 2;
let basketShadowSize = beadSize - basketSize;
let beadStack = [];
let beadUndoBuffer = [];
let stackLength = 0;
let currBufferLength = 0;

let hideGrid = false;
let showCoordinatesInCorner = false;
// let useWampum = false;

// constants for switch/case checking representation type
const HEX = 1;
const RGB = 2;
const RGBA = 3;

// Data that gets passed to cloud framework
let saveObject = {
  project: beadStack,
  image: myCanvas,
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

class User {
  constructor(id, name, status) {
    this.id = id;
    this.name = name;
    this.status = status;
  }
  updateID(id) {
    this.id = id;
  }
  updateName(name) {
    this.name = name;
  }
  updateLoginStatus(status) {
    this.status = status;
  }
  isLoggedIn() {
    return this.status;
  }
  getId() {
    return this.id;
  }
  getUsername() {
    return this.name;
  }
}
const createBtn = document.getElementById("create-design");
const beadStyleSelect = document.getElementById("bead-style");
const patternImage = document.getElementById("pattern-image");

const pointX = document.getElementById("point-x1");
const pointY = document.getElementById("point-y1");

const lineX1 = document.getElementById("line-x1");
const lineY1 = document.getElementById("line-y1");
const lineX2 = document.getElementById("line-x2");
const lineY2 = document.getElementById("line-y2");

const rectangleX1 = document.getElementById("rectangle-x1");
const rectangleY1 = document.getElementById("rectangle-y1");
const rectangleX2 = document.getElementById("rectangle-x2");
const rectangleY2 = document.getElementById("rectangle-y2");

const triangleX1 = document.getElementById("triangle-x1");
const triangleY1 = document.getElementById("triangle-y1");
const triangleX2 = document.getElementById("triangle-x2");
const triangleY2 = document.getElementById("triangle-y2");
const triangleX3 = document.getElementById("triangle-x3");
const triangleY3 = document.getElementById("triangle-y3");

const linearIterationX = document.getElementById("linear-iteration-x");
const linearIterationY = document.getElementById("linear-iteration-y");
const linearRowLength = document.getElementById("row-length");
const linearFirstEnd = document.getElementById("first-num");
const linearSecondEnd = document.getElementById("second-num");
const linearRowTotal = document.getElementById("rows");

const triangleIterationX = document.getElementById("triangle-iteration-x");
const triangleIterationY = document.getElementById("triangle-iteration-y");
const triangleRowGrouping = document.getElementById("grouping");
const triangleEnds = document.getElementById("triangleIterationEnds");
const triangleRowTotal = document.getElementById("rows-tri");

const defaultColorSelect = document.getElementById("default-color");
const firstIterationColorSelect = document.getElementById(
  "first-iteration-color"
);
const secondIterationColorSelect = document.getElementById(
  "second-iteration-color"
);

const redoBtn = document.getElementById("redo");
const undoBtn = document.getElementById("undo");
const printBtn = document.getElementById("printAppPage");
const gridBtn = document.getElementById("hideGrid");
const clearBtn = document.getElementById("clear-local");

const coordinateLocationBtn = document.getElementById("showCoordinatesOption");
const coordinatePanel = document.getElementById("showCoordinates");

const beadCanvas = document.getElementById("myCanvas");

const goalImages = document.querySelectorAll(".bead-img");
const currentGoalImage = document.getElementById("goal-image");
const goalImageModal = document.getElementById("beadGallery");
const goalImageContainer = document.getElementById("beadGalleryContainer");

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

const applicationTitle = document.getElementById("application-title");
const csdtAPI = {
  project: "/api/projects/",
  classroom: "/api/team",
  file: "/api/files/",
  user: "/api/user",
  login: "/accounts/login/",
  loadProject: "/projects/",
  logout: "/accounts/logout/",
};

// Preemptive attempt to converge the three programs into one (since they literally share over 95% of the codebase)
let navajoRugWeaverApp = {
  id: 102,
  gridColor: "#e9e9e9",
  img: "rug/rug-",
  examples: 9,
  title: "Navajo Rug Weaver",
  appSplit: "navajo.html",
  isActive: false,
};

let basketWeaverApp = {
  id: 101,
  gridColor: "#b3a683",
  img: "basket/weave-",
  examples: 9,
  title: "Northwest Basket Weaver",
  appSplit: "basketweaver.html",
  isActive: false,
};

let beadLoomApp = {
  id: 100,
  gridColor: "#e9e9e9",
  img: "loom/bl-",
  examples: 8,
  title: "Virtual Bead Loom",
  appSplit: "beadloom.html",
  isActive: false,
};
let navajoKnots = false;
let basketWeaving = false;
let currentApplicationSplit = "loom.html";

//Quick and dirty approach to handling broken images for new project saves
let currentLocation = window.location.href.split(currentApplicationSplit)[0];
let isAppHomepage = currentLocation.includes("CSDT_Single_Page");
