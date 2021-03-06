/* eslint-disable */

let applicationID = 99;
window.cloud = new CloudSaver();

// Options
let hideGrid = false;
let addAtCurrentPoint = false;
let showCoordinatesInCorner = false;
let hideEncryptedOption = true;
let currentX = 0;
let currentY = 0;
let gridScale = 2;
let currentGoal = "./img/cc-0.jpg";
let hideHighlight = false;
let showVector = false;
let midVectors = [];
let braidUndoBuffer = [];
let currBufferLength = 0;

// Override for tutorials
let isTutorial = false;



const myCanvas = document.getElementById('myCanvas');
const imageCanvas = document.getElementById('imageCanvas');

$('#data-form').on('change keyup input', loadCanvas);
let Braids = [];
let currBraidIndex = 0;

let globals = {
    projectName: 'Untitled',
    userID: -1,
    userName: '',
    loadingText: '',
    projectID: typeof config !== 'undefined' ? config.project.id : "",
    loginStatus: false,
    dataSource: Braids,
    imageSource: myCanvas
};

let flags = {
    newProject: true,
    modifiedSinceLastSave: false,
    loggedIn: false,
};

let constants = {
    loginButton: '#login-logout',
    logoutButton: '#logout',
    loginToSaveButton: '#save-cloud-login',
    loginToLoadButton: '#load-cloud-login',
    saveToCloudButton: '#save-cloud',
    loginModal: '#loginModal',
    projectList: 'cloud-project',
    alertMessage: '#appAlert',
    alertMessageText: '#appAlert .modal-dialog .alert strong',
    userName: '#userName',
    userPass: '#userPass',
    loadModal: '#cloudLoading',
    saveModal: '#cloudSaving',
    projectName: '#project-name'

}


/** Class representing a single braid and containing methods for drawing it */
class Braid {
    /**
     * @param {number} size width of the braid in pixels
     * @param {number} x
     * @param {number} y
     * @param {number} startAngle
     * @param {string} startReflection
     * @param {HTMLElement} canvas
     * @param {boolean} inRadians
     */
    constructor(size, x, y, startAngle, startReflection,
        canvas, inRadians = true) {
        this._size = size;
        this._x = x;
        this._y = y;
        this._rotation = 0;
        this._ctx = canvas ? canvas.getContext('2d') : undefined;
        this._midpoint = {
            x: x,
            y: y,
        };
        this.translate(0, 0, startAngle, inRadians);
        this._reflection = startReflection;
    }

    /** Clone constructor
     * Note: this._y + this._size / 2 (if point is in corner or not..)
     * @return {Braid} returns a copy of the current braid
     */
    clone() {
        const newBraid = new Braid(this._size, this._x, this._y,
            this._startAngle, this._reflection);
        newBraid._ctx = this._ctx;
        newBraid._rotation = this._rotation;
        newBraid._x = this._x;
        newBraid._y = this._y;
        newBraid._midpoint = {
            x: this._x,
            y: this._y,
        };
        newBraid.collisionParams = [];
        return newBraid;
    }

    /** Moves the braid on the x,y plane without rotating or resizing
     * @param {number} dx Amount x should change by in percent
     * @param {number} dy Amount x should change by in percent
     * @param {number} angle Angle of rotation
     * @param {boolean} inRadians Whether "angle" was given in radians
     *
     * @return {Braid} returns "this" for chaining
     */
    translate(dx, dy, angle, inRadians) {
        this._rotation += inRadians ? angle : degToRad(angle);
        let reflectionX = this._reflection == null ? 1 : (this._reflection.includes('y') ? -1 : 1);
        let reflectionY = this._reflection == null ? 1 : (this._reflection.includes('x') ? -1 : 1);

        const newMidpoint = rotateAroundPoint({
            x: this._size * dx / 100,
            y: (this._size * dy / 100),
        }, this._rotation, {
            x: 0,
            y: 0,
        });
        this._x += newMidpoint.x * reflectionX;
        this._y += newMidpoint.y * reflectionY;
        this._midpoint.x += newMidpoint.x;
        this._midpoint.y += newMidpoint.y;
        this.collisionParams = [];


        return this;
    }

    /** Reflects the braid across x or y axis
     * @param {string} axis the axis of reflection (x,y)
     *
     * @return {Braid} returns "this" for chaining
     */
    setReflection(axis) {
        this._reflection = axis;
        return this;
    }

    /** Changes the size of the braid
     * @param {number} dilation percentage of the current size
     *
     * @return {Braid} returns "this" for chaining
     */
    dilate(dilation) {
        this._size *= (dilation / 100);
        this._midpoint = {
            x: this._x,
            y: this._y,
        };
        return this;
    }

