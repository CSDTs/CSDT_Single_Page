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
let applicationID = 90;
let goalDirectory = "loom/bl-";
let goalImageTotal = 8;
let gridColor = "#e9e9e9";

window.csdtCloud;

const EventListenerMode = {
  capture: true,
};

//Set up the apps audio context
window.AudioContext = window.AudioContext || window.webkitAudioContext;
let superAudioContext = new AudioContext();

// Customize the sound palette and libraries
let libraries = {
  HipHop: [
    "rest",
    "scratch11",
    "scratch12",
    "scratch13",
    "hup1",
    "clap1",
    "tube1",
    "bassdrum1",
    "hihat1",
    "bass-drum-reverb",
  ],
  LatinoCaribbean: [
    "open1",
    "tip1",
    "slap1",
    "heel1",
    "neck1",
    "mouth1",
    "clave1",
    "maracas1",
    "tamborine1",
    "clap4",
    "openhighconga4",
    "congaslap",
  ],
  Rock: [
    "rest",
    "acousticbass1",
    "acousticsnare1",
    "electricsnare1",
    "lowfloortom1",
    "openhighconga1",
    "hihato1",
    "splash1",
    "crash1",
    "trap-cymbal-06",
  ],
  Electro: [
    "electrocowbell1",
    "electrotap1",
    "electroclap1",
    "electrokick1",
    "electrosnare1",
    "hi-hat-reverb",
    "snare-w-reverb3",
    "trap-cymbal-03",
    "lowelectronicconga",
  ],
  TypeBeats: [
    "orchestra-hit",
    "afghanistan-rabab",
    "ambition-string",
    "cali-wah-guitar",
    "low-sway-futuristic",
    "moonlit-bass",
    "night-funk",
  ],
};
let defaultSoundPalette = {
  library: "HipHop",
};
let sounds = {};

// Customize the wheels
const MAX_NUM_OF_BEATS = 16;
const TOTAL_WHEEL_COUNT = 3;

let defaultWheels = {
  wheel1: {
    nodes: ["hihat1", "rest", "hihat1"],
    repeat: 1,
  },
  wheel2: {
    nodes: ["clave1", "maracas1", "maracas1", "rest"],
    repeat: 1,
  },
};

// Classes, Ids, etc for GUI Manuplication
let appReferences = {
  soundCategorySelect: "sound_category",

  soundPalette: "sound_palette",
  soundTile: "sound_tile",

  wheelControlsContainer: "wheelControls",
  wheelControlsClass: ".control-div",
  wheelsContainer: "wheels",
  individualWheelContainer: "wheel_container",
  individualWheel: "wheel",

  recordingWheelContainer: "audioWheelContainer",
  recordingWheel: "recording-wheel",
  recordingWheelSprite: "testrotate",

  numOfWheels: "num_wheels",
  numOfBeatOption: "loop_length_option",
  numOfRepeatInput: "wheel_repeat_input",
  tempoSlider: "tempo",

  playButton: "play_button",
  stopButton: "stop_button",

  mp3ExportButton: "downloadMP3",
  mp3ExportIcon: "fa-download",
  recordButton: "record",
  stopRecordButton: "recordStop",
  recordedAudio: "recordedAudio",
  closeRecordingPrompt: "close-recording",
  recordCountdown: "countdown",

  recordPrompt: "recordModal",
};

// List of HTML element names to make it easier to refactor
let flags = {
  dragging: null,
  playing: false,
  dragFromNode: false,
};

// Project specific values and globals
let globals = {
  bpm: 120,
  startTime: "",
  endTime: "",
  recordAudioDuration: 0,
  incomingAudio: "",
  outgoingAudio: "",
};
// Data that gets passed to cloud framework
// let saveObject = {
//   project: beadStack,
//   image: myCanvas,
// };
let saveObject;
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

let currentApplicationSplit = "index.html";

//Quick and dirty approach to handling broken images for new project saves
let currentLocation = window.location.href.split(currentApplicationSplit)[0];
let isAppHomepage = currentLocation.includes("CSDT_Single_Page");
