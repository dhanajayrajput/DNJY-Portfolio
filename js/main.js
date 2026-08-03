/* ==========================================================================
   PORTFOLIO INTERACTIVE ENGINE (js/main.js)
   --------------------------------------------------------------------------
   1. ES Module Imports
   2. Custom Cursor & Interactive Background System
   3. 3D Scroll & Card Morphing Animation Engine
   4. 3D Design Arsenal Physics Simulation (Three.js + Cannon-es)
   5. Comic Book Case Study Integration
   ========================================================================== */

import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { RoundedBoxGeometry } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/geometries/RoundedBoxGeometry.js";
import * as CANNON from "https://cdn.skypack.dev/cannon-es";
import { initComicBook } from "./comic-book.js";

// Shared Mouse Coordinate State
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

/* ==========================================================================
   PART 1: 3D BUBBLE CIRCLE CURSOR & CANVAS BACKGROUND SYSTEM
   ========================================================================== */
function initCustomCursor() {
  const customCursor = document.getElementById("customCursor");
  if (!customCursor) return;

  // Track mouse movements
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
  });

  // Handle Click Compression
  document.addEventListener("mousedown", () => {
    customCursor.classList.add("active-click");
  });
  document.addEventListener("mouseup", () => {
    customCursor.classList.remove("active-click");
  });

  // Handle Cursor Hover States using Event Delegation
  document.body.addEventListener("mouseover", (e) => {
    if (
      e.target.closest("a, button, input, select, textarea, #canvas-container, .process-item, .page, .btn, .cover-badge, .dock-item")
    ) {
      customCursor.classList.add("hover-state");
    }
  });

  document.body.addEventListener("mouseout", (e) => {
    if (
      e.target.closest("a, button, input, select, textarea, #canvas-container, .process-item, .page, .btn, .cover-badge, .dock-item")
    ) {
      customCursor.classList.remove("hover-state");
    }
  });
}

function initCursorAndBackground() {
  initCustomCursor();

  const bgCanvas = document.getElementById("bgCanvas");
  const trailCanvas = document.getElementById("trailCanvas");

  if (!bgCanvas || !trailCanvas) return;

  // Window Resize Handler for Canvases
  function resizeCanvases() {
    bgCanvas.width = trailCanvas.width = window.innerWidth;
    bgCanvas.height = trailCanvas.height = window.innerHeight;

    // Redraw static stars proportionate to window size
    bCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bCtx.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      bCtx.beginPath();
      bCtx.arc(
        star.xRatio * bgCanvas.width,
        star.yRatio * bgCanvas.height,
        star.radius,
        0,
        Math.PI * 2
      );
      bCtx.fill();
    }
  }

  window.addEventListener("resize", resizeCanvases);
  resizeCanvases();

  // Mouse Movements & Trail Particles
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (customCursor) {
      customCursor.style.left = `${e.clientX}px`;
      customCursor.style.top = `${e.clientY}px`;
    }

    for (let i = 0; i < 2; i++) {
      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 15,
        y: e.clientY + (Math.random() - 0.5) * 15,
        size: Math.random() * 3 + 1.5,
        life: 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }
  });

  // Particle Trail Animation Loop
  function animateTrail() {
    tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      tCtx.fillStyle = tCtx.shadowColor = `rgba(255, 255, 255, ${p.life * 0.5})`;
      tCtx.shadowBlur = 10;
      tCtx.beginPath();
      tCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      tCtx.fill();

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
}

/* ==========================================================================
   PART 2: 3D SCROLL & CARD MORPHING ANIMATION ENGINE
   ========================================================================== */
