
import { NewStateBase } from './game.state.base'
import { POGGameEngineBase } from '../engine/game.engine.base';
import { ObjectGameEngine } from '../engine/object.game.engine';
import { TutorialEngine } from '../engine/tutorial.engine';
import { Tutorials } from '../tutorial/tutorials';
import { BadGuy } from './badguy.animation';

export class AdditionGame extends NewStateBase {


    // [code review] - should not use fixed value.
    // [code review action] - should change to percentage

    /**
     * A reasonable space between the fields.     
     * */
    compartmentpadding: number = 90;

    /**
     * this variable is used for tutorial masking
     */
    shadowTexture: any;

    /**
     * this variable is used to group goodguy on field
     */
    ggOnFieldGroup: Phaser.Group;

    /**
     * array for the bad guys
     */
    badguys:Array<any>=[];



    /**
     * This function is to initilize the properties needed
     * before the game loads
     */
    init(param: any) {
        super.init(param);
    }

    /**
     * This function will load parent and child assets
     */
    preload() {

        if (this.tutorial1VideoSource !== "") {
            this.loadtutorialVideo(this.tutorial1VideoSource);
        } else {
            this.loadingSplash = false;
            this.loadAssets();
        }

    }
    /**
     * Initialize the game after preloading all the assets and files
     */
    initializeEngine() {

        let initialData = this.userDataServiceCAS.getLevelObjectByID(this.levelID);
        if (initialData !== undefined) {
            //  this.correctAttemptCount =  initialData.correctAttemptCount;
            //  this.attemptCount = initialData.attemptCount;
        }
        this.engine = new ObjectGameEngine(this.game.cache.getJSON('leveldata'));
        this.updateAssignModeAndLevelID();
        this.engine.setup(this.levelID);
        super.create();

        // setting the debug text for testing
        let levelDataBlock = this.dataJSON.levelData.filter((item: any) => { return item.id === this.levelID })[0];
        this.ggOnFieldGroup = this.game.add.group();

        let debugText = "\rCurrent Level: " + this.levelID;
        debugText += "\rAttempts to Complete Level: " + levelDataBlock.iterations;
        debugText += "\rTitle: " + levelDataBlock.title;
        // let text = this.game.add.text(80,0,debugText,{"fontSize":"1em"});
    }
    /**
     * This function will initilize the engine and create teh UI
     */
    create() {

    }

    /**
     * This function will initilize object game good Guy Fields
     */
    initGoodGuyFields() {
        this.goodGuyFields = [];
        var goodGuysFactors = (this.engine as ObjectGameEngine).factors2;
        var numberOfCompartments = goodGuysFactors.length + 1;

        var fieldHeight = (this.BASE_GAME_HEIGHT / 2) - (2 * this.GAME_OFFSET_Y) - this.compartmentpadding;

        var fieldWidth = (this.BASE_GAME_WIDTH - this.BASE_BENCH_WIDTH - (this.compartmentpadding/2)) / numberOfCompartments
        let sprite: Phaser.Sprite;
        let fieldx = 0;
        // creating number of compartments based on the JSON factors 2
        for (var i = 0; i < numberOfCompartments; i++) {

            var field = this.game.add.graphics(0, 0);
            field.lineStyle(this.shadowLine, 0x000000, 0);
            field.drawRect(fieldWidth * i + (this.compartmentpadding / 4), this.partiotionLine.y + this.partiotionLine.height + (this.compartmentpadding / 2), fieldWidth, fieldHeight);

            // field.height = fieldHeight - (this.compartmentpadding + 10); // we need to consider the referee and middle line's space
            field.width = fieldWidth;
            field.data.pos = { x: fieldWidth * i + (this.compartmentpadding / 2), y: this.partiotionLine.y + this.partiotionLine.height + this.compartmentpadding }
            this.goodGuyFields.push(field);
            if (fieldx == 0) {
                fieldx = field.x + field.width
            } else {
                fieldx += field.x + field.width
            }
            if (numberOfCompartments > 1 && (i < (numberOfCompartments - 1)))
                sprite = this.game.add.sprite(fieldx, this.partiotionLine.y, this.dottedLineBM);

            this.dottedLineBMCollection.push(sprite)
        }
    }

