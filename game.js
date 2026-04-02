import StartScene from "./StartScene.js";
import MainScene from "./MainScene.js";
import AppleScene from "./AppleScene.js";
import Level3Scene from "./Level3Scene.js";
import Level4Scene from "./Level4Scene.js";
import Level5Scene from "./Level5Scene.js";
import Level6Scene from "./Level6Scene.js";
import Level7Scene from "./Level7Scene.js";

// Configurarea de bază a jocului
const config = {
  type: Phaser.AUTO,
  dom: {
    createContainer: true, // Permite folosirea elementelor HTML
  },
  resolution: window.devicePixelRatio || 1, // Previne imaginile blurate/pixelate pe telefoane
  scale: {
    mode: Phaser.Scale.RESIZE, // Ocupă 100% din ecran în funcție de dispozitiv
    parent: "body",
    width: "100%",
    height: "100%",
  },
  backgroundColor: "#E0F2F1", // Fundal calm (mint pastel)
  scene: [
    StartScene,
    MainScene,
    AppleScene,
    Level3Scene,
    Level4Scene,
    Level5Scene,
    Level6Scene,
    Level7Scene,
  ], // Adăugăm scenele aici
};

// Pornim jocul
const game = new Phaser.Game(config);
