import { Component } from '@angular/core';
//import { ObjectGame } from '../../states/objectgame';
//import { NumericGame } from '../../states/numericgame';
import { LogicTest } from '../../states/logictest';
import { DynamicMenu } from '../../../../shared/states/dynamic.menu';
import { AdditionGame } from '../../states/object.game.state';
import { NumericGame } from '../../states/numeric.game.state';
import { GameUserData } from "../../../../shared/engine/game.user.data.service";
import { transitionA } from '../../transitions/transitionA';
import { transitionB } from '../../transitions/transitionB';
import { transitionC } from '../../transitions/transitionC';
import { transitionD } from '../../transitions/transitionD';

/**
 * Component Definition
 */
@Component({
    selector: 'poggame',
    template: '<div id="content"></div>'
})

/**
 * Main POG Game class 
 */
export class POGGame {
    game: Phaser.Game;
    currentLevel: number;
    currentType: string;
    jsonData: any;
    // userDataService: UserData.UserLevelInfo;
    gameUserDataService: GameUserData.gameUserDataService;

    /**
     * these properties is used to fetch game details for POG game
     */
    gameTypeDetails: Array<string>;
    operationTypeDetails: Array<string>


    /**
     * this property will have the predefined params from URL
     */
    urlParams: any;

    /**
     * setting the game height and width variable to 200% to the actual size
     */
    BASE_GAME_WIDTH: number = 2048;
    BASE_GAME_HEIGHT: number = 1408;

    /**
     * this property will be an object and hold all the intial parameters
     * required to load the game state
     */
    initParams: any;

    /**
     * this property is used to maintain index number for menu Unlock animation
     */
    menuAnimIndex: number;

    loadtext: Phaser.Text;

    constructor() {
        this.game = new Phaser.Game(2048, 1408, Phaser.CANVAS, 'content', {
            preload: this.preload, create: this.create, update: this.update, initiateGame: this.initiateGame, init: this.init, dynamicMenuButtonClick: this.dynamicMenuButtonClick, handleIncorrect: this.handleIncorrect, handleCorrect: this.handleCorrect, dynamicMenuDetails: this.dynamicMenuDetails, userDataServiceCallBack: this.userDataServiceCallBack, showError: this.showError
        }, true, true);
    }