    /**
     * This function will initilize object game good Guy group
     */
    initGoodGuyGroup() {
        var goodGuysFactors = (this.engine as ObjectGameEngine).factors2;

        // this array will have all the bad guys generated on the field 
        // to be used as a parameter to animationGuys method
        let collectChilds: any = [];

        var style = { font: "50px font_impact", fill: "black" };

        goodGuysFactors.forEach((ggf, idx) => {

            switch (ggf.spriteType) {

                // Never have value on shirt 
                // WithoutShirt = 0,
                case 0:
                    var padding = 40;
                    var heightCount = 1;
                    for (var i = 0; i < ggf.value; i++) {
                        var goodguy: Phaser.Sprite;
                        goodguy = this.game.add.sprite(0, 0, "GG_WithoutShirt");
                        var scale = 62 / goodguy.width;

                        goodguy.scale.setTo(scale * 2);
                        goodguy.data.value = 1;

                        // first one, new start
                        if (this.goodGuyFields[idx].children.length <= 0) {
                            goodguy.x = this.goodGuyFields[idx].getBounds().x + goodguy.width + padding;
                            goodguy.y = this.goodGuyFields[idx].getBounds().y + (this.goodGuyFields[idx].height / 4);
                        }
                        else // not first one
                        {

                            var lastChild = this.goodGuyFields[idx].children[this.goodGuyFields[idx].children.length - 1] as Phaser.Sprite

                            // how much x distance left between lastChild and right bound of its field?
                            var distanceXleft = this.goodGuyFields[idx].getBounds().x + this.goodGuyFields[idx].getBounds().width - (padding + lastChild.x + lastChild.width + padding);

                            if (distanceXleft > goodguy.width) {
                                goodguy.x = lastChild.x + lastChild.width + padding;
                                goodguy.y = lastChild.y
                            }
                            else {
                                goodguy.x = this.goodGuyFields[idx].getBounds().x + goodguy.width + padding;
                                goodguy.y = lastChild.y + lastChild.height + padding
                                heightCount++;
                            }
                        }
                        goodguy.anchor.setTo(0.5);
                        this.addMudToGuy(goodguy);
                        this.goodGuyGroup.add(goodguy);
                        collectChilds.push(goodguy);
                        this.goodGuyFields[idx].addChild(goodguy);

                    }

                    break;

                // Have value on shirt always
                // WithShirt = 2,
                case 2:
                    var goodguy: Phaser.Sprite;
                    goodguy = this.game.add.sprite(0, 0, "GG_WithShirt");
                    var scale = 62 / goodguy.width;

                    goodguy.scale.setTo(scale * 2);
                    goodguy.anchor.setTo(0.5);
                    goodguy.data.value = ggf.value;

                    let valueText = this.game.add.bitmapText(0, 0, 'font_bold', ggf.value.toString(), 60);
                    valueText.anchor.setTo(0.5, .75);
                    valueText.tint = 0xb55f01

                    goodguy.addChild(valueText);

                    valueText.x = goodguy.centerX;
                    valueText.y += 40;
                    this.addMudToGuy(goodguy);
                    this.goodGuyGroup.addChild(goodguy);
                    collectChilds.push(goodguy);
                    this.goodGuyFields[idx].addChild(goodguy);
                    goodguy.x = this.goodGuyFields[idx].getBounds().x + (this.goodGuyFields[idx].width / 2);
                    goodguy.y = this.goodGuyFields[idx].getBounds().y + (this.goodGuyFields[idx].height / 2);

                    break;

                // Indicative value these are small spec
                // WithSmallSpec = 1, 5, 10, 100
                case 1:
                case 5:
                case 10:
                case 100:
                    var padding = 40;
                    var numberOf100sGuys = 0;
                    var numberOf10sGuys = 0;
                    var numberOf5sGuys = 0;
                    var numberOf1sGuys = 0;

                    if (this.engine.stateLevelJSONBlock.goodGuyTypes.indexOf(100) != -1) {
                        numberOf100sGuys = ggf.value >= 100 ? Math.trunc(ggf.value / 100) : 0;
                    }
                    if (this.engine.stateLevelJSONBlock.goodGuyTypes.indexOf(10) != -1) {
                        numberOf10sGuys = ggf.value - (numberOf100sGuys * 100) >= 10 ? Math.trunc((ggf.value - numberOf100sGuys * 10) / 10) : 0;
                    }
                    if (this.engine.stateLevelJSONBlock.goodGuyTypes.indexOf(5) != -1) {
                        numberOf5sGuys = (ggf.value - (numberOf100sGuys * 100) - (numberOf10sGuys * 10)) >= 5 ? Math.trunc((ggf.value - (numberOf100sGuys * 100) - (numberOf10sGuys * 10)) / 5) : 0
                    }

                    numberOf1sGuys = ggf.value - (numberOf100sGuys * 100) - (numberOf10sGuys * 10) - (numberOf5sGuys * 5);

                    var goodguy: Phaser.Sprite;

                    for (var i = 0; i < numberOf1sGuys; i++) {

                        goodguy = this.game.add.sprite(0, 0, "GG_SmallSpec_1");
                        var scale = 30 / goodguy.width;
                        goodguy.anchor.setTo(0.5);
                        goodguy.scale.setTo(scale * 2);
                        goodguy.data.value = 1;

                        if (this.goodGuyFields[idx].children.length <= 0) {
                            goodguy.x = this.goodGuyFields[idx].getBounds().x + goodguy.width + padding;
                            goodguy.y = this.goodGuyFields[idx].getBounds().y + (this.goodGuyFields[idx].height / 2);
                        }
                        else {
                            var lastChild = this.goodGuyFields[idx].children[this.goodGuyFields[idx].children.length - 1] as Phaser.Sprite
                            goodguy.x = lastChild.x + lastChild.width + padding;
                            goodguy.y = lastChild.y
                        }
                        this.addMudToGuy(goodguy);
                        this.goodGuyGroup.add(goodguy);
                        collectChilds.push(goodguy);
                        this.goodGuyFields[idx].addChild(goodguy);
                    }

                    for (var i = 0; i < numberOf5sGuys; i++) {
                        goodguy = this.game.add.sprite(0, 0, "GG_SmallSpec_5");
                        var scaleWidth = 30 / goodguy.width;
                        var scaleHeight = 150 / goodguy.height;
                        goodguy.anchor.setTo(0.5);
                        goodguy.scale.setTo(scaleWidth * 2, scaleHeight * 2);
                        goodguy.data.value = 5;

                        if (this.goodGuyFields[idx].children.length <= 0) {
                            goodguy.x = this.goodGuyFields[idx].getBounds().x + goodguy.width + padding;
                            goodguy.y = this.goodGuyFields[idx].getBounds().y + (this.goodGuyFields[idx].height / 2);
                        }
                        else {
                            var lastChild = this.goodGuyFields[idx].children[this.goodGuyFields[idx].children.length - 1] as Phaser.Sprite
                            goodguy.x = lastChild.x + lastChild.width + padding;
                            goodguy.y = lastChild.y
                        }
                        this.addMudToGuy(goodguy);
                        this.goodGuyGroup.add(goodguy);
                        collectChilds.push(goodguy);
                        this.goodGuyFields[idx].addChild(goodguy);
                    }

                    for (var i = 0; i < numberOf10sGuys; i++) {
                        goodguy = this.game.add.sprite(0, 0, "GG_SmallSpec_10");
                        var scaleWidth = 30 / goodguy.width;
                        var scaleHeight = 250 / goodguy.height;
                        goodguy.anchor.setTo(0.5);
                        goodguy.scale.setTo(scaleWidth * 2, scaleHeight * 2);
                        goodguy.data.value = 10;

                        if (this.goodGuyFields[idx].children.length <= 0) {
                            goodguy.x = this.goodGuyFields[idx].getBounds().x + goodguy.width + padding;
                            goodguy.y = this.goodGuyFields[idx].getBounds().y + (this.goodGuyFields[idx].height / 2);
                        }
                        else {
                            var lastChild = this.goodGuyFields[idx].children[this.goodGuyFields[idx].children.length - 1] as Phaser.Sprite
                            goodguy.x = lastChild.x + lastChild.width + padding;
                            goodguy.y = lastChild.y
                        }
                        this.addMudToGuy(goodguy);
                        this.goodGuyGroup.add(goodguy);
                        collectChilds.push(goodguy);
                        this.goodGuyFields[idx].addChild(goodguy);
                    }

                    for (var i = 0; i < numberOf100sGuys; i++) {
                        goodguy = this.game.add.sprite(0, 0, "GG_SmallSpec_100");
                        var scale = 250 / goodguy.width;

                        goodguy.anchor.setTo(0.5);
                        goodguy.scale.setTo(scale * 2);
                        goodguy.data.value = 100;

                        if (this.goodGuyFields[idx].children.length <= 0) {
                            goodguy.x = this.goodGuyFields[idx].getBounds().x + goodguy.width + padding;
                            goodguy.y = this.goodGuyFields[idx].getBounds().y + (this.goodGuyFields[idx].height / 2);
                        }
                        else {
                            var lastChild = this.goodGuyFields[idx].children[this.goodGuyFields[idx].children.length - 1] as Phaser.Sprite
                            goodguy.x = lastChild.x + lastChild.width + padding;
                            goodguy.y = lastChild.y
                        }
                        this.addMudToGuy(goodguy);
                        this.goodGuyGroup.add(goodguy);
                        collectChilds.push(goodguy);
                        this.goodGuyFields[idx].addChild(goodguy);
                    }
                    break;
            }

        });

        this.animateGuysFromGroup(collectChilds, "goodguy");
        if (goodGuysFactors.length > 0) {
            this.goodGuyFields.forEach((f) => {
                this.centralizeSpritesInField(f);
            })
        }


    }

