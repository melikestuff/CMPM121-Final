// =====================================
// GameObjects.ts
// Shared object factory + placement helpers
// =====================================

import * as THREE from "three";

// ===== Common type for physics objects =====
export type PhysicsObject = {
  mesh: THREE.Mesh;
  body: any;
};

// ===== Object Placement Helper =====
export function placePhysicsObject(
  obj: PhysicsObject,
  position: { x: number; y: number; z: number },
  rotation?: { x?: number; y?: number; z?: number },
  AmmoLib?: any
) {
  if (!AmmoLib) return;

  // Move visual mesh
  obj.mesh.position.set(position.x, position.y, position.z);

  if (rotation) {
    if (rotation.x !== undefined) obj.mesh.rotation.x = rotation.x;
    if (rotation.y !== undefined) obj.mesh.rotation.y = rotation.y;
    if (rotation.z !== undefined) obj.mesh.rotation.z = rotation.z;
  }

  // Sync Ammo body to new transform
  const t = new AmmoLib.btTransform();
  t.setIdentity();
  t.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));

  const q = new THREE.Quaternion().setFromEuler(obj.mesh.rotation);
  t.setRotation(new AmmoLib.btQuaternion(q.x, q.y, q.z, q.w));

  obj.body.setWorldTransform(t);
  obj.body.getMotionState().setWorldTransform(t);
  obj.body.activate(true);
}

// =====================================
// FACTORY: Ground
// =====================================
export function createGround(
  scene: THREE.Scene,
  physicsWorld: any,
  AmmoLib: any
): PhysicsObject {
  const geom = new THREE.BoxGeometry(20, 0.5, 20);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
        getComputedStyle(document.documentElement)
            .getPropertyValue("--platform-color")
    )
  });
  const mesh = new THREE.Mesh(geom, mat);

  mesh.position.set(0, -0.25, 0);
  mesh.receiveShadow = true;
  scene.add(mesh);

  const shape = new AmmoLib.btBoxShape(
    new AmmoLib.btVector3(10, 0.25, 10)
  );

  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(0, -0.25, 0));

  const motion = new AmmoLib.btDefaultMotionState(transform);
  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(
    0, motion, shape, new AmmoLib.btVector3(0, 0, 0)
  );

  const body = new AmmoLib.btRigidBody(rbInfo);
  physicsWorld.addRigidBody(body);

  return { mesh, body };
}

// =====================================
// FACTORY: Goal (visual, no physics)
// =====================================
export function createGoal(scene: THREE.Scene): THREE.Mesh {
  const geom = new THREE.BoxGeometry(2, 0.1, 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00aa44 });
  const mesh = new THREE.Mesh(geom, mat);

  mesh.position.set(0, 0.05, 1.5);
  mesh.receiveShadow = true;
  scene.add(mesh);

  return mesh;
}

// =====================================
// FACTORY: Ball
// =====================================
export function createBall(
  scene: THREE.Scene,
  physicsWorld: any,
  AmmoLib: any
): PhysicsObject {
  const radius = 0.3;

  const geom = new THREE.SphereGeometry(radius);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  const mesh = new THREE.Mesh(geom, mat);

  mesh.castShadow = true;
  scene.add(mesh);

  const shape = new AmmoLib.btSphereShape(radius);

  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(0, 2.2, -1.0));

  const motion = new AmmoLib.btDefaultMotionState(transform);
  const mass = 1;
  const inertia = new AmmoLib.btVector3(0, 0, 0);
  shape.calculateLocalInertia(mass, inertia);

  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(
    mass, motion, shape, inertia
  );

  const body = new AmmoLib.btRigidBody(rbInfo);
  physicsWorld.addRigidBody(body);

  return { mesh, body };
}

// =====================================
// FACTORY: Platform / Ramp
// =====================================
export function createPlatform(
  scene: THREE.Scene,
  physicsWorld: any,
  AmmoLib: any,
  position = new THREE.Vector3(0, 1, 0),
  tiltX = -0.35
): PhysicsObject {
  const geom = new THREE.BoxGeometry(3, 0.3, 3);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00FF84 });
  const mesh = new THREE.Mesh(geom, mat);

  mesh.position.copy(position);
  mesh.rotation.x = tiltX;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const shape = new AmmoLib.btBoxShape(
    new AmmoLib.btVector3(1.5, 0.15, 1.5)
  );

  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));

  const q = new THREE.Quaternion().setFromEuler(mesh.rotation);
  transform.setRotation(new AmmoLib.btQuaternion(q.x, q.y, q.z, q.w));

  const motion = new AmmoLib.btDefaultMotionState(transform);
  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(
    0, motion, shape, new AmmoLib.btVector3(0, 0, 0)
  );

  const body = new AmmoLib.btRigidBody(rbInfo);

  const CF_KINEMATIC_OBJECT = 2;
  body.setCollisionFlags(body.getCollisionFlags() | CF_KINEMATIC_OBJECT);

  const DISABLE_DEACTIVATION = 4;
  body.setActivationState(DISABLE_DEACTIVATION);

  physicsWorld.addRigidBody(body);

  return { mesh, body };
}
