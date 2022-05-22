const config = {
  type: Phaser.AUTO, // webgl or canvas
  width: 1280,
  height: 720,
  rows: 1,
  cols: 4,
  cards: [1, 2],
  levels: {
    1: {
      rows: 1,
      cols: 4,
      cards: [1, 2],
      timeOut: 15
    },
    2: {
      rows: 2,
      cols: 3,
      cards: [1, 2, 3],
      timeOut: 20
    },
    3: {
      rows: 2,
      cols: 4,
      cards: [1, 2, 3, 4],
      timeOut: 25
    },
    4: {
      rows: 2,
      cols: 5,
      cards: [1, 2, 3, 4, 5],
      timeOut: 30
    },
    5: {
      rows: 2,
      cols: 5,
      cards: [1, 2, 3, 4, 5],
      timeOut: 25
    },
    6: {
      rows: 2,
      cols: 5,
      cards: [1, 2, 3, 4, 5],
      timeOut: 20
    },
    7: {
      rows: 2,
      cols: 5,
      cards: [1, 2, 3, 4, 5],
      timeOut: 15
    }
  },
  scene: new GameScene()
};

const game = new Phaser.Game(config);