    /**
     * This method setup the bad guys compartments. Each bad guy factor will have its own field.  
     */
    initBadGuyFields() {
        this.badGuyFields = [];
        var badGuysFactors = (this.engine as ObjectGameEngine).factors1;
        var numberOfCompartments = badGuysFactors.length;
        var fieldHeight = (this.BASE_GAME_HEIGHT / 2) + (this.compartmentpadding / 2);

        var fieldWidth = (this.BASE_GAME_WIDTH - this.BASE_BENCH_WIDTH - this.compartmentpadding) / numberOfCompartments

        // creating number of compartments based on the JSON factors 1
        let sprite: Phaser.Sprite;
        let fieldx = 0;
        for (var i = 0; i < numberOfCompartments; i++) {
            var field = this.game.add.graphics(0, 0);
            field.lineStyle(this.shadowLine, 0x000000, 0);
            field.drawRect(fieldWidth * i + (this.compartmentpadding / 2), this.GAME_OFFSET_Y, fieldWidth, fieldHeight);

            field.height = fieldHeight - (this.compartmentpadding / 2); // we need to consider the referee and middle line's space
            field.width = fieldWidth;
            this.badGuyFields.push(field);
            if (fieldx == 0) {
                fieldx = field.x + field.width
            } else {
                fieldx += field.x + field.width
            }
            if (numberOfCompartments > 1 && (i < (numberOfCompartments - 1)))
                sprite = this.game.add.sprite(fieldx, field.y, this.dottedLineBM);

            this.dottedLineBMCollection.push(sprite)
        }
    }

