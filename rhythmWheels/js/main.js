/* eslint-disable */
/* eslint-disable padded-blocks */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable prefer-let */
/* eslint-disable space-before-function-parent*/

// import SoundTile from "./tile.js";

// var RhythmWheels;
// var Cloud;

// Application ID attached to Rhythm Wheels
let applicationID = 90;

// Classes, Ids, etc for GUI Manuplication
let constants = {
  sound_palette_id: "sound_palette",
  sound_tile_class: "sound_tile",
  sound_category_id: "sound_category",

  wheels_container_id: "wheels",
  wheelContainer_class: "wheel_container",
  wheel_class: "wheel",
  loop_length_option_class: "loop_length_option",
  num_wheels_id: "num_wheels",

  play_button_id: "play_button",
  stop_button_id: "stop_button",
  tempo_slider_id: "tempo",

  mp3_export_id: "mp3show",

  record_button_id: "record",
  record_button_stop_id: "recordStop",

  loadingModal: "#loadingModal",

  logoutButton: "logout-btn",
  loginToSaveButton: ".save-cloud-login",

  userName: "#userName",
  userPass: "#userPass",

  recorded_audio: "recordedAudio",

  project_load_alert: "fetch-projects-label",
  project_login_btn: "load-cloud-login",
  project_list: "cloud-project",

  notification: "#notification",
  notificationMsg: "#notification-msg",

  load_prompt: "cloudLoading",
  import_file: "load-local",

  login_prompt: "loginModal",
  login_btn: "login",
  user_status: "user-status",

  save_updated: "saveCurrentCloudButton",
  save_new: "save-cloud",
  save_modal: "cloudSaving",
  confirm_save_modal: "cloudSave",

  project_title: "project_title",
  project_title_display: "display-title",

  loading_overlay: "loading-overlay",

  recording_close_btns: "close-recording",

  recording_wheel: "recording-wheel",
  recording_wheel_image: "testrotate",
  recording_countdown: "countdown",
};

let appReferences = {
  wheelControlsContainer: "wheelControls",
};
// Available sound libraries
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
    "rest",
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

// List of HTML element names to make it easier to refactor
let flags = {
  dragging: null,
  playing: false,
  newProject: true,
  modifiedSinceLastSave: false,
  dragFromNode: false,
  loggedIn: false,
};

// Project specific values and globals
let rhythmWheelGlobals = {
  bpm: 120,
  projectName: "Untitled",
  userID: "",
  number_wheels: 1,
  userName: "",
  loadingText: "",
  mp3_text: "",
  record_button: "",
  recorded_audio: "",
  startTime: "",
  endTime: "",
  recordAudioDuration: 0,
  incomingAudio: "",
  outgoingAudio: "",
};

let projectData = {
  startTime: "",
  bpm: 120,
  projectName: "Untitled",
  userID: "",
  number_wheels: 1,
  userName: "",
  loadingText: "",
  mp3_text: "",
  record_button: "",
  recorded_audio: "",
  startTime: "",
  endTime: "",
  recordAudioDuration: 0,
  incomingAudio: "",
  outgoingAudio: "",
};

globals = { ...globals, ...rhythmWheelGlobals };

// Sound variables for audio merging
let sounds = {};

const EventListenerMode = {
  capture: true,
};

// function Cloud() {
//   this.projAPIURL = "/api/projects/";
//   this.fileAPIURL = "/api/files/";
//   this.loginUrl = "/accounts/login/";
//   this.loadProjURL = "/projects/";
//   this.userAPIURL = "/api/user";
//   this.logoutAPIURL = "/accounts/logout/";

//   this.getCSRFToken();
//   this.init();
// }

// function SoundPalette() {
//   this.init();
// }

// function RhythmWheels(opts) {
//   // this.cloud = new Cloud();
//   this.init(opts);
// }

// /**
//  * Initialize an instance of Rhythm Wheels
//  * @param {array} opts options to initialize rhythm wheels
//  *
//  * Note: The options are basically just where the sounds are located.
//  * However, previous developers probably had something in mind for this..
//  */
// RhythmWheels.prototype.init = function (opts) {
//   // keep a list of active sounds so they can be aborted when stopped while playing (compiling audio)
//   this.exportBuffers = [];
//   this.recordedBufferSource;
//   this.recordedBufferSourceExport;
//   this.maxTime;
//   this.audioRec = "";
//   this.audioChunks = [];
//   this.recordedAudioArray = [];

//   // Loads sounds
//   if (opts === undefined) opts = {};
//   if (opts.sounds !== undefined) sounds = opts.sounds;

//   this.soundPalette = new SoundPalette({
//     library: "HipHop",
//   });

//   this.wheelsContainer = new WheelsContainer(defaultWheels);

//   window.AudioContext = window.AudioContext || window.webkitAudioContext;
//   this.audioContext = new AudioContext();

//   // Create the audio context for playback, preload the sounds
//   this.initSoundTileBuffers();

//   // Bind the functions to the gui
//   this.bindGUI();

//   // Animate the wheels
//   let anim = () => {
//     this.wheelsContainer.updateContainer();
//     requestAnimationFrame(anim);
//   };

//   anim();

//   setLoadingOverlay(true, false);
// };

// // Acts as a one stop shop to bind rw functions to the gui
// RhythmWheels.prototype.bindGUI = function () {
//   let myself = this;

//   // Enable controls for recorded audio playback
//   $(`#${constants.recorded_audio}`).attr("controls", true);

//   // Play the project
//   $(`#${constants.play_button_id}`).on("click", function () {
//     interrupt();
//     myself.play();
//   });

//   // Stop the project
//   $(`#${constants.stop_button_id}`).on("click", function () {
//     myself.stop();
//   });

//   // Export the project as an mp3
//   $(`#${constants.mp3_export_id}`).on("click", function () {
//     myself.mp3Export();
//   });

//   // Start the audio recording
//   $(`#${constants.record_button_id}`).on("click", function () {
//     myself.initRecording();
//     $(`#${constants.record_button_id}`).attr("hidden", true);
//     $(`#${constants.record_button_stop_id}`).attr("hidden", false);
//   });

//   // Stop the audio recording
//   $(`#${constants.record_button_stop_id}`).on("click", function () {
//     myself.stopRecording();
//     $(`#${constants.record_button_id}`).attr("hidden", false);
//     $(`#${constants.record_button_stop_id}`).attr("hidden", true);
//   });