function initScrollCardAnimation() {
  const cardWrapper = document.getElementById("cardWrapper");
  const card3D = document.getElementById("card3D");
  const faceAImg = document.getElementById("faceA-img");
  const faceBImg = document.getElementById("faceB-img");
  const projectUI = document.getElementById("projectUI");
  const processItems = document.querySelectorAll(".process-item");

  if (!cardWrapper || !card3D || !faceAImg || !faceBImg || !projectUI) return;

  const images = [
    "assets/dhnj.jpg", // 0: Hero
    "assets/design-process/define.png", // 1: Discover
    "assets/design-process/define.png", // 2: Define
    "assets/design-process/ideate.png", // 3: Ideate
    "assets/design-process/prototype.png", // 4: Prototype
    "assets/design-process/testing.png", // 5: Test
    "assets/design-process/prototype.png", // 6: PROJECT CARD
  ];

  let currentScroll = 0;
  let targetScroll = 0;
  let lastFaceASrc = "";
  let lastFaceBSrc = "";
  let lastProcessIndex = -1;

  window.addEventListener("scroll", () => {
    targetScroll = window.scrollY;
  });

  function renderEngine() {
    currentScroll += (targetScroll - currentScroll) * 0.08;
    const vh = window.innerHeight || 1;

    let scrollProgress = currentScroll / vh;
    scrollProgress = Math.max(0, Math.min(7.5, scrollProgress));

    const heroPhase = Math.max(0, Math.min(1, scrollProgress));
    const projectPhase = Math.max(0, Math.min(1, scrollProgress - 5));

    // Morphing Positioning
    const leftPosition = 50 + 25 * heroPhase - 25 * projectPhase;
    cardWrapper.style.left = `${leftPosition}%`;

    let cardWidth = 400 + 400 * projectPhase;
    const cardHeight = 520 - 120 * projectPhase;
    const maxWidth = window.innerWidth * 0.9;
    if (cardWidth > maxWidth) cardWidth = maxWidth;

    cardWrapper.style.width = `${cardWidth}px`;
    cardWrapper.style.height = `${cardHeight}px`;

    projectUI.style.opacity = Math.max(
      0,
      Math.min(1, (scrollProgress - 5.5) * 2)
    );

    const baseRotationY = -180 * scrollProgress;
    const scrollTiltX = Math.sin(scrollProgress * Math.PI) * -5;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const normX = (mouseX - cx) / cx;
    const normY = (mouseY - cy) / cy;

    const mouseTiltX = normY * -10;
    const mouseTiltY = normX * 10;

    const finalTiltX = scrollTiltX * (1 - projectPhase) + mouseTiltX * projectPhase;
    const finalRotationY = baseRotationY + mouseTiltY * projectPhase;

    card3D.style.transform = `rotateY(${finalRotationY}deg) rotateX(${finalTiltX}deg)`;

    // Swap images based on rotation side without unnecessary DOM thrashing
    const baseIndex = Math.floor(scrollProgress);
    let nextASrc = faceAImg.src;
    let nextBSrc = faceBImg.src;

    if (baseIndex % 2 === 0) {
      nextASrc = images[baseIndex] || images[6];
      if (baseIndex + 1 <= 6) nextBSrc = images[baseIndex + 1];
    } else {
      nextBSrc = images[baseIndex] || images[6];
      if (baseIndex + 1 <= 6) nextASrc = images[baseIndex + 1];
    }

    if (lastFaceASrc !== nextASrc) {
      faceAImg.src = nextASrc;
      lastFaceASrc = nextASrc;
    }
    if (lastFaceBSrc !== nextBSrc) {
      faceBImg.src = nextBSrc;
      lastFaceBSrc = nextBSrc;
    }

    // Process List Highlight
    const processIndex = Math.floor(scrollProgress - 0.5);
    const activeIdx = scrollProgress < 5.5 ? processIndex : -1;

    if (lastProcessIndex !== activeIdx) {
      processItems.forEach((item, idx) => {
        if (idx === activeIdx) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
      lastProcessIndex = activeIdx;
    }

    requestAnimationFrame(renderEngine);
  }

  renderEngine();
}

/* ==========================================================================
   PART 3: 3D DESIGN ARSENAL PHYSICS SIMULATION (THREE.JS + CANNON)
   ========================================================================== */
function initDesignArsenal3D() {
  const container = document.getElementById("canvas-container");
  if (!container) return;

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // 1. Scene Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    CANVAS_WIDTH / CANVAS_HEIGHT,
    0.1,
    200
  );
  camera.position.set(0, 0, 55);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  // 2. Physics World Setup
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -60, 0) });
  world.solver.iterations = 60;
  world.allowSleep = false;

  const defaultMaterial = new CANNON.Material("default");
  const contactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
      friction: 0.5,
      restitution: 0.3,
    }
  );
  world.addContactMaterial(contactMaterial);

  // 3. Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
  directionalLight.position.set(20, 50, 30);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 150;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  scene.add(directionalLight);

  // 4. Bounding Box Physics Walls
  const wallThickness = 20;
  function createWall(x, y, z, width, height, depth) {
    const shape = new CANNON.Box(
      new CANNON.Vec3(width / 2, height / 2, depth / 2)
    );
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: shape,
      material: defaultMaterial,
    });
    body.position.set(x, y, z);
    world.addBody(body);
  }

  createWall(0, -28, 0, 80, wallThickness, 50);
  createWall(0, 70, 0, 80, wallThickness, 50);
  createWall(-34, 10, 0, wallThickness, 120, 50);
  createWall(34, 10, 0, wallThickness, 120, 50);
  createWall(0, 10, -15, 80, 120, wallThickness);
  createWall(0, 10, 18, 80, 120, wallThickness);

  // 5. Generate HD Canvas Textures
  function createHDTexture(text, bgColor, textColor, options = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (options.gradColors) {
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, options.gradColors[0]);
      gradient.addColorStop(1, options.gradColors[1]);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = options.gradColors
      ? "rgba(255,255,255,0.15)"
      : "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.roundRect(25, 25, 462, 462, 80);
    ctx.fill();

    let fontSize = 120;
    if (text.length <= 2) fontSize = 180;
    else if (
      text === "Canva" ||
      text === "Framer" ||
      text === "Spline" ||
      text === "Notion"
    )
      fontSize = 100;
    else if (text === "ChatGPT") fontSize = 75;

    ctx.fillStyle = textColor;
    ctx.font = options.serif
      ? `bold ${fontSize + 10}px "Times New Roman", serif`
      : `bold ${fontSize}px -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 256);

    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bCtx = bumpCanvas.getContext("2d");

    bCtx.fillStyle = "#ffffff";
    bCtx.fillRect(0, 0, 512, 512);

    bCtx.fillStyle = "#444444";
    bCtx.beginPath();
    bCtx.roundRect(25, 25, 462, 462, 80);
    bCtx.fill();

    bCtx.fillStyle = "#ffffff";
    bCtx.font = ctx.font;
    bCtx.textAlign = "center";
    bCtx.textBaseline = "middle";
    bCtx.fillText(text, 256, 256);

    return {
      colorMap: new THREE.CanvasTexture(canvas),
      bumpMap: new THREE.CanvasTexture(bumpCanvas),
    };
  }

  // 6. Brand Definitions & Cubes Spawn
  const brands = [
    { text: "Figma", bg: "#f24e1e", fg: "#ffffff" },
    { text: "Xd", bg: "#470137", fg: "#ff61f6" },
    { text: "Ai", bg: "#331a00", fg: "#ff9900" },
    { text: "Ps", bg: "#001e36", fg: "#31a8ff" },
    { text: "Framer", bg: "#0055FF", fg: "#ffffff" },
    { text: "Notion", bg: "#ffffff", fg: "#000000", serif: true },
    {
      text: "Canva",
      bg: "",
      fg: "#ffffff",
      gradColors: ["#00C4CC", "#7D2AE8"],
    },
    { text: "Spline", bg: "#111111", fg: "#ffffff" },
    { text: "ChatGPT", bg: "#10a37f", fg: "#ffffff" },
  ];

  const meshes = [];
  const bodies = [];
  const cubeSize = 8.5;
  const hdGeo = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 8, 1.2);
  const physicsShape = new CANNON.Box(
    new CANNON.Vec3(cubeSize / 2, cubeSize / 2, cubeSize / 2)
  );

  function spawnCube(brand) {
    const maps = createHDTexture(brand.text, brand.bg, brand.fg, brand);
    const material = new THREE.MeshPhysicalMaterial({
      map: maps.colorMap,
      bumpMap: maps.bumpMap,
      bumpScale: 0.15,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const mesh = new THREE.Mesh(hdGeo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshes.push(mesh);

    const body = new CANNON.Body({
      mass: 2,
      shape: physicsShape,
      material: defaultMaterial,
    });
    body.position.set((Math.random() - 0.5) * 16, 25, (Math.random() - 0.5) * 6);
    body.quaternion.setFromEuler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      0
    );

    world.addBody(body);
    bodies.push(body);
  }

  brands.forEach((brand, index) => {
    setTimeout(() => {
      spawnCube(brand);
    }, index * 400);
  });

  // 7. Raycaster Hover Bump Interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  container.addEventListener("mousemove", (event) => {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Use relative container bounding rect for accurate mouse picking on any screen size
    mouse.x = (x / rect.width) * 2 - 1;
    mouse.y = -(y / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const index = meshes.indexOf(hitMesh);
      const hitBody = bodies[index];

      if (hitBody && hitBody.velocity.y < 10) {
        const bumpForce = new CANNON.Vec3(
          (Math.random() - 0.5) * 180,
          160 + Math.random() * 80,
          (Math.random() - 0.5) * 180
        );
        const offset = new CANNON.Vec3(2.5, 2.5, 2.5);
        hitBody.applyImpulse(bumpForce, hitBody.position.vadd(offset));
      }
    }
  });

  // 8. Physics & Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    world.step(1 / 60, delta, 3);

    for (let i = 0; i < meshes.length; i++) {
      meshes[i].position.copy(bodies[i].position);
      meshes[i].quaternion.copy(bodies[i].quaternion);
    }
    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   DOCK NAVIGATION CONTROLLER
   ========================================================================== */
function initDockNavigation() {
  const dockHomeBtn = document.getElementById("dockHomeBtn");
  const dockProcessBtn = document.getElementById("dockProcessBtn");
  const dockProjectsBtn = document.getElementById("dockProjectsBtn");
  const contactBtn = document.getElementById("contactBtn");

  if (dockHomeBtn) {
    dockHomeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (dockProcessBtn) {
    dockProcessBtn.addEventListener("click", (e) => {
      const processSec = document.getElementById("processSection");
      if (processSec) {
        e.preventDefault();
        processSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  if (dockProjectsBtn) {
    dockProjectsBtn.addEventListener("click", (e) => {
      const comicSec = document.getElementById("comicProjectSection");
      if (comicSec && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        comicSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      const comicSec = document.getElementById("comicProjectSection");
      if (comicSec) {
        comicSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initCursorAndBackground();
    initScrollCardAnimation();
    initDesignArsenal3D();
    initComicBook();
    initDockNavigation();
  });
} else {
  initCursorAndBackground();
  initScrollCardAnimation();
  initDesignArsenal3D();
  initComicBook();
  initDockNavigation();
}
