export default class Level6Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level6Scene" });
  }

  preload() {
    // Array-ul cu animalele disponibile.
    // Pentru a adăuga mai multe, doar introdu numele lor aici (fără -fata/-spate).
    this.animals = [
      "albina",
      "calut",
      "catel",
      "vacuta",
      "tigru",
      "elefant",
      "urs",
      "vulpe",
      "snake",
      "camila",
      "cerb",
      "delfin",
    ];

    // Încărcăm automat toate imaginile și sunetele bazat pe array-ul de mai sus
    this.animals.forEach((animal) => {
      this.load.image(`${animal}-fata`, `assets/scena-6/${animal}-fata.webp`);
      this.load.image(`${animal}-spate`, `assets/scena-6/${animal}-spate.webp`);
      this.load.audio(`${animal}-sunet`, `assets/scena-6/${animal}.mp3`);
    });

    this.load.audio("fail", "assets/scena-1/fail.wav");
    this.load.image("confetti", "assets/imagini/confetti.png");
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Butonul de Home (Acasă)
    const homeButton = this.add
      .dom(70, 40, "button", "", "Acasă")
      .setClassName("home-button");
    homeButton.addListener("click");
    homeButton.on("click", () => {
      this.scene.start("StartScene");
    });

    // Inițializăm variabilele pentru stocarea elementelor
    this.leftItems = [];
    this.rightItems = [];
    this.dropZones = [];

    // Contoare pentru textul din partea de sus
    this.totalMatches = 0;
    this.totalAttempts = 0;

    // Textul pentru evidența potrivirilor
    this.scoreText = this.add
      .text(w / 2, h * 0.08, "Potriviri: 0 din 0 încercări", {
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
        fontSize: w < 600 ? "18px" : "28px",
        color: "#264653",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Textul de succes global (afișat la capătul unei runde de 3)
    this.successText = this.add
      .dom(w / 2, h / 2, "div", "", "RUNDĂ COMPLETĂ!")
      .setClassName("success-text")
      .setOrigin(0.5)
      .setVisible(false);

    // Generăm prima rundă
    this.startNextRound();

    // --- Logica de Drag & Drop ---
    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setDepth(10); // Îl aducem în fața tuturor la tragere
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      this.totalAttempts++;

      // Verificăm dacă cheile animalelor se potrivesc
      if (gameObject.matchKey === dropZone.matchKey) {
        this.totalMatches++;

        // Actualizăm textul și aplicăm efectul de pop (zoom mic)
        this.scoreText.setText(
          `Potriviri: ${this.totalMatches} din ${this.totalAttempts} încercări`,
        );
        this.tweens.add({
          targets: this.scoreText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 150,
          yoyo: true,
        });

        // Sunetul specific animalului
        this.sound.play(`${gameObject.matchKey}-sunet`);

        // Lipim partea din spate pe zona corect calculată
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.input.enabled = false;

        // O mică animație de „săritură” de bucurie a animalului asamblat
        this.tweens.add({
          targets: [gameObject, dropZone.headImg],
          y: gameObject.y - 15,
          duration: 200,
          yoyo: true,
          ease: "Quad.easeOut",
        });

        this.matchedCount++;

        // Dacă s-au potrivit toate cele 3 din runda curentă
        if (this.matchedCount === 3) {
          this.successText.setVisible(true);

          const particles = this.add.particles("confetti");
          particles.setDepth(20);
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

          // Trecem la runda următoare după 2 secunde
          this.time.delayedCall(2000, () => {
            this.successText.setVisible(false);
            particles.destroy();
            this.startNextRound();
          });
        }
      } else {
        // Potrivire greșită
        this.scoreText.setText(
          `Potriviri: ${this.totalMatches} din ${this.totalAttempts} încercări`,
        );
        this.sound.play("fail");
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });

    this.input.on("dragend", (pointer, gameObject, dropped) => {
      if (gameObject.active) {
        gameObject.setDepth(1);
      }
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });
  }

  startNextRound() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Curățăm elementele din runda anterioară
    this.leftItems.forEach((item) => item.destroy());
    this.rightItems.forEach((item) => item.destroy());
    this.dropZones.forEach((zone) => zone.destroy());

    this.leftItems = [];
    this.rightItems = [];
    this.dropZones = [];
    this.matchedCount = 0; // Resetăm progresul rundei curente

    // Extragem 3 animale aleatorii din array-ul principal (chiar dacă sunt 10, va alege doar 3)
    const shuffledAnimals = Phaser.Utils.Array.Shuffle([...this.animals]);
    const roundAnimals = [
      shuffledAnimals[0],
      shuffledAnimals[1],
      shuffledAnimals[2],
    ];

    // Scalare inteligentă adaptată pe mobil vs desktop
    const targetSize = w < 600 ? 110 : 200;
    const headX = w < 600 ? w * 0.25 : w * 0.3;
    const rightX = w < 600 ? w * 0.8 : w * 0.75;

    // Poziții amestecate pe axa Y
    const leftPositionsY = [h * 0.3, h * 0.55, h * 0.8];
    const rightPositionsY = [...leftPositionsY];
    Phaser.Utils.Array.Shuffle(rightPositionsY);

    // Creăm cele 3 perechi din rundă
    for (let i = 0; i < 3; i++) {
      let animal = roundAnimals[i];

      // 1. Creăm FATA animalului în stânga
      let headImg = this.add.image(headX, leftPositionsY[i], `${animal}-fata`);
      headImg.setScale(targetSize / Math.max(headImg.width, headImg.height));
      this.leftItems.push(headImg);

      // 2. Creăm SPATELE trăgabil în dreapta
      let backImg = this.add.image(
        rightX,
        rightPositionsY[i],
        `${animal}-spate`,
      );
      backImg.setScale(targetSize / Math.max(backImg.width, backImg.height));
      backImg.setInteractive();
      this.input.setDraggable(backImg);

      backImg.matchKey = animal;
      backImg.originalX = backImg.x;
      backImg.originalY = backImg.y;
      backImg.setDepth(1);
      this.rightItems.push(backImg);

      // 3. Calculăm dinamic Drop Zone-ul ca să fie exact în dreapta feței
      // Scădem 2 pixeli ca să ne asigurăm că se suprapun perfect fără margini invizibile (gap)
      let dropX =
        headImg.x + headImg.displayWidth / 2 + backImg.displayWidth / 2 - 2;

      let dropZone = this.add
        .zone(
          dropX,
          leftPositionsY[i],
          backImg.displayWidth * 1.5,
          backImg.displayHeight * 1.5,
        )
        .setRectangleDropZone(
          backImg.displayWidth * 1.5,
          backImg.displayHeight * 1.5,
        );

      dropZone.matchKey = animal;
      dropZone.headImg = headImg; // Păstrăm o referință către față pentru animația de potrivire
      this.dropZones.push(dropZone);
    }
  }
}
