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
const taskbar = document.getElementById("taskbar");
const bugblasterFile = document.getElementById("bugblaster-file");
const contactMail = document.getElementById("contact-mail");
const maxWindowHits = 5;
const autoRepairDelay = 3400;
const aimSensitivity = 1;
const blastSoundUrl = "./assets/gun_1.mp3";
const destroySoundUrl = "./assets/glass.mp3";

year.textContent = new Date().getFullYear();

function renderContactMail() {
  const contact = ["design", "usuk", "de"];
  const address = `${contact[0]}@${contact[1]}.${contact[2]}`;

  contactMail.href = `${["mai", "lto"].join("")}:${address}`;
  contactMail.textContent = address;
}

let chaosMode = false;
let isAutoFiring = false;
let autoFireTimer = null;
let lastBlastEvent = null;
let autoRepairTimer = null;
let chaosExitButton = null;
let blastSoundPool = [];
let blastSoundIndex = 0;
let destroySoundPool = [];
let destroySoundIndex = 0;
let worldX = 0;
let worldY = 0;
let weaponFlashTimer = null;

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
  desktop.style.removeProperty("--world-x");
  desktop.style.removeProperty("--world-y");
  impactWorld.style.removeProperty("--world-x");
  impactWorld.style.removeProperty("--world-y");
}

function getCenterAimPoint() {
  return {
    x: Math.round(window.innerWidth / 2),
    y: Math.round((window.innerHeight - 56) / 2)
  };
}

function getWorldPoint(clientX, clientY) {
  const rect = desktop.getBoundingClientRect();
  const scaleX = rect.width / desktop.offsetWidth || 1;
  const scaleY = rect.height / desktop.offsetHeight || 1;

  return {
    x: (clientX - rect.left) / scaleX,
    y: (clientY - rect.top) / scaleY
  };
}

function requestGamePointerLock() {
  if (document.pointerLockElement || !desktop.requestPointerLock) return;

  const lockRequest = desktop.requestPointerLock();
  if (lockRequest?.catch) {
    lockRequest.catch(() => {});
  }
}

function getAimEvent() {
  const center = getCenterAimPoint();
  const clientX = center.x;
  const clientY = center.y;
  const hiddenHud = fpsHud.style.display;

  fpsHud.style.display = "none";
  const target = document.elementFromPoint(clientX, clientY) || desktop;
  fpsHud.style.display = hiddenHud;

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
    resetWorldPan();
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

function playBlastSound() {
  if (!blastSoundPool.length) {
    blastSoundPool = Array.from({ length: 8 }, () => {
      const audio = new Audio(blastSoundUrl);
      audio.preload = "auto";
      audio.volume = 0.78;
      return audio;
    });
  }

  const audio = blastSoundPool[blastSoundIndex];
  blastSoundIndex = (blastSoundIndex + 1) % blastSoundPool.length;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function playDestroySound() {
  if (!destroySoundPool.length) {
    destroySoundPool = Array.from({ length: 4 }, () => {
      const audio = new Audio(destroySoundUrl);
      audio.preload = "auto";
      audio.volume = 1;
      return audio;
    });
  }

  const audio = destroySoundPool[destroySoundIndex];
  destroySoundIndex = (destroySoundIndex + 1) % destroySoundPool.length;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function addBlastMark(event) {
  const point = getWorldPoint(event.clientX, event.clientY);
  const mark = document.createElement("span");
  const size = 28 + Math.round(Math.random() * 14);

  mark.className = "blast-mark";
  mark.style.left = `${point.x}px`;
  mark.style.top = `${point.y}px`;
  mark.style.setProperty("--blast-size", `${size}px`);
  mark.style.setProperty("--blast-rotation", `${Math.round(Math.random() * 360)}deg`);
  impactWorld.appendChild(mark);

  desktop.classList.remove("blast-shake");
  void desktop.offsetWidth;
  desktop.classList.add("blast-shake");
}

function flashWeapon() {
  document.body.classList.add("weapon-firing");
  window.clearTimeout(weaponFlashTimer);
  weaponFlashTimer = window.setTimeout(() => {
    document.body.classList.remove("weapon-firing");
  }, 70);
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

function fireBlast() {
  if (!chaosMode || !isAutoFiring || !lastBlastEvent) return;
  const shotEvent = getAimEvent();

  damageWindow(shotEvent);
  addBlastMark(shotEvent);
  flashWeapon();
  playBlastSound();
  scheduleAutoRepair();
}

function startAutoFire(event) {
  if (!chaosMode) return;
  if (event.target.closest("#bugblaster-file")) return;
  if (event.target.closest("#taskbar")) return;
  if (isAutoFiring) return;

  requestGamePointerLock();
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
  document.body.classList.remove("weapon-firing");
  document.querySelectorAll(".blast-mark").forEach((mark) => mark.remove());
  document.querySelectorAll(".window-shard").forEach((shard) => shard.remove());
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

  window.addEventListener("mousemove", (event) => {
    if (!chaosMode) return;
    setWorldPan(worldX - event.movementX * aimSensitivity, worldY - event.movementY * aimSensitivity);
    scheduleAutoRepair();
  });

  desktop.addEventListener("pointermove", (event) => {
    if (!isAutoFiring) return;
    lastBlastEvent = event;
  });

  window.addEventListener("pointerup", stopAutoFire);
  window.addEventListener("blur", stopAutoFire);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && chaosMode) {
      repairDesktop();
    }
  });
}

renderAppWindows();
renderContactMail();
buildTaskbar();
enableWindowActions();
enableInfoButtons();
enableDragging();
enableDesktopFileDragging();
enableChaosMode();
document.querySelectorAll(".window").forEach((win) => focusWindow(win));
