export class TransitionA {
    game: Phaser.Game;
    events: any;
    guys: any;
    group: Phaser.Group;
    params:Array<any>;
    win:Phaser.Sound;
    constructor(game: Phaser.Game) {

        this.game = game;
        //this.guys = [];
        this.events = new Phaser.Events({} as Phaser.Sprite);
        this.events.onTransitionReady = new Phaser.Signal();
        this.events.onTransitionFinished = new Phaser.Signal();
    }

    init(guys: any, params:any) {
        this.guys = guys;
        this.win = this.game.add.audio('win');
        let game = this.game;
        this.params = params;
        this.group = game.add.group();
        this.group.x = game.world.width - 100;
        //group.x = game.world.centerX - 300;
        this.group.y = game.world.centerY + 400;

        for (var i = 0; i < this.guys.length; i++) {
            let guy = this.guys[i];
            let name = guy.name+"_a";
            guy.sprite = this.group.create(0, 400, name, guy.name.concat('0000'));
            guy.sprite.y = - guy.sprite.height;
            guy.sprite.scale.setTo(2);
            guy.sprite.animations.add('walk', Phaser.Animation.generateFrameNames(guy.name, 0,guy.frames, '', 4), 24, true, false);
        }
        this.reset();
    }

    start() {
        let events = this.events;
        let group = this.group;
        let thiS = this;
        for (var i = 0; i < this.guys.length; i++) {
            this.guys[i].sprite.animations.play('walk');
        }
        this.win.play();
        this.game.add.tween(group).to({ x: - (group.width + 100) }, 3500, Phaser.Easing.Linear.None, true, 0).onComplete.addOnce(function () {
            //events.onTransitionFinished.dispatch();
            console.log("When Done--",thiS.params[0]);
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
    }


    reset() {

        this.group.x = this.game.world.width + 100;
        this.group.y = this.game.world.centerY + 400;
        var groupElem: any = this.group.children;
        for (var i = 0; i < groupElem.length; i++) {
            let guy: any = groupElem[i];
            guy.y = - guy.height;
            switch (guy.key) {
                case 'GG1_a':
                    if (i > 0) {
                        guy.x = 200;
                        guy.y += 30;
                    }
                    if (i == groupElem.length - 1) {
                        guy.x = 600;
                        guy.y -= 10;
                    }
                    break;
                case 'GG10_a':
                    guy.x = 140;
                    guy.y -= 10;
                    break;
                case 'GG100_a':
                    guy.x = 190;
                    guy.y -= 10;
                    break;
                case 'GGJump_a':
                    guy.x = 400;
                    guy.y += 40;
                    break;
                default:
                    if (i > 0) {
                        guy.x = groupElem[i - 1].x + groupElem[i - 1].width + Math.floor(Math.random() * 100 + 10);
                    }
                    break;
            }
        }
       // this.reset();
    }

    destroy() {
        let guy: any;
        for (guy of this.group.children) {
            guy.destroy();
        }
    }

}


export class transitionA extends Phaser.State {
    guys: Array<any>;
    transition: TransitionA;
    //game: Phaser.Game;
    params:Array<any>
    constructor(params:any) {
        super();
    }


    init(params:any) {
        //this.game = gameInstance;
        this.params = params;
       // console.log("inside init of Transition A ------ ",params, this.game);
        this.guys = [
            { 'name': 'GG1', 'frames': 7, 'sprite': null },
            { 'name': 'GG100', 'frames': 8, 'sprite': null },
            { 'name': 'GG10', 'frames': 7, 'sprite': null },
            { 'name': 'GG1', 'frames': 7, 'sprite': null },
            { 'name': 'GGJump', 'frames': 13, 'sprite': null },
            { 'name': 'GG1', 'frames': 7, 'sprite': null }

        ];
        this.transition = new TransitionA(this.game);
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
        this.transition.init(this.guys,this.params);
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



