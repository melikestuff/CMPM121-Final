import * as THREE from "three";
import { initPhysics, physicsWorld, stepPhysics, AmmoLib } from "./physics";

// --------------------
// State
// --------------------

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let ballMesh: THREE.Mesh;
let ballBody: any;

let platformMesh: THREE.Mesh;
let platformBody: any;

let goalMesh: THREE.Mesh;

const keys: Record<string, boolean> = {};
let gameOver = false;

const statusEl = document.getElementById(
  "status-message",
) as HTMLDivElement | null;

// --------------------
// Input
// --------------------

window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

// --------------------
// Selection state
// --------------------

type ControllablePlatform = {
  mesh: THREE.Mesh;
  body: any;
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const platforms: ControllablePlatform[] = [];
let selectedPlatform: ControllablePlatform | null = null;

function setSelectedPlatform(next: ControllablePlatform | null) {
  // Clear previous highlight
  if (selectedPlatform) {
    (selectedPlatform.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(
      0x000000,
    );
  }

  selectedPlatform = next;

  // Add highlight to new selection
  if (selectedPlatform) {
    (selectedPlatform.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(
      0x222222,
    );
  }
}

// --------------------
// UI Helpers
// --------------------

function setStatus(text: string, color: string) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = color;
}

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
  // Allow clicking/tapping on platforms to select them
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function onPointerDown(event: PointerEvent) {
  // Compute pointer position in normalized device coordinates (-1 to +1)
  const rect = renderer.domElement.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  pointer.x = x * 2 - 1;
  pointer.y = -(y * 2 - 1);

  // Cast a ray into the scene
  raycaster.setFromCamera(pointer, camera);

  // We only care about platform meshes
  const platformMeshes = platforms.map((p) => p.mesh);
  const hits = raycaster.intersectObjects(platformMeshes, false);

  if (hits.length > 0) {
    const hitMesh = hits[0].object as THREE.Mesh;
    const platform = platforms.find((p) => p.mesh === hitMesh) || null;
    setSelectedPlatform(platform);
  } else {
    // Clicked empty space: deselect
    setSelectedPlatform(null);
  }
}

// --------------------
// Physics Objects
// --------------------

function createGround() {
  const geom = new THREE.BoxGeometry(20, 0.5, 20);
  const mat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(0, -0.25, 0);
  mesh.receiveShadow = true;
  scene.add(mesh);

  const shape = new AmmoLib.btBoxShape(
    new AmmoLib.btVector3(10, 0.25, 10),
  );

  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(0, -0.25, 0));

  const motion = new AmmoLib.btDefaultMotionState(transform);

  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(
    0,
    motion,
    shape,
    new AmmoLib.btVector3(0, 0, 0),
  );

  const body = new AmmoLib.btRigidBody(rbInfo);
  physicsWorld.addRigidBody(body);
}

function createGoal() {
  // 2x2 goal so it’s reasonably hittable
  const geom = new THREE.BoxGeometry(2, 0.1, 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00aa44 });
  goalMesh = new THREE.Mesh(geom, mat);

  // Put it downhill from the ramp on the positive Z side
  goalMesh.position.set(0, 0.05, 1.5);

  goalMesh.receiveShadow = true;
  scene.add(goalMesh);
}



function createBall() {
  const radius = 0.3;

  const geom = new THREE.SphereGeometry(radius);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  ballMesh = new THREE.Mesh(geom, mat);
  ballMesh.castShadow = true;
  scene.add(ballMesh);

  const shape = new AmmoLib.btSphereShape(radius);
  const transform = new AmmoLib.btTransform();
  transform.setIdentity();

  // Start slightly "uphill" on the ramp on the negative Z side
  transform.setOrigin(new AmmoLib.btVector3(0, 2.2, -1.0));

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


function createPlatform() {
  const geom = new THREE.BoxGeometry(3, 0.3, 3);
  const mat = new THREE.MeshStandardMaterial({ color: 0x3366ff });
  platformMesh = new THREE.Mesh(geom, mat);
  platformMesh.position.set(0, 1, 0);

  // Tilt so ball rolls toward positive Z (toward the goal)
  platformMesh.rotation.x = -0.35;

  platformMesh.castShadow = true;
  platformMesh.receiveShadow = true;
  scene.add(platformMesh);

  const shape = new AmmoLib.btBoxShape(
    new AmmoLib.btVector3(1.5, 0.15, 1.5),
  );

  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(0, 1, 0));

  const q = new THREE.Quaternion().setFromEuler(platformMesh.rotation);
  transform.setRotation(new AmmoLib.btQuaternion(q.x, q.y, q.z, q.w));

  const motion = new AmmoLib.btDefaultMotionState(transform);

  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(
    0,
    motion,
    shape,
    new AmmoLib.btVector3(0, 0, 0),
  );

  platformBody = new AmmoLib.btRigidBody(rbInfo);

  const CF_KINEMATIC_OBJECT = 2;
  platformBody.setCollisionFlags(
    platformBody.getCollisionFlags() | CF_KINEMATIC_OBJECT,
  );
  const DISABLE_DEACTIVATION = 4;
  platformBody.setActivationState(DISABLE_DEACTIVATION);

  physicsWorld.addRigidBody(platformBody);

  // Register this platform as an interactive object
  const platform: ControllablePlatform = {
    mesh: platformMesh,
    body: platformBody,
  };
  platforms.push(platform);

  // Optional: select it by default when the game starts
  setSelectedPlatform(platform);
}




