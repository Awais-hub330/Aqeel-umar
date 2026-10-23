const PROFILE = {
  email: "aqr59277@gmail.com",
  phone: "03242395085",
  whatsapp: "",
  behance: "",
  linkedin: "https://www.linkedin.com/in/aqeel-umar-7ba55a418/?isSelfProfile=true",
  instagram: ""
};

const AUTO_SCROLL_SPEED = 16;
const projects = window.PORTFOLIO_PROJECTS;
const categories = window.PORTFOLIO_CATEGORIES;
if (!Array.isArray(projects) || !Array.isArray(categories) || categories.length !== 3) {
  throw new Error("Portfolio project or category data did not load.");
}

const categoryGrid = document.querySelector("#category-grid");
const galleryPanel = document.querySelector("#gallery-panel");
const galleryTrack = document.querySelector("#gallery-track");
const galleryRow = document.querySelector("#gallery-row");
const galleryDuplicate = document.querySelector("#gallery-duplicate");
const galleryTitle = document.querySelector("#gallery-title");
const galleryCount = document.querySelector("#gallery-count");
const galleryState = document.querySelector("#gallery-state");
const galleryPlay = document.querySelector("#gallery-play");
const progressFill = document.querySelector("#gallery-progress-fill");
const dialog = document.querySelector("#artwork-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogTitle = document.querySelector("#dialog-title");
const dialogCategory = document.querySelector("#dialog-category");
const dialogDescription = document.querySelector("#dialog-description");
const dialogCounter = document.querySelector("#dialog-counter");
const slidePosition = document.querySelector("#slide-position");
const previousButton = document.querySelector(".slide-previous");
const nextButton = document.querySelector(".slide-next");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".nav-links");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const logoDimensions = {
  "imgi_26_d5f89c210964797.671a398594483.png": [1400, 1459],
  "imgi_27_3e4712210964797.671a3985939c1.png": [1400, 1459],
  "imgi_28_36cd70210964797.671a398593f40.png": [1400, 1460],
  "imgi_29_9b9533210964797.671a3985965ba.png": [1400, 1460],
  "imgi_30_a20b2f210964797.671a398596b81.png": [1400, 1460],
  "imgi_31_2f561b210964797.671a3985931bd.png": [1400, 1459],
  "imgi_32_334c78210964797.671a398594e93.png": [1400, 1460],
  "imgi_33_119831210964797.671a398595ec2.png": [1400, 1460],
  "imgi_54_cca21c211117409.671cf85f93756.png": [2487, 2233],
  "imgi_55_70e50f211117409.671cf85f925f5.png": [2487, 2232],
  "imgi_56_251084211117409.671cf85f91e1b.png": [2487, 2232],
  "imgi_56_7cf2f3210964797.671a39859737a.png": [1727, 1801],
  "imgi_57_0aa1d1210964797.671a3985956e8.png": [1727, 1801],
  "imgi_57_26e537211117409.671cf85f9179e.png": [2486, 2232],
  "imgi_58_0201c9211117409.671cf85f92baa.png": [2486, 2233],
  "imgi_59_a545b9211117409.671cf85f93f07.png": [2487, 2233],
  "imgi_99_2ef018211117409.671cf85f931ba.png": [3840, 2298]
};
let activeCategory = null;
let activeItems = [];
let activeItem = 0;
let returnFocusTo = null;
let previousBodyOverflow = "";
let pauseReasons = new Set(["offscreen"]);
let userPaused = false;
let hasOverflow = false;
let animationFrame = 0;
let lastFrame = 0;
let autoScrollRemainder = 0;
let dragState = null;
let dragged = false;
let pointerPauseTimer = 0;

function getDimensions(image) {
  if (image.width && image.height) return [image.width, image.height];
  const filename = decodeURIComponent(image.src.split("/").pop());
  return logoDimensions[filename] || [1080, 1080];
}

function createArtworkButton(item, index) {
  const [width, height] = getDimensions(item.image);
  const button = document.createElement("button");
  button.className = `artwork-card${item.category === "Logos" ? " logo-artwork" : ""}`;
  button.type = "button";
  button.dataset.itemIndex = String(index);
  button.style.setProperty("--artwork-ratio", String(width / height));
  button.setAttribute("aria-label", `View ${item.project.title}: ${item.image.alt}`);

  const image = document.createElement("img");
  image.src = item.image.src;
  image.alt = item.image.alt;
  image.width = width;
  image.height = height;
  image.loading = "lazy";
  image.decoding = "async";
  button.append(image);
  button.addEventListener("click", () => openArtwork(index, button));
  return button;
}

