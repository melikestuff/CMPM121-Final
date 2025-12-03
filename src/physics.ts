import Ammo from "ammojs-typed";

export let AmmoLib: any;
export let physicsWorld: any;

export async function initPhysics() {
  // Bind factory to globalThis so ammo.js can set this.Ammo
  AmmoLib = await (Ammo as any).call(globalThis);

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
