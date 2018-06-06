var game = new Phaser.Game(1024, 704, Phaser.AUTO, 'game', { preload: preload, create: create });

var guys = [
              {'name':'GG1', 'frames':7, 'sprite':null},
              {'name':'GG100', 'frames':8, 'sprite':null},
              {'name':'GG10', 'frames':7, 'sprite':null},
              {'name':'GG1', 'frames':7, 'sprite':null},
              {'name':'GGJump', 'frames':13, 'sprite':null},
              {'name':'GGFoot', 'frames':8, 'sprite':null}

            ];

var transitionA;

function preload() {

    //game.load.image('confetti', './assets/confetti.png');
    game.load.image('bg', './assets/background.png');
    for (guy of guys) {
      game.load.atlasJSONArray(guy.name, './assets/spritesheets/'.concat(guy.name).concat('.png'), './assets/spritesheets/'.concat(guy.name).concat('.json'));
    }

    //game.load.atlasJSONArray('GG100', './assets/spritesheets/GG100.png', './assets/spritesheets/GG100.json');
    game.stage.backgroundColor = '#fff';
		game.scale.pageAlignHorizontally = true;
		//game.scale.pageAlignVertically = true;
		game.scale.refresh();

}

function create() {
    game.add.image(0,0, "bg");

    transitionA = new TransitionA(game);
    transitionA.events.onTransitionReady.add(onTransitionReady);
    transitionA.events.onTransitionFinished.add(onTransitionDone);
    transitionA.init(guys);

}

function onTransitionReady(){
  game.input.onDown.addOnce(start, this);
}
function start(){
  transitionA.start();
}

function onTransitionDone(){
    transitionA.reset();
}
