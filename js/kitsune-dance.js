var width = 640;
var height = 360;
var config = {
  "width": width,
  "height": height,
  "renderer": Phaser.AUTO,
  "parent": "game",
  "resolution": window.devicePixelRatio,
  "state": { preload: preload, create: create, update: update, render: render }
}
var game = new Phaser.Game(config);

function preload() {

}

var loadingText;
var graphics;
var cursors;
var actions;
var songOffset = 0;
var currentTime = 0;
var startGame = false;

function create() {
  graphics = game.add.graphics(0, 0);

  // Manually created arrow sequence
  actions = new Array(4);
  actions[0] = new Action(0, [0]);
  actions[1] = new Action(2000, [0]);
  actions[2] = new Action(4000, [0]);
  actions[3] = new Action(6000, [0]);

  cursors = game.input.keyboard.addKeys(
    {'up': Phaser.KeyCode.UP,
    'down': Phaser.KeyCode.DOWN,
    'left': Phaser.KeyCode.LEFT,
    'right': Phaser.KeyCode.RIGHT,
    'select': Phaser.KeyCode.SPACEBAR
  });

  var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
  loadingText = game.add.text(0, 0, "Hit space to start", style);
  loadingText.setTextBounds(0, 0, width, height);
}

function update() {
  if (!startGame && cursors.select.isDown) {
    startGame = true;
    loadingText.destroy();
    // TODO -- Play music
  }

  if (startGame) {
    currentTime += game.time.elapsed;
    // TODO -- Actually play level
  }
}

function render() {
  graphics.clear();
  if (startGame) {
    graphics.beginFill(0xffffff);
    graphics.drawCircle(width/2, height/2, height/8);
    graphics.endFill();

    // TODO -- Render falling arrows
  }
}

function Action(time, arrows) {
  this.time = time;
  this.arrows = arrows;
}
