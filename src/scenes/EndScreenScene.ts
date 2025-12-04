import { inventory } from "../Inventory";
import { sceneManager } from "../SceneManager";
import { MainMenuScene } from "./MainMenu";

export class EndScreenScene {
  private container: HTMLDivElement | null = null;

  start() {
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100vw";
    this.container.style.height = "100vh";
    this.container.style.background = "#111";
    this.container.style.color = "white";
    this.container.style.fontFamily = "sans-serif";
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.alignItems = "center";
    this.container.style.justifyContent = "center";
    this.container.style.gap = "20px";

    // Big win text
    const winText = document.createElement("div");
    winText.textContent = "YOU WIN!";
    winText.style.fontSize = "72px";
    winText.style.fontWeight = "bold";
    this.container.appendChild(winText);

    // Check item completion condition
    const summary = document.createElement("div");
    summary.style.fontSize = "28px";
    summary.style.opacity = "0.9";

    const hasItem1 = inventory.has("GoldenBadge");
    const hasItem2 = inventory.has("PlatinumBadge");

    if (hasItem1 && hasItem2) {
      summary.textContent = "You collected ALL items!";
    } else {
      summary.textContent = "You missed some items...";
    }

    this.container.appendChild(summary);

    // Return to menu button
    const menuBtn = document.createElement("button");
    menuBtn.textContent = "Return to Main Menu";
    menuBtn.style.padding = "10px 25px";
    menuBtn.style.fontSize = "20px";
    menuBtn.onclick = () => {
        sceneManager.unlockLevel("End");
        sceneManager.changeScene(new MainMenuScene(), "MainMenu");
    };
    this.container.appendChild(menuBtn);

    document.body.appendChild(this.container);
  }

  stop() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
