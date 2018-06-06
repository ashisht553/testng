import { SliderGameEngine } from '../engine/Slider.engine';
import { GameUserData } from '../../../shared/engine/game.user.data.service';
declare var algebra: any;
declare var latextopngconverter: any;
/**
 * @class SliderGameStateBase
 */
export abstract class SliderGameStateBase extends Phaser.State {

    /**
     * Variables for Game UI
     */
    homeButton: Phaser.Sprite;
    soundButton: Phaser.Sprite;
    rewardGroup: Phaser.Group;
    levelStars: Array<Phaser.Group>;
    pointsGroup: Phaser.Group;
    pointsText: Phaser.BitmapText;
    alertBox: Phaser.Group = null;
    ggRing: Phaser.Sprite;
    bgRing: Phaser.Sprite;
    frameContainer: Phaser.Group;
    tilesContainer: Phaser.Group;
    maskGraphic: Phaser.Graphics;
    frameBg: Phaser.Sprite;
    resultArea: Phaser.Sprite;
    sliderContainer: Phaser.Group;
    ratioContainer: Phaser.Group;
    ratioLeftSprite: Phaser.Sprite;
    ratioRightSprite: Phaser.Sprite;
    ratioHeight: Phaser.Sprite;
    starTween: Phaser.Tween = null;
    trampoline: Phaser.Sprite;
    ggGuysGroup: Phaser.Group;
    bgGuysGroup: Phaser.Group;
    bgPointShadow: Phaser.Sprite;
    ggPointShadow: Phaser.Sprite;
    animIndex: number;
    newTextGroup: Phaser.Group;
    bestScorePoints: Phaser.BitmapText;
    rectangleBG: Phaser.Sprite;
    redSlide :Phaser.Sprite;
    greenSlide :Phaser.Sprite;

    //Variables used for tile selection and delete purpose
    selectedTilePair: Array<Phaser.Sprite> = [];
    tilesToDestroy: Array<Phaser.Sprite> = [];
    tilesToDestroySam: Array<Phaser.Sprite> = [];
    tilesDestroyed: Array<Phaser.Sprite> = [];
    comboTilesAnim: Array<any> = [];
    tileMargin = 25;
    sliderValue: any = { left: null, right: null };
    pointsCount = 0;
    ggPoint: number = 0;
    bgPoint: number = 0;
    lastGGIndex: number = 0;
    tilesClicked: number = 0;
    guyCount: number = 0;
    clickedPercent : number;

    /**
     * Variable to store wrong orientation information screen
     */
    orientationInstruction: Phaser.Group = null;

    /**
     * Varibale to store game over screen.
     */
    gameOverGroup: Phaser.Group = null;

    /**
     * variables for game data.
     */
    levelID: string = null;
    levelIndex: number = 0;
    gamePoints: number = 0;
    gameScore: number = 0;
    levelFinish: boolean = false;
    gamePause: boolean = false;
    currentStar: number = 1;
    currentLevelStar: number = 0;
    tweenInterval: any;

    /**
     * Variable used to store slider text style
     */
    sliderTextStyle = {
        color: 'FFFFFF', size: '50', scale:2
    };

    //sliderValuesType: number = 0;
    /**
     * Variable for data engine 
     */
    engine: SliderGameEngine.EngineBase;

    /**
     * Flag variable for game finish
     */
    gameFinish: boolean = false;

    /**
     * Variables to store device resolution data
     */
    prevWindowWidth: number;
    prevWindowHeight: number;
    gameWidth: number;
    gameHeight: number;
    WHRATIO: number;
    BASE_GAME_WIDTH: number = 2048;
    BASE_GAME_HEIGHT: number = 1408;
    scaleRate: number;

    /* Game */
    gameWrapper: Phaser.Group;

    /**
     * Variables used for Data persistence
     */
    userDataServiceCAS: GameUserData.gameUserDataService;

    /**
    * Variables used to store URL parameters
    */
    urlMode: any = null;

    /**
     * Variables used to store loading screen data
     */
    loadingScreen: Phaser.Sprite;
    loadingText: Phaser.BitmapText;
    loadError: Phaser.Sprite;
    loadErrorGroup: Phaser.Group;
    loadErrorFlag: boolean = false;
    counDownFinish: boolean = false;
    initParams: any;
    gameData: any;
    tutorialVideoSource: string;
    loadingVideo: boolean;
    videoField: Phaser.Graphics;
    protected shadowLine: number = 1;
    tutorialVideo: Phaser.Video;
    protected videoTutorialSprite: any;
    lastVideoPath: string = null;

    /**
    * Variable used to play the audios
    */
    secondClickSound: Phaser.Sound;
    firstClickSound: Phaser.Sound;
    punch: Array<Phaser.Sound> = [];
    countDownAudio: Phaser.Sound;
    starSplash: Array<Phaser.Sound> = [];
    tilesFall: Phaser.Sound;
    gameLoss: Phaser.Sound;
    gameWin: Phaser.Sound;
    introMusic: Phaser.Sound;
    validPairSound: Phaser.Sound;
    wrongPairSound: Phaser.Sound;
    woodBlock: Phaser.Sound;
    guyBounce: Phaser.Sound;
    sliderSnabSound: Phaser.Sound;
    comboTileSound: Phaser.Sound;
    goodGuyUnloadAudio: Phaser.Sound;

    /**
    * Variable used to store image key for different type of grid tiles and hatches
    */
    ggImage: string = 'gg';
    bgImage: string = 'bg';
    tileImage: string = 'tiles';
    hatchImage: string = 'hatches';
    hatchFrame: string = 'hatch4x4';

    /**
    * Variable used to control game over pop up
    */
    gameOverDisplay: boolean = false;

    /**
    * Variable related to slider
    */
    redSlideSnabSoundPlayed: boolean = false;
    greenSlideSnabSoundPlayed: boolean = false;
    sliderKnob:any;
    sliderHeight: number = 80;
    ratioBG: Phaser.Sprite;

    /**
    * Variable used for wrong order pair alert
    */
    wrongOrderPairAlert: Phaser.Sprite;
    wrongOrderPairAlertSize: any = null;

    /**
    * Variable used to display points earned by the user
    */
    pointsEarnedGroup: Phaser.Group;
    pointsEarnedBackground: Phaser.Sprite;
    pointsEarnedText: Phaser.BitmapText;

    /**
    * Variable used to landing and removing guys
    */
    removeGGguys: boolean = false;
    goodGuysToLand: Array<Phaser.Sprite> = [];
    ggLandingTween: Phaser.Tween = null;
    ggLandingAnim: Phaser.Sprite;
    landedGGguys: number = 0;
    totalStackedGoodGuys: number = 0;
    hatches: Phaser.Group;
    previousColumn: Array<number>;

    /**
     * variable used to count the bonus tiles that affected while clicking another tiles
     */
    affectedBonusTiles: number = 0;

    /**
     * Variables used to check cache availability
     */

    fontsToLoad: Array<string> = [];
    imagesToLoad: Array<string> = [];
    audiosToLoad: Array<string> = [];
    jsonToLoad: Array<string> = [];
    assetsLoaded: boolean = false;
    loadAssetCalled: number = 0;
    gridValidTilesTextLoadCount : number = -1;
    sliderValueParamsImageLoadCount : number = -1;
    videosToLoad: Array<string> = [];


    /**
     * 
     * Variables used to play end animation
     * @memberof DynamicMenu
     */
     endVideo : Phaser.Video;
     endVideoField : Phaser.Graphics;
     endVideoSprite : any;

    /**
     * This method gets triggered after preload but before create method. Game scaling, orientation listeners, resize listeners get assigned
     */
    init(params: any) {
        this.WHRATIO = this.BASE_GAME_WIDTH / this.BASE_GAME_HEIGHT;

        // To disable pause on losing focus
        this.game.scale.forceOrientation(true, false);
        this.game.scale.enterIncorrectOrientation.add(this.handleIncorrect, this);
        this.game.scale.leaveIncorrectOrientation.add(this.handleCorrect, this);
        this.game.input.maxPointers = 1;
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.setResizeCallback(this.resizeGame, this);

        //For send to dynamic menu
        if (params) {
            this.initParams = params[1];
            this.initParams.playIntroVideo = false;
            this.userDataServiceCAS = this.initParams.userDataServiceCAS;
            this.urlMode = this.initParams.urlParams;
            this.gameData = this.initParams.parent;
            this.animIndex = params[2];
        }
    }

    /**
     * This method get triggered automatically and used to load tutorial video (if exist) and other assets
     * 
     * @memberOf SliderGameStateBase
     */
    preload() {
        this.tutorialVideoSource = "";
        let tutorialVideo = this.engine.getTutorialVideo();
        if (tutorialVideo !== null && this.lastVideoPath !== tutorialVideo) {
            this.loadingVideo = true;
            this.lastVideoPath = this.tutorialVideoSource = tutorialVideo;
            this.loadtutorialVideo(this.tutorialVideoSource);
        } else {
            this.loadingVideo = false;
            this.loadStart('');
            this.loadValidGridtextImages();
        }
    }

    /**
     * Loading the game assets
     */
    loadAssets() {
        if (!this.assetsLoaded) {
            /* load fonts */
            this.game.load.bitmapFont('AP_Black', 'assets/fonts/FrutigerLTStdBlack.png', 'assets/fonts/FrutigerLTStdBlack.fnt');
            this.game.load.bitmapFont("HMHMath", "assets/fonts/AvenirPrimaryHMHMath-Bold.png", "assets/fonts/AvenirPrimaryHMHMath-Bold.fnt");

            /* load slider background field */
            this.game.load.image('BackgroundField', 'assets/images/slider_background.png');

            /* To load game ui assets*/
            this.game.load.image('slider_knob', 'assets/images/slider.png');
            this.game.load.atlas('tiles', 'assets/images/tiles.png', 'assets/data/tiles.json');
            this.game.load.image('ring', 'assets/images/ring.png');
            this.game.load.image('frame', 'assets/images/frame.png');
            this.game.load.image('trampoline', 'assets/images/trampoline.png');
            this.game.load.image('shadow', 'assets/images/shadow.png');
            this.game.load.image('point_board', 'assets/images/score_background.png');
            this.game.load.image('Star_Mask', 'assets/images/star_mask.png');
            this.game.load.image('cup', 'assets/images/cup.png');
            this.game.load.atlas('tilesBig', 'assets/images/tiles3x3.png', 'assets/data/tiles3x3.json');
            this.game.load.atlas('hatchesBig', 'assets/images/hatch3x3.png', 'assets/data/hatch3x3.json');
            this.game.load.atlas('hatches', 'assets/images/hatch4x4.png', 'assets/data/hatch4x4.json');

            //To load images and json files related to good guy
            this.game.load.image('gg', 'assets/images/gg.png');
            this.game.load.image('gg_happy', 'assets/images/gg_happy.png');
            this.game.load.image('gg_sad', 'assets/images/gg_sad.png');
            this.game.load.image('gg_big', 'assets/images/gg_big.png');
            this.game.load.image('gg_big_happy', 'assets/images/gg_big_happy.png');
            this.game.load.image('gg_big_sad', 'assets/images/gg_big_sad.png');
            this.game.load.atlas('ggLanding', 'assets/images/gg_landing.png', 'assets/data/gg_landing.json');

            //To load images and json files related to bad guy
            this.game.load.image('bg', 'assets/images/bg.png');
            this.game.load.image('bg_happy', 'assets/images/bg_happy.png');
            this.game.load.image('bg_sad', 'assets/images/bg_sad.png');
            this.game.load.image('bg_big', 'assets/images/bg_big.png');
            this.game.load.image('bg_big_happy', 'assets/images/bg_big_happy.png');
            this.game.load.image('bg_big_sad', 'assets/images/bg_big_sad.png');
            this.game.load.atlas('bgLanding', 'assets/images/bg_landing.png', 'assets/data/bg_landing.json');

            //To load images and json files related to feedback animations
            this.game.load.image('wrongOrderPair', 'assets/images/wrong_order_icon.png');
            this.game.load.image('points_background', 'assets/images/points_background.png');
            this.game.load.atlasJSONHash('fx', 'assets/images/fx.png', 'assets/data/fx.json');

            // Assests using for common imgages like home & rewards etc
            this.game.load.atlas('UI', 'assets/images/gym_UI.png', 'assets/data/gym_UI.json');

            // To load game over pop up image
            this.game.load.image('GameOver_Popup', 'assets/images/popup.png');

            //Video file loading
            this.game.load.video('end_animation', 'assets/videos/ending_animation.mp4');

            // To load audio files
            this.game.load.audio('second_click', 'assets/audios/new_pop_Gb2.mp3');
            this.game.load.audio('tilesFall', 'assets/audios/punch_G.mp3');
            this.game.load.audio('star_game', 'assets/audios/star_Cmaj.mp3');
            this.game.load.audio('star_splash', 'assets/audios/Star_Fmaj9.mp3');
            this.game.load.audio('valid_pair', 'assets/audios/vibraphone_delay_chord.mp3');
            this.game.load.audio('game_loss', 'assets/audios/brass_lose_march24.mp3');
            this.game.load.audio('game_win', 'assets/audios/brass_win_march31.mp3');
            this.game.load.audio('intro_music', 'assets/audios/Afro_brazilian_intro.mp3');
            this.game.load.audio('wood_block', 'assets/audios/wood_block.mp3');
            this.game.load.audio('guy_bounce', 'assets/audios/slide_whistle_up.mp3');
            this.game.load.audio('wrong_pair', 'assets/audios/shot_clock_buzzer.mp3');
            this.game.load.audio('first_click', 'assets/audios/new_pop_E2.mp3');
            this.game.load.audio('sliderSnabSound', 'assets/audios/yellow_Bball_arrival.mp3');
            this.game.load.audio('comboTileSound', 'assets/audios/ray_2_combo.mp3');
            this.game.load.audio('gg_unload', 'assets/audios/fast_whoosh_G2_eq.mp3');

            if (this.audiosToLoad.length == 0) {
                this.audiosToLoad.push('second_click');
                this.audiosToLoad.push('tilesFall');
                this.audiosToLoad.push('star_game');
                this.audiosToLoad.push('star_splash');
                this.audiosToLoad.push('valid_pair');
                this.audiosToLoad.push('game_loss');
                this.audiosToLoad.push('game_win');
                this.audiosToLoad.push('intro_music');
                this.audiosToLoad.push('wood_block');
                this.audiosToLoad.push('guy_bounce');
                this.audiosToLoad.push('wrong_pair');
                this.audiosToLoad.push('first_click');
                this.audiosToLoad.push('sliderSnabSound');
                this.audiosToLoad.push('comboTileSound');
                this.audiosToLoad.push('gg_unload');
            }

            if (this.imagesToLoad.length == 0) {
                this.imagesToLoad.push('BackgroundField');
                this.imagesToLoad.push('slider_knob');
                this.imagesToLoad.push('ring');
                this.imagesToLoad.push('frame');
                this.imagesToLoad.push('trampoline');
                this.imagesToLoad.push('shadow');
                this.imagesToLoad.push('point_board');
                this.imagesToLoad.push('Star_Mask');
                this.imagesToLoad.push('cup');
                this.imagesToLoad.push('gg');
                this.imagesToLoad.push('gg_happy');
                this.imagesToLoad.push('gg_sad');
                this.imagesToLoad.push('gg_big');
                this.imagesToLoad.push('gg_big_happy');
                this.imagesToLoad.push('gg_big_sad');
                this.imagesToLoad.push('bg');
                this.imagesToLoad.push('bg_happy');
                this.imagesToLoad.push('bg_sad');
                this.imagesToLoad.push('bg_big');
                this.imagesToLoad.push('bg_big_happy');
                this.imagesToLoad.push('bg_big_sad');
                this.imagesToLoad.push('wrongOrderPair');
                this.imagesToLoad.push('points_background');
                this.imagesToLoad.push('GameOver_Popup');
            }

            if (this.fontsToLoad.length == 0) {
                this.fontsToLoad.push('AP_Black');
                this.fontsToLoad.push('HMHMath');
            }

            if (this.jsonToLoad.length == 0) {
                this.jsonToLoad.push('tiles');
                this.jsonToLoad.push('tilesBig');
                this.jsonToLoad.push('hatchesBig');
                this.jsonToLoad.push('hatches');
                this.jsonToLoad.push('ggLanding');
                this.jsonToLoad.push('bgLanding');
                this.jsonToLoad.push('fx');
                this.jsonToLoad.push('UI');
            }

            if(this.videosToLoad.length == 0) {
                this.videosToLoad.push('end_animation');
            }

            this.game.load.onLoadStart.add(this.loadStart, this);
            this.game.load.onFileComplete.add(this.fileComplete, this);
            this.game.load.onLoadComplete.add(this.createGameUI, this);
            this.game.load.onFileError.add(this.fileError, this);
            this.game.load.start();
        } else {
            this.createGameUI();
        }
    }

