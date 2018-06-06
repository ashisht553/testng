/**
 * @license Copyright HMH
 */

import { Component } from '@angular/core';
import { DynamicMenu } from '../../../../shared/states/dynamic.menu';
import { FunctionMatchGame } from '../../states/functionMatch.game';
import { GameUserData } from "../../../../shared/engine/game.user.data.service";

@Component({
    selector: 'fmgame',
    template: '<div id="content"></div>'
})

/**
 * Represents a class.
 * @class FMGame
 */
export class FMGame {

    /**
     * Variable to hold Phaser.Game properties
     */
    game: Phaser.Game;

    /**
     * Variable to hold currnet level information
     */
    currentLevel: number = 0;

    /**
     * Variable to hold currnet type information
     */
    currentType: string;

    /**
     * Variable to store game's leveldata
     */
    jsonData: any;

    /**
     * This property will have the predefined params from URL
     */
    urlParams: any = null;

    /**
     * Boolean variable to store parameter's loaded state
     */
    isURlParamsLoaded = false;

    /**
     * This property is used to store the gameUserDataService object
     */
    gameUserDataService: GameUserData.gameUserDataService;

    /**
     * this property will be an object and hold all the intial parameters
     * required to load the game state
     */
    initParams: any;

    /**
     * Variable used to store the text to display in the loading screen
     */
    loadText: Phaser.Text;

    /**
     * Represents a constructor where the game properties would be initialized.
     * @constructor
     */
    constructor() {
        this.game = new Phaser.Game(2048, 1408, Phaser.CANVAS, 'content', {
            preload: this.preload, create: this.create, update: this.update, dynamicMenuButtonClick: this.dynamicMenuButtonClick, handleIncorrect: this.handleIncorrect, handleCorrect: this.handleCorrect, userDataServiceCallBack: this.userDataServiceCallBack, initiateGame: this.initiateGame
        }, true, true);
    }