//   $(`.${constants.recording_close_btns}`).on("click", function () {
//     try {
//       myself.stopRecording();
//       $(`#${constants.record_button_id}`).attr("hidden", false);
//       $(`#${constants.record_button_stop_id}`).attr("hidden", true);
//     } catch (e) {
//       console.log("no audio recording");
//     }
//     var x = document.getElementById(constants.recorded_audio);
//     x.pause();
//   });

//   // Modify the global bpm based on user input
//   $(`#${constants.tempo_slider_id}`).on("change", function (event) {
//     interrupt();
//     globals.bpm = 120 * Math.pow(10, event.target.value);
//     flags.modifiedSinceLastSave = true;
//   });

//   // Update the project title (both visually and with the global variable)
//   $(`#${constants.project_title}`).on("change", function (event) {
//     globals.projectName = event.target.value;
//     $(`#${constants.project_title_display}`).html(globals.projectName);
//   });

//   // Update the project title value to whatever the current project is
//   $(`#${constants.project_title}`).attr("value", globals.projectName);
//   $(`#${constants.project_title_display}`).html(globals.projectName);

//   // Load the user selected project on project list change
//   $(`#${constants.project_list}`).on("change", function (e) {
//     myself.loadFromCloud(e.target.value);
//   });

//   // Log the user out
//   $(`#${constants.logoutButton}`).on("click", function () {
//     myself.submitLogout();
//   });

//   // Log the user in
//   $(`#${constants.login_btn}`).on("click", function () {
//     myself.submitLogin();
//   });

//   // Save a current project (i.e. the current project has been updated)
//   $(`#${constants.save_updated}`).on("click", function () {
//     flags.newProject = false;
//     $(`#${constants.confirm_save_modal}`).modal("hide");
//     rw.saveToCloud();
//   });

//   // Save a new project
//   $(`#${constants.save_new}`).on("click", function () {
//     flags.newProject = true;
//     $(`#${constants.save_modal}`).modal("hide");
//     rw.saveToCloud();
//   });

//   // Import a .rw file
//   $(`#${constants.import_file}`).on("change", function (e) {
//     let file = e.target.files[0];
//     if (!file) {
//       return;
//     }
//     readSingleFile(e);
//   });

//   //  Document resize events
//   document.body.onresize = function () {
//     myself.wheelsContainer.updateContainer();
//   };
//   document.body.onscroll = function () {
//     myself.wheelsContainer.updateContainer();
//   };
// };

// RhythmWheels.prototype.createSoundTileAudioBuffer = function (soundURL, res) {
//   const myself = this;
//   let request = new XMLHttpRequest();
//   request.open("GET", soundURL, true);
//   request.responseType = "arraybuffer";
//   request.onload = () => {
//     let success = (buffer) => {
//       res({
//         buffer: buffer,
//       });
//     };

//     let error = (err) => {
//       res(null, err);
//     };

//     myself.audioContext.decodeAudioData(request.response, success, error);
//   };

//   request.send();
// };
// RhythmWheels.prototype.setSoundTileBuffer = function (soundName) {
//   this.createSoundTileAudioBuffer(
//     sounds[this.keys[soundName]].url,

//     (res, err) => {
//       if (err) {
//         console.error("[!] Error loading sound: " + this.keys[soundName]);
//         return;
//       }
//       sounds[this.keys[soundName]].buffer = res.buffer;
//     }
//   );
// };
// RhythmWheels.prototype.initSoundTileBuffers = function () {
//   this.keys = Object.keys(sounds);

//   // Create and set each audio buffer
//   for (let j = 0; j < this.keys.length; j++) {
//     this.createSoundTileAudioBuffer(
//       sounds[this.keys[j]].url,

//       (res, err) => {
//         if (err) {
//           console.error("[!] Error loading sound: " + this.keys[j]);
//           return;
//         }
//         sounds[this.keys[j]].buffer = res.buffer;
//       }
//     );
//   }

//   console.log("Sound tile buffers have been created.");
// };

// // Takes the current state of rhythm wheels and turns it into a string to be used for saving
// RhythmWheels.prototype.generateString = function () {
//   let output = "rw v0.0.2\n";
//   let data = {};
//   data["title"] = document.getElementById(constants.project_title).value;
//   data["tempo"] = globals.bpm;
//   data["wheelCount"] = this.wheelsContainer.wheelCount;
//   data["wheels"] = [];
//   for (let i = 0; i < this.wheelsContainer.wheelCount; i++) {
//     let wheel = {};
//     wheel["size"] = this.wheelsContainer.wheels[i].nodeCount;
//     wheel["loop"] = this.wheelsContainer.wheels[i].loopCount;
//     wheel["nodes"] = [];
//     for (let j = 0; j < this.wheelsContainer.wheels[i].nodeCount; j++) {
//       wheel["nodes"].push(this.wheelsContainer.wheels[i].nodes[j].type);
//     }
//     data["wheels"].push(wheel);
//   }
//   data["audio"] = globals.outgoingAudio;
//   data["audioStart"] = globals.startTime;
//   data["audioEnd"] = globals.endTime;
//   return output + JSON.stringify(data);
// };

// // Compiles, then plays audio once compliation is complete
// RhythmWheels.prototype.play = function () {
//   let sequences = "";

//   this.recordedBufferSource = "";

//   let playPromise = new Promise((resolve, reject) => {
//     sequences = this.compileAudio();
//     this.recordedAudioBufferFill(
//       this.wheelsContainer.rapWheel.loopCount,
//       false
//     );
//     resolve(sequences);
//   });

//   playPromise.then((value) => {
//     // iterate first through wheels, then iterate through nodes
//     for (let i = 0; i < value.length; i++) {
//       this.wheelsContainer.wheels[i].setPlaying(true);
//       // if playable sequences, play the audio buffer associated
//       activeBuffers[i].start();
//     }
//     this.wheelsContainer.rapWheel.isPlaying = true;
//     this.recordedBufferSource.start(); // ONLY DO THIS IF PREVIOUSLY CALLED
//     flags.playing = true;
//   });
// };

// /**
//  * Compiles the audio string for playback / mp3 export
//  * @param {boolean} toExport If this is for mp3 or not
//  */
// RhythmWheels.prototype.compileAudio = function (toExport) {
//   let sequences = [];

//   // reset maxTime every time you compile
//   maxTime = 0;

