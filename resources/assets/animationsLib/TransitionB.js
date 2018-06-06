/***
  @file Second transition, guys jump on top of each other
  @author Nicolas Laudo
  @version 1.0
*/

/***
  @class TransitionB
**/
class TransitionB{
  /***
      The constructor is kept simple to limit the overhead until we actually need to initialise the animation

      @class TransitionB
      @constructor
      @param {Phaser.Game} game - current game instance
  **/
  constructor(game){
    this.game = game;

    this.events = new Phaser.Events(this);
    this.events.onTransitionReady = new Phaser.Signal();
    this.events.onTransitionFinished = new Phaser.Signal();
  }

  /***
      The actual initialisation of the transition.
      Based only on cache names so that it can instanciate and place elements when needed.

      @method TransitionB#init
      @param {string} gg1CacheName - The cache name of the atlasJSONArray for the 1-guy sprite
      @param {string} gg100CacheName - The cache name of the atlasJSONArray for the 100-guy sprite
      @param {string} backgroundCacheName - The cache name of the image for the background image (used to make the stage bigger to allow camera movement)
      @fires {Phaser.Signal} onTransitionReady - Dispatched when the animation `start` can be called
  **/
  init(gg1CacheName, gg100CacheName, backgroundCacheName){

    let game = this.game;
    game.add.image(-game.world.width+1,0, "bg");
    game.world.setBounds(-game.world.width, 0, game.world.width*2, game.world.height);
    this.groundY = this.game.world.centerY + 300;
    this.spacing = 150;

    this.gg1A = game.add.sprite(0,0,  gg1CacheName, gg1CacheName.concat('0000'));
    this.gg1A.scale.setTo(0.75);
    this.gg1A.anchor.setTo(0.5, 1);
    this.gg1B = game.add.sprite(0, 0,  gg1CacheName, gg1CacheName.concat('0000'));
    this.gg1B.scale.setTo(0.75);
    this.gg1B.anchor.setTo(0.5, 1);
    this.gg1C = game.add.sprite(0,0,  gg1CacheName, gg1CacheName.concat('0000'));
    this.gg1C.scale.setTo(0.75);
    this.gg1C.anchor.setTo(0.5, 1);
    this.gg100 = game.add.sprite(0, 0,  gg100CacheName, gg100CacheName.concat('0000'));
    this.gg100.scale.setTo(0.5);
    this.gg100.anchor.setTo(0.5, 1);

    this.reset();
  }
  /***
      Starts the transition
      Do NOT call before `onTransitionReady` was dispatched. This might lead to bugs and unexpected behaviors.
      It's recommended to deactivate all interaction until `onTransitionFinished` is dispatched.

      @method TransitionB#start
      @fires {Phaser.Signal} onTransitionFinished - Dispatched when the animation is done
  **/
  start(){
    let game = this.game;
    let events = this.events;

    this.gg1A.visible = true;
    this.gg1B.visible = true;
    this.gg1C.visible = true;
    this.gg100.visible = true;

    let speed = 450;
    //Left guys jump on top of middle guy
    let tween1A = game.add.tween(this.gg1A).to( {x: this.gg1B.x}, speed, Phaser.Easing.Linear.None);
    let tween1B = game.add.tween(this.gg1A).to( {y: this.groundY - this.gg1B.height}, speed, Phaser.Easing.Circular.Out);
    //Right guy trys to jump too but stops on the top guy
    let tween2A = game.add.tween(this.gg1C).to( {x: this.gg1B.x + this.gg1B.width}, speed, Phaser.Easing.Linear.None);
    let tween2B = game.add.tween(this.gg1C).to( {y: this.gg1B.y - this.gg1B.height*2 + 50}, speed, Phaser.Easing.Circular.Out);
    //Right guy falls back down
    let tween3A = game.add.tween(this.gg1C).to( {x: this.gg1B.x + this.spacing}, speed, Phaser.Easing.Linear.None);
    let tween3B = game.add.tween(this.gg1C).to( {y: this.groundY}, speed, Phaser.Easing.Circular.In);

    //Camera travelling (will actually move only one direction, the other is to keep the chain)
    let tween4A = game.add.tween(this.game.camera).to( {x: -this.spacing/2}, speed*2, Phaser.Easing.Sinusoidal.Out, false, 1500);
    let tween4B = game.add.tween(this.game.camera).to( {y: this.game.camera.y}, speed*2, Phaser.Easing.Linear.None, false, 1500);
    //100 guy falls down
    let tween5A = game.add.tween(this.gg100).to( {x: this.gg1C.x + this.gg1C.width + this.spacing*2}, speed, Phaser.Easing.Linear.None);
    let tween5B = game.add.tween(this.gg100).to( {y: this.groundY}, speed, Phaser.Easing.Circular.In)
    tween5B.onComplete.addOnce(function(){
      game.camera.shake(0.04, 200);
    });

    //Right guy catapulted to the top of the pile
    let tween6A = game.add.tween(this.gg1C).to( {x: this.gg1B.x}, speed/2, Phaser.Easing.Linear.None);
    let tween6B = game.add.tween(this.gg1C).to( {y: this.gg1B.y - this.gg1B.height*2}, speed/2, Phaser.Easing.Circular.Out);
    tween6B.onComplete.addOnce(function(){
      events.onTransitionFinished.dispatch();
    });

    tween1A.chain(tween2A, tween3A, tween4A, tween5A, tween6A);
    tween1B.chain(tween2B, tween3B, tween4B, tween5B, tween6B);

    tween1A.start();
    tween1B.start();

  }

  /***
      Resets the transition so it can be replayed if needed.

      @method TransitionB#reset
      @fires {Phaser.Signal} onTransitionReady - Dispatched when the animation `start` can be called
  **/
  reset(){

    this.game.camera.x = -500;

    this.gg1B.x = 0;
    this.gg1B.y = this.groundY;
    this.gg1B.visible = false;

    this.gg1A.x = this.gg1B.x - this.spacing;
    this.gg1A.y = this.groundY;
    this.gg1A.visible = false;

    this.gg1C.x = this.gg1B.x + this.spacing;
    this.gg1C.y = this.gg1A.y;
    this.gg1C.visible = false;

    this.gg100.x = this.gg1C.x + this.gg100.width/2 + this.spacing*2;
    this.gg100.y = -100;
    this.gg100.visible = false;

    this.events.onTransitionReady.dispatch();
  }
  /***
      Destroys all elements created by the transition

      @method TransitionB#destroy
  **/
  destroy(){
    this.gg1A.destroy();
    this.gg1B.destroy();
    this.gg1C.destroy();
    this.gg100.destroy();
    this.game.camera.x = 0;
  }

}
