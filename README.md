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

# F2 Devlog Entry

## How we satisfied the software requirements

### The game uses the same 3D rendering and physics libraries from F1
- Our project continues using the Three.js rendering engine and Ammo.js physics system introduced in F1.
All simulation objects (ball, platforms, ground) are created via functions such as:
```
createPlatform(this.scene, physicsWorld, AmmoLib)
createBall(this.scene, physicsWorld, AmmoLib)
createGround(this.scene, physicsWorld, AmmoLib)
```
- We also *attempted* to refactor the code here as we realized we would be using these much more often, so putting it into the GameObjects.ts would be helpful instead of hard coded into each level scene.

### The game allows movement between scenes
- The game implements a shared SceneManager class that tracks which scene is active and switches between them
```
sceneManager.changeScene(new Level1Scene(), "Level1");
sceneManager.changeScene(new Level2Scene(), "Level2");
sceneManager.changeScene(new EndScreenScene(), "End");
```
- Our current game scenes include
    - Main Menu Scene
    - Level 1 Scene
    - Level 2 Scene
    - End Screen Scene
- Buttons in UI allow the user to transition manually (Continue, Return to Menu), fulfilling the requirement that scenes follow an adventure-style room traversal structure.

### The game allows the player to select objects for interaction
Nothing too major changed from F1, was modified and refactored to be its own script instead of being hard-coded. The SelectionManager.ts builds a ray-caster and tracks which object is selected via mouse click.
Scenes register selectable physics objects like so:
```
this.selection.addSelectable(platform);
```
- This mechanic directly mirrors point-and-click adventure selection conventions — clicking the world to interact with specific objects.
- A problem that could be disastrous that player platforms aren't automatically selectable, which means for us we have to go through and remember to add them as a selectable in code.

### The game maintains an inventory system enabling cross-scene state
- The game includes persistent progression via a saved inventory system:
```
export class Inventory {
    private items: Set<string> = new Set();
    save() { localStorage.setItem("inventory", ...); }
}
export const inventory = new Inventory();
```
- Some scenes read and modify this
```
inventory.add("1st item");
// or
inventory.has("2nd item")
```
- Inventory UI appears consistently across scenes and affects gameplay logic: Level 2 checks whether the player has "GoldenBadge" to unlock a shortcut platform:
```
if (inventory.has("GoldenBadge")) {
    platform4 = createPlatform(...);
    this.selection.addSelectable(platform4);
}
```
- Thus, what happens in Level 1 meaningfully changes Level 2, satisfying the adventure-style cross-scene consequence requirement.

### The game contains at least one physics-based puzzle affecting progression
- Nothing too major changed from F1, code was refactored and restructured and levels are stored in separate scenes compared to F1 now. Each level has a ball that spawns, and the player has to select and rotate selectable platforms to get the ball to reach the goal.
- Passing or failing this puzzle is relevant to progress as you get items

### The player succeeds or fails based on skill, not randomness
- Success depends on accurate rotation of platforms and real-time reasoning about tilt and trajectory. If the player mishandles slope angles, the ball rolls off the world:
- The outcome is deterministic, no dice-roll or RNG, meaning player failure or success comes from understanding physics and manipulating the environment correctly.

### Via play, the game reaches at least one conclusive ending
- The game includes an explicit end screen scene, reached after Level 2:
- We have an if statement to check if the player completed the levels and got the respective item. As of now it always displays "YOU WIN" but the message underneath is different depending on if all the items were collected or not.
```
if (inventory.has("GoldenBadge") && inventory.has("PlatinumBadge"))
    summary.textContent = "You collected ALL items!";
else
    summary.textContent = "You missed some items...";
```
## Reflection
- Before we wanted to have multiple levels (Originally planning to have 5, COULD STILL CHANGE) but there are some bigger problems that we'd have to solve first. One of the first problems is constantly needing to update old code. Our level2.ts is the latest and uses the newest refactored code (Being GameObjects.ts such as physics objects and platforms) using a new helper method that does the positioning, rotating, tilting, and more. Level2.ts uses it where appropriately but Level1 as of now does not use it yet. We will eventually fix it for upcoming F3 but for now the level still works and a prototype of the concept is our ideal as of now for F2.
- Even though F1 had us set up automation, physics, rendering, and more, F2 required us to use the same tools that we made earlier in F1. For most of F2 requirements it was fine and worked flawlessly, but as described earlier we would need to refactor the code, F1 had everything hard-coded in as we needed something to work. Platforms, balls, UI, data, and more was hard-coded into the main scene. We have to eventually move out and separate everything into different typescript files for better organization and architecture for later scalability. One of the harder ones was definitely game objects with its physics and SceneManager, it took a while to get a singleton instance to work.
- TLDR: Our approach is changing in that we are trying to get something to work at first, and didn't bother fixing it back then. Now our efforts are changing to refactor the codebase more so that we'll have an easier time in the future if something needs to be changed.