//   // Check # wheels, determine their sequence time (# beats in a wheel [loops*nodes] * seconds per node [60s / beats per minute])
//   for (let i = 0; i < this.wheelsContainer.wheelCount; i++) {
//     let sequenceTime =
//       (this.wheelsContainer.wheels[i].loopCount *
//         this.wheelsContainer.wheels[i].nodeCount *
//         60.0) /
//       globals.bpm;
//     if (sequenceTime > maxTime) maxTime = sequenceTime;
//     sequences.push([]);
//     for (let k = 0; k < this.wheelsContainer.wheels[i].loopCount; k++) {
//       for (let j = 0; j < this.wheelsContainer.wheels[i].nodeCount; j++) {
//         sequences[i].push(this.wheelsContainer.wheels[i].nodes[j].type);
//       }
//     }
//     // fill out the audio buffer for each wheel
//     this.bufferFill(sequences[i], sequenceTime, toExport);
//   }

//   // Returns the compiled string of audio
//   return sequences;
// };

// /**
//  * Helper function for filling buffer for playing audio, or buffer for exporting audio as mp3
//  *
//  * Step 1: Create WheelBuffer with createBuffer. Duration = sequenceTimeIn
//  * Step 2:for each sound in sequenceIn, create a soundBuffer which is length = seconds/perbeat, and has the sound loaded
//  * Step 3: append this soundBuffer to WheelBuffer
//  * Step 4: push WheelBuffer to activeBuffers
//  *
//  * 48000 Hz is sample rate, 48000 * sequenceTimeIn is frames. Therefore, duration = sequenceTimeIn
//  *
//  * @param {*} sequenceIn
//  * @param {*} sequenceTimeIn
//  * @param {*} toExportIn
//  */
// RhythmWheels.prototype.bufferFill = function (
//   sequenceIn,
//   sequenceTimeIn,
//   toExportIn
// ) {
//   let myself = this;
//   // Step 1
//   let secondsPerBeat = 60.0 / globals.bpm;
//   if (sequenceTimeIn == 0) {
//     // only add empty buffer if compiling to play
//     if (!toExportIn) {
//       // create an empty buffer that is not connected to output, dummy variable if rotations = 0
//       let testPlay = this.audioContext.createBufferSource();
//       activeBuffers.push(testPlay);
//     }
//     return;
//   }

//   let wheelBuffer = this.audioContext.createBuffer(
//     1,
//     48000 * sequenceTimeIn,
//     48000
//   );

//   // Step 2
//   for (let i = 0; i < sequenceIn.length; ++i) {
//     let soundBuffer = this.audioContext.createBuffer(
//       1,
//       48000 * secondsPerBeat,
//       48000
//     );
//     let name = sequenceIn[i];
//     soundBuffer = sounds[name].buffer; // buffer with just the sound effect
//     // Step 3
//     let setWheel = wheelBuffer.getChannelData(0);
//     // fit sound effect into the amount of time for that beat
//     let testSlice = soundBuffer
//       .getChannelData(0)
//       .slice(0, 48000 * secondsPerBeat);
//     setWheel.set(testSlice, i * 48000 * secondsPerBeat);
//   }

//   // Step 4
//   let testPlay = this.audioContext.createBufferSource();
//   testPlay.buffer = wheelBuffer;
//   testPlay.connect(this.audioContext.destination);
//   // compile from play() call
//   if (!toExportIn) {
//     activeBuffers.push(testPlay);
//   } else {
//     // compile from toExport() call
//     exportBuffers.push(testPlay);
//   }
// };

// /**
//  * Compiles the recorded audio for rw
//  * @param {*} repeatRecordingIn
//  * @param {*} toExportIn
//  */
// RhythmWheels.prototype.recordedAudioBufferFill = function (
//   repeatRecordingIn,
//   toExportIn
// ) {
//   let myself = this;
//   // first check if there is anything to play
//   if (myself.recordedAudioArray.length == 0 || myself.repeatRecordingIn == 0) {
//     if (!toExportIn) {
//       myself.recordedBufferSource = myself.audioContext.createBufferSource();
//     }
//     return;
//   }
//   let recorededRawBuffer = myself.recordedAudioArray[0].getChannelData(0);
//   let recordWheelBuffer = myself.audioContext.createBuffer(
//     1,
//     48000 * (repeatRecordingIn * globals.recordAudioDuration),
//     48000
//   );
//   let setRecordWheel = recordWheelBuffer.getChannelData(0);
//   for (let j = 0; j < repeatRecordingIn; ++j) {
//     setRecordWheel.set(
//       recorededRawBuffer,
//       j * 48000 * globals.recordAudioDuration
//     );
//   }
//   testPlay = myself.audioContext.createBufferSource();
//   testPlay.buffer = recordWheelBuffer;
//   testPlay.connect(myself.audioContext.destination);
//   if (!toExportIn) {
//     myself.recordedBufferSource = testPlay;
//   } else {
//     myself.recordedBufferSourceExport = testPlay;
//   }
// };

// // Stops the audio from executing
// RhythmWheels.prototype.stop = function () {
//   let myself = this;

//   for (let i = 0; i < myself.wheelsContainer.wheels.length; i++) {
//     myself.wheelsContainer.wheels[i].setPlaying(false);
//   }
//   flags.playing = false;
//   activeBuffers.forEach(function (source) {
//     source.stop();
//   });
//   myself.wheelsContainer.rapWheel.stopRecordedAudio();
//   myself.recordedBufferSource.stop();
//   activeBuffers = [];
// };

// /**
//  * Creates an MP3 based on the user's project
//  *
//  * Step 1: 1. compile- put the wheels' audio into the activeBuffers array
//  * Step 2: iterate through each of the activeBuffers, add to the 'output' buffer which will have the layered audio
//  * Step 3: then encode the final array
//  */
// RhythmWheels.prototype.mp3Export = function () {
//   let myself = this;

//   globals.loadingText.id = "loadingshow";
//   globals.mp3_text.id = "mp3hide";

//   // clear existing export buffers
//   let projectName = document.getElementById(constants.project_title).value;
//   myself.recordedBufferSourceExport = "";
//   exportBuffers = [];

//   // compile audio data from rhythm wheels and recording
//   myself.compileAudio(true);
//   myself.recordedAudioBufferFill(
//     myself.wheelsContainer.rapWheel.loopCount,
//     true
//   );
//   let recordedAudioMax =
//     myself.wheelsContainer.rapWheel.loopCount * globals.recordAudioDuration;

