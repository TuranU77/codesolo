const apps = [
  {
    name: "HUP",
    tagline: "A quick indie game made by a one-man studio fueled by too much coffee.",
    appStoreUrl: "https://apps.apple.com/ca/app/hup-shell-of-a-journey/id6758862472",
    privacyUrl: "https://turanu77.github.io/codesolo/privacy/hup.html",
    info: "A compact game project from a one-man indie studio. No user data is collected."
  },
  {
    name: "LUNIO - Good Night, Dear Moon",
    tagline: "A cozy bedtime game for little night explorers.",
    appStoreUrl: "https://apps.apple.com/de/app/lunio-gute-nacht-lieber-mond/id6757497490",
    privacyUrl: "https://turanu77.github.io/codesolo/privacy/lunio.html",
    info: "A calm bedtime story game with friendly interactions and sleepy moon vibes."
  },
  {
    name: "WOLF - Party Game",
    tagline: "Fast, loud, social chaos for your next game night.",
    appStoreUrl: "https://apps.apple.com/de/app/wolf-party-game/id6747474675",
    privacyUrl: "https://turanu77.github.io/codesolo/privacy/wolf.html",
    info: "A social party game built for quick rounds, big laughs, and chaotic group energy."
  }
];

const gameInfoContent = document.getElementById("game-info-content");
const year = document.getElementById("year");
const desktop = document.getElementById("desktop");
const impactWorld = document.getElementById("impact-world");
const fpsHud = document.getElementById("fps-hud");
const errorTargetLayer = document.getElementById("error-target-layer");
const taskbar = document.getElementById("taskbar");
const bugblasterFile = document.getElementById("bugblaster-file");
const contactMail = document.getElementById("contact-mail");
const maxWindowHits = 5;
const maxErrorTargetHits = 3;
const maxBlastMarks = 96;
const autoRepairDelay = 3400;
const blastShakeCooldown = 45;
const fpsWorldScale = 1.04;
const aimSensitivity = 1.35;
const blastSoundUrl = "./assets/gun_1.mp3";
const destroySoundUrl = "./assets/glass.mp3";
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

const errorTargets = [
  {
    title: "BUILD FAILED",
    message: "Module not found: ./motivation",
    left: "108vw",
    top: "16vh",
    rotate: "-2deg"
  },
  {
    title: "NULL POINTER",
    message: "Cannot read properties of undefined coffee.",
    left: "-22vw",
    top: "24vh",
    rotate: "2deg"
  },
  {
    title: "MERGE CONFLICT",
    message: "<<<<<<< panic.js",
    left: "106vw",
    top: "66vh",
    rotate: "1deg"
  },
  {
    title: "STACK OVERFLOW",
    message: "RecursionError: too much thinking.",
    left: "-20vw",
    top: "76vh",
    rotate: "-1deg"
  },
  {
    title: "404",
    message: "Fun not found. Retry?",
    left: "42vw",
    top: "-22vh",
    rotate: "1deg"
  },
  {
    title: "LINTER ALERT",
    message: "Expected semicolon, found destiny.",
    left: "64vw",
    top: "108vh",
    rotate: "-2deg"
  },
  {
    title: "PROD IS DOWN",
    message: "It worked on my machine.",
    left: "112vw",
    top: "42vh",
    rotate: "3deg"
  },
  {
    title: "TODO LEAK",
    message: "fix later escaped containment.",
    left: "-24vw",
    top: "52vh",
    rotate: "-3deg"
  }
];

year.textContent = new Date().getFullYear();

function renderContactMail() {
  const contact = ["design", "usuk", "de"];
  const address = `${contact[0]}@${contact[1]}.${contact[2]}`;

  contactMail.href = `${["mai", "lto"].join("")}:${address}`;
  contactMail.textContent = address;
}

