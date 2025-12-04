import * as THREE from "three";
import { sceneManager } from "../SceneManager";
import { initPhysics, physicsWorld, stepPhysics, AmmoLib } from "../physics";
import {
  createBall,
  createGoal,
  createPlatform,
  createGround,
  PhysicsObject
} from "../GameObjects";
import { SelectionManager } from "../Selection";

export class Level1Scene {
  private running = false;
  private animateBound: () => void;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private selection!: SelectionManager;

  private ball!: PhysicsObject;
  private platform!: PhysicsObject;
  private ground!: PhysicsObject;
  private goalMesh!: THREE.Mesh;

  private statusEl: HTMLDivElement | null = null;

  private keys: Record<string, boolean> = {};
  private gameOver = false;

  constructor() {
    this.animateBound = this.animate.bind(this);
  }

  async start() {
    this.running = true;

    await initPhysics();

    this.statusEl = document.getElementById("status-message") as HTMLDivElement | null;
    this.setStatus("");

    this.initThree();
    this.initInput();

    this.ground = createGround(this.scene, physicsWorld, AmmoLib);
    this.goalMesh = createGoal(this.scene);
    this.goalMesh.position.set(2, 0.05, -3);

    // Create platform FIRST then apply rotation immediately
    this.platform = createPlatform(this.scene, physicsWorld, AmmoLib);

    // Force physics sync so slope actually exists BEFORE ball placement
    this.syncPlatformRotationToPhysics();

    // Now spawn ball at correct slope-side location
    this.ball = createBall(this.scene, physicsWorld, AmmoLib);

    // Sync visual position of ball to physics
    {
      const tmp = new AmmoLib.btTransform();
      this.ball.body.getMotionState().getWorldTransform(tmp);
      const p = tmp.getOrigin();
      this.ball.mesh.position.set(p.x(), p.y(), p.z());
    }

    // selection system
    this.selection = new SelectionManager(this.camera, this.renderer);
    this.selection.addSelectable(this.platform);

    requestAnimationFrame(this.animateBound);
  }

  stop() {
    this.running = false;
    if (this.renderer) this.renderer.domElement.remove();
  }

  /* ========= UI Helper ========= */
  setStatus(text: string, color: string = "#ffffff") {
    if (!this.statusEl) return;
    this.statusEl.textContent = text;
    this.statusEl.style.color = color;
  }

  /* ========= Rendering ========= */
  initThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(5, 5, 7);
    this.camera.lookAt(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    this.scene.add(light);
  }

  /* ========= Input ========= */
  initInput() {
    window.addEventListener("keydown", e => (this.keys[e.code] = true));
    window.addEventListener("keyup", e => (this.keys[e.code] = false));
  }

  /* ========= Reset Ball ========= */
  resetBall() {
    const transform = new AmmoLib.btTransform();
    transform.setIdentity();
    transform.setOrigin(new AmmoLib.btVector3(0, 2.2, -1.0));

    this.ball.body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));
    this.ball.body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
    this.ball.body.setWorldTransform(transform);
    this.ball.body.getMotionState().setWorldTransform(transform);
    this.ball.body.activate(true);

    this.ball.mesh.position.set(0, 2.2, -1.0);

    this.gameOver = false;
    this.setStatus("");
    (this.goalMesh.material as THREE.MeshStandardMaterial).color.setHex(0x00aa44);
  }

  /* ========= Selection Input ========= */
  handleInput() {
    if (this.keys["KeyR"]) {
      this.resetBall();
      this.keys["KeyR"] = false;
      return;
    }

    if (!this.selection.selected) return;

    const selected = this.selection.selected;
    let moved = false;

    if (this.keys["KeyA"]) {
      selected.mesh.rotation.z += 0.03;
      moved = true;
    }
    if (this.keys["KeyD"]) {
      selected.mesh.rotation.z -= 0.03;
      moved = true;
    }

    if (moved) this.syncPlatformRotationToPhysics();
  }

  /* ========= Ensure platform physics matches visual rotation ========= */
  syncPlatformRotationToPhysics() {
    const selected = this.selection?.selected ?? this.platform;

    const t = new AmmoLib.btTransform();
    t.setIdentity();
    t.setOrigin(
      new AmmoLib.btVector3(
        selected.mesh.position.x,
        selected.mesh.position.y,
        selected.mesh.position.z
      )
    );

    const q = new THREE.Quaternion().setFromEuler(selected.mesh.rotation);
    t.setRotation(new AmmoLib.btQuaternion(q.x, q.y, q.z, q.w));

    selected.body.setWorldTransform(t);
    selected.body.getMotionState().setWorldTransform(t);
    this.ball?.body?.activate(true);
  }

  /* ========= Physics Sync + Win/Lose ========= */
  syncBallAndCheckWinLoss() {
    const t = new AmmoLib.btTransform();
    this.ball.body.getMotionState().getWorldTransform(t);

    const p = t.getOrigin();
    this.ball.mesh.position.set(p.x(), p.y(), p.z());

    if (!this.gameOver && this.ball.mesh.position.y < -2) {
      this.gameOver = true;
      this.setStatus("YOU LOSE", "#ff2244");
      (this.goalMesh.material as THREE.MeshStandardMaterial).color.setHex(0xaa0000);
      return;
    }

    const gx = this.goalMesh.position.x;
    const gz = this.goalMesh.position.z;
    const halfSize = 1.0;

    const inX = Math.abs(this.ball.mesh.position.x - gx) < halfSize;
    const inZ = Math.abs(this.ball.mesh.position.z - gz) < halfSize;
    const nearY = this.ball.mesh.position.y > 0 && this.ball.mesh.position.y < 1;

    if (!this.gameOver && inX && inZ && nearY) {
      this.gameOver = true;
      this.setStatus("YOU WIN!", "#22ff88");
      (this.goalMesh.material as THREE.MeshStandardMaterial).color.setHex(0x22ff88);
    }
  }

  /* ========= Game Loop ========= */
  animate() {
    if (!this.running) return;

    this.handleInput();
    stepPhysics(1 / 60);
    this.syncBallAndCheckWinLoss();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animateBound);
  }
}
