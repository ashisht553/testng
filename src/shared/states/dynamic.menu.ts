import { DynamicMenuEngine } from '../engine/dynamicmenu.engine'
import { UserData } from "../engine/game.user.data";
import { GameUserData } from "../../shared/engine/game.user.data.service";
export class DynamicMenu extends Phaser.State {

    /**
     * this variable is used to store cached json
     */
    UIdata: Array<Object>;

    /**
     * this property is using for background image
     */
    background: Phaser.TileSprite = null;

    /**
     * this variable is used for stadium image
     */
    stadium: Phaser.Sprite;

    /**
     * this variable is an instance of engine's class
     */
    dynamicMenuEngine: DynamicMenuEngine.Engine;

    /**
     * variable used to track current level of game
     */
    currentLevel: number = 0;

    /**
     * variable used to show grade lebel & text
     */
    gradeLabel: Phaser.Sprite;
    gradeText: Phaser.BitmapText;

    /**
     * this variable is used to draw lines between menu elements
     */
    connectedLine: Phaser.BitmapData;

    /**
     * this group is used to resize connected lines
     */
    connectedLineGroup: Phaser.Group;

    /**
   * this property will be an object and hold the drop sound
   */
    drop: Phaser.Sound;

    /**
     * this property will hold the BG bgaudio
     */
    bgAudio: Phaser.Sound;

    /**
     * these property are used to show button
     */
    up_arrow: Phaser.Sprite;
    down_arrow: Phaser.Sprite;
    showButton: boolean = true;

    /**
     * this group is used to resize menu Items
     */
    menuItemsGroup: Phaser.Group;

    /**
     * variable used to store grade name from json
     */
    gradeName: string;

    /**
     * these variable are used for resizing purpose
     */
    BASE_GAME_HEIGHT: number = 1408;
    BASE_GAME_WIDTH: number = 2048;
    Width_Ratio: number;
    Height_Ratio: number;

    /**
     * Properties to keep the check on resizing of the screen and 
     * the change in the resolution values
     */
    gameHeight: number;
    gameWidth: number;
    scaleRate: number;
    prevWindowWidth: number;

    /**
     * these variables are used to set position for menuElements
     */
    MenuButtonPosition: Array<number> = [];
    yPos: number;
    yGap: number = 400;

    /**
     * variable used for camera
     */
    cursors: Phaser.CursorKeys;

    /**
     * this variable is used to determine game bound based on menu element's length
     */
    gameBound: number;

    /**
     * this property will hold the data json
     */
    jsonData: any;

    /**
     * this variable is used for description button beside grade sybol
     */
    DescriptionToggleButton: Phaser.Sprite;

    /**
     * this variable is used to sho/Hide description for stages
     */
    DescriptionTextArray: Array<any> = [];

    /**
     * these variables are used to smooth menu scrolling
     */
    scrollUp: boolean = false;
    scrollDown: boolean = false;

    /**
     * this variable is used to set camera position when returns back from game screen
     */
    cameraPos: any;

    /**
     * this property will hold the user leve data information
     */
    //userDataService: UserData.UserLevelInfo;
    userDataServiceCAS: GameUserData.gameUserDataService;

    /**
     * this property will check whether game Mode is teacher or Student
     */
    urlMode: any;

    /**
     * this property is used to store game level id when returns back from game
     */
    levelId: any;

    /**
     * this property is used to work as game component instance
     */
    gameData: any;

    /**
    * this property will be an object and hold all the intial parameters
    * required to load the game state
    */
    initParams: any;

    /**
     * These properties are used to handle Unlock animation in student Mode
     */
    animateGG: boolean = true;
    ggMenuProgress: any;
    mask: Phaser.Graphics;
    index: number;

    /**
    * this property will be an object and hold the uparrow and downarrow sound
    */
    upArrow: Phaser.Sound;
    downArrow: Phaser.Sound;

    /**
    * this property will be an object and hold the flag sound
    */
    flag: Phaser.Sound;

    /**
     * this property will be an object and hold the whiteline sound
     */
    whiteLine: Phaser.Sound;

	/**
     * this property will be an object and hold the unlock level sound
     */
    unlockLevel: Phaser.Sound;

    /**
      * this property is used to store audio for info button click events
      */
    commonAudio: any;

    /**
     * this property is used to store audio to play when the player click on the level to play game
     */
    levelClickAudio: Phaser.Sound;

    /**
    * this property is used to store dynamic menu background music
     */
    backgroundMusic: any;

    /**
   * this property is used to store audio to play when user clicking on the locked level
    */
    lockedLevelAudio: any;

    /**
   * this property is used to get the properties which are comes to the dynamic menu state
    */
    params: any = null;

    /**
    * this property is used to hold the sound button icon
     */
    soundButton: Phaser.Sprite;

    // To display loading screen
    loadingScreen: Phaser.Sprite = null;


    /**
     * These variables are used for Smoother Scrolling
     */
    startPoint: number;
    velocity: number;
    amplitude: number;
    dragging: boolean = false;
    timestamp: any;
    autoScroll: boolean = false;
    timeConstant: number = 325;
    now: any;
    target: number;
    elapsed: number;

    /**
     * These variables are used for reward star on menu
    */
    _awardInfo: any;
    star: Phaser.Sprite;
    shineStar: Phaser.Sprite;
    levelStars: Phaser.Group;

    /**
     * Name of the game being loaded
     */
    gameName: string;

    /**
     * Variables used to play audio on end of the final leval in slider game
     */
    totalLevels: number = 0;
    finalLevelAudio: Phaser.Sound;

    /**
    * Variable used to block loading assets repeatedly everytime user come back to dynamic menu and goes into game
    */
    imagesToLoad: Array<string> = [];
    audiosToLoad: Array<string> = [];
    fontsToLoad: Array<string> = [];
    jsonToLoad: Array<string> = [];
    videosToLoad: Array<string> = [];
    assetsLoaded: boolean = false;
    preloadCalledManually: boolean = false;

    /**
     *
     * Variables used to play intro animation
     * @memberof DynamicMenu
     */
    introVideoPlayed: boolean = true;
    gameOverVideoplay: boolean = true;

    introVideo: Phaser.Video;
    introVideoField: Phaser.Graphics;
    introVideoSprite: any;
    protected shadowLine: number = 1;
    playIntroVideo: boolean;
    playBtn: Phaser.Sprite;

    constructor() {
        super();
    }

