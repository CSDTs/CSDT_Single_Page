function loadRWFile(opts) {
  rw.stopRhythm();

  globals.outgoingAudio = "";

  parser.parse(JSON.parse(opts));

  document.getElementById(appReferences.tempoSlider).value = Math.log10(
    globals.bpm / 120
  );

  document.querySelector(
    `#${appReferences.numOfWheels} [value="` +
      rw.wheelsContainer.wheelCount +
      '"]'
  ).selected = true;

  if (globals.outgoingAudio != "") {
    let audioResult = dataURItoBlob(globals.outgoingAudio);
    rw.rapWheel.processSavedAudio(audioResult);
  } else {
    rw.rapWheel.processSavedAudio("");
  }
}
