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
var input;
var actions;
var score;
var judgement;
var songOffset = 3000;
var currentTime = 0;
var state = 'ready-screen';
var actionIndex = 0;

function preload() {

}

function create() {
  graphics = game.add.graphics(0, 0);

  // Manually created arrow sequence
  actions = new Array(7);
  actions[0] = new Action(0 + songOffset, 'up');
  actions[1] = new Action(2000 + songOffset, 'up');
  actions[2] = new Action(4000 + songOffset, 'up');
  actions[3] = new Action(6000 + songOffset, 'up');
  actions[4] = new Action(8000 + songOffset, 'left');
  actions[5] = new Action(10000 + songOffset, 'down');
  actions[6] = new Action(12000 + songOffset, 'right');

  input = game.input.keyboard.addKeys(
    {'up': Phaser.KeyCode.UP,
    'down': Phaser.KeyCode.DOWN,
    'left': Phaser.KeyCode.LEFT,
    'right': Phaser.KeyCode.RIGHT,
    'select': Phaser.KeyCode.SPACEBAR
  });
  // Capture default browser action
  game.input.keyboard.addKeyCapture([
    Phaser.KeyCode.UP,
    Phaser.KeyCode.DOWN,
    Phaser.KeyCode.LEFT,
    Phaser.KeyCode.RIGHT,
    Phaser.KeyCode.SPACEBAR
  ]);

  var style = { font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle' };
  var loadingText = game.add.text(0, 0, 'Hit space to start', style);
  loadingText.setTextBounds(0, 0, width, height);
  ui.set('loadingText', loadingText);
}

function update() {
  if (state == 'ready-screen' && input.select.isDown) {
    // Remove pause text
    ui.get('loadingText').destroy();
    ui.delete('loadingText');

    // Add score text
    score = new Score();
    var style = { font: 'bold 24px Arial', fill: '#fff', boundsAlignH: 'right', boundsAlignV: 'middle' };
    var scoreText = game.add.text(0, 0, score.value, style);
    scoreText.setTextBounds(width - 320, 0, 300, 60);
    ui.set('scoreText', scoreText);

    // Add judgement text
    style = { font: 'bold 24px Arial', fill: '#fff', boundsAlignH: 'middle', boundsAlignV: 'middle' };
    judgement = game.add.text(game.world.centerX - 25, height - 50, "", style);
    judgement.alpha = 0;

    // TODO -- Play music

    state = 'game-screen';
    console.log('Going to game screen');
  } else if (state == 'game-screen') {
    currentTime += game.time.elapsed;
    // TODO -- Actually play level

    // Get upcoming arrow
    var action = actions[actionIndex];
    if (actionIndex >= actions.length) {
      // TODO -- Go to score screen after delay
      state = 'score-screen';
      console.log('Going to score screen');
    } else {
      var diff = action.time - currentTime;
      var absDiff = Math.abs(diff);

      // Timing windows
      if (diff <= -150 - height/8) { // Miss
        actionIndex++;
        action.isHit = true;
        judgement.text = "Miss";
        judgement.alpha = 1;
        game.add.tween(judgement).to({alpha: 0}, 1500, "Linear", true);
        score.add('miss');
      } else if (absDiff < 40 && checkArrowInput(action.arrow)) { // Perfect
        actionIndex++;
        action.isHit = true;
        judgement.text = "Perfect";
        judgement.alpha = 1;
        game.add.tween(judgement).to({alpha: 0}, 1500, "Linear", true);
        score.add('perfect');
      } else if (absDiff < 90 && checkArrowInput(action.arrow)) { // Great
        actionIndex++;
        action.isHit = true;
        judgement.text = "Great";
        judgement.alpha = 1;
        game.add.tween(judgement).to({alpha: 0}, 1500, "Linear", true);
        score.add('great');
      } else if (absDiff < 150 && checkArrowInput(action.arrow)) { // Ok
        actionIndex++;
        action.isHit = true;
        judgement.text = "Ok";
        judgement.alpha = 1;
        game.add.tween(judgement).to({alpha: 0}, 1500, "Linear", true);
        score.add('ok');
      } else {
        // Do nothing
      }
    }
  } else if (state == 'score-screen') {

  }
}

function render() {
  graphics.clear();
  if (state == 'game-screen') {
    // Render player position
    graphics.beginFill(0xFFFFFF);
    graphics.drawCircle(width/2, height/2, height/8);
    graphics.endFill();

    // Render falling arrows
    graphics.beginFill(0xF78C11);
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      var pos = (currentTime - a.time)/4 + 180;
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

function checkArrowInput(arrow) {
  if (arrow == 'up' && input.up.isDown) {
    return true;
  } else if (arrow == 'left' && input.left.isDown) {
    return true;
  } else if (arrow == 'down' && input.down.isDown) {
    return true;
  } else if (arrow == 'right' && input.right.isDown) {
    return true;
  }
  return false;
}

function Action(time, arrow) {
  this.time = time;
  this.arrow = arrow;
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
