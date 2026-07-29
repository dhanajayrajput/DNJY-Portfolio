import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { RoundedBoxGeometry } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/geometries/RoundedBoxGeometry.js";
import * as CANNON from "https://cdn.skypack.dev/cannon-es";

const container = document.getElementById("canvas-container");

function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight,
  };
}

/* --- Scene --- */
const scene = new THREE.Scene();
const { width: initW, height: initH } = getSize();
const camera = new THREE.PerspectiveCamera(45, initW / initH, 0.1, 200);
camera.position.set(0, 0, 55);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(initW, initH);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
container.appendChild(renderer.domElement);

function resizeRenderer() {
  const { width, height } = getSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener("resize", resizeRenderer);

/* --- Physics --- */
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -60, 0) });
world.solver.iterations = 60;
world.allowSleep = false;

const defaultMaterial = new CANNON.Material("default");
const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.5,
  restitution: 0.3,
});
world.addContactMaterial(contactMaterial);

/* --- Lighting --- */
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

/* --- Bounding box --- */
const wallThickness = 20;

function createWall(x, y, z, width, height, depth) {
  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
  const body = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape,
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

/* --- Textures --- */
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

  ctx.fillStyle = options.gradColors ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.roundRect(25, 25, 462, 462, 80);
  ctx.fill();

  let fontSize = 120;
  if (text.length <= 2) fontSize = 180;
  else if (text === "Canva" || text === "Framer" || text === "Spline" || text === "Notion") fontSize = 100;
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

const brands = [
  { text: "Figma", bg: "#f24e1e", fg: "#ffffff" },
  { text: "Xd", bg: "#470137", fg: "#ff61f6" },
  { text: "Ai", bg: "#331a00", fg: "#ff9900" },
  { text: "Ps", bg: "#001e36", fg: "#31a8ff" },
  { text: "Framer", bg: "#0055FF", fg: "#ffffff" },
  { text: "Notion", bg: "#ffffff", fg: "#000000", serif: true },
  { text: "Canva", bg: "", fg: "#ffffff", gradColors: ["#00C4CC", "#7D2AE8"] },
  { text: "Spline", bg: "#111111", fg: "#ffffff" },
  { text: "ChatGPT", bg: "#10a37f", fg: "#ffffff" },
];

/* --- Cubes --- */
const meshes = [];
const bodies = [];

const cubeSize = 8.5;
const hdGeo = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 8, 1.2);
const physicsShape = new CANNON.Box(new CANNON.Vec3(cubeSize / 2, cubeSize / 2, cubeSize / 2));

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

  const body = new CANNON.Body({ mass: 2, shape: physicsShape, material: defaultMaterial });
  body.position.set((Math.random() - 0.5) * 16, 25, (Math.random() - 0.5) * 6);
  body.quaternion.setFromEuler(Math.random() * Math.PI, Math.random() * Math.PI, 0);

  world.addBody(body);
  bodies.push(body);
}

brands.forEach((brand, index) => {
  setTimeout(() => spawnCube(brand), index * 400);
});

/* --- Hover interaction --- */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

container.addEventListener("mousemove", (event) => {
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  mouse.x = (x / rect.width) * 2 - 1;
  mouse.y = -(y / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    const index = meshes.indexOf(hitMesh);
    const hitBody = bodies[index];

    if (hitBody.velocity.y < 10) {
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

/* --- Render loop --- */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60, clock.getDelta(), 3);

  for (let i = 0; i < meshes.length; i++) {
    meshes[i].position.copy(bodies[i].position);
    meshes[i].quaternion.copy(bodies[i].quaternion);
  }
  renderer.render(scene, camera);
}
animate();
