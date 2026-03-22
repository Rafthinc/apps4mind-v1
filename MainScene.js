export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    // Butonul de Home (Acasă)
    const homeButton = this.add
      .text(20, 20, "Acasă", {
        fontSize: "24px",
        fill: "#ffffff",
        backgroundColor: "#F4A261", // Culoare caldă, prietenoasă
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    homeButton.on("pointerover", () =>
      homeButton.setStyle({ fill: "#264653" }),
    );
    homeButton.on("pointerout", () => homeButton.setStyle({ fill: "#ffffff" }));
    homeButton.on("pointerdown", () => {
      this.scene.start("StartScene");
    });

    this.matchedCount = 0; // Contorizăm câte imagini au fost potrivite

    // Culorile perechilor (blânde, prietenoase pentru copii cu ADHD - fără neon)
    // Roșu stins (Teracotă), Verde stins (Teal), Albastru stins, Galben stins
    const colors = [0xe76f51, 0x2a9d8f, 0x457b9d, 0xe9c46a];

    // Pozițiile Y pentru cele 4 rânduri
    const leftPositionsY = [100, 250, 400, 550];
    const rightPositionsY = [100, 250, 400, 550];

    // Amestecăm pozițiile din dreapta pentru ca jocul să nu fie rezolvat implicit
    Phaser.Utils.Array.Shuffle(rightPositionsY);

    // Creăm zonele destinație pe partea dreaptă
    for (let i = 0; i < 4; i++) {
      // Desenăm un contur vizual pentru zona de plasare
      let dropZoneBox;
      switch (i) {
        case 0: // Triunghi
          dropZoneBox = this.add.triangle(
            600,
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
          dropZoneBox = this.add.rectangle(600, rightPositionsY[i], 100, 100);
          break;
        case 2: // Cerc
          dropZoneBox = this.add.circle(600, rightPositionsY[i], 50);
          break;
        case 3: // Romb (pătrat rotit la 45 de grade)
          dropZoneBox = this.add
            .rectangle(600, rightPositionsY[i], 70, 70)
            .setAngle(45);
          break;
      }
      dropZoneBox.setStrokeStyle(4, colors[i]); // Contur de aceeași culoare pentru ajutor vizual

      // Creăm zona interactivă (drop zone) invizibilă
      let dropZone = this.add
        .zone(600, rightPositionsY[i], 100, 100)
        .setRectangleDropZone(100, 100);
      dropZone.matchId = i; // ID-ul perechii
    }

    // Creăm obiectele care pot fi trase (pe partea stângă)
    for (let i = 0; i < 4; i++) {
      let draggableItem;
      switch (i) {
        case 0: // Triunghi
          draggableItem = this.add.triangle(
            200,
            leftPositionsY[i],
            0,
            100,
            50,
            0,
            100,
            100,
            colors[i],
          );
          break;
        case 1: // Pătrat
          draggableItem = this.add.rectangle(
            200,
            leftPositionsY[i],
            100,
            100,
            colors[i],
          );
          break;
        case 2: // Cerc
          draggableItem = this.add.circle(
            200,
            leftPositionsY[i],
            50,
            colors[i],
          );
          break;
        case 3: // Romb
          draggableItem = this.add
            .rectangle(200, leftPositionsY[i], 70, 70, colors[i])
            .setAngle(45);
          break;
      }

      draggableItem.setInteractive();

      // Permitem obiectului să fie mutat (drag & drop)
      this.input.setDraggable(draggableItem);

      // Memorăm id-ul de potrivire și poziția de start pentru a-l întoarce dacă e greșit
      draggableItem.matchId = i;
      draggableItem.originalX = draggableItem.x;
      draggableItem.originalY = draggableItem.y;

      // Adăugăm un mic indicator vizual pentru a ști de el (se ridică în față când tragem)
      draggableItem.setDepth(1);
    }

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
            .text(400, 300, "FELICITĂRI! AI CÂȘTIGAT!", {
              fontSize: "40px",
              fill: "#ffffff",
              backgroundColor: "#2A9D8F", // Fundal verde calm
            })
            .setOrigin(0.5)
            .setDepth(10);
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