function renderErrorTargets() {
  errorTargetLayer.innerHTML = errorTargets
    .map(
      (target, index) => `
        <button
          class="error-target"
          type="button"
          data-error-target
          data-hits="0"
          style="left: ${target.left}; top: ${target.top}; --target-rotation: ${target.rotate}"
        >
          <span class="error-target-title">${target.title}</span>
          <span class="error-target-message">${target.message}</span>
          <span class="error-target-code">ERR_${String(index + 1).padStart(2, "0")}</span>
        </button>
      `
    )
    .join("");
}

function resetErrorTargets() {
  document.querySelectorAll("[data-error-target]").forEach((target) => {
    target.classList.remove("damaged", "shattering", "destroyed");
    target.dataset.hits = "0";
  });
}

let chaosMode = false;
let isAutoFiring = false;
let gameWon = false;
let autoFireTimer = null;
let lastBlastEvent = null;
let autoRepairTimer = null;
let chaosExitButton = null;
let audioContext = null;
let audioLoadStarted = false;
let blastAudioBuffer = null;
let destroyAudioBuffer = null;
let fallbackBlastSoundPool = [];
let fallbackBlastSoundIndex = 0;
let fallbackDestroySoundPool = [];
let fallbackDestroySoundIndex = 0;
let worldX = 0;
let worldY = 0;
let weaponFlashTimer = null;
let blastShakeTimer = null;
let lastBlastShakeAt = 0;
let blastShakeVariant = false;
let weaponRecoilVariant = false;
let blastMarkPool = [];
let activeBlastMarks = [];
let nextBlastMarkIndex = 0;
let pendingWorldMovementX = 0;
let pendingWorldMovementY = 0;
let worldFrameRequested = false;
let lastAimMovementTime = 0;
let lastAimMovementX = 0;
let lastAimMovementY = 0;

function renderAppWindows() {
  document.querySelectorAll(".app-window").forEach((win) => {
    const appIndex = Number(win.dataset.appIndex);
    const app = apps[appIndex];
    const body = win.querySelector(".app-window-body");

    body.innerHTML = `
      <h3 class="app-name">${app.name}</h3>
      <p class="app-tagline">${app.tagline}</p>
      <div class="app-links">
        <a class="chip" href="${app.appStoreUrl}" target="_blank" rel="noreferrer noopener">App Store</a>
        <a class="chip" href="${app.privacyUrl}" target="_blank" rel="noreferrer noopener">Privacy</a>
        <button class="chip js-open-info" type="button" data-app-index="${appIndex}">Info</button>
      </div>
    `;
  });
}

let topZ = 20;

function focusWindow(win) {
  topZ += 1;
  win.style.zIndex = topZ;
  document.querySelectorAll(".task-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.window === win.dataset.window);
  });
}

function buildTaskbar() {
  const windows = Array.from(document.querySelectorAll(".window"));
  windows.forEach((win) => {
    const button = document.createElement("button");
    button.className = "task-btn";
    button.dataset.window = win.dataset.window;
    button.textContent = win.querySelector(".titlebar p").textContent;
    button.addEventListener("click", () => {
      if (win.classList.contains("destroyed") || win.classList.contains("shattering")) return;
      win.classList.remove("hidden");
      setMinimized(win, false);
      focusWindow(win);
    });
    taskbar.appendChild(button);
  });
}

function setMinimized(win, shouldMinimize) {
  const minimizeBtn = win.querySelector('[data-action="minimize"]');
  if (shouldMinimize) {
    win.classList.add("minimized");
    minimizeBtn.textContent = "+";
    minimizeBtn.setAttribute("aria-label", "Restore");
    return;
  }
  win.classList.remove("minimized");
  minimizeBtn.textContent = "_";
  minimizeBtn.setAttribute("aria-label", "Minimize");
}

function enableWindowActions() {
  document.querySelectorAll(".window").forEach((win) => {
    const minimizeBtn = win.querySelector('[data-action="minimize"]');
    const closeBtn = win.querySelector('[data-action="close"]');

    minimizeBtn.addEventListener("click", () => {
      setMinimized(win, !win.classList.contains("minimized"));
      focusWindow(win);
    });

    closeBtn.addEventListener("click", () => {
      win.classList.add("hidden");
      setMinimized(win, false);
    });

    win.addEventListener("mousedown", () => focusWindow(win));
  });
}

