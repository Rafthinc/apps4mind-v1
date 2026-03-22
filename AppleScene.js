export default class AppleScene extends Phaser.Scene {
  constructor() {
    super({ key: "AppleScene" });
  }

  preload() {
    // Lista cu numele imaginilor pe care vrei să le folosești
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
      .dom(70, 40, "button", "", "Acasă")
      .setClassName("home-button");
    homeButton.addListener("click");
    homeButton.on("click", () => {
      this.scene.start("StartScene");
    });

    // Creăm o copie amestecată a listei de imagini pentru runda curentă
    this.remainingImages = Phaser.Utils.Array.Shuffle([...this.imageKeys]);

    // Variabile pentru a stoca elementele din rundă, astfel încât să le putem înlocui/șterge
    this.bottomImage = null;
    this.topImage = null;
    this.dropZone = null;

    const w = this.scale.width;
    const h = this.scale.height;

    // Textul de succes - îl creăm ascuns (setVisible(false))
    this.successText = this.add
      .dom(w / 2, h / 2, "div", "", "POTRIVIRE CORECTĂ!")
      .setClassName("success-text")
      .setOrigin(0.5)
      .setVisible(false);

    // --- Logica de Drag & Drop ---
    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setDepth(2); // Când îl tragem, îl aducem în fața altor elemente
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      // Actualizăm poziția în funcție de mișcarea mouse-ului
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      // Dacă a fost eliberat fix peste zona de jos (imaginea țintă)
      gameObject.x = dropZone.x;
      gameObject.y = dropZone.y;

      // Dezactivăm interactivitatea, nu mai poate fi mutat
      gameObject.input.enabled = false;

      // Afișăm temporar mesajul de succes
      this.successText.setVisible(true);

      // Așteptăm 1 secundă (1000 ms), apoi pornim următoarea rundă
      this.time.delayedCall(1000, () => {
        this.successText.setVisible(false);
        this.startNextRound();
      });
    });

    this.input.on("dragend", (pointer, gameObject, dropped) => {
      gameObject.setDepth(1);
      // Dacă a fost eliberat în afara țintei, îl trimitem la poziția de pornire
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });

    // Pornim prima rundă afișând prima imagine
    this.startNextRound();
  }

  startNextRound() {
    // Curățăm imaginile și zona de potrivire din runda anterioară
    const w = this.scale.width;
    const h = this.scale.height;

    if (this.bottomImage) this.bottomImage.destroy();
    if (this.topImage) this.topImage.destroy();
    if (this.dropZone) this.dropZone.destroy();

    // Dacă nu mai sunt imagini în listă, afișăm mesajul final
    if (this.remainingImages.length === 0) {
      this.add
        .dom(w / 2, h / 2, "div", "", "FELICITĂRI! AI TERMINAT!")
        .setClassName("success-text")
        .setOrigin(0.5);
      return; // Ne oprim aici
    }

    // Scoatem următoarea imagine din array-ul amestecat
    const currentImage = this.remainingImages.pop();

    const scaleFact = w < 600 ? 0.2 : 0.3; // Scalăm imaginea pe dispozitive mici

    // 1. Creăm ținta din partea de jos
    this.bottomImage = this.add
      .image(w / 2, h * 0.8, currentImage)
      .setScale(scaleFact);

    this.dropZone = this.add
      .zone(
        w / 2,
        h * 0.8,
        this.bottomImage.displayWidth,
        this.bottomImage.displayHeight,
      )
      .setRectangleDropZone(
        this.bottomImage.displayWidth,
        this.bottomImage.displayHeight,
      );

    // 2. Creăm elementul trăgabil din partea de sus
    this.topImage = this.add
      .image(w / 2, h * 0.2, currentImage)
      .setScale(scaleFact)
      .setInteractive();
    this.topImage.originalX = this.topImage.x;
    this.topImage.originalY = this.topImage.y;

    this.input.setDraggable(this.topImage);
  }
}
