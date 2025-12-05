export class TouchControlsUI {
  private container: HTMLDivElement;
  leftBtn: HTMLButtonElement;
  rightBtn: HTMLButtonElement;
  resetBtn: HTMLButtonElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "10px";
    this.container.style.left = "50%";
    this.container.style.transform = "translateX(-50%)";
    this.container.style.display = "flex";
    this.container.style.gap = "12px";
    this.container.style.zIndex = "2500";

    document.body.appendChild(this.container);

    // Create buttons
    this.leftBtn = this.makeButton("⟵");
    this.rightBtn = this.makeButton("⟶");
    this.resetBtn = this.makeButton("⟳");

    this.container.appendChild(this.leftBtn);
    this.container.appendChild(this.resetBtn);
    this.container.appendChild(this.rightBtn);
  }

  private makeButton(label: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style.fontSize = "24px";
    btn.style.padding = "10px 18px";
    btn.style.background = "rgba(30,30,30,0.8)";
    btn.style.color = "white";
    btn.style.border = "2px solid white";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.touchAction = "manipulation";
    return btn;
  }

  remove() {
    this.container.remove();
  }
}
