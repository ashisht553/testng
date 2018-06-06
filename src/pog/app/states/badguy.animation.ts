export class BadGuy extends Phaser.Group{
    game:any;
    body:any;
    events:any;
    ANIMATION_IDLE:any;
    ANIMATION_HAPPY:any;
    ANIMATION_EVIL:any;
    ANIMATION_OPEN:any;
    ANIMATION_SHOCKED:any;
    tweenManager:any;
    text:any;
    _value:any;
    data:any = {};
    face:any;
    accessory:any;
  

     constructor(game:any, parent:any, name:any, addToStage:any, enableBody:any, physicsBodyType:any, bodyCacheName:any){
      super(game, parent, name, addToStage, enableBody, physicsBodyType);
      
      this.body = this.create(0, 0, bodyCacheName);
      this.body.anchor.setTo(0.5, 1);
      // var scale = 62 / this.body.width;
        //this.body.scale.setTo(scale * 2);
                       // this.body.data.value = 1;

      this.events = new Phaser.Events(this.body);      
      this.events.onAnimationsReady = new Phaser.Signal();
      //this.events.onAnimationComplete = new Phaser.Signal();
      this.events.onAnimationsStop = new Phaser.Signal();
      this.events.onAccessoriesReady = new Phaser.Signal();

      this.ANIMATION_IDLE = 'idle';
      this.ANIMATION_HAPPY = 'happy';
      this.ANIMATION_EVIL = 'evil';
      this.ANIMATION_OPEN = 'open';
      this.ANIMATION_SHOCKED = 'shocked';

      this.tweenManager = this.game.tweens;

      this.text = game.add.bitmapText(0, -20, "HMHMath", 0, 30);
      this.add(this.text);
      this.text.anchor.setTo(0.5);
      this._value = new WeakMap(); 

      this._value.set(this, 0);    
      this.game= game; 
      //console.log("consruct-->",this.game);
     }

     /**
      * 
      * @param expressionsCacheName  cache name for the animation happy,sad,idle
      * @param idleCacheName 
      * @param happyCacheName 
      * @param evilCacheName 
      * @param openCacheName 
      * @param shockedCacheName 
      */
       initFaceAnimations(expressionsCacheName:any, idleCacheName:any, happyCacheName:any, evilCacheName:any, openCacheName:any, shockedCacheName:any){
    
      this.face = this.create(0, -this.body.height + 2, expressionsCacheName);
      this.face.anchor.setTo(0.5, 0);
      //setting face animations
       switch(this.name){
            case "BG_SmallSpec_1":   this.face.scale.setTo(1.68);
                                    break;
            case "BG_SmallSpec_5":  this.face.scale.setTo(1.20);
                                    break;
            case "BG_SmallSpec_10":  this.face.scale.setTo(1.25);
                                    break;
            case "BG_SmallSpec_100": this.face.scale.setTo(1.68);
                                    break;
            case "BG_WithShirt":  this.face.scale.setTo(1.68);;
                                    break;
            case "BG_WithoutShirt":  this.face.scale.setTo(1.68);;
                                    break;
            
        }
       /*if(this.name == 'BG_SmallSpec_5'){
           this.face.scale.setTo(1.20); 
       }else{
           this.face.scale.setTo(1.68);
       }*/
      //this.add(this.face)
      


      let frameData = this.game.cache.getItem(expressionsCacheName, Phaser.Cache.IMAGE).frameData;

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
     // console.log("events-->",this.events.onAnimationStart);
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

      this.face.animations.add()

      //this.game.tweens.frameBased = true;
      //this.face.animations.play(this.ANIMATION_IDLE, false, false);
      animIdle.setFrame(idleCacheName.concat('0000'));
      this.face.animations.frameName = idleCacheName.concat('0000');

      //this.stopAnims(this.events.onAnimationsReady);
      //this.face.stopAnims(this.events.onAnimationsReady);
    }

    /**
     * Adding the accessories to the bad guys like headphone, cap, pirate cap 
     * calling this randomly to change the gear for the guys
     * @param accessoriesCacheName 
     * @param forceHide 
     */

     initAccessories(accessoriesCacheName:any, forceHide:any){
      //console.log("this--->",this);
      //console.log("height--->",accessoriesCacheName);
      //this.body.height = 124;
      this.accessory = this.create(0, -this.body.height - 20, accessoriesCacheName);

       //setting Accessories
       switch(this.name){
            case "BG_SmallSpec_1":  this.accessory.scale.setTo(1.70);
                                    this.accessory.anchor.setTo(0.5, 0.1);
                                    break;
            case "BG_SmallSpec_5":  this.accessory.scale.setTo(1.15);
                                    this.accessory.anchor.setTo(0.5, 0);
                                    break;
            case "BG_SmallSpec_10": this.accessory.scale.setTo(1.17);
                                    this.accessory.anchor.setTo(0.5, 0);
                                    break;
            case "BG_SmallSpec_100": this.face.scale.setTo(1.68);
                                    break;
            case "BG_WithShirt":    this.accessory.scale.setTo(1.70);
                                    this.accessory.anchor.setTo(0.5, 0.1);
                                    break;
            case "BG_WithoutShirt":  this.accessory.scale.setTo(1.70);
                                    this.accessory.anchor.setTo(0.5, 0.1);
                                    break;
        }
            
    
     /* if(this.name == 'BG_SmallSpec_5'){
          this.accessory.scale.setTo(1.15);
            this.accessory.anchor.setTo(0.5, 0);
      }else{
          this.accessory.scale.setTo(1.70);
            this.accessory.anchor.setTo(0.5, 0.1);
      }*/
      
     // console.log(this.body.height);
      this.setChildIndex(this.accessory, 0);

      let frames = this.game.cache.getItem(accessoriesCacheName, Phaser.Cache.IMAGE).frameData._frames;
      this.accessory.animations.add('accessories', frames, 1, false, false);
      this.accessory.animations.frame = this.game.rnd.integerInRange(0, frames.length - 1);
     // console.log("frame-->",this.accessory.animations.frame );
      this.accessory.alpha = (this.game.rnd.integerInRange(0, 100) <= 80 && !forceHide) ? 1 : 0;
     //  console.log("frame-->",this.accessory.alpha );
    }

    /**
     * play the idle animation
     */
    playIdle(){
      //console.log("_idle_", this.name, this.game.time.totalElapsedSeconds());
      //this.stopAnims();
      /** Used to sync the scale tween with the animation **/
      let animFrames = (5/24)*1000; /** Only 5 frames because that the number of frame it takes the eyes to get to the lowest position **/
      let animDelay = (1/24)*1000; /** Delay 1 frame so it feels like the face is moving the body **/


      let tweenBody = this.tweenManager.create(this.body.scale);
      //tweenBody.to( {y: 0.96, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      tweenBody.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      let tweenAccessory = this.tweenManager.create(this.accessory);
      tweenAccessory.to( {y: this.accessory.y + 4}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      /** Start tween when the animation starts **/
      //this.face.animations.getAnimation(this.ANIMATION_IDLE).onStart.addOnce(function(){tweenBody.start();tweenAccessory.start();});

      /** Play idle once  **/
      ///console.log("idlllleeeee");      
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
      tweenBody.chain(tweenBodyB);

      let tweenAccessory = this.tweenManager.create(this.accessory);
      tweenAccessory.to( {y: this.accessory.y + 4}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      /** Start tween when the animation starts **/
      //this.face.animations.getAnimation(this.ANIMATION_EVIL).onStart.addOnce(function(){tweenBody.start();tweenAccessory.start();});

      /** Play idle once  **/
      //console.log("evilllllllllllllllllllllllll");      
      this.face.animations.play(this.ANIMATION_EVIL);
    }

    /***
        Play open-mouth animation

        @private
        @see {@link startIdle} to use the animation
        @method BadGuy#startOpen
    **/
    playOpen(that:any,game:any){
     // that.stopAnims(event,game);
      //console.log("_evil_", this.name, this.game.time.totalElapsedSeconds());

      /** Used to sync the scale tween with the animation **/
      let animFrames = (5/24)*1000; /** Only 5 frames because that the number of frame it takes the eyes to get to the lowest position **/
      let animDelay = (20/24)*1000;


      let tweenBody = this.tweenManager.create(this.body.scale);
      tweenBody.to( {y: 0.96, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      //tweenBody.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      let tweenAccessory = this.tweenManager.create(this.accessory);
      tweenAccessory.to( {y: this.accessory.y + 4}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      /** Start tween when the animation starts **/
      //this.face.animations.getAnimation(this.ANIMATION_OPEN).onStart.addOnce(function(){tweenBody.start();tweenAccessory.start()});

      /** Play idle once  **/
    //console.log("opeeeeennnn");      
      this.face.animations.play(this.ANIMATION_OPEN);
    }

    /***
        Play Idle with a chance of playing the evil face animation instead at some random interval
        Use this not `playIdle` to run the idle animation

        @method BadGuy#startIdle
        @param {BadGuy} that - Reference to the current BadGuy instance. This enforce that we are always controlling the same object and goes around scope issues.

        @fires {Phaser.Signal} onAnimationStart - Notify that the current animation is starting (event contains the name of the animation as first parameter)
        @fires {Phaser.Signal} onAnimationComplete - Notify that the current animation is done (event contains the name of the animation as first parameter)
    **/
    startIdle(that:any){
        //alert(1);
       // console.log("that face-->",that);
             // console.log("that face1-->",that.face);


      //let minDelay = (that.get.animations.getAnimation(that.ANIMATION_OPEN)._frames.length/24)*2;
      let minDelay = 10;
      //let delay = Phaser.Timer.SECOND * this.game.rnd.realInRange(minDelay, minDelay*2);
      let delay = 3000;


      /**
      * Randomly switch between evil and idle as an idle animation.
      * with a higher change to play idle
      **/
      let proba = this.game.rnd.frac();
      //console.log("prboa-->",proba);
      if(proba >= 0.8)
      {
        that.game.time.events.add(delay, that.playEvil, that, that);
      }
      else if(proba <= 0.2)
      {
        that.game.time.events.add(delay, that.playOpen, that, that);
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
    startHappy(guy:any,game:any){
      console.log("start happy ()", guy, game)
      guy.stopAnims({},game);
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

      let tweenAccessory = this.tweenManager.create(this.accessory);
      tweenAccessory.to( {y: this.accessory.y + 4}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      /** Start tween when the animation starts **/
      //this.face.animations.getAnimation(this.ANIMATION_HAPPY).onStart.addOnce(function(){tweenBody.start();tweenAccessory.start();});

      /** Play Happy once  **/
      this.face.animations.play(this.ANIMATION_HAPPY);
    }

    /***
        Play shocked animation

        @method BadGuy#startShocked

        @fires {Phaser.Signal} onAnimationStart - Notify that the current animation is starting (event contains the name of the animation as first parameter)
        @fires {Phaser.Signal} onAnimationComplete - Notify that the current animation is done (event contains the name of the animation as first parameter)
    **/
    startShocked(guy:any,game:any){
      //console.log("_evil_", this.name, this.game.time.totalElapsedSeconds());
      guy.stopAnims({},game);
      /** Used to sync the scale tween with the animation **/
      let animFrames = (7/24)*1000; /** Only 5 frames because that the number of frame it takes the eyes to get to the lowest position **/
      let animDelay = 0;


      let tweenBody = this.tweenManager.create(this.body.scale);
      //tweenBody.to( {y: 0.96, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);
      tweenBody.to( {y: 0.94, x: 0.98}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      let tweenAccessory = this.tweenManager.create(this.accessory);
      tweenAccessory.to( {y: this.accessory.y + 4}, animFrames, Phaser.Easing.Elastic.Out, false, animDelay, 0, true);

      /** Start tween when the animation starts **/
      //this.face.animations.getAnimation(this.ANIMATION_SHOCKED).onStart.addOnce(function(){tweenBody.start();tweenAccessory.start();});

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
    stopAnims(event:any,gameRef:any){
      this.game = gameRef;
      
      this.face.animations.stop(null, true);
      
      this.tweenManager.removeAll();
      
      this.body.scale.setTo(1);
      this.accessory.y = -this.body.height - 20;
      for (var evt of this.game.time.events.events) {
        if(evt.callbackContext == this)
        {
            this.game.time.events.remove(evt);
        }
      }

      if(event != null || event != undefined)
      {
         this.events.onAnimationsStop.dispatch(this);
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
    setValue(val:any, showValue = false){
      this._value.set(this, val);
      if(showValue){
        this.text.text = val;
      }
    }

    /***
        Get the value shown on the guy's belly

        @method BadGuy#getValue
        @return {integer} - The value associated with this instance (defined with {@link setValue})
    **/
    getValue(){
      return this._value.get(this);
    }
}