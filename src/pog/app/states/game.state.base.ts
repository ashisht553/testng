import { POGGameEngineBase } from '../engine/game.engine.base'
import { TutorialEngine } from '../engine/tutorial.engine';
//import { UserData } from "../../../shared/engine/game.user.data";
import { GameUserData } from "../../../shared/engine/game.user.data.service";

/**
*  This class is the base class of all game state. It defined and implemented with all common functions and features for its children
*/

export abstract class NewStateBase extends Phaser.State {

    /**
     *  This Property is to remember game background
     */
    protected background: Phaser.Sprite;

    /**
     *  This Property is to remember game loading background
     */
    protected splashBG: Phaser.Sprite;

    /**
    * this property is using for Home button
    */
    protected homeButton: Phaser.Sprite
    /**
     * this property is a group which is used to resize homeButton
     */
    protected homeButtonGroup: Phaser.Group;

    /**
     * this property is a group which is used to resize tutorial elements
     */
    protected tutorialField: Phaser.Group;

    /**
     * this property is a group which is used to resize tutorial overlay
     */
    protected tutorialDecoration: Phaser.Group;
    /**
     * this property is a group which is used to resize tutorial overlay
     */
    protected tutorialSheen: Phaser.Group;

    /**
     * this property is using for star/reward section
     */
    protected rewardBG: Phaser.Sprite;
    /**
     * this property is a group which will contain star bar & starGroup in one group
     */
    protected rewardsGroup: Phaser.Group;
    /**
     * this property is a group of progressive stars
     */
    protected starGroup: Phaser.Group;

    /**
     *  This Property is to give the background to good guys on bench
     */
    protected ggBenchBackground: Phaser.Sprite;

    /**
     *  This Property is to be used to give swipe functionality to the bench
     */
    protected fakeDraggingBench: Phaser.Sprite;

    /**
    * This property will keep the intial state values of the bench
    */
    protected benchProps: any;
    /**
     *  This Property is a group which will have all good guys objects 
     */
    protected goodGuyGroup: Phaser.Group;

    /**
     *  This Property is a group which will have all bad guys objects 
     */
    protected badGuyGroup: Phaser.Group;

    /**
     *  This Property is a group which will have all bench objects 
     */
    protected benchGuyGroup: Phaser.Group;

    /**
     * This Property is a group which will store the good guys dragged by
     * user on the feild
     */
    protected userAnswerArray: Array<any>

    /**
     *  This Property is refer to referee
     */
    protected referee: Phaser.Sprite;

    /**
     * this property is used for referee X position
     */
    protected refereeXpos: number;

    /**
     * this property is used for referee Y position
     */
    protected refereeYpos: number;

    /**
     *  This Property to have all goodGuyField compartment, use phaser graphic type because graphic has bounds
     */
    protected goodGuyFields: Array<Phaser.Graphics>;

    /**
    * This property will keep the incremental counter for the goodguys added to field
    */
    protected goodGuyOnFieldCounter: number = 0;

    /**
     *  This Property to have all badGuyField compartment, use phaser graphic type because graphic has bounds
     */
    protected badGuyFields: Array<Phaser.Graphics>;

    /**
     *  This Property is for bench field, use phaser graphic type because graphic has bounds
     */
    protected benchField: Phaser.Graphics;

    /**
     *  This Property is to define a field for referee
     */
    protected refereeField: Phaser.Group;

    /**
     *  This property is to define white middle line between good guy & bad guy field.
     */
    protected partiotionLine: Phaser.Graphics;

    /**
     *  This property is a group to scale partition line.
     */
    protected partiotionLineGroup: Phaser.Group;

    /**
     *  This Property to have all goodGuyField compartment
     */
    protected engine: POGGameEngineBase.NewEngineBase;

    /** 
     * This Property is a constant value for harcoding the fixed size screen Height or calculating the radio  
     * */
    protected BASE_GAME_HEIGHT: number = 1408;

    /** 
     * This Property is a constant value for harcoding the fixed size screen Width or calculating the radio  
     * */
    protected BASE_GAME_WIDTH: number = 2048;

    /** 
     * This Property is a constant value for harcoding the fixed size bench Width  
     * */
    protected BASE_BENCH_WIDTH: number = 326;

    /**
     * This property will set the x position for the bench
     */
    protected BENCH_POSITION_X = this.BASE_GAME_WIDTH - this.BASE_BENCH_WIDTH;

    /** 
     * This Property is a constant value for remembering the fixed ratio of bench Width and game Width
     * */
    protected BASE_BENCH_WIDTH_RATIO: number;

    /** 
     * This Property is an incremental value that will keep the numbe of attempts user made in the particular level reset to zeo when level changes
     * */
    protected attemptCount: number;

    /**
     * This property will be an incremental value that will keep the correct attempts made by the user and will reset to zero when level change
     */
    protected correctAttemptCount: number = 0;

    /**
    * this is a event handler to handler all the events what happens when win the round
    */
    public onRoundWin: Phaser.Signal = new Phaser.Signal();

    /**
     * this is a event handler to handler all the events what happens when lose the round
     */
    public onRoundLose: Phaser.Signal = new Phaser.Signal();


    /** 
     * This Property is a constant value for the radio of Height : Width  
     * */
    protected WHRADIO: number;
    protected HTRADIO: number;

    /**
     * This property is a constant value defined a fixed space left for top home and award starts 
     */
    protected GAME_OFFSET_Y: number = 40;

    /**
     * This Property is to remember the previous Window Height when resizing
     */
    protected prevWindowWidth: number;

    /**
     * This Property is to remember the previous Window Width when resizing
     */
    protected prevWindowHeight: number;

    /**
     * This Property is to remember the current game Height
     */
    protected gameHeight: number;

    /**
     * This Property is to remember the current game Width
     */
    protected gameWidth: number;

    /**
     * This Property is to remember the scale Rate when resizing
     */
    protected scaleRate: number;

    /**
     * This Property is to set the border to each field, for debugging purpose
     */
    protected shadowLine: number = 1;

    /**
     * this.property is used for communication with TutorialEngine
     */
    protected tutorialEngine: TutorialEngine.Engine;

    /**
    * This property will hold all the objects for Game Over screen
    */
    protected gameOverScreenGroup: Phaser.Group;

    /**
     * This property will hold the next button UI to go to the next
     * Level in the game
     */
    protected nextBtn: Phaser.Sprite;

    /**
     * This property will hold the splash video
     */
    protected tutorialVideo: Phaser.Video;

    /**
    * This property will store the path or name for the splash video
    */
    protected tutorial1VideoSource: string;

    /**
     * this property will show the loading progress on screen
     */
    protected loadingText: Phaser.BitmapText;

    /**
     * this property will check if the splash screen is loading
     */
    protected loadingSplash: boolean;

    /**
     * this property will keep the style for the text to show
     */
    protected textStyle: Phaser.PhaserTextStyle;

    /**
     * this property will keep the json data
     */
    protected dataJSON: any;

    /**
     * this property will hold the levelID from the dynamic menu
     */
    protected levelID: string;

    /**
     * this property will hold the level Index number from JSON
     */
    protected levelIndex: number;


    /**
     * this property will keep the tutorial video object for display and scaling purpose
     */
    protected videoTutorialSprite: any;

    /**
     * this property is the Phaser Graphics drawn on fullsize of the game 
     * videoTutorialSprite added to this graphics to fix the position of the 
     * video in the center of the screen
     */
    protected videoField: Phaser.Graphics;

    /**
     * these property are used to bring tutorial on top
     */
    tutorialAnimatonReference: any;

    /**
     * this property will let the game know if the tutorial sheen is visible
     */
    sheenAppearence: boolean;

    /**
     * this property will keep the local bench array
     */
    protected localGoodGuysBench: Array<any>;

    /* Group for x and y and the parent group contain x and y */
    carryOverGuys: Array<any>;
    badGuysGroupX: Array<any>;
    badGuysGroupY: Array<any>;
    goodGuysArray: Array<any>;
    unknAnsArray: Array<any>;
    /**
     * this property will hold the confirmation box elements
     */
    confirmPopupGroup: Phaser.Group;

    /**
     * Group that holds guys droppped by learner
     */
    answerGroup: Phaser.Group;

    carryforwardGroup: any;

    /* Group for good guys on bench */
    goodGuysGroup: Phaser.Group;

    /** Storing guys on Field in a group */
    userAnswerGroup: Phaser.Group;

    /*Store Fixed Position of refree*/
    protected fixedPosition: number;

    /****less the margin for numeric game line */
    protected lessMargin: number = 360;

    /* no of groups */
    groupU: Phaser.Group;
    groupV: Phaser.Group;
    groupW: Phaser.Group;
    groupX: Phaser.Group;
    groupY: Phaser.Group;
    groupZ: Phaser.Group;

    /**
     * this property will hold the carry over guys and their events
     */
    regroupingGuys: Array<any> = [];

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
     * this property will check whether game Mode is teacher or Student
     */
    assetsPathVideo: string = "assets/video/";

    /**
     * this property is used to work as game component instance
     */
    gameData: any;

    /**
     * property to hold all the animated guys when good guy wins
     */
    animationGuysSprite: Array<Phaser.Sprite>;

    /**
     * this property will be an object and hold all the intial parameters
     * required to load the game state
     */
    initParams: any;

    /**
    * Variable to store wrong orientation information screen
    */
    orientationInstruction: Phaser.Group = null;

    /**
     * this property is used to maintain index number for menu Unlock animation
     */
    animIndex: number;

    /** This property will hold the transition video
     */
    protected transitionVideo: Phaser.Video;

    /**
    * This property will store the path or name for the transition video
    */
    protected transitionVideoSource: string;

    /**
   * this property will keep the tutorial video object for display and scaling purpose
   */
    protected transitionVideoSprite: any;

     /**
     * 
     * Variables used to play end animation
     * @memberof DynamicMenu
     */
    endVideo : Phaser.Video;
    endVideoField : Phaser.Graphics;
    endVideoSprite : any;
    playEndVideo : boolean;
    isFinalLevelCompleted:boolean = false;
    gameOverDisplay:boolean = false;
    
    isTouchDevice  = 'onDown' in window || (navigator.msMaxTouchPoints>0);
    isBrowserEdge = /Edge/.test(navigator.userAgent);
     
    /**
     * This is a inbuild function of Phaser State, it is called after constructor but before create().
     * Here used to initialize some properties and preparing for the resizing  
     */

