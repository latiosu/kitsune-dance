var width = 640;
var height = 360;
var config = {
  'width': width,
  'height': height,
  'renderer': Phaser.AUTO,
  'parent': 'game',
  'resolution': window.devicePixelRatio,
  'state': { preload: preload, create: create, update: update, render: render }
}
var game = new Phaser.Game(config);

var ui = new Map();
var graphics;
var cursors;
var actions;
var score;
var songOffset = 1000;
var currentTime = 0;
var startGame = false;

function preload() {

}

function create() {
  graphics = game.add.graphics(0, 0);

  // Manually created arrow sequence
  actions = new Array(4);
  actions[0] = new Action(0 + songOffset, [0]);
  actions[1] = new Action(2000 + songOffset, [0]);
  actions[2] = new Action(4000 + songOffset, [0]);
  actions[3] = new Action(6000 + songOffset, [0]);

  cursors = game.input.keyboard.addKeys(
    {'up': Phaser.KeyCode.UP,
    'down': Phaser.KeyCode.DOWN,
    'left': Phaser.KeyCode.LEFT,
    'right': Phaser.KeyCode.RIGHT,
    'select': Phaser.KeyCode.SPACEBAR
  });

  var style = { font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle' };
  var loadingText = game.add.text(0, 0, 'Hit space to start', style);
  loadingText.setTextBounds(0, 0, width, height);
  ui.set('loadingText', loadingText);
}

function update() {
  if (!startGame && cursors.select.isDown) {
    // Remove pause text
    ui.get('loadingText').destroy();
    ui.delete('loadingText');

    // Add score text
    score = new Score();
    var style = { font: 'bold 24px Arial', fill: '#fff', boundsAlignH: 'right', boundsAlignV: 'middle' };
    var scoreText = game.add.text(0, 0, score.value, style);
    scoreText.setTextBounds(width-320, 0, 300, 60);
    ui.set('scoreText', scoreText);

    // TODO -- Play music

    startGame = true;
  }

  if (startGame) {
    currentTime += game.time.elapsed;
    // TODO -- Actually play level
  }
}

function render() {
  graphics.clear();
  if (startGame) {
    // Render player position
    graphics.beginFill(0xFFFFFF);
    graphics.drawCircle(width/2, height/2, height/8);
    graphics.endFill();

    // Render falling arrows
    graphics.beginFill(0xF78C11);
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      var pos = (currentTime - a.time)/4;
      if (pos - height/2 > 80 || a.isHit) {
        // Don't render missed arrows
        continue;
      } else if (pos > height/2) {
        // Fade out late arrows
        graphics.fillAlpha = 1 - (pos - height/2) / 80;
      } else {
        // Stay solid until at player
        graphics.fillAlpha = 1.0;
      }
      graphics.drawCircle(width/2, pos, height/8);
    }
    graphics.endFill();
  }
}

function Action(time, arrows) {
  this.time = time;
  this.arrows = arrows;
  this.isHit = false;
}

function Score() {
  this.value = 0;
  this.combo = 0;
  this.maxCombo = 0;
  this.miss = 0;
  this.ok = 0;
  this.great = 0;
  this.perfect = 0;
  this.add = function(type) {
    // Check if missed
    if (type == 'miss') {
      this.combo = 0;
      this.miss += 1;
    } else {
      // Update combo
      this.combo += 1;
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }

      // Resolve accuracy type
      if (type == 'ok') {
        this.ok += 1;
        this.value += 100;
      } else if (type == 'great') {
        this.great += 1;
        this.value += 500;
      } else if (type == 'perfect') {
        this.perfect += 1;
        this.value += 1500;
      }
    }
  };
}