function enableInfoButtons() {
  document.querySelectorAll(".js-open-info").forEach((button) => {
    button.addEventListener("click", () => {
      const app = apps[Number(button.dataset.appIndex)];
      const infoWindow = document.querySelector('[data-window="info"]');
      gameInfoContent.innerHTML = `
        <h3 class="app-name">${app.name}</h3>
        <p class="app-tagline">${app.tagline}</p>
        <p>${app.info}</p>
        <div class="app-links">
          <a class="chip" href="${app.appStoreUrl}" target="_blank" rel="noreferrer noopener">Open in App Store</a>
        </div>
      `;
      infoWindow.classList.remove("hidden");
      setMinimized(infoWindow, false);
      focusWindow(infoWindow);
    });
  });
}

function enableDragging() {
  if (window.matchMedia("(max-width: 700px)").matches) return;

  document.querySelectorAll(".window").forEach((win) => {
    const handle = win.querySelector(".handle");
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    handle.addEventListener("mousedown", (event) => {
      if (chaosMode) return;
      if (event.target.closest(".action-btn")) return;
      if (win.classList.contains("destroyed") || win.classList.contains("shattering")) return;
      isDragging = true;
      focusWindow(win);
      startX = event.clientX - win.offsetLeft;
      startY = event.clientY - win.offsetTop;
      document.body.style.userSelect = "none";
    });

    window.addEventListener("mousemove", (event) => {
      if (!isDragging) return;
      const maxLeft = desktop.clientWidth - win.offsetWidth;
      const maxTop = desktop.clientHeight - win.offsetHeight;
      const nextLeft = Math.min(Math.max(0, event.clientX - startX), maxLeft);
      const nextTop = Math.min(Math.max(0, event.clientY - startY), maxTop);
      win.style.left = `${nextLeft}px`;
      win.style.top = `${nextTop}px`;
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
  });
}

function enableDesktopFileDragging() {
  if (window.matchMedia("(max-width: 700px)").matches) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let moved = false;

  bugblasterFile.addEventListener("pointerdown", (event) => {
    if (chaosMode) return;

    isDragging = true;
    moved = false;
    startX = event.clientX - bugblasterFile.offsetLeft;
    startY = event.clientY - bugblasterFile.offsetTop;
    bugblasterFile.setPointerCapture(event.pointerId);
    document.body.style.userSelect = "none";
  });

  bugblasterFile.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const maxLeft = desktop.clientWidth - bugblasterFile.offsetWidth;
    const maxTop = desktop.clientHeight - bugblasterFile.offsetHeight;
    const nextLeft = Math.min(Math.max(0, event.clientX - startX), maxLeft);
    const nextTop = Math.min(Math.max(0, event.clientY - startY), maxTop);

    if (Math.abs(nextLeft - bugblasterFile.offsetLeft) > 2 || Math.abs(nextTop - bugblasterFile.offsetTop) > 2) {
      moved = true;
    }

    bugblasterFile.style.left = `${nextLeft}px`;
    bugblasterFile.style.top = `${nextTop}px`;
  });

  bugblasterFile.addEventListener("pointerup", (event) => {
    isDragging = false;
    document.body.style.userSelect = "";
    bugblasterFile.dataset.dragged = moved ? "true" : "false";
    window.setTimeout(() => {
      bugblasterFile.dataset.dragged = "false";
    }, 180);
    if (bugblasterFile.hasPointerCapture(event.pointerId)) {
      bugblasterFile.releasePointerCapture(event.pointerId);
    }
  });
}