    /**
     * This function will initilize object game bad Guy group
     */
    initBadGuyGroup() {

        var badGuysFactors = (this.engine as ObjectGameEngine).factors1;

        var style = { font: "50px font_bold", fill: "black" };
        // this array will have all the bad guys generated on the field 
        // to be used as a parameter to animationGuys method
        let collectChilds: any = [];

        badGuysFactors.forEach((bgf, idx) => {
            // this.badguyin.play();
            switch (bgf.spriteType) {

                // Never have value on shirt 
                // WithoutShirt = 0,
                case 0:
                    var padding = 30;
                    var yPadding = 100;
                    for (var i = 0; i < bgf.value; i++) {
                        // var badguy: Phaser.Sprite;
                        var badguy = new BadGuy(this.game, this.game.world, 'BG_WithoutShirt', true, false, 0, "BG_WithoutShirt");
                        //badguy = this.game.add.sprite(0, 0, "BG_WithoutShirt");
                       // var scale = 62 / badguy.width;

                        // badguy.x = 500;
                        // badguy.y = 600;

                        //this.onAnimationsReady(badguy);
                        badguy.events.onAnimationsReady.add(this.onAnimationsReady);
                        badguy.events.onAnimationComplete.add(this.onAnimationComplete);

                        badguy.startIdle(badguy);
                        badguy.initAccessories('BG_Accessories', false);
                        badguy.initFaceAnimations('BG_Expressions', 'BadGuy_Idle', 'BadGuy_Happy', 'BadGuy_EvilSmile', 'BadGuy_OpenMouth', 'BadGuy_Shocked');
                       
                        // badguy.setValue(10);
                        //badguy.scale.setTo(0.5);

                        //badguy.scale.setTo(scale * 2);
                       // badguy.data.value = 1;
                          this.badguys.push(badguy);
                        // first one, new start
                        if (this.badGuyFields[idx].children.length <= 0) {
                            badguy.x = this.badGuyFields[idx].getBounds().x + badguy.width + padding;                           
                            badguy.y = this.badGuyFields[idx].getBounds().y + (this.badGuyFields[idx].height / 4) + yPadding;
                        }
                        else // not first one
                        {

                            var lastChild = this.badGuyFields[idx].children[this.badGuyFields[idx].children.length - 1] as Phaser.Sprite

                            // how much x distance left between lastChild and right bound of its field?
                            var distanceXleft = this.badGuyFields[idx].getBounds().x + this.badGuyFields[idx].getBounds().width - (padding + lastChild.x + lastChild.width + padding);

                            if (distanceXleft > badguy.width) {
                                badguy.x = lastChild.x + lastChild.width + padding;
                                badguy.y = lastChild.y
                            }
                            else {
                                badguy.x = this.badGuyFields[idx].getBounds().x + badguy.width + padding;
                                badguy.y = lastChild.y + lastChild.height + padding
                            }
                        }
                        let num = this.engine.randomNumberGeneration(0, 1)
                        badguy.data.sound = (num == 0) ? this.badguyin : this.badguyin2;
                        this.badGuyGroup.add(badguy);
                        collectChilds.push(badguy);
                        this.badGuyFields[idx].addChild(badguy);
                        //badguy.anchor.setTo(0.5);
                      
                    }
                    this.game.input.onDown.addOnce((badguys:any) =>{
                           // badguys = this.badguys;
                            //this.happyAnim(badguys);
                            //this.onAnimationsReady(badguys);
                    });
                    //console.log("this.badGuyFields-->",this.badGuyFields);
                    // this.animateGuysFromGroup(collectChilds);
                    break;

                // Have value on shirt always
                // WithShirt = 2,
                case 2:
                   // var badguy: Phaser.Sprite;
                    //badguy = this.game.add.sprite(0, 0, "BG_WithShirt");
                      var badguy = new BadGuy(this.game, this.game.world, 'BG_WithShirt', true, false, 0, "BG_WithShirt");
                    //badguy.anchor.setTo(0.5);
                    var scale = 62 / badguy.width;

                          badguy.events.onAnimationsReady.add(this.onAnimationsReady);
                        badguy.events.onAnimationComplete.add(this.onAnimationComplete);
						badguy.startIdle(badguy);
                        badguy.initAccessories('BG_Accessories', false);
                        badguy.initFaceAnimations('BG_Expressions', 'BadGuy_Idle', 'BadGuy_Happy', 'BadGuy_EvilSmile', 'BadGuy_OpenMouth', 'BadGuy_Shocked');
                    badguy.scale.setTo(scale * 2);
                    badguy.data.value = bgf.value;

                    let valueText = this.game.add.bitmapText(0, 0, 'font_bold', bgf.value.toString(), 60);;//this.game.add.text(0, 0, bgf.value.toString(), style);
                    valueText.anchor.setTo(0.5, 1.5);

                    badguy.addChild(valueText);

                    valueText.x = badguy.centerX;
                    valueText.y += 20;

                    badguy.x = this.badGuyFields[idx].getBounds().x + (this.badGuyFields[idx].width / 2);
                    badguy.y = this.badGuyFields[idx].getBounds().y + (this.badGuyFields[idx].height / 2);
                    badguy.data.sound = this.badguyin;
                    this.badGuyGroup.add(badguy);
                    collectChilds.push(badguy);
                    this.badGuyFields[idx].addChild(badguy);

                     this.badguys.push(badguy);

                    break;

                // Indicative value these are small spec
                // WithSmallSpec = 1, 5, 10, 100
                case 1:
                case 5:
                case 10:
                case 100:
                    var padding = 40;
                     var yPadding = 100;
                    var numberOf100sGuys = 0;
                    var numberOf10sGuys = 0;
                    var numberOf5sGuys = 0;
                    var numberOf1sGuys = 0;

                    if (this.engine.stateLevelJSONBlock.badGuyTypes.indexOf(100) != -1) {
                        numberOf100sGuys = bgf.value >= 100 ? Math.trunc(bgf.value / 100) : 0;
                    }
                    if (this.engine.stateLevelJSONBlock.badGuyTypes.indexOf(10) != -1) {
                        numberOf10sGuys = bgf.value - (numberOf100sGuys * 100) >= 10 ? Math.trunc((bgf.value - numberOf100sGuys * 10) / 10) : 0;
                    }
                    if (this.engine.stateLevelJSONBlock.badGuyTypes.indexOf(5) != -1) {
                        numberOf5sGuys = (bgf.value - (numberOf100sGuys * 100) - (numberOf10sGuys * 10)) >= 5 ? Math.trunc((bgf.value - (numberOf100sGuys * 100) - (numberOf10sGuys * 10)) / 5) : 0
                    }

                    numberOf1sGuys = bgf.value - (numberOf100sGuys * 100) - (numberOf10sGuys * 10) - (numberOf5sGuys * 5);

                    //var badguy: Phaser.Sprite;

                    for (var i = 0; i < numberOf1sGuys; i++) {

                       // badguy = this.game.add.sprite(0, 0, "BG_SmallSpec_1");
                        var badguy = new BadGuy(this.game, this.game.world, 'BG_SmallSpec_1', true, false, 0, "BG_SmallSpec_1");
                        var scale = 30 / badguy.width;
                        //badguy.anchor.setTo(0.5);

                              badguy.events.onAnimationsReady.add(this.onAnimationsReady);
                        badguy.events.onAnimationComplete.add(this.onAnimationComplete);
						badguy.startIdle(badguy);
                        badguy.initAccessories('BG_Accessories', false);
                        badguy.initFaceAnimations('BG_Expressions', 'BadGuy_Idle', 'BadGuy_Happy', 'BadGuy_EvilSmile', 'BadGuy_OpenMouth', 'BadGuy_Shocked');

                        badguy.scale.setTo(scale * 2);
                        badguy.data.value = 1;

                        if (this.badGuyFields[idx].children.length <= 0) {

                            badguy.x = this.badGuyFields[idx].getBounds().x + badguy.width + padding;
                            badguy.y = this.badGuyFields[idx].getBounds().y + (this.badGuyFields[idx].height / 2) + yPadding;
                        }
                        else {
                            var lastChild = this.badGuyFields[idx].children[this.badGuyFields[idx].children.length - 1] as Phaser.Sprite
                            badguy.x = lastChild.x + lastChild.width + padding;
                            badguy.y = lastChild.y
                        }
                        badguy.data.sound = this.badguyin;
                        this.badGuyGroup.add(badguy);
                        collectChilds.push(badguy);
                        this.badGuyFields[idx].addChild(badguy);
                         this.badguys.push(badguy);
                    }

                    for (var i = 0; i < numberOf5sGuys; i++) {
                       // badguy = this.game.add.sprite(0, 0, "BG_SmallSpec_5");
                        var badguy = new BadGuy(this.game, this.game.world, 'BG_SmallSpec_5', true, false, 0, "BG_SmallSpec_5");
                        var scale = 30 / badguy.width;
                       // var scaleWidth = 30 / badguy.width;
                        //var scaleHeight = 150 / badguy.height;
                        //badguy.anchor.setTo(0.5);

                              badguy.events.onAnimationsReady.add(this.onAnimationsReady);
                        badguy.events.onAnimationComplete.add(this.onAnimationComplete);
						badguy.startIdle(badguy);
                        badguy.initAccessories('BG_Accessories', false);
                        badguy.initFaceAnimations('BG_Expressions', 'BadGuy_Idle', 'BadGuy_Happy', 'BadGuy_EvilSmile', 'BadGuy_OpenMouth', 'BadGuy_Shocked');
                       // badguy.scale.setTo(scaleWidth * 2, scaleHeight * 2);
                        badguy.scale.setTo(scale * 2);
                        badguy.data.value = 5;

                        if (this.badGuyFields[idx].children.length <= 0) {
                            badguy.x = this.badGuyFields[idx].getBounds().x + badguy.width + padding;
                            badguy.y = this.badGuyFields[idx].getBounds().y + (this.badGuyFields[idx].height / 2) + yPadding;
                        }
                        else {
                            var lastChild = this.badGuyFields[idx].children[this.badGuyFields[idx].children.length - 1] as Phaser.Sprite
                            badguy.x = lastChild.x + lastChild.width + padding;
                            badguy.y = lastChild.y
                        }
                        badguy.data.sound = this.badguyin;
                        this.badGuyGroup.add(badguy);
                        collectChilds.push(badguy);
                        this.badGuyFields[idx].addChild(badguy);
                         this.badguys.push(badguy);
                    }

                    for (var i = 0; i < numberOf10sGuys; i++) {
                       // badguy = this.game.add.sprite(0, 0, "BG_SmallSpec_10");
                        var badguy = new BadGuy(this.game, this.game.world, 'BG_SmallSpec_10', true, false, 0, "BG_SmallSpec_10");
                        var scaleWidth = 30 / badguy.width;
                        var scaleHeight = 250 / badguy.height;
                       // badguy.anchor.setTo(0.5);
                             badguy.events.onAnimationsReady.add(this.onAnimationsReady);
                        badguy.events.onAnimationComplete.add(this.onAnimationComplete);
						badguy.startIdle(badguy);
                        badguy.initAccessories('BG_Accessories', false);
                        badguy.initFaceAnimations('BG_Expressions', 'BadGuy_Idle', 'BadGuy_Happy', 'BadGuy_EvilSmile', 'BadGuy_OpenMouth', 'BadGuy_Shocked');


                        badguy.scale.setTo(scaleWidth * 2, scaleHeight * 2);
                        badguy.data.value = 10;

                        if (this.badGuyFields[idx].children.length <= 0) {
                            badguy.x = this.badGuyFields[idx].getBounds().x + badguy.width + padding;
                            badguy.y = this.badGuyFields[idx].getBounds().y + (this.badGuyFields[idx].height / 2) + yPadding;
                        }
                        else {
                            var lastChild = this.badGuyFields[idx].children[this.badGuyFields[idx].children.length - 1] as Phaser.Sprite
                            badguy.x = lastChild.x + lastChild.width + padding;
                            badguy.y = lastChild.y + yPadding;
                        }
                        badguy.data.sound = this.badguyin;
                        this.badGuyGroup.add(badguy);
                        collectChilds.push(badguy);
                        this.badGuyFields[idx].addChild(badguy);
                         this.badguys.push(badguy);
                    }

                    for (var i = 0; i < numberOf100sGuys; i++) {
                       // badguy = this.game.add.sprite(0, 0, "BG_SmallSpec_100");
                        var badguy = new BadGuy(this.game, this.game.world, 'BG_SmallSpec_100', true, false, 0, "BG_SmallSpec_100");
                        var scale = 250 / badguy.width;

                        //badguy.anchor.setTo(0.5);
                              badguy.events.onAnimationsReady.add(this.onAnimationsReady);
                        badguy.events.onAnimationComplete.add(this.onAnimationComplete);
						badguy.startIdle(badguy);
                        badguy.initAccessories('BG_Accessories', false);
                        badguy.initFaceAnimations('BG_Expressions', 'BadGuy_Idle', 'BadGuy_Happy', 'BadGuy_EvilSmile', 'BadGuy_OpenMouth', 'BadGuy_Shocked');
                        badguy.scale.setTo(scale * 2);
                        badguy.data.value = 100;

                        if (this.badGuyFields[idx].children.length <= 0) {
                            badguy.x = this.badGuyFields[idx].getBounds().x + badguy.width + padding;
                            badguy.y = this.badGuyFields[idx].getBounds().y + (this.badGuyFields[idx].height / 2) + yPadding;
                        }
                        else {

                            var lastChild = this.badGuyFields[idx].children[this.badGuyFields[idx].children.length - 1] as Phaser.Sprite
                            badguy.x = lastChild.x + lastChild.width + padding;
                            badguy.y = lastChild.y + yPadding;
                        }
                        badguy.data.sound = this.badguyin;
                        this.badGuyGroup.add(badguy);
                        collectChilds.push(badguy);
                        this.badGuyFields[idx].addChild(badguy);
                         this.badguys.push(badguy);
                    }
                    break;
            }
        });


        //Animation the bad guys when appearing on the stage         
        this.animateGuysFromGroup(collectChilds);

        if (badGuysFactors.length > 0) {
            this.badGuyFields.forEach((f) => {
                this.centralizeSpritesInField(f);
            })
        }




    }

