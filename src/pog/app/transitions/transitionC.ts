export class TransitionC{
  /***
      The constructor is kept simple to limit the overhead until we actually need to initialise the animation

      @class TransitionC
      @constructor
      @param {Phaser.Game} game - current game instance
  **/
  game: Phaser.Game;
  events:any;
  spacing:number;
  groundY:number;
  padding:number;
  gg10Array:Array<any>;
  gg100:Phaser.Sprite;
  params:Array<any>;
  win:Phaser.Sound;
  constructor(game: Phaser.Game){
    this.game = game;

    this.events = new Phaser.Events({} as Phaser.Sprite);
    this.events.onTransitionReady = new Phaser.Signal();
    this.events.onTransitionFinished = new Phaser.Signal();
  }

  /***
      The actual initialisation of the transition.
      Based only on cache names so that it can instanciate and place elements when needed.

      @method TransitionC#init
      @param {string} gg10CacheName - The cache name of the atlasJSONArray for the 1-guy sprite
      @param {string} gg100CacheName - The cache name of the atlasJSONArray for the 100-guy sprite
      @fires {Phaser.Signal} onTransitionReady - Dispatched when the animation `start` can be called
  **/
  init(gg10CacheName:String, gg100CacheName:String, params:any){

    this.spacing = 140;
    this.groundY = 650;
    this.padding = 400;
    this.params = params;
    this.win = this.game.add.audio('win');

    this.gg10Array = [];

    for (var i = 0; i < 10; i++) {
      let gg10 = this.game.add.sprite(this.spacing * i + this.padding, this.groundY,  gg10CacheName, gg10CacheName.concat('0000'));
      gg10.scale.setTo(0.4);
      gg10.anchor.setTo(0.5);

      this.gg10Array.push(gg10);
    }

    this.gg100 = this.game.add.sprite(550, 350,  gg100CacheName, gg100CacheName.concat('0000'));

    this.reset();
  }
  /***
      Starts the transition
      Do NOT call before `onTransitionReady` was dispatched. This might lead to bugs and unexpected behaviors.
      It's recommended to deactivate all interaction until `onTransitionFinished` is dispatched.

      @method TransitionC#start
      @fires {Phaser.Signal} onTransitionFinished - Dispatched when the animation is done
  **/
  start(){
    let thiS = this;
    this.win.play();
    for (var i = 0; i < this.gg10Array.length; i++) {
      this.gg10Array[i].visible = true;
    }
    this.game.time.events.add(500, this.playAnimation, this);
  }

  /***
      Plays the transition animation
      @private
      @see {@link start} to start the animation
      @method TransitionC#playAnimation

  **/
  playAnimation(){
    let game = this.game;
    let events = this.events;
    let gg100 = this.gg100;
    let ggArray = this.gg10Array;
    let thiS = this;
    let moveDistance = 200;
    let speed = 1000;
    let count = 0;

    for (var i = 0; i < this.gg10Array.length; i++) {
      let moveOut;
      let moveIn;
      let scaleOut = game.add.tween(this.gg10Array[i].scale).to( {x: this.gg10Array[i].scale.x, y: this.gg10Array[i].scale.y}, speed, Phaser.Easing.Back.In, false);
      let scaleIn = game.add.tween(this.gg10Array[i].scale).to( {x: this.gg10Array[i].scale.x/2, y: this.gg10Array[i].scale.y*1.2}, speed/1.2, Phaser.Easing.Back.In, false);

      if(i < this.gg10Array.length/2){
        moveOut = game.add.tween(this.gg10Array[i]).to( {x: this.gg10Array[i].x - moveDistance}, speed, Phaser.Easing.Elastic.Out, false);

        moveIn = game.add.tween(this.gg10Array[i]).to( {x: this.gg10Array[i].x - (i-this.gg10Array.length/2)*(this.spacing/1.4)}, speed/1.2, Phaser.Easing.Back.In, false);
      }
      else {
        moveOut = game.add.tween(this.gg10Array[i]).to( {x: this.gg10Array[i].x + moveDistance}, speed, Phaser.Easing.Elastic.Out, false);
        moveIn = game.add.tween(this.gg10Array[i]).to( {x: this.gg10Array[i].x - (i-this.gg10Array.length/2)*(this.spacing/1.4)}, speed/1.2, Phaser.Easing.Back.In, false);
      }

      scaleIn.onComplete.addOnce(function(){
        gg100.alpha = 1;
        for (var i = 0; i < ggArray.length; i++) {
          ggArray[i].visible = false;
        }
        let scale100 = game.add.tween(gg100.scale).to( {x: gg100.scale.x*2.4, y: gg100.scale.y/2.4}, speed/2, Phaser.Easing.Elastic.Out, false);
        scale100.onComplete.addOnce(function(){
          gg100.loadTexture(gg100.key, gg100.key+'happy0000', false);
          //events.onTransitionFinished.dispatch();
          
          count++
          if(count === thiS.gg10Array.length-1){
            console.log("When Done--",thiS.params);
          setTimeout(()=>{
            thiS.destroy();
            switch(thiS.params[3].toLowerCase()){
                case 'numeric':
                case 'numerals':
                    thiS.game.state.start('NumericGame', true, false, thiS.params);
                break;
                case 'objects':
                    thiS.game.state.start('AdditionGame', true, false,thiS.params);
                break;

            }
          },1000);
          }
        });
        scale100.start();
      });

      moveOut.chain(moveIn);
      scaleOut.chain(scaleIn);


      moveOut.start();
      scaleOut.start();
    }
  }

  /***
      Resets the transition so it can be replayed if needed.

      @method TransitionC#reset
      @fires {Phaser.Signal} onTransitionReady - Dispatched when the animation `start` can be called
  **/
  reset(){

    for (var i = 0; i < this.gg10Array.length; i++) {
      this.gg10Array[i].x = this.spacing * i + this.padding;
      this.gg10Array[i].y = this.groundY;
      this.gg10Array[i].visible = false;
      this.gg10Array[i].scale.setTo(0.8);
      this.gg10Array[i].anchor.setTo(0.5);
    }

    this.gg100.x = 1100;
    this.gg100.y = 700;
    this.gg100.scale.setTo(0.8/2.4, 0.8*2.4);
    this.gg100.anchor.setTo(0.5);
    this.gg100.alpha = 0;
    this.gg100.loadTexture(this.gg100.key, this.gg100.key+'0000', false);
    //this.events.onTransitionReady.dispatch();
  }
  /***
      Destroys all elements created by the transition

      @method TransitionC#destroy
  **/
  destroy(){
    this.gg10Array.forEach(function(gg10){
      gg10.destroy();
    });
    this.gg100.destroy();
  }

}

