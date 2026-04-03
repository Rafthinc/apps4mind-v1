export default class Level8Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level8Scene" });
  }

  preload() {
    // Generăm dinamic o textură rotundă, albă, pe care o vom colora (tint) pentru bile
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(30, 30, 30);
    graphics.generateTexture("ball-texture", 60, 60);
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Setăm marginile lumii fizice (lăsăm deschis în sus ca să poată cădea bilele din afara ecranului)
    this.physics.world.setBounds(0, 0, w, h);
    this.physics.world.setBoundsCollision(true, true, false, true); // stânga, dreapta, sus, jos

    this.score = 0;
    this.isGameOver = false;
    this.alertTimer = 0;
    this.alertLineY = h * 0.25; // Linia de alertă la sfertul de sus al ecranului

    // Linia vizuală de alertă
    this.alertLine = this.add
      .rectangle(w / 2, this.alertLineY, w, 4, 0xff0000)
      .setAlpha(0.3)
      .setDepth(10);

    this.balls = []; // Array pentru a ține referințe către obiectele bilă (sprite, text, valoare)

    // Grupul fizic pentru bile
    this.ballGroup = this.physics.add.group({
      bounceX: 0.4,
      bounceY: 0.4,
      collideWorldBounds: true,
    });
    this.physics.add.collider(this.ballGroup, this.ballGroup); // Bilele se ciocnesc între ele

    // Interfața Text
    this.scoreText = this.add
      .text(w / 2, 20, "Scor: 0", {
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
        fontSize: "28px",
        color: "#264653",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(20);

    // Container pentru butoanele cu opțiuni multiple
    this.choicesContainer = this.add.container(w / 2, h * 0.85).setDepth(30);

    // Spawner - Creăm o bilă nouă la fiecare 2 secunde
    this.spawnTimer = this.time.addEvent({
      delay: 2000,
      callback: () => this.spawnBall(),
      callbackScope: this,
      loop: true,
    });

    // Butonul de Home (Acasă)
    const homeButton = this.add
      .dom(70, 40, "button", "", "Acasă")
      .setClassName("home-button")
      .setDepth(100);
    homeButton.addListener("click");
    homeButton.on("click", () => {
      this.scene.start("StartScene");
    });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    let isDanger = false;

    // Sincronizăm textul numerelor cu sprite-urile bilelor
    for (let i = this.balls.length - 1; i >= 0; i--) {
      let b = this.balls[i];

      // Dacă bila a fost distrusă, curățăm și textul aferent
      if (!b.sprite.active) {
        b.text.destroy();
        this.balls.splice(i, 1);
        continue;
      }

      b.text.x = b.sprite.x;
      b.text.y = b.sprite.y;

      // Verificăm dacă bila se află peste linia de alertă și este aproape staționară (se acumulează)
      if (
        b.sprite.y < this.alertLineY &&
        Math.abs(b.sprite.body.velocity.y) < 10
      ) {
        isDanger = true;
      }
    }

    // Logica pentru Game Over
    if (isDanger) {
      this.alertLine.setAlpha(1); // Facem linia complet vizibilă
      this.alertTimer += delta;
      if (this.alertTimer > 3000) {
        this.triggerGameOver();
      }
    } else {
      this.alertLine.setAlpha(0.3);
      this.alertTimer = 0;
    }
  }

  spawnBall(spawnX, spawnY, fixedValue) {
    const w = this.scale.width;
    const value = fixedValue || Phaser.Math.Between(1, 9);
    const x = spawnX || Phaser.Math.Between(40, w - 40);
    const y = spawnY || -40; // Se spawnează ușor deasupra ecranului

    const colors = [
      0xff9999, 0x99ff99, 0x9999ff, 0xffff99, 0xff99ff, 0x99ffff, 0xffb366,
    ];
    const color = Phaser.Utils.Array.GetRandom(colors);

    let sprite = this.ballGroup.create(x, y, "ball-texture");
    sprite.setCircle(30);
    sprite.setTint(color);
    sprite.setInteractive({ useHandCursor: true });

    // Oferim un impuls la start pentru varietate
    sprite.setVelocityX(Phaser.Math.Between(-30, 30));

    let text = this.add
      .text(x, y, value.toString(), {
        fontSize: "28px",
        color: "#000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    let ballObj = {
      sprite,
      text,
      value,
      selected: false,
      originalColor: color,
    };
    this.balls.push(ballObj);

    // Logica de selecție
    sprite.on("pointerdown", () => this.toggleSelection(ballObj));
  }

  toggleSelection(ballObj) {
    if (this.isGameOver) return;

    ballObj.selected = !ballObj.selected;

    if (ballObj.selected) {
      ballObj.sprite.setTint(0x000000);
      ballObj.text.setColor("#ffffff");
      ballObj.sprite.setScale(1.1); // Efect de vizualizare ("glow" / pop)
    } else {
      ballObj.sprite.setTint(ballObj.originalColor);
      ballObj.text.setColor("#000000");
      ballObj.sprite.setScale(1);
    }

    this.updateChoices();
  }

  updateChoices() {
    const h = this.scale.height;
    this.choicesContainer.removeAll(true); // Ștergem opțiunile vechi

    let selectedBalls = this.balls.filter((b) => b.selected);

    // Afișăm opțiuni doar dacă sunt selectate minim 2 bile
    if (selectedBalls.length < 2) return;

    // Mutăm containerul cu opțiuni sus sau jos în funcție de unde sunt bilele selectate
    let lowestBallY = Math.max(...selectedBalls.map((b) => b.sprite.y));
    if (lowestBallY > h * 0.6) {
      this.choicesContainer.y = h * 0.15; // Mutăm sus dacă bilele sunt în partea de jos
    } else {
      this.choicesContainer.y = h * 0.85; // Lăsăm jos dacă bilele sunt sus
    }

    let currentSum = selectedBalls.reduce((acc, b) => acc + b.value, 0);

    // Progresie în funcție de scor (începem cu 2 opțiuni, creștem la 3 și 4)
    let numChoices = 2;
    if (this.score >= 50) numChoices = 3; // După 5 răspunsuri corecte
    if (this.score >= 100) numChoices = 4; // După 10 răspunsuri corecte

    let options = [currentSum];

    // Generăm distractori unici
    const offsets = [-1, 1, -2, 2, -10, 10];
    while (options.length < numChoices) {
      let offset = Phaser.Utils.Array.GetRandom(offsets);
      let opt = currentSum + offset;
      if (opt > 0 && !options.includes(opt)) {
        options.push(opt);
      }
    }

    Phaser.Utils.Array.Shuffle(options);

    // Desenăm butoanele
    const btnWidth = 80;
    const spacing = 20;
    const totalWidth = numChoices * btnWidth + (numChoices - 1) * spacing;
    let startX = -totalWidth / 2 + btnWidth / 2;

    options.forEach((opt, idx) => {
      let x = startX + idx * (btnWidth + spacing);

      let bg = this.add
        .rectangle(x, 0, btnWidth, 60, 0x457b9d)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });

      let txt = this.add
        .text(x, 0, opt.toString(), {
          fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
          fontSize: "26px",
          color: "#fff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      bg.on("pointerdown", () =>
        this.handleAnswer(opt, currentSum, selectedBalls),
      );
      bg.on("pointerover", () => bg.setFillStyle(0xe76f51));
      bg.on("pointerout", () => bg.setFillStyle(0x457b9d));

      this.choicesContainer.add([bg, txt]);
    });
  }

  handleAnswer(chosenValue, correctSum, selectedBalls) {
    if (chosenValue === correctSum) {
      // Răspuns Corect
      this.score += 10;
      this.scoreText.setText(`Scor: ${this.score}`);

      selectedBalls.forEach((b) => {
        b.selected = false;
        b.sprite.disableBody(true, false); // Opriți fizica pentru a evita coliziuni în timpul animației
        this.tweens.add({
          targets: [b.sprite, b.text],
          scaleX: 0,
          scaleY: 0,
          duration: 300,
          onComplete: () => {
            b.sprite.destroy();
          }, // Va fi șters din array în ciclul update()
        });
      });
    } else {
      // Răspuns Greșit: Penalizare (Clonare)
      selectedBalls.forEach((b) => {
        b.selected = false;
        b.sprite.setTint(b.originalColor);
        b.text.setColor("#000000");
        b.sprite.setScale(1);
        // Spawnăm o copie aproape în aceeași locație (ușor defazată)
        this.spawnBall(
          b.sprite.x + Phaser.Math.Between(-15, 15),
          b.sprite.y - 50,
          b.value,
        );
      });
      this.cameras.main.shake(200, 0.01); // Efect de cutremur pe cameră la răspuns greșit
    }

    this.updateChoices(); // Ascunde meniul deoarece selecțiile s-au anulat
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.spawnTimer.remove();
    this.physics.pause();

    const w = this.scale.width;
    const h = this.scale.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.8).setDepth(200);

    this.add
      .dom(w / 2, h / 2 - 60, "div", "", "JOC TERMINAT!")
      .setClassName("success-text") // Refolosim stilul din CSS pentru textul mare
      .setOrigin(0.5)
      .setDepth(200);

    const retryBtn = this.add
      .dom(w / 2, h / 2 + 80, "button", "", "Încearcă din nou")
      .setClassName("game-button")
      .setOrigin(0.5)
      .setDepth(200);

    retryBtn.addListener("click");
    retryBtn.on("click", () => {
      this.scene.restart();
    });
  }
}