function setWorldPan(nextX, nextY) {
  const maxPanX = Math.round(window.innerWidth * 0.82);
  const maxPanY = Math.round((window.innerHeight - 56) * 0.82);

  worldX = Math.min(Math.max(nextX, -maxPanX), maxPanX);
  worldY = Math.min(Math.max(nextY, -maxPanY), maxPanY);
  desktop.style.setProperty("--world-x", `${worldX}px`);
  desktop.style.setProperty("--world-y", `${worldY}px`);
  impactWorld.style.setProperty("--world-x", `${worldX}px`);
  impactWorld.style.setProperty("--world-y", `${worldY}px`);
}

function resetWorldPan() {
  worldX = 0;
  worldY = 0;
  pendingWorldMovementX = 0;
  pendingWorldMovementY = 0;
  desktop.style.removeProperty("--world-x");
  desktop.style.removeProperty("--world-y");
  impactWorld.style.removeProperty("--world-x");
  impactWorld.style.removeProperty("--world-y");
}

function applyQueuedWorldMovement() {
  worldFrameRequested = false;
  if (!chaosMode) {
    pendingWorldMovementX = 0;
    pendingWorldMovementY = 0;
    return;
  }

  if (pendingWorldMovementX || pendingWorldMovementY) {
    setWorldPan(
      worldX - pendingWorldMovementX * aimSensitivity,
      worldY - pendingWorldMovementY * aimSensitivity
    );
    pendingWorldMovementX = 0;
    pendingWorldMovementY = 0;
    scheduleAutoRepair();
  }
}

function queueWorldMovement(movementX, movementY) {
  pendingWorldMovementX += movementX;
  pendingWorldMovementY += movementY;
  if (worldFrameRequested) return;

  worldFrameRequested = true;
  window.requestAnimationFrame(applyQueuedWorldMovement);
}

function handleAimMovement(event) {
  if (!chaosMode || gameWon) return;

  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;
  if (!movementX && !movementY) return;

  const isDuplicateMovement =
    event.timeStamp - lastAimMovementTime < 4 &&
    movementX === lastAimMovementX &&
    movementY === lastAimMovementY;
  if (isDuplicateMovement) return;

  lastAimMovementTime = event.timeStamp;
  lastAimMovementX = movementX;
  lastAimMovementY = movementY;
  queueWorldMovement(movementX, movementY);
}

function getCenterAimPoint() {
  return {
    x: Math.round(window.innerWidth / 2),
    y: Math.round((window.innerHeight - 56) / 2)
  };
}

function getWorldPoint(clientX, clientY) {
  const width = window.innerWidth;
  const height = window.innerHeight - 56;
  const scale = chaosMode ? fpsWorldScale : 1;
  const scaledOffsetX = (1 - scale) * width * 0.5;
  const scaledOffsetY = (1 - scale) * height * 0.5;

  return {
    x: (clientX - worldX - scaledOffsetX) / scale,
    y: (clientY - worldY - scaledOffsetY) / scale
  };
}

function requestGamePointerLock() {
  if (document.pointerLockElement || !desktop.requestPointerLock) return;

  let lockRequest;
  try {
    lockRequest = desktop.requestPointerLock({ unadjustedMovement: true });
  } catch (error) {
    lockRequest = desktop.requestPointerLock();
  }
  if (lockRequest?.catch) {
    lockRequest.catch((error) => {
      if (error.name === "NotSupportedError") {
        desktop.requestPointerLock?.();
      }
    });
  }
}

function getAimEvent() {
  const center = getCenterAimPoint();
  const clientX = center.x;
  const clientY = center.y;
  const target = document.elementFromPoint(clientX, clientY) || desktop;

  return { clientX, clientY, target };
}

function setChaosMode(shouldEnable) {
  chaosMode = shouldEnable;
  document.body.classList.toggle("chaos-mode", chaosMode);
  document.body.classList.toggle("fps-mode", chaosMode);
  desktop.classList.toggle("fps-world", chaosMode);
  fpsHud.setAttribute("aria-hidden", chaosMode ? "false" : "true");
  bugblasterFile.classList.toggle("active", chaosMode);
  if (chaosExitButton) {
    chaosExitButton.classList.toggle("hidden", !chaosMode);
  }
  if (chaosMode) {
    gameWon = false;
    document.body.classList.remove("game-won");
    resetWorldPan();
    resetErrorTargets();
    createBlastMarkPool();
    prepareAudioPools();
    warmAudioPools();
    scheduleAutoRepair();
  }
  if (!chaosMode) {
    stopAutoFire();
    resetWorldPan();
    if (document.pointerLockElement === desktop) {
      document.exitPointerLock();
    }
  }
}