export class transitionC extends Phaser.State {
    guys: Array<any>;
    transition: TransitionC;
    //game: Phaser.Game;
    params:Array<any>;
    constructor() {
        super();
    }


    init(params:any) {
      this.params = params;
        //this.game = gameInstance;
        console.log("inside init of Transition A ------ ");
        this.guys = [
            { 'name': 'GG1', 'frames': 7, 'sprite': null },
            { 'name': 'GG100', 'frames': 8, 'sprite': null },
            { 'name': 'GG10', 'frames': 7, 'sprite': null },
            { 'name': 'GG1', 'frames': 7, 'sprite': null },
            { 'name': 'GGJump', 'frames': 13, 'sprite': null },
            { 'name': 'GG1', 'frames': 7, 'sprite': null }

        ];
        this.transition = new TransitionC(this.game);
    }

    preload() {
        /*  this.game.load.image('bg_a', 'transitions/transitionA/assets/background.png');
          for (let guy of this.guys) {
              this.game.load.atlasJSONArray(guy.name, 'transitions/transitionA/assets/spritesheets/'.concat(guy.name).concat('.png'), 'transitions/transitionA/assets/spritesheets/'.concat(guy.name).concat('.json'));
          }*/
        //game.load.atlasJSONArray('GG100', './assets/spritesheets/GG100.png', './assets/spritesheets/GG100.json');
        // this.game.stage.backgroundColor = '#fff';
        //this.game.scale.pageAlignHorizontally = true;
        //game.scale.pageAlignVertically = true;
        //this.game.scale.refresh();

    }

    create() {
        let bg = this.game.add.image(0, 0, "bg_a");
        bg.height = this.game.height;
        bg.width = this.game.width;

        // this.transition = new TransitionA(this.game);
        console.log("transition init --- ", this.transition, this.game);
        this.transition.init('GGa10', 'GGa100',this.params);
        this.transition.start();
        this.transition.events.onTransitionReady.add(this.onTransitionReady);
        this.transition.events.onTransitionFinished.add(this.onTransitionDone);


    }

    onTransitionReady() {
        //this.game.input.onDown.addOnce(this.start, this);
        this.transition.start();
    }
    start() {
        this.transition.start();
    }

    onTransitionDone() {
        //transitionA.destroy();
        //this.transition.reset();
    }
}