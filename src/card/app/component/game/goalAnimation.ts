import { GameState } from '../../states/game.state';
/***
  Goal Animations for BasketBall game (Card Game)
  @class
**/
export class GoalAnimations{
  /***
      To init the animations we need a few stage elements that will be controlled by this animation system.
      @constructor
      @param {Phaser.Game} game - current game instance
      @param {Phaser.Sprite} jumpingGuy - The instance of the good guy that will jump (the one with the headband)
      @param {Phaser.Sprite} badGuy - The instance of the bad guy that is under the basket. (Needs to contains the stretch animation)
      @param {Phaser.Sprite} ball - The instance of the ball.
      @param {Phaser.Sprite} hitAnim - The instance of the hitAnimation (The animation with the stars shooting in a circle)
  **/

protected game:Phaser.Game;
protected guy:Phaser.Sprite;
protected badGuy:Phaser.Sprite;
protected ball:Phaser.Sprite;
protected hitAnim:Phaser.Sprite;
protected events:Phaser.Events;
protected signal:Phaser.Signal;
protected signal1:Phaser.Signal;
protected gameStateRef:any;

  constructor(game:Phaser.Game, jumpingGuy:any, badGuy:Phaser.Sprite, ball:Phaser.Sprite, hitAnim:Phaser.Sprite,gState:any){

    /***
    @private All following variables are internal to the class
    **/
    this.game = game;
    this.guy = jumpingGuy;
    this.badGuy = badGuy;
    this.ball = ball;
    this.hitAnim = hitAnim;
    this.gameStateRef = gState;

    //let gState:GameState = new GameState();

    this.signal = new Phaser.Signal();
    this.signal.add(()=>{gState.onDunkFinished(gState)});
    
    this.signal1 = new Phaser.Signal();
    this.signal1.add(()=>{gState.onShootFinished(gState)});
    
  }
  
  /***
      Dunk Anim takes a serie of x/y coordinates to align the movement. (example coordinates should work but might need to be adjusted)

      @method GoalAnimations#startDunkAnimation
      @param {Phaser.Point} guyTarget - The point where the dunking guy need to end up at the end of the animations
      @param {Phaser.Point} ballTarget - The point where the ball should hit after going through the rim (the head of the bad guy)
      @param {Phaser.Point} basketRim - The point in the middle of the rim where the ball need to pass to look like it's going through

      @fires {Phaser.Signal} onDunkFinished - Notifies that the dunk animation is done
  **/
  startDunkAnimation(guyTarget:Phaser.Point, ballTarget:Phaser.Point, basketRim:Phaser.Point)
  {  
    let guy = this.guy;
    let ball = this.ball;
    let game = this.game;
    let hitAnim = this.hitAnim;
    let badGuy = this.badGuy;
    let events = this.events;
    hitAnim.visible = false;

    guy.children[0].visible = false;
    this.gameStateRef.jump_Audio.play();
    let tweenA1 = game.add.tween(guy).to( {y: - (guy.height + 100 )}, 350, Phaser.Easing.Circular.Out);
    tweenA1.onComplete.addOnce(()=>{
      guy.angle = 30;
    });

    let tweenA2 = game.add.tween(ball).to( {y: - (guy.height + 100 )}, 350, Phaser.Easing.Circular.Out);
    tweenA2.onComplete.addOnce(()=>{
      ball.animations.stop();
      ball.frameName = 'ball_anim0000';
    });

    let tweenB1 = game.add.tween(guy).to( {x: basketRim.x+550, y: basketRim.y+95}, 350, Phaser.Easing.Quintic.In);
    tweenB1.onComplete.addOnce(()=>
    {
      hitAnim.visible = true;
      hitAnim.animations.play('hit', 8, false);
      game.camera.shake(0.01, 200);

      game.add.tween(guy).to({angle: 0}, 100, Phaser.Easing.Linear.None, true,1150);
      game.add.tween(guy).to({x: guyTarget.x-250}, 200, Phaser.Easing.Linear.None, true, 1000).onStart.addOnce(()=>{
        game.add.tween(guy.children[1].scale).to({ y: 1 }, 200, Phaser.Easing.Linear.None, true,150);
      });
      game.add.tween(guy).to({y: guyTarget.y+90}, 200, Phaser.Easing.Circular.In, true, 1000).onComplete.addOnce(()=>
      {
        this.signal.dispatch();
      });
    });


    let tweenB2 = game.add.tween(ball).to( {x: basketRim.x + 300, y: basketRim.y + 25}, 400, Phaser.Easing.Quintic.In);
    let tweenC2 = game.add.tween(ball).to({x:ballTarget.x-65, y: ballTarget.y-50}, 200, Phaser.Easing.Exponential.Out);
    tweenC2.onComplete.addOnce(()=>{
      game.add.tween(ball).to({y: badGuy.y - 400}, 200, Phaser.Easing.Circular.In, true);
      game.add.tween(ball).to({x: game.world.width + 200}, 200, Phaser.Easing.Linear.None, true, 100);
      ball.animations.play('bounce');
      this.gameStateRef.slam_Audio.play();
      badGuy.animations.play('angryHit');
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
  startShootAnimation(ballTarget:Phaser.Point, basketRim:Phaser.Point){
    let events = this.events;
    let badGuy = this.badGuy;
    let speed = 200;
    let ball = this.ball;

    ball.animations.stop();
    ball.frameName = 'ball_anim0000';

    let midPointX = this.ball.x + ((basketRim.x + 30) - this.ball.x)/2;
    let midPointY = this.ball.y - 100;

    let tweenX1 = this.game.add.tween(this.ball).to( {x: basketRim.x + 370}, speed*2, Phaser.Easing.Linear.None);
    let tweenY1 = this.game.add.tween(this.ball).to( {y: midPointY}, speed, Phaser.Easing.Circular.Out);

    this.gameStateRef.throw_Audio.play();

    let tweenY2 = this.game.add.tween(this.ball).to( {y: ballTarget.y}, speed, Phaser.Easing.Circular.In);
    tweenY2.onComplete.addOnce(()=>{

      this.gameStateRef.badGuyKnockedOnHeadAudio.play();

      this.game.add.tween(ball).to({x: this.game.world.width + 80}, speed*3, Phaser.Easing.Linear.None, true, 100).onComplete.addOnce(()=>{
        this.signal1.dispatch();
      });
      this.game.add.tween(ball).to({y: ballTarget.y - 100}, speed*3, Phaser.Easing.Circular.Out, true);

      ball.animations.play('bounce');
      badGuy.animations.play('angryHit');
    });
    
    tweenY1.chain(tweenY2);
    tweenX1.start();
    tweenY1.start();
  }
}