//   // first, check if there is any audio to export (will it be an empty mp3 file)
//   if (maxTime == 0 && recordedAudioMax == 0) {
//     // need to alert that user trying to export empty buffer
//     globals.loadingText.id = "loadinghide";
//     globals.mp3_text.id = "mp3show";
//     window.alert("You are trying to export an empty audio file!");
//     return;
//   }
//   let maxArrTime = maxTime > recordedAudioMax ? maxTime : recordedAudioMax;
//   // Get the output buffer (which is an array of datas) with the right number of channels and size/duration
//   let layeredAudio = myself.audioContext.createBuffer(
//     1,
//     48000 * maxArrTime,
//     48000
//   );
//   for (let i = 0; i < exportBuffers.length; ++i) {
//     let output = layeredAudio.getChannelData(0);
//     let inputBuffer = exportBuffers[i].buffer.getChannelData(0);
//     for (let bytes = 0; bytes < inputBuffer.length; ++bytes) {
//       output[bytes] += inputBuffer[bytes];
//     }
//   }
//   // overlay the recorded audio into output buffer for exporting if exists
//   if (recordedAudioMax > 0) {
//     let recordedAudioBytes =
//       myself.recordedBufferSourceExport.buffer.getChannelData(0);
//     let output = layeredAudio.getChannelData(0);
//     for (
//       let recordedBytes = 0;
//       recordedBytes < recordedAudioBytes.length;
//       ++recordedBytes
//     ) {
//       output[recordedBytes] += recordedAudioBytes[recordedBytes];
//     }
//   }
//   encoder = new Mp3LameEncoder(48000, 128);
//   let doubleArray = [
//     layeredAudio.getChannelData(0),
//     layeredAudio.getChannelData(0),
//   ];
//   const promise1 = new Promise((resolve, reject) => {
//     encoder.encode(doubleArray);
//     resolve(encoder);
//   });

//   // Download once finished
//   promise1
//     .then((value) => {
//       let newblob = encoder.finish();
//       globals.loadingText.id = "loadinghide";
//       globals.mp3_text.id = "mp3show";
//       let blobURL = URL.createObjectURL(newblob);
//       let link = document.createElement("a");
//       link.href = blobURL;
//       link.setAttribute("download", projectName);
//       link.style.display = "none";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     })
//     .catch((error) => console.log(error));
// };

// // Initializes a recording (basically getting the user ready to record)
// RhythmWheels.prototype.initRecording = function () {
//   let myself = this;

//   document.getElementById("countdown").style.visibility = "visible";
//   myself.audioChunks = [];
//   myself.recordedAudioArray = [];
//   myself.audioRec = "";
//   let i = 3;
//   setTimeout(function () {
//     myself.startRecording();
//   }, 3000);
//   document.getElementById("countdown").innerHTML = i.toString();
//   let test = setInterval(function () {
//     i -= 1;
//     document.getElementById("countdown").innerHTML = i.toString();
//     if (i == 0) {
//       clearInterval(test);
//     }
//   }, 1000);
// };

// // Actually performs the recording
// RhythmWheels.prototype.startRecording = function () {
//   let myself = this;
//   globals.startTime = new Date().getTime();

//   document.getElementById("countdown").style.visibility = "hidden";
//   navigator.mediaDevices
//     .getUserMedia({
//       audio: true,
//     })
//     .then((stream) => {
//       this.handleAudio(stream);
//       myself.audioRec.start();
//     });
// };

// /**
//  * Creates a rap wheen based on the user's custom audio
//  * @param {*} streamIn
//  */
// RhythmWheels.prototype.handleAudio = function (streamIn) {
//   let myself = this;

//   myself.audioRec = new MediaRecorder(streamIn);
//   myself.audioRec.ondataavailable = (e) => {
//     streamIn.getTracks().forEach(function (track) {
//       track.stop();
//     });
//     myself.audioChunks.push(e.data);
//     if (myself.audioRec.state == "inactive") {
//       let blob = new Blob(myself.audioChunks, {
//         type: "audio/mpeg-3",
//       });

//       // Converting blob to base64 for file saving
//       var reader = new window.FileReader();
//       reader.readAsDataURL(blob);
//       reader.onloadend = function () {
//         base64 = reader.result;
//         globals.outgoingAudio = base64;
//       };
//       globals.endTime = new Date().getTime();
//       $(`#${constants.recorded_audio}`).attr("src", URL.createObjectURL(blob));
//       $(`#${constants.recorded_audio}`).attr("autoplay", true);

//       globals.recordAudioDuration =
//         (globals.endTime - globals.startTime) / 1000;
//       blob.arrayBuffer().then(function (buffer) {
//         myself.audioContext.decodeAudioData(
//           buffer,
//           function (audioBuf) {
//             myself.recordedAudioArray.push(audioBuf);
//             // make rapWheel visible
//             let rapWheel = document.getElementById("audioWheelContainer");
//             $("#audioWheelParent").removeClass("d-none");
//             $("#audioWheelSpacer").removeClass("d-none");
//             $("#audioWheelSpacer").addClass("d-inline");
//             rapWheel.style.display = "flex";
//           },
//           function (e) {
//             console.log("ERROR WITH DECODING RECORDED AUDIO: " + e);
//           }
//         );
//       });
//     }
//   };
// };

// /**
//  * Takes in a blob containing the user's recorded audio attached to a .rw file.
//  * @param {*} userAudioBlob
//  */
// RhythmWheels.prototype.handleSavedAudio = function (userAudioBlob) {
//   let myself = this;

//   myself.audioChunks = [];
//   myself.recordedAudioArray = [];
//   myself.audioRec = "";

//   $(`#${constants.recorded_audio}`).attr("autoplay", false);

//   if (userAudioBlob != "") {
//     let end = globals.endTime;
//     let start = globals.startTime;
//     let blob = userAudioBlob;

//     $(`#${constants.recorded_audio}`).attr("src", URL.createObjectURL(blob));

//     globals.recordAudioDuration = (end - start) / 1000;

//     blob.arrayBuffer().then(function (buffer) {
//       myself.audioContext.decodeAudioData(
//         buffer,
//         function (audioBuf) {
//           myself.recordedAudioArray.push(audioBuf);
//           // make rapWheel visible
//           let rapWheel = document.getElementById("audioWheelContainer");
//           $("#audioWheelParent").removeClass("d-none");
//           rapWheel.style.display = "block";
//         },
//         function (e) {
//           console.log("ERROR WITH DECODING RECORDED AUDIO: " + e);
//         }
//       );
//     });
//   } else {
//     let rapWheel = document.getElementById("audioWheelContainer");
//     rapWheel.style.display = "none";
//     $(`#${constants.recorded_audio}`).attr("src", "");
//   }
// };

