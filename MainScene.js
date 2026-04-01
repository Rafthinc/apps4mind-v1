export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    // Încărcăm imaginile pentru formele geometrice animate din stânga
    const shapes = ["triunghi", "patrat", "cerc", "romb"];
    shapes.forEach((shape) => {
      this.load.image(`${shape}-1`, `assets/scena-1/${shape}-1.webp`);
      this.load.image(`${shape}-2`, `assets/scena-1/${shape}-2.webp`);
    });

    // Încărcăm imaginea cu grupul de confetti
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

    this.matchedCount = 0; // Contorizăm câte imagini au fost potrivite

    // Culorile perechilor (blânde, prietenoase pentru copii cu ADHD - fără neon)
    // Roșu stins (Teracotă), Verde stins (Teal), Albastru stins, Galben stins
    const colors = [0xe76f51, 0x2a9d8f, 0x457b9d, 0xe9c46a];

    // Numele de bază ale formelor pentru a corela indicii (0=triunghi, 1=patrat, etc.)
    const shapeNames = ["triunghi", "patrat", "cerc", "romb"];

    const leftX = w * 0.25;
    const rightX = w * 0.75;

    // Pozițiile Y pentru cele 4 rânduri
    const leftPositionsY = [h * 0.2, h * 0.4, h * 0.6, h * 0.8];
    const rightPositionsY = [h * 0.2, h * 0.4, h * 0.6, h * 0.8];

    // Amestecăm pozițiile din dreapta pentru ca jocul să nu fie rezolvat implicit
    Phaser.Utils.Array.Shuffle(rightPositionsY);

    const shapeScale = (w < 600 ? 0.6 : 1) / 3; // Scalăm formele din stânga (cele animate)
    const rightShapeScale = shapeScale * 3; // Mărim cu încă 50% față de dimensiunea anterioară (deci de 3 ori față de cele din stânga)

    // Creăm zonele destinație pe partea dreaptă
    for (let i = 0; i < 4; i++) {
      // Desenăm un contur vizual pentru zona de plasare
      let dropZoneBox;
      switch (i) {
        case 0: // Triunghi
          dropZoneBox = this.add.triangle(
            rightX,
            rightPositionsY[i],
            0,
            100,
            50,
            0,
            100,
            100,
          );
          break;
        case 1: // Pătrat
          dropZoneBox = this.add.rectangle(
            rightX,
            rightPositionsY[i],
            100,
            100,
          );
          break;
        case 2: // Cerc
          dropZoneBox = this.add.circle(rightX, rightPositionsY[i], 50);
          break;
        case 3: // Romb (pătrat rotit la 45 de grade)
          dropZoneBox = this.add
            .rectangle(rightX, rightPositionsY[i], 70, 70)
            .setAngle(45);
          break;
      }
      dropZoneBox.setScale(rightShapeScale);
      dropZoneBox.setStrokeStyle(4, colors[i]); // Contur de aceeași culoare pentru ajutor vizual

      // Creăm zona interactivă (drop zone) invizibilă
      let dropZone = this.add
        .zone(
          rightX,
          rightPositionsY[i],
          100 * rightShapeScale,
          100 * rightShapeScale,
        )
        .setRectangleDropZone(100 * rightShapeScale, 100 * rightShapeScale);
      dropZone.matchId = i; // ID-ul perechii
    }

    this.draggableImages = [];

    // Creăm obiectele care pot fi trase (pe partea stângă)
    for (let i = 0; i < 4; i++) {
      let shapeName = shapeNames[i];

      // Adăugăm imaginea cu primul cadru (-1.webp)
      let draggableItem = this.add.image(
        leftX,
        leftPositionsY[i],
        `${shapeName}-1`,
      );

      draggableItem.setScale(shapeScale);
      draggableItem.setInteractive();

      // Permitem obiectului să fie mutat (drag & drop)
      this.input.setDraggable(draggableItem);

      // Memorăm id-ul de potrivire și poziția de start pentru a-l întoarce dacă e greșit
      draggableItem.matchId = i;
      draggableItem.shapeBaseName = shapeName; // Salvăm numele de bază pentru animație
      draggableItem.originalX = draggableItem.x;
      draggableItem.originalY = draggableItem.y;

      // Adăugăm un mic indicator vizual pentru a ști de el (se ridică în față când tragem)
      draggableItem.setDepth(1);

      this.draggableImages.push(draggableItem);
    }

    // --- Timer pentru simularea mișcării (alternarea imaginilor) ---
    this.time.addEvent({
      delay: 1200, // Schimbăm imaginea la fiecare 1200ms
      callback: () => {
        this.draggableImages.forEach((item) => {
          let currentTexture = item.texture.key;
          // Alternăm constant între cadrul 1 și 2
          let nextTexture = currentTexture.endsWith("-1")
            ? `${item.shapeBaseName}-2`
            : `${item.shapeBaseName}-1`;
          item.setTexture(nextTexture);
        });
      },
      loop: true,
    });

    // --- Logica de Drag & Drop ---

    // Când se începe tragerea, mutăm obiectul deasupra celorlalte
    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setDepth(2);
    });

    // În timpul tragerii, actualizăm coordonatele
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // Când eliberăm deasupra unei zone de "drop"
    this.input.on("drop", (pointer, gameObject, dropZone) => {
      // Verificăm dacă ID-urile se potrivesc
      if (gameObject.matchId === dropZone.matchId) {
        // Potrivire corectă - centrăm imaginea pe zona destinație
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;

        // Dezactivăm interactivitatea (nu mai poate fi mișcat)
        gameObject.input.enabled = false;

        this.matchedCount++;

        // Verificăm dacă jocul s-a terminat
        if (this.matchedCount === 4) {
          this.add
            .dom(w / 2, h / 2, "div", "", "FELICITĂRI! AI CÂȘTIGAT!")
            .setClassName("success-text")
            .setOrigin(0.5);

          // Efect de ploaie de confetti (folosind imaginea nedecupată)
          const particles = this.add.particles("confetti");
          particles.setDepth(10); // Să fie vizibil peste forme
          particles.createEmitter({
            x: { min: 0, max: w }, // Cade aleator pe toată lățimea ecranului
            y: -50, // Pornește puțin mai sus de marginea de sus a ecranului
            speedY: { min: 100, max: 300 }, // Viteza de cădere în jos
            speedX: { min: -50, max: 50 }, // Ușor balans la stânga și la dreapta
            gravityY: 100, // Gravitație pentru a accelera căderea
            scale: { start: 0.5, end: 0.1 }, // Se micșorează ușor pe măsură ce cad
            rotate: { start: 0, end: 360 }, // Rotește întreaga imagine fluid în timp
            lifespan: 5000, // Cât timp trăiește pe ecran (5 secunde)
            frequency: 200, // Emite o nouă "ploaie/grup" la fiecare 200ms
          });
        }
      } else {
        // Potrivire greșită - îl trimitem înapoi de unde a plecat
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });

    // Dacă eliberăm obiectul în afara oricărei zone valide
    this.input.on("dragend", (pointer, gameObject, dropped) => {
      gameObject.setDepth(1); // Resetăm profunzimea
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });
  }
}
