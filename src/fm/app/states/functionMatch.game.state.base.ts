import { FunctionMatchGameEngine } from '../engine/functionMatch.engine';
import { GameUserData } from "../../../shared/engine/game.user.data.service";
declare var latextopngconverter: any;
/**
 * @class FunctionMatchGameStateBase
 */
export abstract class FunctionMatchGameStateBase extends Phaser.State {

    /**
     * Variables for Game UI
     */
    homeButton: Phaser.Sprite;
    soundButton: Phaser.Sprite;
    rewardGroup: Phaser.Group;
    levelStars: Array<Phaser.Group>;
    starFilled: Phaser.Sprite;
    pointsGroup: Phaser.Group;
    pointsText: Phaser.BitmapText;
    alertBox: Phaser.Group = null;
    nextTouched = false;
    /**
     * Variable for bad guys group
     */
    badGuysColumn: Phaser.Group;
    BadGuysMarchingTween: Phaser.Tween = null;
    baseLineTween: Phaser.Tween = null;
    badGuyImage: any;
    starTween: Phaser.Tween = null;

    /**
     * Variable to hold invisible base line
     */
    baseLine: Phaser.Sprite;
    baseLineAnim: Phaser.Sprite;

    /**
     * Variables for function card and variable card groups
     */
    functionCards: Phaser.Group;
    variableCards: Phaser.Group;

    /**
     * Variable for ghost card
     */
    ghostCard: Array<Phaser.Sprite> = [];

    /**
     * Variable for equation area
     */
    equationAreaGroup: Phaser.Group;
    equationArea: Phaser.Sprite;
    textGroup: Phaser.Group;
    equationText: any;
    equationAreaWrong: Phaser.Sprite;
    equationAreaFalseImage: Phaser.Sprite;

    /**
     * Variable to store wrong orientation information screen
     */
    orientationInstruction: Phaser.Group = null;

    /**
     * Varibale to store game over screen.
     */
    gameOverGroup: Phaser.Group = null;

    /**
     * Variable card background's Y position
     */
    benchYPos: number = 0;

    /**
     * variables for game data.
     */
    levelID: string = null;
    levelIndex: number = 0;
    gamePoints: number = 0;
    levelFinish: boolean = false;
    gamePause: boolean = false;
    pointsPerBG: number = 10;
    matchCount: number = 0;
    currentLevelStar: number = 0;
    tweenInterval: any;
    lastKillValue: any = [];
    badGuyNoNeedAt: any = [];

    PointBoardTextStyle = {
        fontSize: 53,
        fill: 0xFFFFFF
    };
    PointBoardHeadTextStyle = {
        fontSize: 54,
        fill: 0xFFFFFF
    };
    EquationAreaTextStyle = {
        fontSize: 62,
        fill: 0xFFFFFF
    };
    variableCardTextStyle: any = {
        fontSize: 56,
        fill: 0xB45E00
    };
    FunctionCardTextStyle = {
        fontSize: 56,
        fill: 0xFFFFFF
    };
    BadGuyCardTextStyle = {
        fontSize: 48,
        fill: 0xFFFFFF
    };

    /**
     *  Variable for badguy last row 
     */
    badGuyLastRow: number = 0;

    /**
     * Variable for data engine 
     */
    engine: FunctionMatchGameEngine.EngineBase;

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
     * Used to store the user level info data object
     */
    userDataServiceCAS: GameUserData.gameUserDataService;

    /**
     * Used to store the url parameters
     */
    urlMode: any = null;

    /**
     * Variables used to store loading screen data
     */
    loadingScreen: Phaser.Sprite;
    loadingText: Phaser.BitmapText;

    /**
    * Variables used to store loading error data
    */
    loadError: Phaser.Sprite;
    loadErrorGroup: Phaser.Group;
    loadErrorFlag: boolean = false;

    /**
     * Variable to indicate countdown finished or not
     */
    counDownFinish: boolean = false;

    /**
     * Variable used to store initial data
     */
    initParams: any;

    /**
     * Variable used to store the parent class
     */
    gameData: any;

    /**
     * Variables related to play video tutorials
     */
    tutorialVideoSource: string;
    loadingVideo: boolean;
    videoField: Phaser.Graphics;
    protected shadowLine: number = 1;
    tutorialVideo: Phaser.Video;
    protected videoTutorialSprite: any;
    lastVideoPath: string = null;

    /**
    * Variable used to store the variable card drag enable interval
    */
    enableSpriteInterval: any = null;

    /**
    * Variable used to play the audios
    */
    popSound: Phaser.Sound;
    badGuysComesIn: Phaser.Sound;
    whistle: Phaser.Sound;
    punch: Array<Phaser.Sound> = [];
    goodGuyPopup: Phaser.Sound;
    countDownAudio: Phaser.Sound;
    starSplash: Array<Phaser.Sound> = [];
    wrongAnswer: Phaser.Sound;
    punchCombo: Phaser.Sound;

    gameLoss: Phaser.Sound;
    gameWin: Phaser.Sound;
    introMusic: Phaser.Sound;
    finalMusic: Phaser.Sound;

    animIndex: number;
    newTextGroup: Phaser.Group;
    bestScorePoints: Phaser.BitmapText;
    rectangleBG: Phaser.Sprite;
    Fn_Bg_Image: Phaser.Image;

    /**
    * Variable used to store count of function card and variable card text images
    */
    Fn_card_load_count: number = 0;
    Var_card_load_count: number = 0;

    /**
    * Variable used to store the function card and variable card data which are getting from the engine
    */
    VariableCardToShow: any = null;
    FunctionCardToShow: any = null;

    /**
    * Variable used to store the default variable card image
    */
    defaultVarCardImage: any = null;

    /**
    * Variable used to store the maximum width of the current variable cards
    */
    varCardMaxWidth: number;
    BG_CharacterType: String;

    /**
     * Variable used to store reward related asset
     */
    championCup: Phaser.Sprite;

    /**
    * Variable used to store Badguy boss cache key
    */
    BGbossKey: String;

    /**
    * Variable used to the state of home button clicked or not
    */
    homeButtonClicked: boolean = false;

    /**
     * Variable used to store the bad guy image height
     */
    badGuyHeight: number;

    countDownBgGroup: Phaser.Group;

    /**
    * Variables used to check cache availability
    */
    fontsToLoad: Array<string> = [];
    imagesToLoad: Array<string> = [];
    audiosToLoad: Array<string> = [];
    jsonToLoad: Array<string> = [];
    assetsLoaded: boolean = false;
    loadAssetCalled: number = 0;
    indexLevel: number = 0;
    playBtn: Phaser.Sprite;
    videosToLoad: Array<string> = [];


    /**
     * 
     * Variables used to play end animation
     * @memberof DynamicMenu
     */
    endVideo: Phaser.Video;
    endVideoField: Phaser.Graphics;
    endVideoSprite: any;
    playEndVideo: boolean;
    isFinalLevelCompleted: boolean = false;
    gameOverDisplay: boolean = false;

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

