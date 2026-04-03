export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Titlul jocului
    this.add
      .dom(w / 2, h * 0.1, "div", "", "Joc de Potrivire")
      .setClassName("game-title")
      .setOrigin(0.5);

    // Lista de nivele pentru generarea automată a butoanelor
    const levels = [
      { key: "MainScene", text: "Nivel 1 (Forme)" },
      { key: "AppleScene", text: "Nivel 2 (Măr)" },
      { key: "Level3Scene", text: "Nivel 3 (Amestecat)" },
      { key: "Level4Scene", text: "Nivel 4 (Asocieri)" },
      { key: "Level5Scene", text: "Nivel 5 (Umbre)" },
      { key: "Level6Scene", text: "Nivel 6 (Animale)" },
      { key: "Level7Scene", text: "Nivel 7 (Peisaj)" },
      { key: "Level8Scene", text: "Nivel 8 (Bile Matematice)" },
    ];

    // Setăm numărul de coloane: 2 pentru mobile, 3 pentru ecrane mai mari
    const cols = w < 600 ? 2 : 3;
    const startY = h * 0.25;
    const spacingY = w < 600 ? 80 : 120; // Spațierea pe verticală între rânduri

    levels.forEach((level, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      // Calculăm pozițiile exact pe mijlocul fiecărei "celule" din grilă
      const x = (w / cols) * (col + 0.5);
      const y = startY + row * spacingY;

      const button = this.add
        .dom(x, y, "button", "", level.text)
        .setClassName("game-button")
        .setOrigin(0.5);

      button.addListener("click");
      button.on("click", () => {
        this.scene.start(level.key);
      });
    });
  }
}
