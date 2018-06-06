import { NewStateBase } from './game.state.base'
import { POGGameEngineBase } from '../engine/game.engine.base';
import { NumericGameEngine } from '../engine/numeric.game.engine';
import { TutorialEngine } from '../engine/tutorial.engine';
import { Tutorials } from '../tutorial/tutorials';

export class NumericGame extends NewStateBase {

    /** Game Engine object to get the JSON and other Utitlity functions*/
    gameEngine: any;

    /* Group for ScoreBoard */
    scoreBoard: Phaser.Group;

    /* Number of attempts */
    totalAttempts: number;

    /* A reasonable space between the fields.*/
    compartmentpadding: number = 60;

    /* Store the game operation type.*/
    operationType: string;

    /* this variable is used for tutorial masking */
    shadowTexture: any;

    /** tutorial Count */
    gameOncePlayed: boolean = false;
    //regroupingGuys: Array<any> = [];

    /** carrylevel for substraction*/
    carryOverLevelOneArray: Array<any>;
    carryOverLevelTwoArray: Array<any>;



    /** carry over one level position */
    carryOverLevelOnePositionArray: Array<any>;

    /** carry over two level position */
    carryOverLevelTwoPositionArray: Array<any>;

    /** this variable is used for holding badguysLength  */
    badguysLegth: number;

    /** this variable is used for holding x value  */
    xValueString: string;

    /** this variable is used for holding x value  */
    yValueString: string;

    /*** this hold the answer length */
    goodguyAnswer: any;


    /* this variable is used for holding carryforward */
    carryForward: any;


    /***Factors length */
    factorLength: number;

    /*set difference padding*/
    setPading: number;

    /*padding */
    padding: number;


    /*set the field Width*/
    fieldWidth: number;

    /*set the field Height*/
    fieldHeight: number;

    /*no of compartments*/
    numberOfCompartments: number = 6;

    /*bitmapText for badguys*/
    textSize: number = 90;

    /*bitmapText for badguys*/
    //goodGuyTextSize: number = 80;
    guyTextSize: number = 60;

    /*bitmapText for goodguys*/
    dotSize: number = 140;
    //dotSize: number = 240;

    /** common variable for GG and BG dimension */
    guysHeight: number = 124;
    guysWidth: number = 124;



    /*set gap for carryforward */
    setGap: number;

    /*set text for symbol plus and minus*/
    xtext: Phaser.BitmapText;
    ytext: Phaser.BitmapText;
    utext: Phaser.BitmapText;
    yOps: Phaser.BitmapText;

    answerGroup: Phaser.Group;

    /*store goodguy y position */
    goodguyPositionY: number;
    goodguyPositionX: number;

    goodguyFieldPosition: number;

    /*store null position */
    nullPosition: number;

    /*store goodguy dot*/
    goodguyDot: any;

    /*store the group collection*/
    allGuysGroupCollection: Array<Phaser.Group>;

    /*store the regrouping length*/
    regroupinglength: number;

    /*Money symbol array*/
    symbolCollection: Array<any>;

    /*store the null postion index number*/
    setNull: number;

    /*store the x postion of all badguys from all badguy group */
    guysxPosition: Array<any>;

    /*store the x postion of all goodguys from all goodguy group */
    gguysxPosition: Array<any>;

    /*store the badguys group length from all badguy group */
    getBadguylength: Array<any>;

    /*store the goodguy group guys length */
    getGoodguylength: Array<any>;

    /*store the symbol positionfor groupU */
    symbolU: number;

    /*store the symbol positionfor bad guys group */
    symbolX: number = 0;

    /*store the boolean value for animation */
    animationStop: boolean = true;

    /*set the gap between two sprites */
    xGap: number = 30;

    /*set the cross line height and width for badguys */
    crossLineWH: number = 180;

    /*set the cross line height and width for carryover guys */
    carryOverClineWH: number = 90;

    /*set the glow line height and width for bad guys */
    glowlineWH: number = 190;

    /*set the carry forward font size */
    carryForwardFontSize: number = 80;

    /*set the text size for symbol */
    //symbolTextSize = 120;

    /*set the goodguy dot size*/
    //ggDotSize:number = 180;
    ggDotSize: number = 100;

    //counter for highLight colums for addition
    regroupCounter: number = 0;

    /**decimal point position */
    decimalPosition: number = 0;

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
    * This function will initilize the engine
    */
    initializeEngine() {
        let initialData = this.userDataServiceCAS.getLevelObjectByID(this.levelID);
        if (initialData !== undefined) {
            // this.correctAttemptCount = initialData.correctAttemptCount;
            //this.attemptCount = initialData.attemptCount;
        }
        this.engine = new NumericGameEngine(this.game.cache.getJSON('leveldata'));
        this.gameEngine = this.engine;
        this.updateAssignModeAndLevelID();
        this.engine.setup(this.levelID);
        // super.create();
        this.scoreBoard = this.game.add.group();
        this.gameEngine.scoreBoard = this.scoreBoard;
        this.gameEngine.setScoreBoardAttempts(this.totalAttempts);
        //this.operationType = this.engine.operationType;
        this.operationType = this.engine.sign;

        this.carryOverLevelOneArray = [];
        this.carryOverLevelTwoArray = [];

        super.create();
        //this.carryOverGuys = this.game.add.group();

    }

    /**
    * This function is the default create function of phaser
    */
    create() {

    }

    /**
    * This function will initilize object game good Guy Fields
    */
    initGoodGuyFields() {

    }