    /** Draws braid based on current data stored in braid
     * @param {string} color an optional hex code containt the color to stamp
     * @param {number} width an optional width for the braid strokes
     *
     * @return {Braid} returns "this" for chaining
     */
    stamp(color = '#000000', width = 1 / 7) {

        // 7 is an arbitrary number for lineWidth that seems to look good
        const lineWidth = this._size * width;
        // Offset keeps all corners of the lines within the size x size square
        const offset = lineWidth / 2;
        // Rotate all points to be used around corner
        const position = {
            x: this._x,
            y: this._y,
        };
        let upperLeftCorner = rotateAroundPoint({
            x: this._x - (this._size / 2) + offset,
            y: this._y - (this._size / 2) + offset,
        }, this._rotation, position);
        upperLeftCorner = reflect(upperLeftCorner.x, upperLeftCorner.y,
            this._midpoint.x, this._midpoint.y, this._reflection);
        let midPoint = rotateAroundPoint({
            x: this._midpoint.x,
            y: this._midpoint.y,
        }, this._rotation, position);
        midPoint = reflect(midPoint.x, midPoint.y,
            this._midpoint.x, this._midpoint.y, this._reflection);
        let upperRightCorner = rotateAroundPoint({
            x: this._x + this._size - (this._size / 2) - offset,
            y: this._y - (this._size / 2) + offset,
        }, this._rotation, position);
        upperRightCorner = reflect(upperRightCorner.x, upperRightCorner.y,
            this._midpoint.x, this._midpoint.y, this._reflection);
        let lowerLeftCorner = rotateAroundPoint({
            x: this._x - (this._size / 2) + offset,
            y: this._y + this._size - (this._size / 2) - offset,
        }, this._rotation, position);
        lowerLeftCorner = reflect(lowerLeftCorner.x, lowerLeftCorner.y,
            this._midpoint.x, this._midpoint.y, this._reflection);
        this._ctx.beginPath();
        this._ctx.lineWidth = lineWidth;
        this._ctx.strokeStyle = color;

        // Draws left arm
        this._ctx.moveTo(upperLeftCorner.x, upperLeftCorner.y);
        this._ctx.lineTo(midPoint.x, midPoint.y);
        this.collisionParams[0] = {
            x0: upperLeftCorner.x,
            y0: upperLeftCorner.y,
            x1: midPoint.x,
            y1: midPoint.y,
        };
        // Draws right arm
        this._ctx.moveTo(upperRightCorner.x, upperRightCorner.y);
        this._ctx.lineTo(lowerLeftCorner.x, lowerLeftCorner.y);
        this.collisionParams[1] = {
            x0: upperRightCorner.x,
            y0: upperRightCorner.y,
            x1: lowerLeftCorner.x,
            y1: lowerLeftCorner.y,
        };

        this._ctx.closePath();
        this._ctx.stroke();

        return this;
    }

    /** Draws vector based on current data stored in braid
     * @param {string} color an optional hex code containt the color to stamp
     * @param {number} width an optional width for the braid strokes
     *
     * @return {Braid} returns "this" for chaining
     */
    vector(midA, midB, color = '#33ff33', width = 1 / 8) {
        // 7 is an arbitrary number for lineWidth that seems to look good
        const lineWidth = this._size * width;
        // Offset keeps all corners of the lines within the size x size square
        const offset = lineWidth / 2;

        this._ctx.beginPath();
        this._ctx.lineWidth = lineWidth;
        this._ctx.strokeStyle = color;

        // Draws arrow body
        this._ctx.moveTo(midA.x, midA.y);
        this._ctx.lineTo(midB.x, midB.y);
        this.collisionParams[0] = {
            x0: midA.x,
            y0: midA.y,
            x1: midB.x,
            y1: midB.y,
        };

        this._ctx.closePath();
        this._ctx.stroke();

        return this;
    }

