export type SceneController = {
    start(): void;
    stop(): void;
};

export class SceneManager {
    private currentScene: SceneController | null = null;

    // === Save LAST SCENE ===
    getSavedSceneName(): string | null {
        return localStorage.getItem("lastScene");
    }

    saveSceneName(name: string) {
        localStorage.setItem("lastScene", name);
    }

    // === NEW: Save full game state ===
    saveGame() {
        const state = {
            unlockedLevel: localStorage.getItem("unlockedLevel"),
            inventory: localStorage.getItem("inventory")
        };

        localStorage.setItem("saveSlot1", JSON.stringify(state));
        console.log("Game auto-saved:", state);
    }

    loadGame() {
        const saved = localStorage.getItem("saveSlot1");
        if (!saved) return;

        const state = JSON.parse(saved);

        // Restore unlocked level
        if (state.unlockedLevel) {
            localStorage.setItem("unlockedLevel", state.unlockedLevel);
        }

        // Restore inventory
        if (state.inventory) {
            localStorage.setItem("inventory", state.inventory);
        }

        console.log("Save loaded:", state);
    }

    unlockLevel(level: string) {
        localStorage.setItem("unlockedLevel", level);
        this.saveGame(); // Auto-save when progress happens
    }

    getUnlockedLevel(): string {
        return localStorage.getItem("unlockedLevel") ?? "Level1";
    }

    resetProgress() {
        localStorage.removeItem("unlockedLevel");
        localStorage.removeItem("saveSlot1");
    }

    // === Scene change ===
    changeScene(next: SceneController, sceneName: string) {
        if (this.currentScene) this.currentScene.stop();
        this.currentScene = next;

        this.saveSceneName(sceneName);
        this.saveGame(); // Auto save scene switch
        next.start();
    }
}

// Singleton instance
export const sceneManager = new SceneManager();
