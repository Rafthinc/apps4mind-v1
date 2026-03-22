export default class Level3Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level3Scene" });
  }

  preload() {
    // Lista cu numele imaginilor
    this.imageKeys = [
      "mar-rosu",
      "mar-verde",
      "masina",
      "catel",
      "copac",
      "puisor",
    ];

    // Încărcăm automat toate imaginile din listă
    this.imageKeys.forEach((key) => {
      this.load.image(key, `assets/${key}.png`);
    });
  }

  create() {
    // Butonul de Home (Acasă)
    const homeButton = this.add
      .text(20, 20, "Acasă", {
        fontSize: "24px",
        fill: "#ffffff",
        backgroundColor: "#333",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    homeButton.on("pointerover", () => homeButton.setStyle({ fill: "#ff0" }));
    homeButton.on("pointerout", () => homeButton.setStyle({ fill: "#ffffff" }));
    homeButton.on("pointerdown", () => {
      this.scene.start("StartScene");
    });

    // Amestecăm imaginile disponibile pentru runde
    this.remainingImages = Phaser.Utils.Array.Shuffle([...this.imageKeys]);

    // Variabile pentru stocarea elementelor curente pe ecran
    this.bottomImages = [];
    this.dropZones = [];
    this.topImage = null;

    // Textul de succes
    this.successText = this.add
      .text(400, 350, "POTRIVIRE CORECTĂ!", {
        fontSize: "40px",
        fill: "#0f0",
        backgroundColor: "#000",
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setVisible(false);

    // --- Logica de Drag & Drop ---
    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setDepth(2);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      // Verificăm dacă identificatorii corespund (cheile imaginilor)
      if (gameObject.matchKey === dropZone.matchKey) {
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.input.enabled = false;

        this.successText.setVisible(true);

        this.time.delayedCall(1000, () => {
          this.successText.setVisible(false);
          this.startNextRound();
        });
      } else {
        // Dacă l-a pus pe imaginea greșită, îl trimitem înapoi
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });

    this.input.on("dragend", (pointer, gameObject, dropped) => {
      gameObject.setDepth(1);
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });

    // Pornim prima rundă
    this.startNextRound();
  }

  startNextRound() {
    // Curățăm elementele de pe ecran din runda anterioară
    this.bottomImages.forEach((img) => img.destroy());
    this.dropZones.forEach((zone) => zone.destroy());
    if (this.topImage) this.topImage.destroy();

    this.bottomImages = [];
    this.dropZones = [];

    // Verificăm dacă mai avem imagini
    if (this.remainingImages.length === 0) {
      this.add
        .text(400, 350, "FELICITĂRI! AI TERMINAT NIVELUL 3!", {
          fontSize: "40px",
          fill: "#0f0",
          backgroundColor: "#000",
        })
        .setOrigin(0.5)
        .setDepth(10);
      return;
    }

    // Extragem imaginea principală (ținta) pentru această rundă
    const targetImage = this.remainingImages.pop();

    // Căutăm 2 "distrageri" (imagini care NU sunt targetImage)
    const availableDistractors = this.imageKeys.filter(
      (key) => key !== targetImage,
    );
    Phaser.Utils.Array.Shuffle(availableDistractors); // Le amestecăm pentru a fi mereu altele
    const distractors = [availableDistractors[0], availableDistractors[1]];

    // Formăm lista pentru imaginile de jos (ținta + 2 greșite) și o amestecăm aleator
    const bottomOptions = [targetImage, ...distractors];
    Phaser.Utils.Array.Shuffle(bottomOptions);

    // Setăm coordonatele X pentru cele 3 imagini de jos
    const bottomXPositions = [200, 400, 600];

    for (let i = 0; i < 3; i++) {
      // Desenăm imaginea de jos
      let img = this.add
        .image(bottomXPositions[i], 500, bottomOptions[i])
        .setScale(0.3);
      this.bottomImages.push(img);

      // Creăm zona de drop și salvăm "cheia" imaginii
      let zone = this.add
        .zone(bottomXPositions[i], 500, img.displayWidth, img.displayHeight)
        .setRectangleDropZone(img.displayWidth, img.displayHeight);
      zone.matchKey = bottomOptions[i]; // Memorăm ce imagine se potrivește aici
      this.dropZones.push(zone);
    }

    // 2. Creăm elementul trăgabil din partea de sus
    this.topImage = this.add
      .image(400, 200, targetImage)
      .setScale(0.3)
      .setInteractive();
    this.topImage.matchKey = targetImage; // Memorăm "cheia" proprie pentru potrivire
    this.topImage.originalX = this.topImage.x;
    this.topImage.originalY = this.topImage.y;
    this.input.setDraggable(this.topImage);
  }
}
