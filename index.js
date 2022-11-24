const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');
let img = new Image(733, 733)

const log = console.log

img.src = "static/1.svg"
img.onload = function () {
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;

    ctx.drawImage(this, 0, 0);
}

function generateNewImage() {
    const randomIndex = Math.floor(Math.random() * 28) + 1;
    img.src = `static/${randomIndex}.svg`
}

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;
let imageIndex;
let startX;
let startY;

toolbar.addEventListener('click', e => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    }
    if (e.target.id === 'next') {
        generateNewImage()
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    }
});

const ongoingTouches = [];

function copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        const id = ongoingTouches[i].identifier;

        if (id === idToFind) {
            return i;
        }
    }
    return -1;    // not found
}

function handleTouchStart(evt) {
    evt.preventDefault();
    log('touchstart.');
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        log(`touchstart: ${touches[i].pageX}, ${touches[i].pageY}.`);
        ongoingTouches.push(copyTouch(touches[i]));
        ctx.beginPath();
    }
}

function handleTouchMove(evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        const idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            log(`continuing touch ${idx}`);
            ctx.beginPath();
            ctx.moveTo(
                ongoingTouches[idx].pageX - canvasOffsetX,
                ongoingTouches[idx].pageY
            );
            ctx.lineTo(
                touches[i].pageX - canvasOffsetX,
                touches[i].pageY
            );
            ctx.lineWidth = lineWidth;
            ctx.stroke();

            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        } else {
            log('can\'t figure out which touch to continue');
        }
    }
}


function handleTouchEnd(evt) {
    evt.preventDefault();
    log("touchend");
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX - canvasOffsetX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX - canvasOffsetX, touches[i].pageY);
            ongoingTouches.splice(idx, 1);  // remove it; we're done
        } else {
            log('can\'t figure out which touch to end');
        }
    }
}

// canvas.addEventListener('touchcancel', endHandler)
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);