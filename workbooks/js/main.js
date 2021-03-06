window.cloud = new CloudSaver();

let constants = {
    variantText: '.wb-variant',
    lengthText: '.wb-length',
    lessonText: '.wb-lesson',
    lessonCounter: '.wb-lesson-total',
    lessonTitle: '.wb-title',
    lessonInformation: '.wb-info',
    progressBar: '.progress-bar',
    lessonNav: 'wb-lesson-links',
    loadingScreen: '.loading-overlay',
    prevButton: '.prev',
    nextButton: '.next',
    lessonSubtitle: '.wb-lesson-title',
    lessonTotalDisplay: '.step-h',
    saveContinueBtn: '#save-continue',
    autosaveText: '.autosave-text',
    standardPrompt: '#standard-prompt',
    interHomePrompt: '#interactive-homepage-prompt ',
    confirmModal: '#confirmation',
    confirmBtn: '#confirm-btn',
    confirmText: '#confirm-body',
    notification: '#notification',
    notificationMsg: '#notification-msg'
}

let loginConstants = {
    loginLogout: '#login-logout',
    loginText: '#login-nav',
    logoutText: '#logout-nav'
}

let csWorkbooks = {
    intro: {
        name: 'Introduction',
        location: './computerscience/introduction/',
    },
    loops: {
        name: 'Loops',
        location: './computerscience/loops/'
    }
}

let mathWorkbooks = {
    intro: {
        name: 'Introduction',
        location: './computerscience/introduction/',
    },
}

let tagOptions = {
    response: '.response-div',
    csnap: '#csnap-pro',
    homepage: '#interactive-homepage',
    login: '#interactive-login'
}

let userInteractions = {
    userInput: '#user-response',
    verify: '#interactive-verification',
    login: '#interactive-signin',
    passwordCheck: '#passCheck',
    passwordField: '#userPassword',
    usernameField: '#userName',
    validateField: '.interactive-login-field',
    loginModal: '#loginModal'

}

let testingConstants = {
    download: '#testing-download'
}

let updateBasedOnSave = false;
let updateBasedOnLesson = true;



// For Testing Purposes
let isLocal = false;
let loggedInStatus = false;



function Workbook(curriculum = 0) {
    this.init(curriculum);

}
function Cloud() {

    this.projAPIURL = '/api/projects/';
    this.fileAPIURL = '/api/files/';
    this.loginUrl = '/accounts/login/';
    this.loadProjURL = '/projects/';
    this.userAPIURL = '/api/user';
    this.logoutAPIURL = '/accounts/logout/';


    this.getCSRFToken();
    this.init();
}