    /**
     * This method will get triggered when the game starts to load assets
     * 
     * 
     * @memberOf SliderGameStateBase
     */
    loadStart(text:string ="Tutorial Screen...") {
        this.loadingScreen = this.game.add.sprite(0, 0, "splashscreen");
        this.loadingText = this.game.add.bitmapText(1000, 740, "AP_Black", this.initParams.commontext.loading_assets, 40);
        this.loadingText.setText(this.initParams.commontext.loading_tutorial);
        this.loadingText.anchor.setTo(0.5);
        this.loadingText.tint = 0xffffff;
        this.game.world.bringToTop(this.loadingText)
    }
    /**
     * This method will get triggered if there is any error occur while loading assets
     * 
     * @memberOf SliderGameStateBase
     */
    fileError() {
        this.loadErrorFlag = true;
        this.loadingScreen.destroy();
        this.game.stage.backgroundColor = "0x696969";
        this.loadErrorGroup = this.game.add.group();
        let popupImageHeight = this.game.cache.getImage("Confirm_Popup").height;
        let popupImageWidth = this.game.cache.getImage("Confirm_Popup").width;
        this.loadErrorGroup.x = this.BASE_GAME_WIDTH / 2 - (popupImageWidth / 2 * 0.8);
        this.loadErrorGroup.y = this.BASE_GAME_HEIGHT / 2 - (popupImageHeight / 2 * 0.8);
        this.loadError = this.game.add.sprite(0, 0, "Confirm_Popup");
        this.loadError.scale.set(0.8, 0.8);

        let confirmBtn = this.game.add.sprite(0, 0, 'UI', 'btn_confirm0000');
        confirmBtn.scale.set(0.8);
        confirmBtn.x = this.loadError.world.x + this.loadError.width - (this.loadError.width / 2 + confirmBtn.width / 2);
        confirmBtn.y = this.loadError.world.y + this.loadError.height - confirmBtn.height - 10;
        confirmBtn.inputEnabled = true;
        confirmBtn.input.useHandCursor = true;
        confirmBtn.input.priorityID = 2;
        confirmBtn.events.onInputDown.add(() => {
            this.lastVideoPath = null;
            this.loadErrorFlag = false;
            this.initGame();
            this.removeGameUIListeners();
            this.game.state.restart();
        });

        let alertMessage = this.game.add.bitmapText(0, 0, 'AP_Black', this.initParams.commontext.fm_errormsg, 64);
        alertMessage.align = 'center';
        alertMessage.tint = 0x000000;
        alertMessage.x = this.loadError.world.x + this.loadError.width / 2 - alertMessage.width / 2;
        alertMessage.y = this.loadError.world.y + 80;

        this.loadErrorGroup.add(this.loadError);
        this.loadErrorGroup.add(confirmBtn);
        this.loadErrorGroup.add(alertMessage);
    }

    /**
     * This function is used to display the loading percentage while the assets loading
     * 
     * @param progress It contains loaded percentage
     * @param cacheKey It contains the name of loading file
     * @param success It contains file loaded status
     * @param totalLoaded It contains count of loaded files
     * @param totalFiles It contains count of total files
     * 
     * @memberOf SliderGameStateBase
     */
    fileComplete(progress: number, cacheKey: string, success: boolean, totalLoaded: number, totalFiles: number) {
        this.loadingText.setText(`${progress}%`);
    }