    /** Iterates, creating n stamped copies of the braid,
     * each using the same translation
     * @param {number} translateX percentage
     * @param {number} translateY percentage
     * @param {number} rotationAngle
     * @param {boolean} inRadians
     * @param {number} dilation percentage
     * @param {number} n number of iterations
     *
     * @return {Braid} returns this for chaining
     */
    iterate(translateX, translateY, rotationAngle, inRadians, dilation, n) {
        if (dilation || n) {
            this.setIterationParameters(translateX, translateY,
                rotationAngle, inRadians, dilation, n);
        }

        const braidToStamp = this.stamp().clone();
        const vectorStamp = this.stamp().clone();
        let midA = {
            x: this._x,
            y: this._y
        };
        let midB = {
            x: this._x,
            y: this._y
        };

        // Steps into first iteration for the vector to extend (there's probably a better way to do this, but....)
        if (showVector) {
            vectorStamp
                .translate(this.iteration.translateX,
                    this.iteration.translateY, this.iteration.rotationAngle,
                    this.iteration.inRadians)
                .dilate(this.iteration.dilation);
        }


        for (let i = 0; i < (n ? n : this.iteration.n); i++) {
            if (showVector) {
                midA.x = braidToStamp._midpoint.x;
                midA.y = braidToStamp._midpoint.y;
            }

            braidToStamp
                .translate(this.iteration.translateX,
                    this.iteration.translateY, this.iteration.rotationAngle,
                    this.iteration.inRadians)
                .dilate(this.iteration.dilation)
                .stamp(hideEncryptedOption ? '#000000' : this._colorArray[i]);
            if (showVector) {
                vectorStamp
                    .translate(this.iteration.translateX,
                        this.iteration.translateY, this.iteration.rotationAngle,
                        this.iteration.inRadians)
                    .dilate(this.iteration.dilation);
                midB.x = braidToStamp._midpoint.x;
                midB.y = braidToStamp._midpoint.y;

                vectorStamp.vector(midA, midB);
            }

        }
        // Allows the vector to extend to its next iteration.
        if (showVector) {
            let vectorN = (n ? n : this.iteration.n);
            midA.x = (vectorN == 0) ? (midA.x) : vectorStamp._midpoint.x;
            midA.y = (vectorN == 0) ? (midA.y) : vectorStamp._midpoint.y;
            vectorStamp.vector(midA, midB);
        }
        return this;
    }

    /** Save or edit paramters for iteration
     * @param {number} translateX percentage
     * @param {number} translateY percentage
     * @param {number} rotationAngle
     * @param {boolean} inRadians
     * @param {number} dilation percentage
     * @param {number} n number of iterations
     *
     * @return {Braid} returns this for chaining
     */
    setIterationParameters(translateX, translateY, rotationAngle,
        inRadians, dilation, n) {
        this.iteration = {
            translateX,
            translateY,
            rotationAngle,
            inRadians,
            dilation,
            n,
        };
        return this;
    }

    /** Returns whether or not the braid contains the given coordinate
     * @param {number} x
     * @param {number} y
     *
     * @return {boolean}
     */
    contains(x, y) {
        const dx = (this._midpoint.x - x);
        const dy = (this._midpoint.y - y);
        return Math.sqrt(dx * dx + dy * dy) <= this._size / 2;
    }

    /**Sets each stamp to a color based on string
     * @param{string} message
     *
     * @return {Braid} returns this for chaining
     */
    setEncryptedMessage(message) {
        let colorArr = [];
        for (let i = 0; i < message.length; i++) {
            colorArr[i] = "hsl(" + Math.round(message.charCodeAt(i) - 65 / 15) * 15 + ",100%, 50%)";
        }
        this._encryptedMessage = true;
        this._colorArray = colorArr;
        return this;
    }

    /**
     * @return {Object} a serialized version of this braid for saving
     */
    serialize() {
        return {
            'size': this._size,
            'x': this._x,
            'y': this._y,
            'rotation': this._rotation,
            'reflection': this._reflection,
            'iteration': this.iteration,
        };
    }
}

// Helper functions

/** Rotates one point around another
 * @param {object} A
 * @param {number} angle
 * @param {object} B
 *
 * @return {object} returns "A" rotated "angle" radians around "B"
 */
function rotateAroundPoint(A, angle, B) {
    return {
        x: (A.x - B.x) * Math.cos(angle) - (A.y - B.y) * Math.sin(angle) + B.x,
        y: (A.y - B.y) * Math.cos(angle) + (A.x - B.x) * Math.sin(angle) + B.y,
    };
}

/** Reflect
 * @param {number} x starting x
 * @param {number} y starting y
 * @param {number} midX x coordinate of the point of reflection
 * @param {number} midY y coordinate of the point of reflection
 * @param {string} axis axis of reflection (x, y, xy)
 *
 * @return {object} a point containing the reflected x and y
 */
function reflect(x, y, midX, midY, axis) {
    return {
        x: axis.includes('y') ? 2 * midX - x : x,
        y: axis.includes('x') ? 2 * midY - y : y,
    };
}

/** Convert degrees to radians
 * @param {number} angle
 *
 * @return {number}
 */
