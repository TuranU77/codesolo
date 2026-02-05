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
const year = document.getElementById("year");
year.textContent = new Date().getFullYear();

apps.forEach((app, index) => {
  const card = document.createElement("article");
  card.className = "app-card";
  card.style.animationDelay = `${index * 120}ms`;

  card.innerHTML = `
    <h3 class="app-name">${app.name}</h3>
    <p class="app-tagline">${app.tagline}</p>
    <div class="app-links">
      <a class="chip" href="${app.appStoreUrl}" target="_blank" rel="noreferrer noopener">App Store</a>
      <a class="chip" href="${app.privacyUrl}" target="_blank" rel="noreferrer noopener">Datenschutz</a>
    </div>
  `;

  appGrid.appendChild(card);
});