    /**
     * This function return the most left sprite item from a goodguy or badguy field
     */
    private getMostLeftSpriteXFromField(field: Phaser.Graphics): number {

        var sprite: Phaser.Sprite;

        for (var i = 0; i < field.children.length; i++) {
            if (sprite == null || sprite.x > (field.children[i] as Phaser.Sprite).x) {
                sprite = field.children[i] as Phaser.Sprite
            }
        }

        return sprite != null ? sprite.x : null;

    }

    /**
     * This function return the most left sprite item from a goodguy or badguy field
     */
    private getMostRightSpriteFromField(field: Phaser.Graphics) {
        var sprite: Phaser.Sprite;

        for (var i = 0; i < field.children.length; i++) {
            if (sprite == null || sprite.x < (field.children[i] as Phaser.Sprite).x) {
                sprite = field.children[i] as Phaser.Sprite
            }
        }

        return sprite != null ? sprite.x + sprite.width : null;
    }

    /**
     * This function return the center X of Spritesfrom gdodguy or badguy field
     */
    private centralizeSpritesInField(field: Phaser.Graphics) {
        if (field.children.length <= 1) return;
        var spritesCenterX = (this.getMostRightSpriteFromField(field) - this.getMostLeftSpriteXFromField(field)) / 2

        var fieldCenterX = field.getBounds().width / 2 - spritesCenterX;
        var diff = fieldCenterX - spritesCenterX;

        field.children.forEach((c: Phaser.Sprite) => {
            c.x += fieldCenterX - this.compartmentpadding; // remove preadded padding 
        });
    }