function degToRad(angle) {
    return angle * Math.PI / 180;
}

/** Convert radians to degrees
 * @param {number} angle
 *
 * @return {number}
 */
function radToDeg(angle) {
    return angle * 180 / Math.PI;
}

/** Reset all inputs to their default values.
 * 
 */
function setInputsToDefaults() {

    // //Offset to make new braids not overlap..
    let x = parseFloat($('#start-x').val()) + 10;
    let y = parseFloat($('#start-y').val()) - 10;

    $('#start-x').val(x);
    $('#start-y').val(y);
    $('#start-angle').val('0');
    $('#start-dilation').val('100');
    $('#reflectx').prop('checked', false);
    $('#reflecty').prop('checked', false);
    $('#iterations').val('0');
    $('#x-translation').val('50');
    $('#rotation').val('0');
    $('#dilation').val('100');
}

/** Reset all inputs to overridden values based on current options / current values
 * 
 */
function setInputsToOverride() {

    $('#start-x').val();
    $('#start-y').val();
    // $('#start-angle').val('0');
    // $('#start-dilation').val('100');
    // $('#reflectx').prop('checked', false);
    // $('#reflecty').prop('checked', false);
    // $('#iterations').val('0');
    // $('#x-translation').val('50');
    // $('#rotation').val('0');
    // $('#dilation').val('100');
}

/** Reset all inputs to overridden values based on current options / current values
 * 
 */
function setInputsToTutorial() {

    if (!addAtCurrentPoint) {
        $('#start-x').val('0');
        $('#start-y').val('0');
    }
}

/** Toggles the grid in canvas
 *
 */
function toggleGrid() {
    hideGrid = !hideGrid;
    loadCanvas();
    $('#hideGrid').text(hideGrid ? "Show Grid" : "Hide Grid");
}

/** Toggles the starting point in canvas
 *
 */
function togglePoint() {
    $('#addAtCurrentPoint').text(addAtCurrentPoint ? "Add Braid at Current Point" : "Add Braid at Origin");
    addAtCurrentPoint = !addAtCurrentPoint;
}

/** Toggles the coordinate point display in the bottom right corner
 *
 */
function togglePointDisplay() {
    $('#showCoordinatesOption').text(showCoordinatesInCorner ? "XY In Lower Right" : "XY Follows Mouse");
    showCoordinatesInCorner = !showCoordinatesInCorner;

}


/** Toggles the initial braid highlight
 *
 */
function toggleBraidHighlight() {
    $('#hideHighlight').text(hideHighlight ? "Hide Plait Highlight" : "Show Plait Highlight");
    hideHighlight = !hideHighlight;
    loadCanvas();

}

/** Toggles the vector visible on the braid
 *
 */
function toggleVector() {
    $('#showVector').text(showVector ? "Show Vector" : "Hide Vector");
    showVector = !showVector;
    loadCanvas();
}

/** Draws an arrow at the given location
 * @param {canvas context} ctx current ctx
 * @param {number} fromx starting x
 * @param {number} fromy starting y
 * @param {number} tox ending x 
 * @param {number} toy ending y
 * @param {number} arrowWidth widht of the arrow
 * @param {color} color hex value for color of arrow ('#33ff33')
 */
function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
    //variables to be used when creating the arrow
    var headlen = 10;
    var angle = Math.atan2(toy - fromy, tox - fromx);

    ctx.save();
    ctx.strokeStyle = color;

    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
        toy - headlen * Math.sin(angle - Math.PI / 7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7),
        toy - headlen * Math.sin(angle + Math.PI / 7));

    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
        toy - headlen * Math.sin(angle - Math.PI / 7));

    //draws the paths created above
    ctx.stroke();
    ctx.restore();
    ctx.closePath();

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

/**
 * Load a project into memory
 * @param {string} text a JSON string
 */
function loadFromJSON(text) {
    Braids.length = 0;
    currBraidIndex = -1;
    JSON.parse(text).forEach((obj) => {
        Braids.push(new Braid(obj.size, obj.x, obj.y, obj.rotation,
            obj.reflection, myCanvas));
        ++currBraidIndex;
        Braids[currBraidIndex].setIterationParameters(obj.iteration.translateX,
            obj.iteration.translateY, obj.iteration.rotationAngle,
            obj.iteration.inRadians, obj.iteration.dilation, obj.iteration.n);
    });
    if (Braids.length === 0) {
        setInputsToDefaults();
    } else {
        setParamsForBraid(Braids[currBraidIndex]);
    }
    loadCanvas();
    loadBraids();
    $('#loadingProject').modal('hide');
}

