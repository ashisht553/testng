import { Component } from '@angular/core';
import { GameState } from '../../states/game.state';
import { DynamicMenu } from '../../../../shared/states/dynamic.menu';
import { GameUserData } from "../../../../shared/engine/game.user.data.service";


@Component({
    selector: 'cardgame',
    template: '<div id="content"></div>'
})


export class CardGame {
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
            preload: this.preload, create: this.create, update: this.update, initiateGame: this.initiateGame, init: this.init, dynamicMenuButtonClick: this.dynamicMenuButtonClick, handleIncorrect: this.handleIncorrect, handleCorrect: this.handleCorrect, userDataServiceCallBack: this.userDataServiceCallBack, showError: this.showError
        }, true, true);
    }

    init(param: any) {
        //this.userDataService = new UserData.UserLevelInfo();
        // setting default values for URL Params
        this.urlParams = {
            grade: "4",
            level: "",
            mode: "teacher",
            data: "",
            line: false,
            forceload: false,
            clear: false,
            debug: false,
            style: "2",
            lang: "en",
            mute: false
        }

        /**
         * initializing the parameters to be passed to the state
         */
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
            playIntroVideo: true,
            assignmentMode: -1,
            assignmentLevelId: -1,
            assetsLoaded: false,
            commontext: {}
        }

        // getting query string from the URL
        let qs = window.location.href.split('?')[1];
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
            console.error = function () { };
            // console.log = function(){};
        }

        /**
         * loading css only for device device.css
         */
        if (!this.game.device.desktop) {
            let link = document.createElement('link')
            link.setAttribute('rel', 'stylesheet')
            link.setAttribute('type', 'text/css')
            if (this.urlParams.lang == 'es'){
              link.setAttribute('href', 'css/device_es.css');
            }
            else{
              link.setAttribute('href', 'css/device.css');
            }
            document.getElementsByTagName('head')[0].appendChild(link)
        }

    }

    /**
      * To store the style of instruction shown on device orientation
    */
    protected orientationInstrTextStyle = {
        font: '120px impact',
        align: 'center',
        fill: '#FF0000'
    }

    /**
      * To store the instruction to be shown when we change the device orientation
    */
    protected orientationIntruction: Phaser.Group = null;

    /**
     * This method will get triggered when user view the game in wrong orientation (i.e portrait mode)
   */
    protected handleIncorrect() {

        this.orientationIntruction = this.game.add.group();

        let graphics_bg = this.game.add.graphics(0, 0);
        graphics_bg.beginFill(0x000000, 0.8);
        graphics_bg.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);
        graphics_bg.endFill();

        let background = this.game.add.sprite(0, 0, graphics_bg.generateTexture());
        let instrText = this.game.add.text(0, 0, this.initParams.commontext[this.initParams.urlParams.lang]["game_inst"], this.orientationInstrTextStyle);
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
     * Phaser to preload assets. 
    */
    preload() {
        // here we need to decide which json we need to load 
        // a sample url path would be
        // https://game?usertype=student&playmode=freeplay&grade=gk&levelid=gk12
        this.game.load.bitmapFont('impact_font', 'assets/fonts/impact_font.png', 'assets/fonts/impact_font.fnt');
        //this.game.load.json('leveldata', 'assets/data/card.json');
        //this.game.load.image('loading', 'assets/images/loading.png');
        this.game.load.bitmapFont('font_bold', 'assets/fonts/AvenirPrimaryHMHMath-Bold.png', 'assets/fonts/AvenirPrimaryHMHMath-Bold.fnt');
        // Assests using for common imgages like home & rewards etc
        this.game.load.atlas('UI', 'assets/images/ui_assets.png', 'assets/data/ui_assets.json');

        // preloading font
        this.game.load.bitmapFont('font_impact', 'assets/fonts/AvenirPrimaryHMHMath.png', 'assets/fonts/AvenirPrimaryHMHMath.fnt');
        this.game.load.bitmapFont('font_bold', 'assets/fonts/AvenirPrimaryHMHMath-Bold.png', 'assets/fonts/AvenirPrimaryHMHMath-Bold.fnt');
        this.game.load.bitmapFont('font_boldItalic', 'assets/fonts/AvenirPrimaryHMHMath-BoldItalic.png', 'assets/fonts/AvenirPrimaryHMHMath-BoldItalic.fnt');
        this.game.load.bitmapFont('font_italic', 'assets/fonts/AvenirPrimaryHMHMath-Italic.png', 'assets/fonts/AvenirPrimaryHMHMath-Italic.fnt');

        // preloading JSON for grade
        // this.game.load.json('leveldata', 'assets/data/card.json');
        // preloading JSON for grade
        this.game.load.json('leveldata', 'assets/data/card_grade_' + this.urlParams.grade + '_data_'+this.initParams.urlParams.lang+'.json');

        // preloading common text content 
        //this.game.load.json('commontext', '../../../../shared/assets/data/common_text.json');
        this.game.load.json('commontext', './shared/assets/data/common_text.json');

        // splash screen image
        if(this.initParams.urlParams.lang === "en"){
            this.game.load.image('splashscreen', 'assets/images/splashscreen.png');
        }else{
            this.game.load.image('splashscreen', 'assets/images/splashscreen_es.png');
        }

        /**
         * following files will give error
         */
        //  this.game.load.image('splashscreen-err', 'assets/images/splashscreen22.png')
        // this.game.load.image('leveldata-err', 'assets/data/pog.gradeg' + this.urlParams.grade + '.data.json')//.onFileError.add(this.showError,this);

        this.game.load.onFileError.add(this.showError, this)

    }

    showError(key: string, obj: any) {
        console.log("%cKey Name: ", "display:inline;")
        console.log("%c" + obj.key, "color:red;display:inline;")
        console.log("%c" + obj.url, "color:red;display:inline;")
        // obj.key, obj.url)
    }
    //Student Username\password:
    //g2student@1\password@1   

    create() {
        let splash = this.game.add.sprite(0, 0, "splashscreen");
        let arr: any = [];
        let gameInstance = this;
        this.initParams.commontext = this.game.cache.getJSON('commontext');
        //this.loadtext = this.game.add.text(200, 200, this.initParams.commontext[this.initParams.urlParams.lang]["game_init"], { font: "25px Arial", fill: "#ffffff", align: "center" });
        //this.loadtext.x = (this.BASE_GAME_WIDTH - this.loadtext.width) / 2;
        //this.loadtext.y = (this.BASE_GAME_HEIGHT - this.loadtext.height) / 2;

        //this.userDataService = new UserData.UserLevelInfo(arr);
        // this.initParams.userDataService = this.userDataService;
        this.currentLevel = 0;
        // adding different states to the game
        this.game.state.add('DynamicMenu', DynamicMenu);
        this.game.state.add('GameState', GameState);

        // assigning JSON data
        this.jsonData = this.game.cache.getJSON('leveldata');

        this.initParams.commontext = this.game.cache.getJSON('commontext')[this.urlParams.lang];
        //console.log(this.initParams.commontext);
        this.gameUserDataService = new GameUserData.gameUserDataService(this.initParams.commontext);
        this.initParams.gameUserDataServiceCAS = this.gameUserDataService;
        //console.log(window.location.href.toLowerCase().indexOf("assignment"));
        this.gameUserDataService.initGameUserDataServiceCall(this.jsonData, this);

        //if (this.initParams.commontext[this.initParams.urlParams.lang]) {
        //console.log("this.localization gamecompo ::", this.initParams.commontext[this.initParams.urlParams.lang]["game_init"]);
        //return this.initParams.commontext[this.initParams.urlParams.lang]["game_init"];
        //this.loadtext = this.game.add.text(200, 200, this.initParams.commontext[this.initParams.urlParams.lang]["game_init"], { font: "25px Arial", fill: "#ffffff", align: "center" });
        // }
    }

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
      *  Loads the game/dynamic menu on the basis of url parameters. If we specify the level in the url then it will launch the game directly skipping dynamic menu.
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
            //let operationType = this.jsonData.levelData[Number(this.urlParams.level) - 1].operation.gameType;

            /** This piece of code is used to start game(specified level) directly without going through dynamic menu */
            /*if (operationType.toLowerCase() === "objects") {
                //this.game.state.start('AdditionGame', true, false, [levelID, "addition", this.userDataService, this.urlParams,gameInstance]);
                this.game.state.start('AdditionGame', true, false, [gameInstance.initParams]);
            } else {
               this.game.state.start('NumericGame', true, false, [this.initParams]);
            }*/
            this.game.state.start('GameState', true, false, [this.initParams]);
        }
        else {
            this.game.state.start('DynamicMenu', true, false, [this.initParams]);
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

        /*if (obj.gameType == "Objects") {
           this.game.state.start('AdditionGame', true, false, [this.initParams,menuAnimIndex]);
           
        } else {
           // this.game.state.start('NumericGame', true, false, [obj.id, obj.type, dataService, urlData,gameInstance]);
           this.game.state.start('NumericGame', true, false, [this.initParams,menuAnimIndex]);
        }*/
        this.game.state.start('GameState', true, false, [this.initParams, menuAnimIndex]);

    }


    /**
      *  To set the currentLevel variable.
      */
    setCurrentLevelForGame(obj: any) {
        this.currentLevel = obj[0]
        this.currentType = obj[1];
    }
    update() {

    }

}