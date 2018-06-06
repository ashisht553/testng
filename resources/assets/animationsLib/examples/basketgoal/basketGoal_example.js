var game = new Phaser.Game(1024, 704, Phaser.AUTO, 'game', { preload: preload, create: create });

var basketGoal;
var basketRimPoint;
var ballLandingPoint;

function preload() {

    //game.load.image('confetti', './assets/confetti.png');
    game.load.image('bg', './assets/background.png');
    game.load.image('basketFront', './assets/basket_front.png');
    game.load.image('basketBack', './assets/basket_back.png');
    game.load.image('shadow', './assets/shadow.png');

    game.load.atlasJSONArray('GG3_stretch', './assets/spritesheets/gg3_stretch.png', './assets/spritesheets/gg3_stretch.json');
    game.load.atlasJSONArray('BG_stretch', './assets/spritesheets/bg_stretch.png', './assets/spritesheets/bg_stretch.json');
    game.load.atlasJSONArray('ball', './assets/spritesheets/bouncing_ball.png', './assets/spritesheets/bouncing_ball.json');
    game.load.atlasJSONArray('hit', './assets/spritesheets/hit_animation.png', './assets/spritesheets/hit_animation.json');

    game.load.atlasJSONArray('basket_UI', './assets/basket_UI.png', './assets/basket_UI.json');
    game.stage.backgroundColor = '#61CDCD';
		game.scale.pageAlignHorizontally = true;
		//game.scale.pageAlignVertically = true;
		game.scale.refresh();

}

function create() {
    //Add sprite and set it to halfscale in one call.
    game.add.image(0,0, "bg").scale.setTo(0.5);

    //Adding buttons specific for the demo, not needed in final
    game.add.button(100, 100, "basket_UI", onDunkClick, this, "btn_next0000", "btn_next0000", "btn_play0000", "btn_next0000").scale.setTo(0.5);
    game.add.button(300, 100, "basket_UI", onShootClick, this, "btn_next_press0000", "btn_next_press0000", "btn_play_press0000", "btn_next_press0000").scale.setTo(0.5);


    /*** Creating a whole field and placing elements so that it looks like the actual game ***/
    var basketFront = game.add.image(game.world.width + 50, game.world.centerY - 50, 'basketFront');
    basketFront.scale.setTo(0.5)
    basketFront.anchor.setTo(1, 1);
    game.add.image(basketFront.x - basketFront.width, basketFront.y - basketFront.height/2 + 10, 'basketBack').scale.setTo(0.5);

    gg3 = game.add.sprite(game.world.width - 250, 150, 'GG3_stretch');
    gg3.scale.setTo(0.5);
    gg3.anchor.setTo(0.5);
    gg3.animations.add('stretch', Phaser.Animation.generateFrameNames('gg3_stretch', 0, 4, '', 4), 24);
    //gg3.animations.play('stretch');
    gg3.frameName = 'gg3_stretch0003';

    shadow = game.add.image(gg3.x, gg3.y + gg3.height - 25, 'shadow');
    shadow.scale.setTo(0.5);
    shadow.anchor.setTo(0.5, 1);


    ball = game.add.sprite(gg3.x - gg3.width/2, gg3.y + 10, 'ball');
    ball.scale.setTo(0.5);
    ball.anchor.setTo(0.5);
    ball.animations.add('bounce', Phaser.Animation.generateFrameNames('ball_anim', 0, 9, '', 4), 24, true, false);
    ball.animations.play('bounce');

    badGuy = game.add.sprite(basketFront.x - basketFront.width, game.world.centerY + 20, 'BG_stretch');
    badGuy.scale.setTo(0.5);
    badGuy.anchor.setTo(0, 0.5);
    badGuy.animations.add('stretch', Phaser.Animation.generateFrameNames('bg_stretch', 0, 4, '', 4), 24);
    //gg3.animations.play('stretch');
    badGuy.frameName = 'bg_stretch0003';

    var bgShadow = game.add.image(badGuy.x + 2, badGuy.y + badGuy.height - 30, 'shadow');
    bgShadow.scale.setTo(0.5);
    bgShadow.anchor.setTo(0, 0.5);


    game.world.swapChildren(badGuy, bgShadow);
    game.world.swapChildren(gg3, shadow);
    game.world.bringToTop(basketFront);

    /*** End elements placement ***/

    /*** Hit animation (stars circle) need to be instanciated before starting the animation ***/
    var hitAnim = game.add.sprite(0, 0, 'hit');
    hitAnim.scale.setTo(0.5);
    hitAnim.anchor.setTo(0.5, 0.5);
    hitAnim.animations.add('hitAnim', Phaser.Animation.generateFrameNames('hit_animation', 0, 4, '', 4), 24);
    hitAnim.alpha = 0;


    /**** START OF ANIMATION SPECIFIC ELEMENTS ***/
    basketRimPoint = new Phaser.Point(basketFront.x - basketFront.width + 10, 170);
    ballLandingPoint = new Phaser.Point(badGuy.x + badGuy.width/2, badGuy.y - badGuy.width/2);
    basketGoal = new GoalAnimations(game, gg3, badGuy, ball, hitAnim);
    basketGoal.events.onDunkFinished.add(onDunkFinished);
    basketGoal.events.onShootFinished.add(onShootFinished);

    game.input.enabled = true;

}

function onDunkClick(){
  console.log("onDunkClick");
  game.input.enabled = false;
  shadow.destroy();
  var guyLandingPoint = new Phaser.Point(game.world.width - 250, 350);


  basketGoal.startDunkAnimation(guyLandingPoint, ballLandingPoint, basketRimPoint)
}

function onShootClick(){
  console.log("onShootClick");
  game.input.enabled = false;
  basketGoal.startShootAnimation(ballLandingPoint, basketRimPoint);
}

function onDunkFinished(e){
  var shadow = game.add.image(gg3.x, gg3.y + gg3.height - 25, 'shadow');
  shadow.scale.setTo(0.5);
  shadow.anchor.setTo(0.5, 1);
  game.world.swapChildren(gg3, shadow);
  game.time.events.add(1000, create, this);
}

function onShootFinished(e){
  game.time.events.add(1000, create, this);
}