    /**
     * @param param  setting up all the default values for the game based
     * on the values passed from the main game component
     */
    init(param: any) {
        // setting default values for URL Params
        this.game.stage.backgroundColor = '#61CDCD';
        this.urlParams = {
            grade: "k",
            level: "",
            mode: "teacher",
            data: "",
            line: false,
            forceload: false,
            clear: false,
            debug: false,
            style: "2",
            lang: "en",
            mute: false,
            testing: false
        }


        this.loadtext = this.game.add.text(200, 200, "initializing game...", { font: "25px Arial", fill: "#ffffff", align: "center" });

        this.loadtext.x = (this.BASE_GAME_WIDTH - this.loadtext.width) / 2
        this.loadtext.y = (this.BASE_GAME_HEIGHT - this.loadtext.height) / 2

        /**
         * initializing the parameters to be passed to the state
         */
        let gameRef = this;
        this.initParams = {
            levelID: "",
            // userDataService: null,
            gameUserDataServiceCAS: null,
            urlParams: this.urlParams,
            parent: this,
            audiomute: false,
            animationCheck: false,
            directPlayAnimationPrevent: false,
            indexBool: true,
            gameEndAnimBool: false,
            gameCompleted: false,
            playIntroVideo:  true,
            assignmentMode: -1,
            assignmentLevelId: -1,
            assetsLoaded: false,
            commontext: {}
        }

        // getting query string from the URL
        let qs = window.location.href.split('?')[1];
        /**
        * initializing the parameters which will be passed to the state
        */
        var params: any = {},
            tokens: any,
            re = /[?&]?([^=]+)=([^&]*)/g;
        while (tokens = re.exec(qs)) {
            this.urlParams[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }
        this.initParams.audiomute = Boolean(this.urlParams.mute);
        this.initParams.assignmentMode = window.location.href.toLowerCase().indexOf("assignment");
        this.game.canvas.oncontextmenu = function (e) { return false; }
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        if (this.urlParams.debug === false) {
            console.log = function () { };
            console.warn = function () { };
            // console.log = function(){};
        }
        /**
         * loading css only for device device.css
         */
        if (!this.game.device.desktop) {
            let link = document.createElement('link')
            link.setAttribute('rel', 'stylesheet')
            link.setAttribute('type', 'text/css')

            if (this.urlParams.lang == 'es')
                link.setAttribute('href', 'css/device_es.css')
            else
                link.setAttribute('href', 'css/device.css')

            document.getElementsByTagName('head')[0].appendChild(link)
        }

        /* Array for Transition */
        this.guys = [
            { 'name': 'GG1', 'frames': 7, 'sprite': null },
            { 'name': 'GG100', 'frames': 8, 'sprite': null },
            { 'name': 'GG10', 'frames': 7, 'sprite': null },
            { 'name': 'GG1', 'frames': 7, 'sprite': null },
            { 'name': 'GGJump', 'frames': 13, 'sprite': null },
            { 'name': 'GG1', 'frames': 7, 'sprite': null }

        ];

    }

    protected orientationInstrTextStyle = {
        font: '120px impact',
        align: 'center',
        fill: '#FF0000'
    }

    protected orientationIntruction: Phaser.Group = null;

    /**
     * This method will get triggered when user view the game in wrong orientation (i.e portrait mode)
   */
    protected handleIncorrect() {

        /*this.orientationIntruction = this.game.add.group();
        

        let graphics_bg = this.game.add.graphics(0, 0);
        graphics_bg.beginFill(0x000000, 0.8);
        graphics_bg.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);
        graphics_bg.endFill();

        let background = this.game.add.sprite(0, 0, graphics_bg.generateTexture());

        let instrText = this.game.add.text(
            0,
            0,
            'Please switch to \n landscape mode \n to play the game...',
            this.orientationInstrTextStyle);
        instrText.x = background.width / 2 - instrText.getBounds().width / 2;
        instrText.y = background.height / 2 - instrText.getBounds().height / 2 + 10;
        background.addChild(instrText);
        graphics_bg.destroy();
        this.orientationIntruction.add(background);
        this.game.paused = true;*/
    }

    /**
     * This method will get triggered when the user switch the device orientation from portrait to landscape.
    */
    protected handleCorrect() {
        this.orientationIntruction.destroy();
        this.orientationIntruction = null;
        this.game.paused = false;
    }

    /**
     * storing the keys for the transition guys objects 
     */
    guys: Array<any>;

    /**
     * preloading the assets
     */

    preload() {
        // Assets for Transition A
        this.game.load.image('bg_a', 'assets/transitionA/assets/background.png');
        for (let guy of this.guys) {
            this.game.load.atlasJSONArray(guy.name + "_a", 'assets/transitionA/assets/spritesheets/'.concat(guy.name).concat('.png'), 'assets/transitionA/assets/spritesheets/'.concat(guy.name).concat('.json'));
        }

        // Assets for Transition B
        this.game.load.atlasJSONArray('GG1_b', 'assets/transitionB/assets/spritesheets/Object_GG1.png', 'assets/transitionB/assets/spritesheets/Object_GG1.json');
        this.game.load.atlasJSONArray('GG100_b', 'assets/transitionB/assets/spritesheets/Object_GG100.png', 'assets/transitionB/assets/spritesheets/Object_GG100.json');

        // Assets for Transition C
        this.game.load.atlasJSONArray('GGa10', 'assets/transitionC/assets/spritesheets/Object_GG10.png', 'assets/transitionC/assets/spritesheets/Object_GG10.json');
        this.game.load.atlasJSONArray('GGa100', 'assets/transitionC/assets/spritesheets/Object_GG100.png', 'assets/transitionC/assets/spritesheets/Object_GG100.json');


        //Assets for Transition D
        this.game.load.atlasJSONArray('GGa1', 'assets/transitionD/assets/spritesheets/Object_GG1.png', 'assets/transitionD/assets/spritesheets/Object_GG1.json');
        this.game.load.atlasJSONArray('GGa5', 'assets/transitionD/assets/spritesheets/Object_GG5.png', 'assets/transitionD/assets/spritesheets/Object_GG5.json');

        this.game.load.bitmapFont("HMHMath", "assets/transitionD/assets/font/AvenirPrimaryHMHMath_Black.png", "assets/transitionD/assets/font/AvenirPrimaryHMHMath_Black.fnt");

        // here we need to decide which json we need to load 
        // a sample url path would be
        // https://game?usertype=student&playmode=freeplay&grade=gk&levelid=gk12

        //var paramId = window.location.href.split("#")[1];

        // Assests using for common imgages like home & rewards etc
        this.game.load.atlas('UI', 'assets/images/ui_assets.png', 'assets/data/ui_assets.json');

        // preloading font
        this.game.load.bitmapFont('font_impact', 'assets/fonts/AvenirPrimaryHMHMath.png', 'assets/fonts/AvenirPrimaryHMHMath.fnt');
        this.game.load.bitmapFont('font_bold', 'assets/fonts/AvenirPrimaryHMHMath-Bold.png', 'assets/fonts/AvenirPrimaryHMHMath-Bold.fnt');
        this.game.load.bitmapFont('font_boldItalic', 'assets/fonts/AvenirPrimaryHMHMath-BoldItalic.png', 'assets/fonts/AvenirPrimaryHMHMath-BoldItalic.fnt');
        this.game.load.bitmapFont('font_italic', 'assets/fonts/AvenirPrimaryHMHMath-Italic.png', 'assets/fonts/AvenirPrimaryHMHMath-Italic.fnt');


        // preloading common text content 
        //this.game.load.json('commontext', '../../../../shared/assets/data/common_text.json');
        this.game.load.json('commontext', './shared/assets/data/common_text.json');

        // preloading JSON for grade
        this.game.load.json('leveldata', 'assets/data/pog.grade' + this.urlParams.grade + '.data' + '_' + this.urlParams.lang + '.json');

        // splash screen image
        this.game.load.image('splashscreen', 'assets/images/splashscreen_' + this.urlParams.lang + '.png');

        /**
         * following files will give error
         */
        //  this.game.load.image('splashscreen-err', 'assets/images/splashscreen22.png')
        //  this.game.load.image('leveldata-err', 'assets/data/pog.gradeg' + this.urlParams.grade + '.data.json')//.onFileError.add(this.showError,this);

        this.game.load.onFileError.add(this.showError, this);

    }

    public transitionAnimationCallBack(obj: any) {
        let a: string = "test var";
        console.log("transition Callback function --- ", obj);

    }

    /**
     * 
     * @param key name of the object cache key assigned while loading an asset
     * @param obj  object that has information regarding object failed to load
     */
    showError(key: string, obj: any) {
        console.log("%cKey Name: ", "display:inline;")
        console.log("%c" + obj.key, "color:red;display:inline;")
        console.log("%c" + obj.url, "color:red;display:inline;")
        // obj.key, obj.url)
    }

    /**
     * execute once the preload of assets are done
     */
    create() {
        let splash = this.game.add.sprite(0, 0, "splashscreen");
        let arr: any = [];
        let gameInstance = this;

        //this.userDataService = new UserData.UserLevelInfo(arr);
        // this.initParams.userDataService = this.userDataService;
        this.currentLevel = 0;
        // adding different states to the game
        this.game.state.add('DynamicMenu', DynamicMenu);
        this.game.state.add('LogicTest', LogicTest);
        this.game.state.add('AdditionGame', AdditionGame);
        this.game.state.add('NumericGame', NumericGame);
        this.game.state.add('transitionA', transitionA);
        this.game.state.add('transitionB', transitionB);
        this.game.state.add('transitionC', transitionC);
        this.game.state.add('transitionD', transitionD);

        console.log('cheking trsigino state ----------- ', this.game.cache.getJSON('commontext')[this.urlParams.lang])

        // assigning JSON data
        this.jsonData = this.game.cache.getJSON('leveldata');
        this.initParams.commontext = this.game.cache.getJSON('commontext')[this.urlParams.lang];
        this.gameUserDataService = new GameUserData.gameUserDataService(this.initParams.commontext);
        this.initParams.gameUserDataServiceCAS = this.gameUserDataService;
        console.log(window.location.href.toLowerCase().indexOf("assignment"));
        // if(window.location.href.toLowerCase().indexOf("assignment") === -1){
        this.gameUserDataService.initGameUserDataServiceCall(this.jsonData, this);
        // }else{
        //   this.initiateGame();
        // }
    }

    /**
     * 
     * @param gameUserData  method executes when data is reterieved, irrespective of success or failure
     * this method intitialize the game rendering once all the data required to generate the Dynamic Menu is received
     */
    userDataServiceCallBack(gameUserData: GameUserData.IGameUserData) {
        console.log("callback received from service  = = = = ", gameUserData);
        /**
         * setting the user mode to check if the user is teacher or student
         */
        if (gameUserData.mode !== "")
            this.urlParams.mode = gameUserData.mode.toLowerCase();

        this.initParams.userDataServiceCAS = this.gameUserDataService;
        this.initiateGame();
    }

    /**
     * Initializing the game
     */
    initiateGame() {
        let gameInstance = this;
        let currentGame: string;
        let type: string;


        if (this.urlParams.level !== "") {
            let levelID: string = this.urlParams.level;

            if (!isNaN(Number(this.urlParams.level))) {
                if (this.jsonData.levelData[Number(this.urlParams.level) - 1] === undefined) {
                    alert("Level " + levelID + " Not Available");
                    return;
                } else {
                    levelID = this.jsonData.levelData[Number(this.urlParams.level) - 1].id;
                }
            }
            this.initParams.levelID = levelID;
            // let operationType = this.jsonData.levelData[Number(this.urlParams.level) - 1].operation.gameType;
            let levelIdx = Number(this.jsonData.levelData.map(function (x: any) { return x.id; }).indexOf(this.initParams.levelID))
            let operationType = this.jsonData.levelData[Number(levelIdx)].operation.gameType;

            /** This piece of code is used to start game(specified level) directly without going through dynamic menu */


            if (operationType.toLowerCase() === "objects") {
                this.game.state.start('AdditionGame', true, false, [gameInstance.initParams]);
            } else {
                this.game.state.start('NumericGame', true, false, [this.initParams]);
            }

        }
        else {
            //this.game.state.start('transition', false, false, [this.initParams]);
            console.log(this.initParams)
            this.game.state.start('DynamicMenu', true, false, [this.initParams])
        }
    }

    /**
     * method is used to handle Dynamic menu click events
     * @param 'obj'  array of menu elements
     * @param 'dataService'  userDataService for data persistence
     * @param 'urlData'  urlMode to determine user(teacher/student)
     * @param 'menuAnimIndex'  current Unlock animation Index
     */
    dynamicMenuButtonClick(obj: any, menuAnimIndex: number) {
        let gameInstance = this;
        this.initParams.levelID = obj.id;
        this.initParams.userDataServiceCAS = this.gameUserDataService;
        this.initParams.directPlayAnimationPrevent = true;
        //this.initParams.urlParams = urlData;

        if (obj.gameType == "Objects") {
            this.game.state.start('AdditionGame', true, false, [this.initParams, menuAnimIndex]);

        } else {
            this.game.state.start('NumericGame', true, false, [this.initParams, menuAnimIndex]);
        }

    }

    /**
     * this method will fetch details for dynamic menu specially for POG game
     */
    dynamicMenuDetails() {

        this.gameTypeDetails = [];
        this.operationTypeDetails = [];

        for (let i = 0; i < this.jsonData.levelData.length; i++) {
            this.gameTypeDetails.push(this.jsonData.levelData[i].operation.gameType)
            this.operationTypeDetails.push(this.jsonData.levelData[i].operation.operationType)
        }

    }

    setCurrentLevelForGame(obj: any) {
        this.currentLevel = obj[0]
        this.currentType = obj[1];
    }
    update() {

    }



}