// // Stops the user's recording
// RhythmWheels.prototype.stopRecording = function () {
//   let myself = this;
//   myself.audioRec.stop();
// };

// /**
//  * Loads a specific project from CSDT cloud
//  * @param {number} id
//  */
// RhythmWheels.prototype.loadFromCloud = function (id) {
//   let myself = this;

//   // Handle the loading modal and alert the user that project is loading
//   $(`#${constants.load_prompt}`).modal("hide");
//   this.alertUser("Loading project. Please wait...");

//   // If the project find was successful, load the file recieved
//   let success = function (data, proj) {
//     // Helper function to perform the load
//     load(proj);

//     // Update the url
//     myself.cloud.updateURL(id);

//     // Update flags and globals
//     flags.modifiedSinceLastSave = false;
//     flags.newProject = false;
//     globals.projectID = id;
//   };

//   let error = function (data) {
//     console.error(data);
//     this.alertUser("Error loading your project. Please try again", 4000);
//   };

//   this.cloud.loadProject(id, success, error);
// };

// //Saves the current rw project to the cloud (either as a new project, or as an updated project based on global flag)
// RhythmWheels.prototype.saveToCloud = function () {
//   let data = {};
//   let blob;
//   let formData;
//   let myself = this;

//   // First, get a CSRF Token
//   this.cloud.getCSRFToken();

//   // Alert the user that the project is now saving
//   this.alertUser("Saving your project. Please wait.");

//   // Get the project data
//   data.string = this.generateString();

//   // Create a new blob
//   blob = new Blob([JSON.stringify(data)], {
//     type: "application/json",
//   });

//   // Create formdata
//   formData = new FormData();
//   formData.append("file", blob);

//   // First, we are saving the files to the cloud. Once that is done, then it creates a project based on the files saved.

//   let fileSaveSuccessful = function (data) {
//     let projectName_ = globals.projectName;
//     let applicationID_ = applicationID;
//     let dataID_ = data.id;
//     let imgID_ = 1000; // placeholder id

//     // Updates global project name
//     globals.projectName = projectName_;

//     // If project creation was a success
//     let success = function (data) {
//       // Update flags
//       flags.modifiedSinceLastSave = false;

//       // Alert the user that the project was saved
//       myself.alertUser("Success. Your project was saved.", 2500);

//       // Determine if the url needs to update
//       if (data.id != globals.projectID) {
//         globals.projectID = data.id;
//         myself.cloud.updateURL(globals.projectID);
//       }

//       // Updates the user's projects
//     };

//     // If the project creation was not a success
//     let error = function (xhr, error) {
//       console.error(error);
//       myself.alertUser(
//         "There was an error with saving. Please try again.",
//         3500
//       );
//     };

//     // Determines if a project should be a new project, or an updated project
//     if (flags.newProject) {
//       myself.cloud.createProject(
//         projectName_,
//         applicationID_,
//         dataID_,
//         imgID_,
//         success,
//         error
//       );
//     } else {
//       myself.cloud.updateProject(
//         globals.projectID,
//         projectName_,
//         applicationID_,
//         dataID_,
//         imgID_,
//         success,
//         error
//       );
//     }
//   };

//   // If the file saves failed
//   let fileSaveError = function (err) {
//     console.error(xhr);
//     console.error(err);
//     myself.alertUser("There was an error with saving. Please try again.", 3500);
//   };

//   // Start saving the files
//   myself.cloud.saveFile(formData, fileSaveSuccessful, fileSaveError);
// };

// // Logs the user in
// RhythmWheels.prototype.submitLogin = function () {
//   let myself = this;

//   // Grab a CSRF Token
//   this.cloud.getCSRFToken();

//   // Grab username and password
//   let username = $(constants.userName).val();
//   let password = $(constants.userPass).val();

//   // If validating the user was successful
//   let getUserSuccess = function (data) {
//     globals.userID = data.id;
//     globals.userName = data.username;
//     myself.cloud.userName = data.username;
//     myself.cloud.userID = data.id;

//     flags.loggedIn = true;
//     myself.alertUser(`Login was successful, ${globals.userName}`, 2000);
//     myself.updateLayout();
//     myself.updateProjectListing();
//   };

//   // If validating the user failed
//   let error = function (err) {
//     flags.loggedIn = false;
//     myself.alertUser(
//       "Your username or password was incorrect. Please try again.",
//       3500
//     );
//     console.error(err0);
//   };

//   // Log the user in and verify their information was correct
//   this.cloud.login(
//     username,
//     password,
//     function (data) {
//       myself.cloud.getUser(getUserSuccess, error);
//     },
//     error
//   );
// };

// // Logs the user out
// RhythmWheels.prototype.submitLogout = function () {
//   let myself = this;

//   this.cloud.getCSRFToken();

//   //If logout was successful
//   let success = function (data) {
//     globals.userID = "";
//     globals.userName = "";

//     myself.cloud.userID = "";
//     myself.cloud.userName = "";

//     flags.loggedIn = false;

//     myself.alertUser(`Logout was successful`, 2000);
//     myself.updateLayout();
//     myself.updateProjectListing();
//   };

//   // If logout failed
//   let error = function (err) {
//     console.error(err);
//   };

//   this.cloud.logout(success, error);
// };

// /**
//  * Handles and updates the project list
//  * @param {boolean} pullFromAPI Default is true to pull a new project list from API, false to append to current list
//  */
// RhythmWheels.prototype.updateProjectListing = function (pullFromAPI = true) {
//   let projectListDiv = document.getElementById(constants.project_list);

//   // First, double check if the user is logged in
//   if (globals.userID == "") {
//     // Reset project list for a non-logged in user
//     projectListDiv.innerHTML =
//       "<option selected>Sign in to view projects.</option>";
//     $(`#${constants.project_list}`).attr("disabled", true);
//     $(`#${constants.project_load_alert}`).attr("hidden", true);
//   } else {
//     //Reset project list for a project list update
//     $(`#${constants.project_load_alert}`).attr("hidden", false);
//     projectListDiv.innerHTML = "<option selected>Choose...</option>";