/** Clears entire canvas from braids
 * 
 */
function clearCanvas() {
    if (confirm('WARNING, this will delete all braids')) {

        while (Braids.length > 0) {
            Braids.splice(currBraidIndex, 1);
            currBraidIndex = -1;
            loadCanvas();
            loadBraids();
        }
    }
}

/** Toggles the 'Encrypted Braid' Function
 * 
 */
function checkForEncryption() {

    //Determines which format users determine the iteration amount
    $('#message-group').attr('hidden', hideEncryptedOption);
    $('#message-label').attr('hidden', hideEncryptedOption);
    $('#iterations-group').attr('hidden', !hideEncryptedOption);
    $('#iterations-label').attr('hidden', !hideEncryptedOption);

    // Setting Default Values for the 'Encrypted Message Braid'
    if (!hideEncryptedOption) {
        $('#starting-params').attr('hidden', true);
        $('#start-x').val('-220');
        $('#start-y').val('150');
        $('#start-angle').val('0');
        $('#start-dilation').val('200');
        $('#reflectx').prop('checked', false);
        $('#reflecty').prop('checked', false);
        $('#x-translation').val('50');
        $('#rotation').val('-1');
        $('#dilation').val('97');
    }
}
// Demonstration

$('#new-braid').click(() => {

    if (isTutorial) {
        setInputsToTutorial();
    } else {
        addAtCurrentPoint ? setInputsToOverride() : setInputsToDefaults();
    }

    Braids.push(new Braid(myCanvas.width / 20,
        myCanvas.width / 2, myCanvas.height / 2,
        0, '', myCanvas, false));
    currBraidIndex = Braids.length - 1;
    loadCanvas();
    loadBraids();
});

$('#reset-braid').click(() => {
    setInputsToDefaults();
    loadCanvas();
});

$('#delete-braid').click(() => {
    Braids.splice(currBraidIndex, 1);

    currBraidIndex = currBraidIndex - 1;

    loadCanvas();
    loadBraids();
});

$('#save-local').click(() => {
    let name = $('#project-name').val()
    download(name + '.json', JSON.stringify(Braids.map((b) => b.serialize())));

    $('#cloudSaving').modal('hide');
});

$('#print-file').click(() => {
    window.print();
})

$('#clear').on('click', () => {
    clearCanvas();
})

$('#load-local').on('change', (e) => {
    let file = e.target.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.onload = (e) => {
        loadFromJSON(e.target.result);
    };
    reader.readAsText(file);
    $('#cloudLoading').modal('hide');
});

$('#myCanvas').on('mousemove', (e) => {
    loadCanvas();

    const ctx = myCanvas.getContext('2d');
    const x = e.offsetX;
    const y = e.offsetY;

    if (!showCoordinatesInCorner) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y - 12, 60, 15);
        ctx.fillStyle = '#000000';
        ctx.fillText(
            '(' + ((x - myCanvas.width / 2)) + ',' +
            ((y - myCanvas.width / 2) * -1) + ')', x, y
        );
        mouseText = {
            x,
            y,
        };
        $("#showCoordinates").text("");
    } else {
        $("#showCoordinates").text('(' + (x - myCanvas.width / 2) + ',' + ((y - myCanvas.width / 2) * -1) + ')');
    }
    for (let i = 0; i < Braids.length; i++) {
        if (Braids[i].contains(x, y) && !hideHighlight) {
            Braids[i].stamp('#FF0000');
        }
    }

});

$('#myCanvas').on('mouseleave', (e) => {
    loadCanvas();
});

$('#myCanvas').on('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    for (let i = 0; i < Braids.length; i++) {
        if (Braids[i].contains(x, y)) {
            currBraidIndex = i;
            setParamsForBraid(Braids[i]);
            loadCanvas();
            loadBraids();
            break;
        }
    }
});

$('.braid-img').on('click', (e) => {
    currentGoal = e.target.getAttribute('src');
    $('#goal-image').attr('src', currentGoal);
    $('#braidModal').modal('hide');
})

/** Sets parameters to those for a certain braid
 * @param {Braid} braid
 */