function renderCategories() {
  categoryGrid.replaceChildren();
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `category-card${category.surface === "logo" ? " category-card-logo" : ""}`;
    button.type = "button";
    button.dataset.category = category.name;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `Explore ${category.name}`);

    const image = document.createElement("img");
    image.src = category.cover;
    image.alt = category.alt;
    image.width = 1080;
    image.height = 1080;
    image.loading = "lazy";
    image.decoding = "async";

    const shade = document.createElement("span");
    shade.className = "category-shade";
    shade.setAttribute("aria-hidden", "true");
    const metadata = document.createElement("span");
    metadata.className = "category-meta";
    const number = document.createElement("span");
    number.className = "category-number";
    number.textContent = category.number;
    const arrow = document.createElement("span");
    arrow.className = "category-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    metadata.append(number, arrow);
    const caption = document.createElement("span");
    caption.className = "category-caption";
    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = category.name;
    const explore = document.createElement("span");
    explore.className = "category-explore";
    explore.textContent = "Explore work";
    caption.append(name, explore);
    button.append(image, shade, metadata, caption);
    button.addEventListener("click", () => selectCategory(category.name, button));
    categoryGrid.append(button);
  });
}

function buildCategoryItems(categoryName) {
  return projects
    .filter((project) => project.category === categoryName)
    .flatMap((project) => project.images.map((image, slideIndex) => ({
      project,
      image,
      category: categoryName,
      slideIndex
    })));
}

function makeDuplicateCards() {
  galleryDuplicate.replaceChildren();
  activeItems.forEach((item) => {
    const [width, height] = getDimensions(item.image);
    const card = document.createElement("div");
    card.className = `artwork-card duplicate-card${item.category === "Logos" ? " logo-artwork" : ""}`;
    card.style.setProperty("--artwork-ratio", String(width / height));
    const image = document.createElement("img");
    image.src = item.image.src;
    image.alt = "";
    image.width = width;
    image.height = height;
    image.loading = "lazy";
    image.decoding = "async";
    image.setAttribute("aria-hidden", "true");
    card.append(image);
    galleryDuplicate.append(card);
  });
}

function selectCategory(categoryName, trigger) {
  activeCategory = categories.find((category) => category.name === categoryName);
  activeItems = buildCategoryItems(categoryName);
  activeItem = 0;
  autoScrollRemainder = 0;
  userPaused = false;
  pauseReasons = new Set(["offscreen"]);
  galleryTrack.scrollLeft = 0;
  galleryRow.replaceChildren();
  galleryPanel.hidden = false;
  galleryPanel.dataset.category = categoryName;
  galleryTitle.textContent = categoryName;
  galleryCount.textContent = `${String(activeItems.length).padStart(2, "0")} pieces`;
  activeItems.forEach((item, index) => galleryRow.append(createArtworkButton(item, index)));
  makeDuplicateCards();
  renderGalleryState();
  updateOverflow();
  updateProgress();

  requestAnimationFrame(() => {
    galleryObserver.observe(galleryPanel);
    const panelBounds = galleryPanel.getBoundingClientRect();
    if (panelBounds.top < 0 || panelBounds.top > window.innerHeight) {
      galleryPanel.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "nearest"
      });
    }
    updateOverflow();
    updateProgress();
  });
}

function updateOverflow() {
  const rowWidth = galleryRow.scrollWidth;
  hasOverflow = rowWidth > galleryTrack.clientWidth + 2;
  const galleryName = activeCategory?.name || "Artwork";
  galleryTrack.setAttribute("aria-label", hasOverflow
    ? `${galleryName} gallery. Scroll horizontally or use the arrow controls.`
    : `${galleryName} gallery.`);
  document.querySelector("#gallery-previous").disabled = !hasOverflow;
  document.querySelector("#gallery-next").disabled = !hasOverflow;
  document.querySelector("#gallery-previous").hidden = !hasOverflow;
  document.querySelector("#gallery-next").hidden = !hasOverflow;
  progressFill.parentElement.hidden = !hasOverflow;
  renderGalleryState();
}

function renderGalleryState() {
  const motionDisabled = reducedMotion.matches || !hasOverflow;
  const paused = userPaused || pauseReasons.size > 0 || motionDisabled;
  galleryPlay.disabled = motionDisabled;
  galleryPlay.textContent = motionDisabled && reducedMotion.matches
    ? "Motion reduced"
    : paused ? "Play" : "Pause";
  galleryPlay.setAttribute("aria-label", motionDisabled && reducedMotion.matches
    ? "Automatic movement disabled by reduced motion preference"
    : `${paused ? "Play" : "Pause"} automatic gallery movement`);
  galleryPlay.setAttribute("aria-pressed", String(userPaused));
  galleryState.textContent = motionDisabled && reducedMotion.matches
    ? "Manual browsing"
    : !hasOverflow ? "All artwork visible"
      : paused ? "Movement paused" : "Moving slowly";
  if (!shouldAnimate()) stopAutoplay();
  else startAutoplay();
}