    /**
     * this method will called when user release the good guy
     * dragged from bench on the feild area
     * @param {sprite}  the object which is dragged and generates the event
     * @param {pointer}  cursor position of the mouse where user release the dragged object 
     */
    benchGuyDragStopped(sprite: Phaser.Sprite, pointer: Phaser.Pointer) {        
        // getting the target field where good guys can be dropped
        
        if( sprite && pointer !== undefined){
            let targetField = this.goodGuyFields[this.goodGuyFields.length - 1];

            var checkOverLap = this.checkZoneIntersects(sprite, targetField);
            var checkOverLapWithLine = this.checkZoneIntersects(sprite, this.partiotionLine);
            var checkOverLapWithReferee = this.checkZoneIntersects(sprite, this.referee);
            var checkOverLapWithGGOnFiels = this.checkZoneIntersectsWithGroupItems(sprite, this.userAnswerArray);            

            // sprite bound check for different type of guys as height for the 5,10,100 
            let spriteBoundY = sprite.data.metaData.actor.spriteType > 2 ? (sprite.getBounds().y + sprite.getBounds().height) : (sprite.getBounds().y + sprite.getBounds().height)

            // checking overlap with refree, partition line, good guy field bound to drop the good guy correctly
            if (!checkOverLap || checkOverLapWithGGOnFiels.overLap || checkOverLapWithLine || checkOverLapWithReferee || sprite.y < targetField.y || sprite.getBounds().x < targetField.getBounds().x || ((spriteBoundY) > (targetField.getBounds().y + targetField.getBounds().height)) || ((sprite.getBounds().x + sprite.getBounds().width) > (targetField.getBounds().x + targetField.getBounds().width))) {
                var tween = this.game.add.tween(sprite);
                tween.to({ x: sprite.data.benchPosition.x, y: sprite.data.benchPosition.y }, 500, Phaser.Easing.Bounce.Out, true, 100);
                let item = this.removeSpriteArray(sprite.data.name);
                sprite.data.addedToField = false;
                this.goodguyout.play();                
            } else {               
                if (!sprite.data.addedToField) {                    
                    sprite.data.addedToField = true;
                    this.drop.play();
                    this.addGuyOnTheField(sprite, pointer);                
                }
            }
        }
        
    }



