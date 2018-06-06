import { TutorialEngine } from '../engine/tutorial.engine'
import { POGGameEngineBase } from '../engine/game.engine.base';
import { ObjectGameEngine } from '../engine/object.game.engine';
import { NewStateBase } from '../states/game.state.base'

/**
 * this namespace Tutorials contain all tutorial
 */
export namespace Tutorials {

    /**
     * this class describes Tutorial Two
     */
    export class TutorialTwo extends TutorialEngine.TutorialBase {

        /**
         * this variable is a phaser Tween object user to alter properties of target object
         */
        tweenHand: Phaser.Tween;

        /**
         * this variable is an instance of Game
         */
        gameInst: any;

        /**
         * this variable is reference to Hand_animation image
         */
        public animationRef: Phaser.Sprite;

        /**
         * this variable is used to scale Hand_animation image
         */
        public scale: number;

        /**
         * variable used to set animation speed
         */
        public animationSpeed: number;

        /**
         * variable used to set duration of Animation
         */
        public animationDuration: number;

        /**
         * variable used to set delay in start of animation
         */
        public animationStartDelay: number;

        /**
         * Instance of tutorialEngine's Engine class
         */
        tutorialEngine: TutorialEngine.Engine;

        /**
         * reference variable to tutorialEngine's ITriggerCondition interface
         */
        condition: TutorialEngine.ITriggerCondition;

        /**
         * variables used to provide transparent overlay screen during tutorial
         */
        shadowTexture: any;
        lightSprite: any;
        shadowTextureMovement: any;
        maskShow: boolean = true;

        /**
         * variable used to determine Hand_animation initial position
         */
        xGap: number;

        /**
         * Initializing the properties
         * @param 'gameInst'  instance of game
         * @param 'triggeredCondition'  condition to trigger tutorial
         */
        constructor(gameInst: any, triggeredCondition: any) {
            super(gameInst);
            this.id = '1';
            this.condition = {
                monitoredObject: triggeredCondition.monitoredObject,
                property: triggeredCondition.property,
                happenWhen: triggeredCondition.happenWhen,
                happenWhenRange: triggeredCondition.happenWhenRange,
                inclusive: triggeredCondition.inclusive || false,
                stopProperty: triggeredCondition.stopProperty,
                stopWhen: triggeredCondition.stopWhen,
                tutorialName: triggeredCondition.tutorialName
            }
            this.shadowTextureMovement = [];
            this.gameInst = gameInst;
            this.triggerConditions.push(this.condition);

        }
        /**
         * method reponsible to show tutorial
         */
        show() {
            this.init();
            super.show();
        }

        /**
         * method used to initialize Hand_animation & related methods
         */
        private handXpos:number = -1;
        private handYpos:number = -1;
        private init() {
            if (this.animationRef != undefined) {
                this.distroyObject();
            }
            this.animationSpeed = 15;
            // getting the first good guy on bench for position
            var getGoodGuyAtZero = this.gameInst.getFirstGuyOnBench();

            // Calculating Hand_animation initial position
            this.xGap = getGoodGuyAtZero.getLocalBounds().right;
            if (this.handXpos == -1) {
                this.handXpos = this.gameInst.benchGuyGroup.x + this.xGap / 3;
                this.handYpos = getGoodGuyAtZero.y;
            }

            // Adding Hand_animation image
            this.animationRef = this.gameInst.game.add.sprite(this.handXpos, this.handYpos, 'hand');
            this.animationRef.alpha = 0;

            // this variable is used to find goodGuyFields where user will drag element 
            let userField = this.gameInst.goodGuyFields.length - 1;
            let xPosData, yPosData;
            if (this.gameInst.key === "NumericGame") {
                xPosData = this.gameInst.referee.x-(this.animationSpeed*20);
                yPosData = this.gameInst.referee.y +(this.animationSpeed*7);

            } else {
                xPosData = this.gameInst.goodGuyFields[userField].getLocalBounds().x + (this.gameInst.goodGuyFields[userField].getLocalBounds().width / 2) + 50;
                yPosData = this.gameInst.goodGuyFields[userField].getLocalBounds().y + this.gameInst.goodGuyFields[userField].getLocalBounds().height / 2;

            }






            this.animationRef.data = { x: xPosData, y: yPosData };

            //methods used to handle animation
            this.addFingerUpDownAnimation(this.animationRef, this.animationSpeed, 'up', 0, 12);
            this.addFingerUpDownAnimation(this.animationRef, this.animationSpeed, 'down', 16, 22);
            this.scale = 1.2;//0.75;
            this.setScale(this.animationRef, this.scale);
            if (this.maskShow) {
                this.updateShadowTexture();
            }
            this.gameInst.tutorialDecoration.add(this.lightSprite);
            this.gameInst.tutorialField.add(this.animationRef);
            this.gameInst.rewardBG.tint = 0x646464;
            this.gameInst.bringTutorialOntop(getGoodGuyAtZero);
            this.gameInst.bringTutorialOntop(this.animationRef.parent);
            
            this.tweenHand = this.addObject(this.gameInst, "tween", this.animationRef);
            this.animate(this.tweenHand, { alpha: 1 }, this.animationDuration, Phaser.Easing.Linear.None, true, this.animationStartDelay, this.onAnimation1Complete);

        }

