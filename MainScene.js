export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.baseShapes = [
      "romb-albastru",
      "patrat",
      "triunghi-rosu",
      "triunghi-albastru",
      "stea",
      "romb",
      "cerc",
    ];

    this.baseShapes.forEach((shape) => {
      this.load.image(`${shape}-plin`, `assets/scena-1/${shape}-plin.webp`);
      this.load.image(`${shape}-contur`, `assets/scena-1/${shape}-contur.webp`);
      this.load.image(`${shape}-1`, `assets/scena-1/${shape}-1.webp`);
      this.load.image(`${shape}-2`, `assets/scena-1/${shape}-2.webp`);
    });

    this.load.audio("fail", "assets/scena-1/fail.wav");
    this.load.audio("yaay", "assets/scena-1/yaay.mp3");
    this.load.image("confetti", "assets/imagini/confetti.png");
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    const homeButton = this.add
      .dom(70, 40, "button", "", "Acasă")
      .setClassName("home-button");
    homeButton.addListener("click");
    homeButton.on("click", () => {
      this.scene.start("StartScene");
    });

    this.animatedSprites = [];
    this.leftItems = [];
    this.rightZones = [];
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

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.animatedSprites.forEach((item) => {
          let currentTexture = item.sprite.texture.key;
          let nextTexture = currentTexture.endsWith("-1")
            ? `${item.baseShape}-2`
            : `${item.baseShape}-1`;
          item.sprite.setTexture(nextTexture);
        });
      },
      loop: true,
    });

    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setDepth(2);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      this.totalAttempts++;

      if (gameObject.matchShape === dropZone.matchShape) {
        this.totalMatches++;
        this.scoreText.setText(
          `Potriviri: ${this.totalMatches} din ${this.totalAttempts} încercări`,
        );
        this.sound.play("yaay");

        gameObject.destroy();

        dropZone.targetImg.setTexture(`${gameObject.matchShape}-1`);

        // Recalculăm scala corectă pe baza noii imagini și o DUBLEĂM (x2)
        const newScale =
          (this.targetSize /
            Math.max(dropZone.targetImg.width, dropZone.targetImg.height)) *
          1.15;
        dropZone.targetImg.setScale(newScale);

        this.animatedSprites.push({
          sprite: dropZone.targetImg,
          baseShape: gameObject.matchShape,
        });

        this.tweens.add({
          targets: dropZone.targetImg,
          scaleX: newScale * 1.2,
          scaleY: newScale * 1.2,
          duration: 200,
          yoyo: true,
        });

        this.matchedCount++;

        if (this.matchedCount === 3) {
          this.successText.setVisible(true);

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

          // După 2 secunde ascundem textul, curățăm artificiile și trecem la următoarea rundă
          this.time.delayedCall(2000, () => {
            this.successText.setVisible(false);
            particles.destroy();
            this.startNextRound();
          });
        }
      } else {
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

    // Curățăm formele din runda anterioară
    this.leftItems.forEach((item) => item.destroy());
    this.rightZones.forEach((zone) => {
      zone.targetImg.destroy();
      zone.destroy();
    });

    this.leftItems = [];
    this.rightZones = [];
    this.animatedSprites = [];
    this.matchedCount = 0; // Resetăm contorul de potriviri din runda curentă

    const leftX = w * 0.25;
    const rightX = w * 0.75;
    this.targetSize = w < 600 ? 110 : 200; // Memorăm targetSize la nivel de instanță

    // Extragem 3 forme aleatorii noi din lista de bază
    const shuffledShapes = Phaser.Utils.Array.Shuffle([...this.baseShapes]);
    const roundShapes = [
      shuffledShapes[0],
      shuffledShapes[1],
      shuffledShapes[2],
    ];

    // Poziții amestecate pentru elementele din dreapta
    const leftPositionsY = [h * 0.3, h * 0.55, h * 0.8];
    const rightPositionsY = [...leftPositionsY];
    Phaser.Utils.Array.Shuffle(rightPositionsY);

    // 1. Creăm formele contur din dreapta
    for (let i = 0; i < 3; i++) {
      let shapeName = roundShapes[i];

      let targetImg = this.add.image(
        rightX,
        rightPositionsY[i],
        `${shapeName}-contur`,
      );
      targetImg.setScale(
        this.targetSize / Math.max(targetImg.width, targetImg.height),
      );

      let dropZone = this.add
        .zone(
          rightX,
          rightPositionsY[i],
          targetImg.displayWidth,
          targetImg.displayHeight,
        )
        .setRectangleDropZone(targetImg.displayWidth, targetImg.displayHeight);

      dropZone.matchShape = shapeName;
      dropZone.targetImg = targetImg;
      this.rightZones.push(dropZone);
    }

    // 2. Creăm formele pline (trăgabile) din stânga
    for (let i = 0; i < 3; i++) {
      let shapeName = roundShapes[i];
      let draggableItem = this.add.image(
        leftX,
        leftPositionsY[i],
        `${shapeName}-plin`,
      );
      draggableItem.setScale(
        this.targetSize / Math.max(draggableItem.width, draggableItem.height),
      );
      draggableItem.setInteractive();

      this.input.setDraggable(draggableItem);

      draggableItem.matchShape = shapeName;
      draggableItem.originalX = draggableItem.x;
      draggableItem.originalY = draggableItem.y;
      draggableItem.setDepth(1);
      this.leftItems.push(draggableItem);
    }
  }
}