    constructor(){
        super();
    }
    init(param: any) {
        this.badGuyFields = [];
        this.goodGuyFields = [];
        this.animationGuysSprite = [];
        this.loadingSplash = false;
        this.sheenAppearence = false;
        this.initParams = param[0];
        this.animIndex = param[1];
        console.log("init() ==== ", this.animIndex)
        // this.userDataService = this.initParams.userDataService;
        this.initParams.playIntroVideo = false;
        this.userDataServiceCAS = this.initParams.userDataServiceCAS;
        this.urlMode = this.initParams.urlParams;
        this.gameData = this.initParams.parent;
        this.dottedLineBMCollection = [];
        this.game.world.height = this.BASE_GAME_HEIGHT;
        this.game.world.width = this.BASE_GAME_WIDTH;

        this.BASE_BENCH_WIDTH_RATIO = this.BASE_BENCH_WIDTH / this.BASE_GAME_WIDTH;
        this.WHRADIO = this.BASE_GAME_WIDTH / this.BASE_GAME_HEIGHT;

        this.WHRADIO = this.BASE_GAME_WIDTH / this.BASE_GAME_HEIGHT;
        this.HTRADIO = this.BASE_GAME_HEIGHT / this.BASE_GAME_WIDTH

        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;

        //this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        //this.game.scale.forceOrientation(false, false);
        //this.game.scale.onOrientationChange.add(this.onSizeChange,this);
        this.game.scale.onSizeChange.add(this.onSizeChange, this);
        this.game.scale.setResizeCallback(this.resizeGame, this);
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        this.game.input.maxPointers = 1;
        this.game.stage.disableVisibilityChange = false;
        this.textStyle = { font: "5.2em font_impact", fill: "#2B92A1" };
        // this.loadingText = this.game.add.text(this.game.world.centerX,this.game.world.centerY, "Loading...", this.textStyle);

        this.tutorial1VideoSource = "";
        this.attemptCount = 0;
        this.correctAttemptCount = 0;
        // getting the levelData JSON from the game cache
        this.dataJSON = this.game.cache.getJSON('leveldata');

        if (param !== undefined)
            this.levelID = (this.initParams.levelID !== "") ? this.initParams.levelID : this.dataJSON.levelData[0].id;
        else
            this.levelID = this.dataJSON.levelData[0].id;

        this.levelIndex = Number(this.dataJSON.levelData.map(function (x: any) { return x.id; }).indexOf(this.levelID))

        let splashTutorial = this.dataJSON.levelData.filter((item: any) => { return item.id === this.levelID })[0];
        if (typeof (splashTutorial.tutorial["T1"]) !== "boolean")
            this.tutorial1VideoSource = splashTutorial.tutorial["T1"];
    }
    /**
   * This method will get triggered when the user view the game in wrong orientation (i.e portrait mode)
   * 
   * @memberOf FunctionMatchGameStateBase
   */
    handleIncorrect() {
        if (this.orientationInstruction !== null) {
            this.orientationInstruction.destroy();
        }
        this.orientationInstruction = this.game.add.group();
        let background = this.game.add.sprite(0, 0, 'Orientation_Wrong');
        background.width = this.BASE_GAME_WIDTH;
        background.height = this.BASE_GAME_HEIGHT;
        background.inputEnabled = true;
        background.input.priorityID = 2;
        this.orientationInstruction.add(background);
        this.game.paused = true;
    }
    /**
     * This method will get triggered when the user switch the device orientation mode from portrait to landscape.
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    handleCorrect() {
        this.orientationInstruction.destroy();
        this.orientationInstruction = null;
        this.game.paused = false;
    }

    /**
     * This method is fired when game state size changed
     */
    onSizeChange() {

        this.game.state.resize(this.gameWidth, this.gameHeight);

        if (this.background == null) return;

        this.resizeGame();
    }

    /**
     * This method is used / called to handle all resize work on screen size change
     * @param 'objectToScale'  {any}  object that to be scaled
     * @param 'withChildren' {boolean} to know if the need to iterate on the object's child, 
     */
    resizeGame(): void {

        var w = window.innerWidth,
            h = window.innerHeight;

        //if (this.prevWindowWidth == w && this.prevWindowHeight == h) return;

        if (w >= h * this.WHRADIO) {
            this.gameHeight = h;
            this.gameWidth = h * this.WHRADIO;
        } else {
            this.gameWidth = w;
            this.gameHeight = w / this.WHRADIO;
        }

        this.scaleRate = this.gameHeight / this.BASE_GAME_HEIGHT;

        this.game.scale.setUserScale(this.scaleRate, this.scaleRate);

    }

    /**
     * This base level preload load most of common assets.
     */
    public loadAssets() {
        if(this.initParams.assetsLoaded){
            this.loadingSplash = false;
            this.initParams.assetsLoaded = true;
            this.initializeEngine();
            return;
        }
        // assets for Numeral game
        this.game.load.atlas('BadBird', 'assets/images/numerals_bg.png', 'assets/data/numerals_bg.json');
        this.game.load.atlas('RGBadBird', 'assets/images/BG_numerals_regrouping.png', 'assets/data/bg_numerals_regrouping.json');
        this.game.load.image('GoodBird', 'assets/images/GG_numerals.png');
        this.game.load.image('crossLine', 'assets/images/cross-line.png');
        this.game.load.image('Glow', 'assets/images/regrouping_01glow.png');
        this.game.load.image('RGGlow', 'assets/images/regrouping_02glow.png');

        this.game.load.image('up-arrow', 'assets/images/up-icon.png');
        this.game.load.image('down-arrow', 'assets/images/down-icon.png');
        this.game.load.image('delete-icon', 'assets/images/delete-icon.png');
        this.game.load.image('welldone', 'assets/images/welldone-star.png');
        this.game.load.image('congrats', 'assets/images/congrats.png');

        this.game.load.image('emptyData', 'assets/images/empty_data.png');

        // audio sfx preload
        this.game.load.audio('bar', 'assets/audio/bar.mp3');
        this.game.load.audio('badguyin', 'assets/audio/generic_grass_placement.mp3');
        this.game.load.audio('badguyin2', 'assets/audio/generic_grass_placement2.mp3');
        this.game.load.audio('generic_ooh', 'assets/audio/generic_ooh.mp3');
        this.game.load.audio('drop', 'assets/audio/generic_pop_V2.mp3');
        this.game.load.audio('drag', 'assets/audio/generic_pop1.mp3');
        this.game.load.audio('star', 'assets/audio/generic_star_arpeggio1.mp3');
        this.game.load.audio('star-final', 'assets/audio/generic_star_arpeggio2.mp3');
        this.game.load.audio('goodguyout', 'assets/audio/generic_synth_swipe.mp3');
        this.game.load.audio('benchguyin', 'assets/audio/generic_synth_swipe_combo.mp3');
        this.game.load.audio('referee_whistle', 'assets/audio/generic_whistle.mp3');
        this.game.load.audio('intro', 'assets/audio/intro_jingle_hi_brass.mp3');
        this.game.load.audio('lose', 'assets/audio/lose_jingle_trombones.mp3');
        this.game.load.audio('win', 'assets/audio/win_jingle_trumpets.mp3');

        //this.game.load.audio('soundfx', 'assets/audio/sfx.mp3');



        // tutorial hand animation
        this.game.load.atlasJSONHash('hand', 'assets/images/hand.png', 'assets/data/hand.json');

        // background for confirmation screen
        this.game.load.image('popup_confirm', 'assets/images/popup_confirm.png');

        // background for gameover popup screen
        this.game.load.image('popup', 'assets/images/popup.png');
        // this.game.cache.clearGLTextures();
        this.game.state.clearCurrentState();

        // background
        if (Number(this.initParams.urlParams.bg) == 1 || this.initParams.urlParams.bg === undefined) {
            this.game.load.image('background_pog', 'assets/images/background/background.png');
        } else {
            this.game.load.image('background_pog', 'assets/images/background/field.png');
        }

        // bench
        this.game.load.image('Bench', 'assets/images/bench.png');
        this.game.load.image('up-arrow', 'assets/images/up-icon.png');
        this.game.load.image('down-arrow', 'assets/images/down-icon.png');

        this.game.load.image('Orientation_Wrong', 'assets/images/portrait_screen.png');

        // different types of good guys 
        // typeId: 0
        this.game.load.atlasJSONHash("GG_WithoutShirt", "assets/images/Object_GG1.png", 'assets/data/Object_GG1.json');
        // typeId: 2
        this.game.load.atlasJSONHash("GG_WithShirt", "assets/images/Object_GG1.png", 'assets/data/Object_GG1.json');
        // typeId: 1
        this.game.load.atlasJSONHash("GG_SmallSpec_1", "assets/images/Object_GG1.png", 'assets/data/Object_GG1.json');
        // typeId: 5
        this.game.load.atlasJSONHash("GG_SmallSpec_5", "assets/images/Object_GG5.png", 'assets/data/Object_GG5.json');
        // typeId: 10
        this.game.load.atlasJSONHash("GG_SmallSpec_10", "assets/images/Object_GG10.png", 'assets/data/Object_GG10.json');
        // typeId: 100
        this.game.load.atlasJSONHash("GG_SmallSpec_100", "assets/images/Object_GG100.png", 'assets/data/Object_GG100.json');

        this.game.load.atlasJSONHash("mud", "assets/images/Object_mud.png", 'assets/data/Object_mud.json');

        // star animation 
        this.game.load.atlas('hit', 'assets/images/hit_animation.png', 'assets/data/hit_animation.json');

        /*  // different types of bad guys
          // typeId: 0
          this.game.load.atlasJSONHash("BG_WithoutShirt", "assets/images/Object_BG1.png", 'assets/data/Object_BG1.json');
          // typeId: 2
          this.game.load.atlasJSONHash("BG_WithShirt", "assets/images/Object_BG1.png", 'assets/data/Object_BG1.json');
          // typeId: 1
          this.game.load.atlasJSONHash("BG_SmallSpec_1", "assets/images/Object_BG1.png", 'assets/data/Object_BG1.json');
          // typeId: 5
          this.game.load.atlasJSONHash("BG_SmallSpec_5", "assets/images/Object_BG5.png", 'assets/data/Object_BG5.json');
          // typeId: 10
          this.game.load.atlasJSONHash("BG_SmallSpec_10", "assets/images/Object_BG10.png", 'assets/data/Object_BG10.json');
          // typeId: 100
          this.game.load.atlasJSONHash("BG_SmallSpec_100", "assets/images/Object_BG100.png", 'assets/data/Object_BG100.json');*/
        this.game.load.image('BG_WithoutShirt', 'assets/images/BadGuy_Body_1.png');
        this.game.load.image('BG_WithShirt', 'assets/images/BadGuy_Body_1.png');
        this.game.load.image('BG_SmallSpec_1', 'assets/images/BadGuy_Body_1.png');
        this.game.load.image('BG_SmallSpec_5', 'assets/images/BadGuy_Body_5.png');
        this.game.load.image('BG_SmallSpec_10', 'assets/images/BadGuy_Body_10.png');
        this.game.load.image('BG_SmallSpec_100', 'assets/images/BadGuy_Body_100.png');


        // different type of good guy animation
        // typeId: 0
        this.game.load.atlasJSONHash("anim_gg1", "assets/images/Object_gg1win.png", 'assets/data/Object_gg1win.json');

        // typeId: 5
        this.game.load.atlasJSONHash("anim_gg5", "assets/images/Object_gg5win.png", 'assets/data/Object_gg5win.json');

        // typeId: 10
        this.game.load.atlasJSONHash("anim_gg10", "assets/images/Object_gg10win.png", 'assets/data/Object_gg10win.json');

        // typeId: 100
        this.game.load.atlasJSONHash("anim_gg100", "assets/images/Object_gg100win.png", 'assets/data/Object_gg100win.json');

        // referee and animations
        this.game.load.atlasJSONHash('refereestart', 'assets/images/start.png', 'assets/data/start.json');

        // commented as no such state given in the updated assets
        // this.game.load.atlasJSONHash('refereestop', 'assets/images/stop.png', 'assets/data/stop.json');

        this.game.load.atlasJSONHash('refereeidle', 'assets/images/idle.png', 'assets/data/idle.json');
        this.game.load.atlasJSONHash('refereeBGWin', 'assets/images/BGWin.png', 'assets/data/BGWin.json');
        this.game.load.atlasJSONHash('refereeGGWin', 'assets/images/GGWin.png', 'assets/data/GGWin.json');


        this.game.load.atlas('UI', 'assets/images/ui_assets.png', 'assets/data/ui_assets.json');
        //load dirt animation
        this.game.load.atlasJSONHash("dirt", "assets/images/smokeEffect.png", 'assets/data/smokeEffect.json');

        //load bad guy expression and accessories
        this.game.load.atlasJSONArray('BG_Expressions', 'assets/images/BadGuy_Expressions.png', 'assets/data/BadGuy_Expressions.json');
        this.game.load.atlasJSONArray('BG_Accessories', 'assets/images/BadGuy_Accessories.png', 'assets/data/BadGuy_Accessories.json');
        this.game.load.bitmapFont("HMHMath", "assets/fonts/AvenirPrimaryHMHMath_Black.png", "assets/fonts/AvenirPrimaryHMHMath_Black.fnt")
        this.game.load.bitmapFont("HMHMath_bold", "assets/fonts/AvenirPrimaryHMHMath-Bold.png", "assets/fonts/AvenirPrimaryHMHMath-Bold.fnt")

        //loading transition video
        //this.game.load.video('transition', 'assets/video/transition_temp.mp4');

        //Video file loading
        this.game.load.video('end_animation', 'assets/video/ending_animation.mp4');

        /**
         * files for error handling
         */
        // this.game.load.atlasJSONHash("BG_SmallSpec_100-err", "assets/images/Object_BG100.png", 'assets/data/Object_BG1002.json');
        // this.game.load.atlas('UI-err', 'assets/images/ui_assets2.png', 'assets/data/ui_assets2.json');
        // this.game.load.image('Orientation_Wrong-err', 'assets/images/portrait_screen2.png');

        this.game.load.onLoadStart.add(this.loadStart, this);
        this.game.load.onFileComplete.add(this.fileComplete, this);
        this.game.load.onLoadComplete.add(this.loadComplete, this);
        this.game.load.onFileError.add(this.fileError, this);
        this.game.load.start();
    }