        /**
         * method used to update transparent overlay screen during Animation
         */
        updateShadowTexture() {

            if (this.animationRef == undefined)
                return;
            this.lightSprite.blendMode = PIXI.blendModes.MULTIPLY;
            this.lightSprite.alpha = 1;
            if (this.lightSprite != undefined) {
                this.lightSprite.inputEnabled = true;
            }


            this.gameInst.tutorialDecoration.add(this.lightSprite);
            this.gameInst.tutorialField.add(this.animationRef);
            this.gameInst.sheenAppearence = true;
		
		 this.shadowTexture = this.game.add.graphics(0, 0);
            this.shadowTexture.beginFill(0x000000, 0.5);
            this.shadowTexture.drawRect(0, 0, this.game.world.getBounds().width, this.game.world.getBounds().height);
            this.shadowTexture.endFill();
            this.shadowTexture.width = this.game.world.width;
            this.shadowTexture.height = this.game.world.height;
            this.shadowTexture.inputEnabled = true;
	   
           /* working code
	   this.shadowTexture.context.fillStyle = 'rgb(100, 100, 100)';
            this.shadowTexture.context.fillRect(0, 0, this.gameInst.game.width, this.gameInst.game.height);*/
            // Bringing benchGuyGroup to top of the game
            this.gameInst.game.world.bringToTop(this.gameInst.benchGuyGroup.parent);


            // Bringing Hand_animation image to top of the game
            this.gameInst.game.world.bringToTop(this.animationRef.parent);


            // Highlighting an image from benchGuyGroup
            for (let i = 0; i < this.gameInst.benchGuyGroup.length; i++) {
                if (i != 1) {
                    this.gameInst.benchGuyGroup.getChildAt(i).tint = 0x646464;
                    this.gameInst.benchGuyGroup.getChildAt(i).inputEnabled = false;
                }

            }
            this.shadowTexture.dirty = true;
        };

        /**
         * Adding objects to show Hand_animation
         * @param 'gameInst'  instance of current game
         * @param 'addObjectType'  object type
         * @param 'animationRef'  object
         */
        addObject(gameInst: any, addObjectType: any, animationRef: any) {
            let returnObject: any;
            switch (addObjectType) {
                case 'tween':
                    returnObject = gameInst.game.add.tween(animationRef);
                    break;

                case 'sprite':
                    returnObject = gameInst.game.add.sprite(animationRef);
                    break;

                default:
                    break;
            }
            return returnObject;
        }

        /**
         * to set scaling value for animated object
         * @param 'itemRef'  animation object
         * @param 'value'  scale value
         */
        setScale(itemRef: any, value: number) {
            itemRef.scale.setTo(value);
            itemRef.scale.x *= -1;
        }

        /**
         * method that handle animation
         * @param 'itemRef'  image which is to be animated
         * @param 'animateProperty'  data for the animation
         * @param 'timeSpan'  timeSpan for the Animation
         * @param 'animation' specify kind of Animation
         * @param 'autoplay' boolean (true if auto start)
         * @param 'timedealy'  delayed time to start
         * @param 'callback'  callback function to loop the animation
         */
        animate(itemRef: any, animateProperty: any, timeSpan: number, animation: any, autoplay: boolean, timedealy: number, callback: Function) {
            itemRef.to(animateProperty, timeSpan, animation, autoplay, timedealy);
            itemRef.onComplete.addOnce(callback, this);
        }

        /**
         * method that gets called when animation 1st gets completed
         */
        private onAnimation1Complete() {
            this.playUpDownAnimation(this.animationRef, this.animationSpeed, 'up');
            this.animate(this.tweenHand, { x: this.animationRef.data.x, y: this.animationRef.data.y }, this.animationDuration, Phaser.Easing.Linear.None, true, 0, this.onAnimation2Complete);
        }

        /**
         * method that gets called when animation second gets completed
         */
        private onAnimation2Complete() {
            this.playUpDownAnimation(this.animationRef, this.animationSpeed, 'down');
            this.gameInst.add.tween(this.animationRef).to({ alpha: 0.1 }, 500, Phaser.Easing.Linear.None, true);
            this.animationStartDelay = 700;
            this.setDelay(this.animationStartDelay);
        }

