var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create });

var emitter;

function preload() {

    game.load.atlasJSONHash('hand', 'assets/referee_test/hand.png', 'assets/referee_test/hand.json');

}

function create() {

  ref = game.add.sprite(40, 100, 'hand');

  var animationSpeed = 15; //fps

  ref.animations.add('up', Phaser.Animation.generateFrameNames('hand_up', 0, 1,"", 4), animationSpeed, true, false);
  ref.animations.add('down', Phaser.Animation.generateFrameNames('hand_down', 0, 1,"", 4), animationSpeed, true, false);

  ref.animations.play('up');

  ref.onComplete.add(animationLooped, this);
}

function animationLooped(sprite, anim){

 if (anim.currentAnim == 'up'){
   ref.animations.play('down');
 }
 else{
   ref.animations.play('up');
 }
}
