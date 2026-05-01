// Botanica — strategy doc background scene
// Organic floating wireframe shapes in botanical palette.
// OKLCH-derived colors translated to sRGB for THREE.Color.
// Performance budget: ≤30 mesh objects + 1 particle field (800 pts).

import * as THREE from 'three';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('bg');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xf2ecdb, 0.045);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight, false);

// Palette (sRGB approximations of OKLCH values used in CSS)
const palette = {
  green: new THREE.Color('#3f8f64'),       // oklch(0.52 0.110 150)
  greenDeep: new THREE.Color('#22663f'),   // oklch(0.36 0.080 150)
  terra: new THREE.Color('#cb6932'),       // oklch(0.65 0.150 45)
  mustard: new THREE.Color('#cf9c34'),     // oklch(0.78 0.135 80)
  cream: new THREE.Color('#f1ead7'),       // oklch(0.94 0.030 80)
  ink: new THREE.Color('#1b3024'),         // oklch(0.18 0.030 145)
};

// ── Floating wireframe organisms ─────────────────────────────────────────────
// Mix of icospheres, torus knots and stylized "leaf" planes.
const group = new THREE.Group();
scene.add(group);

const orbs = [];
const ORB_COUNT = 14;

for (let i = 0; i < ORB_COUNT; i++) {
  const r = THREE.MathUtils.randFloat(0.6, 1.8);
  const detail = Math.random() < 0.5 ? 1 : 2;
  const geo = Math.random() < 0.55
    ? new THREE.IcosahedronGeometry(r, detail)
    : new THREE.TorusKnotGeometry(r * 0.7, r * 0.18, 64, 8, 2, 3);

  const colorRoll = Math.random();
  const color = colorRoll < 0.55 ? palette.green
              : colorRoll < 0.80 ? palette.greenDeep
              : colorRoll < 0.93 ? palette.terra
              :                    palette.mustard;

  const mat = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: THREE.MathUtils.randFloat(0.18, 0.42),
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(
    THREE.MathUtils.randFloatSpread(28),
    THREE.MathUtils.randFloatSpread(20),
    THREE.MathUtils.randFloat(-14, -2)
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  mesh.userData = {
    spin: new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(0.18),
      THREE.MathUtils.randFloatSpread(0.18),
      THREE.MathUtils.randFloatSpread(0.10),
    ),
    bobSpeed: THREE.MathUtils.randFloat(0.18, 0.5),
    bobAmp: THREE.MathUtils.randFloat(0.15, 0.55),
    basePos: mesh.position.clone(),
  };
  group.add(mesh);
  orbs.push(mesh);
}

// Stylized leaves — flat ribbons, more organic feel
function makeLeaf(width = 1.2, height = 2.6) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -height / 2);
  shape.bezierCurveTo(width / 2, -height / 4, width / 2, height / 4, 0, height / 2);
  shape.bezierCurveTo(-width / 2, height / 4, -width / 2, -height / 4, 0, -height / 2);
  return new THREE.ShapeGeometry(shape, 18);
}

const LEAF_COUNT = 8;
for (let i = 0; i < LEAF_COUNT; i++) {
  const w = THREE.MathUtils.randFloat(0.5, 1.4);
  const h = w * THREE.MathUtils.randFloat(2.0, 2.8);
  const geo = makeLeaf(w, h);
  const mat = new THREE.MeshBasicMaterial({
    color: Math.random() < 0.7 ? palette.green : palette.greenDeep,
    wireframe: true,
    transparent: true,
    opacity: THREE.MathUtils.randFloat(0.22, 0.5),
    side: THREE.DoubleSide,
  });
  const leaf = new THREE.Mesh(geo, mat);
  leaf.position.set(
    THREE.MathUtils.randFloatSpread(30),
    THREE.MathUtils.randFloatSpread(22),
    THREE.MathUtils.randFloat(-10, -1)
  );
  leaf.rotation.set(
    THREE.MathUtils.randFloatSpread(0.6),
    Math.random() * Math.PI * 2,
    THREE.MathUtils.randFloatSpread(Math.PI),
  );
  leaf.userData = {
    spin: new THREE.Vector3(0, THREE.MathUtils.randFloat(0.10, 0.28), 0),
    bobSpeed: THREE.MathUtils.randFloat(0.25, 0.55),
    bobAmp: THREE.MathUtils.randFloat(0.25, 0.7),
    basePos: leaf.position.clone(),
  };
  group.add(leaf);
  orbs.push(leaf);
}

// ── Particle pollen field ────────────────────────────────────────────────────
const PARTICLE_COUNT = 800;
const positions = new Float32Array(PARTICLE_COUNT * 3);
const speeds = new Float32Array(PARTICLE_COUNT);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(40);
  positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(30);
  positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(20) - 5;
  speeds[i] = THREE.MathUtils.randFloat(0.05, 0.18);
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
  color: palette.terra,
  size: 0.045,
  transparent: true,
  opacity: 0.55,
  sizeAttenuation: true,
  depthWrite: false,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ── Mouse + scroll reactivity ────────────────────────────────────────────────
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
const scrollState = { y: 0, ty: 0 };

window.addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
}, { passive: true });

window.addEventListener('scroll', () => {
  scrollState.ty = window.scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
}, { passive: true });

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
});

// ── Animate ─────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let frame = 0;

function animate() {
  const t = clock.getElapsedTime();
  frame++;

  // smooth mouse + scroll
  mouse.x += (mouse.tx - mouse.x) * 0.04;
  mouse.y += (mouse.ty - mouse.y) * 0.04;
  scrollState.y += (scrollState.ty - scrollState.y) * 0.06;

  if (!reduced) {
    for (const m of orbs) {
      const ud = m.userData;
      m.rotation.x += ud.spin.x * 0.01;
      m.rotation.y += ud.spin.y * 0.01;
      m.rotation.z += ud.spin.z * 0.01;
      m.position.y = ud.basePos.y + Math.sin(t * ud.bobSpeed + ud.basePos.x) * ud.bobAmp;
      m.position.x = ud.basePos.x + Math.cos(t * ud.bobSpeed * 0.7) * ud.bobAmp * 0.3;
    }
    // particles drift upward then wrap
    const arr = particleGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.015;
      if (arr[i * 3 + 1] > 16) arr[i * 3 + 1] = -16;
    }
    particleGeo.attributes.position.needsUpdate = true;
  }

  // camera parallax (mouse + scroll)
  camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.05;
  camera.position.y += (-mouse.y * 1.0 - scrollState.y * 4 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  // rotate whole group very slowly with scroll
  group.rotation.y = scrollState.y * 0.6;
  group.rotation.x = scrollState.y * -0.2;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// pause when tab hidden — battery friendly
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clock.stop();
  else clock.start();
});