        /**
         * destroy animation objects/sprites after complete
         */
        private distroyObject() {
            //this.shadowTexture.alpha = 0;
            this.animationRef.alpha = 0;
            this.animationRef.destroy();
            this.gameInst.rewardBG.tint = 0xffffff;
        }

        /**
         * close the animation
         */
        public close() {
            this.gameInst.sheenAppearence = false;
            this.shadowTexture.destroy();
            this.lightSprite.destroy();
            this.animationRef.destroy();
            this.gameInst.rewardBG.tint = 0xffffff;
            //  this.gameInst.game.world.sendToBack(this.gameInst.benchGuyGroup);

            for (let i = 0; i < this.gameInst.benchGuyGroup.length; i++) {

                this.gameInst.benchGuyGroup.getChildAt(i).tint = 0xffffff;
                // this.gameInst.benchGuyGroup.getChildAt(i).inputEnabled = true;
            }
        }

        /**
         * method to delay the animation loop
         * @param 'delay'  time miliseconds 
         */
        private setDelay(delay: number) {
            setTimeout(() => {
                this.distroyObject();
                this.maskShow = false;
                this.init();
            }, delay, this);
        }

        /**
         * method to perform part of hand animation
         * @param 'animationRef'  image to be animated
         * @param 'animationSpeed'  speed of animation in miliseconds
         * @param 'animationDirection'  direction of animation
         * @param 'startFrame'  initial number of frame
         * @param 'endFrame'  last frame number to play
         */
        private addFingerUpDownAnimation(animationRef: any, animationSpeed: number, animationDirectionName: string, startFrame: number, endFrame: number) {
            animationRef.animations.add(animationDirectionName, Phaser.Animation.generateFrameNames('hand', startFrame, endFrame, "", 4), animationSpeed, true, false);
        }

        /**
         * method to perform part of hand animation
         * @param 'animationRef'  image to be animated
         * @param 'animationSpeed'  speed of animation in miliseconds
         * @param 'animationDirection'  direction of animation
         */
        private playUpDownAnimation(animationRef: any, animationSpeed: number, animationDirection: string) {
            animationRef.animations.play(animationDirection, animationSpeed, false);

        }

    }

    /**
     * this class describes Tutorial Two
     */
    export class TutorialThree extends TutorialEngine.TutorialBase {

        /**
         * this variable is a phaser Tween object user to alter properties of target object
         */
        tweenHand: Phaser.Tween;

        /**
         * this variable is an instance of Game
         */
        gameInst: any;

        /**
         * this variable is reference to Hand_animation image
         */
        public animationRef: Phaser.Sprite;

        /**
         * Instance of tutorialEngine's Engine class
         */
        tutorialEngine: TutorialEngine.Engine;

        /**
         * reference variable to tutorialEngine's ITriggerCondition interface
         */
        condition: TutorialEngine.ITriggerCondition;

        /**
         * variables used to handle transparent overlay screen
         */
        shadowTexture: any;
        lightSprite: any;

        /**
         * Initializing the properties
         * @param 'gameInst'  instance of game
         * @param 'triggeredCondition'  condition to trigger tutorial
         */
        constructor(gameInst: any, triggeredCondition: any) {
            super(gameInst);
            this.id = '2';
            this.condition = {
                monitoredObject: triggeredCondition.monitoredObject,
                property: triggeredCondition.property,
                happenWhen: triggeredCondition.happenWhen,
                happenWhenRange: triggeredCondition.happenWhenRange,
                inclusive: triggeredCondition.inclusive || false,
                stopProperty: triggeredCondition.stopProperty,
                stopWhen: triggeredCondition.stopWhen,
                tutorialName: triggeredCondition.tutorialName
            }

            this.gameInst = gameInst;
            this.triggerConditions.push(this.condition);
        }

        /**
         * method reponsible to show tutorial
         */
        show() {
            this.animate();
            super.show();
        }