function setParamsForBraid(braid) {



    $('#start-x').val((braid._x - myCanvas.width / 2) * (braid._reflection.includes('y') ? -1 : 1));
    $('#start-y').val((-(braid._y - myCanvas.height / 2)) * (braid._reflection.includes('x') ? -1 : 1));
    $('#start-angle').val(radToDeg(braid._rotation) * -1);
    $('#start-dilation').val(braid._size * 2000 / myCanvas.width);
    $('#reflectx').prop('checked', braid._reflection.includes('x'));
    $('#reflecty').prop('checked', braid._reflection.includes('y'));
    $('#iterations').val(braid.iteration.n);
    $('#x-translation').val(braid.iteration.translateX);
    $('#rotation').val(braid.iteration.rotationAngle * -1);
    $('#dilation').val(braid.iteration.dilation);
}

/** loads canvas at the correct height and iterates with current settings */
function loadCanvas() {
    // Gets all form values
    const ctx = myCanvas.getContext('2d');
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

    const iterations = hideEncryptedOption ? parseInt($('#iterations').val()) : parseInt($('#message').val().length);
    const message = hideEncryptedOption ? "" : $('#message').val();
    const startX = parseFloat($('#start-x').val()) * ($('#reflecty').is(':checked') ? -1 : 1);
    const startY = parseFloat($('#start-y').val() * -1 * ($('#reflectx').is(':checked') ? -1 : 1));
    const startAngle = parseFloat($('#start-angle').val() * -1);
    const startingDilation = parseFloat($('#start-dilation').val());
    const xTranslation = parseFloat($('#x-translation').val());
    const rotation = parseFloat($('#rotation').val() * -1);
    const dilation = parseFloat($('#dilation').val());
    const xReflection = $('#reflectx').is(':checked');
    const yReflection = $('#reflecty').is(':checked');
    const reflection = ('' + (xReflection ? 'x' : '') +
        (yReflection ? 'y' : ''));


    // Dynamically resizes canvas and data form
    if ($(window).width() < 992 && $('#canvas-container').hasClass('col-6')) {
        $('#canvas-container').toggleClass('col-6 col-12');
        $('#data-container').toggleClass('col-6 col-12');
    } else if ($(window).width() >= 992 &&
        $('#canvas-container').hasClass('col-12')) {
        $('#canvas-container').toggleClass('col-12 col-6');
        $('#data-container').toggleClass('col-12 col-6');
    }

    myCanvas.width = (parseInt(window.getComputedStyle(myCanvas).width) - 2);

    myCanvas.height = myCanvas.width;

    Braids[currBraidIndex] = new Braid(myCanvas.width * startingDilation / 2000,
            myCanvas.width / 2 + startX, myCanvas.height / 2 + startY,
            startAngle, reflection, myCanvas, false)
        .setIterationParameters(xTranslation, 0, rotation, false,
            dilation, iterations);

    if (!hideEncryptedOption) {
        Braids[currBraidIndex].setEncryptedMessage(message);
    }

    if (!hideGrid) {

        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#8e8e8e55';
        for (let i = myCanvas.width / 2; i >= 0; i -= 10) {

            ctx.moveTo(i, 0);
            ctx.lineTo(i, myCanvas.height);
            ctx.moveTo(0, i);
            ctx.lineTo(myCanvas.width, i);
            ctx.moveTo(myCanvas.width - i, 0);
            ctx.lineTo(myCanvas.width - i, myCanvas.height);
            ctx.moveTo(0, myCanvas.width - i);
            ctx.lineTo(myCanvas.width, myCanvas.width - i);

        }
        ctx.closePath();
        ctx.stroke();

        //Draws the X and Y axis
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(myCanvas.width / 2, 0);
        ctx.lineTo(myCanvas.width / 2, myCanvas.height);
        ctx.moveTo(0, myCanvas.height / 2);
        ctx.lineTo(myCanvas.width, myCanvas.height / 2);
        ctx.closePath();
        ctx.stroke();
    }

    midVectors = [];

    for (let i = 0; i < Braids.length; i++) {
        if (i === currBraidIndex && !hideHighlight) {
            Braids[i]
                .clone()
                .translate(-2 * (yReflection ? -1 : 1), 2 * (xReflection ? -1 : 1), 0, 0)
                .dilate(110)
                .stamp('#FF0000', (12 / 70));
        }
        Braids[i].iterate();
    }

}

/** loads current braids into select for easier navigation */
function loadBraids() {
    $('#braid-select').html("");
    for (let i = 0; i < Braids.length; i++) {
        $('#braid-select').append($('<option>', {
            value: i,
            text: 'Braid ' + (i + 1),
            selected: currBraidIndex == i ? true : false
        }));
    }
}

/**Clears the stage for a tutorial (i.e. leaving just one braid, resetting values, etc.)
 * 
 */
function clearTutorial() {

    let initBraid = Braids[0];

    Braids = [];
    currBraidIndex = 0;
    Braids[currBraidIndex] = initBraid;

}

