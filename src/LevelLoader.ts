// =====================================
// LevelLoader.ts — reads DSL JSON and builds scene entities
// =====================================

import * as THREE from "three";
import {
  createBall,
  createGoal,
  createPlatform,
  createGround,
  PhysicsObject,
  placePhysicsObject
} from "./GameObjects";
import { SelectionManager } from "./Selection";
import { inventory } from "./Inventory";

export async function loadLevel(
  levelName: string,
  scene: THREE.Scene,
  physicsWorld: any,
  AmmoLib: any,
  selection: SelectionManager
): Promise<{ 
  ball: PhysicsObject | null; 
  platforms: PhysicsObject[]; 
  goal: THREE.Mesh | null 
}> {

  const url = `/CMPM121-Final/levels/${levelName}.json`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load level file: ${levelName}.json`);

  const data = await response.json();

  const platforms: PhysicsObject[] = [];
  let ball: PhysicsObject | null = null;
  let goal: THREE.Mesh | null = null;

  // Ground
  createGround(scene, physicsWorld, AmmoLib);

  // Static platforms 
  if (Array.isArray(data.platforms)) {
    for (let p of data.platforms) {
      const plat = createPlatform(scene, physicsWorld, AmmoLib);
      placePhysicsObject(
        plat,
        { x: p.x ?? 0, y: p.y ?? 1, z: p.z ?? 0 },
        { x: p.rx ?? 0, y: p.ry ?? 0, z: p.rz ?? 0 },
        AmmoLib
      );

      platforms.push(plat);
    }
  }

  // Conditional platform unlocks 
  if (Array.isArray(data.conditionalPlatforms)) {
    for (let cond of data.conditionalPlatforms) {

      if (inventory.has(cond.requiredItem)) {
        const plat = createPlatform(scene, physicsWorld, AmmoLib);

        placePhysicsObject(
          plat,
          { x: cond.x ?? 0, y: cond.y ?? 1, z: cond.z ?? 0 },
          { x: cond.rx ?? 0, y: cond.ry ?? 0, z: cond.rz ?? 0 },
          AmmoLib
        );

        platforms.push(plat);

        // Register it as selectable if requested
        if (cond.addToSelectable) {
          selection.addSelectable(plat);
        }

        // Optional UI notification
        if (cond.statusMessage) {
          console.log(cond.statusMessage);
        }
      }
    }
  }

  // Ball spawn 
  if (data.ball) {
    ball = createBall(scene, physicsWorld, AmmoLib);
    placePhysicsObject(
      ball,
      { x: data.ball.x ?? 0, y: data.ball.y ?? 2.2, z: data.ball.z ?? -1 },
      undefined,
      AmmoLib
    );
  }

  // Goal spawn 
  if (data.goal) {
    goal = createGoal(scene);
    goal.position.set(data.goal.x ?? 0, data.goal.y ?? 0.05, data.goal.z ?? 1.5);
  }

  // Selectable platform indices
  if (Array.isArray(data.selectableIndices)) {
    for (let idx of data.selectableIndices) {
      if (platforms[idx]) selection.addSelectable(platforms[idx]);
    }
  }

  return { ball, platforms, goal };
}