function getAudioContext() {
  if (!AudioContextClass) return null;
  if (!audioContext) {
    audioContext = new AudioContextClass({ latencyHint: "interactive" });
  }
  return audioContext;
}

async function loadAudioBuffer(url) {
  const context = getAudioContext();
  if (!context) return null;

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return context.decodeAudioData(buffer);
}

function createFallbackAudioPool(url, size, volume) {
  return Array.from({ length: size }, () => {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = volume;
    audio.load();
    return audio;
  });
}

function prepareFallbackAudioPools() {
  if (!fallbackBlastSoundPool.length) {
    fallbackBlastSoundPool = createFallbackAudioPool(blastSoundUrl, 8, 0.78);
  }
  if (!fallbackDestroySoundPool.length) {
    fallbackDestroySoundPool = createFallbackAudioPool(destroySoundUrl, 3, 1);
  }
}

function prepareAudioPools() {
  prepareFallbackAudioPools();
  if (audioLoadStarted) return;

  audioLoadStarted = true;
  loadAudioBuffer(blastSoundUrl)
    .then((buffer) => {
      blastAudioBuffer = buffer;
    })
    .catch(() => {});
  loadAudioBuffer(destroySoundUrl)
    .then((buffer) => {
      destroyAudioBuffer = buffer;
    })
    .catch(() => {});
}

function warmAudioPools() {
  const context = getAudioContext();
  prepareAudioPools();
  if (context?.state === "suspended") {
    context.resume().catch(() => {});
  }
}

function playAudioBuffer(buffer, volume) {
  const context = getAudioContext();
  if (!context || !buffer) return;

  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(context.destination);
  source.start();
}

