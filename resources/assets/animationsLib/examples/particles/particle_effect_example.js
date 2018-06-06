var game = new Phaser.Game(1024, 704, Phaser.AUTO, 'game', { preload: preload, create: create });

var celebration;

function preload() {

    game.load.image('confetti', './assets/confetti.png');
    game.load.image('bg', './assets/pog.png');
    game.load.image('modal', './assets/modal.png');
    game.stage.backgroundColor = '#61CDCD';
		game.scale.pageAlignHorizontally = true;
		//game.scale.pageAlignVertically = true;
		game.scale.refresh();

}

function create() {

    this.game.add.image(0,0, "bg");
    celebration = new ParticleCelebration(game);
    celebration.events.onCelebrationReady.addOnce(onCelebrationReady);
    celebration.init('confetti');
    this.game.add.image(147,70, "modal");
}

function onCelebrationReady(){
  console.log("celebration ready")
  game.input.onDown.addOnce(startCelebration, this);
}

function startCelebration(){
  console.log("BOOOM!")
  celebration.start();
  game.input.onDown.addOnce(clearCelebration, this);
}

function clearCelebration(){
  celebration.destroy();
  create();
}
