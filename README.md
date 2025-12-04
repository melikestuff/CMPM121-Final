## Introducing the team

# Tools Lead: 
Benjamin Nguyen
# Engine Lead:
Benjamin Nguyen
# Design Lead:
Hank Liu
# Testing Lead:
Nick Diec

## Tools and materials

### Engine / Platform
- Custom TypeScript web app using Vite (no built-in 3D or physics)

### Rendering Library (3rd party)
- three.js for 3D rendering

### Physics Library (3rd party)
- ammo.js (via ammojs-typed) for 3D rigid body physics

# F1 Devlog Entry

## How we satisfied the software requirements

### Built on a platform without built-in 3D rendering or physics
- Our project does not use an engine like Unity, Unreal, or Phaser that already provides physics or 3D helpers. Instead, we began from standard browser JavaScript/TypeScript with no rendering or simulation built in.
Our rendering pipeline is created manually using THREE.WebGLRenderer, THREE.Scene, and perspective camera setup initThree() in main.ts
- Physics is entirely constructed using Ammo.js and our own wrapper initPhysics() and stepPhysics() in physics.ts.
Because none of these systems existed until we implemented them, our project meets the “no built-in 3D or physics” requirement.

### Uses a third-party 3D rendering library
- We integrate Three.js for rendering
```
// Example code
import * as THREE from "three";
```
- We explicitly construct a scene, renderer, meshes, materials, lighting, and a camera (see initThree() in main.ts). - The 3D world—ball, ramp, ground, and goal—is rendered using Three.js primitives (THREE.Mesh, THREE.BoxGeometry, THREE.SphereGeometry, etc.), satisfying the requirement to use a third-party rendering library.

### Uses a third-party physics simulation library
- Ammo.js for rigid-body physics (Example code
```
// Example code
import Ammo from "ammojs-typed";
```
- physics.ts initializes the Bullet physics world and exposes stepPhysics(), which updates physics each frame.
- In main.ts, objects like the ball and platform are given Ammo collider shapes and rigid bodies:

```
// Example code
ballBody = new AmmoLib.btRigidBody(rbInfo);
physicsWorld.addRigidBody(ballBody);
```

### The prototype presents a simple physics-based puzzle
- The puzzle is just tilting the blue platform so the ball rolls into the goal without falling off.

### The player can exert control to succeed or fail
- We handle keyboard input to tilt the platform in handleInput():
```
if (keys["KeyA"]) platformMesh.rotation.z += 0.03;
if (keys["KeyD"]) platformMesh.rotation.z -= 0.03;
```

- Tilting changes the ball’s motion because the platform’s transform is also synced into Ammo physics.
Moving incorrectly makes the ball fall (failure) — moving correctly guides it into the goal (success).
This satisfies the requirement that player input determines outcome.

### Success and failure are detected and reported visually
- In syncBallAndCheckWinLose() we detect fail conditions:
```
if (!gameOver && ballMesh.position.y < -2) {
    gameOver = true;
    setStatus("YOU LOSE", "#ff2244");
}
```
- We detect success via goal area bounds and change the UI:
```
setStatus("YOU WIN!", "#22ff88");
goalMesh.material = new THREE.MeshStandardMaterial({ color: 0x22ff88 });
```
- When either state is reached, the on-screen text and goal color change, fulfilling the requirement for visual reporting of success/failure.

### Before-commit automation included
- We configured before-commit automation using husky and lint-staged.
Whenever we commit to github repo, our Git hooks automatically run ESLint formatting checks.
Commits fail if linting does not pass, satisfying the requirement for automation before commits.

### Post-push automation included
- We implemented automatic deployment through GitHub Actions, visible in our Actions tab.
On push, our workflow:

- checks out code
- builds the project
- deploys the updated version to GitHub Pages

- This means every repository push automatically repackages and deploys a playable version, satisfying the post-push automation requirement.

## Reflection
- Looking back on how we achieved the F1 requirements, our team's plan changed since team formation as we were planning to use Godot engine and find outside 3rd party libraries to implement everything. Due to time constraints and our searching and testing not bearing fruit, we had to make the swap to just using the class standard of three.js and ammo.js. We also planned to code in person under the same roof due to us being close but other class projects got in the way and unfortunately not all of us could collectively code at the same time. We still helped each other in text groups so that we kept bouncing ideas off each other and helped develop the code together and collectively.