        if (params) {
            this.initParams = params[1];
            this.initParams.playIntroVideo = false;
            this.userDataServiceCAS = this.initParams.userDataServiceCAS;
            this.urlMode = this.initParams.urlParams;
            this.gameData = this.initParams.parent;
            this.animIndex = params[2];
            this.indexLevel = params[0];
        }
    }

    /**
     * This method will check for the availability of tutorial video. If the video exist, it will load tutorial video, if not, it will call a function to load assets.
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    preload() {
        this.tutorialVideoSource = "";
        let tutorialVideo = this.engine.getTutorialVideo();
        if (tutorialVideo !== null && this.lastVideoPath !== tutorialVideo && this.urlMode.video == true) {
            this.loadingVideo = true;
            this.lastVideoPath = this.tutorialVideoSource = tutorialVideo;
            this.loadtutorialVideo(this.tutorialVideoSource);
        } else {
            this.loadingVideo = false;
            this.loadAssets();
        }
    }
    /**
     * Loading the game assets
     */
    loadAssets() {
        if (!this.assetsLoaded) {
            /* To load fonts */
            this.game.load.bitmapFont('Frutiger', 'assets/fonts/FrutigerLTStdBlack.png', 'assets/fonts/FrutigerLTStdBlack.fnt');
            this.game.load.bitmapFont("HMHMath", "assets/fonts/AvenirPrimaryHMHMath-Bold.png", "assets/fonts/AvenirPrimaryHMHMath-Bold.fnt");

            /* To load football background field */
            this.game.load.image('BackgroundField', 'assets/images/field.png');

            /* To load bench image background for variable and function card */
            this.game.load.image('Bench_BG', 'assets/images/bench.png');
            this.game.load.image('Equation_area_BG', 'assets/images/goal_area.png');

            /* To load variable card and function card background */
            this.game.load.image('FunctionCard_BG9', 'assets/images/fn_hover.png');
            this.game.load.image('FunctionCard_BG', 'assets/images/fn_normal.png');
            this.game.load.image('VariableCard_BG', 'assets/images/card.png');
            this.game.load.image('VariableCard_BG_WIDE', 'assets/images/card_wide.png');
            this.game.load.image('Star_Mask', 'assets/images/star_mask.png');
            if(this.initParams.urlParams.lang == 'es'){
                this.game.load.image('Combo_Points', 'assets/images/combo_es.png');
            }else{
                this.game.load.image('Combo_Points', 'assets/images/combo.png');
            }
            
            this.game.load.image('Equation_False', 'assets/images/false.png');
            this.game.load.image('Orientation_Wrong', 'assets/images/portrait_screen.png');

            /* To load result equation background */
            this.game.load.image('ResultArea_BG', 'assets/images/result_area.png');

            /* To load Bad guys image */
            this.game.load.atlas('BadGuy_Square', 'assets/images/BG_square.png', 'assets/data/BG_square.json');
            this.game.load.atlas('BadGuy_Long', 'assets/images/BG_long.png', 'assets/data/BG_long.json');
            this.game.load.atlas('BadGuy_Wide', 'assets/images/BG_wide.png', 'assets/data/BG_wide.json');

            /* To load Bad guy boss images */
            this.game.load.atlas('BadGuy_Square_Boss', 'assets/images/BG_boss_square.png', 'assets/data/BG_boss_square.json');
            this.game.load.atlas('BadGuy_Square_Boss_Start', 'assets/images/BG_boss_square_start.png', 'assets/data/BG_boss_square_start.json');
            this.game.load.atlas('BadGuy_Long_Boss', 'assets/images/BG_boss_long.png', 'assets/data/BG_boss_long.json');
            this.game.load.atlas('BadGuy_Long_Boss_Start', 'assets/images/BG_boss_long_start.png', 'assets/data/BG_boss_long_start.json');
            this.game.load.atlas('BadGuy_Wide_Boss', 'assets/images/BG_boss_wide.png', 'assets/data/BG_boss_wide.json');
            this.game.load.atlas('BadGuy_Wide_Boss_Start', 'assets/images/BG_boss_wide_start.png', 'assets/data/BG_boss_wide_start.json');

            /* To load footbal Good guy */
            this.game.load.image('Good_Guy', 'assets/images/football_GG.png');

            /* To good guy win animation */
            this.game.load.atlasJSONHash('Good_Guy_Win', 'assets/images/hit_animation.png', 'assets/data/hit_animation.json');

            // points background
            this.game.load.image('Points_BG', 'assets/images/point_background.png');
            this.game.load.image('cup', 'assets/images/cup.png');

            // game over
            this.game.load.image('GameOver_Popup', 'assets/images/popup.png');
            //count down
            if(this.initParams.urlParams.lang == 'es'){
                this.game.load.atlasJSONHash('countdown', 'assets/images/countdown_es.png', 'assets/data/countdown_es.json');
            }else{
                this.game.load.atlasJSONHash('countdown', 'assets/images/countdown.png', 'assets/data/countdown.json');
            }
            

            //Seperate audio files loading
            this.game.load.audio('new_pop_Gb2', 'assets/audios/new_pop_Gb2.mp3');
            this.game.load.audio('bg_comes_in', 'assets/audios/bg_falls.mp3');
            this.game.load.audio('whistle', 'assets/audios/generic_whistle_HI_V2.mp3');
            this.game.load.audio('hitsound0', 'assets/audios/punch_Eb.mp3');
            this.game.load.audio('hitsound1', 'assets/audios/punch_F.mp3');
            this.game.load.audio('hitsound2', 'assets/audios/punch_G.mp3');
            this.game.load.audio('hitsound3', 'assets/audios/punch_Ab.mp3');
            this.game.load.audio('hitsound4', 'assets/audios/punch_Bb.mp3');
            this.game.load.audio('gg_popup', 'assets/audios/fast_whoosh_G2_eq.mp3');
            this.game.load.audio('countDown', 'assets/audios/bendy_A3.mp3');
            this.game.load.audio('star_game', 'assets/audios/star_Cmaj.mp3');
            this.game.load.audio('star_splash', 'assets/audios/Star_Fmaj9.mp3');
            this.game.load.audio('punch_combo', 'assets/audios/vibraphone_delay_chord.mp3');
            this.game.load.audio('wrong_answer', 'assets/audios/bendy_A3.mp3');
            this.game.load.audio('game_loss', 'assets/audios/brass_lose_march24.mp3');
            this.game.load.audio('game_win', 'assets/audios/brass_win_march31.mp3');
            this.game.load.audio('intro_music', 'assets/audios/Afro_brazilian_intro.mp3');
            this.game.load.audio('final_music', 'assets/audios/Afro_Brazilian_Fun_FINAL_MUSIC_march24.mp3');

            //Video file loading
            this.game.load.video('end_animation', 'assets/video/ending_animation.mp4');

            if (this.audiosToLoad.length == 0) {
                this.audiosToLoad.push('new_pop_Gb2');
                this.audiosToLoad.push('bg_comes_in');
                this.audiosToLoad.push('whistle');
                this.audiosToLoad.push('hitsound0');
                this.audiosToLoad.push('hitsound1');
                this.audiosToLoad.push('hitsound2');
                this.audiosToLoad.push('hitsound3');
                this.audiosToLoad.push('hitsound4');
                this.audiosToLoad.push('gg_popup');
                this.audiosToLoad.push('countDown');
                this.audiosToLoad.push('star_game');
                this.audiosToLoad.push('star_splash');
                this.audiosToLoad.push('punch_combo');
                this.audiosToLoad.push('wrong_answer');
                this.audiosToLoad.push('game_loss');
                this.audiosToLoad.push('game_win');
                this.audiosToLoad.push('intro_music');
                this.audiosToLoad.push('final_music');
            }

            if (this.imagesToLoad.length == 0) {
                this.imagesToLoad.push('BackgroundField');
                this.imagesToLoad.push('Bench_BG');
                this.imagesToLoad.push('Equation_area_BG');
                this.imagesToLoad.push('FunctionCard_BG9');
                this.imagesToLoad.push('FunctionCard_BG');
                this.imagesToLoad.push('VariableCard_BG');
                this.imagesToLoad.push('VariableCard_BG_WIDE');
                this.imagesToLoad.push('Star_Mask');
                this.imagesToLoad.push('Combo_Points');
                this.imagesToLoad.push('Equation_False');
                this.imagesToLoad.push('Orientation_Wrong');
                this.imagesToLoad.push('ResultArea_BG');
                this.imagesToLoad.push('Good_Guy');
                this.imagesToLoad.push('Points_BG');
                this.imagesToLoad.push('cup');
                this.imagesToLoad.push('GameOver_Popup');
            }

            if (this.fontsToLoad.length == 0) {
                this.fontsToLoad.push('Frutiger');
                this.fontsToLoad.push('HMHMath');
            }

            if (this.jsonToLoad.length == 0) {
                this.jsonToLoad.push('BadGuy_Square');
                this.jsonToLoad.push('BadGuy_Long');
                this.jsonToLoad.push('BadGuy_Wide');
                this.jsonToLoad.push('BadGuy_Square_Boss');
                this.jsonToLoad.push('BadGuy_Square_Boss_Start');
                this.jsonToLoad.push('BadGuy_Long_Boss');
                this.jsonToLoad.push('BadGuy_Long_Boss_Start');
                this.jsonToLoad.push('BadGuy_Wide_Boss');
                this.jsonToLoad.push('BadGuy_Wide_Boss_Start');
                this.jsonToLoad.push('Good_Guy_Win');
                this.jsonToLoad.push('countdown');
            }

            if (this.videosToLoad.length == 0) {
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
     * This function will get triggered when the game starts to load assets
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    loadStart() {
        this.loadingScreen = this.game.add.sprite(0, 0, "splashscreen");
        this.loadingText = this.game.add.bitmapText(1000, 740, "Frutiger", this.getLocalizedText("fm_loading"), 40);
        this.loadingText.setText(this.getLocalizedText("fm_tutorial"));
        
        this.loadingText.anchor.setTo(0.5);
        this.loadingText.tint = 0xffffff;
        this.game.world.bringToTop(this.loadingText);
    }

    /**
     * This function will get triggered if there is an error while loading game assets
     * 
     * @memberOf FunctionMatchGameStateBase
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

        let alertMessage = this.game.add.bitmapText(0, 0, 'Frutiger', this.getLocalizedText("fm_errormsg"), 64);
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
     * @memberOf FunctionMatchGameStateBase
     */
    fileComplete(progress: number, cacheKey: string, success: boolean, totalLoaded: number, totalFiles: number) {
        this.loadingText.setText(`${progress}%`);
    }

    /**
     * This function will get triggered at the completion of tutorial loading process
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    loadComplete() {
        if (this.loadingVideo && !this.loadErrorFlag) {
            this.loadingScreen.destroy()
            this.videoField = this.game.add.graphics(0, 0);
            this.videoField.lineStyle(this.shadowLine, 0x000000, 0);
            this.videoField.beginFill(0x6FC5CA);
            this.videoField.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);
            this.loadingVideo = false;
            this.tutorialVideo = this.game.add.video('tutorialVideo');
            this.videoTutorialSprite = this.tutorialVideo.addToWorld(150, 100);
            this.videoTutorialSprite.width = this.videoField.getBounds().width / 1.2;
            this.videoTutorialSprite.height = this.videoField.getBounds().height / 1.2;
            this.playBtn = this.game.add.sprite(0, 0, 'UI', 'btn_play');
            this.playBtn.x = this.tutorialVideo.width / 2 - this.playBtn.width / 2;
            this.playBtn.y = this.tutorialVideo.height / 2 - this.playBtn.height / 2 - 50;
            this.videoTutorialSprite.addChild(this.playBtn);
            this.videoField.addChild(this.videoTutorialSprite);
            this.game.world.bringToTop(this.videoField);
            this.playBtn.inputEnabled = true;
            this.playBtn.input.useHandCursor = true;
            this.playBtn.events.onInputDown.add(() => {
                this.playBtn.visible = false;
                this.tutorialVideo.play(false);
                this.videoTutorialSprite.events.onInputDown.add((e: any) => {
                    this.videoField.destroy();
                    this.videoTutorialSprite.destroy();
                    this.tutorialVideo.destroy();
                    this.loadAssets();
                });
            })

            if (this.game.device.desktop) {
                this.playBtn.visible = false;
                this.tutorialVideo.play(false);
                this.videoTutorialSprite.inputEnabled = true;
                this.videoTutorialSprite.events.onInputDown.add((e: any) => {
                    this.videoField.destroy();
                    this.videoTutorialSprite.destroy();
                    this.tutorialVideo.destroy();
                    this.loadAssets();
                });
            }
            this.tutorialVideo.play(false);
            this.tutorialVideo.onComplete.add(() => {
            });

            // to disable video click skip make the follwing property false
            this.videoTutorialSprite.inputEnabled = false;
            this.tutorialVideo.onPlay.add((e: any) => {
            });

            if (this.game.device.android) {
                let touch: any = this.game.input.touch;
                touch.addTouchLockCallback(() => {
                    this.playBtn.visible = false;
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
                this.loadAssets();
            }), true);

            this.game.cache.removeVideo("tutorialVideo");
            this.resizeGame();
        } else {
            this.loadingVideo = false;
            this.loadAssets();
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
     * It return text as per json key from the language(common) json
     *  @param 'key'  string
     */
    getLocalizedText(key: string) {
        if (this.initParams.commontext) {
            return this.initParams.commontext[key];
        }
    }

    /**
     * This function is used to create the game UI
     * 
     * @memberOf FunctionMatchGameStateBase
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
                this.popSound = this.game.add.audio('new_pop_Gb2');
                this.badGuysComesIn = this.game.add.audio('bg_comes_in');
                this.whistle = this.game.add.audio('whistle');
                this.punch[0] = this.game.add.audio('hitsound0');
                this.punch[1] = this.game.add.audio('hitsound1');
                this.punch[2] = this.game.add.audio('hitsound2');
                this.punch[3] = this.game.add.audio('hitsound3');
                this.punch[4] = this.game.add.audio('hitsound4');
                this.goodGuyPopup = this.game.add.audio('gg_popup');
                this.countDownAudio = this.game.add.audio('countDown');
                this.starSplash[0] = this.game.add.audio('star_game');
                this.starSplash[1] = this.game.add.audio('star_game');
                this.starSplash[2] = this.game.add.audio('star_splash');

                this.wrongAnswer = this.game.add.audio('wrong_answer');
                this.punchCombo = this.game.add.audio('punch_combo');
                this.gameLoss = this.game.add.audio('game_loss');
                this.gameWin = this.game.add.audio('game_win');
                this.introMusic = this.game.add.audio('intro_music');
                this.finalMusic = this.game.add.audio('final_music');


                // To add nine patch image to the game cache for function card normal and hover
                let ninePatch: any = this.game.cache;
                ninePatch.addNinePatch('Fn_Card_normal', 'FunctionCard_BG', null, 25, 25, 25, 25);
                ninePatch.addNinePatch('Fn_Card_hover', 'FunctionCard_BG9', null, 25, 25, 25, 25);

                // To add game wrapper to so, we can scale wrapper to scale all elements
                this.gameWrapper = this.game.add.group();

                // To add background field
                this.gameWrapper.create(0, 0, 'BackgroundField');

                // To init menu and points buttons
                this.initGameUIButtons();

                // To add bench background
                const benchImage = this.game.cache.getImage('Bench_BG');
                this.benchYPos = this.BASE_GAME_HEIGHT - benchImage.height;
                this.game.add.sprite(0, this.benchYPos, 'Bench_BG');

                /* To create Football Base Line */
                let equationAreaBG = this.game.add.sprite(0, 0, 'Equation_area_BG');
                equationAreaBG.y = this.benchYPos - equationAreaBG.height;
                let baseLineGraphics = this.game.add.graphics(0, 0);
                baseLineGraphics.lineStyle(10, 0xFFFFFF);
                baseLineGraphics.moveTo(0, 0);
                baseLineGraphics.lineTo(this.BASE_GAME_WIDTH, 0);
                this.baseLine = this.game.add.sprite(0, this.benchYPos - equationAreaBG.height - 15,
                    baseLineGraphics.generateTexture());
                this.baseLine.x = -10;
                this.game.physics.enable(this.baseLine, Phaser.Physics.ARCADE);

                // To destroy original baseLineGraphics
                baseLineGraphics.destroy();

                baseLineGraphics = this.game.add.graphics(0, 0);
                baseLineGraphics.lineStyle(10, 0xFF0000);
                baseLineGraphics.moveTo(0, 0);
                baseLineGraphics.lineTo(this.BASE_GAME_WIDTH, 0);
                this.baseLineAnim = this.game.add.sprite(0, this.benchYPos - equationAreaBG.height - 15,
                    baseLineGraphics.generateTexture());
                this.baseLineAnim.x = -10;
                this.baseLineAnim.alpha = 0.005;

                // To destroy original baseLineGraphics
                baseLineGraphics.destroy();

                // To add equation area bg
                this.gameWrapper.add(equationAreaBG);
                this.gameWrapper.add(this.baseLine);

                // To create equation area
                this.equationAreaGroup = this.game.add.group();
                let equationGraphics = this.game.add.graphics(0, 0);
                equationGraphics.lineStyle(1, 0x99cc00);
                equationGraphics.beginFill(0x99cc00);
                equationGraphics.moveTo(0, 0);
                equationGraphics.drawRoundedRect(0, 0, 1000, 136, 10);
                this.equationArea = this.game.add.sprite(0, 0, equationGraphics.generateTexture());
                this.equationAreaGroup.x = this.BASE_GAME_WIDTH / 2 - this.equationArea.width / 2;
                this.equationAreaGroup.y = this.baseLine.y + 36;
                this.textGroup = this.game.add.group();
                this.equationText = this.game.add.bitmapText(
                    0,
                    0,
                    'Frutiger',
                    '',
                    this.EquationAreaTextStyle.fontSize);
                this.equationText.x = this.equationArea.width / 2 - this.equationText.width / 2;
                this.equationText.y = this.equationArea.height / 2 - this.equationText.height / 2;
                this.textGroup.add(this.equationText);

                // To destroy equation graphics
                equationGraphics.destroy();

                equationGraphics = this.game.add.graphics(0, 0);
                equationGraphics.lineStyle(1, 0xFFFFFF);
                equationGraphics.beginFill(0xFFFFFF);
                equationGraphics.moveTo(0, 0);
                equationGraphics.drawRoundedRect(0, 0, 1000, 136, 10);
                this.equationAreaWrong = this.game.add.sprite(0, 0, equationGraphics.generateTexture());
                this.equationAreaFalseImage = this.game.add.sprite(0, 0, 'Equation_False');
                this.equationAreaFalseImage.anchor.set(0.5, 0.5);
                this.equationAreaFalseImage.x = this.equationArea.width / 2;
                this.equationAreaFalseImage.y = this.equationArea.height / 2;
                this.equationAreaFalseImage.data.originalWH = {
                    width: this.equationAreaFalseImage.width,
                    height: this.equationAreaFalseImage.height
                }
                this.equationAreaFalseImage.alpha = 0.005;

                // destroy equation graphics
                equationGraphics.destroy();
                this.equationAreaGroup.add(this.equationAreaWrong);
                this.equationAreaGroup.add(this.equationArea);
                this.equationAreaGroup.add(this.textGroup);
                this.equationAreaGroup.add(this.equationAreaFalseImage);
                this.gameWrapper.add(this.equationAreaGroup);

                // To block the user to click home, audio and drag function cards until countdown animation complete
                this.countDownBgGroup = this.game.add.group();
                let overlayBackground = this.game.add.graphics(0, 0);
                overlayBackground.beginFill(0x000000, 0.4);
                overlayBackground.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);
                overlayBackground.endFill();
                let background = this.game.add.sprite(0, 0, overlayBackground.generateTexture());
                background.inputEnabled = true;
                background.input.priorityID = 2;
                background.alpha = 0.005;
                overlayBackground.destroy();
                this.countDownBgGroup.add(background);

                // To create function cards
                this.generateFunctionCardTextImage();
            }
        }
    }

    /**
     * This method will detect collisions between the Bad guys and the base line and Listens for all video complete event
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    update() {
        //To load assets once video completed
        if (this.tutorialVideo !== undefined) {
            if (Math.round(this.tutorialVideo.progress * 100) >= 100) {
                this.videoField.destroy();
                this.videoTutorialSprite.destroy();
                this.tutorialVideo.destroy();
                this.loadingScreen.destroy();
                this.loadAssets();
            }
        }
        // work only for touch devices for autoplay
        if (!this.game.device.desktop) {
            if (this.endVideo !== undefined) {
                if (this.endVideo.currentTime > 0 && this.endVideoField.visible == false) {
                    if (this.finalMusic.isPlaying) {
                        this.finalMusic.stop();
                    }
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

        if (!this.loadErrorFlag && this.counDownFinish) {
            let isHovered = this.game.physics.arcade.overlap(this.functionCards, this.variableCards, this.variablecardHover, null, this);
            if (!isHovered) {
                for (let i = 0; i < this.functionCards.children.length; i++) {
                    let card: any = this.functionCards.children[i];
                    card.data.frameName = 'bigdoor0000';
                }
                for (let i = this.functionCards.children.length / 3; i < this.functionCards.children.length; i++) {
                    let card: any = this.functionCards.children[i];
                    card.alpha = 0.005;
                }
            }

            // To display red line alert
            if (this.badGuysColumn.children.length >= 1) {
                if (Math.abs(this.baseLine.y - (this.badGuysColumn.getChildAt(0).worldPosition.y + this.badGuyImage.height)) <= this.badGuyImage.height && !this.homeButtonClicked) {
                    if (this.baseLineTween === null) {
                        this.baseLineAnim.alpha = 0.005;
                        this.baseLineTween = this.game.add.tween(this.baseLineAnim).to({ alpha: 1 }, 800, Phaser.Easing.Linear.None, true, 0, -1);
                        this.baseLineTween.yoyo(true, 100);
                    }
                } else {
                    if (this.baseLineTween !== null) this.baseLineTween.stop();
                    this.baseLineAnim.alpha = 0.005;
                    this.baseLineTween = null;
                }
            } else {
                if (this.baseLineTween !== null) this.baseLineTween.stop();
                this.baseLineAnim.alpha = 0.005;
                this.baseLineTween = null;
            }

            this.game.physics.arcade.overlap(this.badGuysColumn, this.baseLine, this.collisionHandler, null, this);
        }
    }

    /**
     * This method will get triggered when the bad guy hits the base line.
     * 
     * @param badGuy It contains the bad guy who hits base line
     * @param line It contains the base line
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    collisionHandler(badGuy: Phaser.Sprite, line: Phaser.Sprite) {
        if (this.gameFinish === false && !this.gameOverDisplay) {
            this.currentLevelStar = (this.levelFinish && this.currentLevelStar === 2) ? 3 : this.currentLevelStar;
            this.whistle.play();
            setTimeout(() => {
                if (this.currentLevelStar < 1) {
                    this.gameLoss.play();
                    this.gameOverScreen();
                } else {
                    this.gameWin.play();
                    this.gameOverScreen();
                }
            }, 400);
            this.gameFinish = true;
            this.baseLineTween.stop();
            this.baseLineAnim.alpha = 0.005;

            // To make bad guys smile 
            if (this.currentLevelStar < 3) {
                for (let i = 0; i < this.badGuysColumn.children.length; i++) {
                    let badGuy: any = this.badGuysColumn.getChildAt(i);
                    if (badGuy.data.isBoss) {
                        let bossSprite = this.game.add.sprite(
                            0, 0,
                            this.BGbossKey, 'boss_happy0000');
                        bossSprite.alpha = 0.005;
                        bossSprite.scale.setTo(2);
                        badGuy.setTexture(bossSprite.generateTexture());
                        bossSprite.destroy();
                    } else {
                        badGuy.frameName = `${this.BG_CharacterType}_happy0000`;
                    }
                }
            } else {
                for (let i = 0; i < this.badGuysColumn.children.length; i++) {
                    let badGuy: any = this.badGuysColumn.getChildAt(i);
                    if (badGuy.data.isBoss) {
                        let bossSprite = this.game.add.sprite(
                            0, 0,
                            this.BGbossKey, 'boss_sad0000');
                        bossSprite.alpha = 0.005;
                        bossSprite.scale.setTo(2);
                        badGuy.setTexture(bossSprite.generateTexture());
                        bossSprite.destroy();
                    } else {
                        badGuy.frameName = `${this.BG_CharacterType}_sad0000`;
                    }
                }
            }
        }
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
     * This method will initilize the game variables which are used to start or restart the game
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    initGame() {
        this.BadGuysMarchingTween = null;
        this.gameFinish = false;
        this.badGuyLastRow = 0;
        this.gamePoints = 0;
        this.matchCount = 0;
        this.lastKillValue = [];
        this.levelFinish = false;
        this.matchCount = 0;
        this.badGuyNoNeedAt = [];
        this.currentLevelStar = 0;
        this.baseLineTween = null;
        this.gamePause = false;
        this.gameOverGroup = null;
        this.alertBox = null;
        this.Fn_card_load_count = 0;
        this.Var_card_load_count = 0;
        this.homeButtonClicked = false;
        this.loadAssetCalled = 0;
        this.gameOverDisplay = false;
        this.endVideo = undefined;
        this.nextTouched = false;

        if (this.homeButton) {
            this.homeButton.destroy();
        }
        clearTimeout(this.tweenInterval);
        clearTimeout(this.enableSpriteInterval);
    }

    /**
     * This method will create the UI buttons.
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    initGameUIButtons() {
        // To add home button
        this.homeButton = this.game.add.sprite(30, 50, 'UI', 'btn_home0000');
        this.homeButton.inputEnabled = true;
        this.homeButton.input.useHandCursor = true;
        this.homeButton.events.onInputDown.add(() => {
            this.homeButtonClicked = true;
            this.gamePause = true;
            this.popSound.play();
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
        let sprite = this.game.add.sprite(0, 0, 'Points_BG');
        this.pointsText = this.game.add.bitmapText(
            0,
            0,
            'Frutiger',
            '' + this.gamePoints, this.PointBoardTextStyle.fontSize);
        this.pointsText.tint = this.PointBoardTextStyle.fill;
        this.pointsText.x = sprite.width / 2 - this.pointsText.width / 2;
        this.pointsText.y = sprite.height / 2 - this.pointsText.height / 2 - 12;
        sprite.addChild(this.pointsText);
        this.pointsGroup.add(sprite);
        this.pointsGroup.x = this.BASE_GAME_WIDTH - this.pointsGroup.width;
        this.pointsGroup.y = this.rewardGroup.y + rewardBG.height - 7;
        this.championCup = this.game.add.sprite(this.pointsGroup.x - 75, this.pointsGroup.y, 'cup');
    }

    /**
     * This method will clear alert box
     * 
     * @memberOf FunctionMatchGameStateBase
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

        let alertMessage = this.game.add.bitmapText(0, 0, 'Frutiger', this.getLocalizedText("popup_quit"), 64);//64
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
            this.popSound.play();
            this.gamePause = false;
            this.alertBox.visible = false;
            this.homeButtonClicked = false;
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
            this.popSound.play();
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
     *  This method is used to create the function cards based on the data received from the game engine
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    createFunctionCards() {
        this.functionCards = this.game.add.group();
        this.functionCards.enableBody = true;
        this.functionCards.physicsBodyType = Phaser.Physics.ARCADE;
        let FunctionCards = this.engine.getFunctionCards();
        let fnCardImage: any = this.getBigFnCard();
        let fnCardMargin = 75;
        let totalWidthofColumn = (FunctionCards.length) * (fnCardImage.width + fnCardMargin);
        totalWidthofColumn = totalWidthofColumn - fnCardMargin;
        for (let cards = 0; cards < FunctionCards.length; cards++) {
            let card = FunctionCards[cards];
            this.functionCards.add(this.createSingleFunctionCard(
                card,
                cards * (fnCardImage.width + fnCardMargin),
                0,
                'FunctionCard_BG',
                this.FunctionCardTextStyle,
                fnCardImage));
        }
        this.functionCards.x = this.BASE_GAME_WIDTH / 2 - totalWidthofColumn / 2;
        this.functionCards.y = this.benchYPos - (fnCardImage.height);
        this.reAlignFunctionCard();
    }

    /**
     * This is method is used to reset width ,height to the largest function card's size of current function cards and realign the position
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    reAlignFunctionCard() {
        let maxWidth = 0;
        let maxHeight = 0;
        let fnCardMargin = 75;
        let length = this.functionCards.length;

        for (let cards = 0; cards < length; cards++) {
            let card: any = this.functionCards.children[cards];
            maxWidth = (maxWidth < card.targetWidth) ? card.targetWidth : maxWidth;
            maxHeight = (maxHeight < card.targetHeight) ? card.targetHeight : maxHeight;
        }

        for (let cards = 0; cards < length; cards++) {
            let card: any = this.functionCards.children[cards];
            card.x = cards * (maxWidth + fnCardMargin);
            this.functionCards.add(this.createSingleFunctionCardHover(card.data.card, card.x, card.y, '', this.FunctionCardTextStyle, this.getBigFnCard()));
        }

        for (let cards = 0; cards < length; cards++) {
            let card: any = this.functionCards.children[cards];
            card.x = cards * (maxWidth + fnCardMargin);
            this.functionCards.add(this.createShadowSprite(card));
        }
        let totalWidthofColumn = (length) * (maxWidth + fnCardMargin);
        totalWidthofColumn = totalWidthofColumn - fnCardMargin;
        this.functionCards.x = this.BASE_GAME_WIDTH / 2 - totalWidthofColumn / 2;
        this.functionCards.y = this.benchYPos - (maxHeight) + 2;
        this.generateVariableCardTextImage();
    }

    /**
     * This method is used to create dummy sprite of function card for hover functionality
     * 
     * @param card It contains function card.
     * @returns It will return function card's shadow sprite.
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    createShadowSprite(card: any): any {
        let graphics = this.game.add.graphics(0, 0);
        graphics.lineStyle(1, 0xFFFFFF);
        graphics.beginFill(0xFFFFFF);
        graphics.moveTo(0, 0);
        graphics.drawRoundedRect(0, 0, card.targetWidth, card.targetHeight, 20);
        let sprite = this.game.add.sprite(card.x, card.y, graphics.generateTexture());
        graphics.destroy();
        sprite.alpha = 0.005;
        sprite.data.card = card.data.card;
        return sprite;
    }

    /**
     * This method is used to create a single function card
     * 
     * @param card It contains function card value and latex string
     * @param x It contains x co-ordinate for the function card
     * @param y It contains y co-ordinate for the function card
     * @param cacheKey It contains phaser cache key of function card background
     * @param textStyle It contains the function card's text style
     * @returns It will return generated function card sprite
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    createSingleFunctionCard(card: any, x: number, y: number, cacheKey: string, textStyle: any, varCard: any): Phaser.Sprite {
        let phaser: any = Phaser;
        let sprite: any = new phaser.NinePatchImage(this.game, x, y, 'Fn_Card_normal');
        sprite.targetWidth = varCard.width;
        sprite.targetHeight = varCard.height;
        sprite.data.originalWH = {
            width: varCard.width,
            height: varCard.height
        };
        sprite.UpdateImageSizes();
        let text: any = this.game.add.sprite(0, 0, `fn${card.cardData.operationSymbolLatex}${card.latexParam}`);
        text.x = (sprite.targetWidth) / 2;
        text.y = sprite.targetHeight / 2;
        text.anchor.set(0.5, 0.5);
        sprite.addChild(text);
        sprite.inputEnabled = true;
        sprite.data.card = card;
        this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.data.originalPosition = sprite.position.clone();
        return sprite;
    }

    /**
     * This function is used to create a single nine patch function card to display while the variable card hover on the function card
     * 
     * @param card It contains function card properties
     * @param x It contains x position of the function card 
     * @param y It contains y position of the function card
     * @param cacheKey It contains cache key of the image
     * @param textStyle It contains the text style
     * @param varCard It contains variable card properties
     * @returns It will return created function card hover sprite
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    createSingleFunctionCardHover(card: any, x: number, y: number, cacheKey: string, textStyle: any, varCard: any): Phaser.Sprite {
        let phaser: any = Phaser;
        let sprite: any = new phaser.NinePatchImage(this.game, x, y, 'Fn_Card_hover');
        sprite.targetWidth = varCard.width;
        sprite.targetHeight = varCard.height;
        sprite.data.originalWH = {
            width: varCard.width,
            height: varCard.height
        };
        sprite.UpdateImageSizes();
        let text: any = this.game.add.sprite(0, 0, `fn${card.cardData.operationSymbolLatex}${card.latexParam}`);
        text.x = (sprite.targetWidth) / 2;
        text.y = sprite.targetHeight / 2;
        text.anchor.set(0.5, 0.5);
        sprite.addChild(text);
        sprite.inputEnabled = true;
        sprite.data.card = card;
        this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.data.originalPosition = sprite.position.clone();
        sprite.alpha = 0.005;
        return sprite;
    }

    /**
     * This function is used to find largest width of the currently available function cards
     * @returns It will return updated width and height for function card
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    getBigFnCard() {
        let FnCardImage: any;
        let defaultImage: any = {
            width: 240,
            height: 135
        };
        let maxWidth = 0;
        for (let cards = 0; cards < this.FunctionCardToShow.length; cards++) {
            let card = this.FunctionCardToShow[cards];
            FnCardImage = this.game.cache.getImage(`fn${card.cardData.operationSymbolLatex}${card.latexParam}`);
            if (maxWidth < FnCardImage.width) {
                maxWidth = FnCardImage.width;
            }
        }
        return { width: (maxWidth < defaultImage.width) ? defaultImage.width + 40 : maxWidth + 40, height: defaultImage.height };
    }

    /**
      * This function is used to find largest width of the currently available variable cards
      * @returns It will return updated width and height for variable card
      * 
      * @memberOf FunctionMatchGameStateBase
      */
    getBigVarCard() {
        let varCardImage: any;
        let cachekey: any;
        cachekey = 'VariableCard_BG';
        this.defaultVarCardImage = this.game.cache.getImage('VariableCard_BG');
        this.varCardMaxWidth = 0;
        for (let cards = 0; cards < this.VariableCardToShow.length; cards++) {
            let card = this.VariableCardToShow[cards];
            varCardImage = this.game.cache.getImage(`var${card.latexParam}`);
            if (this.varCardMaxWidth < varCardImage.width) {
                this.varCardMaxWidth = varCardImage.width;
            }
        }
        if (this.varCardMaxWidth > this.defaultVarCardImage.width) {
            this.defaultVarCardImage = this.game.cache.getImage('VariableCard_BG_WIDE');
            cachekey = 'VariableCard_BG_WIDE';
        }
        return { width: (this.varCardMaxWidth < this.defaultVarCardImage.width) ? this.defaultVarCardImage.width + 40 : this.varCardMaxWidth + 40 + (this.varCardMaxWidth - this.defaultVarCardImage.width), height: 150, cache: cachekey };
    }

    /**
     * This method is used to create the variable cards based on the data received from the game engine
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    createVariableCards() {
        this.variableCards = this.game.add.group();
        let varCardMargin = 50;
        let varCard = this.getBigVarCard();
        let totalWidthofColumn = (this.VariableCardToShow.length)
            * (varCard.width + varCardMargin);
        totalWidthofColumn = totalWidthofColumn - varCardMargin;

        for (let cards = 0; cards < this.VariableCardToShow.length; cards++) {
            let card = this.VariableCardToShow[cards];
            this.variableCards.add(this.createSingleVariableCard(
                card,
                cards * (varCard.width + varCardMargin),
                0,
                varCard.cache,
                varCard));
        }
        this.variableCards.x = this.BASE_GAME_WIDTH / 2 - totalWidthofColumn / 2;
        this.variableCards.y = this.BASE_GAME_HEIGHT - varCard.height - 20;
        this.countDownAnimation();
    }

    /**
     * This function used to generate images for variable card text 
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    generateVariableCardTextImage() {
        this.VariableCardToShow = this.engine.getVariableCards();
        this.Var_card_load_count = -1;
        let callBack = () => {
            this.Var_card_load_count++;
            if (this.Var_card_load_count < this.VariableCardToShow.length) {
                this.loadImageURL(this.VariableCardToShow[this.Var_card_load_count], callBack, 'var');
            } else {
                this.createVariableCards();
            }
        };
        callBack();
    }

    /**
     *  This function used to generate images for function card text 
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    generateFunctionCardTextImage() {
        this.FunctionCardToShow = this.engine.getFunctionCards();
        this.Fn_card_load_count = -1;
        let callBack = () => {
            this.Fn_card_load_count++;
            if (this.Fn_card_load_count < this.FunctionCardToShow.length) {
                this.loadImageURL(this.FunctionCardToShow[this.Fn_card_load_count], callBack, 'fn');
            } else {
                this.createFunctionCards();
            }
        };
        callBack();
    }

    /**
     * This method is used to load the image from the specific URL and add it to game cache
     * 
     * @param card contains function card or varible card
     * @param callback method to call after the image loaded successfully
     * @param type type of the card (i.e function card or variable card)
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    loadImageURL(card: any, callback: any, type: any) {
        latextopngconverter(card.getURL(), { scale: card.getImageScale(), fill: (type === 'fn') ? '#FFFFFF' : '#a34a04' }, (output: any) => {
            let image = new Image();
            image.src = output.img;
            image.onload = () => {
                if (image !== undefined) {
                    this.game.cache.addImage(`${type}${card.cardData.operationSymbolLatex}${card.latexParam}`, image.src, image);
                }
                callback();
            };
            image.onerror = () => {
                console.log('image loading failed');
            };
        });
    }

    /**
     * This method will create a single variable card
     * 
     * @param card It contains the variable card value, latex string
     * @param x It contains co-ordinates of the variable card
     * @param y It contains co-ordinates of the variable card
     * @param cacheKey It contains phaser cache string name of variable card background 
     * @returns It contains generated variable card
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    createSingleVariableCard(card: any, x: number, y: number, cacheKey: string, varCard: any): Phaser.Sprite {
        if (this.varCardMaxWidth > this.defaultVarCardImage.width) {
            cacheKey = 'VariableCard_BG_WIDE';
        }
        let sprite = this.game.add.sprite(x, y, cacheKey);
        sprite.height = 160;
        sprite.data.originalWH = {
            width: sprite.width,
            height: sprite.height
        };
        let text = this.game.add.sprite(0, 0, `var${card.latexParam}`);
        if (sprite.width == this.defaultVarCardImage.width) {
            text.x = (sprite.width) / 2 - text.width / 2;
        } else {
            text.x = (sprite.width - (sprite.width - this.defaultVarCardImage.width) + (sprite.width / 4) - 60) / 2 - text.width / 2;
        }
        text.y = sprite.height / 2;
        text.anchor.set(0, 0.5);
        if (sprite.width == this.defaultVarCardImage.width + 40) {
            text.scale.set(0.8);
        }
        sprite.addChild(text);
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;
        sprite.input.enableDrag();
        sprite.data.card = card;
        sprite.input.priorityID = 1;
        sprite.data.cTexture = sprite.generateTexture();
        this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.data.originalPosition = sprite.position.clone();
        sprite.events.onDragStart.add(this.onVariableCardDown, this);
        sprite.events.onDragStart.add(this.onVariableCardDragStart, this);
        sprite.events.onDragStop.add(this.onVariableCardDragStop, this);
        return sprite;
    }

    /**
     * This method gets triggered when the mouse down event occurs on the variable card
     * 
     * @param sprite It contains the variable card
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    onVariableCardDown(sprite: Phaser.Sprite) {
        this.game.add.tween(sprite)
            .to(
            {
                x: sprite.x - (sprite.data.originalWH.width * 0.20) / 2,
                y: sprite.y - (sprite.data.originalWH.height * 0.20) / 2,
                width: sprite.data.originalWH.width * 1.2,
                height: sprite.data.originalWH.height * 1.2
            },
            100,
            null,
            true, 0, 0, false);
    }

    /**
     * This method gets triggered when the variable card is about to drag
     * 
     * @param sprite  It contains the dragged variable card
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    onVariableCardDragStart(sprite: Phaser.Sprite) {
        this.popSound.play();
        if (typeof this.ghostCard[sprite.data.card.latexParam] !== 'undefined') {
            this.ghostCard[sprite.data.card.latexParam].destroy();
        }
        this.ghostCard[sprite.data.card.latexParam] = this.game.add.sprite(sprite.x,
            sprite.y, sprite.generateTexture());
        this.ghostCard[sprite.data.card.latexParam].width = sprite.data.originalWH.width;
        this.ghostCard[sprite.data.card.latexParam].height = sprite.data.originalWH.height;
        this.ghostCard[sprite.data.card.latexParam].data.card = sprite.data.card;
        this.variableCards.add(this.ghostCard[sprite.data.card.latexParam]);
        sprite.bringToTop();
    }

    /**
     * This method gets triggered when the variable card dropped (or) mouse out / mouse up event occurs
     * 
     * @param sprite It contains the dropped variable card
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    onVariableCardDragStop(sprite: Phaser.Sprite) {
        this.game.add.tween(sprite)
            .to(
            {
                x: sprite.data.originalPosition.x,
                y: sprite.data.originalPosition.y,
                width: sprite.data.originalWH.width,
                height: sprite.data.originalWH.height
            },
            100,
            null,
            true, 0, 0, false);
        let dropped: boolean = this.game.physics.arcade.overlap(this.functionCards, sprite, this.variableCardDropped, null, this);
        if (!dropped) {
            this.ghostCard[sprite.data.card.latexParam].alpha = 1;
            this.ghostCard[sprite.data.card.latexParam].destroy();
        }
    }

    /**
     * This method gets triggered when the variable card collided with the function card.
     * 
     * @param fn It contains collided function card 
     * @param varcard contains collided variable card 
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    variablecardHover(fn: Phaser.Sprite, varcard: Phaser.Sprite) {
        if (fn.data.frameName === 'bigdoor_active0000') {
            return;
        }
        for (let i = 0; i < this.functionCards.children.length; i++) {
            let card: any = this.functionCards.children[i];
            card.data.frameName = 'bigdoor0000';
        }
        for (let i = this.functionCards.children.length / 3; i < this.functionCards.children.length; i++) {
            let card: any = this.functionCards.children[i];
            card.alpha = 0.005;
        }
        fn.data.frameName = 'bigdoor_active0000';
        let index = this.functionCards.getChildIndex(fn) - (this.functionCards.children.length / 3);
        let card: any = this.functionCards.getChildAt(index);
        card.alpha = 1;
    }

    /**
     * This method gets triggered when the variable card dropped over the function card
     * 
     * @param VariableCard It contains the variable card
     * @param FunctionCard It contains the function card
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    variableCardDropped(VariableCard: Phaser.Sprite, FunctionCard: Phaser.Sprite) {
        if (!VariableCard.inputEnabled || FunctionCard.data.frameName !== 'bigdoor_active0000') {
            return;
        }

        let originalposition = VariableCard.worldPosition;
        VariableCard.inputEnabled = false;
        let badGuyValue = FunctionCard.data.card.computeValue(VariableCard.data.card, this.engine.badGuysGrid.fractionMode, this.engine.badGuysGrid.expressionSymbolMult, this.engine.badGuysGrid.values);
        badGuyValue = this.engine.identifyGridCardType(badGuyValue);
        this.createDroppedTween(VariableCard, badGuyValue, FunctionCard);
        let badGuy = this.getBadGuyByValue(badGuyValue);
        // To check if bad guy exists and the current kill value
        let killerExists = _.find(this.lastKillValue, function (item: any) {
            return item.latexParam === badGuyValue.latexParam;
        });
        if (badGuy !== null && !killerExists) {
            // To check visiblity of bad guy
            if (badGuy.worldPosition.y - (badGuy.height / 2) > 0) {
                this.matchCount++;
                this.showEquationArea(VariableCard, FunctionCard, badGuyValue, false);
                this.startToKillBadGuys(badGuyValue, originalposition);
            } else {
                // To show equation error
                this.wrongAnswer.play();
                this.showEquationArea(VariableCard, FunctionCard, badGuyValue, true);
            }
        } else {
            // To show equation error
            this.wrongAnswer.play();
            this.showEquationArea(VariableCard, FunctionCard, badGuyValue, true);
        }
    }

    /**
     * This method is used to update the text in the equation area 
     * 
     * @param VariableCard It contains the variable card
     * @param FunctionCard It contains the function card
     * @param badGuyValue It contains the value of the equation
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    showEquationArea(variableCard: Phaser.Sprite, functionCard: Phaser.Sprite, badGuyValue: any, isError: boolean) {
        let data = functionCard.data.card.getEquationLatex(variableCard.data.card, badGuyValue, isError, this.engine.getBadguysData());
        this.equationText.destroy();
        if (data.isImage) {
            this.equationText = this.game.add.sprite(0, 0, '');
            latextopngconverter(data.image, { scale: data.scale, fill: (isError) ? '#FF0000' : '#FFFFFF' }, (output: any) => {
                this.equationText.data.image = new Image();
                this.equationText.data.image.src = output.img;
                this.equationText.data.image.onload = () => {
                    if (typeof this.equationText.data.image !== 'undefined') {
                        this.game.cache.addImage(badGuyValue.latexParam, this.equationText.data.image.src, this.equationText.data.image);
                        let tmpImage = this.game.add.sprite(0, 0, badGuyValue.latexParam);
                        this.equationText.texture = tmpImage.generateTexture();
                        tmpImage.destroy();
                        this.equationText.data.eqValue = badGuyValue.latexParam;
                        this.equationText.x = this.equationArea.width / 2 - this.equationText.width / 2;
                        this.equationText.y = this.equationArea.height / 2 - this.equationText.height / 2 - 5;
                        this.textGroup.add(this.equationText);
                    }
                };
            });
        } else {
            this.equationText = this.game.add.bitmapText(
                0,
                0,
                'Frutiger',
                '' + data.image,
                this.EquationAreaTextStyle.fontSize);
            this.equationText.x = this.equationArea.width / 2 - this.equationText.width / 2;
            this.equationText.y = this.equationArea.height / 2 - this.equationText.height / 2 - 10;
            this.textGroup.add(this.equationText);
            if (isError) {
                this.equationText.tint = 0xFF0000;
            }
        }

        if (isError) {
            this.equationArea.alpha = 0.005;
            this.equationAreaFalseImage.alpha = 1;
            let tween = this.game.add.tween(this.equationAreaFalseImage)
                .to(
                {
                    width: 0,
                    height: 0
                },
                250,
                null,
                true, 0, 0, false);
            tween.onComplete.add((target: any) => {
                target.alpha = 0.005;
                target.width = this.equationAreaFalseImage.data.originalWH.width;
                target.height = this.equationAreaFalseImage.data.originalWH.height;
            });

        } else {
            this.equationArea.alpha = 1;
        }
    }

    /**
     * This method is used to get the bad guy for the value of the equation.
     * 
     * @param killValue It contains the value of the equation
     * @returns It will return null or bad guy
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    getBadGuyByValue(killValue: any): any {
        let badGuyFound = null;
        for (let i = 0; i < this.badGuysColumn.children.length; i++) {
            let element: any = this.badGuysColumn.children[i];
            if (typeof element.data.card.latexData !== 'undefined') {
                if (element.data.card.latexData.latexParam === killValue.latexParam) {
                    badGuyFound = element;
                    break;
                }
            }
        }
        return badGuyFound;
    }

    /**
     * This method will create good guys with kill value to destroy bad guys
     * 
     * @param killValue It contains the value of bad guy to kill
     * @param originalposition It contains the position of good guy where it is getting popped up
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    startToKillBadGuys(killValue: string, originalPosition: any) {
        let goodGuysGroup = this.game.add.group();
        let goodGuyMoveTime: number = 300;
        let goodGuy = this.game.add.sprite(0, 0, 'Good_Guy');
        goodGuysGroup.add(goodGuy);
        this.gameWrapper.add(goodGuysGroup);
        goodGuy.position.copyFrom(originalPosition);
        goodGuy.data.killValue = killValue;
        goodGuy.data.totalKill = 0;
        this.lastKillValue.push(killValue);

        // If there is no more bad guy to kill, Then the good guy moves to right end of screen and disappear.
        let endTween = (goodGuy: Phaser.Sprite) => {
            if (this.equationText.data.eqValue === goodGuy.data.killValue) {
                this.equationText.setText('');
            }

            let tween = this.game.add.tween(goodGuy)
                .to(
                {
                    x: this.BASE_GAME_WIDTH
                },
                500,
                null,
                true, 0, 0, false);

            tween.onComplete.add((target: any) => {
                this.lastKillValue = _.without(this.lastKillValue, _.findWhere(this.lastKillValue, { latexParam: target.data.killValue.latexParam }));
                goodGuy.destroy();
            });
        };

        // play hit animation when Good Guy hits Bad Guy
        let playHitAnimation = (goodGuy: Phaser.Sprite) => {
            if (this.gameFinish) {
                endTween(goodGuy);
            } else {
                this.updatePoints();
                let hitAnimation = this.game.add.sprite(0, 0, 'Good_Guy_Win');
                goodGuysGroup.add(hitAnimation);
                goodGuysGroup.sort('y', Phaser.Group.SORT_ASCENDING);
                this.gameWrapper.add(goodGuysGroup);
                hitAnimation.anchor.set(0.5, 0.5);
                hitAnimation.x = goodGuy.worldPosition.x + (goodGuy.width / 2);
                hitAnimation.y = goodGuy.worldPosition.y + (goodGuy.height / 2);
                hitAnimation.animations.add('Good_Guy_Win');
                hitAnimation.animations.currentAnim.onComplete.add(() => {
                    hitAnimation.alpha = 0.005;
                    startTween(goodGuy, 0);
                });
                hitAnimation.animations.play('Good_Guy_Win', 15, false, true);
            }
        };

        // start Good Guy move tween to kill Bad Guy 
        let startTween = (goodGuy: Phaser.Sprite, initialDelay: number) => {
            let badGuyToKill = this.getBadGuyByValue(goodGuy.data.killValue);
            if (badGuyToKill === null || this.gameFinish) {
                endTween(goodGuy);
            } else {
                if (badGuyToKill.worldPosition.y - (badGuyToKill.height / 2) < 0) {
                    // Do not kill invisible bad guy
                    endTween(goodGuy);
                } else {
                    let calcY = badGuyToKill.worldPosition.y - goodGuy.height / 2;
                    let tween = this.game.add.tween(goodGuy)
                        .to(
                        {
                            x: badGuyToKill.worldPosition.x - goodGuy.width / 2,
                            y: (calcY < 0) ? 0 : calcY
                        },
                        goodGuyMoveTime,
                        Phaser.Easing.Linear.None,
                        true, initialDelay, 0, false
                        );
                    tween.onComplete.add((target: any) => {
                        goodGuy.data.totalKill++;
                        badGuyToKill.data.bossLife--;
                        let soundIndex = (goodGuy.data.totalKill - 1 > 4) ? 4 : goodGuy.data.totalKill - 1;
                        if (badGuyToKill.data.bossLife === 0) {
                            badGuyToKill.destroy();

                            //Generate new badguys row immediately once the player clears all the bad guys 
                            if (this.badGuysColumn.length == this.engine.getNumofBadGuyColumnCount()) {
                                if (!this.BadGuysMarchingTween.isRunning) {
                                    clearTimeout(this.tweenInterval);
                                    this.badGuysTween();
                                }
                            }

                        } else {
                            this.changeBigGuyBoss(badGuyToKill);
                        }
                        this.punch[soundIndex].play();
                        playHitAnimation(target);
                        // To check, if a good guys kills more than 5 bad guys then update the bonus points
                        if (goodGuy.data.totalKill >= 5) {
                            goodGuy.data.totalKill = 0;
                            this.updateBonusPoints();
                        }
                    });
                }
            }
        };

        // Good Guy popup tween to equation area from the dropped variable card position 
        let initTween = (goodGuy: Phaser.Sprite) => {
            let badGuyToKill = this.getBadGuyByValue(goodGuy.data.killValue);
            if (badGuyToKill === null || this.gameFinish) {
                endTween(goodGuy);
            } else {
                this.goodGuyPopup.play();
                let tween = this.game.add.tween(goodGuy)
                    .to(
                    {
                        y: this.baseLine.y - 50
                    },
                    250,
                    Phaser.Easing.Linear.None,
                    true, 0, 0, false
                    );
                tween.onComplete.add((target: any) => {
                    startTween(target, 500);
                });
            }
        };

        // To initilize Good Guy tween
        initTween(goodGuy);
    }

    /**
     * This method will check whether a bad guy row is destroyed
     * 
     * @param rowValue It contains row index of bad guy to check
     * @returns It will return result as boolean value
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    checkIfBadGuysRowDestroy(rowValue: number) {
        for (let i = 0; i < this.badGuysColumn.children.length; i++) {
            let element: any = this.badGuysColumn.children[i];
            if (element.data.rowValue === rowValue) {
                return false;
            }
        }
        return true;
    }

    /**
     * This method will change the value of big guy boss.
     * 
     * @param badGuy It contains bad guy sprite
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    changeBigGuyBoss(badGuy: Phaser.Sprite) {
        let newBigGuy = _.filter(this.getBadGuysArmy(), function (ele: any) {
            let data = ele.getComputedValue();
            return !(data.latexParam === badGuy.data.card.latexData.latexParam);
        });
        this.BGbossKey = badGuy.key.toString() + '_Boss';
        let bossSprite = this.game.add.sprite(
            0, 0,
            this.BGbossKey, 'boss_idle0000');
        bossSprite.alpha = 0.005;
        badGuy.setTexture(bossSprite.generateTexture());
        bossSprite.destroy();

        newBigGuy = (newBigGuy.length === 0) ? this.getBadGuysArmy()[0] : newBigGuy[0];
        let text: any = badGuy.children[0];
        text.destroy();
        let newText: any = this.getBadGuysText(newBigGuy, badGuy.key.toString(), badGuy);
        if (badGuy.key.toString() != 'BadGuy_Square' && badGuy.key.toString() != 'BadGuy_Wide') {
            newText.scale.setTo(0.5, 0.5);
        }
        badGuy.addChild(newText);
        badGuy.data.card = newBigGuy;
    }

    /**
     * This method updates the points on points board, when the Good Guy kills the Bad Guy
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    updatePoints() {
        this.gamePoints += this.pointsPerBG;
        this.pointsText.setText('' + this.gamePoints);
        this.pointsText.x = this.pointsGroup.width / 2 - this.pointsText.width / 2;
        this.rewardsUpdate();
    }

    /**
     * This method will update the bonus point with the game point
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    updateBonusPoints() {
        this.gamePoints += 50;
        this.pointsText.setText('' + this.gamePoints);
        this.pointsText.x = this.pointsGroup.width / 2 - this.pointsText.width / 2;
        this.rewardsUpdate();

        // To play punch combo audio
        this.punchCombo.play();

        // To combo info animation
        let comboSprite = this.game.add.sprite(0, 0, 'Combo_Points');
        comboSprite.x = this.soundButton.x + 15;
        comboSprite.y = 300;
        this.game.add.tween(comboSprite)
            .to(
            {
                y: 200
            },
            500,
            Phaser.Easing.Linear.None,
            true, 0, 0, false).onComplete.add((target: Phaser.Sprite) => {
                target.destroy();
            });
    }

    /**
     * This method will animate the reward star
     * 
     * @param star It contains star sprite to animate
     * 
     * @memberOf FunctionMatchGameStateBase
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
        let rewardsThreshold = this.engine.getRewardsThreshold();
        let totalPointsSoFar = 0;
        for (let i = this.currentLevelStar; i < rewardsThreshold.length; i++) {
            if (this.gamePoints >= rewardsThreshold[i]) {
                totalPointsSoFar = rewardsThreshold[i];
                this.rewardStarAnimate(this.levelStars[i].children[1], i);
                this.currentLevelStar++;
            }
        }

        for (let i = 0; i < this.currentLevelStar; i++) {
            if (this.gamePoints >= rewardsThreshold[i]) {
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
        let percent = Math.abs(this.gamePoints - totalPointsSoFar) / (rewardsThreshold[this.currentLevelStar] - totalPointsSoFar) * 100;

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

        if (this.levelFinish && !this.gameFinish && !this.engine.isTestMode()) {
            this.gameFinish = true;
            this.BadGuysMarchingTween.stop(true);
            this.gameOverScreen();
        }
    }

    /**
     * This method will create the variable card tween, when the variable card dropped above the function card
     * 
     * @param sprite It contains dropped variable card 
     * @param badGuyValue It contains a bad guy value which need to be killed
     * @param FunctionCard It contains function card 
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    createDroppedTween(sprite: Phaser.Sprite, badGuyValue: string, FunctionCard: Phaser.Sprite) {
        // To change the color to original background / remove tint
        FunctionCard.data.frameName = 'bigdoor0000';

        // To create a white graphics texture
        let graphics = this.game.add.graphics(0, 0);
        graphics.lineStyle(1, 0xFFFFFF);
        graphics.beginFill(0xFFFFFF);
        graphics.moveTo(0, 0);
        graphics.drawRoundedRect(0, 0, sprite.width, sprite.height, 50);
        sprite.setTexture(graphics.generateTexture());

        // To destroy graphics to save memory
        graphics.destroy();

        // To scale down tween for the variable card on drop
        let tween = this.game.add.tween(sprite)
            .to(
            {
                x: sprite.x + (sprite.width / 2),
                y: sprite.y + (sprite.height / 2),
                width: 0,
                height: 0
            },
            200,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);

        // To scale down tween onComplete listener 
        tween.onComplete.add((target: any) => {
            this.enableSpriteForNextDrag(target);
        });
    }

    /**
     * This method will enable the variable card for next drag, after 0.5 sec.
     * 
     * @param sprite It contains dropped variable card  
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    enableSpriteForNextDrag(sprite: Phaser.Sprite) {
        this.ghostCard[sprite.data.card.latexParam].alpha = 1;
        sprite.alpha = 0.6;
        sprite.setTexture(sprite.data.cTexture);
        sprite.width = this.ghostCard[sprite.data.card.latexParam].width;
        sprite.height = this.ghostCard[sprite.data.card.latexParam].height;
        sprite.position.copyFrom(sprite.data.originalPosition);
        this.ghostCard[sprite.data.card.latexParam].destroy();
        this.enableSpriteInterval = setTimeout(() => {
            sprite.alpha = 1;
            sprite.inputEnabled = true;
            sprite.input.useHandCursor = true;
        }, 500);
    }

    /**
     * This method will return the array of possible bad guys to hit
     * 
     * @returns returns the array of bad guys combination
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    getBadGuysArmy(): any {
        let functionCardsData = _.map(this.functionCards.children, (element: any) => {
            return element.data.card;
        });
        let variableCardsData = _.map(this.variableCards.children, (element: any) => {
            return element.data.card;
        });
        let badGuysArmy = this.engine.getBadGuys(functionCardsData, variableCardsData);
        return badGuysArmy;
    }

    /**
     * This method will return image / text for the bad guy
     * @returns It contains Image or text for bad guy
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    getBadGuysText(badGuy: any, charType: string, sprite: Phaser.Sprite): any {
        let text: any;
        let badGuyData = badGuy.getComputedValue();
        if (!badGuyData.isImage) {
            let textDisp = badGuyData.latexParam;
            if (badGuyData.valueType === 3) {
                textDisp += '%';
            }
            text = this.game.add.bitmapText(0, 0, 'Frutiger', '' + textDisp, this.BadGuyCardTextStyle.fontSize);
            text.tint = this.BadGuyCardTextStyle.fill;
        } else {
            text = this.game.add.sprite(0, 0, '');
            latextopngconverter(badGuy.getURL(), { scale: badGuy.getImageScale(), fill: '#FFFFFF' }, (output: any) => {
                text.data.image = new Image();
                text.data.image.src = output.img;
                text.data.image.onload = () => {
                    if (text.data.image !== undefined) {
                        this.game.cache.addImage(badGuyData.latexParam, text.data.image.src, text.data.image);
                        let tmpImage = this.game.add.sprite(0, 0, badGuyData.latexParam);
                        text.texture = tmpImage.generateTexture();
                        tmpImage.destroy();
                        text.x = 0 - text.width / 2;
                        if (charType == 'BadGuy_Long') {
                            if (sprite.data.isBoss) {
                                if (this.BGbossKey == `${charType}_Boss`) {
                                    text.scale.setTo(0.7);
                                }
                                text.y = 10;
                            } else {
                                text.y = (((sprite.height - 50) / 2) - (text.height / 2)) - 60;
                            }
                        } else {
                            if (sprite.data.isBoss) {
                                text.y = 20;
                            } else {
                                text.y = 0;
                            }
                        }
                    };
                }
            });
        }
        text.x = -text.width / 2;
        text.y = 0;
        return text;
    }

    /**
     * This method will create Bad Guys row based on data received from Game engine.
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    createBadGuysRow() {
        // This block will run for the first time
        if (this.BadGuysMarchingTween === null) {
            this.badGuysColumn = this.game.add.group();
            this.badGuysColumn.enableBody = true;
            this.badGuysColumn.physicsBodyType = Phaser.Physics.ARCADE;
        }
        let badGuysArmy = this.getBadGuysArmy();
        let totalWidthofColumn = 0;
        this.badGuyImage = {
            width: 150,
            height: 145
        };
        let badGuyMargin = 50;
        let charType = 'BadGuy_Square';
        let frameChar = '';
        let width = 0;
        let height = 0;
        switch (this.engine.getBadGuyCharacterType().toLowerCase()) {
            case 'square': charType = 'BadGuy_Square'; frameChar = 'square'; width = 136; height = 130; this.badGuyHeight = 130; break;
            case 'long': charType = 'BadGuy_Long'; frameChar = 'long'; width = 140; height = 194; this.badGuyHeight = 194; break;
            case 'wide': charType = 'BadGuy_Wide'; frameChar = 'wide'; width = 210; height = 130; this.badGuyHeight = 130; break;
            default: charType = 'BadGuy_Square'; frameChar = 'square'; width = 136; height = 130; this.badGuyHeight = 130; break;
        }
        this.BG_CharacterType = frameChar;
        // For big boss
        let toShowIn: any = null;
        let smllArray;
        if (this.engine.getBossIterations() > 0) {
            toShowIn = Math.floor(badGuysArmy.length / 2);
            if (badGuysArmy.length % 2 === 0) {
                smllArray = [toShowIn, toShowIn - 1];
                toShowIn = _.shuffle(smllArray)[0];
            }
        }
        let destroySprite = false;
        for (let column = 0; column < badGuysArmy.length; column++) {
            destroySprite = false;
            let badGuy = badGuysArmy[column];
            if (typeof badGuy.getComputedValue() !== 'undefined') {
                let sprite = this.game.add.sprite(
                    0, 0,
                    charType, `${this.BG_CharacterType}_idle0000`);

                sprite.width = width;
                sprite.height = height;

                sprite.x = column * (sprite.width + badGuyMargin);
                sprite.y = -this.badGuyLastRow * (sprite.height + badGuyMargin);
                sprite.anchor.set(0.5, 0.5);
                let text: any = this.getBadGuysText(badGuy, charType, sprite);

                if (charType != 'BadGuy_Square') {
                    text.scale.setTo(0.5, 0.5);
                }

                sprite.data.rowValue = this.badGuyLastRow;
                sprite.data.card = badGuy;
                sprite.addChild(text);
                sprite.data.originalWH = {
                    width: sprite.width,
                    height: sprite.height
                };
                if (column === toShowIn && ((this.badGuyLastRow + 1) % 4) === 0 && toShowIn !== null) {

                    let bossSprite = this.game.add.sprite(
                        0, 0,
                        `${charType}_Boss_Start`, 'boss_idle0000');
                    bossSprite.alpha = 0.005;

                    sprite.setTexture(bossSprite.generateTexture());
                    bossSprite.destroy();

                    this.BGbossKey = `${charType}_Boss_Start`;

                    if (charType != 'BadGuy_Square') {
                        text.scale.setTo(0.7);
                    }
                    sprite.x = sprite.x + (sprite.width * 0.3) - 10;
                    sprite.y = sprite.y - (sprite.height * 0.3);

                    if (charType != 'BadGuy_Long') {
                        sprite.data.originalWH = {
                            width: 178,
                            height: 173
                        };
                    }
                    this.badGuyNoNeedAt.push(`${this.badGuyLastRow}_${column + 1}`);
                    this.badGuyNoNeedAt.push(`${this.badGuyLastRow + 1}_${column}`);
                    this.badGuyNoNeedAt.push(`${this.badGuyLastRow + 1}_${column + 1}`);
                    sprite.data.bossLife = this.engine.getBossIterations();
                    sprite.data.isBoss = true;
                } else {
                    if (!_.contains(this.badGuyNoNeedAt, `${this.badGuyLastRow}_${column}`)) {
                        sprite.data.bossLife = 1;
                        sprite.data.isBoss = false;
                    } else {
                        sprite.destroy();
                        destroySprite = true;
                    }
                }
                if (!destroySprite) {
                    this.badGuysColumn.add(sprite);
                    destroySprite = false;
                }
            }
        }
        this.badGuyLastRow++;
        let sprite: any = this.badGuysColumn.getChildAt(0);
        this.badGuyImage.width = sprite.data.originalWH.width;
        this.badGuyImage.height = sprite.data.originalWH.height;

        // To run at first time
        if (this.BadGuysMarchingTween === null) {
            totalWidthofColumn = (badGuysArmy.length - 1) * (this.badGuyImage.width / 2 + badGuyMargin / 2);
            this.gameWrapper.add(this.badGuysColumn);
            this.badGuysColumn.x = this.BASE_GAME_WIDTH / 2 - totalWidthofColumn;
            this.badGuysColumn.y = -this.badGuyImage.height / 2;
            this.badGuysTween();
        }
    }

    /**
     * This method will control the bad guys moving speed towards base line.
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    badGuysTween() {
        clearTimeout(this.tweenInterval);
        if (this.gameFinish) {
            return;
        }
        if (this.gamePause) {
            this.tweenInterval = setTimeout(() => {
                this.badGuysTween();
            }, this.engine.getSpeed(this.gamePoints));
            return;
        }

        this.BadGuysMarchingTween = this.game.add.tween(this.badGuysColumn)
            .to(
            { y: this.badGuysColumn.y + this.badGuyHeight + 50 },
            800,
            Phaser.Easing.Linear.None,
            true, 0, 0, false);

        this.BadGuysMarchingTween.onComplete.add(() => {
            this.createBadGuysRow();
            this.tweenInterval = setTimeout(() => {
                this.badGuysTween();
            }, this.engine.getSpeed(this.gamePoints));
            this.badGuysComesIn.play();
        });
    }

    /**
     * This function is used to load the end video and set it's visibility as false
     * 
     * @memberof FunctionMatchGameStateBase
     */
    addEndVideo() {
        this.endVideo = this.game.add.video('end_animation');
        this.endVideoField = this.game.add.graphics(0, 0);
        this.endVideoField.beginFill(0x6fc6ca);
        this.endVideoField.lineStyle(this.shadowLine, 0x000000, 1);
        this.endVideoField.drawRect(0, 0, this.game.width, this.game.height);
        this.endVideoField.visible = false;
        this.endVideoSprite = this.endVideo.addToWorld(150, 100);
        this.endVideoSprite.width = this.endVideoField.getBounds().width / 1.2;
        this.endVideoSprite.height = this.endVideoField.getBounds().height / 1.2;
        this.endVideoField.addChild(this.endVideoSprite);
        // for desktop only
        if (this.game.device.desktop) {
            this.endVideo.onComplete.addOnce(() => {
                this.endVideoField.destroy();
                this.endVideoSprite.destroy();
                this.endVideo.destroy();
                this.game.cache.removeVideo('end_animation');
                this.gotoMenu();
            });
        }

        if (!this.game.device.desktop) {
            this.endVideo.currentTime = 0;
            this.endVideo.play();
        }
    }

    /**
     * This method will design the game over screen
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    gameOverScreen() {
        if (this.gameOverDisplay) {
            return;
        }

        this.gameOverDisplay = true;
        let levelIndx = this.levelIndex;
        let congratText: Phaser.BitmapText;
        if (((levelIndx + 1) == this.engine.gameJSON.levelData.length) && this.currentLevelStar >= 1) {
            this.addEndVideo();
        }
        // To check level stars
        this.currentLevelStar = (this.levelFinish && this.currentLevelStar === 2) ? 3 : this.currentLevelStar;

        if (this.baseLineTween !== null) {
            this.baseLineAnim.alpha = 0.005;
            this.baseLineTween.stop();
        }
        if (this.gameOverGroup !== null) {
            this.gameOverGroup.destroy();
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
        let scoreText = this.game.add.bitmapText(0, 0, 'Frutiger', this.getLocalizedText("game_score"), 60);
        scoreText.x = this.rectangleBG.width / 2 - scoreText.width / 2;
        let scorePoints = this.game.add.bitmapText(0, 0, 'Frutiger', '' + this.gamePoints, 100);
        scorePoints.y = scoreText.y + scoreText.height;
        scorePoints.x = this.rectangleBG.width / 2 - scorePoints.width / 2;
        let bestScoreText = this.game.add.bitmapText(0, 0, 'Frutiger', this.getLocalizedText("game_bestscore2"), 60);
        bestScoreText.y = scorePoints.y + scorePoints.height + 40;
        bestScoreText.x = this.rectangleBG.width / 2 - bestScoreText.width / 2;
        this.bestScorePoints = this.game.add.bitmapText(0, 0, 'Frutiger', '' + this.gamePoints, 100);
        
        this.newTextGroup = this.game.add.group();        
        let newTextLabel = this.game.add.bitmapText(0, 0, 'Frutiger', this.getLocalizedText("game_bestscore1"), 48);
        newTextLabel.tint = 0xFFFFFF;
        let labelBG = this.game.add.graphics(0, 0);
        labelBG.beginFill(0xf85721);
        labelBG.moveTo(0, 0);
        if(this.initParams.urlParams.lang == 'es'){
            labelBG.drawRoundedRect(0, 0, 165, 55, 10);
        }else{
            labelBG.drawRoundedRect(0, 0, 140, 55, 10);
        }        
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
        if (((index + 1) == this.engine.gameJSON.levelData.length) && this.currentLevelStar >= 1) {
            replayButton.visible = false;
        }
        replayButton.events.onInputDown.add(() => {
            this.popSound.play();
            this.gameOverGroup.destroy();
            this.initGame();
            this.finalMusic.stop();
            this.game.state.restart(true, false);
        });
        rectangleGroup.add(replayButton);
        let nextButton = replayButton;
        this.setLevelInfo(true);
        if (this.currentLevelStar >= 1) {
            nextButton = this.game.add.sprite(0, stars_group.height, 'UI', 'btn_next0000');
            nextButton.x = replayButton.x + replayButton.width + 40;
            nextButton.y = replayButton.y;
            nextButton.inputEnabled = true;
            nextButton.input.useHandCursor = true;
            nextButton.input.priorityID = 2;
            let levelIndex = this.levelIndex;
            nextButton.events.onInputDown.add(() => {
                this.nextTouched = true;
                this.popSound.play();
                this.levelIndex++;
                this.gameOverGroup.destroy();
                this.finalMusic.stop();
                this.removeGameUIListeners();
                if (this.levelIndex == this.engine.gameJSON.levelData.length) {
                    this.playEndAnimation();
                } else {
                    this.removeEndVideo();
                    this.initGame();
                    this.game.state.restart(true, false);
                }
            });
            rectangleGroup.add(nextButton);
        }

        let isLastLevel: boolean = false;
        let levelStar = this.currentLevelStar;
        let levelIndex = this.levelIndex;
        if ((levelIndex + 1) == this.engine.gameJSON.levelData.length) {
            isLastLevel = true;
        }
        if ((isLastLevel && levelStar < 1) || !isLastLevel) {
            let homeButton = this.game.add.sprite(0, nextButton.y + nextButton.height,
                'UI', 'btn_home0000');
            homeButton.x = replayButton.x + (2 * replayButton.width) + 80;
            homeButton.y = replayButton.y + (nextButton.height / 2 - homeButton.height / 2);
            homeButton.inputEnabled = true;
            homeButton.input.useHandCursor = true;
            homeButton.input.priorityID = 2;
            let levelIndex = this.levelIndex;
            homeButton.events.onInputDown.add(() => {
                this.popSound.play();
                setTimeout(() => {
                    this.gameOverGroup.destroy();
                    this.initGame();
                    this.finalMusic.stop();
                    this.initParams.animationCheck = true;
                    this.gotoMenu();
                }, 100);
            });
            rectangleGroup.add(homeButton);
        }

        let starIndex = 0;
        let animateStar = (star: Phaser.Sprite) => {
            if (starIndex >= 3 || this.currentLevelStar === 0) {
                this.finalMusic.loop = true;
                this.finalMusic.play();
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
                } else {
                    this.finalMusic.loop = true;
                    this.finalMusic.play();
                }
                if (this.currentLevelStar >= 1) {
                    for (let i = 0; i < this.badGuysColumn.children.length; i++) {
                        let badGuy: any = this.badGuysColumn.getChildAt(i);
                        if (badGuy.data.isBoss) {
                            let bossSprite = this.game.add.sprite(
                                0, 0,
                                this.BGbossKey, 'boss_sad0000');
                            bossSprite.alpha = 0.005;
                            bossSprite.scale.setTo(2);
                            badGuy.setTexture(bossSprite.generateTexture());
                            bossSprite.destroy();
                        } else {
                            badGuy.frameName = `${this.BG_CharacterType}_sad0000`;
                        }
                    }
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
            this.goodGuyPopup.play();
            if (!popupShown) {
                tweenGamePopup(rectangleGroup);
            }
        } else {
            this.goodGuyPopup.play();
            if (!popupShown) {
                tweenGamePopup(rectangleGroup);
            }
        }

        if (this.initParams.assignmentMode !== -1 && (this.initParams.assignmentLevelId === this.levelID) && this.currentLevelStar >= 1) {
            scoreText.x += 230;
            scorePoints.x += 230;
            this.newTextGroup.x = scoreText.x + 10;
            bestScoreText.x += 230;
            bestScoreText.y += 70;
            this.bestScorePoints.x += 230;
            this.bestScorePoints.y += 70;

            congratText = this.game.add.bitmapText(this.newTextGroup.x - 370, this.newTextGroup.y + 230, 'HMHMath', this.wrapText(this.getLocalizedText("assignment_done"), 11), 85);
            congratText.tint = 0x000;
            congratText.align = "center"
            congratText.anchor.setTo(0.5, 0);
            congratText.tint = 0xfb5606
            congratText.smoothed = true;

            congratText.rotation = -.25;
            congratText.visible = false;
            let congTween = this.game.add.tween(congratText);
            congratText.scale.set(3, 3);
            let congratTween = this.game.add.tween(congratText.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Bounce.Out, true, 2, 1, false);
            congratTween.onRepeat.add(() => {
                this.game.time.events.add(500, () => {
                    congratText.visible = true;
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
     * @returns return text with new line
     * @memberof FunctionMatchGameStateBase
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
            let touch: any = this.game.input.touch;
            touch.addTouchLockCallback(() => {
                this.endVideo.play();
                return true;
            }, this.endVideo, true);
        }

        if (!this.game.device.desktop) {
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
     * @memberOf FunctionMatchGameStateBase
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
     * This function is used to change the sound icon based on the state of the game sound
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    soundButtonToggle() {
        if (this.initParams.audiomute) {
            this.soundButton.frameName = 'btn_sound_OFF0000';
        } else {
            this.soundButton.frameName = 'btn_sound_ON0000';
        }
    }

    /**
     * This method will show the countdown animation before game starts
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    countDownAnimation() {
        let countDownAnimation = this.game.add.sprite(0, 0, 'countdown');
        countDownAnimation.anchor.set(0.5, 0.5);
        countDownAnimation.x = this.BASE_GAME_WIDTH / 2 - countDownAnimation.width / 2;
        countDownAnimation.y = this.BASE_GAME_HEIGHT / 2 - countDownAnimation.height / 2;
        let anim = countDownAnimation.animations.add('countdown', [2, 1, 0, 3]);
        countDownAnimation.animations.play('countdown', 1, false, true);

        this.countDownAudio.play();
        anim.enableUpdate = true;
        anim.onUpdate.add((anim: any, frame: any) => {
            if (frame.index === 3) {
                this.whistle.play();
            } else {
                this.countDownAudio.play();
            }
        });

        countDownAnimation.animations.currentAnim.onComplete.add(() => {
            this.countDownBgGroup.destroy();
            countDownAnimation.alpha = 0.005;
            this.counDownFinish = true;
            this.createBadGuysRow();
            this.introMusic.play();
        });
    }

    /**
     * This function is used to set the user level completion information
     * 
     * @memberOf FunctionMatchGameStateBase
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
            if (this.newTextGroup != null) {
                this.newTextGroup.visible = true;
            }
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
     * This function is used to return to the Dynamic Menu
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    gotoMenu() {
        this.lastVideoPath = null;
        this.game.load.onLoadStart.remove(this.loadStart, this);
        this.game.load.onFileComplete.remove(this.fileComplete, this);
        this.game.load.onLoadComplete.remove(this.createGameUI, this);
        this.game.load.onFileError.remove(this.fileError, this);
        this.game.state.clearCurrentState();
        this.counDownFinish = false;
        this.game.state.start('DynamicMenu', true, false, [this.initParams, this.animIndex, this.levelID, null]);
    }

    /**
     * This function is used to load tutorial video
     * @param videoName It contains video name for the tutorial
     * 
     * @memberOf FunctionMatchGameStateBase
     */
    loadtutorialVideo(videoName: string) {
        this.loadingVideo = true;
        this.game.load.onLoadStart.add(this.loadStart, this);
        this.game.load.onLoadComplete.add(this.loadComplete, this);
        this.game.load.onFileError.add(this.fileError, this);
        this.game.load.atlas('UI', 'assets/images/UI_assets.png', 'assets/data/ui_assets.json');
        this.game.load.video('tutorialVideo', `assets/video/${videoName}`);
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
     * This function is used to destroy the end video and it's sprite whenever don't need to play
     * 
     * @memberof FunctionMatchGameStateBase
     */
    removeEndVideo() {
        if (typeof this.endVideo !== 'undefined' && typeof this.endVideo !== null && !this.game.device.android) {
            this.endVideoField.destroy();
            this.endVideoSprite.destroy();
            this.endVideo.destroy();
        }
    }

    /**
     * This function is used to update the assignment level ID
     * 
     * @memberof FunctionMatchGameStateBase
     */
    updateAssignModeAndLevelID() {
        if (this.initParams.assignmentMode !== -1 && this.initParams.assignmentLevelId === -1) {
            this.initParams.assignmentLevelId = this.levelID;
        }
    }
}
