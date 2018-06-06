var game = new Phaser.Game(1024, 704, Phaser.AUTO, 'game', { preload: preload, create: create });

var transitionB;

function preload() {
    game.load.image('bg', './assets/background.png');
    game.load.atlasJSONArray('GG1', './assets/spritesheets/Object_GG1.png', './assets/spritesheets/Object_GG1.json');
    game.load.atlasJSONArray('GG100', './assets/spritesheets/Object_GG100.png', './assets/spritesheets/Object_GG100.json');

    game.stage.backgroundColor = '#61CDCD';
		game.scale.pageAlignHorizontally = true;
		//game.scale.pageAlignVertically = true;
		game.scale.refresh();

}

function create() {
    game.add.image(0,0, "bg");

    transitionB = new TransitionB(game);
    transitionB.events.onTransitionReady.add(onTransitionReady);
    transitionB.events.onTransitionFinished.add(onTransitionReady);

    transitionB.init('GG1', 'GG100', 'bg');

}

function onTransitionReady(){
  game.input.onDown.addOnce(startTransition, this);
}
function startTransition(){
  transitionB.reset();
  transitionB.start();
}

function onTransitionDone(){
    game.input.onDown.addOnce(startTransition, this);
}
