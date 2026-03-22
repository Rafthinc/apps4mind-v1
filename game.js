import StartScene from "./StartScene.js";
import MainScene from "./MainScene.js";
import AppleScene from "./AppleScene.js";
import Level3Scene from "./Level3Scene.js";

// Configurarea de bază a jocului
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT, // Redimensionează jocul pentru a încăpea pe ecran
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centrează jocul orizontal și vertical
    width: 800, // Rezoluția internă de bază (lățime)
    height: 700, // Rezoluția internă de bază (înălțime)
  },
  backgroundColor: "#E0F2F1", // Fundal calm (mint pastel)
  scene: [StartScene, MainScene, AppleScene, Level3Scene], // Adăugăm scenele aici
};

// Pornim jocul
const game = new Phaser.Game(config);