Workbook.prototype.init = function (curriculum) {

    let myself = this;

    // User
    this.workbookid = -1;
    this.userid = null;
    this.username = '';

    // Experimenting with save states
    this.lastModified = Date.now();
    this.lastCloudSave = '';

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

    this.workbookVariant = urlParams === null ? 0 : (urlParams[0] === -1 ? 0 : urlParams[0]);
    this.workbookLength = urlParams === null ? 0 : (urlParams[1] === -1 ? 0 : urlParams[1]);
    this.currentLesson = urlParams === null ? 0 : (urlParams[2] === -1 ? 0 : urlParams[2]);

    // Set type of workbook
    this.curriculum = curriculum;

    // Get JSON 
    if (this.curriculum === 0) {
        // Computer science
        this.workbookLocation = (this.workbookVariant == 0 ? csWorkbooks.intro.location :
            (this.workbookVariant == 1 ? csWorkbooks.loops.location : ''));
        this.workbookName = (this.workbookVariant == 0 ? csWorkbooks.intro.name :
            (this.workbookVariant == 1 ? csWorkbooks.loops.name : ''));

        $(constants.variantText).html(`${this.workbookName} -- Computer Science`);
    } else {
        //Math
        this.workbookLocation = (this.workbookVariant == 0 ? mathWorkbooks.intro.location : '');
        this.workbookName = (this.workbookVariant == 0 ? mathWorkbooks.intro.name : '');
        $(constants.variantText).html(`${this.workbookName} -- Math`);

    }

    // Get the workbook json 
    $.ajax({
        type: 'GET',
        url: `${this.workbookLocation}data.json`,
        dataType: 'json',
        async: false,
        success: function (data) {
            myself.data = data;

        }
    });


    // Grabs all the information from the data.json and stores into arrays
    try {
        Object.keys(myself.data).some(function (name) {
            myself.sections.push({
                name: myself.data[name].name,
                lessons: myself.data[name].lessons
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
        console.log('Something Went Wrong...')
    }

    // Check user login status
    cloud.getUser((response) => myself.updateUesrStatus(response, () => myself.load()), (error) => myself.updateUesrStatus(error.status, () => myself.loadLocal()));

    // Create side nav materials
    this.createLessonLinks();

    // Load initial lesson (if user is not logged in)
    if (this.username === '') {
        this.loadLesson(this.currentLesson);
    } else {
        console.log('user is logged in')
    }

    // Bind workbook functions to interface
    this.bindInterfaceButtons();


}



Workbook.prototype.getURLParams = function () {
    // Check for valid url parameters
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);

    if (urlParams != '') {
        let book = urlParams.has('book') ? parseInt(urlParams.get('book')) : -1;
        let length = urlParams.has('length') ? parseInt(urlParams.get('length')) : -1;
        let lesson = urlParams.has('lesson') ? parseInt(urlParams.get('lesson')) : -1;
        return [Number.isNaN(book) ? -1 : book, Number.isNaN(length) ? -1 : length, Number.isNaN(lesson) ? -1 : lesson];
    } else {
        return null;
    }
}
Workbook.prototype.bindInterfaceButtons = function () {

    let myself = this;


    $(loginConstants.loginText).bind('click', function (e) {
        let status = e.target.getAttribute('data-status');
        if (status == 'login') {
            $(userInteractions.loginModal).modal('show');
        } else {
            console.log(myself.userid);
        }

    });
    $(constants.prevButton).bind('click', function () {
        myself.prevStep();
    });
    $(constants.nextButton).bind('click', function (e) {
        myself.nextStep();
    });

    $(testingConstants.download).bind('click', function (e) {
        download('workbook.json', JSON.stringify(myself.serialize()));
    });

    $(userInteractions.verify).bind('click', function (e) {
        myself.verified = true;
        $(userInteractions.validateField).removeClass($(userInteractions.validateField).hasClass('is-invalid') ? 'is-invalid' : '');
        $(userInteractions.validateField).addClass($(userInteractions.validateField).hasClass('is-valid') ? '' : 'is-valid');
    })
    $(userInteractions.login).bind('click', function (e) {
        myself.login()
    })
    $(constants.saveContinueBtn).bind('click', function (e) {
        myself.saveContinue()
    })


    $(userInteractions.passwordCheck).bind("click", function () {
        $("input:checked").length != 0 ? $(userInteractions.passwordField).attr('type', 'text') : $(userInteractions.passwordField).attr('type', 'password');
    });

    $(constants.confirmBtn).bind('click', function () {
        myself.logout();
    });

}


Workbook.prototype.updateUesrStatus = function (response, callback) {
    let myself = this;

    let loginTemplate = `<i class="far fa-user user-ind" ></i>&nbsp; Login</a>`;
    let loggedInTemplate = ``;

    if (response === 404) {
        // Internet issue / errror (in this case, testing locally)
        if (loggedInStatus) {
            this.workbookid = 1;
            this.userid = 0;
            this.username = 'localhost';
        }
    } else {
        if (response.id != null) {
            // Logged into CSDT
            loggedInStatus = true;
            this.workbookid = 1;
            this.userid = response.id;
            this.username = response.username;
        }
        // else, not logged in
    }

    loggedInTemplate = `<i class="fas fa-user grey-csdt" ></i>&nbsp; ${myself.username}</a>`;
    $(loginConstants.loginText).html(myself.userid == null ? loginTemplate : loggedInTemplate);
    $(loginConstants.loginText).attr('data-status', myself.userid == null ? 'login' : myself.userid);

    $(loginConstants.logoutText).attr('hidden', myself.userid == null);
    $(userInteractions.validateField).attr('placeholder', myself.username);

    callback();

}





Workbook.prototype.loadResponses = function (userResponses) {

    if (userResponses != null) {
        this.responses = userResponses["responses"];

        let timestamp = userResponses["timestamp"];

        let date = new Date(timestamp);

        this.lastCloudSave = date.toLocaleString("en-US", {
            timeZoneName: "short"
        });

        $(userInteractions.userInput).val(this.responses[this.currentLesson]);


        for (let i = 0; i < this.responses.length; i++) {
            if (this.responses[i] !== "" || typeof this.responses[i] == "number") {
                $(`#l-${i} .col-1 div`).removeClass('w-pending');
                $(`#l-${i} .col-1 div`).addClass('w-finished');
                this.completed++;
            }
        }

    } else {
        this.completed = 0;
        this.completedLastSave = 0;
        this.verified = false;

        // Clear responses and reset navigation
        for (let i = 0; i < this.responses.length; i++) {
            this.responses[i] = '';
            $(`#l-${i} .col-1 div`).removeClass($(`#l-${i} .col-1 div`).hasClass('w-finished') ? 'w-finished' : '');
            $(`#l-${i} .col-1 div`).addClass($(`#l-${i} .col-1 div`).hasClass('w-pending') ? '' : 'w-pending');
        }
        this.updateUserProgress(0);
        this.updateSaveStatus();
        $(userInteractions.userInput).val(this.responses[this.currentLesson]);
    }
}

Workbook.prototype.createLessonLinks = function () {


    let myself = this;
    let lessonCounter = 0;

    let lessonCollapse = document.createElement("DIV");
    lessonCollapse.classList.add('accordion');
    lessonCollapse.id = 'workbookNav';


    document.getElementById('wb-lesson-links').appendChild(lessonCollapse);

    for (let i = 0; i < myself.sections.length; i++) {
        let sectionHeader = document.createElement("DIV");
        sectionHeader.classList.add('section-header');

        let sectionHeaderTitle = document.createElement("H4");
        sectionHeaderTitle.setAttribute("data-toggle", "collapse");
        sectionHeaderTitle.setAttribute("data-target", `#section-${i}`);
        sectionHeaderTitle.setAttribute("aria-expanded", "false");
        sectionHeaderTitle.setAttribute("aria-controls", `#section-${i}`);
        sectionHeaderTitle.classList.add('workbook-header')

        sectionHeaderTitle.innerHTML = `Section ${i+1}: ${myself.sections[i].name}`;

        sectionHeader.appendChild(sectionHeaderTitle);

        lessonCollapse.appendChild(sectionHeader);
        let sectionContainer = document.createElement("DIV");
        sectionContainer.classList.add('collapse', 'workbook-collapse');
        sectionContainer.setAttribute('data-parent', "#workbookNav");
        sectionContainer.id = `section-${i}`;


        let sectionStatus = document.createElement("SPAN");
        // sectionStatus.classList.add('float-right');
        sectionStatus.innerHTML = '0%';
        sectionStatus.id = `status-${i}`;
        sectionStatus.setAttribute('data-lessons', Object.keys(myself.sections[i].lessons).length);
        sectionStatus.classList.add('workbook-subheader');
        sectionHeader.appendChild(sectionStatus);

        for (const property in myself.sections[i].lessons) {
            let cl = lessonCounter;
            let title = `Lesson ${lessonCounter + 1}: ${myself.sections[i].lessons[property].title}`;
            let lessonContainer = document.createElement("DIV");

            lessonContainer.classList.add('row', 'workbook-collapse-row');

            let leftSide = document.createElement("DIV");
            let rightSide = document.createElement("DIV");

            leftSide.classList.add('col-1', 'align-self-center');
            rightSide.classList.add('col-10');

            // Add something that reads from user file to assign proper status
            let status = document.createElement("DIV");
            status.classList.add('mx-auto', (lessonCounter) === myself.currentLesson ? 'w-link' : 'w-pending');
            if ((lessonCounter) === myself.currentLesson) {
                sectionContainer.classList.add('show');
                sectionHeaderTitle.setAttribute('aria-expanded', true);
            }
            let lessonName = document.createElement("P");
            lessonName.classList.add('workbook-lesson');
            lessonName.innerHTML = title;

            leftSide.appendChild(status);
            rightSide.appendChild(lessonName);

            lessonContainer.appendChild(leftSide);
            lessonContainer.appendChild(rightSide);

            lessonContainer.id = `l-${cl}`;

            lessonContainer.addEventListener('click', () => {
                this.loadLesson(cl);
            })

            sectionContainer.appendChild(lessonContainer);
            lessonCounter++;
        }

        lessonCollapse.appendChild(sectionContainer);

    }



}

Workbook.prototype.updateUserProgress = function (previous, current = this.currentLesson + 1) {

    // Check current completed responses
    let updatedCount = 0;
    for (let i = 0; i < this.responses.length; i++) {
        if (this.responses[i] !== "") {
            updatedCount++;

        }
    }

    this.completedLastSave = this.completedLastSave + (updatedCount - this.completed);

    this.completed = updatedCount;


    $(constants.progressBar).attr('aria-valuenow', parseInt((this.completed) / this.titles.length) * 100);
    $(constants.progressBar).css('width', parseInt(((this.completed) / this.titles.length) * 100) + '%');

    $(constants.lessonText).html(`${this.completed}`);

    $(`#l-${previous} .col-1 div`).removeClass('w-link');
    $(`#l-${previous} .col-1 div`).addClass(this.responses[previous] === "" ? 'w-pending' : 'w-finished');
    $(`#l-${this.currentLesson} .col-1 div`).removeClass($(`#l-${this.currentLesson} .col-1 div`).hasClass('w-pending') ? 'w-pending' : '');
    $(`#l-${this.currentLesson} .col-1 div`).addClass('w-link');

    for (let j = 0; j < this.sections.length; j++) {
        let sectionLessons = parseInt($(`#status-${j}`).attr('data-lessons'));
        let completed = document.querySelectorAll(`#section-${j} div.row div.col-1 div.w-finished`).length;

        let percentage = parseInt((completed / sectionLessons) * 100);

        $(`#status-${j}`).html(`${percentage}%`);
    }


}

Workbook.prototype.updateURLParameters = function (num) {

    if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?book=${this.workbookVariant}&lesson=${num}`;
        window.history.pushState({
            path: newurl
        }, '', newurl);
    }

}

Workbook.prototype.updateSaveStatus = function (saved = false) {

    let difference = Date.now() - this.lastModified;
    let minutes = Math.floor(difference / 60000);
    let seconds = ((difference % 60000) / 1000).toFixed(0);

    if (this.userid === null) {
        $(constants.autosaveText).html(`Log in to save your work.`);
    } else {
        if (this.completedLastSave > 0) {
            $(constants.autosaveText).html(`You have unsaved changes.`);
        } else {
            if (saved) {
                this.lastModified = Date.now();
                $(constants.autosaveText).html(`Workbook has been saved.`);
            } else {
                if (this.lastCloudSave !== '') {
                    $(constants.autosaveText).html(`Last saved: ${this.lastCloudSave}`);
                } else {
                    $(constants.autosaveText).html(`Last saved ${minutes} minutes ago`);
                }

            }

        }
    }




}

Workbook.prototype.loadProjectXML = function (num) {

    let xml;
    let myself = this;
    // $(constants.loadingScreen).attr('hidden', true);


    if (this.xmls[num] !== "") {

        if ($(`${tagOptions.csnap}`).attr('hidden')) {
            console.log('CSnap is not included with this lesson...');
        } else {
            // Load in xml for csnap step
            fetch(this.xmls[num])
                .then(response => response.text())
                .then(data => {
                    xml = data;
                    try {
                        let iframe = document.querySelector('iframe');
                        let world = iframe.contentWindow.world;
                        let ide = world.children[0];
                        console.log('enter');
                        ide.loadWorkbookFile(data);
                        // this.loadBase = false;

                    } catch (e) {
                        console.log(e);
                        // Frame has not fully loaded, so once its done loading, try again.. (might need to redo later...)
                        $(tagOptions.csnap).on('load', function () {
                            myself.loadProjectXML(num);
                        })
                    }
                });
        }


    }
}

Workbook.prototype.loadTags = function (tagStr) {

    $(`${tagOptions.response}`).attr('hidden', !tagStr.includes('response'));
    $(`${tagOptions.csnap}`).attr('hidden', !tagStr.includes('csnap'));

    // Introduction (Interactive for Selecting Background Section)
    $(`${tagOptions.homepage}`).attr('hidden', !tagStr.includes('homepage'));

    // Introduction (Checking login status)
    $(`${tagOptions.login}`).attr('hidden', !tagStr.includes('login'));

    if (tagStr.includes('homepage')) {
        $(`${constants.interHomePrompt}`).attr('hidden', false);
        $(`${constants.standardPrompt}`).attr('hidden', true);
    } else {
        $(`${constants.interHomePrompt}`).attr('hidden', true);
        $(`${constants.standardPrompt}`).attr('hidden', false);
    }
}

Workbook.prototype.loadLesson = function (num) {

    let myself = this;
    let previous = this.currentLesson;

    this.saveCurrentResponse(true);


    this.currentLesson = num;


    $(constants.lessonSubtitle).html(`Lesson ${this.currentLesson + 1}: `)
    $(constants.lessonCounter).html(`${this.titles.length}`);
    $(constants.lessonTitle).html(`${this.titles[this.currentLesson]}`);
    $(constants.lessonInformation).html(`${this.details[this.currentLesson]}`);


    $(constants.lessonTotalDisplay).html(`${this.currentLesson + 1} / ${this.titles.length}`)

    if ($(tagOptions.response).attr('hidden') != false) {
        $(userInteractions.userInput).val(this.responses[this.currentLesson]);
    }




    this.updateUserProgress(previous);
    this.updateSaveStatus();

    this.loadTags(this.tags[this.currentLesson]);

    this.loadProjectXML(this.currentLesson);

    this.updateURLParameters(this.currentLesson);

}



Workbook.prototype.prevStep = function () {
    if (this.currentLesson == 0) {
        alert('No more lessons');
    } else {
        let num = this.currentLesson - 1;
        this.loadLesson(num);
    }
}

Workbook.prototype.nextStep = function () {
    if ((this.currentLesson) == this.titles.length - 1) {
        alert('No more lessons');
    } else {
        let num = this.currentLesson + 1;
        this.loadLesson(num);
    }
}



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
        'id': this.workbookid,
        'owner': this.userid,
        'workbook': this.workbookVariant,
        'responses': responses,
        'timestamp': Date.now(),
    };
}


Workbook.prototype.testing = function () {

}


Workbook.prototype.saveCurrentResponse = function (clear = false) {

    let response = '';

    if ($(tagOptions.response).attr('hidden') != false) {

        if (this.currentLesson == 0) {
            this.verified == true ? response = 'user verified' : response = "";
        } else {
            response = $(userInteractions.userInput).val();
        }

        this.responses[this.currentLesson] = response;

        if (clear) {
            $(userInteractions.userInput).val("");
        }
    } else {
        alert('uncaught save current response');
    }

}

Workbook.prototype.saveExit = function () {}

Workbook.prototype.saveContinue = function () {

    this.responses[this.currentLesson] = $(userInteractions.userInput).val();

    if (isLocal) {
        download('workbook.json', JSON.stringify(this.serialize()));
        this.completedLastSave = 0;
        this.updateSaveStatus(true);
    }


}






/**
 * Download a text string as a file
 * Adapted from
 * https://github.com/CSDTs/CSDT_Single_Page/blob/master/Rhythm%20Wheels/rhythm_wheels.js
 * @param {string} filename
 * @param {string} text
 */
function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
        encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}



Workbook.prototype.login = function () {

    let myself = this;
    let user = $(userInteractions.usernameField).val();
    let upass = $(userInteractions.passwordField).val();

    cloud.getCSRFToken();

    $(userInteractions.loginModal).modal('hide');
    this.alertUser(`Logging you in ${user}`);

    let doLogin = function () {
        let success = function (data) {
            loggedInStatus = true;
            myself.alertUser(`Successfully logged in`, 3000);

            cloud.getUser((response) => myself.updateUesrStatus(response, () => myself.load()), (error) => myself.updateUesrStatus(error.status, () => myself.loadLocal()));

            // Reloads iframe so that the csnap window also has login info 
            // $('iframe').attr('src', $('iframe').attr('src'));
        }
        let error = function (error) {
            console.log(error)
            if (isLocal) {
                loggedInStatus = true;
                myself.alertUser(`Successfully logged in (locally)`, 2000);
                cloud.getUser((response) => myself.updateUesrStatus(response, () => myself.load()), (error) => myself.updateUesrStatus(error.status, () => myself.loadLocal()));
            } else {
                myself.alertUser(`Your username or password was incorrect. Please try again. <br> <p class='figure-caption'>Error Code ${error.status}</p>`, 3000);
            }
        }

        cloud.login(user, upass, success, error);
    }


    let doLogoutLogin = function () {
        let success = function (data) {
            loggedInStatus = false;
            myself.userid = null;
            myself.username = '';
            myself.workbookid = -1;
            doLogin();
        };
        let error = function (data) {
            if (isLocal) {
                loggedInStatus = false;
                myself.userid = null;
                myself.username = '';
                myself.workbookid = -1;
                doLogin();
            } else {
                myself.alertUser(`Error Code ${data.status}: Please try again later`, 2000);
            }
        };
        cloud.logout(success, error);
    };



    // First, check to see if a user is logged in first 
    if (this.userid == null) {
        doLogin();
    } else {
        doLogoutLogin();
    }

    if ($(userInteractions.usernameField).val() !== "") {
        this.verified = true;
        $(userInteractions.validateField).removeClass($(userInteractions.validateField).hasClass('is-invalid') ? 'is-invalid' : '');
        $(userInteractions.validateField).addClass($(userInteractions.validateField).hasClass('is-valid') ? '' : 'is-valid');
        $(userInteractions.loginModal).modal('hide');
    } else {
        this.verified = false;
        $(userInteractions.validateField).addClass($(userInteractions.validateField).hasClass('is-invalid') ? '' : 'is-invalid');
        $(userInteractions.validateField).removeClass($(userInteractions.validateField).hasClass('is-valid') ? 'is-valid' : '');
    }

    $(userInteractions.validateField).attr('placeholder', $(userInteractions.usernameField).val());
}

Workbook.prototype.logout = function () {
    let myself = this;
    cloud.getCSRFToken();
    this.alertUser('Logging you out', 0);
    $(constants.confirmModal).modal('hide');

    let doLogout = function () {
        let success = function (data) {
            loggedInStatus = false;
            myself.userid = null;
            myself.username = '';
            myself.workbookid = -1;
            myself.alertUser('Successfully logged out', 1000);
            cloud.getUser((response) => myself.updateUesrStatus(response, () => myself.loadResponses(null)), (error) => myself.updateUesrStatus(error.status, () => myself.loadResponses(null)));
        };
        let error = function (data) {
            if (isLocal) {
                loggedInStatus = false;
                myself.userid = null;
                myself.username = '';
                myself.workbookid = -1;
                myself.alertUser('Successfully logged out (locally)', 1000);
                cloud.getUser((response) => myself.updateUesrStatus(response, () => myself.load()), (error) => myself.updateUesrStatus(error.status, () => myself.loadLocal()));
            } else {
                myself.alertUser(`Error Code ${data.status}: Please try again later`, 2000);
            }
        };
        cloud.logout(success, error);
    };

    doLogout();
}



Workbook.prototype.load = function () {
    console.log('Loading cloud save -- Need to add model to django...');
    let fileLocation = `../workbooks/testing/workbook.json`;
    if (loggedInStatus) {
        console.log('Loading local save');
        fetch(fileLocation)
            .then(response => response.json())
            .then(jsonResponse => obj = jsonResponse)
            .then(() => this.loadResponses(obj))
            .then(() => this.loadLesson(this.currentLesson))
            .then(() => $(constants.loadingScreen).attr('hidden', true))
            .catch(() => this.updateGUI(false))
    } else {
        console.log('Loading local save (no save available)');
        $(constants.loadingScreen).attr('hidden', true);
        this.loadResponses(null);
    }

}

Workbook.prototype.loadLocal = function () {
    let fileLocation = `../workbooks/testing/workbook.json`;
    if (loggedInStatus) {
        console.log('Loading local save');
        fetch(fileLocation)
            .then(response => response.json())
            .then(jsonResponse => obj = jsonResponse)
            .then(() => this.loadResponses(obj))
            .then(() => this.loadLesson(this.currentLesson))
            .then(() => $(constants.loadingScreen).attr('hidden', true))
            .catch(() => this.updateGUI(false))
    } else {
        console.log('Loading local save (no save available)');
        $(constants.loadingScreen).attr('hidden', true);
        this.loadResponses(null);
    }


}





Workbook.prototype.updateGUI = function (isLoggedIn) {

    $(userInteractions.userInput).attr('disabled', !isLoggedIn);
    $(constants.loadingScreen).attr('hidden', true);


}




Workbook.prototype.alertUser = function (message, timeout) {

    $(constants.notificationMsg).html(message);
    $(constants.notification).modal('show');

    if (timeout > 0) {
        setTimeout(function () {
            $(constants.notification).modal('hide');
        }, timeout);
    }

}



//Saves the current rw project to the cloud (either as a new project, or as an updated project based on global flag)
Workbook.prototype.saveToCloud = function () {

    let data = {};
    let blob;
    let formData;
    let myself = this;

    // First, get a CSRF Token
    this.cloud.getCSRFToken();

    // Alert the user that the project is now saving
    this.alertUser('Saving your project. Please wait.');

    // Get the project data
    data.string = this.generateString();

    // Create a new blob
    blob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
    });

    // Create formdata
    formData = new FormData();
    formData.append('file', blob);

    // First, we are saving the files to the cloud. Once that is done, then it creates a project based on the files saved.

    let fileSaveSuccessful = function (data) {

        let projectName_ = globals.projectName;
        let applicationID_ = applicationID;
        let dataID_ = data.id;
        let imgID_ = 1000; // placeholder id

        // Updates global project name
        globals.projectName = projectName_;

        // If project creation was a success
        let success = function (data) {

            // Update flags
            flags.modifiedSinceLastSave = false;

            // Alert the user that the project was saved
            myself.alertUser('Success. Your project was saved.', 2500);

            // Determine if the url needs to update
            if (data.id != globals.projectID) {
                globals.projectID = data.id;
                myself.cloud.updateURL(globals.projectID);
            }

            // Updates the user's projects 

        };

        // If the project creation was not a success
        let error = function (xhr, error) {
            console.error(error);
            myself.alertUser('There was an error with saving. Please try again.', 3500);
        };

        // Determines if a project should be a new project, or an updated project
        if (flags.newProject) {
            myself.cloud.createProject(projectName_, applicationID_, dataID_,
                imgID_, success, error);
        } else {
            myself.cloud.updateProject(globals.projectID, projectName_,
                applicationID_, dataID_, imgID_, success, error);
        }
    }

    // If the file saves failed
    let fileSaveError = function (err) {
        console.error(xhr);
        console.error(err);
        myself.alertUser('There was an error with saving. Please try again.', 3500);

    }

    // Start saving the files
    myself.cloud.saveFile(formData, fileSaveSuccessful, fileSaveError);


}

Cloud.prototype.init = function () {

    // Check for current user
    // Check for current project
    this.userID = '';
    this.userName = '';

    this.getUser(
        (data) => {
            if (data.id == null) {
                // If the get user response was successful, but they are not logged in
                this.userID = "";
                this.userName = "";
                globals.userID = "";
                globals.userName = "";
                flags.loggedIn = false;
            } else {
                // If the get user response was successful, and they are logged in
                this.userID = data.id;
                this.userName = data.username;
                globals.userID = data.id;
                globals.userName = data.username;
                flags.loggedIn = true;
                this.checkForCurrentProject();

            }
            rw.updateLayout();
            rw.updateProjectListing();
        },
        (err) => {
            // Lack of internet connection, wrong password, other errors 
            console.error(err);
            this.userID = "";
            this.userName = "";
            globals.userID = "";
            globals.userName = "";
            flags.loggedIn = false;
            rw.updateLayout();
        }
    )

}

/** Use this to allow other API calls besides login */
Cloud.prototype.getCSRFToken = function () {
    /** gets a cookie of a specific type from the page
      @param {String} name - should pretty much always be csrftoken
      @return {String} - returns the cookie
       */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie != '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(
                        name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    /** tests if this is csrf safe
      @param {String} method - stests the given method
      @return {Boolean} - is safe
       */
    function csrfSafeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    /** test that a given url is a same-origin URL
      @param {String} url - the URL to test
      @return {Boolean} - is same origin
       */
    function sameOrigin(url) {
        const host = document.location.host; // host + port
        const protocol = document.location.protocol;
        const srOrigin = '//' + host;
        const origin = protocol + srOrigin;
        return (url == origin ||
                url.slice(0, origin.length + 1) == origin + '/') ||
            (url == srOrigin ||
                url.slice(0, srOrigin.length + 1) == srOrigin + '/') ||
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            }
        },
    });
};

/** Signed in, but don't know which user you are, call this
@param {function} callBack - The return function
@param {function} errorCallBack - If there is an error
*/
Cloud.prototype.getUser = function (callBack, errorCallBack) {
    $.ajax({
        dataType: 'json',
        url: this.userAPIURL,
        success: callBack,
    }).fail(errorCallBack);
};

/** Get the list of projects for the current user, must be signed in
@param {int} userID - ID of the number of user
@param {function} callBack - The return function
@param {function} errorCallBack - If there is an error
*/
Cloud.prototype.listProject = function (userID, callBack, errorCallBack) {
    $.get(this.projAPIURL + '?owner=' + userID, null,
        callBack, 'json').fail(errorCallBack);
};

/** Already got a project, no problem, just load it with this function
@param {int} projectID - ID of the number to be updated
@param {function} callBack - The return function
@param {function} errorCallBack - If there is an error
*/
Cloud.prototype.loadProject = function (projectID,
    callBack,
    errorCallBack) {
    $.get(this.projAPIURL + projectID + '/', null, function (data) {
        $.get(data.project_url, null,
            function (proj) {
                callBack(data, proj);
            }).fail(errorCallBack);
    }).fail(errorCallBack);
};

/** Update a project instead of making a new one
@param {int} projectID - ID of the number to be updated
@param {String} projectName - Name of your project
@param {int} applicationID - The number of the application you're using
@param {String} dataID - The file location from save file call back
@param {String} imgID - The image file location important for viewing projects
@param {function} callBack - The return function
@param {function} errorCallBack - If there is an error
*/
Cloud.prototype.updateProject = function (projectID,
    projectName,
    applicationID,
    dataID,
    imgID,
    callBack,
    errorCallBack) {
    $.ajax({
        type: 'PUT',
        url: this.projAPIURL + projectID + '/',
        data: {
            name: projectName,
            description: '',
            classroom: null,
            application: applicationID,
            project: dataID,
            screenshot: imgID,
        },
        success: callBack,
        dataType: 'json',
    }).fail(errorCallBack);
};

/** Make a project to be able to find your saved file again, returns the details
of the project created, including ID for updating
@param {String} projectName - Name of your project
@param {int} applicationID - The number of the application you're using
@param {String} dataID - The file location from save file call back
@param {String} imgID - The image file location important for viewing projects
@param {function} callBack - The return function
@param {function} errorCallBack - If there is an error
*/
Cloud.prototype.createProject = function (projectName,
    applicationID,
    dataID,
    imgID,
    callBack,
    errorCallBack) {
    $.post(this.projAPIURL, {
        name: projectName,
        description: '',
        classroom: '',
        application: applicationID,
        project: dataID,
        screenshot: imgID,
    }, callBack, 'json').fail(errorCallBack);
};

/** Saves a file to the server, save the ID for use with create / update project
@param {String} file - The data to be uploaded
@param {function} callBack - The returned function
@param {function} errorCallBack - If there is an error
*/
Cloud.prototype.saveFile = function (file, callBack, errorCallBack) {
    $.ajax({
        type: 'PUT',
        url: this.fileAPIURL,
        data: file,
        processData: false,
        contentType: false,
        success: callBack,
    }).fail(errorCallBack);
};

/** Log in does what it sounds like, makes a post to the API to log you in,
follow up with get CSRF or Get user data.
@param {String} username - Username to log in with
@param {String} password - Password to log in with
@param {function} callBack - The returned function
@param {function} errorCallBack - If there is an error
*/
Cloud.prototype.login = function (username,
    password,
    callBack,
    errorCallBack) {
    $.post(this.loginUrl, {
            'login': username,
            'password': password
        },
        callBack).fail(errorCallBack);
};

/** Want to logout, no worries, you're not trapped anymore
@param {function} callBack - The return function
@param {function} errorCallBack - If there is an error
*/
Cloud.prototype.logout = function (callBack, errorCallBack) {
    $.post(this.logoutAPIURL, {}, callBack, 'json').fail(errorCallBack);
};


// Check for a current project based on the config project id
Cloud.prototype.checkForCurrentProject = function () {
    try {
        if (Number.isInteger(Number(config.project.id))) {
            rw.loadFromCloud(config.project.id);
        }
    } catch (err) {
        console.error(err);
    }
};



// Update the url
Cloud.prototype.updateURL = function (URL) {

    if (window.history !== undefined && window.history.pushState !== undefined) {
        window.history.pushState({}, "", '/projects/' + URL + "/run");
    }
};
