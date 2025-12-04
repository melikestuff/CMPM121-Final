export type SceneController = {
    start(): void;
    stop(): void;
};

export class SceneManager {
    private currentScene: SceneController | null = null;

    // === Save LAST SCENE (existing system) ===
    getSavedSceneName(): string | null {
        return localStorage.getItem("lastScene");
    }

    saveSceneName(name: string) {
        localStorage.setItem("lastScene", name);
    }

    // === NEW: Track highest unlocked level ===
    unlockLevel(level: string) {
        localStorage.setItem("unlockedLevel", level);
    }

    getUnlockedLevel(): string {
        return localStorage.getItem("unlockedLevel") ?? "Level1";
    }

    resetProgress() {
        localStorage.removeItem("unlockedLevel");
    }

    // === Scene transition logic ===
    changeScene(next: SceneController, sceneName: string) {
        if (this.currentScene) this.currentScene.stop();
        this.currentScene = next;
        this.saveSceneName(sceneName);
        next.start();
    }
}

// Singleton instance
export const sceneManager = new SceneManager();
