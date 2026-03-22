import StartScene from "./StartScene.js";
import MainScene from "./MainScene.js";
import AppleScene from "./AppleScene.js";
import Level3Scene from "./Level3Scene.js";

// Configurarea de bază a jocului
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: "#2c3e50",
  scene: [StartScene, MainScene, AppleScene, Level3Scene], // Adăugăm scenele aici
};

// Pornim jocul
const game = new Phaser.Game(config);
