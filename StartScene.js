export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Titlul jocului
    this.add
      .dom(w / 2, h * 0.15, "div", "", "Joc de Potrivire")
      .setClassName("game-title")
      .setOrigin(0.5);

    // Butonul pentru Nivelul 1 (Forme Multiple)
    const level1Button = this.add
      .dom(w / 2, h * 0.35, "button", "", "Nivel 1 (Forme)")
      .setClassName("game-button")
      .setOrigin(0.5);
    level1Button.addListener("click");
    level1Button.on("click", () => {
      this.scene.start("MainScene");
    });

    // Butonul pentru Nivelul 2 (Măr)
    const level2Button = this.add
      .dom(w / 2, h * 0.5, "button", "", "Nivel 2 (Măr)")
      .setClassName("game-button")
      .setOrigin(0.5);
    level2Button.addListener("click");
    level2Button.on("click", () => {
      this.scene.start("AppleScene");
    });

    // Butonul pentru Nivelul 3 (3 variante jos)
    const level3Button = this.add
      .dom(w / 2, h * 0.65, "button", "", "Nivel 3 (Amestecat)")
      .setClassName("game-button")
      .setOrigin(0.5);
    level3Button.addListener("click");
    level3Button.on("click", () => {
      this.scene.start("Level3Scene");
    });

    // Butonul pentru Nivelul 4 (Asocieri)
    const level4Button = this.add
      .dom(w / 2, h * 0.8, "button", "", "Nivel 4 (Asocieri)")
      .setClassName("game-button")
      .setOrigin(0.5);
    level4Button.addListener("click");
    level4Button.on("click", () => {
      this.scene.start("Level4Scene");
    });
  }
}