    /**
     * This method will get triggered at the completion of tutorial video loading process
     * 
     * @memberOf SliderGameStateBase
     */
    loadComplete() {
        if (this.loadingVideo && !this.loadErrorFlag) {
            this.videoField = this.game.add.graphics(0, 0);
            this.videoField.lineStyle(this.shadowLine, 0x000000, 0);
            this.videoField.beginFill(0x6FC5CA);
            this.videoField.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);

            this.loadingVideo = false;
            this.tutorialVideo = this.game.add.video('tutorialVideo');

            this.videoTutorialSprite = this.tutorialVideo.addToWorld(150, 100);
            this.videoTutorialSprite.width = this.videoField.getBounds().width / 1.2
            this.videoTutorialSprite.height = this.videoField.getBounds().height / 1.2
            let playBtn = this.game.add.sprite(0, 0, 'UI', 'btn_play');
            playBtn.x = this.tutorialVideo.width / 2 - playBtn.width / 2;
            playBtn.y = this.tutorialVideo.height / 2 - playBtn.height / 2 - 50;
            this.videoTutorialSprite.addChild(playBtn);
            this.videoField.addChild(this.videoTutorialSprite);
            this.game.world.bringToTop(this.videoField);
            playBtn.inputEnabled = true;
            playBtn.input.useHandCursor = true;
            playBtn.events.onInputDown.add(() => {
                playBtn.visible = false;
                this.tutorialVideo.play(false);
                this.videoTutorialSprite.events.onInputDown.add((e: any) => {
                    this.videoField.destroy();
                    this.videoTutorialSprite.destroy();
                    this.tutorialVideo.destroy();
                     this.loadStart('');
                     this.loadValidGridtextImages();
                });
            });

            if (this.game.device.desktop) {
                playBtn.visible = false;
                this.tutorialVideo.play(false);
                this.videoTutorialSprite.inputEnabled = true;
                this.videoTutorialSprite.events.onInputDown.add((e: any) => {
                    this.videoField.destroy();
                    this.videoTutorialSprite.destroy();
                    this.tutorialVideo.destroy();
                     this.loadStart('');
                     this.loadValidGridtextImages();
                });
            }

            this.tutorialVideo.play(false);
          
            // to disable video click skip make the follwing property false
            this.videoTutorialSprite.inputEnabled = false;

            //To unlock the tutorial video on anroid devices(chrome version Above 56)
            if (this.game.device.android) {
                let touch :any = this.game.input.touch;
                touch.addTouchLockCallback(() => {
                    playBtn.visible = false;
                    this.tutorialVideo.play();
                    return true;
                }, this.tutorialVideo, true);
            }

            //This function will get triggered when the user clicks the 'Done' button in iPhone
            this.tutorialVideo.video.addEventListener('webkitendfullscreen', (() => {
                this.game.cache.removeVideo("tutorialVideo");
                this.videoField.destroy();
                this.videoTutorialSprite.destroy();
                this.tutorialVideo.destroy();
                this.loadingScreen.destroy();
                 this.loadStart('');
                 this.loadValidGridtextImages();
            }), true);

            this.game.cache.removeVideo("tutorialVideo");
            this.resizeGame();
        } else {
            this.loadingVideo = false;
            this.loadStart('');
            this.loadValidGridtextImages();
        }
        this.game.load.onLoadStart.remove(this.loadStart, this);
        this.game.load.onFileComplete.remove(this.fileComplete, this);
        this.game.load.onLoadComplete.remove(this.loadComplete, this);
        this.game.load.onFileError.remove(this.fileError, this);
    }

    /**
     * called after preload completed. creating game wrapper and UI
     */
    create() {
        if (this.game.paused && !this.game.device.desktop) {
            this.handleIncorrect();
        }
    }

    /**
     * This method is used to create the game UI
     * 
     * @memberOf SliderGameStateBase
     */
    createGameUI() {
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
            this.loadAssetCalled++;
            if (this.loadAssetCalled < 10) {
                this.loadAssets();
            }
        } else {
            if (!this.loadErrorFlag) {
                this.loadAssetCalled = 0;
                this.initGame();
                this.game.physics.startSystem(Phaser.Physics.ARCADE);
                // To add audio
                this.secondClickSound = this.game.add.audio('second_click');
                this.firstClickSound = this.game.add.audio('first_click');
                this.tilesFall = this.game.add.audio('tilesFall');
                this.starSplash[0] = this.game.add.audio('star_game');
                this.starSplash[1] = this.game.add.audio('star_game');
                this.starSplash[2] = this.game.add.audio('star_splash');
                this.gameLoss = this.game.add.audio('game_loss');
                this.gameWin = this.game.add.audio('game_win');
                this.introMusic = this.game.add.audio('intro_music');
                this.validPairSound = this.game.add.audio('valid_pair');
                this.wrongPairSound = this.game.add.audio('wrong_pair');
                this.woodBlock = this.game.add.audio('wood_block');
                this.guyBounce = this.game.add.audio('guy_bounce');
                this.sliderSnabSound = this.game.add.audio('sliderSnabSound');
                this.comboTileSound = this.game.add.audio('comboTileSound');
                this.goodGuyUnloadAudio = this.game.add.audio('gg_unload');

                // To add nine patch image to the game cache for function card normal and hover
                let ninepath: any = this.game.cache;
                ninepath.addNinePatch('slider_knob_nine', 'slider_knob', null, 25, 25, 25, 25);

                // To add game wrapper to so, we can scale wrapper to scale all elements
                this.gameWrapper = this.game.add.group();

                // To add background field
                this.gameWrapper.create(0, 0, 'BackgroundField');

                //to change good guy and bad guy Images based on the grid size
                if (this.engine.currentLevel.gridSize == 3) {
                    this.ggImage = 'gg_big';
                    this.bgImage = 'bg_big';
                    this.tileImage = 'tilesBig';
                    this.hatchImage = 'hatchesBig';
                    this.hatchFrame = 'hatch3x3';
                    this.tileMargin = 50;
                }

                // add ring
                let ggThreshold = this.engine.currentLevel.scoring.starThreshold - 1,
                    bgThreshold = this.engine.currentLevel.scoring.loseThreshold - 1,
                    guyScale = 1.2, fromBottom = 150;  //fromBottom = -20;
                this.ggRing = this.gameWrapper.create(190, 0, 'ring');
                this.bgRing = this.gameWrapper.create(this.BASE_GAME_WIDTH - this.ggRing.width - 190, 0, 'ring');
                this.ggRing.position.y = (this.BASE_GAME_HEIGHT - fromBottom - this.game.cache.getImage('gg').height - (this.game.cache.getImage('gg').height) * ggThreshold) - this.ggRing.height + 60;
                this.bgRing.position.y = (this.BASE_GAME_HEIGHT - fromBottom - this.game.cache.getImage('bg').height - (this.game.cache.getImage('bg').height) * bgThreshold) - this.ggRing.height + 60;

                // add frame container
                this.frameContainer = this.game.add.group();
                this.frameBg = this.game.add.sprite(0, 0, 'frame');
                this.frameContainer.add(this.frameBg);
                this.frameContainer.x = this.BASE_GAME_WIDTH / 2 - this.frameBg.width / 2;
                this.frameContainer.y = -20;

                //add wrong order pair alert
                this.wrongOrderPairAlert = this.game.add.sprite(0, 0, 'wrongOrderPair');
                this.wrongOrderPairAlert.visible = false;
                this.wrongOrderPairAlert.anchor.setTo(0.5);
                this.wrongOrderPairAlertSize = {
                    width: this.wrongOrderPairAlert.width,
                    height: this.wrongOrderPairAlert.height
                }
                this.wrongOrderPairAlert.width = 50;
                this.wrongOrderPairAlert.height = 50;
                this.wrongOrderPairAlert.x = this.frameContainer.x + this.frameContainer.width / 2;
                this.wrongOrderPairAlert.y = this.frameContainer.y + (this.frameContainer.height / 2) + 40;

                //add hatches 
                this.hatches = this.game.add.group();
                let hatcheWidth = this.game.cache.getFrameData(this.hatchImage).getFrameByName(`${this.hatchFrame}0000`).width;
                for (let k = 0; k < this.engine.currentLevel.gridSize; k++) {
                    this.hatches.add(this.game.add.sprite(k * hatcheWidth, 0, this.hatchImage, `${this.hatchFrame}0000`));
                }
                this.hatches.x = this.frameContainer.x + 42.6;
                this.hatches.y = this.frameBg.height - 47;
                if (this.engine.currentLevel.gridSize == 3) {
                    this.hatches.x = this.frameContainer.x + 48;
                    this.hatches.y = this.frameBg.height - 55;
                }

                this.tilesContainer = this.game.add.group();
                this.addTiles();
                this.frameContainer.add(this.tilesContainer);

                // add result area
                let resultGraphic = this.game.add.graphics(0, 0);
                resultGraphic.beginFill(0x443932);
                resultGraphic.drawRoundedRect(0, 0, this.frameBg.width - 25, 100, 50);
                resultGraphic.endFill();
                this.resultArea = this.game.add.sprite(
                    this.frameBg.width / 2 - resultGraphic.width / 2,
                    this.frameBg.height,
                    resultGraphic.generateTexture());
                resultGraphic.destroy();
                this.frameContainer.add(this.resultArea);

                this.ratioWrapper();
                this.createSlider();
                this.trampoline = this.game.add.sprite(0, this.BASE_GAME_HEIGHT, 'trampoline');
                this.trampoline.position.x = this.BASE_GAME_WIDTH / 2 - this.trampoline.width / 2;
                this.gameWrapper.add(this.frameContainer);
                this.gameWrapper.add(this.trampoline);

                this.ggGuysGroup = this.game.add.group();
                this.bgGuysGroup = this.game.add.group();
                this.ggPointShadow = this.game.add.sprite(this.ggRing.position.x - 30, this.BASE_GAME_HEIGHT - fromBottom, 'shadow');
                this.bgPointShadow = this.game.add.sprite(this.bgRing.position.x - 30, this.ggPointShadow.position.y, 'shadow');
                this.ggPointShadow.visible = this.bgPointShadow.visible = false;
                this.gameWrapper.add(this.ggPointShadow);
                this.gameWrapper.add(this.bgPointShadow);
                this.gameWrapper.add(this.ggGuysGroup);
                this.gameWrapper.add(this.bgGuysGroup);

                // To init menu and points buttons
                this.initGameUIButtons();
            }
        }
    }

    /**
     * This method is used to create the slider with specific width and height
     * 
     * @memberOf SliderGameStateBase
     */
    createSlider() {
        const { slider } = this.engine.currentLevel;
        let total = eval(slider.total.value), min = eval(slider.min.value), max = eval(slider.max.value), interval = slider.interval ? eval(slider.interval.value) : 0;
        let sliderHeightValue = slider.height ? eval(slider.height.value) : 1;
        let graphic = this.game.add.graphics(0, 0);
        graphic.beginFill(0xF1551E);
        if (this.engine.currentLevel.sliderType == 'AreaModel') {
            this.sliderHeight = ((600) * sliderHeightValue) / total;
        }
        this.sliderHeight = this.sliderHeight > 300 ? 300 : this.sliderHeight;
        graphic.drawRect(0, 0, 600, this.sliderHeight);
        graphic.endFill();
        this.redSlide = this.game.add.sprite(0, 0, graphic.generateTexture());
        this.redSlide.inputEnabled = true;

        this.redSlide.events.onInputDown.add(()=>{
             this.onRedSlideClick(total,interval,currentValue,min,max,this.engine.sliderValues,this.engine.sliderValueParams,sliderValue,this.engine.sliderValuesType);
        });
        graphic.destroy();
        graphic = this.game.add.graphics(0, 0);
        graphic.beginFill(0xB8D800);
        graphic.drawRect(0, 0, this.redSlide.width * 0.1, this.redSlide.height);
        graphic.endFill();
        this.greenSlide = this.game.add.sprite(0, 0, graphic.generateTexture());
        this.greenSlide.inputEnabled = true;

         this.greenSlide.events.onInputDown.add(()=>{
             this.onGreenSlideClick(total,interval,currentValue,min,max,this.engine.sliderValues,this.engine.sliderValueParams,sliderValue,this.engine.sliderValuesType);
        });
        graphic.destroy();
        // To display height if the slider type is Area model
        if (this.engine.currentLevel.sliderType == 'AreaModel') {
            this.addSliderHeightText(slider);
        }
        graphic = this.game.add.graphics(0, 0);
        graphic.beginFill(0xFFFFFF);
        graphic.drawRoundedRect(0, 0, 50, this.redSlide.height + 20, 25);
        graphic.endFill();
        let phaser: any = Phaser;
        this.sliderKnob= new phaser.NinePatchImage(this.game, 0, 0, 'slider_knob_nine');
        this.sliderKnob.targetHeight = this.redSlide.height + 10;
        this.sliderKnob.UpdateImageSizes();
        graphic.destroy();
        this.sliderKnob.position.x = this.redSlide.width * 0.1 - this.sliderKnob.targetWidth / 2;
        this.sliderKnob.position.y = this.redSlide.height / 2 - this.sliderKnob.targetHeight / 2;
        this.sliderKnob.inputEnabled = true;
        this.sliderKnob.input.useHandCursor = true;
        this.sliderKnob.input.enableDrag();
        this.sliderKnob.input.setDragLock(true, false);
        this.sliderKnob.events.onInputDown.add(() => {
            this.updateResultArea('', '', false, []);
            this.sliderSnabSound.play();
        });
       this.clickedPercent = 0;
        let sliderValue = eval(slider.min.value);
        let currentValue = eval(slider.min.value);

        // initial value
        if (min == 0) {
            this.sliderKnob.position.x = this.redSlide.width * (min / total);
        } else {
            this.sliderKnob.position.x = this.redSlide.width * (min / total) - this.sliderKnob.targetWidth / 2;
        }
        this.greenSlide.width = this.sliderKnob.position.x + this.sliderKnob.targetWidth / 2;
        this.updateSliderValue(this.engine.sliderValueParams[0], sliderValue, total, this.engine.sliderValuesType);

        this.sliderKnob.events.onDragUpdate.add(() => {
            //if and else newly added for prevent knobe to gross slider
            if (this.sliderKnob.position.x + (this.sliderKnob.targetWidth) < this.redSlide.width) {
                this.greenSlide.width = this.sliderKnob.position.x + this.sliderKnob.targetWidth / 2;
            } else {
                this.greenSlide.width = this.redSlide.width;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            this.clickedPercent = ((this.sliderKnob.position.x + (this.sliderKnob.targetWidth / 2)) / this.redSlide.width) * 100;
            if (this.sliderKnob.position.x <= 0) {
                this.greenSlide.width = 0 + this.sliderKnob.targetWidth / 2;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            if (this.sliderKnob.position.x + (this.sliderKnob.targetWidth) > this.redSlide.width) {
                this.greenSlide.width = this.redSlide.width - this.sliderKnob.targetWidth / 2;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
                this.clickedPercent = ((this.sliderKnob.position.x + (this.sliderKnob.targetWidth)) / this.redSlide.width) * 100;
            }
            let clickedValue = (this.clickedPercent * total) / 100;
            let point = clickedValue % interval;
            if (point < (interval / 2)) {
                currentValue = clickedValue - point > min ? clickedValue - point : min;
            } else {
                currentValue = clickedValue - point + interval < max ? clickedValue - point + interval : max;
            }
            currentValue = Math.round(currentValue * 100) / 100;
            if (_.contains(this.engine.sliderValues, currentValue.toFixed(1))) {
                sliderValue = currentValue;
                if (this.engine.sliderValueParams[this.engine.sliderValues.indexOf(currentValue.toFixed(1))] != undefined) {
                    this.updateSliderValue(this.engine.sliderValueParams[this.engine.sliderValues.indexOf(currentValue.toFixed(1))], sliderValue, total, this.engine.sliderValuesType);
                }
            }
        }, this);
        this.sliderKnob.events.onDragStop.add(() => {
            this.onSliderKnobDragStop(total,interval,currentValue,min,max,this.engine.sliderValues,this.engine.sliderValueParams,sliderValue,this.engine.sliderValuesType);
        }, this);
        this.createSliderContainer();
    }

    /**
     * This function is used to group slider's different parts and sliderknob
     * 
     * @memberof SliderGameStateBase
     */
    createSliderContainer() {
        this.sliderContainer = this.game.add.group();
        if (this.engine.currentLevel.sliderType == 'AreaModel') {
            this.sliderContainer.add(this.ratioHeight);
        }
        this.sliderContainer.add(this.redSlide);
        this.sliderContainer.add(this.greenSlide);
        this.sliderContainer.add(this.sliderKnob);
        this.sliderContainer.position.x = this.frameBg.width / 2 - this.redSlide.width / 2;
        this.sliderContainer.position.y = this.resultArea.y + this.resultArea.height;
        this.frameContainer.add(this.sliderContainer);
        this.ratioContainer.position.y = this.resultArea.y + this.resultArea.height + this.sliderHeight - 15;
    }

    /**
     * This function will get triggered when the user clicks right to the slider knob
     * 
     * @param total It contains slider's total value
     * @param interval It contains slider's interval value
     * @param currentValue It contains slider's current left calue 
     * @param min It contains slider's minimum value
     * @param max It contains slider's maximum value
     * @param values It contains the values in which the slider knob can stop
     * @param valueParams It contains the text that are to be shown when the user moving the slider knob
     * @param sliderValue It contains the updated slider value
     * @param sliderValuesType It contains the slider's current value type 
     * @memberof SliderGameStateBase
     */
    onRedSlideClick(total:any,interval:any,currentValue:any,min:any,max:any,values:Array<string>,valueParams:Array<any>,sliderValue:number,sliderValuesType:number) {
            this.updateResultArea('', '', false, []);
            let clickedPosition = this.game.input.x - this.redSlide.worldPosition.x;
            this.clickedPercent = (clickedPosition / this.redSlide.width) * 100;
            let clickedValue = (this.clickedPercent * total) / 100;
            let point = clickedValue % interval;
            if (point < (interval / 2)) {
                currentValue = clickedValue - point > min ? clickedValue - point : min;
            } else {
                currentValue = clickedValue - point + interval < max ? clickedValue - point + interval : max;
            }
            currentValue = Math.round(currentValue * 100) / 100;

            if (currentValue < min) {
                currentValue = min;
                this.greenSlide.width = this.redSlide.width * (min / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            if (currentValue > max) {
                currentValue = max;
                this.greenSlide.width = this.redSlide.width * (max / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            //to control slider snab sound
            if (currentValue > min && currentValue < max || ((currentValue == min || currentValue == max) && !this.redSlideSnabSoundPlayed)) {
                if (currentValue == max) {
                    this.redSlideSnabSoundPlayed = true;
                    this.greenSlideSnabSoundPlayed = false;
                } else {
                    this.redSlideSnabSoundPlayed = false;
                    this.greenSlideSnabSoundPlayed = false;
                }
            }
          
            if (_.contains(values, currentValue.toFixed(1))) {
                sliderValue = currentValue;
                if (this.sliderValue.left !== Math.round(sliderValue * 100) / 100) {
                    this.sliderSnabSound.play();
                }
                this.updateSliderValue(valueParams[values.indexOf(currentValue.toFixed(1))], sliderValue, total, sliderValuesType);
                this.greenSlide.width = this.redSlide.width * (sliderValue / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            if (sliderValue == max) {
                this.greenSlide.width = this.redSlide.width * (sliderValue / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }

            if (this.greenSlide.width == 0) {
                this.greenSlide.width = this.greenSlide.width + this.sliderKnob.targetWidth / 2;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }

            if (this.greenSlide.width == this.redSlide.width) {
                this.greenSlide.width = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
    }

    /**
     * This function will get triggered when the user clicks left to the slider knob
     * 
     * @param total It contains slider's total value
     * @param interval It contains slider's interval value
     * @param currentValue It contains slider's current left calue 
     * @param min It contains slider's minimum value
     * @param max It contains slider's maximum value
     * @param values It contains the values in which the slider knob can stop
     * @param valueParams It contains the text that are to be shown when the user moving the slider knob
     * @param sliderValue It contains the updated slider value
     * @param sliderValuesType It contains the slider's current value type 
     * @memberof SliderGameStateBase
     */
    onGreenSlideClick(total:any,interval:any,currentValue:any,min:any,max:any,values:Array<string>,valueParams:Array<any>,sliderValue:number,sliderValuesType:number) {
         this.updateResultArea('', '', false, []);
            let clickedPosition = this.game.input.x - this.redSlide.worldPosition.x;
            this.clickedPercent = (clickedPosition / this.redSlide.width) * 100;
            let clickedValue = (this.clickedPercent * total) / 100;
            let point = clickedValue % interval;
            if (point < (interval / 2)) {
                currentValue = clickedValue - point > min ? clickedValue - point : min;
            } else {
                currentValue = clickedValue - point + interval < max ? clickedValue - point + interval : max;
            }
            currentValue = Math.round(currentValue * 100) / 100;
            if (currentValue < min) {
                currentValue = min;
                this.greenSlide.width = this.redSlide.width * (min / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            if (currentValue > max) {
                currentValue = max;
                this.greenSlide.width = this.redSlide.width * (max / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            //to control slider snab sound
            if (currentValue > min && currentValue < max || ((currentValue == min || currentValue == max) && !this.greenSlideSnabSoundPlayed)) {
                if (currentValue == min) {
                    this.greenSlideSnabSoundPlayed = true;
                    this.redSlideSnabSoundPlayed = false;
                } else {
                    this.redSlideSnabSoundPlayed = false;
                }
            }

            if (_.contains(values, currentValue.toFixed(1))) {
                sliderValue = currentValue;
                if (this.sliderValue.left !== Math.round(sliderValue * 100) / 100) {
                    this.sliderSnabSound.play();
                }
                this.updateSliderValue(valueParams[values.indexOf(currentValue.toFixed(1))], sliderValue, total, sliderValuesType);
                this.greenSlide.width = this.redSlide.width * (sliderValue / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            if (sliderValue == min || sliderValue == max) {
                this.greenSlide.width = this.redSlide.width * (sliderValue / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            if (this.greenSlide.width == 0) {
                this.greenSlide.width = this.greenSlide.width + this.sliderKnob.targetWidth / 2;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            if (this.greenSlide.width == this.redSlide.width) {
                this.greenSlide.width = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
    }

    /**
     * This function will get triggered when the user stop dragging slider knob
     * 
     * @param total It contains slider's total value
     * @param interval It contains slider's interval value
     * @param currentValue It contains slider's current left calue 
     * @param min It contains slider's minimum value
     * @param max It contains slider's maximum value
     * @param values It contains the values in which the slider knob can stop
     * @param valueParams It contains the text that are to be shown when the user moving the slider knob
     * @param sliderValue It contains the updated slider value
     * @param sliderValuesType It contains the slider's current value type 
     * @memberof SliderGameStateBase
     */
    onSliderKnobDragStop(total:any,interval:any,currentValue:any,min:any,max:any,values:Array<string>,valueParams:Array<any>,sliderValue:number,sliderValuesType:number) {
         if (currentValue < min) {
                this.greenSlide.width = this.redSlide.width * (min / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            if (currentValue > max) {
                this.greenSlide.width = this.redSlide.width * (max / total);
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }
            this.greenSlide.width = this.redSlide.width * (sliderValue / total);
            this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;

            if (this.greenSlide.width == 0) {
                this.greenSlide.width = this.greenSlide.width + this.sliderKnob.targetWidth / 2;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }

            if (this.greenSlide.width == this.redSlide.width) {
                this.greenSlide.width = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
                this.sliderKnob.position.x = this.greenSlide.width - this.sliderKnob.targetWidth / 2;
            }

            if (_.contains(values, currentValue.toFixed(1))) {
                sliderValue = currentValue;
                if (valueParams[values.indexOf(currentValue.toFixed(1))] != undefined) {
                    this.updateSliderValue(valueParams[values.indexOf(currentValue.toFixed(1))], sliderValue, total, sliderValuesType);
                }
            }
    }

    /**
     * This method is used to create the background for diaplaying the slider's current value
     * 
     * @memberOf SliderGameStateBase
     */
    ratioWrapper() {
        let graphic = this.game.add.graphics(0, 0);
        graphic.beginFill(0x443932);
        graphic.drawRoundedRect(0, 0, 600, this.resultArea.height + 15, 25);
        graphic.endFill();
        this.ratioBG = this.game.add.sprite(0, 0, graphic.generateTexture());
        graphic.destroy();
        this.ratioContainer = this.game.add.group();
        this.ratioContainer.add(this.ratioBG);
        this.ratioContainer.position.x = this.frameBg.width / 2 - this.ratioBG.width / 2;
        this.ratioContainer.position.y = this.resultArea.y + this.resultArea.height + this.sliderHeight - 15;
        this.ratioLeftSprite = this.game.add.sprite(35, 45, '');
        this.ratioRightSprite = this.game.add.sprite(0, 45, '');
        this.ratioContainer.add(this.ratioLeftSprite);
        this.ratioContainer.add(this.ratioRightSprite);
        this.frameContainer.add(this.ratioContainer);
    }

    /**
     * This method is used to update the slider value while draggging the slider knob or change the slider knob position by clicking on the slider 
     * 
     * @param param It contains the strings that are used to form image url to display on the screen
     * @param value Current left value of the slider
     * @param total It contains the slider's total value
     * @param sliderValuesType It contains the type of the slider value(i.e:Integer,fraction,etc.)
     * 
     * @memberOf SliderGameStateBase
     */
    updateSliderValue(param: any, value: number, total: number, sliderValuesType: number) {
        let type:string='slider';
        if (sliderValuesType == 2 && param.left.toString().includes('frac')) {
            this.sliderTextStyle.size = '90';
            this.sliderTextStyle.scale = 2;
            this.ratioLeftSprite.y = 20;
            this.ratioRightSprite.y = 20;
        } else {
            this.sliderTextStyle.size = '50';
            this.sliderTextStyle.scale = 3;
            this.ratioLeftSprite.y = 45;
            this.ratioRightSprite.y = 45;
        }

        this.sliderValue.left = Math.round(value * 100) / 100;
        this.sliderValue.right = Math.round((total - value) * 100) / 100;
        this.sliderValue.leftParam = param.left;
        this.sliderValue.rightParam = param.right;

        if (this.engine.currentLevel.slider.total.type == 3) {
            this.sliderValue.left = value / 100;
            this.sliderValue.right = (total - value) / 100;
            this.sliderValue.leftParam = `${param.left}\\text %`;
            this.sliderValue.rightParam = `${param.right}\\text %`;
        }

        if(!this.game.cache.checkImageKey(`${type}${this.sliderValue.leftParam}`)) {
        latextopngconverter(`${this.sliderValue.leftParam}`, {scale: this.sliderTextStyle.scale, fill:'#FFFFFF'}, (output: any)=> {
        this.ratioLeftSprite.data.image = new Image();
        this.ratioLeftSprite.data.image.src = output.img;
        this.ratioLeftSprite.data.image.onload = () => {
            if (this.ratioLeftSprite.data.image !== undefined) {
                this.game.cache.addImage(`${type}${this.sliderValue.leftParam}`, this.ratioLeftSprite.data.image.src, this.ratioLeftSprite.data.image);
                let tmpImage = this.game.add.sprite(0, 0,`${type}${this.sliderValue.leftParam}`);
                this.ratioLeftSprite.texture = tmpImage.generateTexture();
                tmpImage.destroy();
            };
        }

        this.ratioLeftSprite.data.image.onerror = () => {
            console.log('image loading failed');
        };
        });
        } else {
               let tmpImage = this.game.add.sprite(0, 0,`${type}${this.sliderValue.leftParam}`);
                this.ratioLeftSprite.texture = tmpImage.generateTexture();
                tmpImage.destroy();
        }

        if(!this.game.cache.checkImageKey(`${type}${this.sliderValue.rightParam}`)) {
        latextopngconverter(`${this.sliderValue.rightParam}`, {scale: this.sliderTextStyle.scale, fill:'#FFFFFF'}, (output: any)=> {
        this.ratioRightSprite.data.image = new Image();
        this.ratioRightSprite.data.image.src = output.img;
        this.ratioRightSprite.data.image.onload = () => {
            if (this.ratioRightSprite.data.image !== undefined) {
                this.game.cache.addImage(`${type}${this.sliderValue.rightParam}`, this.ratioRightSprite.data.image.src, this.ratioRightSprite.data.image);
                let tmpImage = this.game.add.sprite(0, 0,`${type}${this.sliderValue.rightParam}`);
                this.ratioRightSprite.texture = tmpImage.generateTexture();
                tmpImage.destroy();
                this.ratioRightSprite.position.x = this.ratioBG.width - this.ratioRightSprite.width - 30;
            };
        }

        this.ratioRightSprite.data.image.onerror = () => {
            console.log('image loading failed');
        };
    });
          } else {
               let tmpImage = this.game.add.sprite(0, 0,`${type}${this.sliderValue.rightParam}`);
                this.ratioRightSprite.texture = tmpImage.generateTexture();
                tmpImage.destroy();
                this.ratioRightSprite.position.x = this.ratioBG.width - this.ratioRightSprite.width - 30;
          }
        this.resetTilesClick();
    }

    /**
     * This function is used to add tiles to frame container
     * 
     * @memberOf SliderGameStateBase
     */
    addTiles() {
        let gridSize = this.engine.currentLevel.gridSize;
        let cols:any = [];
        let tileImage = this.game.cache.getFrameData(this.tileImage).getFrameByName('tile_brown');
        this.tilesContainer.position.x = 180;
        this.tilesContainer.position.y = 100 + tileImage.height / 2;

        if (gridSize == 3) {
            this.tilesContainer.position.x = 210;
            this.tilesContainer.position.y = (tileImage.height / 2) - 150;
        }

        let width = gridSize * (tileImage.width + this.tileMargin) + 30;
        let height = gridSize * (tileImage.height + this.tileMargin) + 25;
        this.maskGraphic = this.game.add.graphics(80, 100);
        this.maskGraphic.beginFill(0xF4E6C6);
        this.maskGraphic.drawRect(0, 0, width, height);
        this.maskGraphic.endFill();
        this.frameContainer.add(this.maskGraphic);
        let generatedCols = this.engine.generateNormalTileCols([], 0);
        for (let i = 0; i < this.engine.currentLevel.gridSize; i++) {
            cols[i] = this.game.add.group();
            cols[i].x = i * (tileImage.width + this.tileMargin);
            cols[i].y = 0;
            this.tilesContainer.add(cols[i]);
            this.addRowTiles(i, generatedCols[i], true);
        }
        this.animateTile();
    }

    /**
     * This function is used to add new tile sprite based on the given tile type
     * 
     * @param tileIndex It contains the type of the tile to add(i.e:Normal,Combo,Goodguy,Badguy)
     * @returns It returns the generated tile sprite
     * 
     * @memberOf SliderGameStateBase
     */
    getTileSprite(tileIndex: number): Phaser.Sprite {
        switch (tileIndex) {
            case 0: return this.game.add.sprite(0, 0, this.tileImage, 'tile_brown');
            case 1: return this.game.add.sprite(0, 0, this.ggImage);
            case 2: return this.game.add.sprite(0, 0, this.bgImage);
            case 3: return this.game.add.sprite(0, 0, this.tileImage, 'tile_bonus_brown');
            case 4: return this.game.add.sprite(0, 0, this.tileImage, 'tile_bonus_brown');
            default: return this.game.add.sprite(0, 0, this.tileImage, 'tile_brown');
        }
    }

    /**
     * This function is used to generate new tile sprites and add it to the particular column and row
     * 
     * @param colIndex It contains the column index
     * @param generatedCols It contains array of tile data based on this new tiles are added to the particular column and row
     * @param needText It contains t
     * 
     * @memberOf SliderGameStateBase
     */
    addRowTiles(colIndex: number, generatedCols: any, needText: boolean) {
        let column: any = this.tilesContainer.children[colIndex];
        let tileImage = this.game.cache.getFrameData(this.tileImage).getFrameByName('tile_brown');
        let typeIndex = 1;
        let calcY = 0 - tileImage.height - this.tileMargin;
        let count = 1;

        for (let j = 0; j < this.engine.currentLevel.gridSize; j++) {
            if (typeof column.children[j] === 'undefined') {
                typeIndex = (Math.floor(Math.random() * 3) + 1) - 1;
                let tileSprite = this.getTileSprite(generatedCols[j].type);
                tileSprite.position.y = count * calcY;
                tileSprite.anchor.set(0.5, 0.5);
                let type = null;

                switch (generatedCols[j].type) {
                    case 1: type = 'goodguy'; break;
                    case 2: type = 'badguy'; break;
                    case 3: type = 'col'; break;
                    case 4: type = 'row'; break;
                    default:
                        break;
                }

                tileSprite.data = {
                    tile: `${colIndex}_${j}`,
                    tileData: generatedCols[j],
                    col: colIndex,
                    row: j,
                    type: type
                };

                if (generatedCols[j].type != 1 && generatedCols[j].type != 2) {
                    tileSprite.data.clickable = true;
                    tileSprite.inputEnabled = true;
                    tileSprite.input.useHandCursor = true;
                    tileSprite.events.onInputDown.add((sprite: Phaser.Sprite) => {
                        this.tileOnClick(sprite);
                    });
                }
                tileSprite.mask = this.maskGraphic;
                tileSprite.rotation = (generatedCols[j].type === 4) ? Math.PI / 180 * 90 : 0;
                column.add(tileSprite);
                count++;
            } else {
                // change index
                column.children[j].data.tile = `${colIndex}_${j}`;
                column.children[j].data.row = j;
            }
            //To prevent text on good and bad guy
            if (column.children[j].children.length === 0 && (!column.children[j].noNeedText) || needText) {
                let text: any;
                if (generatedCols[j].type != 1 && generatedCols[j].type != 2) {
                    text = this.getGridTilesText(generatedCols[j]);
                    text.rotation = (generatedCols[j].type === 4) ? Math.PI / 180 * -90 : 0;
                    text.anchor.set(0.5, 0.5);
                    column.children[j].addChild(text);
                } else {
                    column.children[j].noNeedText = true;
                }
            }
        }
    }

    /**
     * This function is used to reset the selected tiles into noraml state if the user moves the slider after selecting single tile
     * 
     * @memberOf SliderGameStateBase
     */
    resetTilesClick() {
        if (this.selectedTilePair.length > 0) {
            this.selectedTilePair.map((sprite: Phaser.Sprite, index: number) => {
                sprite.inputEnabled = true;
                sprite.data.isValid = false;
                sprite.input.useHandCursor = true;
                sprite.frameName = sprite.frameName.replace(/green|red/gi, 'brown');
            });
            this.selectedTilePair = [];
            this.updateResultArea('', '', false, []);
        }
    }

    /**
     * This function is used to update result area text after user selects the pair
     * 
     * @param leftParamString It contains slider's left text
     * @param rightParamString It contains slider's right text
     * @param validPair It contains true if the selected tiles are correct pair otherwise false
     * @param selectedTiles It contains the selected pair of tiles
     * 
     * @memberOf SliderGameStateBase
     */
    updateResultArea(leftParamString: any, rightParamString: any, validPair: boolean, selectedTiles: any) {
        let resultTextSize = '50';
        let resulttextScale = 3;
        let textY = 20;

        if (this.engine.currentLevel.equationType == 'distributiveProp') {
            resultTextSize = '60';
            textY = 22;
            resulttextScale = 2.75;
        }
        if (this.engine.currentLevel.slider.min && this.engine.currentLevel.slider.total && this.engine.currentLevel.slider.interval && this.engine.currentLevel.slider.max) {
            if (((this.engine.currentLevel.slider.min.type == 2 || this.engine.currentLevel.slider.total.type == 2 || this.engine.currentLevel.slider.interval.type == 2 || this.engine.currentLevel.slider.max.type == 2)) && (this.sliderValue.leftParam.includes('frac') || this.sliderValue.rightParam.includes('frac'))) {
                resultTextSize = '80';
                textY = 10;
                resulttextScale = 2;
            } else if (leftParamString.includes('frac') || rightParamString.includes('frac')) {
                resultTextSize = '80';
                textY = 10;
                 resulttextScale = 2;
            }
        } else if (leftParamString.includes('frac') || rightParamString.includes('frac') || this.sliderValue.leftParam.includes('frac') || this.sliderValue.rightParam.includes('frac')) {
            resultTextSize = '80';
            textY = 10;
            resulttextScale = 2;
        }

        if (this.engine.currentLevel.slider.height) {
            if (this.engine.currentLevel.slider.height.type == 2 && this.engine.currentLevel.slider.height.latexParam.includes('frac')) {
                resultTextSize = '80';
                textY = 10;
                 resulttextScale = 2;
            }
        }
        let text: any;
        let resultTextColorCode = validPair ? 'FFFFFF' : 'FF0000';
        let resultText = '';
        if (this.resultArea.children.length > 0) {
            text = this.resultArea.children[0];
            text.destroy();
        }

        if (this.selectedTilePair.length == 2 && this.engine.currentLevel.equationType !== null) {
            resultText = this.engine.getResultAreaText(this.sliderValue, leftParamString, rightParamString, selectedTiles);
            text = this.game.add.sprite(0, 0, '');
            latextopngconverter(`${resultText}`, {scale: resulttextScale, fill:'#FFFFFF'}, (output: any)=> {
            text.data.image = new Image();
            text.data.image.src = output.img;
            text.data.image.onload = () => {
                if (text.data.image !== undefined) {
                    this.game.cache.addImage('resulText', text.data.image.src, text.data.image);
                    let tmpImage = this.game.add.sprite(0, 0, 'resulText');
                    text.texture = tmpImage.generateTexture();
                    text.position.x = this.resultArea.width / 2 - text.width / 2;
                    tmpImage.destroy();
                };
            }

            text.data.image.onerror = () => {
                console.log('image loading failed');
            };
            text.position.y = textY;
            this.resultArea.addChild(text);
        });
        }
    }

    /**
     * This function is used to find out the result of selected tiles are correct or incorrect.
     * 
     * @returns It returns true if the selected tiles are match otherwise false
     * 
     * @memberOf SliderGameStateBase
     */
    calculateClickedSprite() {
        const { slider } = this.engine.currentLevel;
        let selectedComboTileCount = this.selectedComboTileCount(this.selectedTilePair);
        if (this.engine.currentLevel.sliderType == 'AreaModel') {
            let height = slider.height ? eval(slider.height.value) : 1;

            if ((height * this.sliderValue.left == this.selectedTilePair[0].data.tileData.value) && (height * this.sliderValue.right == this.selectedTilePair[1].data.tileData.value)) {
                let pointsEarned = selectedComboTileCount > 0 ? (this.engine.gradePointsData.points.comboTile * selectedComboTileCount) : this.engine.gradePointsData.points.successfulPair;
                this.pointsEarnedTween(this.selectedTilePair[1].worldPosition.x, this.selectedTilePair[1].worldPosition.y, this.selectedTilePair[1].height, pointsEarned, false);
                this.playValidPairOrComboSound(selectedComboTileCount);
                return true;
            } else {
                this.selectedTilePair[0].frameName = this.selectedTilePair[0].frameName.replace('green', 'brown');
                this.selectedTilePair[1].frameName = this.selectedTilePair[1].frameName.replace('red', 'brown');
                if ((height * this.sliderValue.left == this.selectedTilePair[1].data.tileData.value) && (height * this.sliderValue.right == this.selectedTilePair[0].data.tileData.value)) {
                    this.wrongOrderPairAlert.visible = true;
                    this.wrongOrderPairAlertTween(this.wrongOrderPairAlert);
                } else {
                    this.wrongPairSound.play();
                }
                this.selectedTilePair = [];
                return false;
            }
        } else {
            let hcf = this.engine.hcf(this.sliderValue.left, this.sliderValue.right);
            let tileHcf = this.engine.hcf(this.selectedTilePair[0].data.tileData.value, this.selectedTilePair[1].data.tileData.value);

            //To check the equation type is twoEquationsRatio to set (e.g) 1:2 != 2:4
            let isCorrectLeftPair: any = (this.engine.currentLevel.equationType !== 'twoEquationsRatio' && this.engine.grade == 6) ? this.sliderValue.left / hcf == this.selectedTilePair[0].data.tileData.value / tileHcf : this.sliderValue.left == this.selectedTilePair[0].data.tileData.value;
            let isCorrectRightPair: any =(this.engine.currentLevel.equationType !== 'twoEquationsRatio' && this.engine.grade == 6) ? this.sliderValue.right / hcf == this.selectedTilePair[1].data.tileData.value / tileHcf : this.sliderValue.right == this.selectedTilePair[1].data.tileData.value;

            if (isCorrectLeftPair && isCorrectRightPair) {
                let pointsEarned = selectedComboTileCount > 0 ? (this.engine.gradePointsData.points.comboTile * selectedComboTileCount) : this.engine.gradePointsData.points.successfulPair;
                this.pointsEarnedTween(this.selectedTilePair[1].worldPosition.x, this.selectedTilePair[1].worldPosition.y, this.selectedTilePair[1].height, pointsEarned, false);
                this.playValidPairOrComboSound(selectedComboTileCount);
                return true;
            } else if ((Math.round((this.sliderValue.left / hcf) / (this.sliderValue.right / hcf) * 100) / 100 == Math.round((this.selectedTilePair[0].data.tileData.value / tileHcf) / (this.selectedTilePair[1].data.tileData.value / tileHcf) * 100) / 100) && (this.engine.currentLevel.equationType !== 'twoEquationsRatio' && this.engine.grade == 6)) {
                let pointsEarned = selectedComboTileCount > 0 ? (this.engine.gradePointsData.points.comboTile * selectedComboTileCount) : this.engine.gradePointsData.points.successfulPair;
                this.pointsEarnedTween(this.selectedTilePair[1].worldPosition.x, this.selectedTilePair[1].worldPosition.y, this.selectedTilePair[1].height, pointsEarned, false);
                this.playValidPairOrComboSound(selectedComboTileCount);
                return true;
            } else if ((Math.round((this.sliderValue.right / hcf) / (this.sliderValue.left / hcf) * 100) / 100 == Math.round((this.selectedTilePair[0].data.tileData.value / tileHcf) / (this.selectedTilePair[1].data.tileData.value / tileHcf) * 100) / 100) && (this.engine.currentLevel.equationType !== 'twoEquationsRatio' && this.engine.grade == 6)) {
                this.selectedTilePair[0].frameName = this.selectedTilePair[0].frameName.replace('green', 'brown');
                this.selectedTilePair[1].frameName = this.selectedTilePair[1].frameName.replace('red', 'brown');
                this.wrongOrderPairAlert.visible = true;
                this.wrongOrderPairAlertTween(this.wrongOrderPairAlert);
                this.selectedTilePair = [];
                return false;
            }
            else {
                //To check the equation type is twoEquationsRatio
                let isWrongOrderLeftPair: any = (this.engine.currentLevel.equationType !== 'twoEquationsRatio' && this.engine.grade == 6)? this.sliderValue.left / hcf == this.selectedTilePair[1].data.tileData.value / tileHcf : this.sliderValue.left == this.selectedTilePair[1].data.tileData.value;
                let isWrongOrderRightPair: any = (this.engine.currentLevel.equationType !== 'twoEquationsRatio' && this.engine.grade == 6) ? this.sliderValue.right / hcf == this.selectedTilePair[0].data.tileData.value / tileHcf : this.sliderValue.right == this.selectedTilePair[0].data.tileData.value;

                this.selectedTilePair[0].frameName = this.selectedTilePair[0].frameName.replace('green', 'brown');
                this.selectedTilePair[1].frameName = this.selectedTilePair[1].frameName.replace('red', 'brown');

                if (isWrongOrderLeftPair && isWrongOrderRightPair) {
                    this.wrongOrderPairAlert.visible = true;
                    this.wrongOrderPairAlertTween(this.wrongOrderPairAlert);
                } else {
                    this.wrongPairSound.play();
                }
                this.selectedTilePair = [];
                return false;
            }
        }
    }

    /**
     * This funtion will get triggered every time when the user selects a tile on the grid
     * 
     * @param sprite It contains the clicked tile
     * @returns any
     * 
     * @memberOf SliderGameStateBase
     */
    tileOnClick(sprite: Phaser.Sprite) {
        if (this.selectedTilePair.length == 0) {
            this.updateResultArea('', '', false, []);
        }
        this.previousColumn = [];
        if (sprite.frameName == 'tile_green' || sprite.frameName == 'tile_bonus_green') {
            sprite.frameName = sprite.frameName.replace('green', 'brown');
            this.firstClickSound.play();
            this.selectedTilePair = [];
            this.tilesClicked--;
            return;
        }

        const { slider } = this.engine.currentLevel;
        let prevTileRatio = (this.selectedTilePair.length > 0) ? this.selectedTilePair[0].data.ratio : '';
        if (prevTileRatio !== 'left') {
            sprite.frameName = sprite.frameName.replace('brown', 'green');
            sprite.data.ratio = 'left';
            this.firstClickSound.play();
        } else {
            sprite.frameName = sprite.frameName.replace('brown', 'red');
            sprite.data.ratio = 'right';
            this.secondClickSound.play();
        }
        this.tilesClicked++;
        this.selectedTilePair.push(sprite);
        setTimeout(() => {
            if (this.selectedTilePair.length === 2) {
                let isValid = this.calculateClickedSprite();
                // return if wrong tile clicked   
                if (!isValid) {
                    return;
                }
                this.tileClickStatus(false); // disable tile click
                this.pointsCount++;
                this.selectedTilePair.map((sprite, index) => {
                    sprite.data.clicked = true;
                    this.getAffectedTiles(sprite);
                });

                // get combo tiles and filter it
                this.comboTilesAnim = _.reduce(this.tilesToDestroy, (m: Array<any>, sprite: Phaser.Sprite) => {
                    if (sprite.data.type == 'col' || sprite.data.type == 'row') {
                        let p = sprite.data.tile;
                        let index = (sprite.data.type === 'col') ? p.split('_')[0] : p.split('_')[1];
                        m.push({
                            type: sprite.data.type,
                            index: `${sprite.data.type}_${index}`,
                            animPos: sprite.parent.position,
                            y: sprite.position.y
                        });
                    }
                    return m;
                }, []);
                this.comboTilesAnim = _.unique(this.comboTilesAnim, function (item, key, a) {
                    return item.index;
                });
                clearTimeout(this.tweenInterval);
                this.updateResultArea(this.selectedTilePair[0].data.tileData.latexString, this.selectedTilePair[1].data.tileData.latexString, true, this.selectedTilePair);
                this.tweenInterval = setTimeout(() => {
                    // tween selected tiles
                    this.selectedTilePair.map((ele, index) => {
                        this.removeTile(ele);
                    });
                    // tween combo animation if any
                    this.tweenCombo();
                }, 300);
                let bonusTile = 0;
                for (let k = 0; k < this.selectedTilePair.length; k++) {
                    if (this.selectedTilePair[k].data.type == 'col' || this.selectedTilePair[k].data.type == 'row') {
                        bonusTile += 1;
                    }
                }
                if (bonusTile == 0) {
                    this.updatePoints(this.engine.gradePointsData.points.successfulPair, 0);
                }
                else {
                    this.updatePoints(this.affectedBonusTiles * this.engine.gradePointsData.points.comboTile, 0);
                    this.affectedBonusTiles = 0;
                }
                return;
            }
        }, 100);
    }

    /**
     * This function is used to change the state of the grid tiles to clickable or unclickable
     * 
     * @param status It contains true or false
     * 
     * @memberOf SliderGameStateBase
     */
    tileClickStatus(status: boolean) {
        this.tilesContainer.children.map((colGroup: Phaser.Group, index) => {
            colGroup.children.map((sprite: Phaser.Sprite, ind) => {
                if (sprite.data.clickable) {
                    sprite.inputEnabled = status;
                    sprite.input.useHandCursor = status;
                }
            });
        });
    }

    /**
     * This function is used to find out the tiles that are to be removed if the user select the combo tile with correct combination
     * 
     * @param clickedSprite It contains one of the user selected tiles
     * @returns any
     * 
     * @memberOf SliderGameStateBase
     */
    getAffectedTiles(clickedSprite: Phaser.Sprite) {
        let tileData = clickedSprite.data;
        let type = tileData.type;
        let tileColor = 0xFFFFFF;
        if (type === 0) {
            clickedSprite.tint = tileColor;
            this.tilesToDestroySam.push(clickedSprite.data.tile);
            this.tilesToDestroy.push(clickedSprite);
            return;
        } else {
            if (type === 'col') {
                let sprites: any = this.tilesContainer.children[tileData.col];
                sprites.children.map((sprite: Phaser.Sprite, index: number) => {
                    if (!_.contains(this.tilesToDestroySam, sprite.data.tile)) {
                        if (sprite.data.type == 'col' || sprite.data.type == 'row') {
                            this.affectedBonusTiles++;
                        }
                        sprite.tint = tileColor;
                        this.tilesToDestroySam.push(sprite.data.tile);
                        this.tilesToDestroy.push(sprite);
                        this.getAffectedTiles(sprite);
                    }
                });
            }
            if (type === 'row') {
                let cols: any = this.tilesContainer.children;
                cols.map((colGroup: Phaser.Group, index: number) => {
                    colGroup.children.map((rowSprite: Phaser.Sprite, ind: number) => {
                        if (ind === tileData.row && !_.contains(this.tilesToDestroySam, rowSprite.data.tile)) {
                            if (rowSprite.data.type == 'row' || rowSprite.data.type == 'col') {
                                this.affectedBonusTiles++;
                            }
                            rowSprite.tint = tileColor;
                            this.tilesToDestroySam.push(rowSprite.data.tile);
                            this.tilesToDestroy.push(rowSprite);
                            this.getAffectedTiles(rowSprite);
                        }
                    });
                });
            }
        }
    }

    /**
     * This function is used to play the combo animation either Horizantal or Vertical direction while the combo tile clears
     * 
     * @memberOf SliderGameStateBase
     */
    tweenCombo() {
        this.tilesToDestroy.map((ele, index) => {
            if (!ele.data.clicked) {
                ele.visible = false;
            }
        });

        let tweenCount = 0;
        this.comboTilesAnim.map((ele, index) => {
            let comboAnimation = this.game.add.sprite(0, 0, 'fx');
            comboAnimation.position.copyFrom(ele.animPos);
            if (ele.type === 'row') {
                comboAnimation.anchor.set(0.5, 0.5);
                comboAnimation.position.x = 275;
                comboAnimation.position.y = ele.y;
                comboAnimation.rotation = Math.PI / 180 * 90;
            } else if (ele.type == 'col') {
                comboAnimation.position.x = ele.animPos.x - this.game.cache.getFrameData(this.tileImage).getFrameByName('tile_brown').width / 2 - 25;
                if (this.engine.currentLevel.gridSize == 4) {
                    comboAnimation.position.y -= this.game.cache.getFrameData(this.tileImage).getFrameByName('tile_brown').height / 2 + 80;
                } else {
                    comboAnimation.position.y = this.game.cache.getFrameData(this.tileImage).getFrameByName('tile_brown').height / 2;
                }
            }
            this.tilesContainer.add(comboAnimation);
            comboAnimation.animations.add('fx');
            comboAnimation.animations.currentAnim.onComplete.add(() => {
                tweenCount++;
                if (tweenCount === this.comboTilesAnim.length) {
                    this.comboTilesAnim = [];
                }
            });
            comboAnimation.animations.play('fx', 15, false, true);
        });
    }

    /**
     * This function is used to destroy the tiles which are selected by user and makes correct pair
     * 
     * @param sprite It contains the tile to destroy
     * 
     * @memberOf SliderGameStateBase
     */
    removeTile(sprite: Phaser.Sprite) {
        let whiteGraphic = this.game.add.graphics(0, 0);
        whiteGraphic.beginFill(0xFFFFFF);
        whiteGraphic.drawRect(0, 0, sprite.width, sprite.height);
        whiteGraphic.endFill();
        sprite.setTexture(whiteGraphic.generateTexture());
        whiteGraphic.destroy();
        let tween = this.game.add.tween(sprite)
            .to(
            { width: 0, height: 0 },
            200,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);
        tween.onComplete.add((target: Phaser.Sprite) => {
            this.tilesDestroyed.push(target.data);
            target.destroy();
            if (this.selectedTilePair.length === this.tilesDestroyed.length) {
                this.selectedTilePair = [];
                this.tilesToDestroy.map((ele, index) => {
                    if (!ele.data.clicked) {
                        if (ele.data.type == 'badguy') {
                            this.updatePoints(this.engine.gradePointsData.points.clearBadGuy, 0);
                        }
                        ele.destroy();
                    }
                });
                this.addNextSetTile(true);
                this.tileClickStatus(true);
            }
        });
    }

    /**
     * This function will get triggered when the user removes the tiles by clicking valid pair of tiles
     * 
     * @param playSound It contains a boolean value to specify wheather it is need to play tiles fall audio or not
     * 
     * @memberOf SliderGameStateBase
     */
    addNextSetTile(playSound: boolean) {
        let oldColumns: any = [];
        this.tilesContainer.children.map((colGroup: Phaser.Group, index: number) => {
            colGroup.children.map((sprite: Phaser.Sprite, ind: number) => {
                oldColumns[index] = (oldColumns[index]) ? oldColumns[index] : [];
                oldColumns[index].push(sprite.data.tileData);
            });
        });

        let generatedCols = this.engine.generateNormalTileCols(oldColumns, this.tilesClicked);
        this.tilesDestroyed = [];
        this.tilesToDestroy = [];
        this.tilesToDestroySam = [];
        this.comboTilesAnim = [];
        for (let i = 0; i < this.engine.currentLevel.gridSize; i++) {
            this.addRowTiles(i, generatedCols[i], false);
        }
        if (playSound) {
            setTimeout(() => { this.tilesFall.play() }, 300);
        }
        this.animateTile();
    }

    /**
     * This function is used to move each grid tiles towards down when the user remove user makes the correct pair
     * 
     * @memberOf SliderGameStateBase
     */
    animateTile() {
        let tileImage = this.game.cache.getFrameData(this.tileImage).getFrameByName('tile_brown');
        let height = 4 * (tileImage.height + this.tileMargin) + 25;
        // animate sprite
        let totalHeight = height - tileImage.height - this.tileMargin;
        let toY = 0;
        this.tilesContainer.children.map((column: Phaser.Group, index: number) => {
            let spriteColumn = this.tilesContainer.getChildIndex(column);
            column.children.map((sprite: Phaser.Sprite, index: number) => {
                toY = totalHeight - index * (tileImage.height + this.tileMargin);
                let tween = this.game.add.tween(sprite)
                    .to(
                    { y: toY },
                    200,
                    Phaser.Easing.Linear.None,
                    true, 0, 0, false);
                if ((sprite.data.tileData.type === 1 || sprite.data.tileData.type === 2) && index === 0) {

                    //To block good and bad guys drop after badguy reaches the loseThroshled
                    if (this.bgGuysGroup.length < this.engine.currentLevel.scoring.loseThreshold && this.totalStackedGoodGuys < (this.engine.currentLevel.scoring.starThreshold * 3)) {
                        this.showTrampoline(true);
                        if (!_.contains(this.previousColumn, spriteColumn)) {
                            this.woodBlock.play();
                            this.hatches.children[spriteColumn].visible = false;
                            this.hatchesAnimation(this.hatches.children[spriteColumn].worldPosition.x, this.frameBg.height, spriteColumn);
                        }
                        this.previousColumn.push(spriteColumn);
                        tween.onComplete.add((target: Phaser.Sprite) => {
                            let newGuySprite = this.getTileSprite(target.data.tileData.type);
                            newGuySprite.data.type = target.data.tileData.type;
                            newGuySprite.data.ggIndex = (target.data.tileData.type === 1) ? ++this.lastGGIndex : null;
                            newGuySprite.data.guyCount = ++this.guyCount;
                            if (this.engine.currentLevel.gridSize == 3) {
                                newGuySprite.position.x = target.worldPosition.x - 100;
                            } else {
                                newGuySprite.position.x = target.worldPosition.x - 90;
                            }

                            newGuySprite.position.y = target.worldPosition.y;
                            if (target.data.tileData.type === 1) {
                                this.totalStackedGoodGuys++;
                                this.ggGuysGroup.add(newGuySprite);
                            } else {
                                this.bgGuysGroup.add(newGuySprite);
                            }
                            target.destroy();
                            this.guyReachedAnim(newGuySprite);
                            this.addNextSetTile(false);
                        });
                    }

                }
            });
        });
        this.tileClickStatus(true);
    }

    /**
     * This function is used to tween the trampoline when the goodguys and badguys falling down from the grid and jump to top
     * 
     * @param visibility It contains a boolean value to specify wheather it is show the trampoline or not
     * 
     * @memberOf SliderGameStateBase
     */
    showTrampoline(visibility: boolean) {
        let tween = this.game.add.tween(this.trampoline)
            .to(
            { y: (visibility) ? 1120 : this.BASE_GAME_HEIGHT + 10 },
            200,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);
    }

    /**
     * This function will get triggered when Goodguy or Badguy fell down and touch the trampoline
     * 
     * @param guy It conatins falling goodguy/badguy
     * 
     * @memberOf SliderGameStateBase
     */
    guyReachedAnim(guy: Phaser.Sprite) {
        this.guyBounce.play();
        let jumpToTop = (toJump: Phaser.Sprite) => {
            let tween = this.game.add.tween(guy)
                .to(
                { y: 0 - toJump.height - 20 },
                200,
                Phaser.Easing.Linear.None,
                true, 0, 0, false);
            tween.onComplete.add((target: Phaser.Sprite) => {
                if (target.data.type === 1) {
                    if ((this.ggLandingTween === null || this.ggLandingTween === undefined) && (this.ggLandingAnim === null || this.ggLandingAnim === undefined)) {
                        this.addToGoodGuy(target);
                    } else if (!this.ggLandingTween.isRunning && !(this.ggLandingAnim.animations.currentAnim ? this.ggLandingAnim.animations.currentAnim.isPlaying : false)) {
                        this.addToGoodGuy(target);
                    } else {
                        this.goodGuysToLand.push(target);
                    }
                } else {
                    this.addToBadGuy(target);
                }
            });
        };
        let tween = this.game.add.tween(guy)
            .to(
            { y: this.trampoline.y - guy.height / 2 },
            250,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);
        tween.onComplete.add((target: Phaser.Sprite) => {
            if (target.data.guyCount === this.guyCount) {
                setTimeout(() => {
                    this.showTrampoline(false);
                }, 200);
            }
            jumpToTop(target);
        });
    }

    /**
     * This function will get triggered to remove the stacked good guys, when the good guy stack reaches the ring 
     * 
     * 
     * @memberOf SliderGameStateBase
     */
    deleteGGGuys() {
        if (!this.levelFinish) {
            this.ggPointShadow.visible = false;
            this.pointsEarnedGroup.visible = false;
            let ggGuys: any = [];
            let ind = 0;
            this.ggGuysGroup.children.map((ele: Phaser.Sprite, index) => {
                if (ind < this.engine.currentLevel.scoring.starThreshold) {
                    ggGuys.push(ele);
                }
                ind++;
            });

            this.ggUnloadStackAnimation(ggGuys[ggGuys.length - 1].x, ggGuys[ggGuys.length - 1].y, ggGuys[ggGuys.length - 1], ggGuys, ggGuys.length - 1);
            if (this.ggGuysGroup.children.length === 0) {
                this.ggPointShadow.visible = false;
            }
            this.landedGGguys = 0;
        }
    }

    /**
     * This function is used to stack the good guys to left side of the grid when the goodguys touches the trampoline and jump to top
     * 
     * @param guy It contains the Good guy which has to be stack
     * 
     * @memberOf SliderGameStateBase
     */
    addToGoodGuy(guy: Phaser.Sprite) {
        if (this.engine.currentLevel.gridSize == 3) {
            guy.height = this.game.cache.getImage('gg').height;
            guy.width = this.game.cache.getImage('gg').width;
        }
        guy.position.x = this.ggRing.position.x - 20;
        this.ggPoint = (this.ggPoint > this.engine.currentLevel.scoring.starThreshold) ? 0 : this.ggPoint;
        this.ggLandingTween = this.game.add.tween(guy)
            .to(
            { y: (this.ggPointShadow.position.y - guy.height * 0.8) - (this.ggPoint * guy.height) },
            200,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);
        this.ggLandingTween.onComplete.add((target: Phaser.Sprite) => {
            this.ggPointShadow.visible = true;
            guy.visible = false;
            this.tilesFall.play();
            this.ggLandingAnimation(guy.position.x - 50, guy.y - 50, guy);
        });
        this.ggPoint++;
        this.updatePoints(this.engine.gradePointsData.points.getGoodGuy, this.currentStar);
    }

    /**
     * This function is used to stack the Bad guys to right side of the grid when the badguy touches the trampoline and jump to top
     * 
     * @param guy It contains the Bad guy which has to be stack
     * 
     * @memberOf SliderGameStateBase
     */
    addToBadGuy(guy: Phaser.Sprite) {
        if (this.engine.currentLevel.gridSize == 3) {
            guy.height = this.game.cache.getImage('bg').height;
            guy.width = this.game.cache.getImage('bg').width;
        }
        guy.position.x = this.bgRing.position.x - 20;
        let tween = this.game.add.tween(guy)
            .to(
            { y: (this.ggPointShadow.position.y - guy.height * 0.8) - (this.bgPoint * guy.height) },
            100,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);

        if (this.bgPoint < this.engine.currentLevel.scoring.loseThreshold) {
            tween.onComplete.add((target: Phaser.Sprite) => {
                this.bgPointShadow.visible = true;
                guy.visible = false;
                this.tilesFall.play();
                this.bgLandingAnimation(guy.position.x - 50, guy.y - 50, guy);
            });
            this.bgPoint++;
        }


    }

    /**
     * This method will call the loadAssets method at the completion of video tutorial 
     * 
     * 
     * @memberOf SliderGameStateBase
     */
    update() {
        if (this.tutorialVideo !== undefined) {
            if (Math.round(this.tutorialVideo.progress * 100) >= 100) {
                this.videoField.destroy();
                this.videoTutorialSprite.destroy();
                this.tutorialVideo.destroy();
                this.loadingScreen.destroy();
                 this.loadStart('');
                 this.loadValidGridtextImages();
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
     * This method will get triggered when the user view the game in wrong orientation (i.e portrait mode)
     * 
     * @memberOf SliderGameStateBase
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
     * @memberOf SliderGameStateBase
     */
    handleCorrect() {
        this.orientationInstruction.destroy();
        this.orientationInstruction = null;
        this.game.paused = false;
    }

    /**
     * This method will initilize the game variables which are used to start or restart the game
     * 
     * @memberOf SliderGameStateBase
     */
    initGame() {
        this.gameOverDisplay = false;
        this.gameFinish = false;
        this.gamePoints = 0;
        this.gameScore = 0;
        this.levelFinish = false;
        this.currentLevelStar = 0;
        this.gamePause = false;
        this.gameOverGroup = null;
        this.alertBox = null;
        this.ggPoint = 0;
        this.bgPoint = 0;
        this.pointsCount = 0;
        this.tilesClicked = 0;
        this.guyCount = 0;
        this.ggImage = 'gg';
        this.bgImage = 'bg';
        this.tileImage = 'tiles';
        this.hatchImage = 'hatches';
        this.hatchFrame = 'hatch4x4'
        this.tileMargin = 25;
        this.redSlideSnabSoundPlayed = false;
        this.greenSlideSnabSoundPlayed = false;
        this.selectedTilePair = [];
        this.totalStackedGoodGuys = 0;
        this.removeGGguys = false;
        this.landedGGguys = 0;
        this.sliderHeight = 80;
        this.goodGuysToLand = [];
        this.ggLandingTween = null;
        this.ggLandingAnim = null;
        this.ggGuysGroup = null;
        this.bgGuysGroup = null;
        this.loadAssetCalled = 0;
        this.gridValidTilesTextLoadCount = -1;
        this.sliderValueParamsImageLoadCount = -1;
        this.endVideo = undefined;
        clearTimeout(this.tweenInterval);
    }

    /**
     * This method will create the UI buttons.
     * 
     * @memberOf SliderGameStateBase
     */
    initGameUIButtons() {
        // To add home button
        this.homeButton = this.game.add.sprite(30, 50, 'UI', 'btn_home0000');
        this.homeButton.inputEnabled = true;
        this.homeButton.input.useHandCursor = true;
        this.homeButton.events.onInputDown.add(() => {
            this.gamePause = true;
            this.secondClickSound.play();
            this.createAlertBox();
        });

        // To add audio button
        this.soundButton = this.game.add.sprite(this.homeButton.x + this.homeButton.width + 22, (50 + this.homeButton.height) / 2 - 32, 'UI', 'btn_sound_ON0000');
        this.soundButton.inputEnabled = true;
        this.soundButtonToggle();
        this.soundButton.input.useHandCursor = true;
        this.soundButton.events.onInputDown.add(function () {
            this.game.sound.mute = !this.game.sound.mute;
            this.initParams.audiomute = this.game.sound.mute;
            this.soundButtonToggle();
        }, this);

        // To add reward stars' background
        this.rewardGroup = this.game.add.group();
        let rewardBG = this.game.add.sprite(0, 0, 'UI', 'star_bar0000');
        this.rewardGroup.add(rewardBG);

        // To add reward stars
        let rewardStarsGroup = this.game.add.group();
        let startLeftMargin = 8;
        let starScale = 0.45;
        let totalWidth = 0;
        this.levelStars = [];
        let shadowStars = [];
        let mask = [];
        for (let i = 0; i < 3; i++) {
            this.levelStars[i] = this.game.add.group();
            let star = this.game.add.sprite(0, 0, 'UI', 'star_slot0000');
            this.levelStars[i].x = i *
                (startLeftMargin + (star.width * starScale));
            totalWidth += this.levelStars[i].x;
            star.scale.set(starScale);
            star.anchor.set(0.5, 0.5);
            shadowStars[i] = this.game.add.sprite(0, 0, 'Star_Mask');
            shadowStars[i].width = star.width;
            shadowStars[i].height = star.height;
            shadowStars[i].anchor.set(0.5, 0.5);

            //	A mask is a graphics object
            mask[i] = this.game.add.graphics(0, 0);
            mask[i].beginFill(0xffffff);
            mask[i].drawRect(-star.width / 2, -star.height / 2, star.width, star.height);
            shadowStars[i].mask = mask[i];
            mask[i].y = (star.height * (100 - 0)) / 100;
            this.levelStars[i].add(mask[i]);
            this.levelStars[i].add(star);
            this.levelStars[i].add(shadowStars[i]);
            rewardStarsGroup.add(this.levelStars[i]);
        }

        totalWidth = totalWidth - startLeftMargin;
        rewardStarsGroup.x = 90;
        rewardStarsGroup.y = rewardBG.height / 2 - 15;
        this.rewardGroup.add(rewardStarsGroup);
        this.rewardGroup.x = this.BASE_GAME_WIDTH - rewardBG.width;
        this.rewardGroup.y = 0;

        // To add points board
        this.pointsGroup = this.game.add.group();
        let point_board = this.game.add.sprite(0, 0, 'point_board');
        let point_cup = this.game.add.sprite(0, 0, 'cup');
        point_board.position.x = 40;
        point_board.position.y = 0;
        this.pointsText = this.game.add.bitmapText(
            0,
            0,
            'AP_Black',
            '' + this.gamePoints, 50);
        this.pointsText.tint = 0xFFFFFF;
        this.pointsText.x = point_board.width / 2 - this.pointsText.width / 2;
        this.pointsText.y = point_board.height / 2 - this.pointsText.height / 2 - 10;
        point_board.addChild(this.pointsText);
        this.pointsGroup.add(point_board);
        this.pointsGroup.add(point_cup);
        this.pointsGroup.x = this.BASE_GAME_WIDTH - this.pointsGroup.width;
        this.pointsGroup.y = this.rewardGroup.y + rewardBG.height;
        this.gameWrapper.add(this.pointsGroup);


        // To show earned points when the user selects the right pair
        this.pointsEarnedGroup = this.game.add.group();
        this.pointsEarnedBackground = this.game.add.sprite(0, 0, 'points_background');
        this.pointsEarnedBackground.anchor.setTo(0.5);
        this.pointsEarnedText = this.game.add.bitmapText(
            0,
            0,
            'AP_Black',
            '10', 50);
        this.pointsEarnedText.anchor.setTo(0.5);
        this.pointsEarnedGroup.add(this.pointsEarnedBackground);
        this.pointsEarnedGroup.add(this.pointsEarnedText);
        this.pointsEarnedGroup.visible = false;
        this.introMusic.play();
    }

    /**
     * This method will clear alert box
     * 
     * @memberOf SliderGameStateBase
     */
    createAlertBox() {
        if (this.alertBox !== null) {
            this.alertBox.visible = true;
            return;
        }
        this.alertBox = this.game.add.group();

        let graphics_bg = this.game.add.graphics(0, 0);
        graphics_bg.beginFill(0x000000, 0.4);
        graphics_bg.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);
        graphics_bg.endFill();

        let background = this.game.add.sprite(0, 0, graphics_bg.generateTexture());
        background.inputEnabled = true;
        background.input.priorityID = 2;
        graphics_bg.destroy();
        this.alertBox.add(background);

        let alertBoxBG = this.game.add.sprite(0, 0, 'Confirm_Popup');
        alertBoxBG.scale.set(0.8, 0.8);
        alertBoxBG.x = this.BASE_GAME_WIDTH / 2 - alertBoxBG.width / 2;
        alertBoxBG.y = this.BASE_GAME_HEIGHT / 2 - alertBoxBG.height / 2;
        this.alertBox.add(alertBoxBG);
        console.log(this.initParams.commontext)
        let alertMessage = this.game.add.bitmapText(0, 0, 'AP_Black', this.initParams.commontext.popup_quit, 64);
        alertMessage.align = 'center';
        alertMessage.tint = 0x000000;
        alertMessage.x = alertBoxBG.x + alertBoxBG.width / 2 - alertMessage.width / 2;
        alertMessage.y = alertBoxBG.y + 201.6;
        this.alertBox.add(alertMessage);

        let cancelBtn = this.game.add.sprite(0, 0, 'UI', 'btn_cancel0000');
        cancelBtn.scale.set(0.8);
        cancelBtn.x = alertBoxBG.x + alertBoxBG.width / 2 - cancelBtn.width - 43;
        cancelBtn.y = alertMessage.y + alertMessage.height + 128;
        cancelBtn.inputEnabled = true;
        cancelBtn.input.useHandCursor = true;
        cancelBtn.input.priorityID = 2;
        cancelBtn.events.onInputDown.add(() => {
            // cancel press
            this.secondClickSound.play();
            this.gamePause = false;
            this.alertBox.visible = false;
        });
        this.alertBox.add(cancelBtn);

        let confirmBtn = this.game.add.sprite(0, 0, 'UI', 'btn_confirm0000');
        confirmBtn.scale.set(0.8);
        confirmBtn.x = alertBoxBG.x + alertBoxBG.width / 2 + 43;
        confirmBtn.y = cancelBtn.y;
        confirmBtn.inputEnabled = true;
        confirmBtn.input.useHandCursor = true;
        confirmBtn.input.priorityID = 2;
        confirmBtn.events.onInputDown.add(() => {
            this.secondClickSound.play();
            // confirm yes
            setTimeout(() => {
                if (this.alertBox !== null) this.alertBox.visible = false;
                this.gamePause = true;
                this.gameFinish = true;
                this.initGame();
                this.initParams.animationCheck = false;
                this.gotoMenu();
            }, 100);
        });
        this.alertBox.add(confirmBtn);
    }

    /**
     * This method updates the points on points board, when the Good Guy kills the Bad Guy
     * 
     * @memberOf SliderGameStateBase
     */
    updatePoints(points: number, star: number) {
        this.gamePoints += points;
        this.gameScore += star;
        this.pointsText.setText('' + this.gamePoints);
        this.pointsText.x = this.pointsGroup.width / 2 - this.pointsText.width / 2;
        this.rewardsUpdate();
    }

    /**
     * This method will animate the reward star
     * 
     * @param star It contains star sprite to animate
     * 
     * @memberOf SliderGameStateBase
     */
    rewardStarAnimate(star: any, i: number) {
        this.starSplash[i].play();
        star.frameName = 'star0000';
        star.scale.set(0.8);
        star.width = star.width * 1.0;
        star.height = star.height * 1.0;
        this.game.add.tween(star)
            .to(
            {
                width: star.width * 0.45,
                height: star.height * 0.45,
            },
            200,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);
    }

    /**
     * This method will update the level stars
     */
    rewardsUpdate() {
        if (this.levelFinish) return;

        let rewardsThreshold = this.engine.getStarThreshold();
        let totalPointsSoFar = 0;
        for (let i = this.currentLevelStar; i < rewardsThreshold.length; i++) {
            if (this.gameScore >= rewardsThreshold[i]) {
                totalPointsSoFar = rewardsThreshold[i];
                this.rewardStarAnimate(this.levelStars[i].children[1], i);
                this.ggPoint = 0;
                this.currentLevelStar++;
                this.updatePoints(this.engine.gradePointsData.points.earnStar, 0);
            }
        }

        for (let i = 0; i < this.currentLevelStar; i++) {
            if (this.gameScore >= rewardsThreshold[i]) {
                totalPointsSoFar = rewardsThreshold[i];
            }
            this.levelStars[i].children[0].alpha = 0.005;
            this.levelStars[i].children[2].alpha = 0.005;
        }

        if (this.currentLevelStar >= 3) {
            this.currentLevelStar = 2;
            this.levelFinish = true;
        }

        // For progression star UI
        let percent = Math.abs(this.gameScore - totalPointsSoFar) / (rewardsThreshold[this.currentLevelStar] - totalPointsSoFar) * 100;

        // To update level progress
        let sprite: any = this.levelStars[0].children[0];
        let calcY = (sprite.height * (100 - percent)) / 100;

        // For progress tween animation
        if (this.starTween !== null) {
            this.starTween.stop();
        }
        this.starTween = this.game.add.tween(this.levelStars[this.currentLevelStar].children[0])
            .to(
            { y: calcY },
            100,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);

        this.starTween.onComplete.add((target: any) => {

            if (this.levelFinish) {
                this.gameFinish = true;
                setTimeout(() => {
                    this.gameOverScreen();
                }, 1600);

            }
        });

    }

     /**
      * This function is used to add end video to the game if the user the win the final level of the game
      * 
      * @memberof SliderGameStateBase
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
        if(this.game.device.desktop) {
            this.endVideo.onComplete.addOnce(()=>{
                this.endVideoField.destroy();
                this.endVideoSprite.destroy();
                this.endVideo.destroy();
                this.game.cache.removeVideo('end_animation');
                this.gotoMenu();
            });
        }

        if(!this.game.device.desktop) {
            this.endVideo.currentTime = 0;
            this.endVideo.play();
        }
    }

    /**
     * This method will design the game over screen
     * 
     * @memberOf SliderGameStateBase
     */
    gameOverScreen() {
        if (this.gameOverDisplay) {
            return;
         }
        this.gameOverDisplay = true;

        let levelIndx = this.levelIndex;
        let congratText:Phaser.BitmapText;
        if(((levelIndx+1) == this.engine.gameJSON.levelData.length) && this.currentLevelStar >=1) {
            this.addEndVideo();
        }
                this.pointsEarnedGroup.visible = false;
                // To check level stars
                this.currentLevelStar = (this.levelFinish && this.currentLevelStar === 2) ? 3 : this.currentLevelStar;

                if (this.gameOverGroup !== null) {
                    this.gameOverGroup.destroy();
                }

                if (this.levelFinish) {
                    this.ggToHappyBgToSad();
                } else {
                    this.ggToSadBgToHappy();
                }

                this.gameOverGroup = this.game.add.group();
                let rectangleGroup = this.game.add.group();

                this.gameOverGroup.y = 85;

                let graphics_bg = this.game.add.graphics(0, 0);
                graphics_bg.beginFill(0x000000, 0.4);
                graphics_bg.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);
                graphics_bg.endFill();

                let background = this.game.add.sprite(0, -85, graphics_bg.generateTexture());
                background.inputEnabled = true;
                background.input.priorityID = 2;
                graphics_bg.destroy();
                this.gameOverGroup.add(background);

                this.rectangleBG = this.game.add.sprite(0, 0, 'GameOver_Popup');
                rectangleGroup.x = this.BASE_GAME_WIDTH / 2 - this.rectangleBG.width / 2;
                rectangleGroup.y = this.BASE_GAME_HEIGHT + 150;

                let ribbonGroup = this.game.add.group();
                let ribbonLeft = this.game.add.sprite(0, 0, 'UI', 'ribbon0000');
                let ribbonRight = this.game.add.sprite(0, 0, 'UI', 'ribbon0000');
                ribbonRight.anchor.setTo(.5, 1);
                ribbonRight.scale.x = -1;
                ribbonRight.x = this.rectangleBG.width + 34.6;
                ribbonRight.y = ribbonRight.height;
                ribbonGroup.x = ribbonRight.width / 3.65;
                ribbonGroup.y = -ribbonRight.height / 4;
                ribbonGroup.add(ribbonLeft);
                ribbonGroup.add(ribbonRight);
                rectangleGroup.add(this.rectangleBG);
                rectangleGroup.add(ribbonGroup);

                let star_width = 225;
                let star_height = 217;
                let star_margin = -10;
                let stars: Array<Phaser.Sprite>;
                let stars_group = this.game.add.group();
                let stars_slot_group = this.game.add.group();
                let totalWidth: number = 0;
                stars = [];
                for (let i = 0; i < 3; i++) {
                    stars[i] = this.game.add.sprite(i * (star_width + star_margin), 0, 'UI', 'star0000');
                    stars[i].width = star_width;
                    stars[i].height = star_height;
                    stars[i].anchor.set(0.5, 0.5);
                    stars[i].scale.set(1.5, 1.5);
                    stars[i].alpha = 0.005;
                    if (i === 0 || i === 2) {
                        stars[i].y = 80;
                    }
                    stars_group.add(stars[i]);
                }
                totalWidth = 3 * (star_width + star_margin) - star_margin;
                stars_group.x = totalWidth / 2;
                stars_group.y = ribbonGroup.y + star_height / 2 + 10;

                let stars_slot = [];
                for (let i = 0; i < 3; i++) {
                    stars_slot[i] = this.game.add.sprite(0, 0, 'UI', 'star_slot0000');
                    stars_slot[i].anchor.set(0.5, 0.5);
                    stars_slot[i].position.copyFrom(stars[i].position);
                    stars_slot_group.add(stars_slot[i]);
                }
                stars_slot_group.position.copyFrom(stars_group.position);

                rectangleGroup.add(stars_slot_group);
                rectangleGroup.add(stars_group);

                let textGroup = this.game.add.group();
                let scoreText = this.game.add.bitmapText(0, 0, 'AP_Black', this.initParams.commontext.game_score, 60);
                scoreText.x = this.rectangleBG.width / 2 - scoreText.width / 2;
                let scorePoints = this.game.add.bitmapText(0, 0, 'AP_Black', '' + this.gamePoints, 100);
                scorePoints.y = scoreText.y + scoreText.height;
                scorePoints.x = this.rectangleBG.width / 2 - scorePoints.width / 2;
                let bestScoreText = this.game.add.bitmapText(0, 0, 'AP_Black', this.initParams.commontext.game_bestscore2, 60);
                bestScoreText.y = scorePoints.y + scorePoints.height + 40;
                bestScoreText.x = this.rectangleBG.width / 2 - bestScoreText.width / 2;
                this.bestScorePoints = this.game.add.bitmapText(0, 0, 'AP_Black', '' + this.gamePoints, 100);

                this.newTextGroup = this.game.add.group();
                let newTextLabel = this.game.add.bitmapText(0, 0, 'AP_Black', this.initParams.commontext.game_bestscore1, 48);
                newTextLabel.tint = 0xFFFFFF;
                let labelBG = this.game.add.graphics(0, 0);
                labelBG.beginFill(0xf85721);
                labelBG.moveTo(0, 0);
                labelBG.drawRoundedRect(0, 0, 140, 55, 10);
                let labelBGSprite = this.game.add.sprite(0, 0, labelBG.generateTexture());
                newTextLabel.x = labelBGSprite.width / 2 - newTextLabel.width / 2;
                newTextLabel.y = 3;
                labelBGSprite.addChild(newTextLabel);
                this.newTextGroup.add(labelBGSprite);
                this.newTextGroup.x = bestScoreText.x - labelBGSprite.width - 10;
                this.newTextGroup.y = bestScoreText.y;
                this.newTextGroup.visible = false;
                labelBG.destroy();

                this.bestScorePoints.y = bestScoreText.y + bestScoreText.height;
                this.bestScorePoints.x = this.rectangleBG.width / 2 - this.bestScorePoints.width / 2;
                textGroup.y = ribbonLeft.height - 150;
                scoreText.tint = scorePoints.tint = bestScoreText.tint = this.bestScorePoints.tint = 0x000000;
                textGroup.add(scoreText);
                textGroup.add(scorePoints);
                textGroup.add(bestScoreText);
                textGroup.add(this.bestScorePoints);
                textGroup.add(this.newTextGroup);
                rectangleGroup.add(textGroup);

                let replayButton = this.game.add.sprite(0, stars_group.height, 'UI', 'btn_again0000');
                replayButton.x = 108;
                replayButton.y = this.rectangleBG.height - replayButton.height - 44;
                replayButton.inputEnabled = true;
                replayButton.input.useHandCursor = true;
                replayButton.input.priorityID = 2;
                let index = this.levelIndex;

                if(((index+1) == this.engine.gameJSON.levelData.length) && this.currentLevelStar >=1) {
                    replayButton.visible = false;
                }
                replayButton.events.onInputDown.add(() => {
                    this.secondClickSound.play();
                    this.gameOverGroup.destroy();
                    this.initGame();
                    this.game.state.restart(true, false);
                });
                rectangleGroup.add(replayButton);
                let nextButton = replayButton;
                this.setLevelInfo(true);
                if (this.currentLevelStar >= 1) {
                    this.gameWin.play();
                    nextButton = this.game.add.sprite(0, stars_group.height, 'UI', 'btn_next0000');
                    nextButton.x = replayButton.x + replayButton.width + 40;
                    nextButton.y = replayButton.y;
                    nextButton.inputEnabled = true;
                    nextButton.input.useHandCursor = true;
                    nextButton.input.priorityID = 2;
                    let levelIndex=  this.levelIndex;
                    nextButton.events.onInputDown.add(() => {
                        this.secondClickSound.play();
                        this.levelIndex++;
                        this.gameOverGroup.destroy();
                        this.removeGameUIListeners();
                 if(this.levelIndex == this.engine.gameJSON.levelData.length) {
                     this.playEndAnimation();
                 } else {
                     this.removeEndVideo();
                     this.initGame();
                     this.game.state.restart(true, false);
                 }
                });
                rectangleGroup.add(nextButton);
                } else {
                    this.gameLoss.play();
                }

                let isLastLevel:boolean=false;
                let levelStar = this.currentLevelStar;
                let levelIndex=this.levelIndex;
                if((levelIndex+1) == this.engine.gameJSON.levelData.length) {
                    isLastLevel = true;
                }
                if((isLastLevel && levelStar < 1) || !isLastLevel) {
                    let homeButton = this.game.add.sprite(0, nextButton.y + nextButton.height,
                        'UI', 'btn_home0000');
                    homeButton.x = replayButton.x + (2 * replayButton.width) + 80;
                    homeButton.y = replayButton.y + (nextButton.height / 2 - homeButton.height / 2);
                    homeButton.inputEnabled = true;
                    homeButton.input.useHandCursor = true;
                    homeButton.input.priorityID = 2;
                    homeButton.events.onInputDown.add(() => {
                        this.secondClickSound.play();
                        let isLastLevel:boolean=false;
                        let levelIndex=this.levelIndex;
                    setTimeout(() => {
                        this.gameOverGroup.destroy();
                        this.initGame();
                        this.initParams.animationCheck = true;
                        this.gotoMenu();
                    }, 100);
                });
                rectangleGroup.add(homeButton);
                }

                let starIndex = 0;
                let animateStar = (star: Phaser.Sprite) => {
                    if (starIndex >= 3 || this.currentLevelStar === 0) {
                        return;
                    }
                    this.starSplash[starIndex].play();
                    stars[starIndex].alpha = 1;
                    let tween = this.game.add.tween(star)
                        .to(
                        {
                            width: star_width,
                            height: star_height
                        },
                        250,
                        null,
                        true, 0, 0, false);

                    tween.onComplete.add((target: any) => {
                        starIndex++;
                        if (starIndex < this.currentLevelStar) {
                            animateStar(stars[starIndex]);
                        }
                    });
                };

                let popupShown = false;
                let tweenGamePopup = (rg: Phaser.Group) => {
                    popupShown = true;
                    let rgTween = this.game.add.tween(rg)
                        .to(
                        {
                            y: this.BASE_GAME_HEIGHT / 2 - this.rectangleBG.height / 2
                        },
                        250,
                        null,
                        true, 0, 0, false);

                    rgTween.onComplete.add((target: any) => {
                        animateStar(stars[starIndex]);
                    });
                };

                if (this.currentLevelStar > 0) {
                    if (!popupShown) {
                        tweenGamePopup(rectangleGroup);
                    }
                } else {
                    if (!popupShown) {
                        tweenGamePopup(rectangleGroup);
                    }
                }

        if(this.initParams.assignmentMode !== -1 && (this.initParams.assignmentLevelId === this.levelID) && this.currentLevelStar >= 1) {
             scoreText.x += 230;
             scorePoints.x += 230;
             this.newTextGroup.x=scoreText.x+10;
             bestScoreText.x += 230;
             bestScoreText.y += 70;
             this.bestScorePoints.x += 230;
             this.bestScorePoints.y += 70;
           
           // congratText = this.game.add.bitmapText( this.newTextGroup.x-370,  this.newTextGroup.y+230, 'HMHMath', this.wrapText("Assignment Done!", 11), 85);

           congratText = this.game.add.bitmapText(this.newTextGroup.x - 370, this.newTextGroup.y + 230, 'HMHMath', this.wrapText(this.initParams.commontext.assignment_done, 11), 85);

            congratText.tint = 0x000;
            congratText.align = "center"
            congratText.anchor.setTo(0.5,0);
            congratText.tint = 0xfb5606;
            congratText.smoothed = true;
            
            congratText.rotation = -.25;
            congratText.visible  = false;
           let congTween = this.game.add.tween(congratText)
           congratText.scale.set(3,3);
           let congratTween=this.game.add.tween(congratText.scale).to( { x: 1, y: 1 },1000, Phaser.Easing.Bounce.Out,true,2,1, false);
           congratTween.onRepeat.add(()=>{
               this.game.time.events.add(500,()=>{
                     congratText.visible  = true;
               }, this);

           }, this);
            rectangleGroup.add(congratText);
        }
           this.gameOverGroup.add(rectangleGroup);
    }


     /**
     * This function is used to align the 'Assignment Done' message.
     * 
     * @param text  It contains the text to display.
     * @param maxChars It contains maximum number of character allowed per line. 
     * @returns 
      * @memberof SliderGameStateBase
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
  * This function is used to play the end video when the player won the final level of the game
  * 
  * @memberof SliderGameStateBase
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
     * This method gets triggered when the screen size is changed
     * 
     * @memberOf SliderGameStateBase
     */
    resizeGame() {
        let w = window.innerWidth,
            h = window.innerHeight;

        if (this.prevWindowWidth === w && this.prevWindowHeight === h) return;

        if (w >= h * this.WHRATIO) {
            this.gameHeight = h;
            this.gameWidth = h * this.WHRATIO;

        } else {
            this.gameWidth = w;
            this.gameHeight = w / this.WHRATIO;
        }

        this.prevWindowWidth = w;
        this.prevWindowHeight = h;

        this.scaleRate = this.gameHeight / this.BASE_GAME_HEIGHT;
        this.game.scale.setUserScale(this.scaleRate, this.scaleRate);
    }

    /**
     * This function is used to toggle the sound button ON and OFF
     * 
     * 
     * @memberOf SliderGameStateBase
     */
    soundButtonToggle() {
        if (this.initParams.audiomute) {
            this.soundButton.frameName = 'btn_sound_OFF0000';
        } else {
            this.soundButton.frameName = 'btn_sound_ON0000';
        }
    }


    /**
     * This function is used to set the user level completion information for Data persistence
     * 
     * 
     * @memberOf SliderGameStateBase
     */
    setLevelInfo(gameOver: boolean) {
        let levelData = this.engine.gameJSON.levelData;
        this.levelIndex = Number(levelData.map(function (x: any) { return x.id; }).indexOf(this.levelID));
        let star: number = 0;
        let points: number = 0;
        let completed: boolean;
        let levelInfos = this.userDataServiceCAS.gameUserData.GameInfo.levelInfos;

        if (levelInfos[this.levelIndex] !== undefined && levelInfos[this.levelIndex] !== null) {
            star = levelInfos[this.levelIndex].awardInfo.stars < this.currentLevelStar ? this.currentLevelStar : levelInfos[this.levelIndex].awardInfo.stars;
            if (levelInfos[this.levelIndex].awardInfo.score < this.gamePoints) {
                points = this.gamePoints;
                if (gameOver) {
                    this.newTextGroup.visible = true;
                    this.bestScorePoints.setText(points.toString());
                }
            } else {
                points = levelInfos[this.levelIndex].awardInfo.score;
                if (gameOver) {
                    this.bestScorePoints.setText(points.toString());
                    this.bestScorePoints.x = this.rectangleBG.width / 2 - this.bestScorePoints.width / 2;
                }
            }

            if (levelInfos[this.levelIndex].completed) {
                completed = true;
            } else {
                completed = this.currentLevelStar > 0 ? true : false;
            }
        } else {
            star = this.currentLevelStar;
            points = this.gamePoints;
            completed = this.currentLevelStar > 0 ? true : false;
            this.newTextGroup.visible = true;
        }

        levelInfos[this.levelIndex] = {
            levelId: this.levelID,
            completed: completed,
            awardInfo: {
                score: points,
                stars: star
            }
        }
        this.userDataServiceCAS.saveGameUserData(levelInfos, this);
    }

    /**
     * This function is used for return back to the Dynamic Menu
     * 
     * @memberOf SliderGameStateBase
     */
    gotoMenu() {
        this.lastVideoPath = null;
        this.game.load.onLoadStart.remove(this.loadStart, this);
        this.game.load.onFileComplete.remove(this.fileComplete, this);
        this.game.load.onLoadComplete.remove(this.createGameUI, this);
        this.game.load.onFileError.remove(this.fileError, this);
        this.game.state.clearCurrentState();
        this.game.state.start('DynamicMenu', true, false, [this.initParams, this.animIndex, this.levelID, this.engine.gameJSON.levelData.length]);
    }

    /**
     * 
     * This function is used to load the tutorial video
     * @param vidName It contains the tutorial video file name
     * 
     * @memberOf SliderGameStateBase
     */
    loadtutorialVideo(videoName: string) {
        this.loadingVideo = true;
        this.game.load.onLoadStart.add(this.loadStart, this);
        this.game.load.onLoadComplete.add(this.loadComplete, this);
        this.game.load.onFileError.add(this.fileError, this);
        this.game.load.atlas('UI', 'assets/images/gym_UI.png', 'assets/data/gym_UI.json');
        this.game.load.video('tutorialVideo', `assets/videos/${videoName}`);
        this.game.load.start();
        this.tutorialVideoSource = "";
    }

    /**
    * This function is used to remove file loading listeners 
    * 
    * @memberOf FunctionMatchGameStateBase
    */
    removeGameUIListeners() {
        this.game.load.onLoadStart.remove(this.loadStart, this);
        this.game.load.onFileComplete.remove(this.fileComplete, this);
        this.game.load.onLoadComplete.remove(this.createGameUI, this);
        this.game.load.onFileError.remove(this.fileError, this);
    }

    /**
     * call back method that send the success or failure status for the data saved, required action can be taken in the 
     * method based on its response
     */
    userDataServiceCallBack(userData: any, success?: boolean) {
        if (success) {
            console.log("Data saved succesfully..");
        } else {
            console.log("Data not saved...")
        }
    }

    /**
     * This function is used to open the hatches when the Good guy or Bad guy reaches the bottom of the grid
     * 
     * @param x It conatins X position of the hatch to open
     * @param y It conatins Y position of the hatch to open
     * @param column It conatins the column number from which the guy comes.
     * 
     * @memberOf SliderGameStateBase
     */
    hatchesAnimation(x: number, y: number, column: number) {
        let hatchesAnimation = this.game.add.sprite(0, 0, this.hatchImage);
        hatchesAnimation.anchor.set(0, 0.5);
        hatchesAnimation.x = x;
        hatchesAnimation.y = y;
        hatchesAnimation.animations.add(this.hatchImage);
        hatchesAnimation.animations.currentAnim.onComplete.add(() => {
            this.hatches.children[column].visible = true;
        });
        hatchesAnimation.animations.play(this.hatchImage, 10, false, true);
    }

    /**
     * This function is used to play landing animation when the Good Guys are fell down to the left of the Grid
     * 
     * @param x It contains X position of the landed Goodguy
     * @param y It contains Y position of the landed Goodguy
     * @param goodGuy It contains landed GoodGuy
     * 
     * @memberOf SliderGameStateBase
     */
    ggLandingAnimation(x: number, y: number, goodGuy: Phaser.Sprite) {
        this.ggLandingAnim = this.game.add.sprite(0, 0, 'ggLanding');
        this.ggLandingAnim.x = x;
        this.ggLandingAnim.y = y;
        this.ggLandingAnim.animations.add('ggLanding');
        this.ggLandingAnim.animations.currentAnim.onComplete.add(() => {
            this.ggToHappyBgToSad();
            setTimeout(() => {
                if (!this.levelFinish && this.bgGuysGroup.length < this.engine.currentLevel.scoring.loseThreshold) {
                    this.goodGuyBadGuyToIdle();
                }
            }, 1000);

            this.landedGGguys++;
            this.pointsEarnedTween(goodGuy.worldPosition.x + (goodGuy.width / 2), goodGuy.worldPosition.y + (goodGuy.height / 2), goodGuy.height, this.engine.gradePointsData.points.getGoodGuy, true);
            goodGuy.visible = true;
            this.goodGuysToLand = _.without(this.goodGuysToLand, goodGuy);

            if (this.ggGuysGroup.children.length >= this.engine.currentLevel.scoring.starThreshold && this.landedGGguys == this.engine.currentLevel.scoring.starThreshold) {
                this.removeGGguys = true;
            }
        });
        this.ggLandingAnim.animations.play('ggLanding', 10, false, true);
    }

    /**
     * This function is used to play the landing animation when the badguys are fell down to right of the grid
     * 
     * @param x It contains X position of the landed Badguy
     * @param y It contains Y position of the landed Badguy
     * @param badGuy It contains the landed Badguy
     * 
     * @memberOf SliderGameStateBase
     */
    bgLandingAnimation(x: number, y: number, badGuy: Phaser.Sprite) {
        let bgLandingAnimation = this.game.add.sprite(0, 0, 'bgLanding');
        bgLandingAnimation.x = x;
        bgLandingAnimation.y = y;
        bgLandingAnimation.animations.add('bgLanding');
        bgLandingAnimation.animations.currentAnim.onComplete.add(() => {
            badGuy.visible = true;
            //To change all good guys to sad and all bad guys to smile 
            this.ggToSadBgToHappy();
            setTimeout(() => {
                if (this.bgGuysGroup.length < this.engine.currentLevel.scoring.loseThreshold && !this.levelFinish) {
                    this.goodGuyBadGuyToIdle();
                } else {
                    this.gameOverScreen();
                }
            }, 500);
        });
        bgLandingAnimation.animations.play('bgLanding', 10, false, true);
    }

    /**
     * This function is used to generate the text to display on the grid
     * 
     * @param tile It contains the tile to which text need to Add
     * @returns It returns the generated text
     * 
     * @memberOf SliderGameStateBase
     */
    getGridTilesText(tile: any): any {
        let text: any;
        let type:string='grid';
        text = this.game.add.sprite(0, 0, '');
    if(!this.game.cache.checkImageKey(`${type}${tile.latexUrl}`)) {
        latextopngconverter(tile.latexUrl, {scale: tile.valueType == 2 ?3:4, fill:'#FFFFFF'}, (output: any)=> {
        text.data.image = new Image();
        text.data.image.src = output.img;
        text.data.image.onload = () => {
            if (text.data.image !== undefined) {
                this.game.cache.addImage(`${type}${tile.latexUrl}`, text.data.image.src, text.data.image);
                 let tmpImage = this.game.add.sprite(0, 0,`${type}${tile.latexUrl}`);
                text.texture = tmpImage.generateTexture();
                tmpImage.destroy();
                };
        }
    });
        } else {
                let tmpImage = this.game.add.sprite(0, 0,`${type}${tile.latexUrl}`);
                text.texture = tmpImage.generateTexture();
                tmpImage.destroy();
        }
        return text;
    }

    /**
     * This function is used to alert the user when they select the right pair in wrong order
     * 
     * @param sprite It contains the animation sprite
     * 
     * @memberOf SliderGameStateBase
     */
    wrongOrderPairAlertTween(sprite: Phaser.Sprite) {
        let firstTween = this.game.add.tween(sprite)
            .to(
            { width: this.wrongOrderPairAlertSize.width, height: this.wrongOrderPairAlertSize.height },
            200,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);
        firstTween.onComplete.add((target: Phaser.Sprite) => {
            this.wrongPairSound.play();
            setTimeout(() => {
                let secondTween = this.game.add.tween(sprite)
                    .to(
                    { width: this.wrongOrderPairAlertSize.width + 50, height: this.wrongOrderPairAlertSize.height + 50 },
                    200,
                    Phaser.Easing.Linear.None,
                    true, 0, 0, false);
                secondTween.onComplete.add((target: Phaser.Sprite) => {
                    let thirdTween = this.game.add.tween(sprite)
                        .to(
                        { width: 50, height: 50 },
                        200,
                        Phaser.Easing.Linear.None,
                        true, 0, 0, false);
                    thirdTween.onComplete.add((target: Phaser.Sprite) => {
                        this.wrongOrderPairAlert.visible = false;
                    });
                });
            }, 500);
        });
    }

    /**
     * This function is used to display and tween earned points every time the user earning points
     * 
     * @param x It contains starting X position of the text
     * @param y It contains starting Y position of the text
     * @param height It contains the height of the tile
     * @param points It contains the last earned point by the user
     * @param isGoodGuy It specify the points is earned through stacking a goodguy or not
     * 
     * @memberOf SliderGameStateBase
     */
    pointsEarnedTween(x: number, y: number, height: number, points: number, isGoodGuy: boolean) {
        this.pointsEarnedGroup.x = x;
        this.pointsEarnedGroup.y = y;
        this.pointsEarnedText.setText(points.toString());
        this.pointsEarnedGroup.visible = true;
        let tween = this.game.add.tween(this.pointsEarnedGroup)
            .to(
            { y: y - (height / 2) },
            800,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);

        tween.onStart.add((target: Phaser.Sprite) => {
            if (isGoodGuy) {
                setTimeout(() => {
                    if (this.ggGuysGroup.children.length >= this.engine.currentLevel.scoring.starThreshold && this.removeGGguys && !this.levelFinish && this.bgGuysGroup.children.length < this.engine.currentLevel.scoring.loseThreshold) {
                        this.deleteGGGuys();
                        this.removeGGguys = false;

                    } else if (this.goodGuysToLand.length > 0 && !this.levelFinish && this.bgGuysGroup.children.length < this.engine.currentLevel.scoring.loseThreshold) {
                        this.addToGoodGuy(this.goodGuysToLand[0]);
                    }
                }, 300);
            }
        });

        tween.onComplete.add((target: Phaser.Sprite) => {
            this.pointsEarnedGroup.visible = false;
        });
    }

    /**
     * This function is used to find out the number of combo tiles selected by the user
     * 
     * @param selectedTilePair It contains the tiles selected by the user
     * @returns It returns the number of combo tiles selected
     * 
     * @memberOf SliderGameStateBase
     */
    selectedComboTileCount(selectedTilePair: any) {
        let count = 0;
        for (let k = 0; k < selectedTilePair.length; k++) {
            if (selectedTilePair[k].data.type == 'col' || selectedTilePair[k].data.type == 'row') {
                count++;
            }
        }
        return count;
    }

    /**
     * This function is used to play animation when deleting the stacked goodguys
     * 
     * @param x It contains X position of the animation to play
     * @param y It contains Y position of the animation to play
     * @param goodGuy It contains the gooodguy to delete
     * @param ggGuys It contains the goodguys to remove
     * @param index It contains the index of goodguy to delete
     * 
     * @memberOf SliderGameStateBase
     */
    ggUnloadStackAnimation(x: number, y: number, goodGuy: Phaser.Sprite, ggGuys: any, index: number) {
        let ggUnloadStackAnimation = this.game.add.sprite(0, 0, 'ggLanding');
        ggUnloadStackAnimation.width = goodGuy.width;
        ggUnloadStackAnimation.height = goodGuy.height;
        ggUnloadStackAnimation.x = x;
        ggUnloadStackAnimation.y = y;
        ggUnloadStackAnimation.animations.add('ggLanding');
        let i = index;
        ggUnloadStackAnimation.animations.currentAnim.onStart.add(() => {
            this.goodGuyUnloadAudio.play();
            goodGuy.visible = false;
            setTimeout(() => {
                i = i - 1;
                if (i >= 0) {
                    this.ggUnloadStackAnimation(ggGuys[i].x, ggGuys[i].y, ggGuys[i], ggGuys, i);
                } else {
                    if (this.goodGuysToLand.length > 0) {
                        this.addToGoodGuy(this.goodGuysToLand[0]);
                    }
                }
                let tween = this.game.add.tween(ggUnloadStackAnimation)
                    .to(
                    { x: -250, y: ggUnloadStackAnimation.y - goodGuy.height },
                    200,
                    Phaser.Easing.Linear.None,
                    true, 0, 0, false);

                tween.onComplete.add((target: Phaser.Sprite) => {
                    goodGuy.destroy();
                    target.destroy();
                });

            }, 100);

        });
        ggUnloadStackAnimation.animations.play('ggLanding', 10, false, false);
    }

    /**
     * This function is used to change the face reaction from sad/happy to Idle state for all Goodguys,Badguys in grid and stack  
     * 
     * @memberOf SliderGameStateBase
     */
    goodGuyBadGuyToIdle() {
        let ggSprite = this.game.add.sprite(0, 0, `${this.ggImage}`);
        for (let i = 0; i < this.ggGuysGroup.children.length; i++) {
            let goodGuy: any = this.ggGuysGroup.getChildAt(i);
            goodGuy.setTexture(ggSprite.generateTexture());
        }

        let bgSprite = this.game.add.sprite(0, 0, `${this.bgImage}`);
        for (let i = 0; i < this.bgGuysGroup.children.length; i++) {
            let badGuy: any = this.bgGuysGroup.getChildAt(i);
            badGuy.setTexture(bgSprite.generateTexture());
        }

        for (let j = 0; j < this.tilesContainer.children.length; j++) {
            let spriteGroup: any = this.tilesContainer.getChildAt(j);
            for (let k = 0; k < spriteGroup.children.length; k++) {
                let sprite: any = spriteGroup.getChildAt(k);
                if (sprite.data.type == 'goodguy') {
                    sprite.setTexture(ggSprite.generateTexture());
                }
                if (sprite.data.type == 'badguy') {
                    sprite.setTexture(bgSprite.generateTexture());
                }
            }
        }
        bgSprite.destroy();
        ggSprite.destroy();
    }

    /**
     * This function is used to change the face reaction of all Goodguys to sad and all Badguys to happy.
     * 
     *@memberOf SliderGameStateBase
     */
    ggToSadBgToHappy() {
        let ggSprite = this.game.add.sprite(0, 0, `${this.ggImage}_sad`);
        for (let i = 0; i < this.ggGuysGroup.children.length; i++) {
            let goodGuy: any = this.ggGuysGroup.getChildAt(i);
            goodGuy.setTexture(ggSprite.generateTexture());
        }

        let bgSprite = this.game.add.sprite(0, 0, `${this.bgImage}_happy`);
        for (let i = 0; i < this.bgGuysGroup.children.length; i++) {
            let badGuy: any = this.bgGuysGroup.getChildAt(i);
            badGuy.setTexture(bgSprite.generateTexture());
        }

        for (let j = 0; j < this.tilesContainer.children.length; j++) {
            let spriteGroup: any = this.tilesContainer.getChildAt(j);
            for (let k = 0; k < spriteGroup.children.length; k++) {
                let sprite: any = spriteGroup.getChildAt(k);
                if (sprite.data.type == 'goodguy') {
                    sprite.setTexture(ggSprite.generateTexture());
                }
                if (sprite.data.type == 'badguy') {
                    sprite.setTexture(bgSprite.generateTexture());
                }
            }
        }
        bgSprite.destroy();
        ggSprite.destroy();
    }

    /**
     * This function is used to change the face reaction of all Goodguys to happy and all Badguys to sad.
     * 
     *@memberOf SliderGameStateBase
     */
    ggToHappyBgToSad() {
        let ggSprite = this.game.add.sprite(0, 0, `${this.ggImage}_happy`);
        for (let i = 0; i < this.ggGuysGroup.children.length; i++) {
            let goodGuy: any = this.ggGuysGroup.getChildAt(i);
            goodGuy.setTexture(ggSprite.generateTexture());
        }

        let bgSprite = this.game.add.sprite(0, 0, `${this.bgImage}_sad`);
        for (let i = 0; i < this.bgGuysGroup.children.length; i++) {
            let badGuy: any = this.bgGuysGroup.getChildAt(i);
            badGuy.setTexture(bgSprite.generateTexture());
        }

        for (let j = 0; j < this.tilesContainer.children.length; j++) {
            let spriteGroup: any = this.tilesContainer.getChildAt(j);
            for (let k = 0; k < spriteGroup.children.length; k++) {
                let sprite: any = spriteGroup.getChildAt(k);
                if (sprite.data.type == 'badguy') {
                    sprite.setTexture(bgSprite.generateTexture());
                }
                if (sprite.data.type == 'goodguy') {
                    sprite.setTexture(ggSprite.generateTexture());
                }
            }
        }
        bgSprite.destroy();
        ggSprite.destroy();
    }

    /**
     * This function will get triggered to play the feedback audio when the user selects pair of tiles
     * 
     * @param count It contains number of combo tiles get selected 
     * @memberof SliderGameStateBase
     */
    playValidPairOrComboSound(count:number) {
          if (count > 0) {
                    this.comboTileSound.play();
            } else {
                    this.validPairSound.play();
            }
    }

    /**
     * This function will get triggered to display height value of the slider(if the slider type is 'Areamodel').
     * 
     * @param slider It contains current properties of the slider
     * @memberof SliderGameStateBase
     */
    addSliderHeightText(slider:any) {
        let graphic = this.game.add.graphics(0, 0);
        let type='slider';
            graphic.beginFill(0x443932, 1);
            graphic.drawRoundedRect(0, 0, 120, this.redSlide.height, 15);
            let textSize = slider.height.type == 2 ? '90' : '50';
            let textScale = slider.height.type == 2 ? 2 : 4;
            graphic.endFill();
            this.ratioHeight = this.game.add.sprite(-100, 0, graphic.generateTexture());
            let heigtText: any;
            heigtText = this.game.add.sprite(0, 0, '');
            let text = slider.height.latexParam; 
       if(!this.game.cache.checkImageKey(`${type}${text}`)) {
            latextopngconverter(`${text}`, {scale: textScale, fill:'#FFFFFF'}, (output: any)=> {
            heigtText.data.image = new Image();
            heigtText.data.image.src = output.img;
            heigtText.data.image.onload = () => {
                if (heigtText.data.image !== undefined) {
                    this.game.cache.addImage(`${type}${text}`, heigtText.data.image.src, heigtText.data.image);
                    let tmpImage = this.game.add.sprite(0, 0, `${type}${text}`);
                    heigtText.texture = tmpImage.generateTexture();
                    heigtText.position.x = (this.ratioHeight.width - 20) / 2 - heigtText.width / 2;
                    heigtText.position.y = (this.ratioHeight.height) / 2 - heigtText.height / 2;
                    tmpImage.destroy();
                };
            }

            heigtText.data.image.onerror = () => {
                console.log('image loading failed');
            };
        });
       } else {
             let tmpImage = this.game.add.sprite(0, 0,`${type}${text}`);
             heigtText.texture = tmpImage.generateTexture();
             heigtText.position.x = (this.ratioHeight.width - 20) / 2 - heigtText.width / 2;
             heigtText.position.y = (this.ratioHeight.height) / 2 - heigtText.height / 2;
             tmpImage.destroy();
       }
            this.ratioHeight.addChild(heigtText);
            graphic.destroy();
    }

    /**
     * This function is used to get the image from mathjax.
     * 
     * @param tile It contains object/string to pass to mathjax function.
     * @param callback It contains a callBack function that will be get triggered once the image is loaded
     * @param type It denotes for which going to get either for Gridtiles or slider
     * @memberof SliderGameStateBase
     */
    getGridTextImages(tile: any, callback: any,type:string){
        let inputString:any;
        let scale:any;
        if(type == 'grid') {
            inputString = tile.latexUrl;
            scale =  tile.valueType == 2 ? 3 : 4;
        } else if(type == 'slider') {
            inputString = tile;
            scale =  tile.toString().includes('frac') ? 2 : 3;
            if (this.engine.currentLevel.slider.total.type == 3) {
                inputString = `${inputString}\\text %`;
            }
        }
        latextopngconverter(inputString, {scale: scale, fill:'#FFFFFF'}, (output: any)=> {
        let image = new Image();
        image.src = output.img;
        image.onload = () => {
            if (image !== undefined) {
                this.game.cache.addImage(`${type}${inputString}`, image.src, image);
            }
            callback();
        };
        image.onerror = () => {
            console.log('image loading failed');
        };
          });
    }

    /**
     * This function is used to load the Grid value images before the game UI starts to display 
     * 
     * @memberof SliderGameStateBase
     */
    loadValidGridtextImages() {
     this.gridValidTilesTextLoadCount = -1;
     let callBack = () => {
            this.gridValidTilesTextLoadCount++;
            if (this.gridValidTilesTextLoadCount == (this.engine.validPairs.length * 2)-1) {
             this.loadSliderTextImages();
            } 
        };
        
        for(let i = 0 ;i < this.engine.validPairs.length;i++) {
            let validPairs = this.engine.validPairs[i];
                    this.getGridTextImages(validPairs.left,callBack,'grid');
        }

        for(let i = 0 ;i < this.engine.validPairs.length;i++) {
            let validPairs = this.engine.validPairs[i];
                    this.getGridTextImages(validPairs.right,callBack,'grid');
        }
    }

    /**
     * This function is used to load the slider value images
     * 
     * @param valueParams It contains the array of string that are to be shown as images when the moves the slider knob
     * @memberof SliderGameStateBase
     */
    loadSliderTextImages() {
        let callBack = () => {
          this.sliderValueParamsImageLoadCount++;
          if(this.sliderValueParamsImageLoadCount == (this.engine.sliderValueParams.length * 2) - 1) {
             if(this.engine.currentLevel.sliderType == 'Ratio') {
                  this.loadAssets();
             } else {
                 this.loadSliderHeightImage();
             }
           
          }
      }; 
     for(let i = 0 ;i < this.engine.sliderValueParams.length;i++) {
        let valueParam = this.engine.sliderValueParams[i];
            this.getGridTextImages(valueParam.left,callBack,'slider');
        }

    for(let i = 0 ;i < this.engine.sliderValueParams.length;i++) {
        let valueParam = this.engine.sliderValueParams[i];
                this.getGridTextImages(valueParam.right,callBack,'slider');
        }
    }

    /**
     * This function is used to load the image that is used to display the slider height value
     * 
     * @memberof SliderGameStateBase
     */
    loadSliderHeightImage() {
        let callBack = () => {
             this.loadAssets();
        }; 
        this.getGridTextImages(this.engine.currentLevel.slider.height.latexParam ,callBack,'slider');
    }

      /**
       * This function is used to destroy the end video and its background settings to play.
       * 
       * @memberof SliderGameStateBase
       */
      removeEndVideo() {
        if(typeof this.endVideo !== 'undefined' && typeof this.endVideo !== null && !this.game.device.android) {
                this.endVideoField.destroy();
                this.endVideoSprite.destroy();
                this.endVideo.destroy();
        }
    }

      /**
       * This function is used to update the assignment level ID
       * 
       * @memberof SliderGameStateBase
       */
      updateAssignModeAndLevelID() {
        if(this.initParams.assignmentMode !== -1 && this.initParams.assignmentLevelId === -1){
            this.initParams.assignmentLevelId = this.levelID;
        }
    }
}
