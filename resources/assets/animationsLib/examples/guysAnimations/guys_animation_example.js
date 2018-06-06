var game = new Phaser.Game(1024, 704, Phaser.AUTO, 'game', { preload: preload, create: create });

var badguys;

function preload() {
    game.load.image('bg', './assets/background.png');
    game.load.image('BG_body', './assets/BadGuy_Body.png');
    game.load.atlasJSONArray('BG_Expressions', './assets/spritesheets/BadGuy_Expressions.png', './assets/spritesheets/BadGuy_Expressions.json');
    game.load.bitmapFont("HMHMath", "assets/font/AvenirPrimaryHMHMath_Black.png", "assets/font/AvenirPrimaryHMHMath_Black.fnt")

    game.stage.backgroundColor = '#61CDCD';
		game.scale.pageAlignHorizontally = true;
		//game.scale.pageAlignVertically = true;
		game.scale.refresh();

}

function create() {
    game.add.image(0,0, "bg");
    game.stage.backgroundColor = '#FFFFFF';
    badguys = [];

    //Generate 3 bad guys for testing
    for (var i = 0; i < 9; i++) {
      //BadGuy extends Phaser.Group, so takes the same constructor parameters + the image of the bad guy body
      let badGuy = new BadGuy(game, game.world, 'badGuy'.concat(i), true,  false, 0, "BG_body");
      badGuy.x = (badguys.length+1) * 100;
      badGuy.y = 300;
      badGuy.events.onAnimationsReady.add(onAnimationsReady);
      //badGuy.events.onAnimationStart.add(onAnimationStart);
      badGuy.events.onAnimationComplete.add(onAnimationComplete);
      badGuy.initFaceAnimations('BG_Expressions', 'BadGuy_Idle', 'BadGuy_Happy', 'BadGuy_EvilSmile', 'BadGuy_OpenMouth', 'BadGuy_Shocked');
      badGuy.setValue(game.rnd.integerInRange(2, 20));
      //badGuy.setValue("");
      badguys.push(badGuy);
    }
    game.input.onDown.addOnce(openAnim);
}

function onAnimationsReady(t){
  //t.stopAnims();
  t.startIdle(t);
}

function openAnim(){
  for (var guy of badguys) {
    guy.startOpen();
  }
  game.input.onDown.addOnce(happyAnim);
}

function happyAnim(){
  for (var guy of badguys) {
    guy.startHappy();
  }
  game.input.onDown.addOnce(shockedAnim);
}

function shockedAnim(){
  for (var guy of badguys) {
    guy.startShocked();
  }
  game.input.onDown.addOnce(openAnim);
}

function onAnimationsStopped(t)
{
  //t.startHappy();
}

function onAnimationComplete(e, t){
    if(e == t.ANIMATION_IDLE || t.ANIMATION_EVIL){
      t.startIdle(t);
    }
    else if (e == t.ANIMATION_OPEN) {
      t.startIdle(t);
    }
    else if(e == t.ANIMATION_HAPPY){
      t.startIdle(t);
    }
    else if (e == t.ANIMATION_SHOCKED) {
      t.startIdle(t);
    }
    //console.log(e, t);
}