    /**
     * This function will initilize object game good Guy group
     */
    initGoodGuyGroup() {
        this.getGoodguylength = [];
        let goodGuysFactors: any = this.gameEngine.unknownAnswer.toString().split("");
        this.goodGuysArray = new Array(6 - goodGuysFactors.length);
        this.goodGuysArray = this.goodGuysArray.concat(goodGuysFactors);
        this.goodGuysArray = this.createGoodguyArray();
        //adding goodguy group
        this.groupU = this.game.add.group();
        let xPos = 0;

        let partiotionLineMarginBottom = 130;
        let id = 0;
        let dotSprite = null;
        var count = -1;
        for (let i = 0; i < this.goodGuysArray.length; i++) {
            let goodguy: Phaser.Sprite = this.game.add.sprite(xPos, 0, "GG_WithShirt");
            if (this.setNull !== -1 && this.setNull < 5) {
                goodguy.anchor.setTo(0.5, 0.8);
            } else {
                goodguy.anchor.setTo(0.5, 0.5);
            }

            goodguy.height = this.guysHeight;
            goodguy.width = this.guysHeight;
            goodguy.visible = false;
            if (this.goodGuysArray[i] !== null) {

                goodguy.data.id = id;
                goodguy.alpha = 0;
                id++;
                count++;
                let goodguyDot = this.game.add.bitmapText(0, 0, 'font_bold', ".", this.ggDotSize);
                goodguyDot.visible = false;
                goodguyDot.alpha = 0;
                let text = this.game.add.bitmapText(0, 0, 'font_bold', (this.goodGuysArray[i] !== null) ? this.goodGuysArray[i] : 0, this.guyTextSize);
                text.tint = 0xb55f01;
                if (this.setNull !== -1 && this.setNull < 5) {
                    text.anchor.setTo(0.5, 0.6);
                } else {
                    text.anchor.setTo(0.5, 0.1);
                }

                goodguy.data.text = text;
                goodguy.addChild(text);
                goodguy.data.value = this.goodGuysArray[i];
                xPos = goodguy.x + goodguy.width + this.xGap;

                goodguy.visible = true;
                goodguy.inputEnabled = true;
                goodguy.input.enableDrag();
                goodguy.events.onInputDown.add(() => {
                    goodguy.data.initialx = goodguy.x;
                    goodguy.data.initialy = goodguy.y;
                })

                if (i == this.decimalPosition) {
                    goodguyDot.alpha = 0;
                    goodguyDot.visible = true;
                    goodguyDot.anchor.setTo(3.2, 0.2);
                    dotSprite = goodguy;
                }
                goodguy.addChild(goodguyDot);
                this.gguysxPosition.push(goodguy.x);
                this.getGoodguylength.push(i);
                //goddguy events
                goodguy.events.onDragStart.add((sprite: Phaser.Sprite, pointer: any) => {

                })

                goodguy.events.onDragStop.add((sprite: Phaser.Sprite, pointer: any) => {
                    if (Math.abs(sprite.x - sprite.data.initialx) >= 80 || Math.abs(sprite.y - sprite.data.initialy) >= 80) {
                        var tween = this.game.add.tween(sprite);
                        tween.to({ x: 1900, height: 10, width: 10 }, 500, Phaser.Easing.Cubic.Out, true, 100);
                        if (sprite.alpha == 1)
                            this.benchguyin.play();

                        this.userAnswerArray[sprite.data.id] = undefined;
                        var nullCounter = 0;
                        for (var i = 0; i < this.userAnswerArray.length; i++) {
                            if (this.userAnswerArray[i] == undefined) {
                                nullCounter++;
                            }
                        }

                        if (nullCounter == this.userAnswerArray.length) {
                            this.userAnswerArray.length = 0;
                        }

                        tween.onComplete.addOnce(() => {
                            sprite.x = sprite.data.initialx;
                            sprite.y = sprite.data.initialy;
                            sprite.height = this.guysHeight;
                            sprite.width = this.guysWidth;
                            sprite.alpha = 0;
                            sprite.input.useHandCursor = false;
                            if (!sprite.data.parent.infinit) {
                                sprite.visible = true;
                                this.rearrangeBenchGuys("shownext", sprite.data.parent);
                            }
                        });

                    } else {

                        sprite.x = sprite.data.initialx;
                        sprite.y = sprite.data.initialy;
                        sprite.input.useHandCursor = false;
                    }
                });

                this.groupU.add(goodguy);

            }
        }

        if (dotSprite && this.gameEngine.decimalPoints != -1) {
            let externalDot = this.game.add.bitmapText(dotSprite.x+50, dotSprite.y, 'font_bold', ".", 180);
            externalDot.scale.set(0.6, 0.6)
            this.groupU.add(externalDot);
            externalDot.anchor.setTo(4.6, .2);
        }

        this.groupU.x = this.groupZ.x + (this.groupZ.width - this.groupU.width);
        this.groupU.y = this.partiotionLine.y + partiotionLineMarginBottom;
        this.goodGuyFields[0].addChild(this.groupU);

        //calling money symbol
        this.setMoneySymbol();


        if (this.setNull !== -1 && this.setNull < 5) {
            let unswerPostionY = this.groupU.y;
            this.groupU.y = this.allGuysGroupCollection[this.setNull].y;
            this.allGuysGroupCollection[this.setNull].y = unswerPostionY + 30;
        }


    }