// Reset ball/goal for replay
function resetBall() {
  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(0, 2.2, 1.0)); // same as spawn

  ballBody.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));
  ballBody.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
  ballBody.setWorldTransform(transform);
  ballBody.getMotionState().setWorldTransform(transform);
  ballBody.activate(true);

  ballMesh.position.set(0, 2.2, 1.0);

  gameOver = false;
  setStatus("", "#ffffff");
  goalMesh.material = new THREE.MeshStandardMaterial({
    color: 0x00aa44,
  });
}


// --------------------
// Game Logic
// --------------------

function handleInput() {
  // Reset still works regardless of selection
  if (keys["KeyR"]) {
    resetBall();
    keys["KeyR"] = false;
  }

  if (!selectedPlatform) return;

  let moved = false;

  // Tilt left/right with A/D on the selected platform
  if (keys["KeyA"]) {
    selectedPlatform.mesh.rotation.z += 0.03;
    moved = true;
  }
  if (keys["KeyD"]) {
    selectedPlatform.mesh.rotation.z -= 0.03;
    moved = true;
  }

  if (moved) {
    // Clamp if you want to avoid crazy flipping:
    // selectedPlatform.mesh.rotation.z = THREE.MathUtils.clamp(
    //   selectedPlatform.mesh.rotation.z, -0.8, 0.8
    // );

    const t = new AmmoLib.btTransform();
    t.setIdentity();
    t.setOrigin(
      new AmmoLib.btVector3(
        selectedPlatform.mesh.position.x,
        selectedPlatform.mesh.position.y,
        selectedPlatform.mesh.position.z,
      ),
    );

    const q = new THREE.Quaternion().setFromEuler(
      selectedPlatform.mesh.rotation,
    );
    t.setRotation(new AmmoLib.btQuaternion(q.x, q.y, q.z, q.w));

    selectedPlatform.body.setWorldTransform(t);
    selectedPlatform.body.getMotionState().setWorldTransform(t);

    if (ballBody) {
      ballBody.activate(true);
    }
  }
}


function syncBallAndCheckWinLose() {
  const t = new AmmoLib.btTransform();
  ballBody.getMotionState().getWorldTransform(t);
  const p = t.getOrigin();

  ballMesh.position.set(p.x(), p.y(), p.z());

  // Fail: ball fell off the world
  if (!gameOver && ballMesh.position.y < -2) {
    gameOver = true;
    setStatus("YOU LOSE", "#ff2244");
    goalMesh.material = new THREE.MeshStandardMaterial({
      color: 0xaa0000,
    });
    return;
  }

  // Win: ball inside goal footprint & near ground
  if (!gameOver) {
  const gx = goalMesh.position.x;
  const gz = goalMesh.position.z;

  // Match the 2x2 goal footprint
  const halfSize = 1.0;

  const inX = Math.abs(ballMesh.position.x - gx) < halfSize;
  const inZ = Math.abs(ballMesh.position.z - gz) < halfSize;
  const nearY = ballMesh.position.y > 0 && ballMesh.position.y < 1;


    if (inX && inZ && nearY) {
      gameOver = true;
      setStatus("YOU WIN!", "#22ff88");
      goalMesh.material = new THREE.MeshStandardMaterial({
        color: 0x22ff88,
      });
    }
  }
}

// --------------------
// Main Loop
// --------------------

function animate() {
  requestAnimationFrame(animate);

  handleInput();
  stepPhysics(1 / 60);
  syncBallAndCheckWinLose();

  renderer.render(scene, camera);
}

// --------------------
// Boot
// --------------------

async function start() {
  await initPhysics();

  initThree();
  createGround();
  createGoal();
  createPlatform();
  createBall();

  animate();
}

start();
