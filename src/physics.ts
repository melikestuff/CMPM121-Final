import Ammo from "ammojs-typed";

export let physicsWorld: Ammo.btDiscreteDynamicsWorld;

export async function initPhysics() {
  const AmmoLib = await Ammo();

  const collisionConfiguration =
    new AmmoLib.btDefaultCollisionConfiguration();
  const dispatcher = new AmmoLib.btCollisionDispatcher(
    collisionConfiguration,
  );
  const broadphase = new AmmoLib.btDbvtBroadphase();
  const solver = new AmmoLib.btSequentialImpulseConstraintSolver();

  physicsWorld = new AmmoLib.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration,
  );

  physicsWorld.setGravity(new AmmoLib.btVector3(0, -9.8, 0));
}

export function stepPhysics(dt: number) {
  physicsWorld.stepSimulation(dt, 10);
}
