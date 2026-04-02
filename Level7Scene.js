export default class Level7Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level7Scene" });
  }

  preload() {
    // Încărcăm imaginile peisajului
    this.load.image("background", "assets/scena-7/background.webp");
    this.load.image("casa-patrat", "assets/scena-7/casa-patrat.webp");
    this.load.image(
      "acoperis-triunghi",
      "assets/scena-7/acoperis-triunghi.webp",
    );
    this.load.image("copac-cerc", "assets/scena-7/copac-cerc.webp");
    this.load.image("copac-triunghi", "assets/scena-7/copac-triunghi.webp");
    this.load.image("soare-cerc", "assets/scena-7/soare-cerc.webp");
    this.load.image("zmeu-romb", "assets/scena-7/zmeu-romb.webp");

    // Sunetele și efectele
    this.load.audio("fail", "assets/scena-1/fail.wav");
    this.load.audio("yaay", "assets/scena-1/yaay.mp3");
    this.load.image("confetti", "assets/imagini/confetti.png");
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.matchedCount = 0;
    this.totalTargets = 6;

    // 1. Fundalul scenei
    this.add
      .image(w / 2, h / 2, "background")
      .setDisplaySize(w, h)
      .setDepth(0);

    // 2. Overlay negru pentru a întuneca scena la apusul soarelui (inițial invizibil, alpha 0)
    this.darkOverlay = this.add
      .rectangle(w / 2, h / 2, w, h, 0x000010, 0)
      .setDepth(2);

    // Butonul de Home (Acasă)
    const homeButton = this.add
      .dom(70, 40, "button", "", "Acasă")
      .setClassName("home-button")
      .setDepth(20);
    homeButton.addListener("click");
    homeButton.on("click", () => {
      this.scene.start("StartScene");
    });

    // Text de final
    this.successText = this.add
      .dom(w / 2, h / 2, "div", "", "FELICITĂRI! PEISAJUL ESTE GATA!")
      .setClassName("success-text")
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);

    // --- 3. Construim elementele peisajului ---
    this.targets = [];

    // Setăm scalarea elementelor pe baza dimensiunii ecranului
    const baseScale = w < 600 ? w * 0.25 : w * 0.2;

    // Casa (Pătrat) - Poziționată în stânga-jos
    let casa = this.add.image(w * 0.25, h * 0.7, "casa-patrat").setDepth(1);
    casa.setScale(baseScale / casa.width);
    this.createTargetZone(casa, "patrat", "casa");

    // Acoperișul (Triunghi) - Așezat perfect deasupra casei
    let acoperis = this.add.image(w * 0.25, 0, "acoperis-triunghi").setDepth(1);
    acoperis.setScale((baseScale * 1.1) / acoperis.width); // Puțin mai lat decât casa
    acoperis.y =
      casa.y - casa.displayHeight / 2 - acoperis.displayHeight / 2 + 5; // Suprapunere ușoară 5px
    this.createTargetZone(acoperis, "triunghi", "acoperis");

    // Copac Rotund (Cerc) - Poziționat în centru-dreapta
    let copacCerc = this.add
      .image(w * 0.55, h * 0.65, "copac-cerc")
      .setDepth(1);
    copacCerc.setScale((baseScale * 0.8) / copacCerc.width);
    this.createTargetZone(copacCerc, "cerc", "copac-cerc");

    // Copac Brad (Triunghi) - Poziționat în extremitatea dreaptă
    let copacTriunghi = this.add
      .image(w * 0.8, h * 0.6, "copac-triunghi")
      .setDepth(1);
    copacTriunghi.setScale((baseScale * 0.8) / copacTriunghi.width);
    this.createTargetZone(copacTriunghi, "triunghi", "copac-triunghi");

    // Soare (Cerc) - Poziționat sus-stânga
    let soare = this.add.image(w * 0.15, h * 0.18, "soare-cerc").setDepth(1);
    soare.setScale((baseScale * 0.6) / soare.width);
    this.createTargetZone(soare, "cerc", "soare");

    // Zmeu (Romb) - Poziționat sus-dreapta
    let zmeu = this.add.image(w * 0.85, h * 0.25, "zmeu-romb").setDepth(1);
    zmeu.setScale((baseScale * 0.5) / zmeu.width);
    this.createTargetZone(zmeu, "romb", "zmeu");

    // --- 4. Desenăm formele geometrice din partea de jos ---
    const shapeSize = w < 600 ? 50 : 80;
    const shapeY = h * 0.9;
    const spacingX = w * 0.2;

    // Cerc
    let draggables = [];

    let cercShape = this.add
      .circle(w * 0.2, shapeY, shapeSize / 2, 0xffffff)
      .setDepth(10);
    cercShape.matchShape = "cerc";
    draggables.push(cercShape);

    // Triunghi
    let triunghiShape = this.add
      .triangle(
        w * 0.4,
        shapeY,
        0,
        shapeSize,
        shapeSize / 2,
        0,
        shapeSize,
        shapeSize,
        0xffffff,
      )
      .setDepth(10);
    triunghiShape.matchShape = "triunghi";
    draggables.push(triunghiShape);

    // Pătrat
    let patratShape = this.add
      .rectangle(w * 0.6, shapeY, shapeSize, shapeSize, 0xffffff)
      .setDepth(10);
    patratShape.matchShape = "patrat";
    draggables.push(patratShape);

    // Romb (un pătrat rotit la 45 de grade)
    let rombShape = this.add
      .rectangle(w * 0.8, shapeY, shapeSize * 0.75, shapeSize * 0.75, 0xffffff)
      .setAngle(45)
      .setDepth(10);
    rombShape.matchShape = "romb";
    draggables.push(rombShape);

    // Setăm interactivitatea, animarea și logica pentru toate formele
    draggables.forEach((shape) => {
      shape.setInteractive({ cursor: "pointer" });
      this.input.setDraggable(shape);

      shape.originalX = shape.x;
      shape.originalY = shape.y;

      // Efect vizual permanent de "pulsație" pentru a sugera că trebuie folosite
      this.tweens.add({
        targets: shape,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    // --- 5. Logica de Drag & Drop ---
    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setDepth(15);
      gameObject.setAlpha(0.8);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      // Verificăm dacă forma trasă corespunde cu necesitatea imaginii (ex: cerc pe soare)
      if (
        gameObject.matchShape === dropZone.matchShape &&
        !dropZone.isResolved
      ) {
        dropZone.isResolved = true;
        this.sound.play("yaay");

        // Indiferent dacă e corect, trimitem forma înapoi la bază pentru a putea fi refolosită
        // (deoarece avem mai mulți copaci, mai multe cercuri etc.)
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
        gameObject.setAlpha(1);
        gameObject.setDepth(10);

        // Animația imaginii țintă (se lasă în jos și dispare ușor)
        this.tweens.add({
          targets: dropZone.targetImg,
          y: dropZone.targetImg.y + 150,
          alpha: 0,
          duration: 1500,
          ease: "Power2",
        });

        // Efect Special: Dacă este soarele, întunecăm scena
        if (dropZone.targetType === "soare") {
          this.tweens.add({
            targets: this.darkOverlay,
            alpha: 0.45, // Opacitate vizibilă dar nu totală
            duration: 1500,
          });
        }

        this.matchedCount++;

        // Verificăm condiția de victorie
        if (this.matchedCount === this.totalTargets) {
          this.time.delayedCall(1000, () => {
            this.successText.setVisible(true);

            const particles = this.add.particles("confetti");
            particles.setDepth(30);
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
          });
        }
      } else {
        // Greșeală
        this.sound.play("fail");
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
        gameObject.setAlpha(1);
        gameObject.setDepth(10);
      }
    });

    this.input.on("dragend", (pointer, gameObject, dropped) => {
      // Dacă a fost lăsat aiurea pe ecran, se întoarce la loc
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
        gameObject.setAlpha(1);
        gameObject.setDepth(10);
      }
    });
  }

  // Funcție de ajutor pentru a crea zone de drop rapid și uniform
  createTargetZone(img, expectedShape, type) {
    // Extindem zona de drop cu 30% față de imagine ca să fie mai ușor pentru copii
    let zone = this.add
      .zone(img.x, img.y, img.displayWidth * 1.3, img.displayHeight * 1.3)
      .setRectangleDropZone(img.displayWidth * 1.3, img.displayHeight * 1.3);

    zone.matchShape = expectedShape;
    zone.targetImg = img;
    zone.targetType = type;
    zone.isResolved = false; // Flag pentru a preveni rezolvări duble accidentale

    this.targets.push(zone);
  }
}
