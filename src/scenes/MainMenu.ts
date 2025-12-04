import { sceneManager } from "../SceneManager";
import { Level1Scene } from "./Level1Scene";

export class MainMenuScene {
  private container: HTMLDivElement | null = null;

  start() {
    // Create UI container
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100vw";
    this.container.style.height = "100vh";
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.justifyContent = "center";
    this.container.style.alignItems = "center";
    this.container.style.background = "#111";
    this.container.style.color = "white";
    this.container.style.fontFamily = "sans-serif";
    this.container.style.gap = "20px";
    this.container.style.fontSize = "24px";

    // Title
    const title = document.createElement("div");
    title.textContent = "TITLE";
    title.style.fontSize = "48px";
    title.style.marginBottom = "40px";
    this.container.appendChild(title);

    // New Game button
    const newGameBtn = document.createElement("button");
    newGameBtn.textContent = "New Game";
    newGameBtn.style.padding = "10px 30px";
    newGameBtn.onclick = () => {
      sceneManager.changeScene(new Level1Scene(), "Level1");
    };
    this.container.appendChild(newGameBtn);

    // Continue button
    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue";
    continueBtn.style.padding = "10px 30px";
    continueBtn.onclick = () => {
      const last = sceneManager.getSavedSceneName() ?? "Level1";
      sceneManager.changeScene(new Level1Scene(), last);
    };
    this.container.appendChild(continueBtn);

    document.body.appendChild(this.container);
  }

  stop() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
