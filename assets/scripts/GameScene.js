class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    this.load.image('bg', 'assets/sprites/background.png');
    this.load.image('card', 'assets/sprites/card.png');
    this.load.image('card1', 'assets/sprites/card1.png');
    this.load.image('card2', 'assets/sprites/card2.png');
    this.load.image('card3', 'assets/sprites/card3.png');
    this.load.image('card4', 'assets/sprites/card4.png');
    this.load.image('card5', 'assets/sprites/card5.png');

    this.load.audio('card', 'assets/sounds/card.mp3');
    this.load.audio('complete', 'assets/sounds/complete.mp3');
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('theme', 'assets/sounds/theme.mp3');
    this.load.audio('timeout', 'assets/sounds/timeout.mp3');
  }

  createLevelText() {
    this.levelText = this.add.text(10, 230, '', {
      font: '36px CurseCasual',
      fill: '#fff'
    });
  }

  updateLevel() {
    if (this.isWin && this.level < Object.keys(config.levels).length) {
      ++this.level;
    }
    this.levelText.setText('Level: ' + this.level);
  }

  createPointsText() {
    this.pointsText = this.add.text(1050, 670, 'Points: 0', {
      font: '36px CurseCasual',
      fill: '#fff'
    });
  }

  updatePoints(combo) {
    switch (combo) {
      case 0:
        break;
      case 1:
        this.points += 100;
        break;
      case 2:
        this.points += 250;
        break;
      case 3:
        this.points += 500;
        break;
      case 4:
        this.points += 1000;
        break;
      default:
        this.points += 5000;
        break;
    }
    this.pointsText.setText('Points: ' + this.points);
  }

  createTimerText() {
    this.timeoutText = this.add.text(10, 330, '', {
      font: '36px CurseCasual',
      fill: '#fff'
    });
  }

  onTimerTick() {
    this.timeoutText.setText('Time: ' + this.timeout);

    if (this.timeout <= 0) {
      this.timer.paused = true;
      this.sounds.timeout.play({
        volume: 0.1
      });
      this.combo = 0;
      this.restart();
    } else {
      --this.timeout;
    }
  }

  createTimer() {
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true
    });
  }

  createSounds() {
    this.sounds = {
      card: this.sound.add('card'),
      complete: this.sound.add('complete'),
      success: this.sound.add('success'),
      theme: this.sound.add('theme'),
      timeout: this.sound.add('timeout')
    };

    this.sounds.theme.play({
      volume: 0.05
    });
  }

  create() {
    this.level = 1;
    this.points = 0;
    this.combo = 0;
    this.timeout = config.levels[this.level].timeOut;
    this.createSounds();
    this.createTimer();
    this.createBackground();
    this.createLevelText();
    this.createPointsText();
    this.createTimerText();
    this.start();
  }

  restart() {
    if (!this.isStarted) {
      return;
    }

    this.isStarted = false;

    let count = 0;
    const onCardMoveComplete = () => {
      ++count;
      if (count >= this.cards.length) {
        this.start();
      }
    };

    this.cards.forEach(card => {
      card.move({
        x: this.sys.game.config.width + card.width,
        y: this.sys.game.config.height + card.height,
        delay: card.position.delay,
        callback: onCardMoveComplete
      });
    })
  }

  start() {
    this.updateLevel();
    this.createCards();
    this.initCardsPosition();
    this.timeout = config.levels[this.level].timeOut;
    this.openedCard = null;
    this.openedCardsCount = 0;
    this.timer.paused = false;
    this.initCards();
    this.showCards();
    this.isStarted = true;
  }

  initCards() {
    let positions = Phaser.Utils.Array.Shuffle(this.positions);

    this.cards.forEach(card => {
      card.init(positions.pop());
    })
  }

  showCards() {
    this.cards.forEach(card => {
      card.depth = card.position.delay;
      card.move({
        x: card.position.x,
        y: card.position.y,
        delay: card.position.delay
      });
    });
  }

  createBackground() {
    this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
  }

  createCards() {
    this.cards = [];

    for (let value of config.levels[this.level].cards) {
      for (let i = 0; i < 2; i++) {
        this.cards.push(new Card(this, value));
      }
    }

    this.input.on('gameobjectdown', this.onCardClicked, this);
  }

  onCardClicked(pointer, card) {
    if (card.opened) {
      return false;
    }

    this.isWin = false;

    this.sounds.card.play({
      volume: 0.1
    });

    if (this.openedCard) {
      // уже есть открытая карта
      if (this.openedCard.value === card.value) {
        // картинки равны - запомнить
        this.sounds.success.play({
          volume: 0.1
        });
        this.openedCard = null;
        ++this.openedCardsCount;
        ++this.combo;
        this.updatePoints(this.combo);
      } else {
        // картинки разные - скрыть прошлую
        this.openedCard.close();
        this.openedCard = card;
        this.combo = 0;
      }
    } else {
      // ещё нет открытой карты
      this.openedCard = card;
    }

    card.open(() => {
      if (this.openedCardsCount === this.cards.length / 2) {
        this.sounds.complete.play({
          volume: 0.1
        });
        this.isWin = true;
        this.restart();
      }
    });
  }

  initCardsPosition() {
    const positions = [];
    const cardTexture = this.textures.get('card').getSourceImage();
    const cardWidth = cardTexture.width + 4;
    const cardHeight = cardTexture.height + 4;
    const offsetX = (this.sys.game.config.width - cardWidth * config.levels[this.level].cols) / 2 + cardWidth / 2;
    const offsetY = (this.sys.game.config.height - cardHeight * config.levels[this.level].rows) / 2 + cardHeight / 2;
    let id = 0;

    for (let row = 0; row < config.levels[this.level].rows; row++) {
      for (let col = 0; col < config.levels[this.level].cols; col++) {
        ++id;
        positions.push({
          x: offsetX + col * cardWidth,
          y: offsetY + row * cardHeight,
          delay: id * 100
        });
      }
    }

    this.positions = positions;
  }
}