    /**
    * This method will return the goodguy array with null value similar to badguys array.  
    */
    createGoodguyArray() {
        for (var i = 0; i < this.goodGuysArray.length; i++) {
            if (!this.goodGuysArray[i]) {
                this.goodGuysArray[i] = null;
            }
        }

        return this.goodGuysArray;
    }


    /**
    * This method setup the bad guys compartments. Each bad guy factor will have its own field.  
    */
    initBadGuyFields() {
        this.operationType = this.engine.sign;
        this.factorLength = this.gameEngine.factors1.length;
        this.badGuyFields = [];
        this.goodGuyFields = [];
        this.guysxPosition = [];
        this.gguysxPosition = [];
        this.getBadguylength = [];
        var badGuysFactors = (this.engine as NumericGameEngine).factors1;

        this.fieldHeight = (this.BASE_GAME_HEIGHT / this.numberOfCompartments) + (this.compartmentpadding / this.numberOfCompartments);
        this.fieldWidth = this.textSize;
        var getNull: Array<number> = this.engine.stateLevelJSONBlock["operation"]["factors"][0];
        this.nullPosition = getNull.indexOf(null);
        this.setNull = (this.nullPosition != -1) ? (this.nullPosition == 0) ? 5 - this.engine.stateLevelJSONBlock["members"].length : 5 - this.nullPosition : 5;

        this.goodguyFieldPosition = this.setNull;
        for (var i = 0; i < this.numberOfCompartments; i++) {
            var field = this.game.add.graphics(0, 0);
            field.lineStyle(this.shadowLine, 0x000000, 0);
            field.drawRect(0, this.fieldWidth * i, this.BASE_GAME_WIDTH - (this.compartmentpadding / this.numberOfCompartments), 60);
            field.data.id = i;
            field.y = i * 1;
            if (i == this.setNull) {
                this.goodGuyFields.push(field);
            } else {
                this.badGuyFields.push(field);
            }
        }
    }

    /**
     * This function will initilize Numeral game bad Guy group
     */

    initBadGuyGroup() {
        this.insertNullToBlankArray();

        var setSymbol = false;


        let badguy: Phaser.Sprite;
        this.groupV = this.game.add.group();
        this.groupW = this.game.add.group();
        this.groupX = this.game.add.group();
        this.groupY = this.game.add.group();
        this.groupZ = this.game.add.group();

        this.groupU = this.game.add.group();

        /** Position Array Initialization for subsrtaction */
        this.carryOverLevelOnePositionArray = [];
        this.carryOverLevelTwoPositionArray = [];
        this.carryOverGuys = [];

        this.allGuysGroupCollection = [this.groupV, this.groupW, this.groupZ, this.groupX, this.groupY];
        for (let i = 0; i < this.gameEngine.badGuysArray.length; i++) {
            let xPos = 0;
            let xgap = 30;
            let count = -1;
            for (let j = 0; j < this.gameEngine.badGuysArray[i].length; j++) {
                badguy = this.game.add.sprite(xPos, 0, "BadBird");
                let scale = 124 / badguy.width;

                badguy.alpha = (this.gameEngine.badGuysArray[i][j] !== null) ? 1 : 0;

                if (badguy.alpha == 1 && !setSymbol) {

                    this.symbolX = badguy.x;
                    setSymbol = true;


                }

                if (i == 3) {

                    if (this.gameEngine.badGuysArray[i][j] !== null)
                        this.xValueString += this.gameEngine.badGuysArray[i][j].value.toString();
                }
                if (i == 4) {

                    if (this.gameEngine.badGuysArray[i][j] !== null)
                        this.yValueString += this.gameEngine.badGuysArray[i][j].value.toString();
                }

                badguy.height = this.guysHeight;
                badguy.width = this.guysHeight;
                badguy.anchor.setTo(0.5, 0.8);
                if (badguy.alpha == 1) {
                    this.guysxPosition.push(badguy.x);
                    this.getBadguylength.push(j);

                }
                if (this.gameEngine.badGuysArray[i][j] !== null) {
                    count++
                }

                xPos = badguy.x + badguy.width + this.xGap;
                //adding text
                var textValue = (this.gameEngine.badGuysArray[i][j] !== null) ? this.gameEngine.badGuysArray[i][j].value.toString() : "0";

                let text = this.game.add.bitmapText(0, 20, 'font_bold', textValue, this.textSize);
                text.anchor.setTo(0.5, 0.8);

                //adding crossLine
                let crossLine = this.game.add.image(0, 0, "crossLine");
                crossLine.anchor.setTo(0.50, 0.8);
                crossLine.scale.setTo(scale);
                crossLine.alpha = 0;
                crossLine.height = crossLine.width = this.crossLineWH;

                //adding glow
                let glow = this.game.add.image(0, 48, "Glow");
                glow.anchor.setTo(0.5, 1);
                glow.alpha = 0;
                glow.height = glow.width = this.glowlineWH;

                //adding decimal 
                let dot = this.game.add.bitmapText(45, 60, 'font_bold', ".", this.dotSize);
                dot.anchor.setTo(4.3, 1.1);
                dot.alpha = 1;
                dot.visible = false;


                if (count == this.engine.decimalPoints) {
                    this.decimalPosition = i;
                    dot.visible = true;
                }

                //badguy["data"] = this.gameEngine.badGuysArray[j];
                badguy["data"].crossLine = crossLine;
                badguy["data"].glow = glow;
                badguy.data.groupID = i;
                badguy.data.id = j;
                badguy.data.value = textValue;

                badguy.addChild(text);
                badguy.addChild(crossLine);
                badguy.addChild(glow);
                badguy.addChild(dot);
                this.allGuysGroupCollection[i].add(badguy);

                //badguy input events
                badguy.events.onInputDown.add(() => {
                    if (this.operationType == "addition") {
                        this.displayCarryforward(j);
                    }
                })
            }//end of inner loop

        }//end of for

        /** setup regrouping position */
        this.gameEngine.setupGrid();
        this.setGroupPosition(this.allGuysGroupCollection);

        //set the functionality according to operation
        if (this.operationType == "subtraction") {

            this.setframeLabel(this.groupX);
            this.setframeLabel(this.groupY);

            /* setup good guys u on field ends */
            this.carryOverLevelOnePositionArray = this.placingAndAddingCarryOverGuys(this.groupX, "group");
            this.carryOverLevelTwoPositionArray = this.placingAndAddingCarryOverGuys(this.carryOverLevelOnePositionArray, "array");

            /** setup regrouping position */
            this.gameEngine.setupGrid(Number(this.xValueString), Number(this.yValueString));
            this.setRegroupingPositionEvent();

        } else {
            this.setframeLabel(this.groupX);
            this.setframeLabel(this.groupY);
            this.setframeLabel(this.groupV);
            this.setframeLabel(this.groupW);
            this.setframeLabel(this.groupZ);
            /*setting up the carryforward*/
            this.setRegroupingPositionEvent();
            this.initCarryforward();
            this.highLightReGroupingGuysAdd(this.gameEngine.possibleRegroupingPositions);
        }

    }

