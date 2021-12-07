let testingConstants = {
  download: "#testing-download",
};

let updateBasedOnSave = false;
let updateBasedOnLesson = true;

// For Testing Purposes
let isLocal = false;
let loggedInStatus = false;

function Workbook(curriculum = 0) {
  this.init(curriculum);
}

Workbook.prototype.init = function (curriculum) {
  let myself = this;

  // User
  this.workbookid = -1;
  this.userid = null;
  this.username = "";

  // Experimenting with save states
  this.lastModified = Date.now();
  this.lastCloudSave = "";

  // Init Workbook Type
  this.workbookVariant = 0; //Default to introduction
  this.currentLesson = 0;
  this.workbookLength = 0;

  // Init Workbook Data
  this.data = {};
  this.titles = [];
  this.sections = [];
  this.details = [];
  this.xmls = [];
  this.tags = [];

  // Init current
  this.responses = [];
  this.completed = 0;
  this.completedLastSave = 0;
  this.verified = false;

  // Get URL Parameters
  let urlParams = this.getURLParams();

  this.workbookVariant =
    urlParams === null ? 0 : urlParams[0] === -1 ? 0 : urlParams[0];
  this.workbookLength =
    urlParams === null ? 0 : urlParams[1] === -1 ? 0 : urlParams[1];
  this.currentLesson =
    urlParams === null ? 0 : urlParams[2] === -1 ? 0 : urlParams[2];

  // Set type of workbook
  this.curriculum = curriculum;

  // Get JSON
  if (this.curriculum === 0) {
    // Computer science
    this.workbookLocation =
      this.workbookVariant == 0
        ? csWorkbooks.intro.location
        : this.workbookVariant == 1
        ? csWorkbooks.loops.location
        : "";
    this.workbookName =
      this.workbookVariant == 0
        ? csWorkbooks.intro.name
        : this.workbookVariant == 1
        ? csWorkbooks.loops.name
        : "";

    $(appReferences.variantText).html(
      `${this.workbookName} -- Computer Science`
    );
  } else {
    //Math
    this.workbookLocation =
      this.workbookVariant == 0 ? mathWorkbooks.intro.location : "";
    this.workbookName =
      this.workbookVariant == 0 ? mathWorkbooks.intro.name : "";
    $(appReferences.variantText).html(`${this.workbookName} -- Math`);
  }

  // Get the workbook json
  $.ajax({
    type: "GET",
    url: `${this.workbookLocation}data.json`,
    dataType: "json",
    async: false,
    success: function (data) {
      myself.data = data;
    },
  });

  // Grabs all the information from the data.json and stores into arrays
  try {
    Object.keys(myself.data).some(function (name) {
      myself.sections.push({
        name: myself.data[name].name,
        lessons: myself.data[name].lessons,
      });
    });

    for (let i = 0; i < myself.sections.length; i++) {
      Object.keys(myself.sections[i].lessons).some(function (name) {
        myself.titles.push(myself.sections[i].lessons[name].title);
        myself.details.push(myself.sections[i].lessons[name].details);
        myself.xmls.push(myself.sections[i].lessons[name].project);
        myself.tags.push(myself.sections[i].lessons[name].tags);
      });
    }
  } catch (error) {
    console.log("Something Went Wrong...");
  }

  // Create side nav materials
  createLessonLinks(this);

  // Load initial lesson (if user is not logged in)
  if (this.username === "") {
    this.loadLesson(this.currentLesson);
  } else {
    console.log("user is logged in");
  }

  // Bind workbook functions to interface
  this.bindInterfaceButtons();
};

Workbook.prototype.getURLParams = function () {
  // Check for valid url parameters
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);

  if (urlParams != "") {
    let book = urlParams.has("book") ? parseInt(urlParams.get("book")) : -1;
    let length = urlParams.has("length")
      ? parseInt(urlParams.get("length"))
      : -1;
    let lesson = urlParams.has("lesson")
      ? parseInt(urlParams.get("lesson"))
      : -1;
    return [
      Number.isNaN(book) ? -1 : book,
      Number.isNaN(length) ? -1 : length,
      Number.isNaN(lesson) ? -1 : lesson,
    ];
  } else {
    return null;
  }
};

