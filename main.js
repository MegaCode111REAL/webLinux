/* global V86Starter */

const matrixCanvas = document.getElementById("matrix");
const logEl = document.getElementById("log");
const launchBtn = document.getElementById("launchBtn");
const screenEl = document.getElementById("screen");
const controlButtons = document.querySelectorAll(".cmd");

let emulator = null;
let isBooting = false;
let isRunning = false;

const bootMessages = [
  "> Connecting to VM node...",
  "> Loading BIOS...",
  "> Allocating RAM...",
  "> Mounting virtual disk...",
  "> Initializing hypervisor...",
  "> Booting kernel...",
];

const ambientMessages = [
  "[trace] Packet stream stable.",
  "[watch] Entropy pool refreshed.",
  "[info] Security daemon synced.",
  "[scan] Ports sealed.",
  "[pulse] Cooling array nominal.",
];

function addLogLine(text, ephemeral = false) {
  const line = document.createElement("div");
  line.className = "log-line";
  line.textContent = text;
  logEl.appendChild(line);

  if (ephemeral) {
    setTimeout(() => {
      line.style.opacity = "0";
      line.style.transition = "opacity 0.6s ease";
      setTimeout(() => line.remove(), 700);
    }, 1500);
  }

  logEl.scrollTop = logEl.scrollHeight;
}

function clearLog() {
  logEl.innerHTML = "";
}

function bootSequence() {
  if (isBooting || isRunning) return;
  isBooting = true;
  clearLog();

  bootMessages.forEach((msg, index) => {
    setTimeout(() => addLogLine(msg), 600 * index);
  });

  setTimeout(() => {
    startEmulator();
    isBooting = false;
  }, bootMessages.length * 600 + 600);
}

function startEmulator() {
  if (!emulator) {
    screenEl.textContent = "";
    emulator = new V86Starter({
      wasm_path: "assets/v86.wasm",
      bios: { url: "assets/seabios.bin" },
      vga_bios: { url: "assets/vgabios.bin" },
      hda: { url: "assets/ubuntu-lxde.img" },
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: screenEl,
      autostart: false,
    });
  }

  emulator.run();
  isRunning = true;
  addLogLine("> VM online. Session active.");
}

function stopEmulator() {
  if (!emulator) return;
  emulator.stop();
  isRunning = false;
  addLogLine("> VM stopped.");
}

function resetEmulator() {
  if (!emulator) return;
  emulator.reset();
  addLogLine("> VM reset issued.");
}

function fullscreenEmulator() {
  const canvas = screenEl.querySelector("canvas");
  if (canvas && canvas.requestFullscreen) {
    canvas.requestFullscreen();
  }
}

launchBtn.addEventListener("click", () => {
  if (isRunning) {
    addLogLine("> VM already active.");
    return;
  }
  bootSequence();
});

controlButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if (action === "start") bootSequence();
    if (action === "stop") stopEmulator();
    if (action === "reset") resetEmulator();
    if (action === "fullscreen") fullscreenEmulator();
  });
});

function ambientLogPulse() {
  const message = ambientMessages[Math.floor(Math.random() * ambientMessages.length)];
  addLogLine(message, true);
}

setInterval(ambientLogPulse, 4200);

// Matrix rain background animation
const matrixCtx = matrixCanvas.getContext("2d");
const glyphs = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%";
let columns = 0;
let drops = [];

function resizeMatrix() {
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  columns = Math.floor(matrixCanvas.width / 16);
  drops = Array(columns).fill(1);
}

function drawMatrix() {
  matrixCtx.fillStyle = "rgba(0, 0, 0, 0.08)";
  matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  matrixCtx.fillStyle = "rgba(0, 255, 0, 0.6)";
  matrixCtx.font = "14px Fira Code";

  drops.forEach((y, index) => {
    const text = glyphs[Math.floor(Math.random() * glyphs.length)];
    const x = index * 16;
    matrixCtx.fillText(text, x, y * 16);
    if (y * 16 > matrixCanvas.height && Math.random() > 0.975) {
      drops[index] = 0;
    }
    drops[index]++;
  });

  requestAnimationFrame(drawMatrix);
}

window.addEventListener("resize", resizeMatrix);
resizeMatrix();
drawMatrix();
