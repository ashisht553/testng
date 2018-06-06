export class TransitionD{
  /***
      The constructor is kept simple to limit the overhead until we actually need to initialise the animation

      @class TransitionD
      @constructor
      @param {Phaser.Game} game - current game instance
  **/
  game:Phaser.Game;
  events:any;
  spacing:number;
  groundY:number;
  padding:number;
  gg5Array:Array<any>;
  gg1a:Phaser.Sprite;
  gg1b:Phaser.Sprite;
  textA:Phaser.BitmapText;
  textB:Phaser.BitmapText;
  params:Array<any>;
  win:Phaser.Sound;
  constructor(game:Phaser.Game){
    this.game = game;

    this.events = new Phaser.Events({} as Phaser.Sprite);
    this.events.onTransitionReady = new Phaser.Signal();
    this.events.onTransitionFinished = new Phaser.Signal();
  }

  /***
      The actual initialisation of the transition.
      Based only on cache names so that it can instanciate and place elements when needed.

      @method TransitionD#init
      @param {string} gg10CacheName - The cache name of the atlasJSONArray for the 1-guy sprite
      @param {string} gg100CacheName - The cache name of the atlasJSONArray for the 100-guy sprite
      @fires {Phaser.Signal} onTransitionReady - Dispatched when the animation `start` can be called
  **/
  init(gg1CacheName:String, gg5CacheName:string, fontCacheName:string, params:any){

    this.spacing = 250;
    this.groundY = 1000;
    this.padding = 650;
    this.params = params;
    this.win = this.game.add.audio('win');

    this.gg5Array = [];

    for (var i = 0; i < 4; i++) {
      let gg5 = this.game.add.sprite(this.spacing * i + this.padding, this.groundY,  gg5CacheName, gg5CacheName.concat('0000'));

      this.gg5Array.push(gg5);
    }

    this.gg1a = this.game.add.sprite(100, 1100,  gg1CacheName, gg1CacheName.concat('0000'));
    this.gg1b = this.game.add.sprite(150, 1100,  gg1CacheName, gg1CacheName.concat('0000'));


    this.textA = this.game.add.bitmapText(200, 300, fontCacheName, "0", 100);
    this.textA.anchor.setTo(1);
    this.textA.text = "!";
    //this.textA.tint = 0x000000;

    this.textB = this.game.add.bitmapText(200, 300, fontCacheName, "0", 100);
    this.textB.anchor.setTo(1);
    this.textB.text = "!";


    this.reset();
  }
  /***
      Starts the transition
      Do NOT call before `onTransitionReady` was dispatched. This might lead to bugs and unexpected behaviors.
      It's recommended to deactivate all interaction until `onTransitionFinished` is dispatched.

      @method TransitionD#start
      @fires {Phaser.Signal} onTransitionFinished - Dispatched when the animation is done
  **/
  start(){

    this.win.play();
    for (var i = 0; i < this.gg5Array.length; i++) {
      this.gg5Array[i].visible = true;
    }
    this.gg1a.visible = true;
    this.gg1b.visible = true;

    this.game.time.events.add(500, this.playAnimation, this);
  }

  /***
      Plays the transition animation
      @private
      @see {@link start} to start the animation
      @method TransitionD#playAnimation

  **/
  playAnimation(){
    let events = this.events;

    let ggA = this.gg1a;
    let ggB = this.gg1b;
    let gg5Arr = this.gg5Array;
    let thiS = this;

    //let moveDistance = 100;
    let speed = 500;

    let aTargetX = this.gg5Array[0].x + this.gg1a.width/2 - 1;
    let aTargetY = this.gg5Array[0].y - this.gg5Array[0].height/2 + this.gg1a.height/2;
    let bTargetX = this.gg5Array[this.gg5Array.length-1].x - this.gg5Array[this.gg5Array.length-1].width/2;
    let bTargetY = this.gg5Array[this.gg5Array.length-1].y + this.gg1b.height/2 + 100;

    let ggATween1 = this.game.add.tween(this.gg1a).to( {x: aTargetX}, speed/2, Phaser.Easing.Back.Out, false);
    let ggATween2 = this.game.add.tween(this.gg1a).to( {y: aTargetY}, speed, Phaser.Easing.Back.Out, false);

    let ggATween3 = this.game.add.tween(this.gg1a.scale).to( {y: this.gg1a.scale.y/2}, speed/3, Phaser.Easing.Back.In, false, 0, 0, true);
    let ggATween4 = this.game.add.tween(this.gg1a.scale).to( {x: this.gg1a.scale.x/2}, speed/3, Phaser.Easing.Back.In, false, 0, 0, true);

    ggATween2.onComplete.addOnce(function(){

      ggA.loadTexture(ggA.key, ggA.key+'happy0000', false);
      ggB.loadTexture(ggB.key, ggB.key+'happy0000', false);

      for (var i = 0; i < gg5Arr.length; i++) {
        gg5Arr[i].loadTexture(gg5Arr[i].key, gg5Arr[i].key.concat('happy0000'), false);
      }

      //events.onTransitionFinished.dispatch();
      console.log("When Done--444 ",thiS.params);
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
    });

    //ggATween4.chain(ggATween1, ggATween3, ggATween2);
    //ggATween4.start();

    let ggBTween1 = this.game.add.tween(this.gg1b).to( {x: bTargetX}, speed, Phaser.Easing.Back.Out, false);
    let ggBTween2 = this.game.add.tween(this.gg1b).to( {y: bTargetY}, speed, Phaser.Easing.Back.Out, false);
    let ggBTween3 = this.game.add.tween(this.gg1b.scale).to( {x: this.gg1b.scale.x/2}, speed/3, Phaser.Easing.Back.In, false, 0, 0, true);

    //ggBTween3.chain(ggBTween1, ggBTween2);
    //ggBTween3.start();

    let txtATween1 = this.game.add.tween(this.textA).to( {alpha: 1}, speed/5, Phaser.Easing.Linear.None, false);
    let txtBTween1 = this.game.add.tween(this.textB).to( {alpha: 1}, speed/5, Phaser.Easing.Linear.None, false);

    let txtATween2 = this.game.add.tween(this.textA).to( {y: this.textA.y - 10}, speed/4, Phaser.Easing.Back.In, false, 0, 2, true);
    let txtBTween2 = this.game.add.tween(this.textB).to( {y: this.textB.y - 10}, speed/4, Phaser.Easing.Back.Out, false, 0, 2, true);

    let txtATween3 = this.game.add.tween(this.textA).to( {alpha: 0}, speed/5, Phaser.Easing.Linear.None, false);
    let txtBTween3 = this.game.add.tween(this.textB).to( {alpha: 0}, speed/5, Phaser.Easing.Linear.None, false);

    txtATween1.chain(txtATween2, txtATween3, ggATween4, ggATween1, ggATween3, ggATween2);
    txtBTween1.chain(txtBTween2, txtBTween3, ggBTween3, ggBTween1, ggBTween2);
    txtATween1.start();
    txtBTween1.start();

  }

  /***
      Resets the transition so it can be replayed if needed.

      @method TransitionD#reset
      @fires {Phaser.Signal} onTransitionReady - Dispatched when the animation `start` can be called
  **/
  reset(){

    for (var i = 0; i < this.gg5Array.length; i++) {
      this.gg5Array[i].x = this.spacing * i + this.padding;
      this.gg5Array[i].y = this.groundY;
      this.gg5Array[i].visible = false;
     // this.gg5Array[i].scale.setTo(0.6);
      this.gg5Array[i].anchor.x = 0.5;
      this.gg5Array[i].anchor.y = 1;
      this.gg5Array[i].loadTexture(this.gg5Array[i].key, this.gg5Array[i].key.concat('0000'), false);
    }

    this.gg1a.x = 100;
    this.gg1a.y = this.gg1b.y = 1270;
    this.gg1b.x = 250;
    this.gg1a.anchor.x = 0;
    this.gg1a.anchor.y = 1;
   // this.gg1a.scale.setTo(0.6);
    this.gg1a.visible = false;
    this.gg1a.loadTexture(this.gg1a.key, this.gg1a.key+'0000', false);

   // this.gg1b.scale.setTo(0.6);
    this.gg1b.anchor.x = 0;
    this.gg1b.anchor.y = 1;
    this.gg1b.visible = false;
    this.gg1b.loadTexture(this.gg1b.key, this.gg1b.key+'0000', false);

    this.textA.x =  this.gg1a.x + this.textA.width + this.gg1a.width/2;
    this.textB.x = this.gg1b.x + this.textB.width + this.gg1b.width/2;
    this.textA.y = this.textB.y = this.gg1b.y - this.gg1b.height - this.textA.height/2;
    this.textA.alpha = this.textB.alpha = 0;


    this.events.onTransitionReady.dispatch();
  }
  /***
      Destroys all elements created by the transition

      @method TransitionD#destroy
  **/
  destroy(){
    this.gg5Array.forEach(function(gg10:any){
      gg10.destroy();
    });
    this.gg1a.destroy();
    this.gg1b.destroy();
  }

}


export class transitionD extends Phaser.State {
    guys: Array<any>;
    transition: TransitionD;
    //game: Phaser.Game;
    params:Array<any>
    constructor() {
        super();
    }


    init(params:any) {
        //this.game = gameInstance;
        this.params = params;
        console.log("inside init of Transition A ------ ");
        this.guys = [
            { 'name': 'GG1', 'frames': 7, 'sprite': null },
            { 'name': 'GG100', 'frames': 8, 'sprite': null },
            { 'name': 'GG10', 'frames': 7, 'sprite': null },
            { 'name': 'GG1', 'frames': 7, 'sprite': null },
            { 'name': 'GGJump', 'frames': 13, 'sprite': null },
            { 'name': 'GG1', 'frames': 7, 'sprite': null }

        ];
        this.transition = new TransitionD(this.game);
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
        this.transition.init('GGa1', 'GGa5', 'HMHMath',this.params);
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
        this.transition.reset();
    }
}