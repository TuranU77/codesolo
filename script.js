const apps = [
  {
    name: "HUP",
    tagline: "A quick indie game made by a one-man studio fueled by too much coffee.",
    appStoreUrl: "https://apps.apple.com/",
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

const appGrid = document.getElementById("app-grid");
const privacyControls = document.getElementById("privacy-controls");
const privacySourceLink = document.getElementById("privacy-source-link");
const gameInfoContent = document.getElementById("game-info-content");
const year = document.getElementById("year");
const desktop = document.getElementById("desktop");
const taskbar = document.getElementById("taskbar");

year.textContent = new Date().getFullYear();

apps.forEach((app, index) => {
  const card = document.createElement("article");
  card.className = "app-card";

  card.innerHTML = `
    <h3 class="app-name">${app.name}</h3>
    <p class="app-tagline">${app.tagline}</p>
    <div class="app-links">
      <a class="chip" href="${app.appStoreUrl}" target="_blank" rel="noreferrer noopener">App Store</a>
      <button class="chip js-open-info" type="button" data-app-index="${index}">Open Info</button>
    </div>
  `;

  appGrid.appendChild(card);
});

function setPolicy(url, appName) {
  privacySourceLink.href = url;
  privacySourceLink.textContent = `Open full policy (${appName})`;
}

function renderPrivacyTabs() {
  apps.forEach((app, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "privacy-tab";
    tab.textContent = app.name;
    tab.addEventListener("click", () => {
      setPolicy(app.privacyUrl, app.name);
      document.querySelectorAll(".privacy-tab").forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
    });
    if (index === 0) tab.classList.add("active");
    privacyControls.appendChild(tab);
  });
  setPolicy(apps[0].privacyUrl, apps[0].name);
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
  if (window.matchMedia("(max-width: 900px)").matches) return;

  document.querySelectorAll(".window").forEach((win) => {
    const handle = win.querySelector(".handle");
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    handle.addEventListener("mousedown", (event) => {
      if (event.target.closest(".action-btn")) return;
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

buildTaskbar();
renderPrivacyTabs();
enableWindowActions();
enableInfoButtons();
enableDragging();
document.querySelectorAll(".window").forEach((win) => focusWindow(win));