Workbook.prototype.bindInterfaceButtons = function () {
  let myself = this;

  // $(loginappReferences.loginText).bind("click", function (e) {
  //   let status = e.target.getAttribute("data-status");
  //   if (status == "login") {
  //     $(userInteractions.loginModal).modal("show");
  //   } else {
  //     console.log(myself.userid);
  //   }
  // });

  $(appReferences.prevButton).bind("click", function () {
    myself.prevStep();
  });
  $(appReferences.nextButton).bind("click", function (e) {
    myself.nextStep();
  });

  $("#save-exit").on("click", (e) => {
    download("workbook.json", JSON.stringify(workbook.serialize()));
  });

  // $(userInteractions.verify).bind("click", function (e) {
  //   myself.verified = true;
  //   $(userInteractions.validateField).removeClass(
  //     $(userInteractions.validateField).hasClass("is-invalid")
  //       ? "is-invalid"
  //       : ""
  //   );
  //   $(userInteractions.validateField).addClass(
  //     $(userInteractions.validateField).hasClass("is-valid") ? "" : "is-valid"
  //   );
  // });
  // $(userInteractions.login).bind("click", function (e) {
  //   myself.login();
  // });
  // $(appReferences.saveContinueBtn).bind("click", function (e) {
  //   myself.saveContinue();
  // });

  // $(userInteractions.passwordCheck).bind("click", function () {
  //   $("input:checked").length != 0
  //     ? $(userInteractions.passwordField).attr("type", "text")
  //     : $(userInteractions.passwordField).attr("type", "password");
  // });

  // $(appReferences.confirmBtn).bind("click", function () {
  //   myself.logout();
  // });
};

Workbook.prototype.loadResponses = function (userResponses) {
  if (userResponses != null) {
    this.responses = userResponses["responses"];

    let timestamp = userResponses["timestamp"];

    let date = new Date(timestamp);

    this.lastCloudSave = date.toLocaleString("en-US", {
      timeZoneName: "short",
    });

    $(userInteractions.userInput).val(this.responses[this.currentLesson]);

    for (let i = 0; i < this.responses.length; i++) {
      if (this.responses[i] !== "" || typeof this.responses[i] == "number") {
        $(`#l-${i} .col-1 div`).removeClass("w-pending");
        $(`#l-${i} .col-1 div`).addClass("w-finished");
        this.completed++;
      }
    }
  } else {
    this.completed = 0;
    this.completedLastSave = 0;
    this.verified = false;

    // Clear responses and reset navigation
    for (let i = 0; i < this.responses.length; i++) {
      this.responses[i] = "";
      $(`#l-${i} .col-1 div`).removeClass(
        $(`#l-${i} .col-1 div`).hasClass("w-finished") ? "w-finished" : ""
      );
      $(`#l-${i} .col-1 div`).addClass(
        $(`#l-${i} .col-1 div`).hasClass("w-pending") ? "" : "w-pending"
      );
    }
    this.updateUserProgress(0);
    this.updateSaveStatus();
    $(userInteractions.userInput).val(this.responses[this.currentLesson]);
  }
};