function shouldAnimate() {
  return activeItems.length > 0
    && hasOverflow
    && !userPaused
    && !reducedMotion.matches
    && pauseReasons.size === 0
    && !dialog.open;
}

function startAutoplay() {
  if (animationFrame || !shouldAnimate()) return;
  lastFrame = 0;
  animationFrame = requestAnimationFrame(moveGallery);
}

function stopAutoplay() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  lastFrame = 0;
}

function moveGallery(timestamp) {
  animationFrame = 0;
  if (!shouldAnimate()) return;
  if (lastFrame) {
    const elapsed = Math.min(timestamp - lastFrame, 48);
    const rowWidth = galleryRow.scrollWidth;
    if (rowWidth > 0) {
      autoScrollRemainder += AUTO_SCROLL_SPEED * elapsed / 1000;
      const pixelsToMove = Math.floor(autoScrollRemainder);
      if (pixelsToMove > 0) {
        let nextPosition = galleryTrack.scrollLeft + pixelsToMove;
        if (nextPosition >= rowWidth) nextPosition -= rowWidth;
        galleryTrack.scrollLeft = nextPosition;
        autoScrollRemainder -= pixelsToMove;
      }
    }
  }
  lastFrame = timestamp;
  animationFrame = requestAnimationFrame(moveGallery);
}

function setPauseReason(reason, paused) {
  if (pauseReasons.has(reason) === paused) return;
  if (paused) pauseReasons.add(reason);
  else pauseReasons.delete(reason);
  renderGalleryState();
}

function syncGalleryVisibility() {
  const bounds = galleryPanel.getBoundingClientRect();
  setPauseReason("offscreen", galleryPanel.hidden || bounds.bottom <= 0 || bounds.top >= window.innerHeight);
}

function updateProgress() {
  if (!activeItems.length) return;
  const rowWidth = galleryRow.scrollWidth;
  if (!rowWidth) return;
  const progress = Math.min((galleryTrack.scrollLeft % rowWidth) / rowWidth, 1);
  progressFill.style.transform = `scaleX(${progress})`;
}

function moveGalleryBy(direction) {
  const distance = Math.max(galleryTrack.clientWidth * 0.72, 240);
  galleryTrack.scrollBy({
    left: direction * distance,
    behavior: reducedMotion.matches ? "auto" : "smooth"
  });
}

function showArtwork() {
  const item = activeItems[activeItem];
  const [width, height] = getDimensions(item.image);
  dialogImage.src = item.image.src;
  dialogImage.alt = item.image.alt;
  dialogImage.width = width;
  dialogImage.height = height;
  dialogTitle.textContent = item.project.title;
  dialogCategory.textContent = item.category;
  dialogDescription.textContent = item.project.description;
  dialogCounter.textContent = `${item.project.title} · ${item.slideIndex + 1} of ${item.project.images.length}`;
  slidePosition.textContent = `${String(activeItem + 1).padStart(2, "0")} / ${String(activeItems.length).padStart(2, "0")}`;
  const onlyImage = activeItems.length < 2;
  previousButton.hidden = onlyImage;
  nextButton.hidden = onlyImage;
  previousButton.disabled = onlyImage;
  nextButton.disabled = onlyImage;
}

function openArtwork(index, trigger) {
  activeItem = index;
  returnFocusTo = trigger;
  showArtwork();
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  setPauseReason("lightbox", true);
  dialog.showModal();
  dialog.querySelector(".dialog-close").focus();
}

function closeDialog() {
  if (dialog.open) dialog.close();
}

function stepArtwork(direction) {
  if (activeItems.length < 2) return;
  activeItem = (activeItem + direction + activeItems.length) % activeItems.length;
  showArtwork();
}

function renderContact() {
  const emailLink = document.querySelector("#email-link");
  if (PROFILE.email) {
    emailLink.href = `mailto:${PROFILE.email}`;
    document.querySelector("#email-value").textContent = PROFILE.email;
    emailLink.setAttribute("aria-label", `Email Aqeel Umar at ${PROFILE.email}`);
  } else {
    emailLink.hidden = true;
  }

  const phoneLink = document.querySelector("#phone-link");
  if (PROFILE.phone) {
    const phoneDigits = PROFILE.phone.replace(/\D/g, "");
    phoneLink.href = `tel:+92${phoneDigits.replace(/^0/, "")}`;
    document.querySelector("#phone-value").textContent = PROFILE.phone;
    phoneLink.setAttribute("aria-label", `Call Aqeel Umar at ${PROFILE.phone}`);
  } else {
    phoneLink.hidden = true;
  }

  const linkedinLink = document.querySelector("#linkedin-link");
  if (PROFILE.linkedin) {
    linkedinLink.href = PROFILE.linkedin;
  } else {
    linkedinLink.hidden = true;
  }
}

