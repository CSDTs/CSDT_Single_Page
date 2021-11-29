/* eslint-disable */
/* eslint-disable padded-blocks */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable prefer-let */
/* eslint-disable space-before-function-parent*/

// Application ID attached to Rhythm Wheels

// modified from stackoverflow - essential for fixing the cursor while
// dragging
// Useful functions
function captureMouseEvents(e) {
  preventGlobalMouseEvents();
  document.addEventListener("mouseup", mouseupListener, EventListenerMode);
  document.addEventListener("mousemove", mousemoveListener, EventListenerMode);
  e.preventDefault();
  e.stopPropagation();
}

function preventGlobalMouseEvents() {
  document.body.style["pointer-events"] = "none";
}

function restoreGlobalMouseEvents() {
  document.body.style["pointer-events"] = "auto";
}

function mousemoveListener(e) {
  e.stopPropagation();

  flags.dragging.draggableSoundTileBase.style["left"] = e.clientX - 25 + "px";
  flags.dragging.draggableSoundTileBase.style["top"] = e.clientY - 25 + "px";

  flags.dragging.setTileBeingDragged(e, true);
}

function mouseupListener(e) {
  restoreGlobalMouseEvents();
  document.removeEventListener("mouseup", mouseupListener, EventListenerMode);
  document.removeEventListener(
    "mousemove",
    mousemoveListener,
    EventListenerMode
  );
  e.stopPropagation();

  flags.dragging.draggableSoundTileBase.style["display"] = "none";
  flags.dragging.setTileBeingDragged(e, false);

  document
    .elementFromPoint(e.clientX, e.clientY)
    .dispatchEvent(new DragEvent("drop"));
}

function initApplication() {
  initCloudServices();
  rw = new RhythmWheels({
    sounds: catalog,
  });
  setLoadingOverlay(true, false);
}

// Init the application
initApplication();