Workbook.prototype.updateUserProgress = function (
  previous,
  current = this.currentLesson + 1
) {
  // Check current completed responses
  let updatedCount = 0;
  for (let i = 0; i < this.responses.length; i++) {
    if (this.responses[i] !== "") {
      updatedCount++;
    }
  }

  this.completedLastSave =
    this.completedLastSave + (updatedCount - this.completed);

  this.completed = updatedCount;

  $(appReferences.progressBar).attr(
    "aria-valuenow",
    parseInt(this.completed / this.titles.length) * 100
  );
  $(appReferences.progressBar).css(
    "width",
    parseInt((this.completed / this.titles.length) * 100) + "%"
  );

  $(appReferences.lessonText).html(`${this.completed}`);

  $(`#l-${previous} .col-1 div`).removeClass("w-link");
  $(`#l-${previous} .col-1 div`).addClass(
    this.responses[previous] === "" ? "w-pending" : "w-finished"
  );
  $(`#l-${this.currentLesson} .col-1 div`).removeClass(
    $(`#l-${this.currentLesson} .col-1 div`).hasClass("w-pending")
      ? "w-pending"
      : ""
  );
  $(`#l-${this.currentLesson} .col-1 div`).addClass("w-link");

  for (let j = 0; j < this.sections.length; j++) {
    let sectionLessons = parseInt($(`#status-${j}`).attr("data-lessons"));
    let completed = document.querySelectorAll(
      `#section-${j} div.row div.col-1 div.w-finished`
    ).length;

    let percentage = parseInt((completed / sectionLessons) * 100);

    $(`#status-${j}`).attr("style", `--value:${percentage}`);
    $(`#status-${j}`).attr("aria-valuenow", `${percentage}`);
  }
};

Workbook.prototype.updateSaveStatus = function (saved = false) {
  let difference = Date.now() - this.lastModified;
  let minutes = Math.floor(difference / 60000);
  let seconds = ((difference % 60000) / 1000).toFixed(0);

  if (this.userid === null) {
    $(appReferences.autosaveText).html(`Log in to save your work.`);
  } else {
    if (this.completedLastSave > 0) {
      $(appReferences.autosaveText).html(`You have unsaved changes.`);
    } else {
      if (saved) {
        this.lastModified = Date.now();
        $(appReferences.autosaveText).html(`Workbook has been saved.`);
      } else {
        if (this.lastCloudSave !== "") {
          $(appReferences.autosaveText).html(
            `Last saved: ${this.lastCloudSave}`
          );
        } else {
          $(appReferences.autosaveText).html(
            `Last saved ${minutes} minutes ago`
          );
        }
      }
    }
  }
};

Workbook.prototype.loadProjectXML = function (num) {
  let xml;
  let myself = this;
  // $(appReferences.loadingScreen).attr('hidden', true);

  if (this.xmls[num] !== "") {
    if ($(`${tagOptions.csnap}`).attr("hidden")) {
      console.log("CSnap is not included with this lesson...");
    } else {
      // Load in xml for csnap step
      fetch(this.xmls[num])
        .then((response) => response.text())
        .then((data) => {
          xml = data;
          try {
            let iframe = document.querySelector("iframe");
            let world = iframe.contentWindow.world;
            let ide = world.children[0];
            console.log("enter");
            ide.loadWorkbookFile(data);
            // this.loadBase = false;
          } catch (e) {
            console.log(e);
            // Frame has not fully loaded, so once its done loading, try again.. (might need to redo later...)
            $(tagOptions.csnap).on("load", function () {
              myself.loadProjectXML(num);
            });
          }
        });
    }
  }
};

Workbook.prototype.loadTags = function (tagStr) {
  $(`${tagOptions.response}`).attr("hidden", !tagStr.includes("response"));
  $(`${tagOptions.csnap}`).attr("hidden", !tagStr.includes("csnap"));

  // Introduction (Interactive for Selecting Background Section)
  $(`${tagOptions.homepage}`).attr("hidden", !tagStr.includes("homepage"));

  // Introduction (Checking login status)
  $(`${tagOptions.login}`).attr("hidden", !tagStr.includes("login"));

  $(appReferences.lessonInformation).attr(
    "hidden",
    !$(`${tagOptions.login}`).attr("hidden") ||
      !$(`${tagOptions.homepage}`).attr("hidden")
  );

  if (tagStr.includes("homepage")) {
    $(`${appReferences.interHomePrompt}`).attr("hidden", false);
    $(`${appReferences.standardPrompt}`).attr("hidden", true);
  } else {
    $(`${appReferences.interHomePrompt}`).attr("hidden", true);
    $(`${appReferences.standardPrompt}`).attr("hidden", false);
  }
};