/** Based on user selection, load in braid
 * @param {num} value input value 
 */
function selectBraidFromSelect(value) {
    for (let i = 0; i < Braids.length; i++) {
        if (i == value) {
            currBraidIndex = i;
            setParamsForBraid(Braids[i]);
            loadCanvas();
            loadBraids();
            break;
        }
    }



}




function initOnline() {
    // Check for login
    checkUserLogin();
    checkProjectStatus();
    // Check for config
}


let checkUserLogin = function () {
    let success = function (data) {
        if (data.id === null) {
            // User is not logged in
            globals.userID = -1;
            flags.loggedIn = false;
            updateUserGUI();
            getUserProjects();

        } else {
            // User is logged in
            globals.userID = data.id;
            globals.userName = data.username;
            flags.loggedIn = true;
            updateUserGUI();
            getUserProjects();
        }
    };
    let error = function (data) {
        console.error(data);
    };

    cloud.getUser(success, error);
};

let checkProjectStatus = function () {
    // load project
    try {
        if (Number.isInteger(Number(config.project.id))) {
            loadFromCloud(config.project.id);
            updateURL(config.project.id);
        }
    } catch (err) {

    }

};


let updateURL = function (URL) {

    if (window.history !== undefined && window.history.pushState !== undefined) {
        window.history.pushState({}, "", '/projects/' + URL + "/run");
    }
};


// Cloud saving
// Helper function, kindly donated by http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
function dataURItoBlob(dataURI, type) {
    var binary;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        binary = atob(dataURI.split(',')[1]);
    else
        binary = unescape(dataURI.split(',')[1]);
    //var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
        type: type
    });
}
let dataToBlob = function (data, type) {
    let data_str;
    if (type.includes('image')) {
        data_str = data.toDataURL();
        return dataURItoBlob(data_str, 'image/png');
    } else {
        data_str = serializeData(data);
        return new Blob([data_str], {
            type: 'application/json',
        });
    }
}

let serializeData = function (data) {
    return JSON.stringify(data.map((b) => b.serialize()));
}



// Load From Cloud

let loadFromCloud = function (id) {

    cloud.getCSRFToken();
    updateModal(constants.loadModal, false);
    updateAlert('Loading project...');

    let success = function (data) {
        globals.projectID = id;
        loadFromJSON(data);
        updateURL(globals.projectID);
        updateAlert('Project Loaded!', true, 1000);
    };

    let error = function (data) {
        console.error(data);
        updateAlert('An error has occured. Please try again.', true, 2000);
    };

    cloud.loadProject(id, success, error);
};


//Save to Cloud
let saveToCloud = function () {
    cloud.getCSRFToken();

    updateModal(constants.saveModal, false);
    updateAlert('Saving project...');

    let dataID_;
    let imgID_ = 1000;
    let applicationID_ = applicationID;
    let projectName_ = $(constants.projectName).val()

    globals.projectName = projectName_;

    let projectData = dataToBlob(globals.dataSource, 'application/json');
    let imageData = dataToBlob(globals.imageSource, 'image/png');

    let projectForm = new FormData();
    let imageForm = new FormData();

    projectForm.append('file', projectData);
    imageForm.append('file', imageData);


    let successImageSave = function (data) {
        imgID_ = data.id;

        let successDataSave = function (data) {
            dataID_ = data.id;

            let success = function (data) {
                globals.projectID = data.id;
                updateURL(globals.projectID)
                updateAlert('Project Saved!', true, 2000);
            }

            let error = function (data) {
                updateAlert('An error has occured. Please try again.', true, 2000);
            }

            if (flags.newProject) {
                cloud.createProject(projectName_, applicationID_, dataID_,
                    imgID_, success, error);
            } else {
                cloud.updateProject(globals.projectID, projectName_,
                    applicationID_, dataID_, imgID_, success, error);
            }
        }
        let errorDataSave = function (data) {
            console.error("Error with data save.")
            console.error(data);
        }

        cloud.saveFile(projectForm, successDataSave, errorDataSave);
    }


    let errorImageSave = function (data) {
        console.error("Error with image save.")
        console.error(data);
    }

    cloud.saveFile(imageForm, successImageSave, errorImageSave);

};




// Project Listing
let getUserProjects = function () {
    let err = function (data) {
        // No projects are available for user
        // console.error(data);
        updateUserProjects([]);
    };
    let suc = function (data) {
        // Update the list of projects
        updateUserProjects(data);
    };

    cloud.listProject(globals.userID, suc, err);
};