        /**
         * method used to update transparent overlay screen during Animation
         */
        updateShadowTexture() {
            this.gameInst.tutorialDecoration.add(this.lightSprite);
            this.gameInst.tutorialField.add(this.animationRef);

            if (this.animationRef == undefined)
                return;
            this.lightSprite.blendMode = PIXI.blendModes.MULTIPLY;
            if (this.lightSprite != undefined) {
                this.lightSprite.inputEnabled = true;
            }
           /*  working code
	   this.shadowTexture.context.fillStyle = 'rgb(100, 100, 100)';
            this.shadowTexture.context.fillRect(0, 0, this.gameInst.game.width, this.gameInst.game.height);
            this.shadowTexture.context.fill();
            this.shadowTexture.dirty = true;*/
	    
	     this.shadowTexture = this.game.add.graphics(0, 0);
            this.shadowTexture.beginFill(0x000000, 0.5);
            this.shadowTexture.drawRect(0, 0, this.gameInst.game.width, this.gameInst.game.height);
            this.shadowTexture.endFill();
            this.shadowTexture.width = this.game.world.width;
            this.shadowTexture.height = this.game.world.height;
            this.shadowTexture.inputEnabled = true;
            this.gameInst.tutorialSheen.add(this.shadowTexture);
            this.gameInst.referee.events.onInputUp.add(() => {
                this.close();
            })
            this.gameInst.game.world.bringToTop(this.lightSprite.parent);

            if (this.gameInst.key === "NumericGame") {
                /* this.gameInst.game.world.bringToTop(this.gameInst.badGuysGroupX);
 
                 for (let i = 0; i < this.gameInst.badGuysGroupX.length; i++) {
                     if (i != 3) {
                         this.gameInst.badGuysGroupX.getChildAt(i).tint = 0x646464;
                         this.gameInst.badGuysGroupX.getChildAt(i).inputEnabled = false;
                     }
 
                 }*/


            } else {

                for (let i = 0; i < this.gameInst.benchGuyGroup.length; i++) {
                    this.gameInst.benchGuyGroup.getChildAt(i).tint = 0x646464;
                   // this.gameInst.benchGuyGroup.getChildAt(i).inputEnabled = false;

                }
                this.gameInst.bringTutorialOntop(this.shadowTexture.parent);
                this.gameInst.game.world.bringToTop(this.gameInst.referee.parent);
                this.gameInst.game.world.bringToTop(this.animationRef.parent);
            }


        };

        /**
         * method for hand animation
         */
        private animate() {

            this.close();

            let animationSpeed: number = 15;
          /*  if (this.gameInst.key === "NumericGame") {
               // this.animationRef = this.gameInst.game.add.sprite(this.gameInst.groupX.x * 3 + (animationSpeed * 1.5), this.gameInst.groupX.y + 100, 'hand');
                this.animationRef = this.gameInst.game.add.sprite(this.gameInst.referee.x - animationSpeed, this.gameInst.referee.y, 'hand');
            } else {
                this.animationRef = this.gameInst.game.add.sprite(this.gameInst.referee.x - animationSpeed, this.gameInst.referee.y, 'hand');
            }*/
	    
            this.animationRef = this.gameInst.game.add.sprite(this.gameInst.referee.x - animationSpeed, this.gameInst.referee.y, 'hand');
            this.animationRef.alpha = 0.0;
            this.addFingerUpDownAnimation(this.animationRef, animationSpeed, 'down', 1, 12);
            this.addFingerUpDownAnimation(this.animationRef, animationSpeed, 'up', 17, 22);
            this.animationRef.scale.setTo(1.2);
            this.animationRef.scale.x *= -1;
            this.tweenHand = this.gameInst.game.add.tween(this.animationRef);
            this.tweenHand.to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 300);
            this.updateShadowTexture();
            this.tweenHand.onComplete.addOnce(this.onTweenHandAnimation1Complete, this);
        }

        /**
         * method to add animations
         * @param 'animationRef'  image to be animate 
         * @param 'animationSpeed'  speed of the Animation in miliseconds
         * @param 'direction'  animation direction
         * @param 'startFrame'  initial number of frame
         * @param 'endFrame'  last frame number to play
         */
        private addFingerUpDownAnimation(animationRef: any, animationSpeed: number, direction: string, startFrame: number, endFrame: number) {
            animationRef.animations.add(direction, Phaser.Animation.generateFrameNames('hand', startFrame, endFrame, "", 4), animationSpeed, true, false);
        }

        /**
         * method to play hand tap animation
         * @param 'animationRef'  iamge to be animate
         * @param 'animationSpeed'  speed of the animation in miliseconds
         * @param 'animationDirection'  animation direction
         */
        private playUpDownAnimation(animationRef: any, animationSpeed: number, animationDirection: string) {
            animationRef.animations.play(animationDirection, animationSpeed, false);
        }

        /**
         * method to handle hand up animation complete
         */
        private onTweenHandAnimation1Complete() {
            this.playUpDownAnimation(this.animationRef, 15, 'up');
            this.animationRef.animations.currentAnim.onComplete.addOnce(this.onTweenHandAnimation2Complete, this)
        }

        /**
         * method to handle hand down animation complete
         */
        private onTweenHandAnimation2Complete() {
            this.playUpDownAnimation(this.animationRef, 15, 'down');
            this.animationRef.animations.currentAnim.onComplete.addOnce(this.onTweenHandAnimation1Complete, this)
        }

        /**
         * method to destroy animation
         */
        close() {
            if (this.animationRef != undefined) {
                this.shadowTexture.destroy();
                this.lightSprite.destroy();
                this.animationRef.destroy();
            }
        }

    }

    /*export class TutorialThree extends TutorialEngine.TutorialBase {
        //without bind UI Content
    }*/
}