const galleryObserver = new IntersectionObserver((entries) => {
  const entry = entries[0];
  setPauseReason("offscreen", !entry.isIntersecting);
}, { threshold: 0.05 });

categoryGrid.addEventListener("click", (event) => {
  const selected = event.target.closest(".category-card");
  if (!selected) return;
  categoryGrid.querySelectorAll(".category-card").forEach((card) => {
    const isActive = card === selected;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });
});

document.querySelector("#gallery-previous").addEventListener("click", () => moveGalleryBy(-1));
document.querySelector("#gallery-next").addEventListener("click", () => moveGalleryBy(1));
galleryPlay.addEventListener("click", () => {
  userPaused = !userPaused;
  renderGalleryState();
});

galleryTrack.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") setPauseReason("hover", true);
});
galleryTrack.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") setPauseReason("hover", false);
});
galleryTrack.addEventListener("focusin", () => setPauseReason("focus", true));
galleryTrack.addEventListener("focusout", () => {
  requestAnimationFrame(() => setPauseReason("focus", galleryTrack.contains(document.activeElement)));
});
galleryTrack.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("scroll", syncGalleryVisibility, { passive: true });
galleryTrack.addEventListener("keydown", (event) => {
  if (event.target !== galleryTrack) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    moveGalleryBy(event.key === "ArrowLeft" ? -1 : 1);
  }
});

galleryTrack.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.pointerType === "mouse") return;
  clearTimeout(pointerPauseTimer);
  dragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startScroll: galleryTrack.scrollLeft };
  dragged = false;
  setPauseReason("drag", true);
});
galleryTrack.addEventListener("pointermove", (event) => {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const deltaX = event.clientX - dragState.startX;
  const deltaY = event.clientY - dragState.startY;
  if (!dragged && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
    dragged = true;
    if (!galleryTrack.hasPointerCapture(event.pointerId)) galleryTrack.setPointerCapture(event.pointerId);
  }
  if (dragged) {
    event.preventDefault();
    galleryTrack.scrollLeft = dragState.startScroll - deltaX;
  }
});

function endDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  if (galleryTrack.hasPointerCapture(event.pointerId)) galleryTrack.releasePointerCapture(event.pointerId);
  dragState = null;
  pointerPauseTimer = window.setTimeout(() => setPauseReason("drag", false), 700);
  if (dragged) window.setTimeout(() => { dragged = false; }, 0);
}

galleryTrack.addEventListener("pointerup", endDrag);
galleryTrack.addEventListener("pointercancel", endDrag);
galleryTrack.addEventListener("click", (event) => {
  if (!dragged) return;
  event.preventDefault();
  event.stopPropagation();
  dragged = false;
}, true);

document.querySelector(".dialog-close").addEventListener("click", closeDialog);
previousButton.addEventListener("click", () => stepArtwork(-1));
nextButton.addEventListener("click", () => stepArtwork(1));
dialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeDialog();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    stepArtwork(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    stepArtwork(1);
  }
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});
dialog.addEventListener("close", () => {
  dialogImage.removeAttribute("src");
  document.body.style.overflow = previousBodyOverflow;
  setPauseReason("lightbox", false);
  if (returnFocusTo?.isConnected) returnFocusTo.focus();
  returnFocusTo = null;
});

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  menuButton.querySelector(".menu-toggle-label").textContent = isOpen ? "Menu" : "Close";
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  menuButton.querySelector(".menu-toggle-label").textContent = "Menu";
  navigation.classList.remove("is-open");
});

reducedMotion.addEventListener("change", renderGalleryState);
window.addEventListener("resize", () => {
  updateOverflow();
  syncGalleryVisibility();
}, { passive: true });
document.querySelector("#copyright-year").textContent = new Date().getFullYear();
renderCategories();

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((item) => item.classList.toggle('is-active', item === link));
  });
});

const firstCategoryName = categories[0].name;
const firstCategoryButton = categoryGrid.querySelector(`[data-category="${firstCategoryName}"]`);
if (firstCategoryButton) {
  selectCategory(firstCategoryName, firstCategoryButton);
}

renderContact();
