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

    this.matchedCount = 0;
    this.animatedSprites = [];

    const leftX = w * 0.25;
    const rightX = w * 0.75;

    const shuffledShapes = Phaser.Utils.Array.Shuffle([...this.baseShapes]);
    const roundShapes = [
      shuffledShapes[0],
      shuffledShapes[1],
      shuffledShapes[2],
    ];

    const targetSize = w < 600 ? 110 : 200;

    const leftPositionsY = [h * 0.3, h * 0.55, h * 0.8];
    const rightPositionsY = [...leftPositionsY];
    Phaser.Utils.Array.Shuffle(rightPositionsY);

    for (let i = 0; i < 3; i++) {
      let shapeName = roundShapes[i];

      let targetImg = this.add.image(
        rightX,
        rightPositionsY[i],
        `${shapeName}-contur`,
      );
      targetImg.setScale(
        targetSize / Math.max(targetImg.width, targetImg.height),
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
    }

    for (let i = 0; i < 3; i++) {
      let shapeName = roundShapes[i];
      let draggableItem = this.add.image(
        leftX,
        leftPositionsY[i],
        `${shapeName}-plin`,
      );
      draggableItem.setScale(
        targetSize / Math.max(draggableItem.width, draggableItem.height),
      );
      draggableItem.setInteractive();

      this.input.setDraggable(draggableItem);

      draggableItem.matchShape = shapeName;
      draggableItem.originalX = draggableItem.x;
      draggableItem.originalY = draggableItem.y;
      draggableItem.setDepth(1);
    }

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
      if (gameObject.matchShape === dropZone.matchShape) {
        this.sound.play("yaay");

        gameObject.destroy();

        dropZone.targetImg.setTexture(`${gameObject.matchShape}-1`);

        this.animatedSprites.push({
          sprite: dropZone.targetImg,
          baseShape: gameObject.matchShape,
        });

        this.tweens.add({
          targets: dropZone.targetImg,
          scaleX: dropZone.targetImg.scaleX * 1.2,
          scaleY: dropZone.targetImg.scaleY * 1.2,
          duration: 200,
          yoyo: true,
        });

        this.matchedCount++;

        if (this.matchedCount === 3) {
          this.add
            .dom(w / 2, h / 2, "div", "", "FELICITĂRI! AI CÂȘTIGAT!")
            .setClassName("success-text")
            .setOrigin(0.5);

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
        }
      } else {
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
}