function playBlastSound() {
  if (blastAudioBuffer) {
    playAudioBuffer(blastAudioBuffer, 0.78);
    return;
  }

  const audio = fallbackBlastSoundPool[fallbackBlastSoundIndex];
  fallbackBlastSoundIndex = (fallbackBlastSoundIndex + 1) % fallbackBlastSoundPool.length;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function playDestroySound() {
  if (destroyAudioBuffer) {
    playAudioBuffer(destroyAudioBuffer, 1);
    return;
  }

  const audio = fallbackDestroySoundPool[fallbackDestroySoundIndex];
  fallbackDestroySoundIndex = (fallbackDestroySoundIndex + 1) % fallbackDestroySoundPool.length;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function createBlastMarkPool() {
  if (blastMarkPool.length) return;

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < maxBlastMarks; index += 1) {
    const mark = document.createElement("span");
    mark.className = "blast-mark is-idle";
    mark.dataset.active = "false";
    blastMarkPool.push(mark);
    fragment.appendChild(mark);
  }
  impactWorld.appendChild(fragment);
}

function triggerBlastShake() {
  const now = performance.now();
  if (now - lastBlastShakeAt < blastShakeCooldown) return;

  lastBlastShakeAt = now;
  blastShakeVariant = !blastShakeVariant;
  desktop.classList.remove("blast-shake-a", "blast-shake-b");
  desktop.classList.add(blastShakeVariant ? "blast-shake-a" : "blast-shake-b");
  window.clearTimeout(blastShakeTimer);
  blastShakeTimer = window.setTimeout(() => {
    desktop.classList.remove("blast-shake-a", "blast-shake-b");
  }, 72);
}

function addBlastMark(event) {
  createBlastMarkPool();
  const point = getWorldPoint(event.clientX, event.clientY);
  const mark = blastMarkPool[nextBlastMarkIndex];
  const size = 28 + Math.round(Math.random() * 14);

  nextBlastMarkIndex = (nextBlastMarkIndex + 1) % blastMarkPool.length;
  if (mark.dataset.active !== "true") {
    mark.dataset.active = "true";
    activeBlastMarks.push(mark);
  }

  mark.style.left = `${point.x}px`;
  mark.style.top = `${point.y}px`;
  mark.style.setProperty("--blast-size", `${size}px`);
  mark.style.setProperty("--blast-rotation", `${Math.round(Math.random() * 360)}deg`);
  mark.classList.remove("is-idle");

  triggerBlastShake();
}

function flashWeapon() {
  weaponRecoilVariant = !weaponRecoilVariant;
  document.body.classList.add("weapon-firing");
  document.body.classList.remove("weapon-recoil-a", "weapon-recoil-b");
  document.body.classList.add(weaponRecoilVariant ? "weapon-recoil-a" : "weapon-recoil-b");
  window.clearTimeout(weaponFlashTimer);
  weaponFlashTimer = window.setTimeout(() => {
    document.body.classList.remove("weapon-firing", "weapon-recoil-a", "weapon-recoil-b");
  }, 58);
}

function destroyWindow(win) {
  if (win.classList.contains("destroyed") || win.classList.contains("shattering")) return;

  const rect = win.getBoundingClientRect();
  const desktopRect = desktop.getBoundingClientRect();
  const left = rect.left - desktopRect.left;
  const top = rect.top - desktopRect.top;
  const tileSize = 24;
  const rows = Math.ceil(rect.height / tileSize);
  const cols = Math.ceil(rect.width / tileSize);

  win.dataset.originalLeft = win.style.left;
  win.dataset.originalTop = win.style.top;
  win.dataset.originalZ = win.style.zIndex;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const shard = document.createElement("span");
      const shardWidth = Math.min(tileSize, rect.width - col * tileSize);
      const shardHeight = Math.min(tileSize, rect.height - row * tileSize);
      const isTitleShard = row * tileSize < 34;

      shard.className = `window-shard ${isTitleShard ? "title-shard" : "body-shard"}`;
      shard.style.left = `${left + col * tileSize}px`;
      shard.style.top = `${top + row * tileSize}px`;
      shard.style.width = `${shardWidth + 1}px`;
      shard.style.height = `${shardHeight + 1}px`;
      shard.style.setProperty("--fall-x", `${-320 + Math.random() * 640}px`);
      shard.style.setProperty("--fall-pop-x", `${-140 + Math.random() * 280}px`);
      shard.style.setProperty("--fall-pop-y", `${-90 - Math.random() * 110}px`);
      shard.style.setProperty("--fall-y", `${desktop.clientHeight - top + 160 + Math.random() * 340}px`);
      shard.style.setProperty("--fall-rot", `${-180 + Math.random() * 360}deg`);
      shard.style.setProperty("--fall-delay", `${Math.random() * 120}ms`);
      shard.style.setProperty("--fall-duration", `${820 + Math.random() * 760}ms`);
      desktop.appendChild(shard);
    }
  }

  win.classList.remove("damaged", "minimized");
  win.classList.add("shattering");
  playDestroySound();
  win.style.setProperty("--destroy-x", `${Math.random() > 0.5 ? "-" : ""}${60 + Math.round(Math.random() * 100)}px`);
  win.style.setProperty("--destroy-y", `${desktop.clientHeight - top + 160}px`);
  win.style.setProperty("--destroy-rot", `${Math.random() > 0.5 ? "-" : ""}${22 + Math.round(Math.random() * 18)}deg`);
  window.setTimeout(() => {
    if (win.classList.contains("shattering")) {
      win.classList.remove("shattering");
      win.classList.add("destroyed");
    }
  }, 1050);
  checkWinCondition();
}

