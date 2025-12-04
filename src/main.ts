import { sceneManager } from "./SceneManager";
import { MainMenuScene } from "./scenes/MainMenu";

function startGame() {
  sceneManager.changeScene(new MainMenuScene(), "Menu");
}

startGame();
