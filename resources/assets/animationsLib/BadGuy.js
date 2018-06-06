/***
  @file The main animation system for BadGuys
  @author Nicolas Laudo
  @version 1.0
*/

"use strict";

/***
  The main animation system for BadGuys
  @class
**/
var BadGuy;
{
  /**
  * @private
  **/
  let _value = new WeakMap();

  BadGuy = class BadGuy extends Phaser.Group{
    /***
        To init the animations we need a few stage elements that will be controlled by this animation system.
        @class GoalAnimations
        @constructor
        @extends {Phaser.Group}

        @param {Phaser.Game} game - A reference to the currently running game.
        @param {DisplayObject|null} [parent=(game world)] - The parent Group (or other {@link DisplayObject}) that this group will be added to.
                                    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
        @param {string} [name='group'] - A name for this group. Not used internally but useful for debugging.
        @param {boolean} [addToStage=false] - If true this group will be added directly to the Game.Stage instead of Game.World.
        @param {boolean} [enableBody=false] - If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
        @param {integer} [physicsBodyType=0] - The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.

        @param {string} bodyCacheName - The cache name of the atlasJSONArray for the badGuy spritesheet
    **/
    constructor(game, parent, name, addToStage, enableBody, physicsBodyType, bodyCacheName){
      super(game, parent, name, addToStage, enableBody, physicsBodyType);

      this.body = this.create(0, 0, bodyCacheName);
      this.body.anchor.setTo(0.5, 1);

      this.events = new Phaser.Events(this);
      this.events.onAnimationsReady = new Phaser.Signal();
      //this.events.onAnimationComplete = new Phaser.Signal();
      this.events.onAnimationsStop = new Phaser.Signal();
      this.events.onAccessoriesReady = new Phaser.Signal();


      this.ANIMATION_IDLE = 'idle';
      this.ANIMATION_HAPPY = 'happy';
      this.ANIMATION_EVIL = 'evil';
      this.ANIMATION_OPEN = 'open';
      this.ANIMATION_SHOCKED = 'shocked';

      //this.tweenManager = new Phaser.TweenManager(this.game);
      this.tweenManager = this.game.tweens;

      this.text = game.add.bitmapText(0, -20, "HMHMath", 0, 30);
      this.add(this.text);
      this.text.anchor.setTo(0.5);

      _value.set(this, 0);
    }

    /***
        initialisation of face animations and expressions. Body movements are synchonized with each expression.

        @method BadGuy#initFaceAnimations
        @param {string} expressionsCacheName - The cache name of the `atlasJSONArray` spritesheet hat contains the various expressions.
        @param {string} idleCacheName - The name of the json key for the idle expression
        @param {string} happyCacheName - The name of the json key for the happy expression
        @param {string} evilCacheName - The name of the json key for the evil expression
        @param {string} openCacheName - The name of the json key for the open-mouth expression
        @param {string} shockedCacheName - The name of the json key for the shocked expression

        @fires {Phaser.Signal} onAnimationsReady - Notify that the group is ready and that all face animations are ready to be played.
    **/
    initFaceAnimations(expressionsCacheName, idleCacheName, happyCacheName, evilCacheName, openCacheName, shockedCacheName){
      this.face = this.create(0, -this.body.height + 2, expressionsCacheName);
      this.face.anchor.setTo(0.5, 0);
      //this.add(this.face)


      let frameData = game.cache.getItem(expressionsCacheName, Phaser.Cache.IMAGE).frameData;

      let idleFrames = [];
      let happyFrames = [];
      let evilFrames = [];
      let openFrames = [];
      let shockedFrames = [];
      for (var frame of frameData._frames) {
        if(frame.name.indexOf(idleCacheName) != -1)
        {
          idleFrames.push(frame.name);
        }
        else if(frame.name.indexOf(happyCacheName) != -1)
        {
          happyFrames.push(frame.name);
        }
        else if(frame.name.indexOf(evilCacheName) != -1)
        {
          evilFrames.push(frame.name);
        }
        else if(frame.name.indexOf(openCacheName) != -1)
        {
          openFrames.push(frame.name);
        }
        else if(frame.name.indexOf(shockedCacheName) != -1)
        {
          shockedFrames.push(frame.name);
        }
      }

      let target = this;
      let onAnimationStart = this.events.onAnimationStart;
      let onAnimationComplete = this.events.onAnimationComplete;

      let animIdle = this.face.animations.add(this.ANIMATION_IDLE, idleFrames, 24, false, false);
      animIdle.onStart.add(function(){onAnimationStart.dispatch(animIdle.name, target);}); /** When animation starts, dispatch Animation Start event **/
      animIdle.onComplete.add(function(){onAnimationComplete.dispatch(animIdle.name, target);}); /** When animation is done dispatch AnimationComplete event **/

      let animEvil = this.face.animations.add(this.ANIMATION_EVIL, evilFrames, 24, false, false);
      animEvil.onStart.add(function(){onAnimationStart.dispatch(animEvil.name, target);});
      animEvil.onComplete.add(function(){onAnimationComplete.dispatch(animEvil.name, target);});

      let animHappy = this.face.animations.add(this.ANIMATION_HAPPY, happyFrames, 24, false, false);
      animHappy.onStart.add(function(){onAnimationStart.dispatch(animHappy.name, target);});
      animHappy.onComplete.add(function(){onAnimationComplete.dispatch(animHappy.name, target);});

      let animOpen = this.face.animations.add(this.ANIMATION_OPEN, openFrames, 24, false, false);
      animOpen.onStart.add(function(){onAnimationStart.dispatch(animOpen.name, target);});
      animOpen.onComplete.add(function(){onAnimationComplete.dispatch(animOpen.name, target);});

      let animShocked = this.face.animations.add(this.ANIMATION_SHOCKED, shockedFrames, 24, false, false);
      animShocked.onStart.add(function(){onAnimationStart.dispatch(animShocked.name, target);});
      animShocked.onComplete.add(function(){onAnimationComplete.dispatch(animShocked.name, target);});


      //this.game.tweens.frameBased = true;
      //this.face.animations.play(this.ANIMATION_IDLE, false, false);
      animIdle.setFrame(idleCacheName.concat('0000'));
      this.face.animations.frameName = idleCacheName.concat('0000');

      this.stopAnims(this.events.onAnimationsReady);
    }


    /***
        Initialisation of the accessories.
        @TODO: Not implemented yet. This is just a stub

        @method BadGuy#initAccessories

        @fires {Phaser.Signal} onAccessoriesReady - Notify that the accessories are ready
    **/
    initAccessories(){
      this.events.onAccessoriesReady.dispatch(this);
    }

    /***
        Play the Idle face animation and body movement.
        @private
        @see {@link startIdle} to use the Idle animation
        @method BadGuy#playIdle
    **/
    playIdle(){
      //console.log("_idle_", this.name, this.game.time.totalElapsedSeconds());
      //this.stopAnims();
      /** Used to sync the scale tween with the animation **/
      let animFrames = (5/24)*1000; /** Only 5 frames because that the number of frame it takes the eyes to get to the lowest position **/
      let animDelay = (1/24)*1000; /** Delay 1 frame so it feels like the face is moving the body **/


      let tweenBody = this.tweenManager.create(this.body.scale);
      //tweenBody.to( {y: 0.96, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      tweenBody.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      /** Start tween when the animation starts **/
      this.face.animations.getAnimation(this.ANIMATION_IDLE).onStart.addOnce(function(){tweenBody.start();});

      /** Play idle once  **/
      this.face.animations.play(this.ANIMATION_IDLE);
    }

    /***
        Play the Evil face animation and body movement.
        @private
        @see {@link startIdle} to use the animation
        @method BadGuy#playEvil
    **/
    playEvil(){
      //console.log("_evil_", this.name, this.game.time.totalElapsedSeconds());
      //this.stopAnims();
      /** Used to sync the scale tween with the animation **/
      let animFrames = (5/24)*1000; /** Only 5 frames because that the number of frame it takes the eyes to get to the lowest position **/
      let animDelay = (1/24)*1000; /** Delay 1 frame so it feels like the face is moving the body **/


      let tweenBody = this.tweenManager.create(this.body.scale);
      //tweenBody.to( {y: 0.96, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      tweenBody.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      let tweenBodyB = this.tweenManager.create(this.body.scale);
      tweenBodyB.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, (23/24)*1000, 0, true);
      tweenBody.chain(tweenBodyB)

      /** Start tween when the animation starts **/
      this.face.animations.getAnimation(this.ANIMATION_EVIL).onStart.addOnce(function(){tweenBody.start();});

      /** Play idle once  **/
      this.face.animations.play(this.ANIMATION_EVIL);
    }

    /***
        Play Idle with a chance of playing the evil face animation instead at some random interval
        Use this not `playIdle` to run the idle animation

        @method BadGuy#startIdle
        @param {BadGuy} that - Reference to the current BadGuy instance. This enforce that we are always controlling the same object and goes around scope issues.

        @fires {Phaser.Signal} onAnimationStart - Notify that the current animation is starting (event contains the name of the animation as first parameter)
        @fires {Phaser.Signal} onAnimationComplete - Notify that the current animation is done (event contains the name of the animation as first parameter)
    **/
    startIdle(that){

      let minDelay = (that.face.animations.getAnimation(that.ANIMATION_IDLE)._frames.length/24)*2;
      let delay = Phaser.Timer.SECOND * game.rnd.realInRange(minDelay, minDelay*3);


      /**
      * Randomly switch between evil and idle as an idle animation.
      * with a higher change to play idle
      **/
      if(game.rnd.frac() > 0.8)
      {
        that.game.time.events.add(delay, that.playEvil, that, that);
      }
      else
      {
        that.game.time.events.add(delay, that.playIdle, that, that);
      }
    }

    /***
        Play Happy animation

        @method BadGuy#startHappy

        @fires {Phaser.Signal} onAnimationStart - Notify that the current animation is starting (event contains the name of the animation as first parameter)
        @fires {Phaser.Signal} onAnimationComplete - Notify that the current animation is done (event contains the name of the animation as first parameter)
    **/
    startHappy(){
      this.stopAnims();
      //console.log("_happy_", this.name, this.game.time.totalElapsedSeconds());

      /** Used to sync the scale tween with the animation **/
      let animFrames = (5/24)*1000; /** Only 5 frames because that the number of frame it takes the eyes to get to the lowest position  **/
      //let animDelay = this.face.animations.getAnimation(animIdle).delay
      let animDelay = (19/24)*1000; /** Starts the second tween 19 frames after the first  **/

      let tweenBody = this.tweenManager.create(this.body.scale);
      tweenBody.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, 0, 0, true);
      let tweenBodyB = this.tweenManager.create(this.body.scale);
      tweenBodyB.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      tweenBody.chain(tweenBodyB)
      //this.tweenManager.add(tweenBody);

      /** Start tween when the animation starts **/
      this.face.animations.getAnimation(this.ANIMATION_HAPPY).onStart.addOnce(function(){tweenBody.start();});

      /** Play Happy once  **/
      this.face.animations.play(this.ANIMATION_HAPPY);
    }

    /***
        Play open-mouth animation

        @method BadGuy#startOpen

        @fires {Phaser.Signal} onAnimationStart - Notify that the current animation is starting (event contains the name of the animation as first parameter)
        @fires {Phaser.Signal} onAnimationComplete - Notify that the current animation is done (event contains the name of the animation as first parameter)
    **/
    startOpen(){
      this.stopAnims();
      //console.log("_evil_", this.name, this.game.time.totalElapsedSeconds());

      /** Used to sync the scale tween with the animation **/
      let animFrames = (5/24)*1000; /** Only 5 frames because that the number of frame it takes the eyes to get to the lowest position **/
      let animDelay = (20/24)*1000;


      let tweenBody = this.tweenManager.create(this.body.scale);
      //tweenBody.to( {y: 0.96, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      tweenBody.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      /** Start tween when the animation starts **/
      this.face.animations.getAnimation(this.ANIMATION_OPEN).onStart.addOnce(function(){tweenBody.start();});

      /** Play idle once  **/
      this.face.animations.play(this.ANIMATION_OPEN);
    }

    /***
        Play shocked animation

        @method BadGuy#startShocked

        @fires {Phaser.Signal} onAnimationStart - Notify that the current animation is starting (event contains the name of the animation as first parameter)
        @fires {Phaser.Signal} onAnimationComplete - Notify that the current animation is done (event contains the name of the animation as first parameter)
    **/
    startShocked(){
      //console.log("_evil_", this.name, this.game.time.totalElapsedSeconds());
      this.stopAnims();
      /** Used to sync the scale tween with the animation **/
      let animFrames = (7/24)*1000; /** Only 5 frames because that the number of frame it takes the eyes to get to the lowest position **/
      let animDelay = 0;


      let tweenBody = this.tweenManager.create(this.body.scale);
      //tweenBody.to( {y: 0.96, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      tweenBody.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      /** Start tween when the animation starts **/
      this.face.animations.getAnimation(this.ANIMATION_SHOCKED).onStart.addOnce(function(){tweenBody.start();});

      /** Play idle once  **/
      this.face.animations.play(this.ANIMATION_SHOCKED);
    }

    /***
        Stop all animations, reset scaling and stop all events

        @method BadGuy#stopAnims
        @param {Phaser.Signal|null} [event=null] - A {@link Phaser.Signal} to be dispatched when animations are stopped.

        @fires {Phaser.Signal} onAnimationsStop - Notify that all animations are stopped
        @fires {Phaser.Signal} event - Dispatch whichever {@link Phaser.Signal} was passed as parameter instead of `onAnimationsStop`
    **/
    stopAnims(event){
      this.face.animations.stop(null, true);
      this.tweenManager.removeAll();
      this.body.scale.setTo(1);
      //console.log(this.game.time);
      for (var evt of this.game.time.events.events) {
        if(evt.callbackContext == this)
        {
            this.game.time.events.remove(evt);
        }
      }

      if(event != null || event != undefined)
      {
        event.dispatch(this)
      }
      else
      {
        this.events.onAnimationsStop.dispatch(this);
      }
    }

    /***
        Set the value shown on the guy's belly (read the value with {@link getValue})

        @method BadGuy#setValue
        @param {integer} - The value to be displayed.
    **/
    setValue(val){
      _value.set(this, val);
      this.text.text = val;
    }

    /***
        Get the value shown on the guy's belly

        @method BadGuy#getValue
        @return {integer} - The value associated with this instance (defined with {@link setValue})
    **/
    getValue(){
      return _value.get(this);
    }

  };
}