//     // Create a list from scratch
//     let createProjectList = function (projects) {
//       if (projects.length == 0) {
//         projectListDiv.innerHTML =
//           "<option selected>No projects found.</option>";
//       } else {
//         projectListDiv.innerHTML = "";

//         // projects will be sorted first here
//         projects.forEach(function (project) {
//           if (project.application == applicationID) {
//             let projectDiv = document.createElement("option");
//             projectDiv.innerText = project.name;
//             projectListDiv.appendChild(projectDiv);

//             projectDiv.value = project.id;
//             if (projectDiv.value == globals.projectID) {
//               let att = document.createAttribute("selected");
//               projectDiv.setAttributeNode(att);
//             }
//           }
//         });
//         // Adjust GUI elements for project load modal
//         $("<option selected>Choose...</option>").prependTo(
//           $(`#${constants.project_list}`)
//         );
//         $(`#${constants.project_list}`).attr("disabled", false);
//         $(`#${constants.project_load_alert}`).attr("hidden", true);
//       }
//     };

//     // Add to the list if they created a new project
//     let appendProjectList = function () {
//       let appendProjectDiv = document.createElement("option");
//       appendProjectDiv.innerText = globals.projectName;
//       projectListDiv.appendChild(appendProjectDiv);

//       appendProjectDiv.value = globals.projectID;

//       let att = document.createAttribute("selected");
//       appendProjectDiv.setAttributeNode(att);
//     };

//     // If there was an error with grabbing the project list
//     let error = function (err) {
//       console.error(err);
//     };

//     // if pulling the entire list of projects from api, create new list, else append to it
//     if (pullFromAPI) {
//       this.cloud.listProject(this.cloud.userID, createProjectList, error);
//     } else {
//       appendProjectList();
//     }
//   }
// };

// /**
//  * Allows you to create messages for the user (i.e. alerting them that they were successful in saving)
//  * @param {string} message What message do you want to display
//  * @param {number} timeout How long do you want to have the message active for (no number will keep it on the screen indefinitely)
//  */
// RhythmWheels.prototype.alertUser = function (message, timeout) {
//   $(constants.notificationMsg).html(message);
//   $(constants.notification).modal("show");

//   if (timeout > 0) {
//     setTimeout(function () {
//       $(constants.notification).modal("hide");
//     }, timeout);
//   }
// };

// // Based on the user's current login state, update the gui
// RhythmWheels.prototype.updateLayout = function () {
//   $(`.${constants.loading_overlay}`).attr("hidden", true);

//   let base = globals.userName == "" ? "LOGIN" : globals.userName.toUpperCase();
//   let loginURL = globals.userID != -1 ? "/users/" + globals.userID : "";

//   //Updates the login button
//   $(`#${constants.user_status}`).html(
//     "<i class='fas fa-user'></i>&nbsp; " + base
//   );

//   // Update login button functionality
//   if (flags.loggedIn) {
//     $(`#${constants.user_status}`).attr("href", loginURL);
//     $(`#${constants.user_status}`).attr("data-toggle", "");
//     $(`#${constants.user_status}`).attr("data-target", "");
//   } else {
//     $(`#${constants.user_status}`).removeAttr("href");
//     $(`#${constants.user_status}`).attr("data-toggle", "modal");
//     $(`#${constants.user_status}`).attr(
//       "data-target",
//       `#${constants.login_prompt}`
//     );
//   }

//   // Updates the logout button
//   $(`#${constants.logoutButton}`).attr("hidden", !flags.loggedIn);

//   // If the user is not logged in, this button appears to log the user in before saving to cloud
//   $(constants.loginToSaveButton).attr("hidden", flags.loggedIn);
//   $(`#${constants.save_new}`).attr("hidden", !flags.loggedIn);
//   $(`#${constants.save_updated}`).attr("hidden", !flags.loggedIn);

//   // If the user is not logged in, the projects are disabled and the login to load button appears
//   $(`#${constants.project_login_btn}`).attr("hidden", flags.loggedIn);
// };

// Creates a wheel to have users interact with their custom audio (aka the rap wheel) -Angela
// function RecordedAudioContainer() {
//   let _self = this;
//   let recordedHeader = document.createElement("h4");
//   recordedHeader.innerHTML = `Recording:`;
//   recordedHeader.classList.add("recorded-header");
//   let controlContainer = document.createElement("div");
//   controlContainer.classList.add("control-div");
//   controlContainer.appendChild(recordedHeader);
//   let sidebar = document.getElementById("wheelControls");

//   this.domelement = document.getElementById("audioWheelContainer");
//   let audioWheel = document.createElement("img");
//   audioWheel.setAttribute("src", "./img/audiowheel2.png");
//   audioWheel.style["width"] = "150px";
//   audioWheel.style["height"] = "150px";

//   audioWheel.setAttribute("id", "testrotate");

//   let audioWheelLoopSpan = document.createElement("span");
//   audioWheelLoopSpan.classList.add("repeat-label");
//   let audioWheelLoopCount = document.createElement("input");
//   audioWheelLoopCount.classList.add("recording_repeat_input");
//   audioWheelLoopCount.style["width"] = "2em";
//   audioWheelLoopCount.value = "1";
//   audioWheelLoopCount.addEventListener("keypress", function (event) {
//     if (!(event.charCode >= 48 && event.charCode <= 57)) {
//       event.preventDefault();
//       return false;
//     }
//   });
//   audioWheelLoopCount.addEventListener("keyup", function () {
//     interrupt();
//     if (audioWheelLoopCount.value) {
//       _self.loopCount = parseInt(audioWheelLoopCount.value);
//     }
//   });
//   audioWheelLoopSpan.appendChild(document.createTextNode("Repeat: "));
//   audioWheelLoopSpan.appendChild(audioWheelLoopCount);
//   this.domelement.appendChild(audioWheel);
//   // this.domelement.appendChild(audioWheelLoopSpan);
//   controlContainer.appendChild(audioWheelLoopSpan);
//   sidebar.appendChild(controlContainer);

//   _self.wheelImage = audioWheel;
//   _self.loopCount = 1;
//   _self.rotation = 0;
//   _self.isPlaying = false;
//   this.domelement.style.display = "none";
// }