    /**
    * This function will set the x and y postion of badguys group
    */
    setGroupPosition(groupArray: Array<Phaser.Group>) {

        let xPos = this.partiotionLine.width;
        let yPos = 370;
        let ygap = 46;
        for (let i = 0; i < groupArray.length; i++) {
            groupArray[i].x = xPos - groupArray[i].width + 42;
            groupArray[i].y = yPos;
            yPos += groupArray[i].height + ygap
        }

    }

    /**
    * This method will return the badguys array with null value.  
    */
    insertNullToBlankArray() {
        let row = 4;
        let col = 6;
        let badGuyLength = this.gameEngine.badGuysArray.length;
        for (let i = 0; i < row; i++) {
            if (this.gameEngine.badGuysArray[i] == undefined)
                this.gameEngine.badGuysArray[i] = [];

            for (let j = 0; j < col; j++) {
                if (this.gameEngine.badGuysArray[i][j] == undefined)
                    this.gameEngine.badGuysArray[i][j] = null;

            }
        }
        var tempArray = this.gameEngine.badGuysArray.splice(0, badGuyLength);
        this.gameEngine.badGuysArray = this.gameEngine.badGuysArray.concat(tempArray);
    }


    /**
     * This function will create the badguys array for fields
     */
    badguysArray() {
        var badGuysGrid = this.gameEngine.badGuysArray;
        for (let i = 0; i < (this.numberOfCompartments - 1) - badGuysGrid.length; i++) {
            badGuysGrid.unshift(0);
        }
        if (badGuysGrid.length != 5) {
            badGuysGrid.unshift(0);
        }

        return badGuysGrid;
    }
    /**
     * set regrouping position 
     */
    setRegroupingPositionEvent() {
        if ((this.gameEngine.operationType).toString() == "addition") {
            this.gameEngine.calculateRegroupingPositionsForAddition();
        }
        else {
            this.gameEngine.calculateRegroupingPositions();
            this.highLightReGroupingGuys(this.gameEngine.possibleRegroupingPositions);
        }
    }

