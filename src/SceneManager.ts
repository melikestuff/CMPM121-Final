export type SceneController = {
  start(): void;
  stop(): void;
};

export class SceneManager {
  private currentScene: SceneController | null = null;

  // Keys for persistent storage
  private lastSceneKey = "lastScene";
  private unlockedLevelKey = "unlockedLevel";

   // --------------- Load / Save last played scene ----------------
  getSavedSceneName(): string | null {
    return localStorage.getItem("lastScene");
  }

  saveSceneName(name: string) {
    localStorage.setItem("lastScene", name);
  }

  // --------------- Level Unlock System ----------------
  unlockLevel(levelName: string) {
    localStorage.setItem(this.unlockedLevelKey, levelName);
  }

  getUnlockedLevel(): string | null {
    return localStorage.getItem(this.unlockedLevelKey);
  }

  resetProgress() {
    localStorage.removeItem(this.unlockedLevelKey);
    localStorage.removeItem(this.lastSceneKey);
  }

  // --------------- Scene Switching ----------------
  changeScene(next: SceneController, sceneName: string) {
    if (this.currentScene) this.currentScene.stop();
    this.currentScene = next;
    this.saveSceneName(sceneName);
    next.start();
  }
}

// Singleton - so any file can import it
export const sceneManager = new SceneManager();
