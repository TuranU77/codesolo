const apps = [
  {
    name: "App One",
    tagline: "Macht eine Sache. Die aber richtig.",
    appStoreUrl: "https://apps.apple.com/",
    privacyUrl: "https://github.com/your-user/your-app-one/privacy-policy"
  },
  {
    name: "App Two",
    tagline: "Weniger Chaos, mehr Fokus.",
    appStoreUrl: "https://apps.apple.com/",
    privacyUrl: "https://github.com/your-user/your-app-two/privacy-policy"
  },
  {
    name: "App Three",
    tagline: "Ein kleines Tool mit Main-Character-Energy.",
    appStoreUrl: "https://apps.apple.com/",
    privacyUrl: "https://github.com/your-user/your-app-three/privacy-policy"
  }
];

const appGrid = document.getElementById("app-grid");
const privacyLinks = document.getElementById("privacy-links");
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
      <a class="chip" href="${app.privacyUrl}" target="_blank" rel="noreferrer noopener">Datenschutz</a>
    </div>
  `;

  appGrid.appendChild(card);

  const privacyItem = document.createElement("p");
  privacyItem.innerHTML = `<a href="${app.privacyUrl}" target="_blank" rel="noreferrer noopener">${app.name} - Datenschutz</a>`;
  privacyLinks.appendChild(privacyItem);
});

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
enableWindowActions();
enableDragging();
document.querySelectorAll(".window").forEach((win) => focusWindow(win));