    /**
    * highLight ReGroupingGuys animation
    */
    highLightReGroupingGuysAdd(rgArray: Array<any>) {

        var targetSprite: any;
        var index: Array<any>;
        this.regroupingGuys = [];
        this.regroupinglength = rgArray.length;
        if (!rgArray.length || this.regroupCounter == rgArray.length) {
            this.regroupCounter = 0;
            return;
        }
        let gethighlightId = rgArray[this.regroupCounter][1];


        for (var i = 0; i < this.allGuysGroupCollection.length; i++) {

            var getGroup = this.allGuysGroupCollection[i];
            targetSprite = getGroup.getChildAt(gethighlightId);

            targetSprite.data.glow.visible = true;
            targetSprite.data.name = "target-" + i
            var tween = this.game.add.tween(targetSprite.data.glow);
            tween.to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);
            targetSprite.data.mytween = tween;
            this.regroupingGuys[this.regroupingGuys.length] = targetSprite;
            targetSprite.inputEnabled = true;
            targetSprite.input.useHandCursor = true;
            targetSprite.events.onInputDown.addOnce((e: any) => {
                this.additionRegroup(e);
            }, this);
        }


    }

    /**
    * This function disable the glow effect and remove the animation
    * Works only for addition
    */

    additionRegroup(s: any) {
        for (var i = 0; i < this.allGuysGroupCollection.length; i++) {
            var getGroup = this.allGuysGroupCollection[i];
            var sprite: any = getGroup.getChildAt(s.data.id);

            sprite.data.glow.visible = false;
            sprite.inputEnabled = false;
            sprite.input.useHandCursor = false;
            sprite.events.onInputDown.remove(this.generateRegroupAnimation, this);

        }

        if (this.regroupinglength > 2) {
            this.regroupCounter += 2;
            this.highLightReGroupingGuysAdd(this.gameEngine.possibleRegroupingPositions);
        }
    }

    /**
    * This function animate the badguys needs regroung array
    */

    highLightReGroupingGuys(rgArray: Array<any>) {


        if (this.setNull == -1 || this.setNull < 5) {
            return;
        }

        var targetSprite: any;
        var index: Array<any>;
        this.regroupingGuys = [];
        for (var i = 0; i < rgArray.length; i++) {
            if (rgArray[i][0] == 2) {
                targetSprite = this.groupX.getChildAt(rgArray[i][1]);
                targetSprite.data["regroupIndex"] = [2, rgArray[i][1]];
            } else {
                var arrayObj: any = this.carryOverLevelOnePositionArray[rgArray[i][1]];
                targetSprite = arrayObj.sprite;
                targetSprite.data["regroupIndex"] = [1, rgArray[i][1]];
            }
            targetSprite.data.glow.visible = true;
            targetSprite.data.name = "target-" + i
            var tween = this.game.add.tween(targetSprite.data.glow);
            tween.to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);
            targetSprite.data.mytween = tween;
            this.regroupingGuys[this.regroupingGuys.length] = targetSprite;
            targetSprite.inputEnabled = true;
            targetSprite.input.useHandCursor = true;
            targetSprite.events.onInputDown.addOnce((e: any) => {
                this.generateRegroupAnimation(e)
            }, this);
        }
    }

    /**
     * genrate ReGrouping animation
     */
    generateRegroupAnimation(s: any) {
        if (this.regroupingGuys.length > 0) {
            for (var l = 0; l < this.regroupingGuys.length; l++) {
                var sprite: any = this.regroupingGuys[l];
                sprite.data.glow.visible = false;
                sprite.inputEnabled = false;
                sprite.input.useHandCursor = false;
                sprite.events.onInputDown.remove(this.generateRegroupAnimation, this);
            }
        }
        if (this.animationStop) {
            this.gameEngine.regrouping(s.data.regroupIndex);
            this.animatioinArray = this.gameEngine.animations;
            this.startAnimation(0);
            s.data.glow.visible = false;
        }
    }

    /**
     * This function is going to be used to initialize the carryforwad           
     */
    initCarryforward() {
        let carry = this.gameEngine.grid[4];
        let extraYmargin = 380;
        this.carryforwardGroup = this.game.add.group();

        for (let i = 0; i < carry.length; i++) {
            this.carryForward = this.game.add.bitmapText(0, this.partiotionLine.y, 'font_bold', (carry[i] == 1) ? "I" : "II");

            this.carryForward.anchor.setTo(0.5, 0.5)
            this.carryForward.tint = 0x223344;
            this.carryForward.fontSize = this.carryForwardFontSize;
            this.carryForward.visible = false;
            this.carryForward.x = this.groupY.getChildAt(i).x + this.groupY.width - extraYmargin;
            this.carryforwardGroup.add(this.carryForward);
        }
    }

    /**
    * This function is going to be used to display the carryforwad      
    * @Params : badguys index number
    */
    displayCarryforward(index: number) {
        this.carryforwardGroup.children[index - 1].visible = true;
    }

    /**
     * 
     * @param arrIndex  passing the index for the animation array that will trigger
     * the required animation based on the properties in the indexed object
     */
    startAnimation(arrIndex: number) {
        /**
         * 1. move 
         * 2. cross over
         * 3. split
         */
        //  if(arrIndex >-1) return;
        if (arrIndex == this.animatioinArray.length) {
            this.animationStop = true;

            this.setRegroupingPositionEvent();
            return;
        }
        switch (this.animatioinArray[arrIndex].actionType) {
            case 1:
                this.moveNumber(arrIndex);
                break;
            case 2:
                this.crossNumber(arrIndex);
                break;
            case 3:
                this.splitNumber(arrIndex);
                break;
        }
        this.animationStop = false;

    }

    /**
     * 
     * @param _index  show the crossed line over the bad guys during the carryover animation
     */
    crossNumber(_index: number) {

        var animArrayObject = this.animatioinArray[_index];
        var sprite: any;
        var spriteIndex: number = 2;
        var hasGuy: number = 0;
        if (animArrayObject.index[0] < 2) {
            if (animArrayObject.index[0] == 1) {
                sprite = this.carryOverLevelOnePositionArray[animArrayObject.index[1]]["sprite"];
                hasGuy = this.carryOverLevelOnePositionArray[animArrayObject.index[1]].hasGuy;
                spriteIndex = 1;
            } else {
                sprite = this.carryOverLevelTwoPositionArray[animArrayObject.index[1]]["sprite"];
                hasGuy = this.carryOverLevelOnePositionArray[animArrayObject.index[1]].hasGuy;
                spriteIndex = 0;
            }
        } else {
            sprite = this.groupX.getChildAt(animArrayObject.index[1]);
        }
        if (spriteIndex < 2) {
            var tempSprite: any = this.groupX.getChildAt(animArrayObject.index[1]);
            if (sprite.x > tempSprite.x) {
                sprite.data.crossLine.anchor.setTo(.5, .85);
                if (spriteIndex == 1 && hasGuy > 1) {
                    sprite.data.crossLine.anchor.setTo(.8, 0.9);
                }
            } else {
                sprite.data.crossLine.anchor.setTo(-.5, 1);
            }
        }

        var tween = this.game.add.tween(sprite.data.crossLine);

        tween.to({ alpha: 1 }, 200, Phaser.Easing.Linear.None, true, 100);
        tween.onComplete.addOnce(() => {
            _index += 1;
            this.startAnimation(_index);
        });
    }

    /** Animation Sequence Array */
    animatioinArray: Array<any>;

    /**
     * 
     * @param _index  show the moving animation for the bad guys during the carryover animation
     */
    moveNumber(_index: number) {

        var animArray = this.animatioinArray;
        var numberOnGuy = animArray[_index].actionParam[0] == 10 ? 1 : animArray[_index].actionParam[0];
        var positionObjectToMoveTo = animArray[_index].actionParam[1];
        var spriteToMoveFrom: any;
        var x: number, y: number;
        var frameName: string;
        var moveToObject: any;
        let guyTextSize = 60;
        if (animArray[_index].index[0] < 2) {
            if (animArray[_index].index[0] == 1) {
                spriteToMoveFrom = this.carryOverLevelOnePositionArray[animArray[_index].index[1]];
            } else {
                spriteToMoveFrom = this.carryOverLevelTwoPositionArray[animArray[_index].index[1]];

            }

            x = spriteToMoveFrom.x;
            y = spriteToMoveFrom.y;
            frameName = spriteToMoveFrom.sprite.data.frameName
        } else {
            var groupToGetTarget = this.getGroupToPickTheTargetSprite(animArray[_index].index[0]);
            spriteToMoveFrom = groupToGetTarget.getChildAt(animArray[_index].index[1]);
            x = spriteToMoveFrom.worldPosition.x;
            y = spriteToMoveFrom.worldPosition.y;

            frameName = spriteToMoveFrom.data.frameName
        }

        let guy = this.game.add.image(x, y, "RGBadBird");
        guy.anchor.setTo(0.5, 0.9)
        guy.height = guy.width = 62;
        guy.frameName = frameName + "_regrouping";
        guy.data.frameName = frameName;
        var style = { font: "50px impact", fill: "black" };
        let crossLine = this.game.add.image(0, 0, "crossLine");
        crossLine.anchor.setTo(-.5, 1)
        let glow = this.game.add.image(0, 0, "RGGlow");
        glow.anchor.setTo(0.30, 1);
        crossLine.alpha = 0;
        crossLine.height = crossLine.width = this.carryOverClineWH;
        guy.data.crossLine = crossLine;
        guy.data.glow = glow;
        glow.alpha = 0;
        glow.width = guy.width * 2.85;
        glow.height = guy.height * 1.75;

        if (positionObjectToMoveTo[0] < 2) {
            if (positionObjectToMoveTo[0] == 1) {
                this.carryOverLevelOnePositionArray[positionObjectToMoveTo[1]].sprite = guy;
                moveToObject = this.carryOverLevelOnePositionArray[positionObjectToMoveTo[1]];
                this.carryOverLevelOnePositionArray[positionObjectToMoveTo[1]].hasGuy += 1;
            } else {
                this.carryOverLevelTwoPositionArray[positionObjectToMoveTo[1]].sprite = guy;
                moveToObject = this.carryOverLevelTwoPositionArray[positionObjectToMoveTo[1]];
                numberOnGuy = animArray[_index].actionParam[0] == 10 ? 10 : animArray[_index].actionParam[0];
                this.carryOverLevelTwoPositionArray[positionObjectToMoveTo[1]].hasGuy += 1;
            }
        }
        let text = this.game.add.bitmapText(0, 0, 'font_bold', numberOnGuy.toString(), guyTextSize);
        text.anchor.setTo(0.5, 0.8)
        guy.addChild(text);
        guy.addChild(glow);
        guy.addChild(crossLine);
        guy.alpha = 0;
        var tempx: number;
        if (positionObjectToMoveTo[1] == animArray[_index].index[1]) {
            tempx = moveToObject.x + 30;
            glow.anchor.setTo(0.72, 0.8);
        } else {
            tempx = moveToObject.x - 30;
        }
        var tween = this.game.add.tween(guy);
        tween.to({ x: tempx, y: moveToObject.y + 40, alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 500);
        tween.onComplete.addOnce(() => {
            _index += 1;
            this.startAnimation(_index);
        });

        this.carryOverGuys.push(guy);

    }

    /**
     * 
     * @param _index  
     */
    splitNumber(_index: number) {
        _index += 1;
        this.startAnimation(_index);
    }


    getGroupToPickTheTargetSprite(num: number): any {
        switch (num) {
            case 2:
                return this.groupX;
        }

    }


    /**
     * this method will called when user release the good guy
     * dragged from bench on the feild area
     * @param {sprite}  the object which is dragged and generates the event
     * @param {pointer}  cursor position of the mouse where user release the dragged object 
     */
    benchGuyDragStopped(sprite: Phaser.Sprite, pointer: Phaser.Pointer) {
        let targetField = this.goodGuyFields[this.goodGuyFields.length - 1];
        var checkOverLap = this.checkZoneIntersects(sprite, this.goodGuyFields[this.goodGuyFields.length - 1]);
        var checkOverLapWithLine = this.checkZoneIntersects(sprite, this.partiotionLine);
        var checkOverLapWithReferee = this.checkZoneIntersects(sprite, this.referee);

        var checkOverLapWithGGOnFiels = this.checkZoneIntersectsWithGroupItems(sprite, this.groupU);

        // sprite bound check for different type of guys as height for the 5,10,100
        let spriteBoundY = sprite.data.metaData.actor.spriteType > 2 ? (sprite.getBounds().y + sprite.getBounds().height) : (sprite.getBounds().y + sprite.getBounds().height * 2)

        // checking overlap with refree, partition line, good guy field bound to drop the good guy correctly
        if (!checkOverLap || checkOverLapWithGGOnFiels.overLap || checkOverLapWithLine || checkOverLapWithReferee || sprite.y < targetField.y || sprite.getBounds().x < targetField.getBounds().x || ((spriteBoundY) > (targetField.getBounds().y + targetField.getBounds().height)) || ((sprite.getBounds().x + sprite.getBounds().width) > (targetField.getBounds().x + targetField.getBounds().width))) {

            sprite.x = sprite.data.benchPosition.x;
            sprite.y = sprite.data.benchPosition.y;
            if (!checkOverLapWithGGOnFiels.overLap) {
                return;
            }

            sprite.data.addedToField = false;
            checkOverLapWithGGOnFiels.child.data.text.setText("" + sprite.data.value + "");
            checkOverLapWithGGOnFiels.child.data.value = sprite.data.value;
            checkOverLapWithGGOnFiels.child.alpha = 1;
            checkOverLapWithGGOnFiels.child.visible = true;
            this.drop.play();

            this.userAnswerArray[checkOverLapWithGGOnFiels.child.data.id] = checkOverLapWithGGOnFiels.child;
            this.enableOrDisableReferee();

            if (checkOverLapWithGGOnFiels.child.data.parent === undefined) {
                checkOverLapWithGGOnFiels.child.data.parent = sprite.data.metaData;
            } else {
                this.rearrangeBenchGuys("shownext", checkOverLapWithGGOnFiels.child.data.parent);
                checkOverLapWithGGOnFiels.child.data.parent = sprite.data.metaData;
            }
            if (!sprite.data.infinite) {
                sprite.visible = true;
                this.rearrangeBenchGuys("reshuffle", sprite);
            } else {
                this.rearrangeBenchGuys("shownext", sprite.data.metaData)
            }
            sprite.destroy();

        } else {
            this.benchguyin.play();
            if (!sprite.data.addedToField) {
                sprite.data.addedToField = true;
            }
        }
    }

    /**
     * add / replicate the good guy on the good guy field area
     * @param sprite  an object that need to be replicated
     * @param pointer  to position the element on the pointer location
     */
    addGuyOnTheField(goodguy: Phaser.Sprite, pointer: Phaser.Pointer) {
        let myParent = goodguy.data.parent;
        let tween = this.game.add.tween(goodguy);
        tween.to({ x: goodguy.data.x + this.benchField.getBounds().x, y: goodguy.data.y, alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 100);
        this.game.add.tween(goodguy.scale).to({ x: 0, y: 0 }, 500, Phaser.Easing.Linear.None, true)
        tween.onComplete.addOnce((e: Phaser.Tween) => {
            goodguy.destroy();
            if (!myParent.data.infinite) {
                myParent.visible = true;
                this.rearrangeBenchGuys("shownext", myParent.data.metaData);
            }
        });
    }

    /** 
    * check zone intersect
    * * */
    checkZoneIntersectsWithGroupItems(sprite: Phaser.Sprite, group: any): any {
        var spriteBounds: any = sprite.getBounds();
        var intersection = {
            overLap: false,
            child: "null"
        };
        for (var i = 0; i < group.length; i++) {
            var childItem: any = group.getChildAt(i);
            var childItemBounds: any = childItem.getBounds();
            if (Phaser.Rectangle.intersects(spriteBounds, childItemBounds)) {
                intersection.overLap = true;
                intersection.child = childItem;
                break;
            }
        }
        return intersection;
    }

    /** function placing the carryOverGuys invisibily on stage */
    placingAndAddingCarryOverGuys(collection: any, type: string): Array<any> {
        var _length: number;
        var _guysArray: Array<any> = [];
        if (type === "group") {
            _length = collection.children.length;
        } else {
            _length = collection.length;
        }

        for (var i = 0; i < _length; i++) {
            var obj: any = {};
            var child: any = (type === "group") ? collection.getChildAt(i) : collection[i];
            obj.x = (type === "group") ? child.x + this.groupX.x : child.x;
            obj.y = (type === "group") ? this.groupX.y - 170 : child.y - 100;
            obj.sprite = null;
            obj.hasGuy = 0;
            obj.data = {};
            let guy = this.game.add.image(obj.x, obj.y, "RGBadBird");

            guy.anchor.setTo(0.5);
            guy.visible = false;
            _guysArray.push(obj);
        }

        return _guysArray;
    }



    /**
    * this method will calculate user answer's value
    * @param userAnswer  user's Answer Array
    */
    calculateTotalValue(userAnswer: Array<any>): number {
        // variable storing total value for userAnswersArray
        this.storeAnswer = userAnswer;
        let userAnswerTotalValue: number = 0;
        let concatString: string;
        let arrayNumber: Array<any> = [];
        //Calculating total value of userAnswerArray

        for (let i = 0; i < this.userAnswerArray.length; i++) {
            if (this.userAnswerArray[i] !== undefined) {
                if (this.userAnswerArray[i].alpha == 1) {
                    let totalValue = this.userAnswerArray[i].data.value;
                    userAnswerTotalValue = userAnswerTotalValue + totalValue;
                    arrayNumber[i] = totalValue;
                }
            } else {
                return 0;
            }
        }
        userAnswerTotalValue = +arrayNumber.join('');
        return userAnswerTotalValue;
    }

    /**
    * this method will called when user clicks on referee 
    * and the answer is wrong then clear the stage
    */
    clearStage(toMenu?: boolean) {
        
        if (this.operationType == 'addition') {
            this.carryforwardGroup.removeAll();
        }
        if (this.operationType == 'addition' && this.factorLength == 2) {
            this.carryforwardGroup.removeAll();
        } else {
            this.carryOverLevelOnePositionArray = [];
            this.carryOverLevelTwoPositionArray = [];

            for (let i = 0; i < this.carryOverGuys.length; i++) {
                this.carryOverGuys[i].destroy();
            }



        }

 
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
     * clear the stage before loading the next level
     */
    clearAllFromScreen() {

        this.game.tweens.removeAll();
        this.badGuyGroup.removeAll();
        this.goodGuyGroup.removeAll();
        this.goodGuyOnFieldCounter = 0;
        for (var i = 0; i < this.symbolCollection.length; i++) {
            this.symbolCollection[i].destroy();
        }

        this.utext.destroy();
        this.yOps.destroy();

        this.regroupCounter = 0;
        this.groupU.removeAll();
        this.groupV.removeAll();
        this.groupW.removeAll();
        this.groupX.removeAll();
        this.groupY.removeAll();
        this.groupZ.removeAll();

        this.getBadguylength = [0];
        this.guysxPosition = [0];
        this.gguysxPosition = [0];
        this.getBadguylength = [0];
        this.getGoodguylength = [0];

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
        if (this.animationGuysSprite.length > 0) {
            for (let i = 0; i < this.animationGuysSprite.length; i++) {
                this.animationGuysSprite[i].animations.currentAnim.stop();
                this.animationGuysSprite[i].animations.currentAnim.onLoop.removeAll();
                this.animationGuysSprite[i].kill();
            }
        }
        this.animationGuysSprite.length = 0;
        this.benchGuyGroup.removeAll();
        this.rewardsGroup.destroy(true);
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


    /*set money symbol position */
    setMoneySymbol() {
        // let setExtraSpace = 380;

        this.operationType = this.engine.sign;
        var moneySymbol: string = this.gameEngine.stateLevelJSONBlock.money;


        this.symbolCollection = [];

        this.xtext = this.game.add.bitmapText(0, 0, 'font_bold', "¢", this.textSize);
        this.xtext.alpha = 0;
        this.utext = this.game.add.bitmapText(0, 0, 'font_bold', "¢", this.textSize);
        this.utext.alpha = 0;
        let xPos = this.getsymbolXPosition();
        if (moneySymbol === "cents") {
            let centPos = this.allGuysGroupCollection[0].x + this.allGuysGroupCollection[0].width;
            for (var i = 0; i < this.allGuysGroupCollection.length; i++) {
                if (this.allGuysGroupCollection[i].getChildAt(5).alpha) {
                    this.xtext = this.game.add.bitmapText(centPos, this.allGuysGroupCollection[i].y, 'font_bold', "¢", this.textSize);
                    this.xtext.x = centPos;
                    this.xtext.y = this.allGuysGroupCollection[i].y;
                    this.xtext.alpha = 1;
                    this.xtext.anchor.setTo(0.5, 0.8);
                    this.symbolCollection.push(this.xtext);
                }
            }
            this.utext.x = centPos;
            this.utext.y = this.groupU.y;
            this.utext.alpha = 1;
            this.utext.anchor.setTo(0.5);


            this.yOps = this.game.add.bitmapText(xPos - 30, this.groupY.y, 'font_bold', (this.operationType == "subtraction") ? "–" : "+", this.textSize);
            this.yOps.anchor.setTo(0.5, 0.8);
        } else {


            xPos = xPos + this.textSize * 3;

            if (moneySymbol === "dollars" || moneySymbol === "dollarscent") {
                for (var i = 0; i < this.allGuysGroupCollection.length; i++) {
                    if (this.allGuysGroupCollection[i].getChildAt(5).alpha) {
                        this.xtext = this.game.add.bitmapText(xPos, this.allGuysGroupCollection[i].y, 'font_bold', "$", this.textSize);
                        this.xtext.text = "$";
                        this.xtext.x = xPos;
                        this.xtext.y = this.allGuysGroupCollection[i].y;
                        this.xtext.alpha = 1;
                        this.xtext.anchor.setTo(0.5, 0.8);
                        this.symbolCollection.push(this.xtext);
                    }
                }

                this.utext.text = "$";
                this.utext.x = xPos;
                this.utext.y = this.groupU.y + 5;
                this.utext.alpha = 1;
                this.utext.anchor.setTo(0.5);
            }
            this.yOps = this.game.add.bitmapText(xPos - this.textSize + 20, this.groupY.y, 'font_bold', (this.operationType == "subtraction") ? "–" : "+", this.textSize);
            this.yOps.anchor.setTo(0.5, 0.8);

        }
    }

    /* this method will setup the symbol xposition */
    getsymbolXPosition() {
        let getMinBadGuy = Math.min.apply(null, this.getBadguylength);
        let getMinGoodGuy = Math.min.apply(null, this.getGoodguylength);
        if (getMinBadGuy < getMinGoodGuy || getMinBadGuy == getMinGoodGuy) {
            let guysxP = Math.min.apply(null, this.guysxPosition);
            return guysxP;

        } else {

            let guysxP = Math.min.apply(null, this.guysxPosition);
            return guysxP - (this.glowlineWH);
        }

    }

}//end of class