    /**
     * This is a inbuild function of Phaser State.
     * Here used to preload assests
     */
    preload() {
    	this.game.stage.disableVisibilityChange = true;
        /**
         * this.assetsLoaded has boolean value let the function know if preloading is already
         */
        if (!this.assetsLoaded) {
            // Loading Fonts used in DynamicMenu
            this.game.load.bitmapFont('frutiger_Black', 'shared/assets/fonts/FrutigerLTStd Black_0.png', 'shared/assets/fonts/FrutigerLTStd Black.fnt');

            // Loading All Backgrounds Images
            this.game.load.image('background', 'shared/assets/images/Backgrounds/game_menu-bg' + this.initParams.urlParams.grade + '.png');

            //loading audio
            this.game.load.audio('drop', 'shared/assets/audio/generic_pop_V2.mp3');
            this.game.load.audio('upArrow', 'shared/assets/audio/new_pop_Gb2.mp3');
            this.game.load.audio('downArrow', 'shared/assets/audio/new_pop_E2.mp3');
            this.game.load.audio('flag', 'shared/assets/audio/bendy_Eb5.mp3');
            this.game.load.audio('bgaudio', 'shared/assets/audio/Afro_brazilian_fun_FINAL.mp3');
            this.game.load.audio('whiteLine', 'shared/assets/audio/slide_whistle_up.mp3');
            this.game.load.audio('unlockLevel', 'shared/assets/audio/vibraphone_delay_chord.mp3');
            this.game.load.audio('locked_level', 'shared/assets/audio/generic_error.mp3');
            this.game.load.audio('pop_sound', 'shared/assets/audio/new_pop_Gb2.mp3');
            this.game.load.audio('levelClickAudio', 'shared/assets/audio/new_pop_Gb2.mp3');
            this.game.load.audio('final_level', 'shared/assets/audio/brass_win_march31.mp3');

            // Loading UI images
            this.game.load.atlas('menuUI', 'shared/assets/images/UI/game_menu_UI.png', 'shared/assets/images/UI/game_menu_UI.json');
            this.game.load.atlas('menuUIGG', 'shared/assets/images/UI/Object_GG1.png', 'shared/assets/images/UI/Object_GG1.json');
            this.game.load.atlas('hit', 'shared/assets/images/UI/hit_animation.png', 'shared/assets/images/UI/hit_animation.json');
            this.game.load.atlas('Basket_UI', 'shared/assets/images/UI/basket_ui.png', 'shared/assets/images/UI/basket_ui.json');

            // loading intro animation
            this.game.load.video('intro_animation', 'shared/assets/videos/intro_animation.mp4');

            if (this.imagesToLoad.length == 0) {
                this.imagesToLoad.push('background');
            }
            if (this.fontsToLoad.length == 0) {
                this.fontsToLoad.push('frutiger_Black');
            }

            if (this.audiosToLoad.length == 0) {
                this.audiosToLoad.push('drop');
                this.audiosToLoad.push('upArrow');
                this.audiosToLoad.push('downArrow');
                this.audiosToLoad.push('flag');
                this.audiosToLoad.push('bgaudio');
                this.audiosToLoad.push('whiteLine');
                this.audiosToLoad.push('unlockLevel');
                this.audiosToLoad.push('locked_level');
                this.audiosToLoad.push('pop_sound');
                this.audiosToLoad.push('levelClickAudio');
                this.audiosToLoad.push('final_level');
            }

            if (this.jsonToLoad.length == 0) {
                this.jsonToLoad.push('menuUI');
                this.jsonToLoad.push('menuUIGG');
                this.jsonToLoad.push('hit');
                this.jsonToLoad.push('Basket_UI');
            }

            if (this.videosToLoad.length == 0) {
                this.videosToLoad.push('intro_animation');
            }

            if (this.preloadCalledManually) {
                this.preloadCalledManually = false;
                this.game.load.start();
                this.game.load.onLoadComplete.add(this.create, this);
            }
        }
    }

    /**
     * This is a inbuild function of Phaser State, it is called after constructor but before create().
     * Here used to initialize some properties and preparing for the resizing  
     * @param params  having all the initial values for the game state to work and render object correctly
     */
    init(params: any) {
        if (this.animateGG) {
            this.cameraPos = {
                startX: 0,
                startY: 0,
                destX: 0,
                destY: 0,
                prevX: 0,
                prevY: 0,
                maskY: 0,
                indexNum: 0,
                guideX: 0,
                guideY: 0
            };
        }

        this.loadingScreen = this.game.add.sprite(0, 0, "splashscreen");
        this.initParams = params[0];
        this.userDataServiceCAS = this.initParams.gameUserDataServiceCAS;
        this.urlMode = this.initParams.urlParams;
        this.gameData = this.initParams.parent;
        this.playIntroVideo = this.initParams.playIntroVideo;
        if (params[1] !== undefined) {
            this.index = params[1];
        }

        if (params[2] !== undefined) {
            this.levelId = params[2];
            this.cameraPos.destY = 1;
        }

        if (params[3] !== undefined) {
            this.totalLevels = params[3];
        }
        this.jsonData = this.game.cache.getJSON('leveldata');
        this.game.scale.forceOrientation(true, false);
        this.game.scale.enterIncorrectOrientation.add(this.handleIncorrect, this);
        this.game.scale.leaveIncorrectOrientation.add(this.handleCorrect, this);
        this.game.input.maxPointers = 1;
        this.game.stage.disableVisibilityChange = false;

        // Resizing variables
        if (this.showButton) {
            this.Width_Ratio = this.BASE_GAME_WIDTH / this.BASE_GAME_HEIGHT;
            this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
            this.game.scale.pageAlignHorizontally = true;
            this.game.scale.pageAlignVertically = true;
            this.game.scale.setResizeCallback(this.resizeGame, this);
        }
        this.game.input.maxPointers = 1;
        this.game.stage.disableVisibilityChange = false;
        this.game.input.mouse.mouseWheelCallback = this.mouseWheel;
    }
    /**
     * @param event passes the mouseWheel event to make the stage scroll up and down based on the event
     */
    mouseWheel(event:MouseWheelEvent) {  
        let _event:any =  event;
        if(_event.wheelDelta < 0 || _event.deltaY > 0) {
            this.camera.y += 50;
        } else {
            this.camera.y -= 50;
        }
    }
    /**
     * This method is used / called to handle all resize work on screen size change
     */
    resizeGame() {
        var w = window.innerWidth,
            h = window.innerHeight;

        if (w >= h * this.Width_Ratio) {
            this.gameHeight = h;
            this.gameWidth = h * this.Width_Ratio;

        } else {
            this.gameWidth = w;
            this.gameHeight = w / this.Width_Ratio;
        }

        this.scaleRate = this.gameHeight / this.BASE_GAME_HEIGHT;
        this.game.scale.setUserScale(this.scaleRate, this.scaleRate);
    }

    /**
     * This is a default function from Phaser.State, used here to initialize the different part on UI
     */
    create() {
        this.assetsLoaded = true;
        this.imagesToLoad.forEach((key => {
            if (!this.game.cache.checkImageKey(key)) {
                this.assetsLoaded = false;
            }
        }));

        this.audiosToLoad.forEach((key => {
            if (!this.game.cache.checkSoundKey(key)) {
                this.assetsLoaded = false;
            }
        }));

        this.fontsToLoad.forEach((key => {
            if (!this.game.cache.checkBitmapFontKey(key)) {
                this.assetsLoaded = false;
            }
        }));

        this.jsonToLoad.forEach((key => {
            if (!this.game.cache.checkImageKey(key)) {
                this.assetsLoaded = false;
            }
        }));

        this.videosToLoad.forEach((key => {
            if (!this.game.cache.checkVideoKey(key)) {
                this.assetsLoaded = false;
            }
        }));

        if (!this.assetsLoaded) {
            this.preloadCalledManually = true;
            this.preload();
        } else {
            if (this.playIntroVideo && this.urlMode.skipintro === undefined) {
                this.playIntroAnimation();
            } else {
                this.createMenuUI();
            }
        }

        this.game.sound.mute = this.initParams.audiomute;
    }

