export default class AppleScene extends Phaser.Scene {
  constructor() {
    super({ key: "AppleScene" });
  }

  preload() {
    // Lista cu numele imaginilor pe care vrei să le folosești
    this.imageKeys = [
      "catel-1",
      "copac-1",
      "mar-1",
      "masina-1",
      "para-1",
      "pui-1",
    ];

    // Încărcăm automat toate imaginile din listă
    this.imageKeys.forEach((key) => {
      this.load.image(key, `assets/imagini/${key}.webp`);
    });

    this.load.image("stea-goala", "assets/imagini/stea-goala.png");
    this.load.image("stea-plina", "assets/imagini/stea-plina.png");
    this.load.image("confetti", "assets/imagini/confetti.png");
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

    this.score = 0;
    this.totalRounds = this.imageKeys.length;
    this.stars = [];
    const starSpacing = w < 600 ? 40 : 60;
    const starStartX = w / 2 - ((this.totalRounds - 1) * starSpacing) / 2;

    for (let i = 0; i < this.totalRounds; i++) {
      let star = this.add.image(
        starStartX + i * starSpacing,
        h * 0.1,
        "stea-goala",
      );
      star.setDisplaySize(starSpacing * 0.8, starSpacing * 0.8);
      this.stars.push(star);
    }

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

      if (this.score < this.totalRounds) {
        let currentStar = this.stars[this.score];
        currentStar.setTexture("stea-plina");

        // Efect vizual de mărire (pop)
        this.tweens.add({
          targets: currentStar,
          scaleX: currentStar.scaleX * 1.5,
          scaleY: currentStar.scaleY * 1.5,
          duration: 300,
          yoyo: true, // o face să se micșoreze la loc
          ease: "Back.easeOut", // efect de elasticitate la mărire
        });

        this.score++;
      }

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

      // Efect de ploaie de confetti
      const particles = this.add.particles("confetti");
      particles.setDepth(10);
      particles.createEmitter({
        x: { min: 0, max: w },
        y: -50,
        speedY: { min: 100, max: 300 },
        speedX: { min: -50, max: 50 },
        gravityY: 100,
        scale: { start: 0.5, end: 0.1 },
        rotate: { start: 0, end: 360 },
        lifespan: 5000,
        frequency: 200,
      });

      return; // Ne oprim aici
    }

    // Scoatem următoarea imagine din array-ul amestecat
    const currentImage = this.remainingImages.pop();

    const targetSize = w < 600 ? 150 : 350; // Setăm o dimensiune standard uniformă în pixeli

    // 1. Creăm ținta din partea de jos
    this.bottomImage = this.add.image(w / 2, h * 0.8, currentImage);
    this.bottomImage.setScale(
      targetSize / Math.max(this.bottomImage.width, this.bottomImage.height),
    );

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
    this.topImage = this.add.image(w / 2, h * 0.3, currentImage);
    this.topImage.setScale(
      targetSize / Math.max(this.topImage.width, this.topImage.height),
    );
    this.topImage.setInteractive();

    this.topImage.originalX = this.topImage.x;
    this.topImage.originalY = this.topImage.y;

    this.input.setDraggable(this.topImage);
  }
}
