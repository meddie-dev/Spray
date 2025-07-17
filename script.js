const canvas = document.getElementById('sprayCanvas');
const ctx = canvas.getContext('2d');
const img = document.getElementById('hiddenImage');
const revealImage = document.getElementById('revealImage');
const music = document.getElementById('music');
const spraySound = document.getElementById('spraySound');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const radiusSlider = document.getElementById('radiusSlider');
const radiusValue = document.getElementById('radiusValue');
const strengthSlider = document.getElementById('strengthSlider');
const strengthValue = document.getElementById('strengthValue');
const cursorPreview = document.getElementById('cursorPreview');
const resetBtn = document.getElementById('resetBtn');
const confettiBtn = document.getElementById('confettiBtn');
const handBtn = document.getElementById('handBtn');
const topRightButtons = document.getElementById('topRightButtons');

let sprayRadius = +radiusSlider.value;
let sprayStrength = +strengthSlider.value;
let painting = false;
let revealTriggered = false;
let checkDelay = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

radiusSlider.oninput = () => {
  sprayRadius = +radiusSlider.value;
  radiusValue.textContent = sprayRadius;
};

strengthSlider.oninput = () => {
  sprayStrength = +strengthSlider.value;
  strengthValue.textContent = sprayStrength;
};

function spray(x, y) {
  const density = Math.floor(Math.PI * sprayRadius * sprayRadius * (sprayStrength / 200));
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < density; i++) {
    const offsetX = Math.random() * sprayRadius * 2 - sprayRadius;
    const offsetY = Math.random() * sprayRadius * 2 - sprayRadius;
    if (offsetX ** 2 + offsetY ** 2 <= sprayRadius ** 2) {
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  if (++checkDelay % 5 === 0) updateRevealProgress();
}

function updateRevealProgress() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let transparentPixels = 0;
  for (let i = 3; i < imageData.length; i += 4) {
    if (imageData[i] === 0) transparentPixels++;
  }

  const percent = transparentPixels / (canvas.width * canvas.height);
  progressBar.style.width = Math.round(percent * 100) + '%';

  if (percent >= 0.6 && !revealTriggered) {
    revealTriggered = true;
    triggerReveal();
  }
}

function triggerReveal() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  progressContainer.style.display = 'none';
  document.querySelector('.sliderBox').style.display = 'none';
  topRightButtons.style.display = 'flex';
  music.play().catch(() => {});
  confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
}

function startPainting(e) {
  if (tutorialActive) return;
  painting = true;
  draw(e);
  spraySound.currentTime = 0;
  spraySound.play().catch(() => {});
}

function stopPainting() {
  painting = false;
  spraySound.pause();
}

function draw(e) {
  if (!painting || tutorialActive) return;
  const { x, y } = getXY(e);
  spray(x, y);
  updateCursorPreview({ x, y });
}

function getXY(e) {
  if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

function updateCursorPreview({ x, y }) {
  const size = sprayRadius * 2;
  cursorPreview.style.width = `${size}px`;
  cursorPreview.style.height = `${size}px`;
  cursorPreview.style.transform = `translate(${x - sprayRadius}px, ${y - sprayRadius}px)`;
}

document.addEventListener('mousemove', e => updateCursorPreview(getXY(e)));
document.addEventListener('touchmove', e => updateCursorPreview(getXY(e)));

resetBtn.addEventListener('click', () => {
  spraySound.pause();
  music.pause();
  music.currentTime = 0;
  progressContainer.style.display = 'block';
  document.querySelector('.sliderBox').style.display = 'block';
  topRightButtons.style.display = 'none';
  revealTriggered = false;
  progressBar.style.width = '0%';
  resizeCanvas();
  revealImage.classList.remove('show');
  img.classList.remove('zoomedOut');
  handBtn.classList.remove('hide');
  handBtn.style.display = 'flex';
});

confettiBtn.addEventListener('click', () => {
  confetti({ particleCount: 150, spread: 80 });
});

handBtn.addEventListener('click', () => {
  revealImage.classList.add('show');
  img.classList.add('zoomedOut');
  handBtn.classList.add('hide');
  setTimeout(() => {
    handBtn.style.display = 'none';
  }, 1000);
});

canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mouseleave', stopPainting);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', startPainting);
canvas.addEventListener('touchend', stopPainting);
canvas.addEventListener('touchcancel', stopPainting);
canvas.addEventListener('touchmove', draw);

// Tutorial Countdown
let tutorialActive = true;
canvas.style.pointerEvents = 'none';

let countdown = 10;
const countdownText = document.getElementById('countdownText');
const startTutorialBtn = document.getElementById('startTutorialBtn');

const interval = setInterval(() => {
  countdown--;
  countdownText.textContent = `Please wait... ${countdown}`;
  if (countdown === 0) {
    clearInterval(interval);
    countdownText.style.display = 'none';
    startTutorialBtn.style.display = 'inline-block';
  }
}, 1000);

startTutorialBtn.addEventListener('click', () => {
  document.getElementById('tutorialOverlay').style.display = 'none';
  tutorialActive = false;
  canvas.style.pointerEvents = 'auto';
});
