export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  create() {
    // Titlul jocului
    this.add
      .text(400, 200, "Joc de Potrivire", {
        fontSize: "48px",
        fill: "#264653", // Culoare închisă și calmă pentru titlu
      })
      .setOrigin(0.5);

    // Butonul pentru Nivelul 1 (Forme Multiple)
    const level1Button = this.add
      .text(400, 320, "Nivel 1 (Forme)", {
        fontSize: "24px",
        fill: "#ffffff",
        backgroundColor: "#457B9D", // Albastru moale
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    level1Button.on(
      "pointerover",
      () => level1Button.setStyle({ fill: "#FFE066" }), // Hover în galben stins
    );
    level1Button.on("pointerout", () =>
      level1Button.setStyle({ fill: "#ffffff" }),
    );

    level1Button.on("pointerdown", () => {
      this.scene.start("MainScene");
    });

    // Butonul pentru Nivelul 2 (Măr)
    const level2Button = this.add
      .text(400, 400, "Nivel 2 (Măr)", {
        fontSize: "24px",
        fill: "#ffffff",
        backgroundColor: "#457B9D",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    level2Button.on("pointerover", () =>
      level2Button.setStyle({ fill: "#FFE066" }),
    );
    level2Button.on("pointerout", () =>
      level2Button.setStyle({ fill: "#ffffff" }),
    );

    level2Button.on("pointerdown", () => {
      this.scene.start("AppleScene");
    });

    // Butonul pentru Nivelul 3 (3 variante jos)
    const level3Button = this.add
      .text(400, 480, "Nivel 3 (Amestecat)", {
        fontSize: "24px",
        fill: "#ffffff",
        backgroundColor: "#457B9D",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    level3Button.on("pointerover", () =>
      level3Button.setStyle({ fill: "#FFE066" }),
    );
    level3Button.on("pointerout", () =>
      level3Button.setStyle({ fill: "#ffffff" }),
    );

    level3Button.on("pointerdown", () => {
      this.scene.start("Level3Scene");
    });
  }
}
