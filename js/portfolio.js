/* ==============================================
   CURSOR & BACKGROUND PARTICLES
   ============================================== */
const customCursor = document.getElementById("customCursor");
const bgCanvas = document.getElementById("bgCanvas");
const bCtx = bgCanvas.getContext("2d");
const trailCanvas = document.getElementById("trailCanvas");
const tCtx = trailCanvas.getContext("2d");

const finePointerQuery = window.matchMedia("(pointer: fine)");
const narrowLayoutQuery = window.matchMedia("(max-width: 900px)");
const phoneLayoutQuery = window.matchMedia("(max-width: 600px)");
const compactHeroQuery = window.matchMedia("(max-width: 900px) and (orientation: landscape)");

let isFinePointer = finePointerQuery.matches;
let isNarrowLayout = narrowLayoutQuery.matches;
let isPhoneLayout = phoneLayoutQuery.matches;
let isCompactHero = compactHeroQuery.matches;

function syncPointerMode() {
  isFinePointer = finePointerQuery.matches;
  document.body.classList.toggle("coarse-pointer", !isFinePointer);
  if (!isFinePointer && customCursor) {
    customCursor.style.opacity = "0";
  } else if (customCursor) {
    customCursor.style.opacity = "";
  }
}

function syncLayoutMode() {
  isNarrowLayout = narrowLayoutQuery.matches;
  isPhoneLayout = phoneLayoutQuery.matches;
  isCompactHero = compactHeroQuery.matches;
  updateCardSize();
}

finePointerQuery.addEventListener("change", syncPointerMode);
narrowLayoutQuery.addEventListener("change", syncLayoutMode);
phoneLayoutQuery.addEventListener("change", syncLayoutMode);
compactHeroQuery.addEventListener("change", syncLayoutMode);
window.addEventListener("resize", syncLayoutMode);
syncPointerMode();

document.querySelectorAll("a, button, #canvas-container").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    if (isFinePointer) customCursor.classList.add("hover-state");
  });
  el.addEventListener("mouseleave", () => {
    if (isFinePointer) customCursor.classList.remove("hover-state");
  });
});

function resizeCanvases() {
  bgCanvas.width = trailCanvas.width = window.innerWidth;
  bgCanvas.height = trailCanvas.height = window.innerHeight;
  bCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bCtx.fillStyle = "rgba(255, 255, 255, 0.15)";
  for (let i = 0; i < 200; i++) {
    bCtx.beginPath();
    bCtx.arc(
      Math.random() * bgCanvas.width,
      Math.random() * bgCanvas.height,
      Math.random() * 1.5,
      0,
      Math.PI * 2
    );
    bCtx.fill();
  }
}

window.addEventListener("resize", resizeCanvases);
resizeCanvases();

const particles = [];
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener("mousemove", (e) => {
  if (!isFinePointer) return;

  mouseX = e.clientX;
  mouseY = e.clientY;
  customCursor.style.left = e.clientX + "px";
  customCursor.style.top = e.clientY + "px";

  for (let i = 0; i < 3; i++) {
    particles.push({
      x: e.clientX + (Math.random() - 0.5) * 16,
      y: e.clientY + (Math.random() - 0.5) * 16,
      size: Math.random() * 3 + 1.5,
      life: 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    });
  }
});

function drawParticle(p) {
  const radius = p.size * p.life;
  const alpha = p.life;

  // Dark halo — visible on light UI screenshots
  tCtx.beginPath();
  tCtx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.55})`;
  tCtx.shadowColor = `rgba(0, 0, 0, ${alpha * 0.4})`;
  tCtx.shadowBlur = 8;
  tCtx.arc(p.x, p.y, radius + 1.2, 0, Math.PI * 2);
  tCtx.fill();

  // Bright core — visible on dark backgrounds
  tCtx.beginPath();
  tCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
  tCtx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.7})`;
  tCtx.shadowBlur = 10;
  tCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  tCtx.fill();
}

function animateTrail() {
  tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  tCtx.shadowBlur = 0;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    drawParticle(p);
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.015;
    if (p.life <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }
  requestAnimationFrame(animateTrail);
}
animateTrail();