    /**
     * This is a default function from Phaser.State, used here to initialize the different part on UI
     *  
     **/

    sfx: Phaser.Sound;
    dottedLineBM: Phaser.BitmapData;
    dottedLineBMCollection: Array<any>
    bar: Phaser.Sound;
    intro: Phaser.Sound;
    drag: Phaser.Sound;
    drop: Phaser.Sound;
    badguyin: Phaser.Sound;
    badguyin2: Phaser.Sound;
    star: Phaser.Sound;
    star_final: Phaser.Sound;
    goodguyout: Phaser.Sound;
    benchguyin: Phaser.Sound;
    referee_whistle: Phaser.Sound;
    lose: Phaser.Sound;
    win: Phaser.Sound;

    create() {
        //this.sfx = this.game.add.audio('soundfx');
        //this.sfx.allowMultiple = true;
        this.bar = this.game.add.audio('bar');

        this.intro = this.game.add.audio('intro');
        this.badguyin = this.game.add.audio('badguyin');
        this.badguyin2 = this.game.add.audio('badguyin2');
        this.drag = this.game.add.audio('drag');
        this.drop = this.game.add.audio('drop');
        this.win = this.game.add.audio('win');
        this.lose = this.game.add.audio('lose');
        this.referee_whistle = this.game.add.audio('referee_whistle');
        this.star = this.game.add.audio('star');
        this.star_final = this.game.add.audio('star-final');
        this.goodguyout = this.game.add.audio('goodguyout');
        this.benchguyin = this.game.add.audio('benchguyin');
        this.badguyin.allowMultiple = true;
        this.endVideo = undefined;


        this.dottedLineBM = this.game.add.bitmapData(1600, 1200);
        this.dottedLineBM.ctx.beginPath();
        this.dottedLineBM.ctx.lineWidth = 20;
        this.dottedLineBM.ctx.strokeStyle = 'white';
        this.dottedLineBM.ctx.setLineDash([40, 30]);
        this.dottedLineBM.ctx.moveTo(20, 20);
        this.dottedLineBM.ctx.lineTo(20, 800);
        if (this.urlMode.line === "true" || this.urlMode.line == true)
            this.dottedLineBM.ctx.stroke();
        this.dottedLineBM.ctx.closePath();


        this.tutorialEngine = new TutorialEngine.Engine(this.game);
        //init everything
        this.initPaper();
        this.initBenchField();
        this.initBenchAndFakeBench();
        this.initBenchGuyGroup();
        this.initPartiotionLine();
        this.initBadGuyFields();
        this.initBadGuyGroup();

        if (this.engine.gameType == "Objects") {
            this.initGoodGuyFields();
        }
        this.initGoodGuyGroup();



        this.initRefreeField();
        // this.initPartiotionLine();
        this.inithomeButton();
        this.initRewardStars();
        // this.settingUpGameOverUI();

        // Attaching methods for Signal Handling
        this.onRoundWin.add(this.refereePlayWin, this)
        this.onRoundLose.add(this.refreePlayLose, this)
        this.tutorialField = this.game.add.group();
        this.tutorialDecoration = this.game.add.group();
        this.tutorialSheen = this.game.add.group();

        //this.tutorialDecoration = this.game.add.graphics(0, 0);
        //this.tutorialDecoration.lineStyle(this.shadowLine, 0x000000, 1);
        //this.tutorialDecoration.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);
        //let sprite = this.game.add.sprite(10, 10, this.dottedLineBM);

        //start of potrait mode
        this.game.scale.forceOrientation(true, false);
        this.game.scale.enterIncorrectOrientation.add(this.handleIncorrect, this);
        this.game.scale.leaveIncorrectOrientation.add(this.handleCorrect, this);
        this.game.input.maxPointers = 1;
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        //this.game.scale.setResizeCallback(this.resizeGame, this);
        this.resizeGame();
    }

    /**
         * This method is to checkAnswer correct or not, usually used when Referee cliked. 
         * @param  goodGuyValue is the GoodGuys total value from unknow field
         * return boolean for answer correct or wrong
         */
    checkAnswer(goodGuyValue: number): boolean {
        if (goodGuyValue === this.engine.unknownAnswer) {
            this.onRoundWin.dispatch();

            return true;
        } else {

            this.onRoundLose.dispatch();
            return false;
        }
    }

    /**
     * This function will be called when referee is clicked
     * and feedback (tutorial animation) finished playing
     */ 
    createOnReshuffle() {
        this.homeButton.inputEnabled = true;
        this.homeButton.input.useHandCursor = true;
        this.initBenchField();
        this.benchField.addChild(this.ggBenchBackground);
        this.benchField.addChild(this.fakeDraggingBench);
        this.initBenchGuyGroup();
        this.initPartiotionLine();
        this.initBadGuyFields();
        this.initBadGuyGroup();
        //this.initPartiotionLine();
        if (this.engine.gameType == "Objects") {
            this.initGoodGuyFields();
        }
        this.initGoodGuyGroup();

        this.initRefreeField();
        this.game.world.bringToTop(this.referee);
        this.initRewardStars();
        //this.settingUpGameOverUI();
        //this.tutorialEngine.start();
        this.resizeGame();

    }
    /**
     * this funtion will be executed when there is a video tutorial
     * @param {vidName}  string this will have the name for the video to be loaded
     * the default path is set to assets/video/{vidName}
     */
    loadtutorialVideo(vidName: string) {
        this.loadingSplash = true;
        this.game.load.onLoadStart.add(this.loadStart, this);
        //this.game.load.onFileComplete.add(this.splashFileComplete, this);
        this.game.load.onLoadComplete.add(this.loadComplete, this);
        this.game.load.onFileError.add(this.fileError, this);

        this.game.load.video('dolby', this.assetsPathVideo + vidName);
        this.game.load.start();
        this.tutorial1VideoSource = "";
    }

    /**
     * this function will execute if there is any error in loading the file
     */
    errorMessage: string = "KeyName  ||  ErrorMessage";
    errorCount: number = 0;
    fileError(progress: string, cacheKey: any, success: boolean) {
        this.errorCount++;
        //console.log("file load error::",progress, cacheKey, success);
        console.log('5')
        this.errorMessage += "\n" + this.errorCount + ". " + cacheKey.key + "  ||  " + cacheKey.errorMessage
    }