// RecordedAudioContainer.prototype.update = function () {
//   if (this.isPlaying) {
//     // 2Pi divided by number of frames that will be rendered
//     let addedRotation = (Math.PI * 2.0) / (60.0 * globals.recordAudioDuration);
//     this.rotation += addedRotation;
//     if (this.rotation > this.loopCount * Math.PI * 2.0) {
//       this.isPlaying = false;
//       this.rotation = 0;
//     }
//     this.wheelImage.style.transform =
//       "rotate(" + (this.rotation * 180) / Math.PI + "deg)";
//   }
// };

// RecordedAudioContainer.prototype.stopRecordedAudio = function () {
//   this.isPlaying = false;
//   this.rotation = 0;
//   this.wheelImage.style.transform = "rotate(" + this.rotation + "deg)";
// };

// Cloud.prototype.init = function () {
//   // Check for current user
//   // Check for current project
//   this.userID = "";
//   this.userName = "";

//   this.getUser(
//     (data) => {
//       if (data.id == null) {
//         // If the get user response was successful, but they are not logged in
//         this.userID = "";
//         this.userName = "";
//         globals.userID = "";
//         globals.userName = "";
//         flags.loggedIn = false;
//       } else {
//         // If the get user response was successful, and they are logged in
//         this.userID = data.id;
//         this.userName = data.username;
//         globals.userID = data.id;
//         globals.userName = data.username;
//         flags.loggedIn = true;
//         this.checkForCurrentProject();
//       }
//       rw.updateLayout();
//       rw.updateProjectListing();
//     },
//     (err) => {
//       // Lack of internet connection, wrong password, other errors
//       console.error(err);
//       this.userID = "";
//       this.userName = "";
//       globals.userID = "";
//       globals.userName = "";
//       flags.loggedIn = false;
//       rw.updateLayout();
//     }
//   );
// };

// /** Use this to allow other API calls besides login */
// Cloud.prototype.getCSRFToken = function () {
//   /** gets a cookie of a specific type from the page
//       @param {String} name - should pretty much always be csrftoken
//       @return {String} - returns the cookie
//        */
//   function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie != "") {
//       const cookies = document.cookie.split(";");
//       for (let i = 0; i < cookies.length; i++) {
//         const cookie = jQuery.trim(cookies[i]);
//         // Does this cookie string begin with the name we want?
//         if (cookie.substring(0, name.length + 1) == name + "=") {
//           cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//           break;
//         }
//       }
//     }
//     return cookieValue;
//   }
//   const csrftoken = getCookie("csrftoken");

//   /** tests if this is csrf safe
//       @param {String} method - stests the given method
//       @return {Boolean} - is safe
//        */
//   function csrfSafeMethod(method) {
//     return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
//   }

//   /** test that a given url is a same-origin URL
//       @param {String} url - the URL to test
//       @return {Boolean} - is same origin
//        */
//   function sameOrigin(url) {
//     const host = document.location.host; // host + port
//     const protocol = document.location.protocol;
//     const srOrigin = "//" + host;
//     const origin = protocol + srOrigin;
//     return (
//       url == origin ||
//       url.slice(0, origin.length + 1) == origin + "/" ||
//       url == srOrigin ||
//       url.slice(0, srOrigin.length + 1) == srOrigin + "/" ||
//       !/^(\/\/|http:|https:).*/.test(url)
//     );
//   }

//   $.ajaxSetup({
//     beforeSend: function (xhr, settings) {
//       if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
//         xhr.setRequestHeader("X-CSRFToken", csrftoken);
//       }
//     },
//   });
// };

// /** Signed in, but don't know which user you are, call this
// @param {function} callBack - The return function
// @param {function} errorCallBack - If there is an error
// */
// Cloud.prototype.getUser = function (callBack, errorCallBack) {
//   $.ajax({
//     dataType: "json",
//     url: this.userAPIURL,
//     success: callBack,
//   }).fail(errorCallBack);
// };

// /** Get the list of projects for the current user, must be signed in
// @param {int} userID - ID of the number of user
// @param {function} callBack - The return function
// @param {function} errorCallBack - If there is an error
// */
// Cloud.prototype.listProject = function (userID, callBack, errorCallBack) {
//   $.get(this.projAPIURL + "?owner=" + userID, null, callBack, "json").fail(
//     errorCallBack
//   );
// };

// /** Already got a project, no problem, just load it with this function
// @param {int} projectID - ID of the number to be updated
// @param {function} callBack - The return function
// @param {function} errorCallBack - If there is an error
// */
// Cloud.prototype.loadProject = function (projectID, callBack, errorCallBack) {
//   $.get(this.projAPIURL + projectID + "/", null, function (data) {
//     $.get(data.project_url, null, function (proj) {
//       callBack(data, proj);
//     }).fail(errorCallBack);
//   }).fail(errorCallBack);
// };

// /** Update a project instead of making a new one
// @param {int} projectID - ID of the number to be updated
// @param {String} projectName - Name of your project
// @param {int} applicationID - The number of the application you're using
// @param {String} dataID - The file location from save file call back
// @param {String} imgID - The image file location important for viewing projects
// @param {function} callBack - The return function
// @param {function} errorCallBack - If there is an error
// */
// Cloud.prototype.updateProject = function (
//   projectID,
//   projectName,
//   applicationID,
//   dataID,
//   imgID,
//   callBack,
//   errorCallBack
// ) {
//   $.ajax({
//     type: "PUT",
//     url: this.projAPIURL + projectID + "/",
//     data: {
//       name: projectName,
//       description: "",
//       classroom: null,
//       application: applicationID,
//       project: dataID,
//       screenshot: imgID,
//     },
//     success: callBack,
//     dataType: "json",
//   }).fail(errorCallBack);
// };

// /** Make a project to be able to find your saved file again, returns the details
// of the project created, including ID for updating
// @param {String} projectName - Name of your project
// @param {int} applicationID - The number of the application you're using
// @param {String} dataID - The file location from save file call back
// @param {String} imgID - The image file location important for viewing projects
// @param {function} callBack - The return function
// @param {function} errorCallBack - If there is an error
// */
// Cloud.prototype.createProject = function (
//   projectName,
//   applicationID,
//   dataID,
//   imgID,
//   callBack,
//   errorCallBack
// ) {
//   $.post(
//     this.projAPIURL,
//     {
//       name: projectName,
//       description: "",
//       classroom: "",
//       application: applicationID,
//       project: dataID,
//       screenshot: imgID,
//     },
//     callBack,
//     "json"
//   ).fail(errorCallBack);
// };

