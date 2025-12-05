export class TouchControlsUI {
  private container: HTMLDivElement;
  leftBtn: HTMLButtonElement;
  rightBtn: HTMLButtonElement;
  resetBtn: HTMLButtonElement;

  constructor() {
    this.container = document.createElement("div");

    // New Bottom UI Layout 
    this.container.style.position = "absolute";
    this.container.style.bottom = "20px"; // bottom instead of top
    this.container.style.left = "50%";
    this.container.style.transform = "translateX(-50%)";
    this.container.style.display = "flex";
    this.container.style.gap = "18px";      // little wider spacing
    this.container.style.zIndex = "2500";

    document.body.appendChild(this.container);

    // Create buttons
    this.leftBtn = this.makeButton("⟵");
    this.rightBtn = this.makeButton("⟶");
    this.resetBtn = this.makeButton("⟳");

    // Order: left | reset | right
    this.container.appendChild(this.leftBtn);
    this.container.appendChild(this.resetBtn);
    this.container.appendChild(this.rightBtn);
  }

  private makeButton(label: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = label;

    // Nicer button styling for bottom UI
    btn.style.fontSize = "30px";
    btn.style.padding = "14px 22px";
    btn.style.background = "rgba(30,30,30,0.85)";
    btn.style.color = "white";
    btn.style.border = "2px solid white";
    btn.style.borderRadius = "10px";
    btn.style.cursor = "pointer";
    btn.style.touchAction = "manipulation";

    return btn;
  }

  remove() {
    this.container.remove();
  }
}