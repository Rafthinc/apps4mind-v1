export default class Level4Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level4Scene" });
  }

  preload() {
    // Lista categoriilor de obiecte (fără sufixul -1 sau -2)
    this.categories = ["catel", "copac", "mar-rosu", "masina", "para", "pui"];

    // Încărcăm automat ambele variante pentru fiecare categorie
    this.categories.forEach((cat) => {
      this.load.image(`${cat}-1`, `assets/imagini/${cat}-1.webp`);
      this.load.image(`${cat}-2`, `assets/imagini/${cat}-2.webp`);
    });
  }

  create() {
    // Butonul de Home (Acasă)
    const homeButton = this.add
      .dom(70, 40, "button", "", "Acasă")
      .setClassName("home-button");
    homeButton.addListener("click");
    homeButton.on("click", () => {
      this.scene.start("StartScene");
    });

    // Amestecăm categoriile disponibile pentru runde
    this.remainingCategories = Phaser.Utils.Array.Shuffle([...this.categories]);

    // Variabile pentru stocarea elementelor curente pe ecran
    this.bottomImages = [];
    this.dropZones = [];
    this.topImage = null;

    const w = this.scale.width;
    const h = this.scale.height;

    // Textul de succes
    this.successText = this.add
      .dom(w / 2, h / 2, "div", "", "POTRIVIRE CORECTĂ!")
      .setClassName("success-text")
      .setOrigin(0.5)
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
      // Acum verificăm dacă FAC PARTE DIN ACEEAȘI CATEGORIE (ex: ambele sunt "catel")
      if (gameObject.matchCategory === dropZone.matchCategory) {
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
    const w = this.scale.width;
    const h = this.scale.height;

    this.bottomImages.forEach((img) => img.destroy());
    this.dropZones.forEach((zone) => zone.destroy());
    if (this.topImage) this.topImage.destroy();

    this.bottomImages = [];
    this.dropZones = [];

    // Verificăm dacă mai avem categorii de jucat
    if (this.remainingCategories.length === 0) {
      this.add
        .dom(w / 2, h / 2, "div", "", "FELICITĂRI! AI TERMINAT NIVELUL 4!")
        .setClassName("success-text")
        .setOrigin(0.5);
      return;
    }

    // Extragem categoria țintă pentru această rundă (ex: "masina")
    const targetCategory = this.remainingCategories.pop();

    // Căutăm 2 "distrageri" din alte categorii (ex: "catel" și "copac")
    const availableDistractors = this.categories.filter(
      (cat) => cat !== targetCategory,
    );
    Phaser.Utils.Array.Shuffle(availableDistractors);
    const distractors = [availableDistractors[0], availableDistractors[1]];

    // Formăm lista pentru opțiunile de jos și le amestecăm
    const bottomCategories = [targetCategory, ...distractors];
    Phaser.Utils.Array.Shuffle(bottomCategories);

    const targetSize = w < 600 ? 100 : 150;
    const bottomXPositions = [w * 0.2, w * 0.5, w * 0.8];

    for (let i = 0; i < 3; i++) {
      let category = bottomCategories[i];
      // Pentru partea de JOS construim numele imaginii folosind sufixul "-2"
      let imgKeyBottom = `${category}-2`;

      // Desenăm imaginea de jos
      let img = this.add
        .image(bottomXPositions[i], h * 0.8, imgKeyBottom)
        .setDisplaySize(targetSize, targetSize);
      this.bottomImages.push(img);

      // Creăm zona de drop și salvăm CATEGORIA pentru potrivire
      let zone = this.add
        .zone(bottomXPositions[i], h * 0.8, img.displayWidth, img.displayHeight)
        .setRectangleDropZone(img.displayWidth, img.displayHeight);
      zone.matchCategory = category;
      this.dropZones.push(zone);
    }

    // 2. Creăm elementul trăgabil din partea de SUS (folosind sufixul "-1")
    let imgKeyTop = `${targetCategory}-1`;
    this.topImage = this.add
      .image(w / 2, h * 0.2, imgKeyTop)
      .setDisplaySize(targetSize, targetSize)
      .setInteractive();

    this.topImage.matchCategory = targetCategory; // Memorăm categoria imaginii de sus
    this.topImage.originalX = this.topImage.x;
    this.topImage.originalY = this.topImage.y;
    this.input.setDraggable(this.topImage);
  }
}
