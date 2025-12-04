export type SceneController = {
  start(): void;
  stop(): void;
};

export class SceneManager {
  private currentScene: SceneController | null = null;

  // Load from browser storage
  getSavedSceneName(): string | null {
    return localStorage.getItem("lastScene");
  }

  saveSceneName(name: string) {
    localStorage.setItem("lastScene", name);
  }

  changeScene(next: SceneController, sceneName: string) {
    if (this.currentScene) this.currentScene.stop();
    this.currentScene = next;
    this.saveSceneName(sceneName);
    next.start();
  }
}

// Singleton - so any file can import it
export const sceneManager = new SceneManager();