Workbook.prototype.loadLesson = function (num, clear = true) {
  let myself = this;
  let previous = myself.currentLesson;

  myself.saveCurrentResponse(clear);

  myself.currentLesson = num;

  loadLessonDescription(myself);

  if ($(tagOptions.response).attr("hidden") != false) {
    $(userInteractions.userInput).val(myself.responses[myself.currentLesson]);
  }
  updateLessonProgression(myself, previous);
  // myself.updateUserProgress(previous);

  myself.updateSaveStatus();

  myself.loadTags(myself.tags[myself.currentLesson]);

  myself.loadProjectXML(myself.currentLesson);

  updateURLParameters(myself, myself.currentLesson);
};

function loadLessonDescription(book) {
  let myself = book;
  $(appReferences.lessonSubtitle).html(`Lesson ${myself.currentLesson + 1}: `);
  $(appReferences.lessonCounter).html(`${myself.titles.length}`);
  $(appReferences.lessonTitle).html(`${myself.titles[myself.currentLesson]}`);
  $(appReferences.lessonInformation).html(
    `${myself.details[myself.currentLesson]}`
  );
  $(appReferences.lessonTotalDisplay).html(
    `Lesson ${myself.currentLesson + 1} / ${myself.titles.length}`
  );
}

function updateURLParameters(book, num) {
  let myself = book;
  if (history.pushState) {
    var newurl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      `?book=${myself.workbookVariant}&lesson=${num}`;
    window.history.pushState(
      {
        path: newurl,
      },
      "",
      newurl
    );
  }
}

function updateLessonProgression(book, lesson) {
  let myself = book;

  let previousText = document.querySelector(`#l-${lesson} .col-10 p`).innerHTML;
  let currentText = document.querySelector(
    `#l-${book.currentLesson} .col-10 p`
  ).innerHTML;

  previousText = previousText.replace("<b>", "").replace("</b>", "");
  previousText = previousText.replace("<s>", "").replace("</s>", "");

  if (myself.responses[lesson] != "") {
    previousText = `<s>${previousText}</s>`;
  } else {
    previousText = previousText.replace("<s>", "").replace("</s>", "");
  }

  document.querySelector(`#l-${lesson} .col-10 p`).innerHTML = previousText;

  document.querySelector(
    `#l-${book.currentLesson} .col-10 p`
  ).innerHTML = `<b>${currentText}</b>`;
  updateLessonPercentage(myself);
}

function updateLessonPercentage(book) {
  let sections = document.querySelectorAll(".workbook-collapse.collapse");

  for (let i = 0; i < sections.length; i++) {
    let sectionLessons = parseInt($(`#status-${i}`).attr("data-lessons"));

    let count = document.querySelectorAll(
      `#section-${[i]} .row .col-10 p s`
    ).length;

    let percentage = parseInt((count / sectionLessons) * 100);

    $(`#status-${i}`).attr("style", `--value:${percentage}`);
    $(`#status-${i}`).attr("aria-valuenow", `${percentage}`);
  }
  book.completed = document.querySelectorAll(`.row .col-10 p s`).length;
  $(appReferences.lessonText).html(book.completed);

  $(appReferences.progressBar).attr(
    "aria-valuenow",
    parseInt(book.completed / book.titles.length) * 100
  );
  $(appReferences.progressBar).css(
    "width",
    parseInt((book.completed / book.titles.length) * 100) + "%"
  );
}

Workbook.prototype.prevStep = function () {
  if (this.currentLesson == 0) {
    alert("No more lessons");
    endWorkbook(this);
  } else {
    let num = this.currentLesson - 1;
    this.loadLesson(num);
  }
};

Workbook.prototype.nextStep = function () {
  if (this.currentLesson == this.titles.length - 1) {
    alert("No more lessons");
    endWorkbook(this);
  } else {
    let num = this.currentLesson + 1;
    this.loadLesson(num);
  }
};