    /**
     * Represents a method, It will preload required assets
     * @method preload
     */
    preload() {
        // To load images and fonts to display in loading screen and loading error pop up
        
        this.game.load.bitmapFont('Frutiger', 'assets/fonts/FrutigerLTStdBlack.png', 'assets/fonts/FrutigerLTStdBlack.fnt');
        this.game.load.image('Confirm_Popup', 'assets/images/popup_confirm.png');
        this.game.load.atlas('UI', 'assets/images/UI_assets.png', 'assets/data/ui_assets.json');
        // preloading common text content 
        //this.game.load.json('commontext', '../../../../shared/assets/data/common_text.json');
        this.game.load.json('commontext', './shared/assets/data/common_text.json');

        this.urlParams = {
            grade: 3,
            level: null,
            mode: "teacher",
            forceload: false,
            clear: false,
            debug: false,
            video: true,
            lang: "en",
            mute: false
        }
        
        /**
        * initializing the parameters which will be passed to the state
        */
        this.initParams = { 
            levelID: '',
            urlParams: this.urlParams,
            parent: this,
            gameUserDataServiceCAS: null,
            audiomute: false,
            animationCheck: false,
            directPlayAnimationPrevent: false,
            indexBool:true,
            playIntroVideo : true,
            assignmentMode: -1,
            assignmentLevelId:-1,
            assetsLoaded: false,
            commontext: {}
        }
        


        //this.loadText = this.game.add.text(200, 200, this.initParams.commontext[this.initParams.urlParams.lang]["game_init"], { font: "25px Arial", fill: "#ffffff", align: "center" });
        //this.loadText.x = (this.game.width - this.loadText.width) / 2;
        //this.loadText.y = (this.game.height - this.loadText.height) / 2;

        // To get query string from the URL
        let qs = window.location.href.split('?')[1];
        var params: any = {},
            tokens: any,
            re = /[?&]?([^=]+)=([^&]*)/g;
        while (tokens = re.exec(qs)) {
            this.urlParams[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }
        this.game.load.json('leveldata', `assets/data/functionMatch.g${this.urlParams.grade}.data_${this.initParams.urlParams.lang}.json`);
        if(this.initParams.urlParams.lang == 'es'){
            this.game.load.image('splashscreen', 'assets/images/splashscreen_es.png');
        }else{
            this.game.load.image('splashscreen', 'assets/images/splashscreen.png');
        }
        this.initParams.assignmentMode = window.location.href.toLowerCase().indexOf("assignment");
        this.game.canvas.oncontextmenu = function (e) { return false; }
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        if (this.urlParams.debug === false) {
            console.log = function () { };
            console.warn = function () { };
        }

        /**
         * loading css only for device device.css
         */
        
        if (!this.game.device.desktop) {
            let link = document.createElement('link')
            link.setAttribute('rel', 'stylesheet')
            link.setAttribute('type', 'text/css')
            if (this.urlParams.lang == 'es'){
                link.setAttribute('href', 'css/device_es.css')
            }
            else{
                link.setAttribute('href', 'css/device.css')
           }
               
            document.getElementsByTagName('head')[0].appendChild(link)
        }
    }

    /**
     * Text style for orientation instruction
     */
    protected orientationInstrTextStyle = {
        font: '120px impact',
        align: 'center',
        fill: '#FF0000'
    }

    /**
    *Phaser group used to display warning message while loading the game on porttrait mode 
    */
    protected orientationIntruction: Phaser.Group = null;

    /**
     * This method will get triggered when user view the game in wrong orientation (i.e portrait mode)
   */
    protected handleIncorrect() {
        this.orientationIntruction = this.game.add.group();
        let graphics_bg = this.game.add.graphics(0, 0);
        graphics_bg.beginFill(0x000000, 0.8);
        graphics_bg.drawRect(0, 0, this.game.width, this.game.height);
        graphics_bg.endFill();
        let background = this.game.add.sprite(0, 0, graphics_bg.generateTexture());
        let instrText = this.game.add.text(
            0,
            0,
            this.initParams.commontext[this.initParams.urlParams.lang]["game_inst"],
            this.orientationInstrTextStyle);
        instrText.x = background.width / 2 - instrText.getBounds().width / 2;
        instrText.y = background.height / 2 - instrText.getBounds().height / 2 + 10;
        background.addChild(instrText);
        graphics_bg.destroy();
        this.orientationIntruction.add(background);
        this.game.paused = true;
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
     * Called after preload method used to add different states to the game and get the user data
     * 
     * 
     * @memberOf FMGame
     */
    create() {
        let splash = this.game.add.sprite(0, 0, "splashscreen");
        let arr: any = [];
        let gameInstance = this;
        this.currentLevel = 0;
        
        this.initParams.commontext = this.game.cache.getJSON('commontext');
        console.log("this.initParams.commontext",this.initParams.commontext);

        // adding different states to the game
        this.game.state.add('DynamicMenu', DynamicMenu);
        this.game.state.add('FunctionMatchGame', FunctionMatchGame);

        // assigning JSON data
        this.jsonData = this.game.cache.getJSON('leveldata');
		this.initParams.commontext = this.game.cache.getJSON('commontext')[this.urlParams.lang];
        this.gameUserDataService = new GameUserData.gameUserDataService(this.initParams.commontext);
        this.initParams.gameUserDataServiceCAS = this.gameUserDataService;
        this.gameUserDataService.initGameUserDataServiceCall(this.jsonData, this);
    }

    /**
     * This callback method is called from user data service after getting the user's data
     * 
     * @param {GameUserData.IGameUserData} gameUserData
     * 
     * @memberOf FMGame
     */
    userDataServiceCallBack(gameUserData: GameUserData.IGameUserData) {
        /**
         * setting the user mode to check if the user is teacher or student
         */
        if (gameUserData.mode !== "")
            this.urlParams.mode = gameUserData.mode.toLowerCase();
        this.initParams.userDataServiceCAS = this.gameUserDataService;
        this.initiateGame();
    }

    /**
     * This method is used to start the game to play or show the dynamic menu based on the URL params
     * 
     * @memberOf FMGame
     */
    initiateGame() {
        let gameInstance = this;
        if (this.urlParams.level === null) {
            this.game.state.start('DynamicMenu', true, false, [this.initParams]);
        } else {
            this.initParams.levelID = this.urlParams.level;
            this.isURlParamsLoaded = true;
            this.game.state.start('FunctionMatchGame', true, false, [this.urlParams.level, this.initParams]);
        }
    }

    /** 
     * Its default life cyle method of phaser js. This mthod will be executed repeatedly in certan intervals.
     */
    update() {
        // nothing
    }

    /**
    * method is used to handle Dynamic menu click events
    * @param 'obj'  array of menu elements
    * @param 'animIndex'  current Unlock animation Index
    */
    dynamicMenuButtonClick(obj: any, animIndex: number) {
        let gameInstance = this;
        gameInstance.initParams.levelID = obj.id;
        this.initParams.userDataServiceCAS = this.gameUserDataService;
        this.initParams.directPlayAnimationPrevent = true;
        let levelIndex = Number(this.jsonData.levelData.map(function (x: any) { return x.id; }).indexOf(gameInstance.initParams.levelID));
        this.game.state.start('FunctionMatchGame', true, false, [levelIndex + 1, gameInstance.initParams, animIndex]);
    }

}