// /** Saves a file to the server, save the ID for use with create / update project
// @param {String} file - The data to be uploaded
// @param {function} callBack - The returned function
// @param {function} errorCallBack - If there is an error
// */
// Cloud.prototype.saveFile = function (file, callBack, errorCallBack) {
//   $.ajax({
//     type: "PUT",
//     url: this.fileAPIURL,
//     data: file,
//     processData: false,
//     contentType: false,
//     success: callBack,
//   }).fail(errorCallBack);
// };

// /** Log in does what it sounds like, makes a post to the API to log you in,
// follow up with get CSRF or Get user data.
// @param {String} username - Username to log in with
// @param {String} password - Password to log in with
// @param {function} callBack - The returned function
// @param {function} errorCallBack - If there is an error
// */
// Cloud.prototype.login = function (username, password, callBack, errorCallBack) {
//   $.post(
//     this.loginUrl,
//     {
//       login: username,
//       password: password,
//     },
//     callBack
//   ).fail(errorCallBack);
// };

// /** Want to logout, no worries, you're not trapped anymore
// @param {function} callBack - The return function
// @param {function} errorCallBack - If there is an error
// */
// Cloud.prototype.logout = function (callBack, errorCallBack) {
//   $.post(this.logoutAPIURL, {}, callBack, "json").fail(errorCallBack);
// };

// // Check for a current project based on the config project id
// Cloud.prototype.checkForCurrentProject = function () {
//   try {
//     if (Number.isInteger(Number(config.project.id))) {
//       rw.loadFromCloud(config.project.id);
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

// // Update the url
// Cloud.prototype.updateURL = function (URL) {
//   if (window.history !== undefined && window.history.pushState !== undefined) {
//     window.history.pushState({}, "", "/projects/" + URL + "/run");
//   }
// };

// Useful functions
let captureMouseEvents = function (e) {
  preventGlobalMouseEvents();
  document.addEventListener("mouseup", mouseupListener, EventListenerMode);
  document.addEventListener("mousemove", mousemoveListener, EventListenerMode);
  e.preventDefault();
  e.stopPropagation();
};

// modified from stackoverflow - essential for fixing the cursor while
// dragging

let preventGlobalMouseEvents = function () {
  document.body.style["pointer-events"] = "none";
};

let restoreGlobalMouseEvents = function () {
  document.body.style["pointer-events"] = "auto";
};

let mousemoveListener = function (e) {
  e.stopPropagation();

  // flags.dragging.draggableSoundTileBase.style["left"] = e.clientX - 25 + "px";
  // flags.dragging.draggableSoundTileBase.style["top"] = e.clientY - 25 + "px";

  flags.dragging.setTileBeingDragged(e, true);
};

let mouseupListener = function (e) {
  restoreGlobalMouseEvents();
  document.removeEventListener("mouseup", mouseupListener, EventListenerMode);
  document.removeEventListener(
    "mousemove",
    mousemoveListener,
    EventListenerMode
  );
  e.stopPropagation();

  // flags.dragging.draggableSoundTileBase.style["display"] = "none";
  flags.dragging.setTileBeingDragged(e, false);

  document
    .elementFromPoint(e.clientX, e.clientY)
    .dispatchEvent(new DragEvent("drop"));
};

// let interrupt = function () {
//   if (flags.playing) rw.stopRhythm();
//   flags.modifiedSinceLastSave = true;
// };

// loads a rhythm wheels instance from a string
let load = (this.load = function (opts) {
  interrupt();

  let ref = {
    constants: constants,
    globals: globals,
    wc: rw.wheelsContainer,
  };
  ref.globals.incomingAudio = "";

  parser.parse(JSON.parse(opts), ref);

  $(`#${constants.tempo_slider_id}`).attr(
    "value",
    Math.log10(ref.globals.bpm / 120)
  );
  $(`#${constants.num_wheels_id}`).attr("value", ref.wc.wheelCount);

  if (ref.globals.incomingAudio != "") {
    let audioResult = dataURItoBlob(ref.globals.incomingAudio);
    rw.handleSavedAudio(audioResult);
  } else {
    rw.handleSavedAudio("");
  }
  rw.alertUser("Project loaded.", 1500);
});

// modified from stackoverflow - used to load files
let readSingleFile = function (e) {
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

    load(JSON.stringify(data));
  };
  reader.readAsText(file);
};

// from stackoverflow - for saving

let download = function (filename, text) {
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
};

let saveLocal = function () {
  download("save.rw", rw.generateString());
};

let saveNewProject = function () {};

let saveCurrentProject = function () {
  flags.newProject = false;
  $("#cloudSaving").modal("hide");
  rw.saveToCloud();
};

// let dataURItoBlob = function (dataURI, type) {
//   let binary;
//   if (dataURI.split(",")[0].indexOf("base64") >= 0)
//     binary = atob(dataURI.split(",")[1]);
//   else binary = unescape(dataURI.split(",")[1]);
//   //var binary = atob(dataURI.split(',')[1]);
//   let array = [];
//   for (var i = 0; i < binary.length; i++) {
//     array.push(binary.charCodeAt(i));
//   }
//   return new Blob([new Uint8Array(array)], {
//     type: type,
//   });
// };

this.rw = new RhythmWheels({
  sounds: catalog,
});

/**
 * Cloud Connections and overrides
 */

$(`#${cloudUI.signInSubmit}`).on("click", () => {
  csdtCloud.submitSignInRequest();
});

$(`#${cloudUI.signInPrompt}`).on("keydown", function (e) {
  var key = e.which || e.keyCode;
  if (key == 13) {
    csdtCloud.submitSignInRequest();
  }
});

$(`#${cloudUI.signOutSubmit}`).on("click", () => {
  csdtCloud.submitSignOutRequest();
});

$(`#${cloudUI.loadProjectSubmit}`).on("click", () => {
  csdtCloud.loadFromCloud(
    $(`#${cloudUI.loadProjectList}`).val(),
    loadBraidsFromJSON
  );
});

$(`#${cloudUI.saveProjectSubmit}`).on("click", () => {
  csdtCloud.setNewProjectStatus(true);
  csdtCloud.saveToCloud(saveObject, () => {
    console.log("callback function");
  });
});

$(`#${cloudUI.saveConfirmedSubmit}`).on("click", () => {
  csdtCloud.setNewProjectStatus(false);
  csdtCloud.saveToCloud(saveObject, () => {
    console.log("callback function");
  });
});
