import * as THREE from "three";
import { initPhysics, physicsWorld, stepPhysics, AmmoLib } from "./physics";
import { SelectionManager } from "./Selection";


import {
  createGround,
  createGoal,
  createBall,
  createPlatform,
  PhysicsObject,
} from "./GameObjects";

// --------------------------
//    Global rendering state
// --------------------------- 
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let selection: SelectionManager;


// --------------------------
//   Game Objects
// --------------------------- 
let ball: PhysicsObject;
let platform: PhysicsObject;
let ground: PhysicsObject;
let goalMesh: THREE.Mesh;

let gameOver = false;
const keys: Record<string, boolean> = {};

const statusEl = document.getElementById("status-message") as HTMLDivElement | null;

window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

function setStatus(text: string, color: string) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = color;
}

// --------------------------
//    scene Setup
// ---------------------------
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

  selection = new SelectionManager(camera, renderer);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// --------------------------
//   Input / Platform control
// ---------------------------
function handleInput() {
  // Reset works regardless of selection
  if (keys["KeyR"]) {
    resetBall();
    keys["KeyR"] = false;
    return;
  }

  // If nothing is selected, no rotation happens
  if (!selection.selected) return;

  const selected = selection.selected;
  let moved = false;

  // Tilt selected object left/right using A/D
  if (keys["KeyA"]) {
    selected.mesh.rotation.z += 0.03;
    moved = true;
  }

  if (keys["KeyD"]) {
    selected.mesh.rotation.z -= 0.03;
    moved = true;
  }

  if (moved) {
    // Sync transform to physics
    const t = new AmmoLib.btTransform();
    t.setIdentity();
    t.setOrigin(
      new AmmoLib.btVector3(
        selected.mesh.position.x,
        selected.mesh.position.y,
        selected.mesh.position.z,
      ),
    );

    const q = new THREE.Quaternion().setFromEuler(selected.mesh.rotation);
    t.setRotation(new AmmoLib.btQuaternion(q.x, q.y, q.z, q.w));

    selected.body.setWorldTransform(t);
    selected.body.getMotionState().setWorldTransform(t);

    // ensure the ball wakes up
    if (ball.body) {
      ball.body.activate(true);
    }
  }
}


// --------------------------
//   Reset ball on replay
// --------------------------- 
function resetBall() {
  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(0, 2.2, -1.0));

  ball.body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));
  ball.body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
  ball.body.setWorldTransform(transform);
  ball.body.getMotionState().setWorldTransform(transform);
  ball.body.activate(true);

  ball.mesh.position.set(0, 2.2, -1.0);

  gameOver = false;
  setStatus("", "#ffffff");
  (goalMesh.material as THREE.MeshStandardMaterial).color.setHex(0x00aa44);
}

// --------------------------
//   Sync + Win/Lose Logic
// ---------------------------
function syncBall() {
  const t = new AmmoLib.btTransform();
  ball.body.getMotionState().getWorldTransform(t);

  const p = t.getOrigin();
  ball.mesh.position.set(p.x(), p.y(), p.z());

  if (!gameOver && ball.mesh.position.y < -2) {
    gameOver = true;
    setStatus("YOU LOSE", "#ff2244");
    (goalMesh.material as THREE.MeshStandardMaterial).color.setHex(0xaa0000);
    return;
  }

  const gx = goalMesh.position.x;
  const gz = goalMesh.position.z;
  const halfSize = 1.0;

  const inX = Math.abs(ball.mesh.position.x - gx) < halfSize;
  const inZ = Math.abs(ball.mesh.position.z - gz) < halfSize;
  const nearY = ball.mesh.position.y > 0 && ball.mesh.position.y < 1;

  if (!gameOver && inX && inZ && nearY) {
    gameOver = true;
    setStatus("YOU WIN!", "#22ff88");
    (goalMesh.material as THREE.MeshStandardMaterial).color.setHex(0x22ff88);
  }
}

// --------------------------
//   Main Loop
// ---------------------------
function animate() {
  requestAnimationFrame(animate);

  handleInput();
  stepPhysics(1 / 60);
  syncBall();

  renderer.render(scene, camera);
}

// --------------------------
//    Boot
// ---------------------------
async function start() {
  await initPhysics();

  initThree();

  ground = createGround(scene, physicsWorld, AmmoLib);
  goalMesh = createGoal(scene);
  platform = createPlatform(scene, physicsWorld, AmmoLib);
  ball = createBall(scene, physicsWorld, AmmoLib);

  selection.addSelectable(platform);  // platform is selectable

  animate();
}

start();
