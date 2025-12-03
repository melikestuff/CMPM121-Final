import * as THREE from "three";
import Ammo from "ammojs-typed";

import { initPhysics, physicsWorld, stepPhysics } from "./physics";

// --------------------
// State
// --------------------

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let ballMesh: THREE.Mesh;
let ballBody: Ammo.btRigidBody;

let platformMesh: THREE.Mesh;
let platformBody: Ammo.btRigidBody;

const keys: Record<string, boolean> = {};
let gameOver = false;

// --------------------
// Input
// --------------------

window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

// --------------------
// Scene Setup
// --------------------

function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(5, 5, 7);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
}

// --------------------
// Physics Objects
// --------------------

function createBall(AmmoLib: typeof Ammo) {
  const geom = new THREE.SphereGeometry(0.3);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  ballMesh = new THREE.Mesh(geom, mat);
  scene.add(ballMesh);

  const shape = new AmmoLib.btSphereShape(0.3);
  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(0, 3, 0));

  const motion = new AmmoLib.btDefaultMotionState(transform);
  const mass = 1;
  const inertia = new AmmoLib.btVector3(0, 0, 0);
  shape.calculateLocalInertia(mass, inertia);

  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(
    mass,
    motion,
    shape,
    inertia,
  );

  ballBody = new AmmoLib.btRigidBody(rbInfo);
  physicsWorld.addRigidBody(ballBody);
}

function createPlatform(AmmoLib: typeof Ammo) {
  const geom = new THREE.BoxGeometry(3, 0.3, 3);
  const mat = new THREE.MeshStandardMaterial({ color: 0x3366ff });
  platformMesh = new THREE.Mesh(geom, mat);
  scene.add(platformMesh);
  platformMesh.position.set(0, 1, 0);

  const shape = new AmmoLib.btBoxShape(
    new AmmoLib.btVector3(1.5, 0.15, 1.5),
  );

  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(0, 1, 0));

  const motion = new AmmoLib.btDefaultMotionState(transform);

  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(
    0,
    motion,
    shape,
    new AmmoLib.btVector3(0, 0, 0),
  );

  platformBody = new AmmoLib.btRigidBody(rbInfo);
  physicsWorld.addRigidBody(platformBody);
}

// --------------------
// Game Logic
// --------------------

function handleInput() {
  if (keys["KeyA"]) platformMesh.rotation.z += 0.02;
  if (keys["KeyD"]) platformMesh.rotation.z -= 0.02;

  const t = new Ammo.btTransform();
  t.setIdentity();
  t.setOrigin(new Ammo.btVector3(0, 1, 0));

  const q = new THREE.Quaternion().setFromEuler(platformMesh.rotation);
  t.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));

  platformBody.getMotionState().setWorldTransform(t);
}

function syncBall() {
  const t = new Ammo.btTransform();
  ballBody.getMotionState().getWorldTransform(t);
  const p = t.getOrigin();

  ballMesh.position.set(p.x(), p.y(), p.z());

  if (ballMesh.position.y < -2 && !gameOver) {
    gameOver = true;
    alert("YOU LOSE");
  }

  if (ballMesh.position.y < 0.5 && Math.abs(ballMesh.position.x) < 0.5) {
    gameOver = true;
    alert("YOU WIN");
  }
}

// --------------------
// Main Loop
// --------------------

function animate() {
  requestAnimationFrame(animate);

  if (!gameOver) {
    handleInput();
    stepPhysics(1 / 60);
    syncBall();
  }

  renderer.render(scene, camera);
}

// --------------------
// Boot
// --------------------

async function start() {
  await initPhysics();
  const AmmoLib = await Ammo();

  initThree();
  createPlatform(AmmoLib);
  createBall(AmmoLib);

  animate();
}

start();