    /**
     * this function will execute when assets starts loading and show the 
     * loading message on the screen
     */
    loadStart() {
        this.splashBG = this.game.add.sprite(0, 0, "splashscreen");
        // this.splashBG.scale.setTo(0.5);
        this.loadingText = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY + 35, "font_bold", this.initParams.commontext.loading_assets, 40);
        this.loadingText.setText(this.initParams.commontext.loading_tutorial);
        this.loadingText.anchor.setTo(0.5);
        this.loadingText.tint = 0xffffff;
        this.game.world.bringToTop(this.loadingText)


    }

    /**
     * function will run when the splash file is loaded
     */
    splashFileComplete() {


    }

    /**
     * function will run when an asset loading is complete 
     */

    fileComplete(progress: number, cacheKey: any, success: boolean, totalLoaded: number, totalFiles: number) {


        // this.loadingText.setText("File Complete: " + progress + "%");
        this.loadingText.setText(progress + "%");
        /*  */

    }


    /**
     * function executes when all the assets loads
     */
    loadComplete() {
        console.log("%c" + this.errorMessage + "\nError Count :: " + this.errorCount, 'color:white; background:red; font-weight:bold;lineheight:3;');
        this.errorCount = 0;
        console.log("assets loading complete")
        this.loadingText.destroy();
        //this.splashBG.destroy();

        if (this.loadingSplash) {
            this.videoField = this.game.add.graphics(0, 0);
            this.videoField.lineStyle(this.shadowLine, 0x000000, 0);
            this.videoField.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);

            this.loadingSplash = false;
            this.tutorialVideo = this.game.add.video('dolby');
            this.videoTutorialSprite = this.tutorialVideo.addToWorld(this.game.world.centerX, this.game.world.centerY, 0.5, 0.5);
            this.videoTutorialSprite.width = this.videoField.getBounds().width / 1.2
            this.videoTutorialSprite.height = this.videoField.getBounds().height / 1.2
            let playBtn = this.game.add.sprite(0, 0, 'UI', 'btn_play');
            playBtn.anchor.setTo(.5)
            this.videoTutorialSprite.addChild(playBtn);
            this.videoField.addChild(this.videoTutorialSprite);

            this.videoField.inputEnabled = true;
            this.videoField.events.onInputDown.add(() => {
                playBtn.visible = false;
                this.tutorialVideo.play(false);
            })

            playBtn.inputEnabled = true;
            playBtn.input.useHandCursor = true;
            playBtn.events.onInputDown.add(() => {

                this.tutorialVideo.play(false);
                playBtn.visible = false;
                this.videoTutorialSprite.events.onInputDown.add((e: any) => {
                    this.videoField.destroy();
                    this.videoTutorialSprite.destroy();
                    this.tutorialVideo.destroy();
                    this.loadAssets();
                });

            })

            if (this.game.device.desktop) {
                this.tutorialVideo.play(false);
                playBtn.visible = false;

                this.videoTutorialSprite.events.onInputDown.add((e: any) => {
                    this.videoField.destroy();
                    this.videoTutorialSprite.destroy();
                    this.tutorialVideo.destroy();
                    this.loadAssets();
                });
            }

            if (this.game.device.android) {
                let touch: any = this.game.input.touch;
                touch.addTouchLockCallback(() => {
                    playBtn.visible = false;
                    this.tutorialVideo.play();
                    return true;
                }, this.tutorialVideo, true);
            }
           
            //This function will get triggered when the user clicks the 'Done' button in iPhone
            this.tutorialVideo.video.addEventListener('webkitendfullscreen', (() => {
                this.videoField.destroy();
                this.videoTutorialSprite.destroy();
                this.tutorialVideo.destroy();
                this.loadAssets();
            }), true);

            this.tutorialVideo.onComplete.add(() => {

            });

            // to disable video click skip make the follwing property false
            if (this.initParams.urlParams.skip === "true") {
                this.videoTutorialSprite.inputEnabled = true;
            } else {
                this.videoTutorialSprite.inputEnabled = false;
            }

            this.tutorialVideo.onPlay.add((e: any) => {

            });

            this.game.cache.removeVideo("dolby");
            this.resizeGame();
        } else {
            this.loadingSplash = false;
            this.initParams.assetsLoaded = true;
            this.initializeEngine();
        }

        this.game.load.onLoadStart.remove(this.loadStart, this);
        this.game.load.onFileComplete.remove(this.fileComplete, this);
        this.game.load.onLoadComplete.remove(this.loadComplete, this);
        this.game.load.onFileError.remove(this.fileError, this);
    }

    update() {
        /**
         * checking if Tutorial is present assigning event when video ends
         * and then it start loading the game assets to load the game 
         */
        if (this.tutorialVideo !== undefined) {
            if (Math.round(this.tutorialVideo.progress * 100) >= 100) {
                this.videoField.destroy();
                this.videoTutorialSprite.destroy();
                this.tutorialVideo.destroy();
                this.loadAssets();

            }
        }

         // work only for touch devices for autoplay
        if(!this.game.device.desktop) {
            if (this.endVideo !== undefined) {
                if (this.endVideo.currentTime>0 &&  this.endVideoField.visible==false) {
                    this.endVideoField.visible = true;
                    this.game.world.bringToTop(this.endVideoField);
                }
            }
                
            if (this.endVideo !== undefined && this.endVideoField.visible == true && this.endVideo.currentTime == this.endVideo.duration) {
                if (Math.round(this.endVideo.progress * 100) >= 100) {
                        this.endVideoField.destroy();
                        this.endVideoSprite.destroy();
                        this.endVideo.destroy();
                        this.gotoMenu();
                }
           }
       }

    }

    /**
     * This is a virtual function will be solved in child class to initialize good Guy Fields 
     *  */
    abstract initGoodGuyFields(): void;

    /**
     * This is a virtual function will be solved in child class to initialize good Guy group 
     *  */
    abstract initGoodGuyGroup(): void;

    /**
     * This is a virtual function will be solved in child class to initialize bad Guy Fields 
     *  */
    abstract initBadGuyFields(): void;

    /**
     * This is a virtual function will be solved in child class to initialize bad Guy group 
     *  */
    abstract initBadGuyGroup(): void;

    /**
    * These are the virtual functions, which will be solved in child class to manage referee animations( win or loose ) 
    *  */
    //abstract refreePlayLose(): void;
    //abstract refereePlayWin(): void;

    /**
     * This is a virtual function will be solved in the child class
     */
    abstract initializeEngine(): void;

    /**
     * This is the virtual fuction will be solved in the child that will
     * display or add the guy from bench to field
     * @param sprite  sprite object 
     * @param pointer  phaser.pointer object to get the release position of the dragged element
     */
    abstract addGuyOnTheField(sprite: Phaser.Sprite, pointer: Phaser.Pointer): void;


    /**
     * This is a virtual function which will be implemented in the child class
     * to detect when the bench guy drag has stopped and what action to be taken 
     * @param sprite  sprite object 
     * @param pointer  phaser.pointer object to get the release position of the dragged element
     */
    abstract benchGuyDragStopped(sprite: Phaser.Sprite, pointer: Phaser.Pointer): void;

    /**
     * This is a virtual function will be solved in the child class to clear the stage
     * when user clicks the referee to evalute the answer
     */
    abstract clearStage(toMenu?: boolean): void;


    /**
     *  This is a virtual function which will be solved in child class to calculate user answer's total value
     */
    abstract calculateTotalValue(userAnswer: Array<any>): number

    /**
     * this  is a virtual function which will solved in child class 
     * to setup the tutorial conditions
     */
    abstract setUpTutorial(): void

    /* this hold the user answer */
    storeAnswer: Array<any>;


    /**
     * This function will initialize stage 
     */
    initPaper() {

        this.background = this.game.add.sprite(0, 0, "background_pog");
        this.background.height = this.BASE_GAME_HEIGHT;
        this.background.width = this.BASE_GAME_WIDTH;
        this.badGuyGroup = this.game.add.group();
        this.goodGuyGroup = this.game.add.group();
        this.partiotionLineGroup = this.game.add.group();
        this.refereeField = this.game.add.group();
        this.benchGuyGroup = this.game.add.group();
        this.userAnswerArray = [];
        //this.tutorialEngine.start();
        this.setUpTutorial();

    }

    /**
     * This function will initialize bench field 
     */
    initBenchField() {

        this.benchField = this.game.add.graphics(0, 0);
        this.benchField.lineStyle(this.shadowLine, 0x000000, 0);


        // when vertical mode bench field height should be greater than game height, no matter how the scale rate changes
        // the below way is not great. we should not hard code padding e.g. 350  

        this.benchField.drawRect(this.BASE_GAME_WIDTH - this.BASE_BENCH_WIDTH, -10, this.BASE_BENCH_WIDTH, this.game.height + 350);
    }

    /**
     * This function will set the background shade for bench and swipe functionality 
     * for guys on the bench
     */
    initBenchAndFakeBench() {
        let margin = 300;
        this.ggBenchBackground = this.game.add.sprite(this.BENCH_POSITION_X, 0, "Bench");
        this.ggBenchBackground.width = this.benchField.getBounds().width;
        this.ggBenchBackground.position.x = this.benchField.getBounds().x
        this.ggBenchBackground.position.y = this.benchField.getBounds().y;
        this.benchField.addChild(this.ggBenchBackground);

        this.fakeDraggingBench = this.game.add.sprite(this.BENCH_POSITION_X, 0, "Bench");
        this.fakeDraggingBench.width = this.benchField.getBounds().width;
        this.fakeDraggingBench.height = this.benchField.getBounds().height;
        this.fakeDraggingBench.position.x = this.benchField.getBounds().x
        this.fakeDraggingBench.position.y = this.benchField.getBounds().y;
        this.benchField.addChild(this.fakeDraggingBench);
        this.fakeDraggingBench.inputEnabled = true;
        this.fakeDraggingBench.alpha = 0;
        //this.fakeDraggingBench.input.useHandCursor
        this.fakeDraggingBench.input.enableDrag(false);
        this.scaledDrag(this.fakeDraggingBench, "fakeBench");
        this.fakeDraggingBench.input.snapOnDrag = false;
        this.fakeDraggingBench.input.setDragLock(false, true);
        this.fakeDraggingBench.events.onInputDown.add(() => {

        })

        console.log("...................",this.engine.stateLevelJSONBlock.iterations);

        let domain = window.location.host;

        if (domain == 'localhost:5555' || domain == 'www-review-cert-tc1.thinkcentral.com'){

            let testing_graphic = this.game.add.graphics(0, 0); 
            testing_graphic.beginFill(0xFED73E, 1);
            testing_graphic.lineStyle(5, 0xFFFFFF, 1);
            testing_graphic.drawRect(0, 0, 300, 50);
            testing_graphic.endFill();

            let testingtext1 = this.game.add.bitmapText(15, 5, 'HMHMath_bold', "Iterations: "+ this.engine.stateLevelJSONBlock.iterations, 45);
            
            
            testingtext1.tint = 0x000000;

            let QAtitle = this.game.add.bitmapText(35, -45, 'HMHMath_bold', 'QA Purpose', 40);
            
            let testing_Sprite = this.game.add.sprite(35, 1325);
            testing_Sprite.addChild(testing_graphic);
            testing_Sprite.addChild(testingtext1);
            testing_Sprite.addChild(QAtitle);

            testing_Sprite.visible = Boolean(this.initParams.urlParams.testing=='true');
        
        }

        this.fakeDraggingBench.events.onInputUp.add((fBench: Phaser.Sprite) => {
            if (this.benchGuyGroup.height < this.game.world.height) {
                this.fakeDraggingBench.height = this.game.world.height + margin;
            } else {
                this.fakeDraggingBench.height = this.benchGuyGroup.height + margin;
            }
        })
        this.fakeDraggingBench.events.onDragUpdate.add((fakeBench: Phaser.Sprite) => {
            var minY: number = ((this.benchGuyGroup.height) > this.game.world.height) ? (this.benchGuyGroup.height - this.game.world.height) : 180;
            this.benchGuyGroup.y = fakeBench.y;
        });
        this.fakeDraggingBench.events.onDragStop.add((fakeBench: Phaser.Sprite) => {
            var tween = this.game.add.tween(this.benchGuyGroup);

            let minY: number = (this.benchGuyGroup.height) - this.game.world.height;
            this.benchGuyGroup.y = fakeBench.y + 180;

            if (fakeBench.y > this.benchProps["initialy"] || this.benchProps["goodGuyGroupChildCount"] <= 7) {
                fakeBench.y = this.benchProps["initialy"];
                tween.to({ y: fakeBench.y }, 1000, Phaser.Easing.Elastic.Out, true, 0);
            }
            // need to calculate this 100 value ... in progress

            if (Math.abs(fakeBench.y) > Math.abs(minY)) {

                fakeBench.y = -(minY + 180);//+this.game.world.getBounds().height;
                if (this.benchProps["initialHeight"] <= (this.benchProps["gameheight"] - 180)) {
                    //fakeBench.y = this.benchProps["initialy"];
                }

                tween.to({ y: fakeBench.y }, 1000, Phaser.Easing.Elastic.Out, true, 0);
            }
        })
        this.fakeDraggingBench.tint = 0xff0000;

    }

    /**
     * this method is used to bring tutorial animation on top of the game
     */
    bringTutorialOntop(obj: any) {

        this.tutorialAnimatonReference = obj;
        this.game.world.bringToTop(this.tutorialAnimatonReference);
    }

    /**
     * this method will return the first guy on the bench
     */
    getFirstGuyOnBench(): any {
        var allChildren: any = this.benchGuyGroup.children;
        if (allChildren.length) {
            for (let i = 0; i < allChildren.length; i++) {
                if (allChildren[i].data.name.indexOf("0") !== -1)
                    return allChildren[i];
            }
        } else {
            return false;
        }
    }




    /**
     * This function will initialize bench group 
     * @param {benchGuys}  array of the benchActor object optional when initialize for the 
     * first time, will be passed as a param when reshuffle is required for the bench
     * @param {sortID}  a property of the benchActor which is optional but passed when the bench is 
     * reshuffled and guy from the good guy field coming back to the bench when user drag the guy out
     * fro the good guy area
     */
    initBenchGuyGroup(benchGuys?: Array<any>, sortID?: number) {

        // fetching the good guy bench objects from the engine
        let animateBench = false;
        if (benchGuys === undefined) {

            this.localGoodGuysBench = this.sortBenchGuys((this.engine as POGGameEngineBase.NewEngineBase).bench);
            animateBench = true;
        } else {
            this.localGoodGuysBench = this.sortBenchGuys(benchGuys);
        }

        var ypos = 180; var ygap = 40;
        this.benchGuyGroup.y = ypos;
        //adding a dummyguy to the goodguy group as a fake item to keep the height
        // of the group intact
        var dummyguy: any = this.game.add.sprite(this.benchGuyGroup.x, 180, "GG_WithoutShirt");
        dummyguy.alpha = 0;
        dummyguy.data.name = "dummyguy"
        dummyguy.height = dummyguy.width = 0;
        this.benchGuyGroup.addChild(dummyguy);

        var style = { font: "50px font_impact", fill: "black" };
        for (let i = 0; i < this.localGoodGuysBench.length; i++) {
            let keyString = "GG_" + (this.localGoodGuysBench[i].actor.cacheKey);
            var guy = this.game.add.sprite(0, ypos, keyString);
            let scale: number;

            scale = this.localGoodGuysBench[i].actor.width / guy.width;
            guy.anchor.x = 0.5;
            guy.scale.setTo(scale * 2);

            if (i > 0) {
                guy.position.y = this.benchGuyGroup.children[this.benchGuyGroup.children.length - 1].position.y + (this.benchGuyGroup.children[this.benchGuyGroup.children.length - 1] as Phaser.Sprite).height + 40;
            }

            guy.data.benchPosition = {
                "x": guy.x, "y": guy.y, "index": i
            }
            //this.addMudToGuy(guy,-3.5);
            guy.data.id = i;
            guy.data.cacheKey = keyString;
            guy.data.name = "good-guy-" + i;
            guy.data.addedToField = false;
            guy.data.value = this.localGoodGuysBench[i].actor.value;
            guy.frameName = "GGIdle";
            guy.inputEnabled = true;
            guy.input.useHandCursor = true;
            guy.input.enableDrag(false);
            guy.data.infinite = this.localGoodGuysBench[i].infinit;
            guy.data.sortID = this.localGoodGuysBench[i].sortID;
            guy.data.metaData = this.localGoodGuysBench[i];
            guy.events.onInputDown.add((me: Phaser.Sprite) => {
                this.drag.play();
                this.game.world.bringToTop(this.benchField);
                this.game.world.bringToTop(this.benchGuyGroup);
                // if (!this.sheenAppearence) {
                this.game.world.bringToTop(this.rewardsGroup);
                // }
                this.benchGuyGroup.bringToTop(me);
                this.game.world.bringToTop(this.tutorialField);
            });
            this.scaledDrag(guy, "goodGuys");
            guy.events.onDragStop.add((sprite: Phaser.Sprite, pointer: Phaser.Pointer) => {
                this.benchGuyDragStopped(sprite, pointer);
            }, this);

            if (this.localGoodGuysBench[i].actor.spriteType == 2) {
                let valueText = this.game.add.bitmapText(0, 0, 'font_bold', this.localGoodGuysBench[i].actor.value.toString(), 60);
                valueText.anchor.setTo(0.5, -1.1);
                valueText.tint = 0xb55f01
                guy.addChild(valueText);
            }

            // animating the guy when it is coming back from the field to bench
            if (sortID !== undefined) {
                if (sortID !== -1 && this.localGoodGuysBench[i].sortID === sortID) {
                    guy.alpha = 0;
                    let tween = this.game.add.tween(guy);
                    tween.to({ alpha: 1 }, 700, Phaser.Easing.Linear.None, true, 0);
                }
            }
            this.benchGuyGroup.addChild(guy);
            ypos += guy.y + guy.height + ygap;
        }

        if (benchGuys === undefined) {
            this.benchField.addChild(this.benchGuyGroup);
            this.benchGuyGroup.position.x = this.benchField.getBounds().x + (this.benchField.getBounds().width / 2);
        }
        dummyguy.x = this.benchGuyGroup.position.x;
        this.benchGuyGroup.position.y = this.benchField.getBounds().y;
        this.benchProps = {
            "initialy": this.benchGuyGroup.getBounds().y,
            "initialHeight": this.benchGuyGroup.getBounds().height,
            "gameheight": this.game.world.height - this.benchGuyGroup.y,
            "goodGuyGroupChildCount": this.benchGuyGroup.children.length
        };

        /**
         * the condition below will animate the bench only when the 
         * state load for first time OR when the level change
         */
        if (animateBench) {
            this.benchGuyGroup.children.forEach((child: any, index: any) => {
                child.y += 1100;
                child.height += 50;
                child.width += 50;

                let tween = this.game.add.tween(child);
                tween.to({ y: child.y - 1100, height: child.height - 50, width: child.width - 50 }, 700, Phaser.Easing.Bounce.In, true, (index + 1) * 100, 0, false);
                if (index == this.benchGuyGroup.children.length - 1) {
                    tween.onComplete.addOnce(() => {
                        this.tutorialEngine.start();

                    })
                }
                if (index == 0) {
                    tween.onComplete.addOnce(() => {
                        this.benchguyin.play()

                    })
                }
            });
            try {
                if (this.dataJSON.levelData[this.levelIndex].tutorial.T2) {
                    let firstChild: any = this.benchGuyGroup.getChildAt(1);
                    console.log("the correct answer == ", this.engine.getAnswer(), firstChild.data.value)
                    this.benchGuyGroup.setAll("inputEnabled", false);
                    firstChild.inputEnabled = true;
                    firstChild.input.useHandCursor = true;
                }
            } catch (e) { console.log(e); }

        }


        /**
         * Adjusting the bench height and enable/disable when required
         */

        if ((this.benchGuyGroup.height + 180) > this.game.height) {
            this.fakeDraggingBench.inputEnabled = true;
        } else {
            this.fakeDraggingBench.inputEnabled = false;
        }
        this.fakeDraggingBench.height = this.game.world.height + 300;


    }

    /**
     * method to add mud to the guys
     */
    addMudToGuy(sprite: Phaser.Sprite, anchorY?: number) {
        let mud1 = this.game.add.image(0, 0, "mud");
        let mud2 = this.game.add.image(0, 0, "mud");
        let smallSpec = false;
        let _anchorY = anchorY === undefined ? -1.5 : anchorY;

        if (sprite.key.toString().toLowerCase().indexOf("smallspec") !== -1) {
            smallSpec = true;
        }
        mud1.frameName = "mudsplash1";
        mud2.frameName = "mud1";
        mud1.anchor.setTo(.5, _anchorY + 1.5);
        mud2.anchor.setTo(.5, _anchorY - .1);
        //mud1.alpha = mud2.alpha = 0;
        if (smallSpec && sprite.data.value === 100) {
            mud1.frameName = "mudsplash";
            mud2.frameName = "mud10";
            mud1.anchor.setTo(.5, _anchorY + .67);
            mud2.anchor.setTo(.5, -(_anchorY + 8.67));
        }
        if (smallSpec && sprite.data.value === 5) {
            mud1.anchor.setTo(.5, -(_anchorY + 5));
            mud2.anchor.setTo(.5, -(_anchorY + 11.67));
        }
        if (smallSpec && sprite.data.value === 10) {
            mud1.anchor.setTo(.5, -(_anchorY + 9.5));
            mud2.anchor.setTo(.5, -(_anchorY + 22));
        }

        mud2.scale.setTo(1.2, 1)
        sprite.data.mud1 = mud1;
        sprite.data.mud2 = mud2;
        if (!smallSpec || (smallSpec && sprite.data.value === 1))
            mud1.visible = false;
        sprite.addChild(mud1)
        sprite.addChild(mud2)
    }

    /**
     * sort the bench guys on thier uniqueID value
     */
    sortBenchGuys(collection: Array<any>): Array<any> {
        var sorted = collection;
        sorted.sort(function (a, b) { return (a.sortID > b.sortID) ? 1 : ((b.sortID > a.sortID) ? -1 : 0); });
        return sorted;
    }

    /**
     * this function will re-arrange the bench when the guys dragged on the field from bench
     */
    rearrangeBenchGuys(action: string, sprite: Phaser.Sprite) {
        let updatedBenchArray: any;
        let sortID = -1;
        switch (action) {
            case "reshuffle":
                updatedBenchArray = this.updateBenchArray(sprite);
                break;
            case "shownext":
                sortID = (<any>sprite).sortID;
                let exist = false;
                for (let i = 0; i < this.localGoodGuysBench.length; i++) {
                    if (this.localGoodGuysBench[i].sortID === sortID) {
                        exist = true;
                        break;
                    }
                }
                if (!exist) {
                    this.localGoodGuysBench.push(sprite);
                }
                updatedBenchArray = this.localGoodGuysBench;

                break;
        }
        if (updatedBenchArray.length >= 1) {
            this.benchGuyGroup.removeAll();
            this.initBenchGuyGroup(updatedBenchArray, sortID);
        }
    }

    /**
     * this function will update the bench guys array to 
     * regenerate it again when the guy dragged from bench to 
     * good guy field
     */
    updateBenchArray(sprite: Phaser.Sprite, action?: string): Array<any> {
        var splicedSprite: any;
        for (let i = 0; i < this.localGoodGuysBench.length; i++) {
            if (sprite.data.sortID === this.localGoodGuysBench[i].sortID) {
                splicedSprite = this.localGoodGuysBench.splice(i, 1);
            }
        }
        return this.localGoodGuysBench;
    }

    /**
     * function to keep the position intact while dragging on a scaled world
     * @param sprite  object that need to be dragged
     * @param spriteName  name of the sprite as 'string' 
     */
    scaledDrag(sprite: Phaser.Sprite, spriteName: string) {
        if (spriteName === "fakeBench") {
            this.fakeDraggingBench.input.setDragLock(false, true);
        }
        let self = this;
        this.game.world.bringToTop(sprite);
        sprite.events.onDragUpdate.add(function (sprite: Phaser.Sprite, pointer: Phaser.Pointer, x: number, y: number) {
            var pos = sprite.game.input.getLocalPosition(sprite.parent, pointer);
            // added for SURFACE PRO Tablet
            /*
            if(sprite.toGlobal(sprite.position).x < -1800){
                //dispatchEvent
                sprite.events.onDragStop.dispatch(this)
            }
            */
            if (sprite.hitArea) {
                if (spriteName !== "fakeBench") {
                    sprite.x = pos.x// - sprite.width/4;
                    sprite.y = (spriteName === 'goodGuys') ? pos.y - sprite.height / 2 : pos.y;
                }
            } else {
                if (spriteName !== "fakeBench") {
                    sprite.x = pos.x// - sprite.width/4;
                    sprite.y = (spriteName === 'goodGuys') ? pos.y - sprite.height / 2 : pos.y;
                }
                if(sprite.position.x < -1800 && this.game.device.touch== true && self.isBrowserEdge){  
                        sprite.events.onDragStop.dispatch(self.benchGuyDragStopped(sprite, pointer));                  
                }                 
            }
        }, sprite);
        return sprite;
    }

    /**
     * This function will remove the guy from the user answer array when user drag out the guy from the field
     * function will search the sprite name through the array and remove the element
     * @param spriteName  sprite name as 'string'
     */
    removeSpriteArray(spriteName: string): any {
        var splicedSprite: any;
        for (let i = 0; i < this.userAnswerArray.length; i++) {
            if (spriteName === this.userAnswerArray[i].data.name) {
                splicedSprite = this.userAnswerArray.splice(i, 1);
                return splicedSprite;
            }
        }
        this.enableOrDisableReferee();
    }

    /**
     * This methoed will detect if the sprite overlapping to the specific graphic area
     * @param 'sprite' Phaser.Sprite element to check for overlapping
     * @param 'zone' Phaser.Graphic zone over which overlapping to be checked
     */
    checkZoneIntersects(sprite: Phaser.Sprite, zone: any): boolean {
        var spriteBounds: any = sprite.getBounds();
        var zoneBounds: any = zone.getBounds();
        return Phaser.Rectangle.intersects(spriteBounds, zoneBounds);
    }

    /**
     * This methoed will detect if the sprite overlapping the specific group items
     * @param 'sprite' Phaser.Sprite element to check for overlapping
     * @param 'collection' array that collect all the good guys dragged on the field 
     */
    checkZoneIntersectsWithGroupItems(sprite: Phaser.Sprite, collection: Array<any>, from?: string): any {
        let comingfrom = from !== undefined ? from : "";
        var spriteBounds: any = sprite.getBounds();
        var intersection = {
            overLap: false,
            child: "null"
        };
        for (let i = 0; i < collection.length; i++) {
            var childItem: any = collection[i]//.getChildAt(0);
            var childItemBounds: any = childItem.getBounds();
            if (Phaser.Rectangle.intersects(spriteBounds, childItemBounds) && sprite !== childItem) {
                intersection.overLap = true;
                intersection.child = childItem;
                break;
            }
        }
        return intersection;
    }

    /**
     * This method will check the overlap between two groups
     */
    checkOverLapBetweenGroups(goup1: Phaser.Group, group2: Phaser.Group): boolean {
        var spriteBounds: any = goup1.getBounds();
        var zoneBounds: any = group2.getBounds();
        return Phaser.Rectangle.intersects(spriteBounds, zoneBounds);
    }

    /**
     * This function will initialize refree
     */
    initRefreeField() {

        // referee initialize
        this.refereeXpos = this.BASE_GAME_WIDTH - this.BASE_BENCH_WIDTH;
        //this.refereeYpos = this.BASE_GAME_HEIGHT / 2 + this.GAME_OFFSET_Y;
        if (this.fixedPosition) {
            this.refereeYpos = this.BASE_GAME_HEIGHT - this.fixedPosition + this.GAME_OFFSET_Y;
        } else {
            this.refereeYpos = this.BASE_GAME_HEIGHT / 2 + this.GAME_OFFSET_Y;
        }


        this.referee = this.game.add.sprite(this.refereeXpos, this.refereeYpos, 'refereeidle');
        this.referee.scale.setTo(1.5);
        this.referee.anchor.setTo(0.5);
        this.referee.x = this.refereeXpos - this.referee.width / 2;
        this.referee.animations.add('referee_idle');
        this.referee.animations.play('referee_idle', 15, false);
        this.referee.animations.currentAnim.onComplete.add(() => {
            setTimeout(() => {
                this.referee.animations.play('referee_idle', 15, false);
            }, 3000)
        })
        this.referee.inputEnabled = true;
        // this.referee.input.useHandCursor = true;
        this.referee.input.pixelPerfectClick = true;
        this.referee.input.pixelPerfectOver = true;
        // Adding referee to the group
        this.refereeField.add(this.referee);

        this.referee.events.onInputDown.add(this.initRefereeClick, this);
        // this.partiotionLine.y = this.referee.y + (this.referee.height / 4)
        if (this.engine.gameType == "Objects") {
            this.partiotionLine.y = this.referee.y + (this.referee.height / 4)
        }
    }


    /**
     * this function will handle referee click
     */
    initRefereeClick() {
        this.tutorialField.destroy();
        this.tutorialDecoration.destroy();
        this.tutorialSheen.destroy();
        if (this.userAnswerArray.length == 0)
            return;
        this.referee_whistle.play();
        let factor1 = this.engine.factors1;
        let factor2 = this.engine.factors2;
        this.homeButton.inputEnabled = false;
        this.checkAnswer(this.calculateTotalValue(this.userAnswerArray));
        for (let i = 0; i < this.userAnswerArray.length; i++) {
            if (this.userAnswerArray[i] == undefined) { return; }
            (<any>this.userAnswerArray[i]).inputEnabled = false;
        }
        for (let i = 0; i < this.benchGuyGroup.children.length; i++) {
            (<any>this.benchGuyGroup.children[i]).inputEnabled = false;
        }
        if (this.sheenAppearence) {
            this.game.world.bringToTop(this.rewardsGroup);
        }
    }

    /**
     * this function will show / hide handcursor from the referee
     * based on the guys on the field
     */
    enableOrDisableReferee() {
        if (this.userAnswerArray.length > 0) {
            this.referee.inputEnabled = true;
            this.referee.input.useHandCursor = true;
        } else {
            this.referee.input.useHandCursor = false;
            this.referee.inputEnabled = false;
        }

    }

    /**
     * this function will initialize field partition line
     */
    initPartiotionLine() {

        // the if is for numeric game where the partition line position is relatively fixed
        let partiotionLineYpos: number;
        let partiotionLineXpos: number;


        if (this.engine.gameType == "Objects") {
            partiotionLineYpos = this.BASE_GAME_HEIGHT / 2;
            partiotionLineXpos = this.BASE_GAME_WIDTH - this.BASE_BENCH_WIDTH
        } else {
            this.fixedPosition = 366;
            partiotionLineYpos = this.BASE_GAME_HEIGHT - this.fixedPosition;
            partiotionLineXpos = this.BASE_GAME_WIDTH - this.BASE_BENCH_WIDTH - this.lessMargin;

        }


        // feild partition line
        this.partiotionLine = this.game.add.graphics(0, partiotionLineYpos);
        this.partiotionLine.lineStyle(1, 0xDDDDDD, 0);
        this.partiotionLine.beginFill(0xFFFFFF, 1);
        this.partiotionLine.drawRect(0, 0, partiotionLineXpos, 20);
        this.partiotionLine.endFill();
        this.partiotionLine.y = partiotionLineYpos + 2 * this.GAME_OFFSET_Y;

        // Adding partition line to the group
        this.partiotionLineGroup.add(this.partiotionLine)

    }

    /**
     * sprite to enable disable the audio for the game
     */
    soundBtn: Phaser.Sprite;

    /**
     * this function will initialize home button
     */
    inithomeButton() {
        // home button on left top corner
        this.homeButton = this.game.add.sprite(80, 80, 'UI', 'btn_home');
        this.homeButton.anchor.setTo(0.5, 0.5);
        this.homeButton.scale.setTo(.8)
        this.homeButton.inputEnabled = true;
        this.homeButton.input.useHandCursor = true;
        this.homeButton.input.pixelPerfectClick = true;
        this.homeButton.input.pixelPerfectOver = true;
        this.homeButton.data.height = this.homeButton.height;
        this.homeButton.data.width = this.homeButton.width;

        this.homeButton.events.onInputDown.add((e: any) => {
            this.buttonPress(e, "down")
            this.showConfirmationBox();
        })

        this.homeButtonGroup = this.game.add.group();

        // Adding home button to group to resize
        this.homeButtonGroup.add(this.homeButton);
        this.soundBtn = this.game.add.sprite(this.homeButton.x, this.homeButton.y, 'UI', 'btn_sound_ON');

        //this.soundBtn.y = this.homeButton.y ;
        this.soundBtn.x = (this.homeButton.width) + this.homeButton.x;
        this.soundBtn.anchor.setTo(.5, 0.5);
        this.soundBtn.scale.setTo(.8)
        this.soundBtn.inputEnabled = true;
        this.soundBtn.input.useHandCursor = true;
        this.soundBtn.input.pixelPerfectClick = true;
        this.soundBtn.input.pixelPerfectOver = true;
        this.soundBtn.data.height = this.soundBtn.height;
        this.soundBtn.data.width = this.soundBtn.width;

        /**
         * Keeping the audio button state as mute or unmute
         * 
         */
        if (this.initParams.audiomute) {
            this.soundBtn.frameName = "btn_sound_OFF"
        }

        this.soundBtn.events.onInputDown.add((e: any) => {
            this.buttonPress(e, "down")
            if (this.soundBtn.frameName === "btn_sound_ON") {
                this.soundBtn.frameName = "btn_sound_OFF"
                //this.game.sound.volume = 0.0;
                this.initParams.audiomute = true;
                this.game.sound.mute = this.initParams.audiomute;
            } else {
                this.soundBtn.frameName = "btn_sound_ON"
                // this.game.sound.volume = 1.0;
                this.initParams.audiomute = false;
                this.game.sound.mute = this.initParams.audiomute;
            }
        });
        let emptydata = this.game.add.sprite(200, this.game.world.height - 100, "emptyData");
        // emptydata.scale.setTo(.1);
        emptydata.anchor.setTo(.5);
        let etext = this.game.add.text(0, 0, "clear data", { fill: "#000000", fontSize: "34px" })
        etext.anchor.setTo(0.5);
        emptydata.addChild(etext);
        emptydata.inputEnabled = true;
        emptydata.events.onInputDown.add(() => {
            this.userDataServiceCAS.saveGameUserData([], this);
            emptydata.visible = false;
        });
        emptydata.visible = false;
        if (this.initParams.urlParams.clear === "true") {
            emptydata.visible = true;
        }


    }

    /**
     * this function is to give the press event to the buttons
     */
    buttonPress(sprite: Phaser.Sprite, action: String) {
        let val = action === "up" ? 10 : -10;
        let w = sprite.width;
        let h = sprite.height;
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
            })
            ;
    }


    /**
     * this funtion will initialize star rewards section
     */
    initRewardStars() {

        // local group to add star group & reward background in same
        let mainGroup = this.game.add.group();

        let rewardBGXposition = this.BASE_GAME_WIDTH - this.BASE_BENCH_WIDTH;
        mainGroup.x = rewardBGXposition + 30;

        //rewards section on top right
        this.rewardBG = this.game.add.sprite(0, 16, 'UI', 'star_bar');
        this.rewardBG.anchor.setTo(0.1, 0.1);
        this.rewardBG.height -= 40;
        // this.rewardBG.scale.setTo(1.8);
        mainGroup.add(this.rewardBG)

        // to set star position other than first
        var xpos = 0;

        //used to set margin for star
        var ypos = 34;

        //used to set gap between two stars
        var xgap = 40;

        //getting number of repitition by calling engine's function
        let attempts = (this.engine as POGGameEngineBase.NewEngineBase);

        //contains rewards star in same group
        this.starGroup = this.game.add.group();

        //loop to generate rewards star based on repeatation in json
        for (var i = 0; i < attempts.setAttempts(); i++) {
            var star = this.game.add.sprite(0, 0, 'UI', 'checkMark_Slot');
            star.anchor.setTo(.5, .15);
            star.scale.setTo(.45)

            star.x = xpos;
            xpos = ((star.width) + star.x) + xgap;

            star.y = ypos;
            if (i < this.correctAttemptCount) {
                star.frameName = "checkMark";
                // star.height = star.width = 48;
            }
            this.starGroup.add(star);
        }

        mainGroup.addChild(this.starGroup)

        //Setting star postion centerd
        this.starGroup.x = (mainGroup.width - this.starGroup.width) / 2;
        this.rewardsGroup = this.game.add.group();

        // Adding star section to rewardsGroup group to resize
        this.rewardsGroup.add(mainGroup);

    }

    /**
   * This method will animate the guys falling on the bench
   * while initializing the stage
   * @param collection  sprite group to aniamte
   */


    animateGuysFromGroup(collection: Array<any>, animType?: string) {
        this.animationGuysSprite.length = 0;
        collection.forEach((bgItem: Phaser.Sprite, idx: number) => {
            bgItem.data.forAnim = { "x": bgItem.x, "y": bgItem.y };

            if (animType !== undefined && animType !== "goodguy") {
                // this will play when there is an animation for the
                // guys winning and reset the stage to load new level
                // or equation again with new number
                bgItem.frameName = (animType === "win") ? "GGHappy" : "BGHappy";
                if (animType === "win") {
                    let guytype = "anim_gg1";
                    switch (bgItem.data.spriteType) {
                        case 5:
                            guytype = "anim_gg5";
                            break;
                        case 10:
                            guytype = "anim_gg10";
                            break;
                        case 100:
                            guytype = "anim_gg100";
                            break;
                    }
                    bgItem.visible = false;
                    let x, y;

                    if (this.engine.gameType === "Objects") {
                        x = bgItem.x
                        y = bgItem.y
                    } else {
                        x = bgItem.input.globalToLocalX(this.groupU.x) + bgItem.x
                        y = bgItem.input.globalToLocalY(this.groupU.y) + bgItem.y
                    }
                    let newGoodGuy = this.game.add.sprite(x, y, guytype);
                    this.animationGuysSprite.push(newGoodGuy);
                    newGoodGuy.anchor.setTo(bgItem.anchor.x, bgItem.anchor.y)
                    newGoodGuy.scale.setTo(bgItem.scale.x, bgItem.scale.y);
                    newGoodGuy.animations.add("gg1_win_anim");
                    newGoodGuy.animations.play("gg1_win_anim", this.engine.randomNumberGeneration(16, 24), true);
                    newGoodGuy.animations.currentAnim.onLoop.add((e: any) => {
                        if (e.animations.currentAnim.loopCount >= 3) {
                            e.animations.currentAnim.stop();
                            // e.kill();
                        }
                    });
                }

                var tween = this.game.add.tween(bgItem);
                let randomDelay = Math.round(Math.random() * 100) * 10;
                let animY = animType === "win" ? bgItem.y - 50 : bgItem.y;
                if (this.engine.gameType == "Objects") {
                    tween.to({ y: animY, height: bgItem.height }, 500, Phaser.Easing.Linear.None, true, randomDelay, 2, true);
                } else {
                    // this else if for numeric game need to check
                    //tween.to({ y: bgItem.y - 20, height: bgItem.height }, 500, Phaser.Easing.Linear.None, true, randomDelay, 2, false);
                    if (animType === "win") {
                        tween.to({ y: bgItem.y - 50, height: bgItem.height }, 500, Phaser.Easing.Linear.None, true, randomDelay, 2, true);
                    } else {
                        tween.to({ y: bgItem.y, height: bgItem.height }, 500, Phaser.Easing.Linear.None, true, randomDelay, 2, true);
                    }
                }
                if (idx === collection.length - 1) {
                    tween.onComplete.addOnce(() => {
                        this.clearStage();
                    })
                }

            } else {
                // this will play when the guys appear on the bench
                // falling from top
                if (animType !== "goodguy")
                    bgItem.y -= 300;

                let tween = this.game.add.tween(bgItem);
                tween.to({ y: bgItem.data.forAnim.y }, 1000, Phaser.Easing.Bounce.Out, true, 100 * idx);
                tween.onComplete.addOnce(() => {
                    if (bgItem.data.sound !== undefined) {
                        setTimeout(() => {
                            bgItem.data.sound.play();
                        },
                            100);
                    }
                    if (bgItem.data.mud1 !== undefined) {
                        let tween = this.game.add.tween(bgItem.data.mud1);
                        tween.to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
                    }
                    if (bgItem.data.mud2 !== undefined) {
                        let tween = this.game.add.tween(bgItem.data.mud2);
                        tween.to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
                    }
                });
            }
        })
    }

    /**
     * This function is used to load the end video and set it's visibility as false
     * 
     * @memberof FunctionMatchGameStateBase
     */
    addEndVideo() {
        this.endVideo = this.game.add.video('end_animation');
        this.endVideoField  = this.game.add.graphics(0, 0);
        this.endVideoField.beginFill(0x6fc6ca);
        this.endVideoField.lineStyle(this.shadowLine, 0x000000, 1);
        this.endVideoField.drawRect(0,0,this.game.width,this.game.height);
        this.endVideoField.visible=false;
        this.endVideoSprite = this.endVideo.addToWorld(150, 100);
        this.endVideoSprite.width = this.endVideoField.getBounds().width / 1.2;
        this.endVideoSprite.height = this.endVideoField.getBounds().height / 1.2;
        this.endVideoField.addChild(this.endVideoSprite);
       
        // for desktop only
        if (this.game.device.desktop) {
            this.endVideo.onComplete.addOnce(() => {
                /*this.endVideoField.destroy();
                this.endVideoSprite.destroy();
                this.endVideo.destroy();
                this.game.cache.removeVideo('end_animation');*/
                this.gotoMenu();
            });
        }

        if(!this.game.device.desktop) {
            this.endVideo.currentTime = 0;
            this.endVideo.play();
        }
    }

    /**
     * function to clear all the elements from the stage 
     * and reinitialize the required properties, implemented in the game state
     */
    abstract clearAllFromScreen(): void;
    /**
     * This function will have the UI for the Game Over Screen with Stars, Next Level button
     * and the Home Button
     */
    settingUpGameOverUI() {
        //var transitionArray = ['transition1', 'transition2', 'transition3'];
        //var randVideo = transitionArray[Math.floor(Math.random() * transitionArray.length)];
        //this.transitionVideo = this.game.add.video(randVideo);
       // this.transitionVideoSprite = this.transitionVideo.addToWorld(this.game.world.centerX, this.game.world.centerY, 0.5, 0.5);
       // this.transitionVideoSprite.visible = false;

        console.log("game over UI")
        this.gameOverScreenGroup = this.game.add.group();
        this.gameOverScreenGroup.x = 0;
        this.gameOverScreenGroup.y = 0;
       
        /** shadow */
        /* Game Over screen BG */
        var shadow = this.game.add.sprite(0, 0, "Bench");

        shadow.width = this.game.world.width;
        shadow.height = this.game.world.height;
        shadow.inputEnabled = true;
        this.gameOverScreenGroup.addChild(shadow)
        let innerBoxGroup = this.game.add.group();
        
        // this.gameOverScreenGroup.add(shadow);
        /* Game Over screen BG */
        let gameOverBG = this.game.add.image(this.game.world.centerX, this.game.world.centerY, 'popup', "", innerBoxGroup);// this.game.add.graphics(197, 52, this.gameOverScreenGroup);

        gameOverBG.anchor.set(0.5, 0.5)
        // x-300 is temporary till we get the update graphics
        let ribbonLeft = this.game.add.sprite(gameOverBG.x - 365, gameOverBG.y - (gameOverBG.height / 2) + 40, 'UI', 'ribbon', innerBoxGroup);
        ribbonLeft.anchor.set(0.5, 0);
        // ribbonLeft.scale.set(0.5);
        let ribbonRight = this.game.add.sprite(gameOverBG.x + (ribbonLeft.width / 2), gameOverBG.y - (gameOverBG.height / 2) + 40, 'UI', 'ribbon', innerBoxGroup);
        ribbonRight.anchor.set(0.5, 0);
        ribbonRight.scale.x = -1;
        ribbonRight.scale.y = 1;
        innerBoxGroup.add(gameOverBG);

        let victory = this.game.add.sprite(gameOverBG.x, ribbonLeft.y + 10, 'UI', 'victory_gradesK', innerBoxGroup);
        victory.anchor.set(0.5, 0);
        victory.alpha = 0;
        
        this.nextBtn = this.game.add.sprite(gameOverBG.x, gameOverBG.y + 100, 'UI', 'btn_next', innerBoxGroup);
        this.nextBtn.anchor.setTo(0.5);
        //this.nextBtn.inputEnabled = true;

        let nextLevel = this.engine.moveLevel(Number(this.engine.currentLevel));
        if (nextLevel == "false") {
            this.initParams.gameCompleted = true;
        } else {
            this.initParams.gameCompleted = false;
        }
       
        this.nextBtn.events.onInputDown.addOnce((e: any) => {
            this.buttonPress(e, "down")
            let prevGameType = this.engine.gameType;
            var nextLevelJSONID = this.engine.moveLevel(Number(this.engine.currentLevel));
            this.levelID = nextLevelJSONID;
            this.levelIndex = Number(this.dataJSON.levelData.map(function (x: any) { return x.id; }).indexOf(this.levelID));
            this.initParams.levelID = nextLevelJSONID;

            if (nextLevelJSONID !== "false") {
                this.clearAllFromScreen();
                let nextGameType = this.dataJSON.levelData[this.levelIndex].operation.gameType
                if (prevGameType != nextGameType) {
                    this.game.state.clearCurrentState();
                    this.initParams.animationCheck = true;
                    if (nextGameType == "Objects") {


                        this.playtransitionVideo('objects',nextGameType);

                    }
                    else {
                        //this.game.state.start('NumericGame', true, false, [this.initParams, this.animIndex, this.engine.currentLevelID]);
                        this.playtransitionVideo('numeric',nextGameType);
                    }
                    return;
                }

                innerBoxGroup.removeAll();
                this.gameOverScreenGroup.removeAll();
                innerBoxGroup.destroy();
                this.gameOverScreenGroup.destroy();

                //adding transition video
                this.playtransitionVideo('tutorial',nextGameType);
                /* let splashTutorial = this.dataJSON.levelData.filter((item: any) => { return item.id === nextLevelJSONID })[0];//.tutorial

                if (splashTutorial.tutorial["T1"] !== false) {
                    this.tutorial1VideoSource = splashTutorial.tutorial["T1"];
                    this.loadtutorialVideo(this.tutorial1VideoSource);
                } else {
                    this.engine.setup(this.levelID);
                    this.createOnReshuffle();
                }*/
                
            } else {
                
                this.playEndAnimation();
                this.initParams.gameEndAnimBool = true;
                
                //this.gotoMenu();
               
            }
            this.tutorialEngine.stop();
            this.refreshTutorial();
        });
        this.nextBtn.events.onInputUp.add((e: any) => {
            this.buttonPress(e, "up")
        });
        

        let homeButton = this.game.add.sprite(this.nextBtn.x, this.nextBtn.y + (this.nextBtn.height + 30), 'UI', 'btn_home', innerBoxGroup);
        homeButton.anchor.setTo(0.5);
        homeButton.inputEnabled = true;
        homeButton.input.pixelPerfectClick = true;
        homeButton.input.pixelPerfectOver = true;
        homeButton.input.useHandCursor = true;
        homeButton.events.onInputDown.addOnce((e: any) => {
           // this.transitionVideoSprite.visible = false;
            //this.transitionVideo.destroy();
            this.buttonPress(e, "down")
            if (this.initParams.gameCompleted) {
                this.initParams.gameEndAnimBool = true;
            }
            this.gotoMenu();
        });
        homeButton.events.onInputUp.add((e: any) => {
            this.buttonPress(e, "up")
        });
        innerBoxGroup.y = this.game.world.height;
        this.gameOverScreenGroup.addChild(innerBoxGroup);

        // this.gameOverScreenGroup.y = this.gameOverScreenGroup.height;
        // this.gameOverScreenGroup.width = 0;
        let tween = this.game.add.tween(shadow);
        shadow.alpha = 0;
        let congratText:Phaser.BitmapText;
        tween.to({ alpha: 1 }, 500, Phaser.Easing.Bounce.Out, true, 0)
        tween.onComplete.addOnce(() => {
            this.win.play();
            
            let ypos = ((this.game.world.height - innerBoxGroup.height) / 2) / 4
            let tween2 = this.game.add.tween(innerBoxGroup);
            tween2.to({ y: ypos }, 1000, Phaser.Easing.Elastic.Out, true, 0)
            tween2.onComplete.addOnce(() => {
                let hit = this.game.add.sprite(gameOverBG.x, gameOverBG.y / 1.5, 'hit', innerBoxGroup);
                hit.anchor.set(0.5);
                hit.animations.add('hit');
                hit.animations.play('hit', 8, false, true);
                hit.animations.currentAnim.onComplete.addOnce(() => {
                    // this.nextBtn.inputEnabled = true;
                    // this.nextBtn.input.useHandCursor = true;
                })
                victory.alpha = 1;
                 if(congratText !== undefined){
                    congratText.visible = true;
                }
            })
        });

        //console.log("checking the assignment id and current level id", this.initParams.assignmentLevelId, this.levelID, this.initParams.assignmentMode);
       
        if(this.initParams.assignmentMode !== -1 && (this.initParams.assignmentLevelId === this.levelID)){
            this.nextBtn.x += 250;
            homeButton.x = this.nextBtn.x;
           // let welldone = this.game.add.image(gameOverBG.x - 400, gameOverBG.y+150, 'welldone', "", innerBoxGroup);
           // welldone.anchor.setTo(0.5);
           // welldone.scale.setTo(.5)
          //  let congrats = this.game.add.image(0, 130, 'congrats', "", innerBoxGroup);
          //  congrats.anchor.setTo(0.5);
          //  welldone.addChild(congrats);

           // let congratText = this.game.add.bitmapText(gameOverBG.x - 400, gameOverBG.y+150, 'font_bold', "Assignment Done!", 65, innerBoxGroup);
            congratText = this.game.add.bitmapText(gameOverBG.x - 150, gameOverBG.y+320, 'HMHMath_bold', this.wrapText(this.initParams.commontext.assignment_done, 11), 85);

           
            
            congratText.tint = 0x000;
            congratText.align = "center";
            
           // congratText.width = 400;
            congratText.anchor.setTo(0.5, 1);
            congratText.tint = 0xfb5606
            congratText.smoothed = true;
            
           // welldone.addChild(congratText);
            congratText.rotation = -.15;
            congratText.visible  = false
            let congTween = this.game.add.tween(congratText);
            console.log(this.initParams.urlParams);
            switch(this.initParams.urlParams.style){
                case "1":
                    congratText.scale.set(4,4);
                    this.game.add.tween(congratText.scale).to( { x: 1, y: 1 },1000, Phaser.Easing.Quartic.InOut,true,2,1, false);
                break;
                case "2":
                    congratText.scale.set(4,4);
                    this.game.add.tween(congratText.scale).to( { x: 1, y: 1 },1000, Phaser.Easing.Bounce.Out,true,2,1, false);
                break;
                case "3":
                    congratText.scale.set(.05,0.05);
                    this.game.add.tween(congratText.scale).to( { x: 1, y: 1 },1000, Phaser.Easing.Bounce.In,true,2,1, false);
                break;
            }
            
        }
        // hiding the gameover screen initially
        // this.gameOverScreenGroup.visible = false;

        if(this.levelIndex === (this.dataJSON.levelData.length - 1)){
            homeButton.visible = false;
           // this.transitionVideo.destroy();
           //this.game.world.sendToBack(this.transitionVideoSprite);
           
            this.addEndVideo();
            //this.splashBG.destroy();
            //this.transitionVideo.onComplete.removeAll();
            //this.game.world.sendToBack(this.transitionVideoSprite);
            //this.transitionVideoSprite.destroy();
            //this.transitionVideo.destroy();
        }

    }

    /**
     * 
     * @param text the text that need to be wrapped within 
     * @param maxChars  maximum character that can be accomodated in each line 
     */

    wrapText(text: any, maxChars: any) {
        let ret: Array<any> = [];
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

        return ret.join("\n");
    }

    /**
     * Playing the transition animation in between the levels
     * @param nextTutorial 
     * @param nextGameType 
     */
    playtransitionVideo(nextTutorial: any,nextGameType?:string) {
       // this.removeEndVideo();
        this.splashBG = this.game.add.sprite(0, 0, "splashscreen");
        this.splashBG.scale.setTo(0.5, 0.5);
        this.splashBG.width = this.game.world.width;
        this.splashBG.height = this.game.world.height;
       // this.transitionVideoSprite.visible = true;
       // this.game.world.bringToTop(this.transitionVideoSprite);
        this.homeButton.inputEnabled = false;
        this.soundBtn.inputEnabled = false;

        //this.game.state.start("transitionC", true, false, [this.initParams, this.animIndex, this.engine.currentLevelID,nextGameType]);
       // return;
        switch(this.engine.randomNumberGeneration(0, 3)){
            case 0:
                this.game.state.start("transitionA", true, false, [this.initParams, this.animIndex, this.engine.currentLevelID,nextGameType]);
            break;
            case 1:
                this.game.state.start("transitionB", true, false, [this.initParams, this.animIndex, this.engine.currentLevelID,nextGameType]);
            break;
            case 2:
                this.game.state.start("transitionC", true, false, [this.initParams, this.animIndex, this.engine.currentLevelID,nextGameType]);
            break;
            case 3:
                this.game.state.start("transitionD", true, false, [this.initParams, this.animIndex, this.engine.currentLevelID,nextGameType]);
            break;
            
        }
    }

    playNextVideo() {

        //alert('dddd');
        //console.log("this--->",this);
        var nextLevelJSONID = this.engine.moveLevel(Number(this.engine.currentLevel));
        let splashTutorial = this.dataJSON.levelData.filter((item: any) => { return item.id === nextLevelJSONID })[0];//.tutorial

        if (splashTutorial.tutorial["T1"] !== false) {
            this.tutorial1VideoSource = splashTutorial.tutorial["T1"];
            this.loadtutorialVideo(this.tutorial1VideoSource);
        } else {
            this.engine.setup(this.levelID);
            this.createOnReshuffle();
        }
    }

    /**
     * show popup with tick and cross button 
     * when clicks on home button 
     */
    showConfirmationBox() {

        //suspending all the tweens running in the background
        console.log("asdfsdfsd 111")
        this.game.tweens.pauseAll();
        console.log("asdfsdfsd 222")

        this.confirmPopupGroup = this.game.add.group();
        let shadow = this.game.add.graphics(0, 0, this.confirmPopupGroup);
        shadow.beginFill(0x000000, 0.5);
        shadow.drawRect(0, 0, this.game.world.getBounds().width, this.game.world.getBounds().height);
        shadow.endFill();
        shadow.width = this.game.world.width;
        shadow.height = this.game.world.height;
        shadow.inputEnabled = true;
        let confirmBoxBG = this.game.add.image(this.game.world.centerX, this.game.world.centerY, 'popup_confirm', "", this.gameOverScreenGroup);
        confirmBoxBG.scale.set(0.9);
        confirmBoxBG.anchor.set(0.5, 0.5);
        let confirmtext = this.game.add.bitmapText(0, 0, 'font_bold', this.wrapText(this.initParams.commontext.popup_quit,16), 110, this.confirmPopupGroup);
        confirmtext.tint = 0x000;
        confirmtext.align = "center"
        confirmtext.anchor.setTo(0.5, 1);
        confirmBoxBG.addChild(confirmtext);

        let btngroup = this.game.add.group();

        let cancelBtn = this.game.add.sprite(0, 0, 'UI', 'btn_cancel', btngroup);
        cancelBtn.anchor.setTo(0.5, -.45);
        //cancelBtn.scale.setTo(1.5);
        cancelBtn.inputEnabled = true;
        cancelBtn.input.pixelPerfectClick = true;
        cancelBtn.input.pixelPerfectOver = true;
        cancelBtn.input.useHandCursor = true;
        cancelBtn.events.onInputDown.addOnce((e: any) => {
            this.buttonPress(e, "down")
            btngroup.removeAll();
            btngroup.destroy();
            this.confirmPopupGroup.removeAll();
            this.confirmPopupGroup.destroy();
            this.game.tweens.resumeAll();
        });

        cancelBtn.events.onInputUp.add((e: any) => {
            this.buttonPress(e, "up")
        });

        let confirmBtn = this.game.add.sprite(cancelBtn.width + 100, 0, 'UI', 'btn_confirm', btngroup);
        confirmBtn.anchor.setTo(0.5, -.45);
        //confirmBtn.scale.setTo(1.5);
        confirmBtn.inputEnabled = true;
        confirmBtn.input.pixelPerfectClick = true;
        confirmBtn.input.pixelPerfectOver = true;
        confirmBtn.input.useHandCursor = true;
        confirmBtn.events.onInputDown.addOnce((e: any) => {
            this.buttonPress(e, "down")
            this.gotoMenu();
        });
        confirmBtn.events.onInputUp.add((e: any) => {
            this.buttonPress(e, "up")
        });
        confirmBoxBG.addChild(btngroup);
        this.confirmPopupGroup.addChild(confirmBoxBG);
        btngroup.x = - (btngroup.width / 4);

    }

    /**
     * this function will refresh Tutorial on next button click
     */
    refreshTutorial() {
        this.tutorialField = this.game.add.group();
        this.tutorialDecoration = this.game.add.group();
        this.tutorialSheen = this.game.add.group();
        this.tutorialEngine = new TutorialEngine.Engine(this.game);
        this.setUpTutorial();

    }

    /**
     * This function will display the game over screen
     */
    showGameOverScreen() {
       
        this.tutorialEngine.tutorials.length = 0;
        this.settingUpGameOverUI();
        this.game.world.bringToTop(this.gameOverScreenGroup.bringToTop);
        // this.gameOverScreenGroup.visible = true;
    }

    /**
     * this function will take back user from game to menu
     */
    gotoMenu() {
        this.initParams.animationCheck = true;
        this.game.state.start('DynamicMenu', true, false, [this.initParams, this.animIndex, this.engine.currentLevelID]);

    }

    /*********Common refree function */
    /**
    * this method will called when user clicks on referee 
    * and the answer is correct
    */

    refereePlayWin() {
        this.refereeAnim('refereeGGWin', 'referee_ggWin');
        if (this.engine.gameType == "Objects") {
            this.animateGuysFromGroup(this.userAnswerArray, "win");
        } else {
            if (this.carryforwardGroup !== undefined)
                this.carryforwardGroup.visible = false;

            this.animateGuysFromGroup(this.storeAnswer, "win");
            this.setframeLabel(this.groupX, "_sad");
            this.setframeLabel(this.groupY, "_sad");
            this.setframeLabel(this.groupZ, "_sad");
            this.setframeLabel(this.groupW, "_sad");
            this.setframeLabel(this.groupV, "_sad");

            console.log('**********************************************', this.regroupingGuys);

            if (this.regroupingGuys.length > 0) {
                for (var l = 0; l < this.regroupingGuys.length; l++) {
                    var sprite: any = this.regroupingGuys[l];
                    sprite.data.glow.visible = false;
                    sprite.inputEnabled = false;
                    sprite.input.useHandCursor = false;
                    sprite.events.onInputDown.removeAll(this);
                }
            }

        }

        this.attemptCount += 1;
        this.correctAttemptCount = this.correctAttemptCount < Number(this.engine.setAttempts()) ? this.correctAttemptCount += 1 : this.correctAttemptCount = this.correctAttemptCount;

        var starToFill: any = this.starGroup.getChildAt(this.correctAttemptCount - 1);
        starToFill.frameName = "checkMark";
        starToFill.height += 30;
        starToFill.width += 30;
        let tween = this.game.add.tween(starToFill);
        tween.to({ height: starToFill.height - 30, width: starToFill.width - 30 }, 500, Phaser.Easing.Bounce.Out, true, 0);

        if (this.correctAttemptCount < this.engine.setAttempts()) {
            this.star.play();
        } else {
            this.star_final.play();
        }
        this.badGuyFields.forEach((fields: any) => {
            fields.children.forEach((item: any) => {
                item.frameName = "BGSad";
            });
        })
    }

    /**
     * call back method that send the success or failure status
     * for the data saved, required action can be taken in the 
     * method based on its response
     */
    userDataServiceCallBack(userData: any, success?: boolean) {
        if (success) {
            console.log("data saved enabling next button");
            if (this.nextBtn !== undefined) {
                this.nextBtn.inputEnabled = true;
                this.nextBtn.input.useHandCursor = true;
                this.nextBtn.input.pixelPerfectClick = true;
                this.nextBtn.input.pixelPerfectOver = true;
            }
        } else {
            console.log("data not saved enabling next button", this)
            if (this.nextBtn !== undefined) {
                this.nextBtn.inputEnabled = true;
                this.nextBtn.input.useHandCursor = true;
                this.nextBtn.input.pixelPerfectClick = true;
                this.nextBtn.input.pixelPerfectOver = true;
            }
        }

        this.homeButton.inputEnabled = true;

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
            //setTimeout(this.initRefreeField(), 1500);
        });
        this.referee.animations.play(Animation_Name, 15, false, false);

        //adding referee Animation to group for resizing
        this.refereeField.add(this.referee);
    }

    /**
     * this method will called when user clicks on referee 
     * and the answer is wrong
     */
    refreePlayLose() {

        this.refereeAnim('refereeBGWin', 'referee_bgWin');
        if (this.engine.gameType == "Objects") {
            this.badGuyFields.forEach((fields: any, idx: number) => {
                this.animateGuysFromGroup(fields.children, "lose");
            })
            this.userAnswerArray.forEach((item: any) => {
                item.getChildAt(1).frameName = "GGSad";
            });
        } else {

            for (let i = 0; i < this.groupX.children.length; i++) {
                this.animateGuysFromGroup(this.groupX.children, "lose");
            }
            for (let i = 0; i < this.groupU.children.length; i++) {
                let child: any = this.groupU.getChildAt(i)
                child.frameName = "GGSad";
            }
            this.setframeLabel(this.groupX, "_happy");
            this.setframeLabel(this.groupY, "_happy");
            this.setframeLabel(this.groupV, "_happy");
            this.setframeLabel(this.groupW, "_happy");
            this.setframeLabel(this.groupZ, "_happy");
            if (this.regroupingGuys.length > 0) {
                for (var l = 0; l < this.regroupingGuys.length; l++) {
                    var sprite: any = this.regroupingGuys[l];
                    sprite.data.glow.visible = false;
                    sprite.inputEnabled = false;
                    sprite.input.useHandCursor = false;
                    sprite.events.onInputDown.removeAll(this);
                }
            }
        }
        this.attemptCount += 1;
    }

    /**
     * this function will set the framelabel for numeric Game
    */
    setframeLabel(guysGroup: Phaser.Group, suffix?: string) {
        let _lsuffix = (suffix === undefined ? "" : suffix)
        try {
            var frameLable = ["BG1", "BG10", "BG100", "BG1000", "BG10000", "BG100000"];
            var labelCount = 0;
            for (var i = guysGroup.children.length - 1; i >= 0; i--) {
                var child: any = guysGroup.getChildAt(i);
                child.frameName = frameLable[labelCount] + _lsuffix;
                child["data"].frameName = frameLable[labelCount];
                labelCount++;
            }
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * function to save level information 
     * update the information for the current level 
     */
    saveLevelInfo() {
        console.log("Saving Level Information ")
        let levelInfos = this.userDataServiceCAS.gameUserData.GameInfo.levelInfos;
        levelInfos[this.levelIndex] = {
            levelId: this.levelID,
            completed: true,
            awardInfo: {
                score: 0,
                stars: 0
            }
        }

        this.userDataServiceCAS.saveGameUserData(levelInfos, this)
    }

    /**
     * This function is used to play the end animation when player win the final level of the game
     * 
     * @memberof FunctionMatchGameStateBase
     */
    playEndAnimation() {
        this.endVideoField.visible = true; 
        this.game.world.bringToTop(this.endVideoField);
        this.endVideo.play();
        this.endVideo.currentTime = 0;

          //To unlock the intro video on anroid devices(chrome version Above 56)
        if (this.game.device.android) {
            let touch :any = this.game.input.touch;
            touch.addTouchLockCallback(() => {
            this.endVideo.play();
            return true;
            }, this.endVideo, true);
        }

        if(!this.game.device.desktop) {
            //This function will get triggered when the user clicks the 'Done' button in iPhone
            this.endVideo.video.addEventListener('webkitendfullscreen', (() => {
                this.game.cache.removeVideo("end_animation");
                this.endVideoField.destroy();
                this.endVideoSprite.destroy();
                this.endVideo.destroy();
                this.gotoMenu();
            }), true);
        }        
    }

    /**
     * This function is used to destroy the end video and it's sprite whenever don't need to play
     * 
     * @memberof FunctionMatchGameStateBase
     */
    removeEndVideo() {
        if(typeof this.endVideo !== 'undefined' && typeof this.endVideo !== null && !this.game.device.android) {
                this.endVideoField.destroy();
                this.endVideoSprite.destroy();
                this.endVideo.destroy();
        }
    }
    /**
     * updating the assigment level id to show the Assignment Done! message
     */
    updateAssignModeAndLevelID(){
        if(this.initParams.assignmentMode !== -1 && this.initParams.assignmentLevelId === -1){
            this.initParams.assignmentLevelId = this.levelID;
        }
    }

}
