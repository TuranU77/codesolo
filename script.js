const apps = [
  {
    name: "LUNIO - Good Night, Dear Moon",
    tagline: "A cozy bedtime game for little night explorers.",
    appStoreUrl: "https://apps.apple.com/de/app/lunio-gute-nacht-lieber-mond/id6757497490",
    privacyUrl: "https://turanu77.github.io/gute-nacht-mond-privacy/?lang=de"
  },
  {
    name: "WOLF - Party Game",
    tagline: "Fast, loud, social chaos for your next game night.",
    appStoreUrl: "https://apps.apple.com/de/app/wolf-party-game/id6747474675",
    privacyUrl: "https://turanu77.github.io/wolf-privacy/datenschutz.html"
  }
];

const appGrid = document.getElementById("app-grid");
const privacyControls = document.getElementById("privacy-controls");
const privacyFrame = document.getElementById("privacy-frame");
const privacySourceLink = document.getElementById("privacy-source-link");
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
      <button class="chip js-open-policy" type="button" data-policy-url="${app.privacyUrl}" data-policy-name="${app.name}">Open Policy</button>
    </div>
  `;

  appGrid.appendChild(card);
});

function setPolicy(url, appName) {
  privacyFrame.src = url;
  privacyFrame.title = `Privacy Policy - ${appName}`;
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
      focusWindow(win);
    });
    taskbar.appendChild(button);
  });
}

function enableWindowActions() {
  document.querySelectorAll(".window").forEach((win) => {
    const minimizeBtn = win.querySelector('[data-action="minimize"]');
    const closeBtn = win.querySelector('[data-action="close"]');

    minimizeBtn.addEventListener("click", () => {
      win.classList.add("hidden");
    });

    closeBtn.addEventListener("click", () => {
      win.classList.add("hidden");
    });

    win.addEventListener("mousedown", () => focusWindow(win));
  });
}

function enablePolicyButtons() {
  document.querySelectorAll(".js-open-policy").forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.dataset.policyUrl;
      const name = button.dataset.policyName;
      const privacyWindow = document.querySelector('[data-window="privacy"]');
      setPolicy(url, name);
      document.querySelectorAll(".privacy-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.textContent === name);
      });
      privacyWindow.classList.remove("hidden");
      focusWindow(privacyWindow);
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
enablePolicyButtons();
enableDragging();
document.querySelectorAll(".window").forEach((win) => focusWindow(win));
