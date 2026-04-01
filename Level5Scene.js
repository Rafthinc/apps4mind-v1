export default class Level5Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level5Scene" });
  }

  preload() {
    // Animalele și stările lor
    this.categories = ["catel", "pisica", "elefant", "leu"];
    const states = ["sta", "clipeste", "fericit", "umbra"];

    // Încărcăm automat toate cele 16 imagini necesare (ex: catel-sta.png)
    this.categories.forEach((cat) => {
      states.forEach((state) => {
        this.load.image(`${cat}-${state}`, `assets/umbre/${cat}-${state}.webp`);
      });
    });

    this.load.image("stea-goala", "assets/imagini/stea-goala.png");
    this.load.image("stea-plina", "assets/imagini/stea-plina.png");
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

    // Amestecăm ordinea animalelor pentru a juca categorii diferite de fiecare dată
    this.remainingCategories = Phaser.Utils.Array.Shuffle([...this.categories]);

    // Stocăm elementele de pe ecran
    this.shadowImages = [];
    this.dropZones = [];
    this.centerAnimal = null;
    this.blinkTimer = null; // Timer pentru clipire

    this.score = 0;
    this.totalRounds = this.categories.length;
    this.stars = [];
    const starSpacing = w < 600 ? 40 : 60;
    const starStartX = w / 2 - ((this.totalRounds - 1) * starSpacing) / 2;

    // Generăm stelele de progres
    for (let i = 0; i < this.totalRounds; i++) {
      let star = this.add.image(
        starStartX + i * starSpacing,
        h * 0.1,
        "stea-goala",
      );
      star.setDisplaySize(starSpacing * 0.8, starSpacing * 0.8);
      this.stars.push(star);
    }

    // Text de succes
    this.successText = this.add
      .dom(w / 2, h / 2, "div", "", "POTRIVIRE CORECTĂ!")
      .setClassName("success-text")
      .setOrigin(0.5)
      .setDepth(100)
      .setVisible(false);

    // --- Logica de Drag & Drop ---
    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setDepth(10);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      // Verificăm dacă umbra corespunde cu animalul tras
      if (gameObject.matchCategory === dropZone.matchCategory) {
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.input.enabled = false; // Nu mai poate fi mișcat

        // Schimbăm imaginea cu varianta FERICITĂ!
        gameObject.setTexture(`${gameObject.matchCategory}-fericit`);

        // Oprim efectul de clipire pentru că animalul a ajuns acasă
        if (this.blinkTimer) this.blinkTimer.remove();

        // Animație: animalul sare de 3 ori și face flip stânga-dreapta
        this.tweens.add({
          targets: gameObject,
          y: gameObject.y - 80, // Sare în sus 80 de pixeli
          duration: 250, // Durata urcării (250ms sus, 250ms jos)
          yoyo: true, // Revine la poziția inițială
          repeat: 2, // Se repetă de încă 2 ori (3 sărituri în total)
          ease: "Quad.easeOut", // Efect de încetinire la apogeu (arată mai natural)
          onYoyo: () => {
            gameObject.toggleFlipX(); // Se întoarce stânga-dreapta la capătul săriturii
          },
          onComplete: () => {
            gameObject.setFlipX(false); // Resetăm orientarea la final pentru a fi sigur orientat corect
          },
        });

        // Actualizăm stelele
        if (this.score < this.totalRounds) {
          let currentStar = this.stars[this.score];
          currentStar.setTexture("stea-plina");
          this.tweens.add({
            targets: currentStar,
            scaleX: currentStar.scaleX * 1.5,
            scaleY: currentStar.scaleY * 1.5,
            duration: 300,
            yoyo: true,
            ease: "Back.easeOut",
          });
          this.score++;
        }

        this.successText.setVisible(true);

        // Așteptăm finalizarea animațiilor înainte de a trece la runda următoare
        this.time.delayedCall(2000, () => {
          this.successText.setVisible(false);
          this.startNextRound();
        });
      } else {
        // Potrivire greșită, îl trimitem înapoi în mijloc
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

    // Curățăm elementele anterioare
    this.shadowImages.forEach((img) => img.destroy());
    this.dropZones.forEach((zone) => zone.destroy());
    if (this.centerAnimal) this.centerAnimal.destroy();
    if (this.blinkTimer) this.blinkTimer.remove();

    this.shadowImages = [];
    this.dropZones = [];

    if (this.remainingCategories.length === 0) {
      this.add
        .dom(w / 2, h / 2, "div", "", "FELICITĂRI! AI TERMINAT!")
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
      return;
    }

    // 1. Alegem animalul țintă curent
    const targetCategory = this.remainingCategories.pop();

    // 2. Selectăm alte 3 umbre greșite
    const availableDistractors = this.categories.filter(
      (cat) => cat !== targetCategory,
    );
    Phaser.Utils.Array.Shuffle(availableDistractors);
    const distractors = [
      availableDistractors[0],
      availableDistractors[1],
      availableDistractors[2],
    ];

    // 3. Amestecăm ordinea celor 4 umbre
    const roundShadows = [targetCategory, ...distractors];
    Phaser.Utils.Array.Shuffle(roundShadows);

    const targetSize = w < 600 ? 120 : 250;

    // Coordonatele pentru cele 4 colțuri (stânga sus, dreapta sus, stânga jos, dreapta jos)
    const shadowPositions = [
      { x: w * 0.2, y: h * 0.3 },
      { x: w * 0.8, y: h * 0.3 },
      { x: w * 0.2, y: h * 0.8 },
      { x: w * 0.8, y: h * 0.8 },
    ];

    for (let i = 0; i < 4; i++) {
      let category = roundShadows[i];
      let img = this.add.image(
        shadowPositions[i].x,
        shadowPositions[i].y,
        `${category}-umbra`,
      );
      img.setScale(targetSize / Math.max(img.width, img.height));
      this.shadowImages.push(img);

      let zone = this.add
        .zone(
          shadowPositions[i].x,
          shadowPositions[i].y,
          img.displayWidth,
          img.displayHeight,
        )
        .setRectangleDropZone(img.displayWidth, img.displayHeight);
      zone.matchCategory = category; // Pentru a ști ce se potrivește aici
      this.dropZones.push(zone);
    }

    // 4. Creăm elementul interactiv de pe centru
    this.centerAnimal = this.add.image(w / 2, h / 2, `${targetCategory}-sta`);
    this.centerAnimal.setScale(
      targetSize / Math.max(this.centerAnimal.width, this.centerAnimal.height),
    );
    this.centerAnimal.setInteractive();
    this.centerAnimal.matchCategory = targetCategory;
    this.centerAnimal.originalX = this.centerAnimal.x;
    this.centerAnimal.originalY = this.centerAnimal.y;
    this.input.setDraggable(this.centerAnimal);

    // 5. Creăm Timer-ul pentru "clipire" (se execută periodic)
    this.blinkTimer = this.time.addEvent({
      delay: 2500, // la fiecare 2.5 secunde
      callback: () => {
        this.centerAnimal.setTexture(`${targetCategory}-clipeste`);
        this.time.delayedCall(200, () => {
          if (this.centerAnimal.input.enabled) {
            // revenim la normal doar dacă încă mai e în joc
            this.centerAnimal.setTexture(`${targetCategory}-sta`);
          }
        });
      },
      loop: true,
    });
  }
}