    /**
     * add / replicate the good guy on the good guy field area
     * @param sprite  an object that need to be replicated
     * @param pointer  to position the element on the pointer location
     */
    addGuyOnTheField(sprite: Phaser.Sprite, pointer: Phaser.Pointer) {
        // adding replica of the guy using the sprite cacheKey
        let ggOnField = this.game.add.sprite(0, 0, sprite.data.cacheKey);
        // debugger;
        // getting the U bench element from the fields
        let targetField = this.goodGuyFields[this.goodGuyFields.length - 1];
        ggOnField.anchor.setTo(0.5, 0.5)
        ggOnField.position.x = pointer.x - targetField.x;
        ggOnField.position.y = pointer.y - targetField.y;
        if(sprite.data.metaData.actor.spriteType == 100){
            if(ggOnField.position.y < this.partiotionLine.y + sprite.height || ggOnField.position.y > targetField.getBounds().y + sprite.height){
                ggOnField.position.y = this.partiotionLine.y + sprite.height + 20;
            }
            if(ggOnField.position.x < sprite.getBounds().width - targetField.x){            
                ggOnField.position.x = sprite.getBounds().width - targetField.x;            
            }
            if(ggOnField.position.x + sprite.width > this.benchField.getBounds().x){
                ggOnField.x = this.game.width  - (this.benchField.getBounds().width + sprite.width);
            }
        }
        if(sprite.data.metaData.actor.spriteType == 10){
            if(ggOnField.position.y < this.partiotionLine.y + sprite.height || ggOnField.position.y > targetField.getBounds().y + sprite.height){
                ggOnField.position.y = this.game.height - sprite.height + 100;
            }
        }
        if(sprite.data.metaData.actor.spriteType == 5){
            if(ggOnField.position.y < this.partiotionLine.y + sprite.height){
                //console.log("less",ggOnField.position.y);
                ggOnField.position.y = this.partiotionLine.y + sprite.height;
            }
            if( ggOnField.position.y + sprite.height > this.game.height){
                //console.log("greater",ggOnField.position.y);
                ggOnField.position.y = this.game.height - sprite.height;
            }
        } 
        ggOnField.scale.setTo((sprite.data.metaData.actor.benchWidth / ggOnField.width) * 2)
        ggOnField.data.parent = sprite;
        ggOnField.data.name = "GG_" + (this.goodGuyOnFieldCounter++);

        ggOnField.inputEnabled = true;
        ggOnField.data.id = sprite.data.id;
        ggOnField.data.value = sprite.data.value;
        ggOnField.data.spriteType = sprite.data.metaData.actor.spriteType;
        ggOnField.input.useHandCursor = true;
        ggOnField.input.enableDrag(false);
        this.scaledDrag(ggOnField, "gg");
        ggOnField.events.onInputDown.add((me: Phaser.Sprite) => {
            this.game.world.bringToTop(targetField);
            this.game.world.bringToTop(ggOnField);
        });

        //dirt effect
        let dirt = this.game.add.sprite(ggOnField.getBounds().x, ggOnField.getBounds().y, "dirt");
        //dirt.scale.setTo(.5);
        dirt.anchor.x = 0.2;

        //setting the dirt position
        switch(sprite.data.cacheKey){
            case "GG_SmallSpec_1":  dirt.anchor.y = -1.2;
                                    break;
            case "GG_SmallSpec_5":  dirt.anchor.y = -8;
                                    break;
            case "GG_SmallSpec_10":  dirt.anchor.y = -16.5;
                                    break;
            case "GG_SmallSpec_100": dirt.anchor.x = -2.5;
                                     dirt.anchor.y = -16.5;  ;
                                    break;
             case "GG_WithShirt": dirt.anchor.y = -1.2;
                                    break;
              case "GG_WithoutShirt": dirt.anchor.y = -1.2;
                                    break;
        }
            

        /*if(sprite.data.cacheKey == 'GG_SmallSpec_5'){
            dirt.anchor.y = -8;    
        }else if(sprite.data.cacheKey == 'GG_SmallSpec_100'){
             dirt.anchor.x = -2.5;
             dirt.anchor.y = -16.5;  
        }else{
            dirt.anchor.y = -1.2;
        }*/
        
        dirt.x = ggOnField.getBounds().x;
        dirt.y = ggOnField.getBounds().y;
        dirt.scale.setTo(1.75);
        ggOnField.data.dirt = dirt.animations.add('puf', Phaser.Animation.generateFrameNames('smoke', 0, 17, '', 4), 24);
        //this.game.world.swap(goodguy, dirt);
        let ggClone:Phaser.Sprite = this.game.add.sprite(0, 0, sprite.data.cacheKey);
        ggClone.anchor.setTo(0.5);
        ggOnField.addChild(dirt);
        ggOnField.addChild(ggClone);
        dirt.z = 0;
        ggClone.z = 10;

        //console.log("GG CLONE",ggOnField)

        this.game.world.bringToTop(ggOnField);
        ggOnField.data.dirt.play('puf');

        //console.log("dirt goodguy-->", dirt);
        // setting drag stop event for the guys dropped on field by the user
        ggOnField.events.onDragStop.add((goodguy: Phaser.Sprite) => {

            var checkOverLap = this.checkZoneIntersects(goodguy, this.goodGuyFields[this.goodGuyFields.length - 1]);
            var checkOverLapWithGGOnFiels = this.checkZoneIntersectsWithGroupItems(goodguy, this.userAnswerArray, "field");
            var checkOverLapWithLine = this.checkZoneIntersects(goodguy, this.partiotionLine);
            var checkOverLapWithReferee = this.checkZoneIntersects(goodguy, this.referee);


            //console.log("checkOverLap = ", checkOverLap, "checkOverLapWithLine = ", checkOverLapWithLine, "checkOverLapWithReferee = ", checkOverLapWithReferee, "checkOverLapWithGGOnFiels = ", checkOverLapWithGGOnFiels);

            // sprite bound check for different type of guys as height for the 5,10,100
            let spriteBoundY = goodguy.data.spriteType > 2 ? (goodguy.getBounds().y + goodguy.getBounds().height) : (goodguy.getBounds().y + goodguy.getBounds().height)

            // checking overlap with refree, partition line, good guy field bound to drop the good guy correctly
            if (!checkOverLap || checkOverLapWithGGOnFiels.overLap || checkOverLapWithLine || checkOverLapWithReferee || goodguy.y < targetField.y || goodguy.getBounds().x < targetField.getBounds().x || ((spriteBoundY) > (targetField.getBounds().y + targetField.getBounds().height)) || ((goodguy.getBounds().x + goodguy.getBounds().width) > (targetField.getBounds().x + targetField.getBounds().width))) {

                let myParent = goodguy.data.parent;
                let item = this.removeSpriteArray(goodguy.data.name);
                let tween = this.game.add.tween(goodguy);
                tween.to({ x: goodguy.data.parent.x + this.benchField.getBounds().x, y: goodguy.data.parent.y, alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 100);
                this.game.add.tween(goodguy.scale).to({ x: 0, y: 0 }, 500, Phaser.Easing.Linear.None, true);
                this.goodguyout.play();
                tween.onComplete.addOnce((e: Phaser.Tween) => {
                    goodguy.destroy();
                    if (!myParent.data.infinite) {
                        myParent.visible = true;
                        this.rearrangeBenchGuys("shownext", myParent.data.metaData);
                    }
                });
                this.enableOrDisableReferee();
            } else {
                if (goodguy.y < targetField.y) {
                    goodguy.y = targetField.getBounds().y + this.compartmentpadding;
                }
                this.drop.play();
                ggOnField.data.dirt.play('puf');
            }
        })
        
        // setting text on the shirt of guys
        if (sprite.data.metaData.actor.spriteType == 2) {
            let valueText = this.game.add.bitmapText(0, 0, 'font_bold', sprite.data.metaData.actor.value.toString(), 60);
            valueText.anchor.setTo(0.5, -0.05);
            valueText.tint = 0xb55f01
            ggOnField.addChild(valueText);
        }

        // adding good guy to the good guy field
        this.game.world.bringToTop(ggOnField)
        this.userAnswerArray.push(ggOnField);

        // sending back the sprite to its original position
        sprite.x = sprite.data.benchPosition.x;
        sprite.y = sprite.data.benchPosition.y;

        // keeping the guy hidden if it is not infintely draggable
        if (!sprite.data.infinite) {
            sprite.visible = false;
            this.rearrangeBenchGuys("reshuffle", sprite);
        }
        // reset the property false so that the sprite can be added again on the field
        sprite.data.addedToField = false;
        // changing the y of the good guy to keep it below the partition line
        // checking if the guys sprite type is greater than 2 (5,10,100)
        if (ggOnField.y < targetField.getBounds().y && (ggOnField.data.spriteType > 2)) {
            ggOnField.y = targetField.getBounds().y;
        }

        // adding the good guy on the U (target) field
        //targetField.addChild(ggOnField);
        this.ggOnFieldGroup.add(ggOnField);
        this.enableOrDisableReferee();

    }

    /**
     * this method will called when user clicks on referee 
     * and the answer is correct
     */

    refereePlayWin() {
        this.shockedAnim(this.badguys);
        super.refereePlayWin();
    }

    /**
     * this method will called when user clicks on referee 
     * and the answer is wrong
     */
    refreePlayLose() {
        this.happyAnim(this.badguys);
        super.refreePlayLose();
    }

    /**
     * 
     * @param toMenu  boolean clears all the objects from the stage
     * initialize all the required properties ready to load the next level
     */
    clearStage(toMenu?: boolean) {
        if (this.correctAttemptCount === Number(this.engine.setAttempts())) {
            console.log("SHOWING GAME OVER SCREEN");
           
            this.correctAttemptCount = 0;
            this.attemptCount = 0;
            if (toMenu == undefined)
                this.showGameOverScreen();
            
            this.saveLevelInfo()
        } else {
            if (toMenu == undefined) {
                console.log("reshuffle GAME OVER SCREEN");
                this.clearAllFromScreen();
                this.engine.setup(this.engine.currentLevelID);
                super.createOnReshuffle();
            }
        }
       
    }

    /**
     * clears all the objects from the stage and reinitialize all properties of the state 
     * to ready to load the next level
     */
    clearAllFromScreen(){
        this.game.tweens.removeAll();
        this.goodGuyOnFieldCounter = 0;
        this.userAnswerArray.length = 0;
        this.badGuyFields.forEach((fields: any) => {
            fields.children.forEach((e: any) => {
                e.destroy();
            });
            fields.destroy();
        });

        this.goodGuyFields.forEach((fields: any) => {
            fields.children.forEach((e: any) => {
                e.destroy();
            });
            fields.destroy();
            this.ggOnFieldGroup.destroy();
        });
        this.benchField.children.forEach((fields: any) => {
            fields.children.forEach((e: any) => {
                e.kill();
            });
        });
        this.benchField.clear();
        this.refereeField.children.forEach((fields: any) => {
            fields.children.forEach((e: any) => {
                e.destroy();
            });
            fields.destroy();
        });
        this.benchGuyGroup.removeAll();
        this.rewardsGroup.destroy(true);
        if (this.animationGuysSprite.length > 0) {
            for (let i = 0; i < this.animationGuysSprite.length; i++) {
                this.animationGuysSprite[i].animations.currentAnim.stop();
                this.animationGuysSprite[i].animations.currentAnim.onLoop.removeAll();
                this.animationGuysSprite[i].kill();
            }
        }
        this.animationGuysSprite.length = 0;
        if (this.dottedLineBMCollection.length > 0) {
            for (let a = 0; a < this.dottedLineBMCollection.length; a++) {
                if (this.dottedLineBMCollection[a] !== undefined)
                    this.dottedLineBMCollection[a].destroy();
            }
        }

         this.ggOnFieldGroup = this.game.add.group();

    }

    /**
     * this method will be playing referee animations
     * @param key_Name  name of the sprite
     * @param Animation_Name  Animation's Frame name which is to be play
     */
    refereeAnim(key_Name: string, Animation_Name: string) {
        this.referee.destroy();
        this.referee = this.game.add.sprite(this.refereeXpos, this.refereeYpos, key_Name);
        this.referee.scale.setTo(1.5);
        this.referee.anchor.setTo(1, 0.5);
        if (Animation_Name === "referee_ggWin") {
            //this.sfx.play("win");
        } else {
            this.lose.play();
        }
        this.referee.animations.add(Animation_Name);
        this.referee.animations.currentAnim.onComplete.addOnce(() => {
            //if(!this.gameOverScreenGroup.visible)
            // setTimeout(this.initRefreeField(), 1500);
        });
        this.referee.animations.play(Animation_Name, 15, false, false);

        //adding referee Animation to group for resizing
        this.refereeField.add(this.referee);

    }

    /**
     * this method will calculate user answer's value
     * @param userAnswer  user's Answer Array
     */
    calculateTotalValue(userAnswer: Array<any>): number {

        // variable storing total value for userAnswersArray
        let userAnswerTotalValue: number = 0;

        //Calculating total value of userAnswerArray
        for (let i = 0; i < this.userAnswerArray.length; i++) {
            let totalValue = this.userAnswerArray[i].data.value;
            userAnswerTotalValue = userAnswerTotalValue + totalValue;
        }
        return userAnswerTotalValue;
    }

    /**
     * this method will setup the tutorial conditions
     * need to be in the state class as presentation for object and numeral 
     * game are different
     */
    setUpTutorial() {

        let setTuts = (this.engine as POGGameEngineBase.NewEngineBase).setTutorial();

        var tutIndex: Array<any> = [];
        setTuts.forEach(function (ele, i) {
            if (ele == true) {
                tutIndex.push("T" + (i + 1));
            }
        });

        let triggeredCondition: any = {};
        this.tutorialEngine.tutorials = [];


        // need to be in the state class as presentation for object and numeral 
        // game is different
        for (let i = 0; i < tutIndex.length; i++) {
            switch (tutIndex[i]) {
                case "T1":

                    break;
                case "T2":

                    triggeredCondition.monitoredObject = this.userAnswerArray;
                    triggeredCondition.property = "length";
                    triggeredCondition.happenWhen = 0;
                    triggeredCondition.inclusive = true;
                    triggeredCondition.stopProperty = "length";
                    triggeredCondition.stopWhen = 1;
                    triggeredCondition.tutorialName = "T2";
                    let tutorialtwo = new Tutorials.TutorialTwo(this, triggeredCondition);
                    tutorialtwo.onceOff = true;

                    this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
                    tutorialtwo.shadowTexture = this.shadowTexture

                    tutorialtwo.lightSprite = this.game.add.image(0, 0, this.shadowTexture);
                    tutorialtwo.animationSpeed = 15;
                    tutorialtwo.scale = 0.15;
                    this.tutorialEngine.tutorials.push(tutorialtwo);

                    break;
                case "T3":

                    triggeredCondition = {};
                    triggeredCondition.monitoredObject = this.userAnswerArray;
                    triggeredCondition.property = "length";
                    triggeredCondition.happenWhen = 1;
                    triggeredCondition.tutorialName = "T3";
                    triggeredCondition.inclusive = true;
                    triggeredCondition.stopProperty = false;
                    triggeredCondition.stopWhen = true;
                    let tutorialThree = new Tutorials.TutorialThree(this, triggeredCondition);
                    tutorialThree.onceOff = true;

                    this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
                    tutorialThree.shadowTexture = this.shadowTexture

                    tutorialThree.lightSprite = this.game.add.image(0, 0, this.shadowTexture);
                    this.tutorialEngine.tutorials.push(tutorialThree);

                    break;
                case "T4":
                    break;
                case "T5":
                    break;

            }
        }
    }

    /**
     * 
     * @param t when animation ready for the bad guys on stage play the first idle animation
     */
    onAnimationsReady(t:any) {
       
        //t.stopAnims();
      console.log("badguy i t-->",t);
        t.startIdle(t);
    }

    /**
     * calls when any of the bad guy animation gets completed
     * @param e 
     * @param t 
     */
    onAnimationComplete(e: any, t: any) {
      try{
        if(e == t.ANIMATION_IDLE || t.ANIMATION_EVIL) {
            t.startIdle(t);
        }
        else if (e == t.ANIMATION_OPEN) {
            t.startIdle(t);
        }
        else if (e == t.ANIMATION_HAPPY) {
            t.startIdle(t);
        }
        else if (e == t.ANIMATION_SHOCKED) {
            t.startIdle(t);
        }
      }catch(e){}
    }

    /**
     * 
     * @param badguys show happy faced of the good guys and start animaition of jumping
     */   
    happyAnim(badguys:any){
        console.log("tbadGuyFields-->", this.badguys.length, badguys.length);                 
        for (var guy of this.badguys) {
            guy.events.onAnimationComplete.remove(this.onAnimationComplete);
            guy.startHappy(guy,this.game);
        }
        /*this.game.input.onDown.addOnce((badguys:any)=>{
            badguys = badguys;
            this.shockedAnim(badguys);
        });*/
    }

    /**
     * 
     * @param badguys show shocked faces of bad guys when they lose
     */
    shockedAnim(badguys:any){
        for (var guy of this.badguys) {
            guy.events.onAnimationComplete.remove(this.onAnimationComplete);
            guy.startShocked(guy,this.game);
        }
        /*this.game.input.onDown.addOnce((badguys:any) => {

            this.happyAnim(badguys);
        });*/
    }
    
    onAnimationsStopped(t: any) {
        //t.startHappy();
    }

    
}