let updateUserProjects = function (projects) {

    let projectListDiv = document.getElementById(constants.projectList);

    if (projects.length == 0) {
        projectListDiv.innerHTML = '<option selected>Choose...</option>';
    } else {
        projectListDiv.innerHTML = '';

        // projects will be sorted first here
        projects.forEach(function (project) {

            if (project.application == applicationID) {
                let projectDiv = document.createElement('option');
                projectDiv.innerText = project.name
                projectListDiv.appendChild(projectDiv);

                projectDiv.value = project.id;
                if (projectDiv.value == globals.projectID) {
                    let att = document.createAttribute("selected");
                    projectDiv.setAttributeNode(att);
                }

                projectDiv.addEventListener('click', function (e) {
                    loadFromCloud(project.id);
                });
            }

        });

        $('<option selected>Choose...</option>').prependTo($('#'+constants.projectList));
    }
};

// Updates 
let updateAlert = function (message, timeOut = false, timeLength = 1000) {
    $(constants.alertMessageText).html(message);
    if (!timeOut) {
        $(constants.alertMessage).modal('show');
    } else {
        setTimeout(function () {
            $(constants.alertMessage).modal('hide');
        }, timeLength);
    }

}

let updateModal = function (modal, state, timeOut = false, timeLength = 1000) {

    if (!timeOut) {
        $(modal).modal(state ? 'show' : 'hide');
    } else {
        setTimeout(function () {
            $(modal).modal(state ? 'show' : 'hide');
        }, timeLength);
    }


}

let updateUserGUI = function () {

    let base = (globals.userName == "" ? 'LOGIN' : (globals.userName).toUpperCase());
    let loginURL = (globals.userID != -1 ? '/users/' + globals.userID : '');

    //Updates the login button
    $(constants.loginButton).html("<i class='fas fa-user'></i>&nbsp; " + base);

    // Update login button functionality
    if (flags.loggedIn) {
        $(constants.loginButton).attr('href', loginURL);
        $(constants.loginButton).attr('data-toggle', '');
        $(constants.loginButton).attr('data-target', '');
    } else {
        $(constants.loginButton).removeAttr('href');
        $(constants.loginButton).attr('data-toggle', 'modal');
        $(constants.loginButton).attr('data-target', constants.loginModal);
    }

    // Updates the logout button
    $(constants.logoutButton).attr('hidden', !flags.loggedIn);

    // If the user is not logged in, this button appears to log the user in before saving to cloud
    $(constants.loginToSaveButton).attr('hidden', flags.loggedIn);
    $(constants.saveToCloudButton).attr('hidden', !flags.loggedIn);

    // If the user is not logged in, the projects are disabled and the login to load button appears
    $(constants.loginToLoadButton).attr('hidden', flags.loggedIn);
    $('#'+ constants.projectList).attr('disabled', !flags.loggedIn);
    $(constants.logoutButton).on('click', function(){logout()});

}




// Login Logout

let submitLogin = function (cb) {
    cloud.getCSRFToken();
    let username = $(constants.userName).val();
    let password = $(constants.userPass).val();

    let success = function (data) {
        globals.userID = data.id;
        globals.userName = data.username;
        return cb(null, {
            success: true,
        });
    };

    let error = function (data) {
        return cb(data, {
            success: false,
        });
    };



    cloud.login(username, password, function (data) {
            cloud.getUser(success, error);
        },
        error
    );

};



let login = this.login = function () {

    $(constants.loginModal).modal('hide');
    updateAlert('Logging you in...');


    submitLogin(function (err0, res0) {
        if (!err0) {
            flags.loggedIn = true;
            getUserProjects();
            updateAlert('You are now logged in!', true, 1000);
            updateUserGUI();

        } else {
            flags.loggedIn = false;
            console.error(err0);
            updateAlert('Incorrect username or password. Please try again.', true, 2000);
            updateModal(constants.loginModal, true, true, 2000);
        }
    });
};

let logout = this.logout = function () {
    cloud.getCSRFToken();

    updateAlert('Logging you out...');

    let signOut = function () {
        let succ0 = function (data) {
            globals.userID = -1;
            globals.userName = '';
            globals.projectID = '';
            flags.loggedIn = false;
            updateAlert('Successfully Logged Out!', true, 1000);
            updateUserGUI();

        };
        let err0 = function (data) {
            updateAlert('Error signing you out. Please try again.', true, 2000);
            console.error(data);
        };
        cloud.logout(succ0, err0);
    };

    signOut();
};

initOnline();

checkForEncryption();
loadCanvas();
loadBraids();