/* ==============================================
   FOOTER
   ============================================== */
const backToTopBtn = document.getElementById("btn-back-to-top");

if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
}

/* ==============================================
   3D SCROLL & CARD MORPHING
   ============================================== */
const cardWrapper = document.getElementById("cardWrapper");
const card3D = document.getElementById("card3D");
const faceAImg = document.getElementById("faceA-img");
const faceBImg = document.getElementById("faceB-img");
const projectUI = document.getElementById("projectUI");
const processItems = document.querySelectorAll(".process-item");
const stickyVisual = document.querySelector(".sticky-visual-container");

// Sizes mirror the .card-wrapper rules in main.css, which these inline styles override
const CARD_DESKTOP = { width: 400, height: 520 };
const CARD_TABLET = { width: 300, height: 390 };
const CARD_PHONE = { width: 250, height: 325 };
const CARD_COMPACT = { width: 170, height: 221 };
const CARD_RATIO = CARD_DESKTOP.height / CARD_DESKTOP.width;

let currentCardSize = CARD_DESKTOP;

// On mobile the card is top-anchored and the hero copy sits below it, so its
// height is capped against the viewport to keep the two from colliding.
function updateCardSize() {
  if (!isNarrowLayout) {
    currentCardSize = CARD_DESKTOP;
    return;
  }

  if (isCompactHero) {
    currentCardSize = CARD_COMPACT;
    return;
  }

  const cap = isPhoneLayout ? CARD_PHONE : CARD_TABLET;
  const height = Math.min(cap.height, Math.max(240, window.innerHeight * 0.45));

  currentCardSize = {
    width: Math.round(height / CARD_RATIO),
    height: Math.round(height),
  };
}

syncLayoutMode();

const images = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
];

let currentScroll = 0;
let targetScroll = 0;

window.addEventListener("scroll", () => {
  targetScroll = window.scrollY;
});

function renderEngine() {
  currentScroll += (targetScroll - currentScroll) * 0.08;
  const vh = window.innerHeight;

  let scrollProgress = currentScroll / vh;
  scrollProgress = Math.max(0, Math.min(7.5, scrollProgress));

  // Card settles on the right after hero and stays there through / after process
  const heroPhase = Math.max(0, Math.min(1, scrollProgress));
  const cardProgress = Math.max(0, Math.min(5.5, scrollProgress));

  const size = currentCardSize;
  const leftPosition = isNarrowLayout ? 50 : 50 + 25 * heroPhase;

  cardWrapper.style.left = `${leftPosition}%`;
  cardWrapper.style.width = `${size.width}px`;
  cardWrapper.style.height = `${size.height}px`;
  projectUI.style.opacity = 0;

  // On narrow screens, hide card once process section is active
  const inProcess = scrollProgress >= 0.5 && scrollProgress < 5.5;
  if (stickyVisual) {
    if (isNarrowLayout && inProcess) {
      stickyVisual.style.opacity = "0";
      stickyVisual.style.visibility = "hidden";
    } else {
      stickyVisual.style.opacity = "";
      stickyVisual.style.visibility = "";
    }
  }

  const baseRotationY = -180 * cardProgress;
  const scrollTiltX = Math.sin(cardProgress * Math.PI) * -5;

  card3D.style.transform = `rotateY(${baseRotationY}deg) rotateX(${scrollTiltX}deg)`;

  const baseIndex = Math.floor(cardProgress);
  if (baseIndex % 2 === 0) {
    faceAImg.src = images[baseIndex] || images[5];
    if (baseIndex + 1 <= 5) faceBImg.src = images[baseIndex + 1];
  } else {
    faceBImg.src = images[baseIndex] || images[5];
    if (baseIndex + 1 <= 5) faceAImg.src = images[baseIndex + 1];
  }

  const processIndex = Math.floor(scrollProgress - 0.5);
  processItems.forEach((item, idx) => {
    if (idx === processIndex && scrollProgress < 5.5) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  requestAnimationFrame(renderEngine);
}
renderEngine();
