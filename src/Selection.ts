import * as THREE from "three";
import { PhysicsObject } from "./GameObjects";

export class SelectionManager {
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;

  private selectable: PhysicsObject[] = [];
  public selected: PhysicsObject | null = null;

  constructor(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown);
  }

  addSelectable(obj: PhysicsObject) {
    this.selectable.push(obj);
  }

  clearSelectable() {
    this.selectable = [];
  }

  private highlight(obj: PhysicsObject | null) {
    // Remove old highlight
    if (this.selected) {
      (this.selected.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
    }

    this.selected = obj;

    // Add new highlight
    if (this.selected) {
      (this.selected.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x222222);
    }
  }

  private onPointerDown = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    this.pointer.x = x * 2 - 1;
    this.pointer.y = -(y * 2 - 1);

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const meshes = this.selectable.map(obj => obj.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);

    if (hits.length > 0) {
      const hitMesh = hits[0].object;
      const found = this.selectable.find(obj => obj.mesh === hitMesh) ?? null;
      this.highlight(found);
    } else {
      this.highlight(null);
    }
  };
}