Workbook.prototype.serialize = function () {
  let responses = [];

  for (let i = 0; i < this.titles.length; i++) {
    if (this.responses[i] == null) {
      responses[i] = "";
    } else {
      responses[i] = this.responses[i];
    }
  }
  return {
    id: this.workbookid,
    owner: currentUser.id,
    workbook: this.workbookVariant,
    responses: responses,
    timestamp: Date.now(),
  };
};

Workbook.prototype.saveCurrentResponse = function (clear = false) {
  let response = "";

  if (document.getElementById("interactive-login").hidden == false) {
    this.verified == true ? (response = "verified") : (response = "");
    this.responses[this.currentLesson] = response;

    return;
  }

  if ($(tagOptions.response).attr("hidden") != false) {
    response = $(userInteractions.userInput).val();

    this.responses[this.currentLesson] = response;

    if (clear) {
      $(userInteractions.userInput).val("");
    }
  } else {
    alert("uncaught save current response");
  }
};

Workbook.prototype.saveExit = function () {};

Workbook.prototype.saveContinue = function () {
  this.responses[this.currentLesson] = $(userInteractions.userInput).val();

  if (isLocal) {
    download("workbook.json", JSON.stringify(this.serialize()));
    this.completedLastSave = 0;
    this.updateSaveStatus(true);
  }
};

/**
 * Download a text string as a file
 * Adapted from
 * https://github.com/CSDTs/CSDT_Single_Page/blob/master/Rhythm%20Wheels/rhythm_wheels.js
 * @param {string} filename
 * @param {string} text
 */
function download(filename, text) {
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

Workbook.prototype.load = function () {
  console.log("Loading cloud save -- Need to add model to django...");
  let fileLocation = `../workbooks/testing/workbook.json`;
  if (loggedInStatus) {
    console.log("Loading local save");
    fetch(fileLocation)
      .then((response) => response.json())
      .then((jsonResponse) => (obj = jsonResponse))
      .then(() => this.loadResponses(obj))
      .then(() => this.loadLesson(this.currentLesson))
      .then(() => $(appReferences.loadingScreen).attr("hidden", true))
      .catch(() => this.updateGUI(false));
  } else {
    console.log("Loading local save (no save available)");
    $(appReferences.loadingScreen).attr("hidden", true);
    this.loadResponses(null);
  }
};

Workbook.prototype.loadLocal = function () {
  let fileLocation = `../workbooks/testing/workbook.json`;
  if (loggedInStatus) {
    console.log("Loading local save");
    fetch(fileLocation)
      .then((response) => response.json())
      .then((jsonResponse) => (obj = jsonResponse))
      .then(() => this.loadResponses(obj))
      .then(() => this.loadLesson(this.currentLesson))
      .then(() => $(appReferences.loadingScreen).attr("hidden", true))
      .catch(() => this.updateGUI(false));
  } else {
    console.log("Loading local save (no save available)");
    $(appReferences.loadingScreen).attr("hidden", true);
    this.loadResponses(null);
  }
};

Workbook.prototype.updateGUI = function (isLoggedIn) {
  $(userInteractions.userInput).attr("disabled", !isLoggedIn);
  $(appReferences.loadingScreen).attr("hidden", true);
};

function initApplication() {
  initCloudServices();
  workbook = new Workbook(0);
  setLoadingOverlay(true, false);
}

function endWorkbook(book) {
  response = $(userInteractions.userInput).val();
  book.responses[book.currentLesson] = response;

  let currentText = document.querySelector(
    `#l-${book.currentLesson} .col-10 p`
  ).innerHTML;

  currentText = currentText.replace("<b>", "").replace("</b>", "");
  currentText = currentText.replace("<s>", "").replace("</s>", "");

  if (response != "") {
    currentText = `<s>${currentText}</s>`;
  } else {
    currentText = currentText.replace("<s>", "").replace("</s>", "");
  }

  document.querySelector(`#l-${book.currentLesson} .col-10 p`).innerHTML =
    currentText;

  document.querySelector(
    `#l-${book.currentLesson} .col-10 p`
  ).innerHTML = `<b>${currentText}</b>`;

  updateLessonPercentage(book);
}