function damageWindow(event) {
  const win = event.target.closest(".window");
  if (!win) return;
  if (win.dataset.window === "bugblaster") return;
  if (win.classList.contains("destroyed") || win.classList.contains("shattering")) return;

  const nextHits = Number(win.dataset.hits || 0) + 1;
  win.dataset.hits = String(nextHits);
  win.classList.add("damaged");

  if (nextHits >= maxWindowHits) {
    destroyWindow(win);
  }
}

function createErrorTargetShards(target) {
  const rect = target.getBoundingClientRect();
  const desktopRect = desktop.getBoundingClientRect();
  const left = rect.left - desktopRect.left;
  const top = rect.top - desktopRect.top;
  const tileSize = 18;
  const rows = Math.ceil(rect.height / tileSize);
  const cols = Math.ceil(rect.width / tileSize);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const shard = document.createElement("span");
      const shardWidth = Math.min(tileSize, rect.width - col * tileSize);
      const shardHeight = Math.min(tileSize, rect.height - row * tileSize);

      shard.className = "error-target-shard";
      shard.style.left = `${left + col * tileSize}px`;
      shard.style.top = `${top + row * tileSize}px`;
      shard.style.width = `${shardWidth + 1}px`;
      shard.style.height = `${shardHeight + 1}px`;
      shard.style.setProperty("--fall-x", `${-220 + Math.random() * 440}px`);
      shard.style.setProperty("--fall-pop-y", `${-70 - Math.random() * 110}px`);
      shard.style.setProperty("--fall-y", `${desktop.clientHeight - top + 110 + Math.random() * 260}px`);
      shard.style.setProperty("--fall-rot", `${-120 + Math.random() * 240}deg`);
      shard.style.setProperty("--fall-delay", `${Math.random() * 90}ms`);
      shard.style.setProperty("--fall-duration", `${620 + Math.random() * 520}ms`);
      desktop.appendChild(shard);
    }
  }
}

function destroyErrorTarget(target) {
  if (target.classList.contains("destroyed") || target.classList.contains("shattering")) return;

  createErrorTargetShards(target);
  target.classList.remove("damaged");
  target.classList.add("shattering");
  playDestroySound();
  window.setTimeout(() => {
    if (target.classList.contains("shattering")) {
      target.classList.remove("shattering");
      target.classList.add("destroyed");
    }
  }, 720);
  checkWinCondition();
}

function damageErrorTarget(event) {
  const target = event.target.closest("[data-error-target]");
  if (!target) return;
  if (target.classList.contains("destroyed") || target.classList.contains("shattering")) return;

  const nextHits = Number(target.dataset.hits || 0) + 1;
  target.dataset.hits = String(nextHits);
  target.classList.remove("damaged");
  window.requestAnimationFrame(() => {
    target.classList.add("damaged");
  });

  if (nextHits >= maxErrorTargetHits) {
    destroyErrorTarget(target);
  }
}

function getVisibleWindowTargets() {
  return Array.from(document.querySelectorAll(".window")).filter((win) => !win.classList.contains("hidden"));
}

function isTargetDefeated(target) {
  return target.classList.contains("destroyed") || target.classList.contains("shattering");
}

function checkWinCondition() {
  if (!chaosMode || gameWon) return;

  const windowTargets = getVisibleWindowTargets();
  const errorTargetElements = Array.from(document.querySelectorAll("[data-error-target]"));
  const targets = [...windowTargets, ...errorTargetElements];
  if (!targets.length || targets.some((target) => !isTargetDefeated(target))) return;

  gameWon = true;
  window.clearTimeout(autoRepairTimer);
  stopAutoFire();
  document.body.classList.add("game-won");
  window.setTimeout(repairDesktop, 1500);
}

function fireBlast() {
  if (!chaosMode || gameWon || !isAutoFiring || !lastBlastEvent) return;
  const shotEvent = getAimEvent();

  damageWindow(shotEvent);
  damageErrorTarget(shotEvent);
  addBlastMark(shotEvent);
  flashWeapon();
  playBlastSound();
  scheduleAutoRepair();
}

