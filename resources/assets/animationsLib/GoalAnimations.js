/***
  @file Goal Animations for BasketBall game (Card Game)
  @author Nicolas Laudo
  @version 1.0
*/
/***
  Goal Animations for BasketBall game (Card Game)
  @class
**/
class GoalAnimations{
  /***
      To init the animations we need a few stage elements that will be controlled by this animation system.
      @constructor
      @param {Phaser.Game} game - current game instance
      @param {Phaser.Sprite} jumpingGuy - The instance of the good guy that will jump (the one with the headband)
      @param {Phaser.Sprite} badGuy - The instance of the bad guy that is under the basket. (Needs to contains the stretch animation)
      @param {Phaser.Sprite} ball - The instance of the ball.
      @param {Phaser.Sprite} hitAnim - The instance of the hitAnimation (The animation with the stars shooting in a circle)
  **/
  constructor(game, jumpingGuy, badGuy, ball, hitAnim){

    /***
    @private All following variables are internal to the class
    **/
    this.game = game;
    this.guy = jumpingGuy;
    this.badGuy = badGuy;
    this.ball = ball;
    this.hitAnim = hitAnim;


    this.events = new Phaser.Events(this);
    /***
    @readonly
    {Phaser.Signal} dispatched when the dunk animations is finished.
    **/
    this.events.onDunkFinished = new Phaser.Signal();
    /***
    @readonly
    {Phaser.Signal} dispatched when the shoot animations is finished.
    **/
    this.events.onShootFinished = new Phaser.Signal();
  }

  /***
      Dunk Anim takes a serie of x/y coordinates to align the movement. (example coordinates should work but might need to be adjusted)

      @method GoalAnimations#startDunkAnimation
      @param {Phaser.Point} guyTarget - The point where the dunking guy need to end up at the end of the animations
      @param {Phaser.Point} ballTarget - The point where the ball should hit after going through the rim (the head of the bad guy)
      @param {Phaser.Point} basketRim - The point in the middle of the rim where the ball need to pass to look like it's going through

      @fires {Phaser.Signal} onDunkFinished - Notifies that the dunk animation is done
  **/
  startDunkAnimation(guyTarget, ballTarget, basketRim){

    this.hitAnim.x = basketRim.x;
    this.hitAnim.y = basketRim.y;

    let guy = this.guy;
    let ball = this.ball;
    let game = this.game;
    let hitAnim = this.hitAnim;
    let badGuy = this.badGuy;
    let events = this.events;

    let tweenA1 = game.add.tween(guy).to( {y: - (guy.height + 100 )}, 500, Phaser.Easing.Circular.Out);
    tweenA1.onComplete.addOnce(function(){
      guy.angle = 30;
    });
    let tweenA2 = game.add.tween(ball).to( {y: - (guy.height + 100 )}, 500, Phaser.Easing.Circular.Out);
    tweenA2.onComplete.addOnce(function(){
      ball.animations.stop();
      ball.frameName = 'ball_anim0000';
    });

    let tweenB1 = game.add.tween(guy).to( {x: basketRim.x, y: basketRim.y}, 500, Phaser.Easing.Quintic.In);
    tweenB1.onComplete.addOnce(function(){
      hitAnim.alpha = 1;
      hitAnim.animations.play('hitAnim');
      game.camera.shake(0.01, 200);
      game.add.tween(guy).to({angle: 0}, 100, Phaser.Easing.Linear.None, true, 1000);
      game.add.tween(guy).to({x: guyTarget.x}, 300, Phaser.Easing.Linear.None, true, 1000).onStart.addOnce(function(){
          //guy.animations.play('stretch');
      });
      game.add.tween(guy).to({y: guyTarget.y}, 300, Phaser.Easing.Circular.In, true, 1000).onComplete.addOnce(function(){
          guy.animations.play('stretch');
          events.onDunkFinished.dispatch();
      });
      badGuy.frameName = 'bg_stretch0000';
      guy.animations.play('stretch');
      //console.log("B1 complete");
    });
    let tweenB2 = game.add.tween(ball).to( {x: basketRim.x + 43, y: basketRim.y + 38}, 500, Phaser.Easing.Quintic.In);
    let tweenC2 = game.add.tween(ball).to({x:ballTarget.x, y: ballTarget.y}, 200, Phaser.Easing.Exponential.Out);
    tweenC2.onComplete.addOnce(function(){
      game.add.tween(ball).to({y: badGuy.y - 400}, 200, Phaser.Easing.Circular.In, true);
      game.add.tween(ball).to({x: game.world.width + 200}, 200, Phaser.Easing.Linear.None, true, 100);
      ball.animations.play('bounce');
      badGuy.animations.play('stretch');
    });

    tweenA1.chain(tweenB1);
    tweenA2.chain(tweenB2, tweenC2);

    tweenA1.start();
    tweenA2.start();
  }

  /***
      Shoot Anim takes a serie of x/y coordinates to align the movement. (example coordinates should work but might need to be adjusted)
      @method GoalAnimations#startShootAnimation
      @param {Phaser.Point} ballTarget - The point where the ball should hit after going through the rim (the head of the bad guy)
      @param {Phaser.Point} basketRim - The point in the middle of the rim where the ball need to pass to look like it's going through

      @fires {Phaser.Signal} onShootFinished - Notifies that the shoot animation is done
  **/
  startShootAnimation(ballTarget, basketRim){
    let events = this.events;
    let badGuy = this.badGuy;
    let speed = 200;
    let ball = this.ball;

    ball.animations.stop();
    ball.frameName = 'ball_anim0000';

    let midPointX = this.ball.x + ((basketRim.x + 30) - this.ball.x)/2;
    let midPointY = this.ball.y - 100; //target basketRim.y + 38

    let tweenX1 = game.add.tween(this.ball).to( {x: basketRim.x + 30}, speed*2, Phaser.Easing.Linear.None);
    let tweenY1 = game.add.tween(this.ball).to( {y: midPointY}, speed, Phaser.Easing.Circular.Out);

    let tweenY2 = game.add.tween(this.ball).to( {y: ballTarget.y}, speed, Phaser.Easing.Circular.In);
    tweenY2.onComplete.addOnce(function(){
      //badGuy.frameName = 'bg_stretch0000';

      game.add.tween(ball).to({x: game.world.width + 80}, speed*3, Phaser.Easing.Linear.None, true, 100).onComplete.addOnce(function(){
        events.onShootFinished.dispatch();
      });
      game.add.tween(ball).to({y: ballTarget.y - 100}, speed*3, Phaser.Easing.Circular.Out, true);

      ball.animations.play('bounce');
      badGuy.animations.play('stretch');

    });

    tweenY1.chain(tweenY2);

    tweenX1.start();
    tweenY1.start();
  }
}
