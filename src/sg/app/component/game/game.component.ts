/**
 * @license Copyright HMH
 */

import { Component } from '@angular/core';
import { DynamicMenu } from '../../../../shared/states/dynamic.menu';
import { SliderGame } from '../../states/slider.game';
import { GameUserData } from '../../../../shared/engine/game.user.data.service';

// Component definition
@Component({
    selector: 'slidergame',
    template: '<div id="content"></div>'
})

/**
 * Represents a class.
 * @class SG
 */
export class SG {

    /**
     * Variable to hold Phaser.Game properties
     */
    game: Phaser.Game;

    /**
     * Variable to hold currnet level information
     */
    currentLevel: number = 0;

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
            preload: this.preload, create: this.create, update: this.update, dynamicMenuButtonClick: this.dynamicMenuButtonClick, handleIncorrect: this.handleIncorrect, handleCorrect: this.handleCorrect, userDataServiceCallBack: this.userDataServiceCallBack,
            initiateGame: this.initiateGame
        }, true, true);
    }

    /**
     * Represents a method, It will preload required assets
     * @method preload
     */
    preload() {

        // setting URL Parameters default values
        this.urlParams = {
            grade: 3,
            level: null,
            mode: "teacher",
            forceload: false,
            clear: false,
            debug: false,
            mute: false,
            lang: "en",
            testing: false
        }

        this.loadText = this.game.add.text(200, 200, 'initializing game...', { font: '25px Arial', fill: '#ffffff', align: 'center' });
        this.loadText.x = (this.game.width - this.loadText.width) / 2;
        this.loadText.y = (this.game.height - this.loadText.height) / 2;

        // To get query string from the URL and update the values in the URL Params
        let qs = window.location.href.split('?')[1];
        var params: any = {},
            tokens: any,
            re = /[?&]?([^=]+)=([^&]*)/g;
        while (tokens = re.exec(qs)) {
            this.urlParams[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        /**
         * loading level design JSON based on @grade and @language selected
         * default language is English (en)
         */
        this.game.load.json('leveldata', `assets/data/sliderGame.g${this.urlParams.grade}.data_${this.urlParams.lang}.json`);
        this.game.load.json('pointsdata', `assets/data/points.json`);

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
            indexBool: true,
            playIntroVideo: true,
            assignmentMode: -1,
            assignmentLevelId: -1,
            commontext: {}
        }

        // checking and assigning the assignment mode to the init Params
        this.initParams.assignmentMode = window.location.href.toLowerCase().indexOf("assignment");
        this.game.canvas.oncontextmenu = function (e) { return false; }
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        if (this.urlParams.debug === false) {
            console.log = function () { };
            console.warn = function () { };
        }

        /**
         * loading css which will suit only for devices
         */
        if (!this.game.device.desktop) {
            let link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            if (this.urlParams.lang == 'es')
                link.setAttribute('href', 'css/device_es.css')
            else
                link.setAttribute('href', 'css/device.css')
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        // To load images and fonts to display in loading screen and loading error pop up
        this.game.load.image('splashscreen', 'assets/images/splashscreen_' + this.urlParams.lang + '.png');
        this.game.load.bitmapFont('AP_Black', 'assets/fonts/FrutigerLTStdBlack.png', 'assets/fonts/FrutigerLTStdBlack.fnt');
        this.game.load.image('Confirm_Popup', 'assets/images/popup_confirm.png');
        this.game.load.atlas('UI', 'assets/images/gym_UI.png', 'assets/data/gym_UI.json');
        this.game.load.json('commontext', './shared/assets/data/common_text.json');
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
        let handleBackground = this.game.add.graphics(0, 0);
        handleBackground.beginFill(0x000000, 0.8);
        handleBackground.drawRect(0, 0, this.game.width, this.game.height);
        handleBackground.endFill();
        let background = this.game.add.sprite(0, 0, handleBackground.generateTexture());
        let instrText = this.game.add.text(
            0,
            0,
            'Please switch to \n landscape mode \n to play the game...',
            this.orientationInstrTextStyle);
        instrText.x = background.width / 2 - instrText.getBounds().width / 2;
        instrText.y = background.height / 2 - instrText.getBounds().height / 2 + 10;
        background.addChild(instrText);
        handleBackground.destroy();
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
     * @memberOf SliderGame
     */
    create() {
        let splash = this.game.add.sprite(0, 0, 'splashscreen');
        let arr: any = [];
        let gameInstance = this;
        this.currentLevel = 0;

        // adding different states to the game
        this.game.state.add('DynamicMenu', DynamicMenu);
        this.game.state.add('SliderGame', SliderGame);

        this.initParams.commontext = this.game.cache.getJSON('commontext')[this.urlParams.lang];

        // assigning JSON data
        this.jsonData = this.game.cache.getJSON('leveldata');
        this.gameUserDataService = new GameUserData.gameUserDataService(this.initParams.commontext);
        this.initParams.gameUserDataServiceCAS = this.gameUserDataService;
        this.gameUserDataService.initGameUserDataServiceCall(this.jsonData, this);
    }

    /**
     * This callback method is called from user data service after getting the user's data
     * 
     * @param {GameUserData.IGameUserData} gameUserData
     * 
     * @memberOf SliderGame
     */
    userDataServiceCallBack(gameUserData: GameUserData.IGameUserData) {
        /**
         * To set the user mode to check whether the user is teacher or student
         */
        if (gameUserData.mode !== '')
            this.urlParams.mode = gameUserData.mode.toLowerCase();
        this.initParams.userDataServiceCAS = this.gameUserDataService;
        this.initiateGame();
    }

    /**
     * This method is used to start the game to play or show the dynamic menu based on the URL params
     * 
     * @memberOf SliderGame
     */
    initiateGame() {
        let gameInstance = this;
        if (this.urlParams.level === null) {
            this.game.state.start('DynamicMenu', true, false, [this.initParams]);
        } else {
            this.initParams.levelID = this.urlParams.level;
            this.isURlParamsLoaded = true;
            this.game.state.start('SliderGame', true, false, [this.urlParams.level, this.initParams]);
        }
    }

    /** 
     * Its default life cyle method of phaser js. This mthod will be executed repeatedly in certan intervals.
     */
    update() {

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
        this.game.state.start('SliderGame', true, false, [levelIndex + 1, gameInstance.initParams, animIndex]);
    }
}