    /**
     * initialize groups
     */
    initGroups() {
        // Creating background image
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.gameBound, 'background');
        this.connectedLineGroup = this.game.add.group();

        // Initializing Smooth Scrolling
        this.background.inputEnabled = true;
        this.background.events.onInputDown.add(this.beginMove, this);
        this.background.events.onInputUp.add(this.endMove, this);
        this.game.input.addMoveCallback(this.dragCamera, this);
    }

    /**
     * this method is used to start scrolling
     * @Member of Smooth Scrolling
     */
    beginMove() {
        this.startPoint = this.game.input.y;
        this.dragging = true;
        this.timestamp = Date.now();
        this.velocity = 0;
        this.amplitude = 0;
    }

    /**
     * this method will be called after removal of event for scrolling
     * @Member of Smooth Scrolling
     */
    endMove() {
        this.dragging = false;
        this.autoScroll = false;
        if (this.game.input.activePointer.withinGame && (this.velocity > 10 || this.velocity < -10)) {
            this.amplitude = 0.8 * this.velocity;
            this.now = Date.now();
            this.target = Math.round(this.game.camera.y - this.amplitude);
            this.autoScroll = true;
        }
        if (!this.game.input.activePointer.withinGame) {
            this.autoScroll = true;
        }
        if (this.velocity == undefined)
            this.velocity = 0;

    }

    /**
     * this method is used to move camera during Menu scrolling
     * @Member of Smooth Scrolling
     */
    dragCamera(pointer: any, x: any, y: any) {
        if (this.dragging) {
            if (this.startPoint != this.game.input.y) {
                let delta = y - this.startPoint; //Compute move distance
                this.startPoint = y;
                this.now = Date.now();
                this.elapsed = this.now - this.timestamp;
                this.timestamp = this.now;

                let v = 1000 * delta / (1 + this.elapsed);
                this.velocity = 0.8 * v + 0.2 * this.velocity;
                this.game.camera.y -= delta;
            }
        }
    }

    /**
     * initialize Arrow_button
     */
    initArrowButtons() {

        // Creating Upper Arrow Button
        this.up_arrow = this.game.add.sprite(0, 0, 'menuUI', 'up_arrow0000');
        this.up_arrow.x = this.BASE_GAME_WIDTH - this.up_arrow.width * 1.2 + (this.up_arrow.width / 2);
        this.up_arrow.y = 25 + (this.up_arrow.height / 2);
        this.up_arrow.anchor.setTo(0.5);
        this.up_arrow.inputEnabled = true;
        this.up_arrow.input.pixelPerfectClick = true;
        this.up_arrow.input.pixelPerfectOver = true;
        this.up_arrow.input.useHandCursor = true;
        this.up_arrow.fixedToCamera = true;
        this.up_arrow.events.onInputDown.add(() => {
            this.scrollUp = true;
            this.up_arrow.frameName = "press_arrow0000";
        });
        this.up_arrow.events.onInputUp.add(() => {
            this.upArrow.play();
            this.scrollUp = false;
            this.up_arrow.frameName = "up_arrow0000";
        });

        // Creating Down Arrow Button
        this.down_arrow = this.game.add.sprite(0, 0, 'menuUI', 'down_arrow0000');
        this.down_arrow.anchor.set(0.5);
        this.down_arrow.x = this.BASE_GAME_WIDTH - this.down_arrow.width * 1.2 + (this.down_arrow.width / 2);
        this.down_arrow.y = this.BASE_GAME_HEIGHT - this.down_arrow.height * 1.2 + (this.down_arrow.height / 2); //+ (this.yGap / 4);
        this.down_arrow.inputEnabled = true;
        this.down_arrow.input.pixelPerfectClick = true;
        this.down_arrow.input.pixelPerfectOver = true;
        this.down_arrow.input.useHandCursor = true;
        this.down_arrow.fixedToCamera = true;
        this.down_arrow.events.onInputDown.add(() => {
            this.downArrow.play();
            this.scrollDown = true;
            this.down_arrow.scale.y *= -1;
            this.down_arrow.frameName = "press_arrow0000";
        });
        this.down_arrow.events.onInputUp.add(() => {
            this.scrollDown = false;
            this.down_arrow.scale.y *= -1;
            this.down_arrow.frameName = "down_arrow0000";
        });
    }

    /**
     * this method is responsible to fetch level data from json based on parameter
     * @param 'gradeval'  json block name
     * @param 'gradeName'  grade name to set on menu screen
     * @param 'gameName'  game Title to set on menu screen
     */
    setMenuStage(gradeval: any, gradeName: any, gameName: any) {
        let gradeData = gradeval;

        if (this.menuItemsGroup !== undefined || this.connectedLine !== undefined) {
            this.clearMenuStage();
        }

        this.dynamicMenuEngine = new DynamicMenuEngine.Engine(gradeData);
        this.setMenuItemsOnStage(this.dynamicMenuEngine.menuElements);
        this.setLinkedButton();

        // Adding Grade Info Backfround
        this.gradeLabel = this.game.add.sprite(0, 0, 'menuUI', 'bg_UI0000');

        // Adding poggleMX Image
        let poggleMX = this.game.add.sprite(0, 0, 'menuUI', 'pogglesMX_logo0000')
        this.gradeLabel.addChild(poggleMX)
        poggleMX.anchor.setTo(-0.07, 0);

        // Adding Grade Details Text
        let gradeDetailsText: any;
        let gradeDetails: any;
        let pogGameLabel: any;
        let language = this.initParams.urlParams.lang;
        switch (gameName) {
            case 'POG':
                gradeDetailsText = this.initParams.commontext.pog_gradeDetailsText;
                if(language == 'en')
                    gradeDetails = this.game.add.bitmapText(60, 0, 'frutiger_Black', gradeDetailsText, 30);
                else
                    gradeDetails = this.game.add.bitmapText(240, 0, 'frutiger_Black', gradeDetailsText, 30);                    
                poggleMX.addChild(gradeDetails);
                gradeDetails.anchor.setTo(-0.15, -4.75)

                pogGameLabel = this.game.add.sprite(0, 0, 'menuUI', 'POG_logo0000');
                this.gradeLabel.addChild(pogGameLabel);
                pogGameLabel.scale.setTo(0.85)
                pogGameLabel.anchor.setTo(-1.25, -2.45);

                break;
            case 'FMG':
                gradeDetailsText = this.initParams.commontext.fm_gradeDetailsText;
                gradeDetails = this.game.add.bitmapText(100, 0, 'frutiger_Black', gradeDetailsText, 35);
                poggleMX.addChild(gradeDetails);
                gradeDetails.anchor.setTo(-0.5, -4)

                let fmgGameLabel = this.game.add.sprite(130, 70, 'menuUI', 'FunctionMatch_logo0000');
                this.gradeLabel.addChild(fmgGameLabel);
                fmgGameLabel.anchor.setTo(-1, -1);
                break;

            case 'SG':
                gradeDetailsText = this.initParams.commontext.sg_gradeDetailsText;
                if (language == 'en')
                    gradeDetails = this.game.add.bitmapText(-50, 0, 'frutiger_Black', gradeDetailsText, 35);
                else
                    gradeDetails = this.game.add.bitmapText(-50, 0, 'frutiger_Black', gradeDetailsText, 35);                    
                poggleMX.addChild(gradeDetails);
                gradeDetails.anchor.setTo(-0.5, -4)

                let sgGameLabel = this.game.add.sprite(130, 40, 'menuUI', 'slidergame_logo0000');
                this.gradeLabel.addChild(sgGameLabel);
                sgGameLabel.anchor.setTo(-1, -1);
                break;
            default:
                gradeDetailsText = this.initParams.commontext.card_gradeDetailsText;
                if (language == 'en')
                    gradeDetails = this.game.add.bitmapText(30, 0, 'frutiger_Black', gradeDetailsText, 35);
                else
                    gradeDetails = this.game.add.bitmapText(-15, 0, 'frutiger_Black', gradeDetailsText, 35);
                poggleMX.addChild(gradeDetails);
                gradeDetails.anchor.setTo(-0.5, -4)

                pogGameLabel = this.game.add.sprite(0, 0, 'menuUI', 'CardGame_logo0000');
                this.gradeLabel.addChild(pogGameLabel);
                pogGameLabel.anchor.setTo(-1.9, -1.9);
                break;
        }

        // Adding Grade Text
        this.gradeText = this.game.add.bitmapText(115, 290, 'frutiger_Black', gradeName, 60);
        this.gradeLabel.addChild(this.gradeText);
        this.gradeText.anchor.setTo(0.5);

        // Adding Info toggle Button
        this.DescriptionToggleButton = this.game.add.sprite(this.gradeLabel.width - 45, this.gradeLabel.height - 90, 'menuUI', 'info_btn_off0000');
        this.gradeLabel.addChild(this.DescriptionToggleButton)
        this.DescriptionToggleButton.anchor.setTo(.5)
        this.DescriptionToggleButton.inputEnabled = true;
        this.DescriptionToggleButton.input.pixelPerfectClick = true;
        this.DescriptionToggleButton.input.pixelPerfectOver = true;
        this.DescriptionToggleButton.input.useHandCursor = true;
        this.DescriptionToggleButton.data.width = this.DescriptionToggleButton.width;
        this.DescriptionToggleButton.data.height = this.DescriptionToggleButton.height;

        this.DescriptionToggleButton.events.onInputDown.add((e: any) => {
            this.commonAudio.play();
            this.buttonPress(e, "down")
            if (this.DescriptionToggleButton.frameName === "info_btn_off0000") {
                this.DescriptionToggleButton.frameName = "info_btn_on0000";
            } else {
                this.DescriptionToggleButton.frameName = "info_btn_off0000";
            }

            for (let i = 0; i < this.DescriptionTextArray.length; i++) {
                this.DescriptionTextArray[i].visible = !this.DescriptionTextArray[i].visible;
            }
        });
        this.gradeLabel.fixedToCamera = true;
    }

    /**
     * this function is used to set camera position
     */
    setCameraPosition() {
        this.ggMenuProgress = this.game.add.sprite(this.dynamicMenuEngine.menuElements[0].elements.stadium.x, this.dynamicMenuEngine.menuElements[0].elements.stadium.y, 'menuUIGG', 'GGIdle');
        if (this.cameraPos.guideY !== 0) {
            this.ggMenuProgress.x = this.cameraPos.guideX;
            this.ggMenuProgress.y = this.cameraPos.guideY;
        }

        // this.ggMenuProgress.anchor.setTo(2.0, 0.2)
        this.ggMenuProgress.alpha = 0;
        let centerY = this.game.height / 2;

        if (this.cameraPos.destY == 0) {
            this.game.camera.setPosition(this.game.world.centerX, this.game.world.bounds.height);
        } else {
            //let centerY = this.game.height / 2;
            this.dynamicMenuEngine.menuElements.forEach(objPosition => {
                if (objPosition.id == this.levelId) {
                    this.cameraPos.destX = objPosition.elements.stadium.x;
                    this.cameraPos.destY = objPosition.elements.stadium.y;
                }
            });

            this.game.camera.setPosition(this.game.world.centerX, this.cameraPos.destY - centerY);
        }
        if (this.urlMode.mode == "student" && this.initParams.assignmentMode === -1) {
            this.completedStage();
        }
    }

    /**
     * this method is used to determine completed levels
     */
    completedStage() {
        this.game.camera.follow(this.ggMenuProgress)
        let abc = this.dynamicMenuEngine.menuElements;
        let completedArray: Array<any> = [];
        let i;
        let compltedLevels = this.userDataServiceCAS.getGameUserData();
        for (i = 0; i < abc.length; i++) {
            let completed = this.userDataServiceCAS.getLevelObjectByID(abc[i].id, "completed");
            if (completed) {
                completedArray.push(abc[i])
            } else {
                break;
            }
        }

        completedArray.push(abc[i]);
        if (this.initParams.indexBool) {
            this.index = compltedLevels.length - 1;
            this.initParams.indexBool = false;
        }

        if (this.index !== undefined && completedArray.length > 1) {
            this.startAnimation(completedArray, this.index);
        }
        else {
            this.startAnimation(completedArray, 0);
        }

        //To play audio when the player beats the final level of the game(each grade)in slider game
        let level = this.index;
        if ((level + 1 == this.totalLevels) && this.urlMode.mode == "student" && this.gameName == 'SG') {
            this.finalLevelAudio.play();
        }
    }

    /**
     * method used to handle animation during Level Unlock
     */
    startAnimation(collection: Array<any>, index: number) {
        console.log("-------index ------- ", index)
        for (let i = index; i > 0; i--) {
            collection[i - 1].elements.levelComplete.visible = true;
        }

        if (index == collection.length - 1 && collection[index] !== undefined && collection[index] !== null) {
            let hit = this.game.add.sprite(collection[index].elements.stadium.x, collection[index].elements.stadium.y, 'hit', 8);
            this.unlockLevel.play();
            hit.anchor.set(0.5);
            hit.animations.add('hit');
            hit.animations.play('hit', 8, false, true);
            collection[index].elements.stadium.tint = 0xFFFFFF;
            collection[index].elements.stadium.inputEnabled = true;
            collection[index].elements.stadium.input.useHandCursor = true;
            collection[index].elements.levelChipOpen.visible = true;
            this.index = index;
            this.unfollowCam();
        } else {
            if (this.initParams.animationCheck && this.initParams.directPlayAnimationPrevent) {
                if (collection[index + 1] !== undefined) {
                    collection[index].elements.levelComplete.y = collection[index].elements.levelComplete.y + 100;
                    collection[index].elements.levelComplete.visible = true;

                    let flagAnim = this.game.add.tween(collection[index].elements.levelComplete);
                    flagAnim.to({ y: collection[index].elements.levelComplete.y - 100 }, 500, Phaser.Easing.Linear.None, true, 500);
                    this.flag.play();
                    flagAnim.onComplete.addOnce((e: any) => {
                        let tweenHeightChange = collection[index].elements.stadium.y - collection[index + 1].elements.stadium.y;

                        var tween = this.game.add.tween(this.ggMenuProgress);
                        let lineAnim = this.game.add.tween(this.mask);

                        tween.to({ x: collection[index + 1].elements.stadium.x, y: collection[index + 1].elements.stadium.y }, 1000, Phaser.Easing.Linear.None, true, 100)

                        lineAnim.to({ y: this.mask.y - tweenHeightChange }, 1000, Phaser.Easing.Linear.None, true, 100);
                        this.whiteLine.play();
                        lineAnim.onComplete.addOnce(() => {
                            this.cameraPos.maskY = this.mask.y;
                            this.cameraPos.guideX = this.ggMenuProgress.x;
                            this.cameraPos.guideY = this.ggMenuProgress.y;
                            index += 1;
                            this.startAnimation(collection, index);

                        })
                    })
                } else {
                    try {
                        this.index = index;
                        collection[index].elements.levelComplete.visible = true;
                        this.unfollowCam();
                    } catch (err) {
                        console.log(err)
                    }
                }

            } else {
                if (collection[index + 1] !== undefined) {
                    collection[index].elements.stadium.tint = 0xFFFFFF;
                    collection[index].elements.stadium.inputEnabled = true;
                    collection[index].elements.stadium.input.useHandCursor = true;
                    collection[index].elements.levelChipOpen.visible = true;
                    collection[index].elements.levelComplete.visible = true;
                    index += 1;
                    this.ggMenuProgress.x = collection[index].elements.stadium.x;
                    this.ggMenuProgress.y = collection[index].elements.stadium.y;
                    this.cameraPos.guideX = this.ggMenuProgress.x;
                    this.cameraPos.guideY = this.ggMenuProgress.y;
                    this.cameraPos.maskY = collection[index].elements.stadium.y - this.dynamicMenuEngine.menuElements[0].elements.stadium.y;
                    this.game.camera.setPosition(this.game.world.centerX, collection[index].elements.stadium.y - (this.game.height / 2));
                    this.startAnimation(collection, index);

                } else {
                    collection[index].elements.stadium.tint = 0xFFFFFF;
                    collection[index].elements.stadium.inputEnabled = true;
                    collection[index].elements.stadium.input.useHandCursor = true;
                    collection[index].elements.levelChipOpen.visible = true;
                    collection[index].elements.levelComplete.visible = true;
                    this.ggMenuProgress.x = collection[index].elements.stadium.x;
                    this.ggMenuProgress.y = collection[index].elements.stadium.y;
                    this.cameraPos.guideX = this.ggMenuProgress.x;
                    this.cameraPos.guideY = this.ggMenuProgress.y;
                    this.cameraPos.maskY = collection[index].elements.stadium.y - this.dynamicMenuEngine.menuElements[0].elements.stadium.y;
                    this.game.camera.setPosition(this.game.world.centerX, collection[index].elements.stadium.y - (this.game.height / 2));
                    this.unfollowCam();
                }
            }

        }
    }

    /**
     * method used to reset camera after unlocking animation
     */
    unfollowCam() {
        this.cameraPos.prevX = this.ggMenuProgress.x;
        this.cameraPos.prevY = this.ggMenuProgress.y;
        this.game.camera.unfollow();
    }

    /**
     * method to clear menu stage
     */
    clearMenuStage() {
        try {
            this.menuItemsGroup.destroy();
            this.connectedLine.clear();
            this.gradeLabel.destroy();
            this.gradeText.destroy();
        } catch (e) { };
    }


    /**
     * method to set menu items on stage
     * @param 'element'  array of levelData
     */
    setMenuItemsOnStage(element: any) {
        var count: number = 0;
        this.menuItemsGroup = this.game.add.group();

        this.yPos = this.game.world.bounds.height - 300;

        element.forEach((ele: any, i: number) => {
            let stadium: Phaser.Sprite;
            //let signType: Phaser.Sprite;
            let victoryFlag: Phaser.Sprite;
            let descriptionText: Phaser.BitmapText;
            let titleBox: Phaser.Sprite;
            let descriptionGroup = this.game.add.group();
            let localGroup = this.game.add.group();
            let rewardGroup = this.game.add.group();
            let rewardBG: Phaser.Sprite;

            // Adding Stadium image
            // Added this blank === "" check temporarily this will be replaced
            // by blank stadium later when we implement cute assets
            switch (this.gameName) {
                case 'POG':
                    if (ele.type === "addition") {
                        stadium = this.game.add.sprite(this.MenuButtonPosition[i], this.yPos, 'menuUI', 'POG_stadium_addition0000');
                    } else if (ele.type === "") {
                        stadium = this.game.add.sprite(this.MenuButtonPosition[i], this.yPos, 'menuUI', 'POG_stadium_counting0000');
                    } else {
                        stadium = this.game.add.sprite(this.MenuButtonPosition[i], this.yPos, 'menuUI', 'POG_stadium_subtraction0000');
                    }
                    break;
                case 'FMG':
                    stadium = this.game.add.sprite(this.MenuButtonPosition[i], this.yPos, 'menuUI', 'FunctionMatch_stadium0000');
                    break;

                case 'SG':
                    stadium = this.game.add.sprite(this.MenuButtonPosition[i], this.yPos, 'menuUI', 'slidergame_stadium0000');
                    break;

                default:
                    stadium = this.game.add.sprite(this.MenuButtonPosition[i], this.yPos, 'menuUI', 'CardGame_stadium0000');
                    break;
            }

            stadium.anchor.setTo(0.5);

            // showing the Victory Flag
            if (this.gameName == 'SG') {
                victoryFlag = this.game.add.sprite(this.MenuButtonPosition[i], this.yPos + 30, 'menuUI', 'victory_flag0000');
            } else {
                victoryFlag = this.game.add.sprite(this.MenuButtonPosition[i], this.yPos, 'menuUI', 'victory_flag0000');
            }

            victoryFlag.anchor.setTo(0.2, 1.4);
            victoryFlag.visible = true;
            localGroup.add(victoryFlag);
           

            // Description Box
            titleBox = this.game.add.sprite(0, 0, 'menuUI', 'description_bubble0000');
            titleBox.anchor.setTo(0.5);
            if(this.initParams.urlParams.lang == 'en'){
                titleBox.scale.setTo(1, 1.25);}
            else{
            titleBox.scale.setTo(1.25, 1.25);}
            descriptionGroup.addChild(titleBox);

            // Description Text
            if(this.initParams.urlParams.lang == 'en')
                descriptionText = this.game.add.bitmapText(0, -15, 'frutiger_Black', this.wrapText(ele.title, 21), 30);
            else {
                if (this.gameName == 'FMG') {
                    //console.log("FMG wrapText");
                    descriptionText = this.game.add.bitmapText(0, -20, 'frutiger_Black', this.wrapText(ele.title, 25), 30); 
                } else {
                    descriptionText = this.game.add.bitmapText(0, -20, 'frutiger_Black', this.wrapText(ele.title, 21), 30); 
                }
            }

            descriptionText.tint = 0x000000;
            descriptionText.align = "center";
            descriptionText.anchor.setTo(0.5);
            descriptionGroup.addChild(descriptionText);

            descriptionGroup.x = 0;
            descriptionGroup.y = -150;
            stadium.addChild(descriptionGroup);

            //To add reward stars for the function match game dynamic menu
            if (ele.type == null) {
                rewardBG = this.game.add.sprite(0, 0, 'menuUI', 'score_bar0000');
                rewardBG.width = 226;
                rewardBG.height = 62;
                rewardBG.x = -120;
                rewardBG.y = 65;
                rewardBG.inputEnabled = true;
                rewardBG.input.pixelPerfectOver = true;
                rewardBG.input.pixelPerfectClick = true;
                rewardGroup.add(rewardBG);

                let rewardStarsGroup = this.game.add.group();
                let startLeftMargin = 6;
                let totalWidth = 0;
                this.levelStars = this.game.add.group();
                for (let i = 0; i < 3; i++) {
                    this.shineStar = this.game.add.sprite(0, 0, 'menuUI', 'score_star0000')
                    this.shineStar.width = 37;
                    this.shineStar.height = 37;
                    this.shineStar.inputEnabled = true;
                    this.shineStar.input.pixelPerfectClick = true;
                    this.shineStar.input.pixelPerfectOver = true;
                    this.shineStar.x = i *
                        (startLeftMargin + (this.shineStar.width));
                    totalWidth += this.shineStar.x;
                    this.shineStar.anchor.set(0.5, 0.5);
                    this.levelStars.add(this.shineStar);
                    this.levelStars.x = 80;
                    this.shineStar.visible = false;
                    rewardStarsGroup.add(this.levelStars);
                }
                totalWidth = totalWidth - startLeftMargin;
                rewardStarsGroup.x = rewardBG.x + (rewardStarsGroup.width / 2) - 10;
                rewardStarsGroup.y = rewardBG.y + (rewardBG.height / 2);
                rewardGroup.add(rewardStarsGroup);
                stadium.addChild(rewardGroup);
            }

            if (this.userDataServiceCAS.getLevelObjectByID(ele.id, "awardInfo") !== undefined) {
                this._awardInfo = this.userDataServiceCAS.getLevelObjectByID(ele.id, "awardInfo")
                for (let i = 0; i < this._awardInfo.stars; i++) {
                    this.levelStars.children[i].visible = true;
                }
            }

            // level number Rounded Box for both ON & OFF
            let levelChipLocked = this.game.add.sprite(0, 0, 'menuUI', 'level_chip_locked0000')
            let levelChipOpen = this.game.add.sprite(0, 0, 'menuUI', 'level_chip_open0000')
            levelChipOpen.anchor.setTo(-0.6, -0.5)
            levelChipLocked.anchor.setTo(-0.7, -0.55)
            
            stadium.addChild(levelChipLocked);
            stadium.addChild(levelChipOpen);

            // Level number in Box
            //let levelNumber = this.game.add.bitmapText(this.MenuButtonPosition[i] + 105, this.yPos + 75, 'frutiger_Black', ele.label, 65);//menu_font
            let levelNumber = this.game.add.bitmapText(105, 75, 'frutiger_Black', ele.label, 65);//menu_font
            if (ele.label > 9) { levelNumber.x = 85 }
            levelNumber.smoothed = true;

            stadium.name = "Item-" + (count++);
            stadium.inputEnabled = true;
            stadium.input.pixelPerfectClick = true;
            stadium.input.pixelPerfectOver = true;

            this.yPos = this.yPos - this.yGap;
            stadium.addChild(levelNumber);

            ele.elements = [];
            ele.elements = {
                "stadium": stadium,
                "levelComplete": victoryFlag,
                "levelChipOpen": levelChipOpen,
                "levelChipLocked": levelChipLocked,
                "textLabel": levelNumber
            };
            localGroup.add(stadium);
            this.menuItemsGroup.add(localGroup);
            this.DescriptionTextArray.push(descriptionGroup);
            descriptionGroup.visible = false;
        });
        this.activeLevel();
    }
    /**
     * 
     * @param text the text that need to be wrapped within 
     * @param maxChars  maximum character that can be accomodated in each line 
     */
    wrapText(text: any, maxChars: any) {
        /*let ret: Array<any> = [];
        let words = text.split(/\b/);

        let currentLine = '';
        let lastWhite = '';
        words.forEach(function (d: any) {
            let prev = currentLine;
            currentLine += lastWhite + d;

            let l = currentLine.length;

            if (l > maxChars) {
                ret.push(prev.trim());
                currentLine = d;
                lastWhite = '';
            } else {
                let m = currentLine.match(/(.*)(\s+)$/);
                lastWhite = (m && m.length === 3 && m[2]) || '';
                currentLine = (m && m.length === 3 && m[1]) || currentLine;
            }
        });

        if (currentLine)
            ret.push(currentLine.trim());

        return ret.join("\n");*/       
       
        var arr = text.split(" ");
        var textlength = 0;
        var firstLine= "";
        for(var i= 0; i < arr.length; i++) {
            textlength += arr[i].length;
            if(textlength < maxChars ) {
                //console.log("firstline < 21", firstLine, textlength,arr[i] );                  
                firstLine += arr[i];
                firstLine += " ";  
                textlength = firstLine.length; 
            } else {               
                 if((firstLine.split("\n").length - 1) == 2){   
                    //console.log("2 \n",firstLine.split("\n")[1].length,arr[i]);                 
                    firstLine += arr[i];
                    firstLine += " ";  
                    textlength = firstLine.length;                 
                }                 
                if((firstLine.split("\n").length -1) == 1 && firstLine.split("\n")[1].length + arr[i].length > maxChars){   
                    //console.log('if executed', firstLine.split("\n")[1].length,arr[i] );                 
                    firstLine += '\n';   
                    firstLine += arr[i];
                    firstLine += " ";   
                    textlength = firstLine.length;
                }
                if((firstLine.split("\n").length -1) == 1 && firstLine.split("\n")[1].length + arr[i].length <= maxChars){
                    //console.log('else executed',firstLine.split("\n")[1].length,arr[i]);
                    firstLine += arr[i];
                    firstLine += " ";  
                    textlength = firstLine.length;
                }           
                if(firstLine.indexOf('\n') == -1){    
                    //console.log("no",firstLine, arr[i]);                
                    firstLine += '\n';   
                    firstLine += arr[i];
                    firstLine += " ";                    
                }               
            }
        }
       return firstLine;
      
    }

    /**
     * this method is responsible for drawing lines between menu buttons
     */
    setLinkedButton() {
        this.yPos = this.game.world.bounds.height - 300;
        let field = this.game.add.graphics(0, 0);
        field.lineStyle(20, 0xffffff, 1);
        field.moveTo(this.MenuButtonPosition[0], this.yPos)

        let dummyLineField = this.game.add.graphics(0, 0);
        dummyLineField.lineStyle(20, 0x707070, 1);
        dummyLineField.moveTo(this.MenuButtonPosition[0], this.yPos)

        for (let i = 0; i < this.MenuButtonPosition.length; i++) {
            field.lineTo(this.MenuButtonPosition[i], this.yPos);
            field.moveTo(this.MenuButtonPosition[i], this.yPos)

            dummyLineField.lineTo(this.MenuButtonPosition[i], this.yPos);
            dummyLineField.moveTo(this.MenuButtonPosition[i], this.yPos)

            this.yPos = this.yPos - this.yGap;
            this.connectedLineGroup.add(field);
            this.connectedLineGroup.add(dummyLineField);
        }
        field.endFill();
        dummyLineField.endFill();
        dummyLineField.visible = false;

        if (this.urlMode.mode == "student" && this.initParams.assignmentMode === -1) {
            dummyLineField.visible = true;
            this.mask = this.game.add.graphics(0, 0);
            this.mask.beginFill(0xffffff, 1)
            this.mask.drawRect(0, 0, this.game.width, this.dynamicMenuEngine.menuElements[0].elements.stadium.y)
            this.mask.y = this.cameraPos.maskY;
            this.mask.endFill();
            dummyLineField.mask = this.mask;
        }
    }

    /**
     * method to show Active level/ active menu buttons
     */
    activeLevel() {
        //let userDataObjectArray = this.userDataServiceCAS.getUserLevelData();
        this.dynamicMenuEngine.menuElements.forEach(obj => {
            obj.elements.stadium.input.useHandCursor = true;
            obj.elements.levelComplete.visible = false;
            if (this.urlMode.mode == "student" && this.initParams.assignmentMode === -1) {
                obj.elements.stadium.tint = 0x999999;
                obj.elements.levelChipOpen.visible = false;
                obj.elements.stadium.inputEnabled = true;
                obj.elements.stadium.input.pixelPerfectClick = true;
                obj.elements.stadium.input.pixelPerfectOver = true;
                obj.elements.stadium.data.enabled = false;
            }

            //let completed = this.userDataService.getLevelObjectByID(obj.id, "completed");
            let completed = this.userDataServiceCAS.getLevelObjectByID(obj.id, "completed");
            let parentCompleted = this.userDataServiceCAS.getLevelObjectByID(obj.parent, "completed");
            if (completed || obj.parent === "") {
                obj.elements.stadium.tint = 0xFFFFFF;
                obj.elements.stadium.inputEnabled = true;
                obj.elements.stadium.input.pixelPerfectClick = true;
                obj.elements.stadium.input.pixelPerfectOver = true;
                obj.elements.stadium.input.useHandCursor = true;
                obj.elements.levelChipOpen.visible = true;
                obj.elements.stadium.data.enabled = true;
                if (completed && (this.urlMode.mode.toLowerCase() === "teacher" || this.urlMode.mode.toLowerCase() === "instructor" || this.initParams.assignmentMode !== -1)) {
                    obj.elements.levelComplete.visible = true;
                }
            }
            
            // Adding Event to the green circle 
            let greenCircle:any = obj.elements.stadium.getChildAt(2);
            greenCircle.inputEnabled = true;
            greenCircle.input.useHandCursor = true;
            greenCircle.events.onInputDown.add((e:any)=>{
                if (e.parent.tint === 0x999999) {
                    console.log('disabled');
                    this.lockedLevelAudio.play();
                    return;
                }
                this.loadLevel(obj);
                this.gameData.dynamicMenuButtonClick(obj, this.index);
            });

            // Adding Event to the level number in stadium
            let text:any = obj.elements.stadium.getChildAt(3);
            text.inputEnabled = true;
            text.input.useHandCursor = true;
            text.events.onInputDown.add((e:any)=>{
                if (e.parent.tint === 0x999999) {
                    console.log('disabled');
                    this.lockedLevelAudio.play();
                    return;
                }
                this.loadLevel(obj);
                this.gameData.dynamicMenuButtonClick(obj, this.index);
            })
            obj.elements.stadium.events.onInputDown.add((e: Phaser.Sprite) => {
                if (e.tint === 0x999999) {
                    this.lockedLevelAudio.play()
                    return;
                }
                this.loadLevel(obj);
                this.gameData.dynamicMenuButtonClick(obj, this.index);
            });
        })
        this.setCameraPosition();
    }

    /**
     * 
     * @param obj to keep track of the camera position in the Dynamic Menu
     */
    loadLevel(obj:any){
        this.game.input.mouse.mouseWheelCallback = undefined;
        this.bgAudio.stop();
        this.bgAudio.destroy();
        this.drop.play();
        this.game.load.onLoadComplete.remove(this.create, this);
        this.game.state.clearCurrentState();
        this.showButton = false;
        this.animateGG = false;
        this.cameraPos.startX = obj.elements.stadium.x;
        this.cameraPos.startY = obj.elements.stadium.y;
    }

    /**
     * this function is to give the press event to the buttons
     */
    buttonPress(sprite: Phaser.Sprite, action: String) {
        let val = action === "up" ? 10 : -10;
        let w = sprite.data.width;
        let h = sprite.data.height;
        this.game.add.tween(sprite)
            .to(
            {
                width: sprite.width + val,
                height: sprite.height + val
            },
            100,
            null,
            true, 0, 0, false)
            .onComplete.addOnce(() => {
                sprite.height = h;
                sprite.width = w;
            });
    }

    /**
     * Default phaser function
     * used to Scroll menu screen
     * used to handle keyboard events
     */
    update() {
        if (this.introVideo !== undefined) {
            if (Math.round(this.introVideo.progress * 100) >= 1) {
                this.playBtn.visible = false;
            }

            if (Math.round(this.introVideo.progress * 100) >= 100) {
                this.introVideoField.destroy();
                this.introVideoSprite.destroy();
                this.introVideo.destroy();
                this.createMenuUI();
            }
        }

        /********** Smooth Scrolling **********/
        try {
            if (this.autoScroll && this.amplitude != 0) {
                this.elapsed = Date.now() - this.timestamp;
                let delta = -this.amplitude * Math.exp(-this.elapsed / this.timeConstant);
                if ((delta > 0.5 || delta < -0.5)) {
                    this.game.camera.y = this.target - delta;
                    this.autoScroll = true;
                }
                else {
                    this.autoScroll = false;
                    this.game.camera.y = this.target;
                }
            }
            /********** **************** **********/

            if (this.cursors.up.isDown || this.scrollUp) {
                this.autoScroll = false;
                this.game.camera.y -= 25;
            }
            else if (this.cursors.down.isDown || this.scrollDown) {
                this.autoScroll = false;
                this.game.camera.y += 25;
            }
        } catch (e) { }
    }

    /**
     * This is method is used to start the background music for the dynamic menu
     *
     * @memberOf DynamicMenu
     */
    playBackgroundMusic() {
        this.backgroundMusic.loop = true;
        this.backgroundMusic.play();
    }

    /**
     * This method will get triggered when the user change the device orientation from landscape to portrait
     *
     * @memberOf DynamicMenu
     */
    handleIncorrect() {
        this.game.paused = true;
    }

    /**
     * This method will get triggered when user return back to the correct orientation
     * @memberOf DynamicMenu
     */
    handleCorrect() {
        this.game.paused = false;
    }

    /**
    * This method is used to change the sound icon according to sound mute and unmute
    * @memberOf DynamicMenu
    */
    soundButtonToggle() {
        if (this.initParams.audiomute) {
            this.soundButton.frameName = 'btn_sound_OFF0000';
        } else {
            this.soundButton.frameName = 'btn_sound_ON0000';
        }
    }

    /**
     * This method is used to add the sound button to the dynamic menu screen
     * @memberOf DynamicMenu
     */
    addSoundButton() {
        this.soundButton = this.game.add.sprite(70, this.gradeLabel.height + 70, 'menuUI', 'btn_sound_ON0000');
        this.soundButton.inputEnabled = true;
        this.soundButton.input.pixelPerfectClick = true;
        this.soundButton.input.pixelPerfectOver = true;
        this.soundButtonToggle();
        this.soundButton.input.useHandCursor = true;
        this.soundButton.events.onInputDown.add(function () {
            this.game.sound.mute = !this.game.sound.mute;
            this.initParams.audiomute = this.game.sound.mute;
            this.soundButtonToggle();
        }, this);
        this.gradeLabel.addChild(this.soundButton);
    }

    /**
     * This function is used to play the intro animation.
     *
     * @memberof DynamicMenu
     */
    playIntroAnimation() {
        let skipButtonPressed = false;
        this.introVideoField = this.game.add.graphics(0, 0);
        this.introVideoField.beginFill(0x6fc6ca);
        this.introVideoField.lineStyle(this.shadowLine, 0x000000, 1);
        this.introVideoField.drawRect(0, 0, this.game.width, this.game.height);
        this.introVideo = this.game.add.video('intro_animation');
        this.introVideoSprite = this.introVideo.addToWorld(150, 100);
        this.introVideoSprite.width = this.introVideoField.getBounds().width / 1.2;
        this.introVideoSprite.height = this.introVideoField.getBounds().height / 1.2;

        if (!this.game.device.iPhone) {
            let skipBtn = this.game.add.sprite(-110, -40, 'Basket_UI', 'btn_next0000');
            skipBtn.width = 170;
            skipBtn.height = 181;

            this.introVideoSprite.addChild(skipBtn);
            skipBtn.inputEnabled = true;
            skipBtn.input.useHandCursor = true;
            skipBtn.input.pixelPerfectClick = true;
            skipBtn.input.pixelPerfectOver = true;
            skipBtn.events.onInputDown.add(() => {
                skipBtn.visible = false;
                setTimeout(() => {
                    this.introVideo.stop();
                    skipButtonPressed = true;
                }, 100);
                this.createMenuUI();
            });
        }

        this.playBtn = this.game.add.sprite(0, 0, 'Basket_UI', 'btn_play0000');
        this.playBtn.x = this.introVideo.width / 2 - this.playBtn.width / 2;
        this.playBtn.y = this.introVideo.height / 2 - this.playBtn.height / 2 - 50;
        this.introVideoSprite.addChild(this.playBtn);
        this.introVideoField.addChild(this.introVideoSprite);
        this.game.world.bringToTop(this.introVideoField);
        this.playBtn.inputEnabled = true;
        this.playBtn.input.useHandCursor = true;
        this.playBtn.events.onInputDown.add(() => {
            this.playBtn.visible = false;
            this.introVideo.play(false);
            this.introVideoSprite.events.onInputDown.add((e: any) => {
                this.introVideoField.destroy();
                this.introVideoSprite.destroy();
                this.introVideo.destroy();
                this.createMenuUI();
            });
        });

        if (this.game.device.desktop) {
            this.playBtn.visible = false;
            this.introVideo.play(false);
        }

        // to disable video click skip make the follwing property false
        this.introVideoSprite.inputEnabled = false;

        //To unlock the intro video on anroid devices(chrome version Above 56)
        if (this.game.device.android) {
            let touch: any = this.game.input.touch;
            touch.addTouchLockCallback(() => {
                this.playBtn.visible = false;
                if (typeof this.introVideo !== 'undefined' && typeof this.introVideo !== null && !skipButtonPressed) {
                    this.introVideo.play();
                }
                return true;
            }, this.introVideo, true);
        }

        //This function will get triggered when the user clicks the 'Done' button in iPhone
        this.introVideo.video.addEventListener('webkitendfullscreen', (() => {
            this.game.cache.removeVideo("intro_animation");
            this.introVideoField.destroy();
            this.introVideoSprite.destroy();
            this.introVideo.destroy();
            this.createMenuUI();
        }), true);
        this.game.cache.removeVideo("intro_animation");
        this.resizeGame();
    }

    /**
     * This function is used to create Dynamic menu UI
     *
     * @memberof DynamicMenu
     */
    createMenuUI() {
        console.log("CREATE() Getting Level Info in Menu", this.userDataServiceCAS);
        //Caching json data from json
        this.UIdata = this.jsonData["levelData"];//this.game.cache.getJSON('leveldata').levelData;
        this.bgAudio = this.game.add.audio('bgaudio');
        this.bgAudio.play("", 0, 0.2, true, true);

        // Determing game Bound based on json
        this.gameBound = (this.UIdata.length + 1) * this.yGap;
        this.game.world.setBounds(0, 0, this.game.width, this.gameBound);
        this.drop = this.game.add.audio('drop');
        this.upArrow = this.game.add.audio('upArrow');
        this.downArrow = this.game.add.audio('downArrow');
        this.flag = this.game.add.audio('flag');
        this.whiteLine = this.game.add.audio('whiteLine');
        this.unlockLevel = this.game.add.audio('unlockLevel');
        this.commonAudio = this.game.add.audio('pop_sound');
        this.levelClickAudio = this.game.add.audio('levelClickAudio');
        this.finalLevelAudio = this.game.add.audio('final_level');

        //generating MenuButtonPosition
        for (let i = 0; i < this.UIdata.length; i++) {
            this.MenuButtonPosition.push(this.game.rnd.integerInRange(650, this.BASE_GAME_WIDTH - 500))
        }

        // using local storage to store the menuElement position
        if (typeof (Storage) !== "undefined") {
            if (localStorage.getItem("Button_Position") && JSON.parse(localStorage.getItem("Button_Position")).length == this.UIdata.length) {
                // Retrieve
                this.MenuButtonPosition = JSON.parse(localStorage.getItem("Button_Position"));
            } else {
                // Store
                localStorage.setItem("Button_Position", JSON.stringify(this.MenuButtonPosition));
            }
        }

        // Initializing groups
        this.initGroups();

        this.gradeName = this.jsonData["gradeLabel"];
        this.gameName = this.jsonData["gameName"];
        this.setMenuStage(this.UIdata, this.gradeName, this.gameName);

        // Initializing buttons
        this.initArrowButtons();
        //To add sound icon
        this.addSoundButton();

        // creating cursors key to detect keyboard event
        this.cursors = this.game.input.keyboard.createCursorKeys();

        //To play when the user clicks on the locked level
        this.lockedLevelAudio = this.game.add.audio('locked_level');

        //To display the orientation instruction image when the user loads the url on the portrait mode
        if (this.game.paused && !this.game.device.desktop) {
            this.handleIncorrect();
        }

    }
}