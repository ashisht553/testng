/***
  @file First transition, guys move from right to left accross the screen
  @author Nicolas Laudo
  @version 1.0
*/

/***
  @class TransitionA
**/
class TransitionA{
  /***
      The constructor is kept simple to limit the overhead until we actually need to initialise the animation

      @constructor
      @param {Phaser.Game} game - current game instance
  **/
  constructor(game){
    this.game = game;
    //this.guys = [];
    this.events = new Phaser.Events(this);
    this.events.onTransitionReady = new Phaser.Signal();
    this.events.onTransitionFinished = new Phaser.Signal();
  }

  /***
      The actual initialisation of the transition.
      Based only on cache names so that it can instanciate and place elements when needed.

      @method TransitionA#init
      @param {array} guys - Array of objects describing each guy spritesheet. Sprite parameter is expected to be null i.e.`{'name':'GG1', 'frames':7, 'sprite':null},`
      @fires {Phaser.Signal} onTransitionReady - Dispatched when the animation `start` can be called
  **/
  init(guys){
    this.guys = guys;
    let game = this.game;

    this.group = game.add.group();
    this.group.x = game.world.width + 100;
    //group.x = game.world.centerX - 300;
    this.group.y = game.world.centerY + 200;

    for (var i = 0; i < this.guys.length; i++) {
      guy = this.guys[i];
      guy.sprite = this.group.create(0,0,  guy.name, guy.name.concat('0000'));
      guy.sprite.y = - guy.sprite.height;

      guy.sprite.animations.add('walk', Phaser.Animation.generateFrameNames(guy.name, 0, guy.frames, '', 4), 24, true, false);
    }
    this.reset();
  }

  /***
      Starts the transition
      Do NOT call before `onTransitionReady` was dispatched. This might lead to bugs and unexpected behaviors.
      It's recommended to deactivate all interaction until `onTransitionFinished` is dispatched.

      @method TransitionA#start
      @fires {Phaser.Signal} onTransitionFinished - Dispatched when the animation is done
  **/
  start(){
    let events = this.events;
    let group = this.group;

    for (var i = 0; i < this.guys.length; i++) {
      this.guys[i].sprite.animations.play('walk');
    }

    game.add.tween(group).to( {x: - (group.width + 100 )}, 3500, Phaser.Easing.Linear.None, true, 0).onComplete.addOnce(function(){
      events.onTransitionFinished.dispatch();
    });
  }

  /***
      Resets the transition so it can be replayed if needed.

      @method TransitionA#start
      @fires {Phaser.Signal} onTransitionReady - Dispatched when the animation `start` can be called
  **/
  reset(){

    this.group.x = this.game.world.width + 100;
    this.group.y = this.game.world.centerY + 200;
    var groupElem = this.group.children;
    for (var i = 0; i < groupElem.length; i++) {
      var guy = groupElem[i];
      guy.y = - guy.height;
      switch (guy.key) {
        case 'GG1':
          if(i > 0)
          {
            guy.x = 200;
            guy.y += 30;
          }
        break;
        case 'GG10':
          guy.x = 140;
          guy.y -= 10;
        break;
        case 'GG100':
          guy.x = 190;
          guy.y -= 10;
        break;
        case 'GGJump':
          guy.x = 400;
          guy.y += 40;
        break;
        case 'GGFoot':
          guy.x = 600;
          guy.y -= 10;
        break;
        default:
          if(i > 0)
          {
            guy.x = groupElem[i-1].x + groupElem[i-1].width + Math.floor(Math.random()*100 + 10);
          }
        break;
      }
    }
    this.events.onTransitionReady.dispatch();
  }

  /***
      Destroys all elements created by the transition

      @method TransitionA#destroy
  **/
  destroy(){
    for (guy of this.group.children) {
      guy.destroy()
    }
  }

}