function startAutoFire(event) {
  if (!chaosMode || gameWon) return;
  if (event.target.closest("#bugblaster-file")) return;
  if (event.target.closest("#taskbar")) return;
  if (isAutoFiring) return;

  requestGamePointerLock();
  if (event.target.hasPointerCapture?.(event.pointerId)) {
    event.target.releasePointerCapture(event.pointerId);
  }
  warmAudioPools();
  event.preventDefault();
  event.stopPropagation();
  isAutoFiring = true;
  lastBlastEvent = event;
  fireBlast();
  autoFireTimer = window.setInterval(fireBlast, 65);
}

function stopAutoFire() {
  isAutoFiring = false;
  lastBlastEvent = null;
  lastAimMovementTime = 0;
  lastAimMovementX = 0;
  lastAimMovementY = 0;
  window.clearInterval(autoFireTimer);
  autoFireTimer = null;
}

function scheduleAutoRepair() {
  window.clearTimeout(autoRepairTimer);
  autoRepairTimer = window.setTimeout(repairDesktop, autoRepairDelay);
}

function repairDesktop() {
  window.clearTimeout(autoRepairTimer);
  autoRepairTimer = null;
  window.clearTimeout(weaponFlashTimer);
  window.clearTimeout(blastShakeTimer);
  gameWon = false;
  document.body.classList.remove("weapon-firing", "weapon-recoil-a", "weapon-recoil-b", "game-won");
  desktop.classList.remove("blast-shake-a", "blast-shake-b");
  activeBlastMarks.forEach((mark) => {
    mark.classList.add("is-idle");
    mark.dataset.active = "false";
  });
  activeBlastMarks = [];
  nextBlastMarkIndex = 0;
  document.querySelectorAll(".window-shard").forEach((shard) => shard.remove());
  document.querySelectorAll(".error-target-shard").forEach((shard) => shard.remove());
  resetErrorTargets();
  document.querySelectorAll(".window").forEach((win) => {
    win.classList.remove("damaged", "shattering", "destroyed");
    win.dataset.hits = "0";
    win.style.removeProperty("--destroy-x");
    win.style.removeProperty("--destroy-y");
    win.style.removeProperty("--destroy-rot");
    if (win.dataset.originalLeft) {
      win.style.left = win.dataset.originalLeft;
      win.style.top = win.dataset.originalTop;
    }
    if (win.dataset.originalZ) {
      win.style.zIndex = win.dataset.originalZ;
    }
  });
  setChaosMode(false);
  stopAutoFire();
}

function enableChaosMode() {
  chaosExitButton = document.createElement("button");
  chaosExitButton.className = "task-btn chaos-exit hidden";
  chaosExitButton.type = "button";
  chaosExitButton.textContent = "EXIT GUN.EXE";
  chaosExitButton.addEventListener("click", repairDesktop);
  taskbar.appendChild(chaosExitButton);

  bugblasterFile.addEventListener("dblclick", (event) => {
    if (bugblasterFile.dataset.dragged === "true") {
      event.preventDefault();
      return;
    }
    setChaosMode(true);
    requestGamePointerLock();
  });

  window.addEventListener(
    "pointerdown",
    (event) => {
      startAutoFire(event);
    },
    true
  );

  window.addEventListener("pointerrawupdate", handleAimMovement, true);
  window.addEventListener("pointermove", handleAimMovement, true);
  window.addEventListener("mousemove", handleAimMovement, true);

  window.addEventListener("pointerup", stopAutoFire);
  window.addEventListener(
    "dragstart",
    (event) => {
      if (!chaosMode) return;
      event.preventDefault();
    },
    true
  );
  window.addEventListener("blur", stopAutoFire);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && chaosMode) {
      repairDesktop();
    }
  });
}

renderAppWindows();
renderContactMail();
renderErrorTargets();
buildTaskbar();
enableWindowActions();
enableInfoButtons();
enableDragging();
enableDesktopFileDragging();
enableChaosMode();
createBlastMarkPool();
prepareAudioPools();
document.querySelectorAll(".window").forEach((win) => focusWindow(win));
