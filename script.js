const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");
const frameImg = document.getElementById("frame");
const result = document.getElementById("result");

let mirror = false;
let stickers = [];
let photos = [];
let shotIndex = 0;

const layouts = {
  grid3x2: {
    shots: 6,
    canvas: { w: 600, h: 600 },
    cells: [
      [0,0],[300,0],[0,200],
      [300,200],[0,400],[300,400]
    ],
    cellSize: [300,200]
  },
  strip3: {
    shots: 3,
    canvas: { w: 600, h: 1200 },
    cells: [
      [0,0],[0,400],[0,800]
    ],
    cellSize: [600,400]
  }
};

let currentLayout = layouts.grid3x2;

navigator.mediaDevices.getUserMedia({
  video: { facingMode: "user" }
}).then(s => video.srcObject = s);

// COVER DRAW (ANTI GEPENG)
function drawCover(ctx, video, x, y, w, h) {
  const vr = video.videoWidth / video.videoHeight;
  const cr = w / h;
  let sx, sy, sw, sh;

  if (vr > cr) {
    sh = video.videoHeight;
    sw = sh * cr;
    sx = (video.videoWidth - sw) / 2;
    sy = 0;
  } else {
    sw = video.videoWidth;
    sh = sw / cr;
    sx = 0;
    sy = (video.videoHeight - sh) / 2;
  }

  ctx.drawImage(video, sx, sy, sw, sh, x, y, w, h);
}

// MIRROR
function toggleMirror() {
  mirror = !mirror;
  video.style.transform = mirror ? "scaleX(-1)" : "scaleX(1)";
}

// LAYOUT
function selectLayout(name) {
  currentLayout = layouts[name];
  photos = [];
  shotIndex = 0;
  alert("Layout dipilih 📐");
}

// FRAME
function setFrame(src) {
  frameImg.src = src;
}

// TIMER
function startTimer(sec) {
  let c = sec;
  const t = setInterval(() => {
    alert(c);
    c--;
    if (c < 0) {
      clearInterval(t);
      takeShot();
    }
  }, 1000);
}

// TAKE SHOT
function takeShot() {
  const temp = document.createElement("canvas");
  temp.width = 600;
  temp.height = 400;
  const tctx = temp.getContext("2d");

  if (mirror) {
    tctx.save();
    tctx.scale(-1,1);
    drawCover(tctx, video, -600, 0, 600, 400);
    tctx.restore();
  } else {
    drawCover(tctx, video, 0, 0, 600, 400);
  }

  photos.push(temp);
  shotIndex++;

  if (shotIndex === currentLayout.shots) {
    compose();
  }
}

// COMPOSE FINAL
function compose() {
  canvas.width = currentLayout.canvas.w;
  canvas.height = currentLayout.canvas.h;

  photos.forEach((p,i) => {
    const [x,y] = currentLayout.cells[i];
    const [w,h] = currentLayout.cellSize;
    ctx.drawImage(p, x, y, w, h);
  });

  if (frameImg.src) {
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  }

  result.src = canvas.toDataURL("image/png");
}

// STICKER
function addSticker(src) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "sticker";
  img.style.left = "150px";
  img.style.top = "100px";
  stage.appendChild(img);
  makeDraggable(img);
  stickers.push(img);
}

function makeDraggable(el) {
  let ox, oy;
  el.addEventListener("touchstart", e => {
    const t = e.touches[0];
    ox = t.clientX - el.offsetLeft;
    oy = t.clientY - el.offsetTop;
  });
  el.addEventListener("touchmove", e => {
    e.preventDefault();
    const t = e.touches[0];
    el.style.left = (t.clientX - ox) + "px";
    el.style.top = (t.clientY - oy) + "px";
  });
}

// DOWNLOAD
function download() {
  const a = document.createElement("a");
  a.download = "photobooth.png";
  a.href = canvas.toDataURL();
  a.click();
}
