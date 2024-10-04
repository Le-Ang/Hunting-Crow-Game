const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

const layerCanvas = document.getElementById("layerCanvas");
const layerCtx = layerCanvas.getContext("2d");
layerCanvas.width = window.innerWidth;
layerCanvas.height = window.innerHeight;

const aim = new Image();
aim.src = "aim.png";

const backgroundLayer1 = new Image();
backgroundLayer1.src = "parallax-mountain-bg.png";
const backgroundLayer2 = new Image();
backgroundLayer2.src = "parallax-mountain-montain-far.png";
const backgroundLayer3 = new Image();
backgroundLayer3.src = "parallax-mountain-mountains.png";
const backgroundLayer4 = new Image();
backgroundLayer4.src = "parallax-mountain-foreground-trees.png";
const backgroundLayer5 = new Image();
backgroundLayer5.src = "parallax-mountain-trees.png";

let bgAudio = new Audio("BgMusic.mp3");
bgAudio.play();
bgAudio.loop = true;
let ravenCaw = new Audio("ravencaw.wav");

let score = 0;
let gameOver = false;
ctx.font = "50px Impact";

let timeToNextRaven = 0;
let ravenInterval = 1000;
let lastTime = 0;

let ravens = [];
class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = "raven.png";
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
    this.hasTrail = Math.random() > 0.5;
  }
  update(deltatime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
    this.timeSinceFlap += deltatime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
      if (this.hasTrail) {
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (this.x < 0 - this.width) gameOver = true;
  }
  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let explosions = [];
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "Boom.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markedForDeletion = false;
  }
  update(deltatime) {
    if (this.frame === 0) {
      this.sound.play();
      ravenCaw.play();
    }
    this.timeSinceLastFrame += deltatime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size / 4,
      this.size,
      this.size
    );
  }
}

let particles = [];
class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size / 2 + Math.random() * 50 - 25;
    this.y = y + this.size / 3 + Math.random() * 50 - 25;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + 35;
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.3;
    if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Layer {
  constructor(image) {
    this.x = 0;
    this.y = 0;
    this.width = layerCanvas.width;
    this.height = layerCanvas.height;
    this.image = image;
  }
  draw() {
    layerCtx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

const layer1 = new Layer(backgroundLayer1);
const layer2 = new Layer(backgroundLayer2);
const layer3 = new Layer(backgroundLayer3);
const layer4 = new Layer(backgroundLayer4);
const layer5 = new Layer(backgroundLayer5);

const layer = [layer1, layer2, layer3, layer4, layer5];

const mouse = {
  x: undefined,
  y: undefined,
};

function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 100, 75);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 105, 80);
}

function drawGameOver() {
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.font = "100px Impact";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 3);
  ctx.fillStyle = "white";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 3 + 5);
  ctx.font = "40px Impact";
  ctx.fillText(
    "Your score is : " + score,
    canvas.width / 2,
    canvas.height / 2 + 5
  );
}

function drawAimingPoint() {
  if (!gameOver && ispaused == false) {
    ctx.drawImage(aim, mouse.x - 25, mouse.y - 25, 50, 50);
  }
}

function isInsideButton(pos, rect) {
  return (
    pos.x > rect.x &&
    pos.x < rect.x + rect.width &&
    pos.y < rect.y + rect.height &&
    pos.y > rect.y
  );
}
let ispaused = false;
const pauseBtn = {
  x: 1400,
  y: 50,
  width: 40,
  height: 30,
  color: "white",
};
const continueBtn = {
  x: canvas.width / 2.3,
  y: canvas.height / 3,
  width: 200,
  height: 70,
  color: "white",
};
const restartBtn = {
  x: canvas.width / 2.3,
  y: canvas.height / 1.7,
  width: 200,
  height: 70,
  color: "white",
};
function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
function drawPauseButton(btn, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = "black";
  ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
  ctx.lineWidth = 4;
  ctx.strokeRect(btn.x, btn.y, btn.width / 2, btn.height);
  ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
}
function drawContinueButton(btn, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = "black";
  ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
  ctx.lineWidth = 4;
  ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.font = "50px Impact";
  ctx.fillText("Continue", canvas.width / 2, canvas.height / 2.4);
}
function drawRestartButton(btn, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = "black";
  ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
  ctx.lineWidth = 4;
  ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.font = "50px Impact";
  ctx.fillText("Restart", canvas.width / 2, canvas.height / 1.5);
}
window.addEventListener("click", function (e) {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  const mousePos = getMousePos(canvas, e);
  const pc = detectPixelColor.data;
  ravens.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      //collision detected
      object.markedForDeletion = true;
      score++;
      explosions.push(new Explosion(object.x, object.y, object.width));
    }
  });
  if (
    isInsideButton(mousePos, pauseBtn) &&
    ispaused === false &&
    gameOver == false
  ) {
    ispaused = true;
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.font = "100px Impact";
    ctx.fillText("Pause Game", canvas.width / 2, canvas.height / 4);
    drawContinueButton(continueBtn, continueBtn.color);
  }
  if (
    isInsideButton(mousePos, continueBtn) &&
    ispaused === true &&
    gameOver == false
  ) {
    ispaused = false;
    requestAnimationFrame(animate);
  }
  if (isInsideButton(mousePos, restartBtn)) {
    location.reload();
  }
});

canvas.addEventListener("mousemove", function (event) {
  (mouse.x = event.x), (mouse.y = event.y);
  drawAimingPoint();
});

function animate(timestamp) {
  if (ispaused == true) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
  layerCtx.clearRect(0, 0, canvas.width, canvas.height);
  layer.forEach((object) => {
    object.draw();
  });
  let deltatime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextRaven += deltatime;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort(function (a, b) {
      return a.width - b.width;
    });
  }
  drawScore();
  drawAimingPoint();
  drawPauseButton(pauseBtn, pauseBtn.color);
  [...particles, ...ravens, ...explosions].forEach((Object) =>
    Object.update(deltatime)
  );
  [...particles, ...ravens, ...explosions].forEach((Object) => Object.draw());
  ravens = ravens.filter((Object) => !Object.markedForDeletion);
  explosions = explosions.filter((Object) => !Object.markedForDeletion);
  particles = particles.filter((Object) => !Object.markedForDeletion);
  if (!gameOver) {
    requestAnimationFrame(animate);
  } else {
    cancelAnimationFrame(animate);
    drawGameOver();
    drawRestartButton(restartBtn, restartBtn.color);
  }
}
animate(0);
