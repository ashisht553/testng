declare var algebra: any;
declare var underscore: any;
import { GameEngine } from '../engine/game.engine';
import { GameUserData } from "../../../shared/engine/game.user.data.service";
import { GoalAnimations } from '../component/game/goalAnimation';

declare var latextopngconverter: any;

/**
*  This class is the base class of all game state. It defined and implemented with all common functions and features for its children
*/

export abstract class GameState extends Phaser.State {
    protected homeButton: Phaser.Sprite;
    protected endSceenHomeButton: Phaser.Sprite;
    protected rewardGroup: Phaser.Group;
    protected levelStars: Array<Phaser.Group>;
    protected pointsText: Phaser.Text;
    protected BenchCards: Phaser.Group;
    protected benchCardArray: Array<any> = [];
    protected StartCard: Phaser.Group;
    protected AnswerCard: Phaser.Group;
    protected basketGroup: Phaser.Group;
    protected currentGroup: Phaser.Group;
    protected playerGroup: Array<Phaser.Group>;
    protected loseAudio: any;
    protected winAudio: any;
    //Animation Vars
    protected throw_Audio: any;
    protected cheers_Audio: any;
    protected slam_Audio: any;
    protected jump_Audio: any;
    protected ballMoveAudio: any;
    protected buttonClickAudio: any;
    protected startAudio1: any;
    protected startAudio2: any;
    protected prevGroup: Phaser.Group;
    protected undoIcon: Phaser.Sprite;
    protected undoRef: Phaser.Sprite;
    protected currentOptionClicked: Phaser.Sprite;
    protected orientationIntruction: Phaser.Group = null;
    protected gamePoints: number = 0;
    protected countGroup: Phaser.Group;
    protected countdownBg: Phaser.Sprite;
    protected counterHolder: Phaser.Sprite;
    protected prevUndoRef: Phaser.Sprite;
    protected countText: any;
    protected basketBall: any;
    protected ballBounceTween: any;
    protected hit: Phaser.Sprite;
    protected minX = 450;
    protected maxX = 1400;
    protected minY = 135;
    protected maxY = 425;
    protected bBoy: Phaser.Sprite;
    protected bBShadow: Phaser.Sprite;
    protected optionClickCount = 0;
    protected gameStateObject: any = [];
    protected textRef: Phaser.Text;
    protected basketSucessType = "short"; //short or long
    protected endScreen: Phaser.Sprite;
    protected confirmPopupGroup: Phaser.Group;
    protected zeroScored: Phaser.Group;
    protected gameOverBG: any;
    protected ribbonLeft: any;
    protected score: number = 0;
    protected bestScore: number = 300;
    protected scorePoints: number = 0;
    protected startCounter: number = 1;
    protected round: number = 1;
    protected prevRemainingShots: number = 0;
    protected scoreText: Phaser.BitmapText;
    protected playerTypes = [
        { name: 'gg1', height: 120, width: 120 },
        { name: 'gg2', height: 148, width: 120 },
        { name: 'gg3', height: 144, width: 120 },
        { name: 'bg', height: 121, width: 121 }
    ];
    protected replyBtn: Phaser.Sprite;
    protected isOn = false;
    protected bmd: any;
    // points arrays - one for x and one for y
    protected points = {
        'x': [1920, 1840, 1800, 1790],
        'y': [205, 215, 300, 500]
    };
    protected increment: any;
    protected indexOfCatmulCurveCounter = 0;
    protected timerSlot: any;

    protected nextBtn: Phaser.Sprite;
    protected lessThanZero: boolean = false;

    protected orientationInstrTextStyle = {
        font: '120px impact',
        align: 'center',
        fill: '#FF0000'
    }
    protected variableCardTextStyle: any = {
        font: '72px impact',
        fill: '#c05353'
    };

    protected star: number;

    protected gg1: Phaser.Sprite;
    protected gg2: Phaser.Sprite;

    protected bounceAnimation: any;
    protected badGuy: any;
    protected currentGrade: any;

    /* Data Engine */
    protected engine: GameEngine;

    /* Device Resolution */
    protected prevWindowWidth: number;
    protected prevWindowHeight: number;
    protected gameWidth: number;
    protected gameHeight: number;
    protected WHRATIO: number;
    protected BASE_GAME_WIDTH: number = 2048;
    protected BASE_GAME_HEIGHT: number = 1408;
    protected scaleRate: number;

    /* Game */
    protected gameWrapper: Phaser.Group;

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
    * this property will keep the style for the text to show
    */
    protected innerBoxGroup: any;

    protected shadow: any;

    /**
     * this property will hold the user leve data information
     */
    //userDataService: UserData.UserLevelInfo;
    userDataServiceCAS: GameUserData.gameUserDataService;

    /**
     * this property will be an object and hold all the intial parameters
     * required to load the game state
     */
    initParams: any;

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
     * this property is used to maintain index number for menu Unlock animation
     */
    protected animIndex: number;
    protected basketRimPoint: Phaser.Point;
    protected ballLandingPoint: Phaser.Point;
    protected basketGoal: any;
    soundBtn: Phaser.Sprite;
    yellowArrivalAudio: any;
    clickOnBallCardAudio: any;
    clickOnBallAudio: any;
    ballPassAudio: any;
    throughBallAudio: any;
    gameIntroAudio: any;
    game_Audio: any;
    jumpAudio: any;
    badGuyKnockedOnHeadAudio: any;
    shotClockAudio: any;
    star1and2Audio: any;
    star3Audio: any;
    assetsLoaded = false;
    protected shadowLine: number = 1;
    protected tutorial1VideoSource: any = null;
    protected tutorialVideo: Phaser.Video;
    protected videoTutorialSprite: any;
    protected videoField: Phaser.Graphics;
    assetsPathVideo: string = "assets/tutorial_videos/";
    protected isFraction = true;

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
    localization: any = {};	
	//levelEnds:boolean = false;
	
    loadtutorialVideo(vidName: string) {
        this.loadingSplash = true;
        this.game.load.video('dolby', this.assetsPathVideo + vidName);
    }
    /**
     * This is a inbuild function of Phaser State, it is called after constructor but before create().
     * Here used to initialize some properties and preparing for the resizing  
     */
    public init(param: any) {
        this.assetsLoaded = false
        this.initParams = param[0];
        this.initParams.urlParams.lang = "en";
        this.animIndex = param[1];

        //To make the video play only on the first load.
        if (this.initParams.playIntroVideo)
            this.initParams.playIntroVideo = false;

        this.WHRATIO = this.BASE_GAME_WIDTH / this.BASE_GAME_HEIGHT;

        this.userDataServiceCAS = this.initParams.userDataServiceCAS;

        // getting the levelData JSON from the game cache
        this.dataJSON = this.game.cache.getJSON('leveldata');

        this.engine = new GameEngine(this.game.cache.getJSON('leveldata'));

        this.levelID = this.initParams.levelID;

        this.levelIndex = Number(this.dataJSON.levelData.map(function (x: any) { return x.id; }).indexOf(this.levelID))

        this.updateAssignModeAndLevelID();

        // to disable pause on losing focus
        this.game.scale.forceOrientation(true, false);
        this.game.scale.enterIncorrectOrientation.add(this.handleIncorrect, this);
        this.game.scale.leaveIncorrectOrientation.add(this.handleCorrect, this);
        this.game.input.maxPointers = 1;
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.setResizeCallback(this.resizeGame, this);
        this.game.world.height = this.BASE_GAME_HEIGHT;
        this.game.world.width = this.BASE_GAME_WIDTH;
        this.tutorial1VideoSource = null;
        this.currentGrade = this.dataJSON.grade;

        if (this.dataJSON.levelData[this.levelIndex].negativeAllowed === 'no')
            this.lessThanZero = true;
        else
            this.lessThanZero = false;

        let splashTutorial = this.dataJSON.levelData.filter((item: any) => { return item.id === this.levelID })[0];
        if (typeof (splashTutorial.tutorial["T1"]) !== "boolean") {
            this.tutorial1VideoSource = splashTutorial.tutorial["T1"];
        }
    }


    public preload() {
        this.assetLoader();
        if (this.tutorial1VideoSource != null)
            this.loadtutorialVideo(this.tutorial1VideoSource);

        this.game.load.onLoadStart.add(this.loadStart, this);
        this.game.load.onFileComplete.add(this.fileComplete, this);
        this.game.load.onLoadComplete.add(this.loadComplete, this);
        this.game.load.onFileError.add(this.fileError, this);
        this.game.load.start();
    }

    /**
     * Loading the game assets
     */
    assetLoader() {
        /* load basketball background field */
        this.game.load.image('BackgroundField', 'assets/images/basketball_course.png');
        this.game.load.atlas('UI', 'assets/images/ui_assets.png', 'assets/data/ui_assets.json');

        /* load basket area field */
        this.game.load.image('basketBack', 'assets/images/basket_back.png');
        this.game.load.image('basketFront', 'assets/images/basket_front.png');

        /* load good guy and bad guys with shawdow */
        this.game.load.image('shadow', 'assets/images/shadow.png');
        //this.game.load.image('ball', 'assets/images/ball.png');
        this.game.load.image('PlayerUndo', 'assets/images/player_undo.png');
        this.game.load.image('dot', 'assets/images/dot.png');
        this.game.load.image('dotr', 'assets/images/dotr.png');
        this.game.load.image('popup_confirm', 'assets/images/popup_confirm.png');
        this.game.load.image('Star_Mask', 'assets/images/star_mask.png');
        this.game.load.image('Portrait_Screen', 'assets/images/portrait_screen.png');

        /* Bitmap fonts */
        this.game.load.bitmapFont('font_bold', 'assets/fonts/AvenirPrimaryHMHMath-Bold.png', 'assets/fonts/AvenirPrimaryHMHMath-Bold.fnt');
        this.game.load.bitmapFont('font_white', 'assets/fonts/AvenirPrimaryHMHMath-Black.png', 'assets/fonts/AvenirPrimaryHMHMath-Black.fnt');

        // background for gameover popup screen
        this.game.load.image('popup', 'assets/images/popup_confirm.png');
        // bench
        this.game.load.image('Bench', 'assets/images/bench.png');

        /* points background */
        this.game.load.image('Points_BG', 'assets/images/point_background.png');
        this.game.load.atlas('ball', 'assets/images/bouncing_ball.png', 'assets/images/bouncing_ball.json');
        this.game.load.atlas('hit', 'assets/images/hit_animation.png', 'assets/images/hit_animation.json');
        this.game.load.atlas('player', 'assets/images/characters.png', 'assets/images/characters.json');
        this.game.load.atlas('playerBad', 'assets/images/bg_hit.png', 'assets/images/bg_hit.json');

        this.game.load.atlas('BG_stretch', 'assets/images/bg_stretch.png', 'assets/images/bg_stretch.json');
        this.game.load.atlas('gg1_stretch', 'assets/images/gg1_stretch.png', 'assets/images/gg1_stretch.json');
        this.game.load.atlas('gg2_stretch', 'assets/images/gg2_stretch.png', 'assets/images/gg2_stretch.json');
        this.game.load.atlas('answerGuy', 'assets/images/gg3_stretch.png', 'assets/images/gg3_stretch.json');

        // Assests using for common imgages like home & rewards etc
        this.game.load.atlas('Basket_UI', 'assets/images/basket_UI.png', 'assets/images/basket_UI.json');

        //Audio
        this.game.load.audio('lose', 'assets/audio/brass_lose_march24.mp3');
        this.game.load.audio('win', 'assets/audio/brass_win_march31.mp3');
        this.game.load.audio('ballMoveAudio', 'assets/audio/generic_grass_placement.mp3');
        this.game.load.audio('buttonClick', 'assets/audio/generic_pop_V2.mp3');
        this.game.load.audio('startAudio1', 'assets/audio/generic_star_arpeggio1.mp3');
        this.game.load.audio('startAudio2', 'assets/audio/generic_star_arpeggio2.mp3');
        this.game.load.audio('yellowArrival', 'assets/audio/yellow_Bball_arrival.mp3');

        this.game.load.audio('clickOnBallCard', 'assets/audio/new_pop_Gb2.mp3');
        this.game.load.audio('clickOnBall', 'assets/audio/new_pop_E2.mp3');
        this.game.load.audio('ballPass', 'assets/audio/Passes_kik_E.mp3');
        this.game.load.audio('throughBall', 'assets/audio/fast_whoosh_E2.mp3');

        this.game.load.audio('jump', 'assets/audio/slide_whistle_up.mp3');
        this.game.load.audio('badGuyKnockedOnHead', 'assets/audio/wood_block.mp3');
        this.game.load.audio('shotClock', 'assets/audio/shot_clock_buzzer.mp3');
        this.game.load.audio('star1and2', 'assets/audio/star_Cmaj.mp3');
        this.game.load.audio('star3', 'assets/audio/star_Fmaj9.mp3');
        this.game.load.audio('throw_Sound', 'assets/audio/fast_whoosh_E2.mp3');
        this.game.load.audio('cheers_Sound', 'assets/audio/yay.mp3');
        this.game.load.audio('slam_Sound', 'assets/audio/punch_Ab.mp3');
        this.game.load.audio('jump_Sound', 'assets/audio/slide_whistle_up.mp3');
        this.game.load.audio('lose', 'assets/audio/brass_lose_march24.mp3');
        this.game.load.audio('win', 'assets/audio/brass_win_march31.mp3');
        this.game.load.audio('gameIntro_Sound', 'assets/audio/Afro_brazilian_intro.mp3');
        this.game.load.audio('game_Sound', 'assets/audio/Afro_Brazilian_Fun_FINAL_MUSIC_march24.mp3');

        //Video file loading
        this.game.load.video('end_animation', 'assets/videos/ending_animation.mp4');
    }

    /**
      * This method will get triggered when user view the game in wrong orientation (i.e portrait mode)
    */
    protected handleIncorrect() {
        this.orientationIntruction = this.game.add.group();
        let background = this.game.add.sprite(0, 0, "Portrait_Screen");
        background.width = this.BASE_GAME_WIDTH;
        background.height = this.BASE_GAME_HEIGHT;
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
      * This is a default function from Phaser.State, used here to initialize the different part on UI
     */
    create() {
        //this.localization = this.game.cache.getJSON('commontext');
        //this.getLocalizedText("assignment_done");
        this.engine.currentLevel = this.levelIndex;
        this.engine.setupGame(null);
        this.createAssets();
    }

    /**
     * It return text as per json key from the language(common) json
     *  @param 'key'  string
     */
    getLocalizedText(key: string) {
        if (this.initParams.commontext[key]) {
            return this.initParams.commontext[key];
        }
    }

    /**
    * It creates the UI related things for the game. Also initializes the game.
    */
    createAssets() {
        if (this.tutorial1VideoSource != null) {
            this.playVideo(false);
        }
        else {
            this.textStyle = { font: "2.2em font_impact", fill: "#2B92A1" };

            // adding game wrapper to so, we can scale wrapper to scale all elements
            this.gameWrapper = this.game.add.group();

            // adding background field
            let gameBg = this.gameWrapper.create(0, 0, 'BackgroundField');
            gameBg.width = this.game.width;
            gameBg.height = this.game.height;

            // Setting the increment value
            this.increment = 1 / this.game.width;

            this.playerGroup = [];

            this.createBasketBallGroup();

            this.bounceAnimation = this.basketBall.animations.add('bounce');
            if (this.basketBall.animations != undefined)
                this.basketBall.animations.play('bounce', 30, true);

            // adding cards background field
            let graphics_cards_bg = this.game.add.graphics(0, 0);
            graphics_cards_bg.beginFill(0x000000, 0.3);
            graphics_cards_bg.drawRect(0, 0, this.BASE_GAME_WIDTH, 250);
            graphics_cards_bg.endFill();

            let background = this.game.add.sprite(0, this.BASE_GAME_HEIGHT - 250, graphics_cards_bg.generateTexture());

            graphics_cards_bg.destroy();

            this.bmd = this.game.add.bitmapData(this.game.width, this.game.height);
            this.bmd.addToWorld();
            // Draw the path
            for (let j = 0; j < 1; j += this.increment) {
                let posx = Phaser.Math.catmullRomInterpolation(this.points.x, j);
                let posy = Phaser.Math.catmullRomInterpolation(this.points.y, j);
                this.bmd.rect(posx, posy, 3, 3, 'rgba(0, 0, 0, 0)');
            }

            //this.checkisFraction();

            this.createHomeButton(true);
            this.homeButton.inputEnabled = false;

            // init menu and points buttons
            this.initGameUIButtons();
            this.createAudioButton();
            this.addRewardPoints();

            // create variable cards
            this.createVariableCards();
            this.disableAllCards();
            this.addPlayerStartAndAnswer();
            this.addAudio();

            //this.settingUpGameOverUI(0, 300);
            //this.gameOverScreenGroup.visible = false;
        }
    }

    /**
    * To set the flag isFraction true/false depending on the card start value 
    */
    checkisFraction() {
        if (this.engine.startValue.isFraction)
            this.isFraction = true;
        else
            this.isFraction = false;
    }

    /**
     * To play the tutorial video.
     *  @param isInGame boolean. The isInGame flag checks the video is playing within between the level navigation or from the dynamic menu.
     */
    playVideo(isInGame: boolean) {
        this.videoField = this.game.add.graphics(0, 0);
        this.videoField.lineStyle(this.shadowLine, 0x000000, 0);
        this.videoField.drawRect(0, 0, this.BASE_GAME_WIDTH, this.BASE_GAME_HEIGHT);

        this.loadingSplash = false;
        this.tutorialVideo = this.game.add.video('dolby');
        this.videoTutorialSprite = this.tutorialVideo.addToWorld(this.game.world.centerX, this.game.world.centerY, 0.5, 0.5);
        this.videoTutorialSprite.width = this.videoField.getBounds().width / 1.2;
        this.videoTutorialSprite.height = this.videoField.getBounds().height / 1.2;
        let playBtn = this.game.add.sprite(0, 0, 'Basket_UI', 'btn_play0000');
        playBtn.scale.setTo(0.5);
        playBtn.anchor.setTo(0.5);
        this.videoTutorialSprite.addChild(playBtn);
        this.videoField.addChild(this.videoTutorialSprite);

        playBtn.inputEnabled = true;
        playBtn.input.useHandCursor = true;
        playBtn.events.onInputDown.add(() => {
            playBtn.visible = false;
            this.tutorialVideo.play(false);
        })

        if (this.game.device.desktop) {

            playBtn.visible = false;
            this.game.world.bringToTop(playBtn)
            this.tutorialVideo.play(false);
        }

        if (this.game_Audio != undefined || this.game_Audio != null)
            this.game_Audio.destroy();

        this.tutorialVideo.onComplete.add(() => {
            this.tutorial1VideoSource = null;
            this.videoField.destroy();
            this.videoTutorialSprite.destroy();
            this.tutorialVideo.destroy();

            if (this.videoBG != null || this.videoBG != undefined)
                this.videoBG.destroy();

            if (isInGame) {
                this.resetGame();
                this.addRewardPoints();
                this.loadingText.destroy();
                this.loadingImage.destroy();
                if (this.loadingSplash) {
                    this.loadingSplash = false;
                }
            }
            else {
                this.createAssets();
            }
        });

        // to disable video click skip make the follwing property false
        this.videoTutorialSprite.inputEnabled = true;

        this.tutorialVideo.onPlay.add((e: any) => {
        });

        this.game.cache.removeVideo("dolby");
    }


    /**
     * Creates phaser button to play/pause the audio.
     */

    protected createAudioButton() {
        this.soundBtn = this.game.add.sprite(this.homeButton.x + 240, 25, 'Basket_UI', 'btn_sound_ON0000');
        this.soundBtn.y = 100;
        this.soundBtn.anchor.setTo(0.5);
        this.soundBtn.inputEnabled = true;
        this.soundBtn.input.useHandCursor = true;
        this.soundBtn.input.pixelPerfectClick = true;
        this.soundBtn.input.pixelPerfectOver = true;

        /**
         * Keeping the audio button state as mute or unmute
         * 
         */
        if (this.initParams.audiomute) {
            this.soundBtn.frameName = "btn_sound_OFF0000";
        }

        this.soundBtn.events.onInputDown.add((e: any) => {
            if (this.soundBtn.frameName === "btn_sound_ON0000") {
                this.soundBtn.frameName = "btn_sound_OFF0000";
                this.initParams.audiomute = true;
                this.game.sound.mute = this.initParams.audiomute;
            } else {
                this.soundBtn.frameName = "btn_sound_ON0000";
                this.initParams.audiomute = false;
                this.game.sound.mute = this.initParams.audiomute;
            }
        });
    }

    /**
     *  To get the data persisted star count.
     */
    protected getDPStarCount() {
        let dpService;

        if (this.initParams.assignmentMode == -1) {
            dpService = this.userDataServiceCAS.annotationService.gameUserData.GameInfo.levelInfos[this.engine.currentLevel];
        }

        return dpService != undefined ? this.userDataServiceCAS.annotationService.gameUserData.GameInfo.levelInfos[this.engine.currentLevel].awardInfo.stars : 0;
    }


    protected createBasketBallGroup() {
        if (this.basketGroup != undefined) {
            this.basketGroup.destroy();
        }

        // Group the Basket
        this.basketGroup = this.game.add.group();

        // Add the back of Basket
        let basketBackHalf = this.basketGroup.create(this.game.world.width - 300, 405, 'basketBack');

        // Add the Basket Ball
        this.basketBall = this.basketGroup.create(-250, 500, 'ball');

        // Add the front of Basket
        let basketFrontHalf = this.basketGroup.create(this.game.world.width - 300, 168, 'basketFront');
        // Add All elements in the Group
        this.basketGroup.add(basketBackHalf);
        this.basketGroup.add(this.basketBall);
        this.basketGroup.add(basketFrontHalf);
        this.basketRimPoint = new Phaser.Point(basketFrontHalf.x - basketFrontHalf.width + 10, 170);
    }


    /**
     *  preloads all the audio.
     */
    addAudio() {
        this.loseAudio = this.createAudioObject('lose');
        this.winAudio = this.createAudioObject('win');
        this.ballMoveAudio = this.createAudioObject('ballMoveAudio');
        this.buttonClickAudio = this.createAudioObject('buttonClick');
        this.startAudio1 = this.createAudioObject('startAudio1');
        this.startAudio2 = this.createAudioObject('startAudio2');
        this.yellowArrivalAudio = this.createAudioObject('yellowArrival');
        this.clickOnBallCardAudio = this.createAudioObject('clickOnBallCard');
        this.clickOnBallAudio = this.createAudioObject('clickOnBall');
        this.ballPassAudio = this.createAudioObject('ballPass');
        this.throw_Audio = this.createAudioObject('throw_Sound');
        this.cheers_Audio = this.createAudioObject('cheers_Sound');
        this.slam_Audio = this.createAudioObject('slam_Sound');
        this.jump_Audio = this.createAudioObject('jump_Sound');
        this.badGuyKnockedOnHeadAudio = this.createAudioObject('badGuyKnockedOnHead');
        this.shotClockAudio = this.createAudioObject('shotClock');
        this.star1and2Audio = this.createAudioObject('star1and2');
        this.star3Audio = this.createAudioObject('star3');

        this.game.load.audio('yellowArrival', 'assets/audio/yellow_Bball_arrival.mp3');
        this.game.load.audio('clickOnBallCard', 'assets/audio/new_pop_Gb2.mp3');
        this.game.load.audio('clickOnBall', 'assets/audio/new_pop_E2.mp3');
        this.game.load.audio('ballPass', 'assets/audio/passes_kik_E.mp3');
        this.game.load.audio('throw_Sound', 'assets/audio/fast_whoosh_E2.mp3');
        this.game.load.audio('cheers_Sound', 'assets/audio/yay.mp3');
        this.game.load.audio('slam_Sound', 'assets/audio/punch_Ab.mp3');
        this.game.load.audio('jump_Sound', 'assets/audio/slide_whistle_up.mp3');
        this.game.load.audio('badGuyKnockedOnHead', 'assets/audio/wood_block.mp3');
        this.game.load.audio('shotClock', 'assets/audio/shot_clock_buzzer.mp3');
        this.game.load.audio('star1and2', 'assets/audio/star_Cmaj.mp3');
        this.game.load.audio('star3', 'assets/audio/star_Fmaj9.mp3');
    }

    /**
     *  Adds the sprite animation for start guy and the answer guy
     */
    addPlayerStartAndAnswer() {
        //adding player to game, for now adding all four players to check show how it will lool
        let startValue: any;
        let answerValue: any;

        if (this.engine.startValue.isFraction) {
            startValue = this.engine.startValue.latexString;
            answerValue = this.engine.answerFractionString.latexString;

            this.resultValue = this.engine.startValue;
        }
        else {
            startValue = (this.engine.startActor.value).toString();
            if (this.engine.answerFractionString != undefined && this.engine.answerFractionString.value.denom != undefined && this.engine.answerFractionString.value.denom > 1 && this.engine.isFraction) {
                answerValue = this.engine.factionOperation("/", this.engine.answerFractionString.value.numer, this.engine.answerFractionString.value.denom).latexString;
            }
            else if (this.engine.answerFractionString != undefined && this.engine.answerFractionString.fractionString != undefined && this.engine.answerFractionString.fractionString.denom > 1 && this.engine.isFraction) {
                answerValue = this.engine.factionOperation("/", this.engine.answerFractionString.fractionString.numer, this.engine.answerFractionString.fractionString.denom).latexString;
            }
            else {
                answerValue = (this.engine.answerActor.value).toString();
                let tempAnsValue = algebra.parse(answerValue).constant();
            }
        }

        this.addPlayer(3, { x: this.game.world.width - 230, y: 395, directionFrom: 'right' }, this.engine.randomGoodGuy[this.optionClickCount].value, undefined, false, (player: any, type: any) => {
            this.addPlayer(0, { x: 350, y: 300, directionFrom: 'left' }, startValue, undefined, false, (player: any, type: any) => {
                this.popjerseyNo(player.children[2]);
                this.yellowArrivalAudio.play();
                this.passTheballTo({
                    passToPlayer: true, player: player, type: type, callBack: () => {
                        this.addPlayer(2, { x: 1580, y: 140, directionFrom: 'left' }, answerValue, "#da2c2c", false, (player: any, type: any) => {
                            this.popjerseyNo(player.children[2]);
                            this.enableCards();
                            this.homeButton.inputEnabled = true;
                            this.homeButton.input.useHandCursor = true;
                        });
                    }
                });
            });
        });

        if (this.gameIntroAudio == undefined)
            this.gameIntroAudio = this.createAudioObject('gameIntro_Sound');

        if (this.game_Audio == undefined)
            this.game_Audio = this.game.add.audio('game_Sound');

        this.gameIntroAudio.play();
    }

    /**
     * Creates an audio object with audio type as input.
     * @param audioType string
     */
    createAudioObject(audioType: string) {
        let audio = this.game.add.audio(audioType);
        return audio;
    }

    protected plot() {
        let stikerObjGroup = this.playerGroup[2];
        stikerObjGroup.children[0].visible = true;
        Object(stikerObjGroup.children[1]).animations.play('playOnce');
        if (this.basketSucessType == "short")
            stikerObjGroup.children[2].visible = true;
    }

    /**
     * Saves current player
     */
    protected currentPlayer: any;

    /**
     * To play the bad guy take ball away animation at the end of round
     * @param type string. Specifies the player move. It's values are normal/undo.
     */
    protected badBoyTakeBall(type: string) {
        let lastPlayerPos: any;
        let player: any;

        if (type === 'undo') {
            player = this.currentPlayer;

        } else {
            lastPlayerPos = this.playerGroup.length - 1;
            player = this.playerGroup[lastPlayerPos];
        }

        this.badGuy = this.addPlayer(3, { x: player.x, y: player.y, directionFrom: 'right' }, this.engine.randomGoodGuy[this.optionClickCount].value, undefined, false, (player: any, type: any) => {
            this.setMood('sad');
            this.popjerseyNo(player.children[2]);
            this.basketBall.animations.play('bounce', 30, true);
            this.playerGroup[this.playerGroup.length - 1].children[2].visible = false;

            this.passTheballTo({
                passToPlayer: true, player: this.playerGroup[this.playerGroup.length - 1], type: this.playerTypes[2], callBack: () => {
                    this.playerGroup[this.playerGroup.length - 1].add(this.basketBall);
                    this.playerGroup[this.playerGroup.length - 1].children[3].x = this.playerGroup[this.playerGroup.length - 1].children[2].x + 2035;
                    this.playerGroup[this.playerGroup.length - 1].children[3].y = this.playerGroup[this.playerGroup.length - 1].y;
                    let tweenWaitTrigger = this.game.add.tween(this.playerGroup[this.playerGroup.length - 1]).to({ x: -2250 }, 1550, Phaser.Easing.Linear.None, true);
                    tweenWaitTrigger.onComplete.add(() => {
                        let tweenWait = this.game.add.tween(this.playerGroup[this.playerGroup.length - 1]).to({ x: -2250 }, 450, Phaser.Easing.Linear.None, true);
                        tweenWait.onComplete.add(() => {
                            if (this.round == 3) {
                                this.settingUpGameOverUI(0, 300);
                                this.addRewardStarForGameOver(this.gameOverBG, this.ribbonLeft, this.star);
                                //this.gameOverScreenGroup.visible = true;
                                this.animation();
                                this.game.world.bringToTop(this.gameOverScreenGroup);
                            }
                            else {
                                //lessThanZero
                                this.resetGame();
                            }
                            this.round++;
                        });
                    });
                }
            });
        });
    }

    /**
     * Converts latext string to png image
     * @param str string. Latex string.
     */
    protected getLatexFraction(str: string) {
        let sprite = this.game.add.sprite(100, 100, 'Basket_UI', 'card0000');
        let text1 = this.game.add.sprite(0, 0, '');
        text1.data.image = new Image();
        latextopngconverter(str, { scale: 3.2, fill: '#ffffff' }, (output: any) => {
            text1.data.image.src = output.img;
        });
        text1.data.image.onload = () => {
            this.game.cache.addImage('latex', text1.data.image.src, text1.data.image);
            let tmpImage = this.game.add.sprite(0, 0, 'latex');
            text1.texture = tmpImage.generateTexture();
            tmpImage.destroy();
            text1.x = (sprite.width - text1.width) / 2 - 5;
            text1.y = ((sprite.height - text1.height) / 2) - 25;
            text1.y = ((sprite.height - text1.height) / 2) - 15;
            text1.scale.setTo(0.73);
            sprite.addChild(text1);
            return sprite;
        }
    }


    protected resultValue: any;

    /**
     * Called when the user clicks on the card options at the bottom.
     * @param index number. Is the index number of the option clicked
     * @param type number. Is the player type
     */
    protected onOptionClick(index: number, type: number) {
        this.clickOnBallAudio.play();
        this.decreaseCounter();
        this.disableAllCards();
        let operator: string = this.engine.randomCardValues[index].operationSymbol;
        let leftOperand: any = (this.engine.startValue.value).toString();
        let rightOperand: number = this.engine.randomCardValues[index].value;
        var resultSprite: any;

        if (this.engine.startActor.isFraction)
            leftOperand = this.engine.startValue.fractionString;
        if (this.optionClickCount == 0) {
            if (this.engine.randomCardValues[index].isFraction) {
                this.resultValue = this.engine.fractionOperation(operator, leftOperand, this.engine.randomCardValues[index].fractionString);
                this.engine.randomGoodGuy[this.optionClickCount].value = this.resultValue.value;
            }
            else {
                this.resultValue = this.engine.fractionOperation(operator, leftOperand, rightOperand.toString());
                this.engine.randomGoodGuy[this.optionClickCount].value = this.resultValue.value;
            }
        }
        else {
            let leftOperand: number = this.engine.randomGoodGuy[this.optionClickCount - 1].value;
            let rightOperand: number;

            if (this.engine.randomCardValues[index].isFraction) {
                rightOperand = this.engine.randomCardValues[index].fractionString;
                this.resultValue = this.engine.fractionOperation(operator, leftOperand, rightOperand.toString());
                this.engine.randomGoodGuy[this.optionClickCount].value = this.resultValue.value;
            }
            else {
                rightOperand = this.engine.randomCardValues[index].value;
                this.resultValue = this.engine.fractionOperation(operator, leftOperand, rightOperand.toString());
                this.engine.randomGoodGuy[this.optionClickCount].value = this.resultValue.value;
            }
        }

        if (this.optionClickCount == this.engine.randomGoodGuy.length - 1 && this.engine.randomGoodGuy.length > 1) {
            //this.scoreText.text = "0";
            //this.scoreText.align = "center";
            this.addPlayer(type, { x: this.getBoundingPosition(this.optionClickCount).x, y: this.getBoundingPosition(this.optionClickCount).y, directionFrom: 'left' }, this.resultValue.latexString, undefined, true, (player: any, type: any) => {
                this.badBoyTakeBall('normal');
            });

        }
        else {
            let ansDiff: any = Math.abs((this.engine.randomGoodGuy[this.optionClickCount].value) - this.engine.answerActor.value);
            let randomGuyValue = (this.engine.randomGoodGuy[this.optionClickCount].value);
            let answerActor = this.engine.answerActor.value;
            randomGuyValue = algebra.parse(randomGuyValue.toString()).constant();
            answerActor = algebra.parse(answerActor.toString()).constant();
            if ((randomGuyValue.numer == answerActor.numer && randomGuyValue.denom == answerActor.denom) || ansDiff == 0.01) {
                this.bBShadow = this.game.add.sprite(1820, 850, 'shadow');
                this.bBShadow.anchor.set(0.5);
                this.playerGroup[0].visible = false;
                this.bBoy = this.game.add.sprite(1820, 770, 'playerBad');
                this.bBoy.anchor.set(0.5);
                this.bBoy.animations.add('idle', ["bg_hit0014"], 5, false);
                let angAnim = this.bBoy.animations.add('angryHit', Phaser.Animation.generateFrameNames('bg_hit', 1, 13, '', 4), 20, false);
                angAnim.onComplete.add(() => { this.bBoy.visible = false; this.bBShadow.visible = false; this.playerGroup[0].visible = true; });

                let passBallTrigger = this.bBoy.animations.play('idle');
                passBallTrigger.onComplete.add(() => {

                    this.passTheballTo({ passToPlayer: true, player: this.playerGroup[2], type: this.playerTypes[2] });

                    this.showStars();

                    if (this.basketSucessType == "short")
                        this.basketTheBall(true);
                    else
                        this.basketTheBall(false);

                }, this);

                this.disableAllCards();


            } else {
                this.addPlayer(type, { x: this.getBoundingPosition(this.optionClickCount).x, y: this.getBoundingPosition(this.optionClickCount).y, directionFrom: 'left' }, this.resultValue.latexString, undefined, true, (player: any, type: any) => {
                    this.popjerseyNo(player.children[2]);
                    this.passTheballTo({ passToPlayer: true, player: player, type: type });
                    this.basketBall.animations.play('bounce', 30, true);
                    if (this.engine.counter > 0) {
                        this.undoRef = this.currentGroup.add(this.undoIcon);
                        this.undoRef.inputEnabled = true;
                        this.undoRef.input.useHandCursor = true;
                        this.undoRef.events.onInputDown.addOnce(() => {
                            this.basketBall.animations.play('bounce', 30, true);
                            this.clickOnBallCardAudio.play();
                            this.basketSucessType = "long";
                            this.undoClickHandler(type);
                        })
                    }

                    this.onPlayerAdded();
                    if (this.engine.counter > 0) {
                        this.passTheballTo({ passToPlayer: true, player: player, type: type });

                        if (this.currentGrade != 'g6' && (this.lessThanZero && this.resultValue.value < 0)) {
                            this.moveBallOut('normal');
                            this.hideAllUndoIcons(this.gameStateObject);
                        }
                    }
                    else {
                        this.moveBallOut('normal');
                    }
                });
            }

        }

        this.hideAllUndoIcons(this.gameStateObject);

        if (this.engine.counter <= 0) {
            this.disableAllCards();
        }
    }


    /**
     * To show stars 1, 2 or 3 
     */
    protected showStars() {
        if (this.engine.counter == (Number(this.engine.levelData.shotClockStart) - (this.benchCardArray.length - 1))) {
            //show 3 stars
            this.startAudio2.play();
        } else if (this.engine.counter == (Number(this.engine.levelData.shotClockStart - 2) - (this.benchCardArray.length - 1))) {
            //show 2 stars
            this.startAudio2.play();
        } else {
            //show 1 star
            this.startAudio1.play();
        }
    }

    /**
     * Stores player related data as per optionClickCount
     */
    protected onPlayerAdded() {
        this.gameStateObject[this.optionClickCount] = {};
        this.gameStateObject[this.optionClickCount].playerRef = this.currentGroup;
        this.gameStateObject[this.optionClickCount].undoRef = this.undoRef;
        this.gameStateObject[this.optionClickCount].cardRef = this.currentOptionClicked;
        this.gameStateObject[this.optionClickCount].textRef = this.textRef;

        if (this.currentGrade == 'g6' || !this.lessThanZero || (this.currentGrade != 'g6' && this.resultValue.value >= 0))
            this.enableCards();

        if (this.engine.counter <= 0)
            this.disableAllCards();

        this.optionClickCount++;
    }

    /**
     * When the user incorrectly answers a round then the animaiton move ball away/out is called 
     */
    protected moveBallOut(type: string) {
        this.shotClockAudio.play();
        this.badBoyTakeBall(type);
    }

    /**
     * The handler for undo button click 
     */
    protected undoClickHandler(type: string) {
        if (this.gameStateObject.length > 1) {
            this.gameStateObject[this.gameStateObject.length - 2].undoRef.visible = true;
            this.passTheballTo({ passToPlayer: true, player: this.gameStateObject[this.gameStateObject.length - 2].playerRef, type: type });
        }
        else {
            this.passTheballTo({ passToPlayer: true, player: this.playerGroup[1], type: type });
        }
        this.gameStateObject[this.gameStateObject.length - 1].undoRef.visible = false;
        this.game.add.tween(this.gameStateObject[this.gameStateObject.length - 1].playerRef).to({ x: -1200 }, 1000, Phaser.Easing.Linear.None, true);
        this.gameStateObject[this.gameStateObject.length - 1].cardRef.frameName = ("card0000");
        this.gameStateObject[this.gameStateObject.length - 1].cardRef.inputEnabled = true;
        this.gameStateObject[this.gameStateObject.length - 1].cardRef.input.useHandCursor = true;
        this.optionClickCount--;
        this.decreaseCounter();
        if (this.engine.counter <= 0) {
            this.disableAllCards();
            this.moveBallOut('undo');
        }
        this.gameStateObject.splice(this.gameStateObject.length - 1, 1);
    }

    /**
     * To hide undo icon
     */
    protected hideAllUndoIcons(undoOptionArr: Array<any>) {
        for (var i = 0; i < undoOptionArr.length; i++) {
            if (undoOptionArr[i] != undefined)
                undoOptionArr[i].undoRef.visible = false;
        }
    }

    /**
     * To disable all option cards at the bottom
     */
    protected disableAllCards() {
        this.hideAllUndoIcons(this.gameStateObject);
        for (var i = 0; i < this.benchCardArray.length; i++) {
            if (this.benchCardArray[i] != undefined) {
                this.benchCardArray[i].inputEnabled = false;
            }
        }
        this.homeButton.inputEnabled = false;
    }

    /**
     * To enable all option cards at the bottom
     */
    protected enableCards() {
        for (var i = 0; i < this.benchCardArray.length; i++) {
            if (this.benchCardArray[i] != undefined) {
                if (this.benchCardArray[i].frameName == "card0000") {
                    this.benchCardArray[i].inputEnabled = true;
                    this.benchCardArray[i].input.useHandCursor = true;
                }
            }
        }
        this.homeButton.inputEnabled = true;
    }

    /**
     * To show undo icon
     */
    protected showUndoIcon(undoOptionArr: Array<any>, i: number) {
        if (undoOptionArr[i] != undefined)
            undoOptionArr[i].undoRef.visible = true;
    }

    /**
     * To show Dunk/Shot animation at the end of a round
     * isDunk is boolean. If is dunk is true then dunk animation else shot animation
     */
    protected basketTheBall(isDunk: boolean) {
        let actionType = isDunk || false;
        let stikerObjGroup = this.playerGroup[2];

        this.hit = this.game.add.sprite(1820, 340, 'hit');
        this.hit.anchor.set(0.5);
        this.hit.animations.add('hit');
        this.hit.visible = false;

        this.ballLandingPoint = new Phaser.Point(this.bBoy.x + this.bBoy.width / 2, this.bBoy.y - this.bBoy.width / 2);
        this.basketGoal = new GoalAnimations(this.game, stikerObjGroup, this.bBoy, this.basketBall, this.hit, this);
        if (actionType) {
            // Dunk Action
            Object(stikerObjGroup.children[1]).anchor.y = 0.5;
            Object(stikerObjGroup.children[1]).animations.play('playOnce');
            let preJumpAnim = this.game.add.tween(stikerObjGroup.children[1].scale).to({ y: 0.8 }, 450, Phaser.Easing.Linear.None, true);
            preJumpAnim.onComplete.add(() => {
                this.basketBall.animations.stop(null, true);
                // Diable jersey No
                stikerObjGroup.children[2].visible = false;
                this.onDunkClick();
            }, this);
        } else {
            // Shot Action
            Object(stikerObjGroup.children[1]).animations.play('playOnce');
            this.passTheballTo({ passToPlayer: true, player: stikerObjGroup, type: this.playerTypes[2], callBack: this.onShootClick, waitTime: 1000 });
        }
    }

    /**
     *  It creates the game over screen to be shown at the end of a round/level
     */
    settingUpGameOverUI(score: any, best: any) {
        this.gameOverScreenGroup = this.game.add.group();
        this.gameOverScreenGroup.x = 0;
        this.gameOverScreenGroup.y = 0;

        /* Game Over screen BG */
        this.shadow = this.game.add.sprite(0, 0, "Bench");

        this.shadow.width = this.game.world.width;
        this.shadow.height = this.game.world.height;
        this.shadow.inputEnabled = true;
        this.gameOverScreenGroup.addChild(this.shadow)

        this.innerBoxGroup = this.game.add.group();

        /* Game Over screen BG */
        let gameOverBG = this.game.add.image(this.game.world.centerX, this.game.world.centerY, 'popup', "", this.innerBoxGroup);
        gameOverBG.anchor.set(0.5);
        gameOverBG.scale.set(1, 1.25);

        let ribbonLeft = this.game.add.sprite(gameOverBG.x - 365, 120, 'Basket_UI', 'ribbon0000', this.innerBoxGroup);
        ribbonLeft.anchor.set(0.5, 0);

        let ribbonRight = this.game.add.sprite(gameOverBG.x + (ribbonLeft.width / 2), 120, 'Basket_UI', 'ribbon0000', this.innerBoxGroup);
        ribbonRight.anchor.set(0.5, 0);
        ribbonRight.scale.x = -1;


        this.gameOverBG = gameOverBG;
        this.ribbonLeft = ribbonLeft;
        let btnActionScale = 1;

        this.replyBtn = this.game.add.sprite(gameOverBG.x - 170, gameOverBG.y + 190, 'Basket_UI', 'btn_again0000', this.innerBoxGroup);
        this.replyBtn.anchor.setTo(btnActionScale);
        this.replyBtn.scale.setTo(btnActionScale)
        this.replyBtn.inputEnabled = true;
        this.replyBtn.input.pixelPerfectOver = true;
        this.replyBtn.input.pixelPerfectClick = true;
        this.replyBtn.input.useHandCursor = true;
        this.replyBtn.events.onInputDown.addOnce(() => {
            this.round = 1;
            this.startCounter = 1;
            this.prevRemainingShots = 0;
            this.scorePoints = 0;
            this.score = 0;
            this.hideStars();
            this.resetGame();
            this.addRewardPoints();
        });

        this.nextBtn = this.game.add.sprite(gameOverBG.x + 160, gameOverBG.y + 190, 'Basket_UI', 'btn_next0000', this.innerBoxGroup);
        this.nextBtn.anchor.setTo(btnActionScale);
        this.nextBtn.scale.setTo(btnActionScale);
        this.nextBtn.inputEnabled = true;
        this.nextBtn.input.pixelPerfectOver = true;
        this.nextBtn.input.pixelPerfectClick = true;
        this.nextBtn.input.useHandCursor = true;
        this.nextBtn.events.onInputDown.addOnce(() => {
            this.engine.currentLevel++;
            this.round = 1;
            this.startCounter = 1;
            this.prevRemainingShots = 0;
            this.scorePoints = 0;
            this.score = 0;
            this.hideStars();

            if (this.engine.currentLevel <= this.engine.data.levelData.length - 1)
                this.tutorial1VideoSource = this.engine.data.levelData[this.engine.currentLevel].tutorial.T1;

            if (this.tutorial1VideoSource != null) {
                this.loadtutorialVideo(this.tutorial1VideoSource);
                this.loadingSplash = true;
                this.game.load.onLoadStart.add(this.loadStart, this);
                this.game.load.onFileComplete.add(this.fileComplete, this);
                this.game.load.onLoadComplete.add(this.videoLoadComplete, this);
                this.game.load.onFileError.add(this.fileError, this);
                this.game.load.start();
            }
            else {
                if (this.starCount >= 1 && this.engine.currentLevel > this.engine.data.levelData.length - 1) {
					//this.levelEnds = true;
					//this.addEndVideo();
                    this.playEndAnimation();
                    this.initParams.gameEndAnimBool = true;
                }
                else {
                    this.resetGame();
                    this.addRewardPoints();
                }
                this.loadingSplash = false;
            }
        });

        this.endSceenHomeButton = this.game.add.sprite(gameOverBG.x + 425, gameOverBG.y + 150, 'Basket_UI', 'btn_home0000', this.innerBoxGroup);
        this.endSceenHomeButton.anchor.setTo(btnActionScale);
        this.endSceenHomeButton.scale.setTo(btnActionScale);
        this.endSceenHomeButton.inputEnabled = true;
        this.endSceenHomeButton.input.pixelPerfectOver = true;
        this.endSceenHomeButton.input.pixelPerfectClick = true;
        this.endSceenHomeButton.input.useHandCursor = true;
        this.endSceenHomeButton.events.onInputDown.add(() => {
            this.round = 1;
            this.startCounter = 1;
            this.prevRemainingShots = 0;
            this.scorePoints = 0;
            this.score = 0;
            this.hideStars();
            this.clearLevelData();
            this.gotoMenu();
        });
         this.checkCompletion();
        if (this.initParams.assignmentMode !== -1 && (this.initParams.assignmentLevelId === this.levelID) && this.starCount >= 1) {
            let congratText = this.game.add.bitmapText(gameOverBG.x - 150, gameOverBG.y + 230, 'font_bold', this.wrapText(this.getLocalizedText("assignment_done"), 11), 85, this.innerBoxGroup);

            congratText.tint = 0x000;
            congratText.align = "center";

            congratText.anchor.setTo(0.5, 1);
            congratText.tint = 0xfb5606;
            congratText.smoothed = true;

            congratText.rotation = -.15;
            congratText.visible = false;
            switch (this.initParams.urlParams.style) {
                case "1":
                    congratText.scale.set(4, 4);
                    break;

                case "2":
                    congratText.scale.set(4, 4);
                    break;

                case "3":
                    congratText.scale.set(.05, 0.05);
                    break;
            }
            this.innerBoxGroup.addChild(congratText);

            var hit = this.game.add.sprite(congratText.x + 140, congratText.y - 550, 'hit', this.innerBoxGroup);
            hit.anchor.set(0.5);
            hit.animations.add('hit');
            hit.visible = false;
            this.innerBoxGroup.addChild(hit);

            this.replyBtn.visible = false;
            this.replyBtn.inputEnabled = false;
            this.replyBtn.input.useHandCursor = false;

            this.nextBtn.x += 250;
            this.nextBtn.y -= 50;
            this.endSceenHomeButton.x = this.nextBtn.x - 25;
            this.endSceenHomeButton.y = this.nextBtn.y + this.nextBtn.height + 40;

            var congTween: any;
            switch (this.initParams.urlParams.style) {
                case "1":
                    congTween = this.game.add.tween(congratText.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Quartic.InOut, true, 1250, 0, false);
                    break;
                case "2":
                    congTween = this.game.add.tween(congratText.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Bounce.Out, true, 1250, 0, false);
                    break;
                case "3":
                    congTween = this.game.add.tween(congratText.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Bounce.In, true, 1250, 0, false);
                    break;
            }

            congTween.onStart.add(() => {
                congratText.visible = true;
                hit.visible = true;
                hit.animations.play('hit', 8, false, true);
            });
        }

        this.settingStars();
        this.innerBoxGroup.y = this.game.world.height;
        this.gameOverScreenGroup.addChild(this.innerBoxGroup);
        this.gameOverScreenGroup.visible = true;
        this.addEndVideo();
    }

    /**
     *  To assign word wrap("\n") for any text
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

    animation() {
        let tween = this.game.add.tween(this.shadow);
        this.shadow.alpha = 0
        tween.to({ alpha: 1 }, 500, Phaser.Easing.Bounce.Out, true, 0);
        tween.onComplete.addOnce(() => {
            let ypos = ((this.game.world.height - this.innerBoxGroup.height) / 2) / 4
            let tween2 = this.game.add.tween(this.innerBoxGroup);
            tween2.to({ y: ypos }, 1000, Phaser.Easing.Elastic.Out, true, 0)
            tween2.onComplete.addOnce(() => {
                let hit = this.game.add.sprite(this.gameOverBG.x, this.gameOverBG.y / 1.5, 'hit', this.innerBoxGroup);
                hit.anchor.set(0.5);
                hit.animations.add('hit');
                hit.visible = false;
            })
        });

        this.game_Audio.play();
        this.game_Audio.loop = true;
        this.game_Audio.volume = 0.2;
    }

    settingStars() {
        let levelInfos = this.userDataServiceCAS.gameUserData.GameInfo.levelInfos;

        this.checkCompletion();
        let dpStarCount = this.getDPStarCount();

        if (this.starCount >= 1 && this.engine.currentLevel >= this.engine.data.levelData.length - 1) {
            if (this.endSceenHomeButton != undefined)
                this.endSceenHomeButton.visible = false;
            this.replyBtn.visible = false;
        }

        let starCount = 0;
        if (dpStarCount != undefined)
            starCount = (this.starCount > dpStarCount) ? this.starCount : dpStarCount;
        else
            starCount = this.starCount

        this.levelIndex = this.engine.currentLevel;
        this.levelID = this.dataJSON.levelData[this.engine.currentLevel].id;

        let checkStatus = starCount > 0 ? true : false;

        levelInfos[this.levelIndex] = {
            levelId: this.levelID,
            completed: checkStatus,
            awardInfo: {
                score: 0,
                stars: starCount
            }
        }
        this.userDataServiceCAS.saveGameUserData(levelInfos, this);

        if (this.engine.currentLevel >= this.engine.data.levelData.length - 1) {
            if (checkStatus) {
                this.initParams.gameEndAnimBool = true;
            }
        }
        this.nextBtn.visible = checkStatus;

        if (this.starCount <= 0 && this.engine.currentLevel >= this.engine.data.levelData.length - 1) {
            this.nextBtn.visible = false;
        }
    }

    userDataServiceCallBack(userData: any, success?: boolean) {

    }

    onDunkClick() {
        let guyLandingPoint = new Phaser.Point(this.BASE_GAME_WIDTH - 250, 350);
        this.basketGoal.startDunkAnimation(guyLandingPoint, this.ballLandingPoint, this.basketRimPoint);
    }

    onShootClick() {
        setTimeout(() => { this.basketGoal.startShootAnimation(this.ballLandingPoint, this.basketRimPoint); }, 500);
    }

    onDunkFinished(classinst: any) {
        classinst.calculatePoint();
        this.correctSFXPlay(true);
        this.plot();
    }

    onShootFinished(classinst: any) {
        classinst.calculatePoint();
        this.correctSFXPlay(true);
    }

    protected correctSFXPlay(type: boolean) {
        if (type)
            this.setMood('happy');
        setTimeout(() => { this.roundEnds(); }, 2000);
    }


    protected roundEnds() {
        if (this.round == 3) {

            this.settingUpGameOverUI(0, 300);
            this.addRewardStarForGameOver(this.gameOverBG, this.ribbonLeft, this.star);
            //this.gameOverScreenGroup.visible = true;
            this.animation();
            this.game.world.bringToTop(this.gameOverScreenGroup);
        }
        else {
            this.resetGame();
        }

        this.round++;
    }

    protected _postBallBounce(type: boolean) {
        let stikerObjGroup = this.playerGroup[1];
        let BasketAnim = this.game.add.tween(stikerObjGroup.children[1]).to({ angle: 0 }, 50, Phaser.Easing.Linear.None, true);
        BasketAnim.onComplete.add(() => {
            this.isOn = type;
        });
    }

    protected badGuyThroughBall() {
        let badBoyObj = this.playerGroup[this.playerGroup.length - 1];
        this.passTheballTo({
            passToPlayer: true, player: badBoyObj, type: { name: 'bg', height: 121, width: 121 }, callBack: () => {
                this.passTheballTo({ passToPlayer: false, positionX: -100, positionY: badBoyObj.y });
            }
        });
    }

    protected attemptsFinishThroughBall() {
        this.passTheballTo({ passToPlayer: false, positionX: 1820, positionY: -100 });
    }

    protected addBenchEvent(btn: any) {
        btn.inputEnabled = true;
        btn.input.useHandCursor = true;
        btn.events.onInputDown.add(() => {
            this.currentOptionClicked = btn;
            btn.frameName = ("card_disable0000");
            btn.inputEnabled = false;
            this.onOptionClick(btn.data.index, btn.data.type);
        })
    }

    protected enableUndoOption() {
        this.currentOptionClicked.frameName = ("card0000");
        this.currentOptionClicked.inputEnabled = true;
        this.currentOptionClicked.input.useHandCursor = true;
        this.optionClickCount--;
        this.decreaseCounter();
    }

    callbackAddPlayer(player: any, type: any) {
        this.passTheballTo({ passToPlayer: true, player: player, type: type });
    }

    protected passTheballTo(newDropPosition: any): any {
        // Stop the Execution
        if (arguments.length === 0) return false;
        let x, y, cb, waitTime;

        if (typeof newDropPosition.callBack === "undefined") {
            cb = () => {
                // this.bounceDown();
            }
        } else {
            cb = newDropPosition.callBack;
        }

        //  this.bounceStop();

        this.currentPlayer = newDropPosition.player;

        if (newDropPosition.passToPlayer) {
            // To Player
            x = (newDropPosition.player.children[0].world.x - (newDropPosition.type.width * 1));
            y = (newDropPosition.player.children[0].world.y - 60);
        } else {
            // To Point
            x = newDropPosition.positionX;
            y = newDropPosition.positionY;
        }

        if (this.playerGroup.length > 2)
            this.ballPassAudio.play();

        if (typeof newDropPosition.waitTime === "undefined") {

            let tween = this.game.add.tween(this.basketBall).to({ x: x, y: y }, 150, Phaser.Easing.Bounce.In, true);
            tween.onComplete.add(cb);
        }
        else {
            let tween = this.game.add.tween(this.basketBall).to({ x: x, y: y }, 150, Phaser.Easing.Bounce.In, true);
            tween.onComplete.add(() => {
                this.onShootClick();
            });
        }
    }


    protected setMood(moodType: string) {
        for (let i = 0; i < this.playerGroup.length; i++) {
            if (this.playerGroup[i].type == 3) {
                if (moodType == 'happy')
                    Object(this.playerGroup[i].children[1]).animations.play('sad');
                else
                    Object(this.playerGroup[i].children[1]).animations.play('happy');
            }
            else
                Object(this.playerGroup[i].children[1]).animations.play(moodType);
        }
    }

    protected getBoundingPosition(attempt: number) {
        let bound: any = {};
        if (attempt == 0) {
            this.maxX = 700;
        } else if (attempt == 1) {
            this.maxX = 940;
        } else if (attempt == 2) {
            this.maxX = 1140;
        } else if (attempt == 3) {
            this.maxX = 1340;
        }

        bound.x = this.maxX;
        bound.y = this.engine.randomNumberGeneration(this.minY, this.maxY);
        return bound;
    }


    protected popjerseyNo(element: any) {
        element.visible = true;
        var entryAnim = this.game.add.tween(element.scale).to({ x: 1.3, y: 1.3 }, 100, Phaser.Easing.Linear.None, true);
        entryAnim.onComplete.add(() => {
            var entrySubAnim = this.game.add.tween(element.scale).to({ x: 1, y: 1 }, 100, Phaser.Easing.Linear.None, true);
            entrySubAnim.onComplete.add(() => {
            }, this);
        }, this);
    }

    /**
     * This function will return the random number between the min and max.
     */
    protected getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * This function will add player
     * @param {number} type It contains player type value, latex string
     * @param {any} position It contains position of the player
     * @param {string} jerseyNo It contains Jersey No of the player
     * @param {string} jerseyColor It contains Jersey color of the player
     * @param {any} callBack Call back function to execute after operation     
     */
    protected addPlayer(type: number, position: any, jerseyNo: any, jerseyColor: string, showUndo: Boolean, callBack: any) {
        if (this.currentGroup != undefined)
            this.prevGroup = this.currentGroup

        let cb = callBack || function () { };
        let playerObject: any, shadowY: number, flyInFrom: number, flyTo: number, jColor: string = jerseyColor || '#000000';

        shadowY = this.playerTypes[type].height / 2;

        if (position.directionFrom === 'left') {
            flyInFrom = -(this.playerTypes[type].width);
            flyTo = (position.x - (flyInFrom));
        } else {
            flyInFrom = this.game.world.width + (this.playerTypes[type].width);
            flyTo = -(flyInFrom - (position.x));
        }

        playerObject = this.game.add.group();

        // Undo button
        let playerUndo = this.game.add.sprite(flyInFrom, position.y - 128, 'Basket_UI', 'undo_button0000');
        playerUndo.anchor.set(0.5);
        playerUndo.scale.set(0.6);

        let player: Phaser.Sprite;
        let animTime = 1000;

        if (type == 2) {
            player = this.game.add.sprite(flyInFrom, position.y, 'answerGuy');
            player.animations.add('idle', ['gg3_stretch0004'], 1, false);
            player.animations.add('LoopAnim', Phaser.Animation.generateFrameNames('gg3_stretch', 1, 2, '', 4), 5, true);
            player.animations.add('playOnce', Phaser.Animation.generateFrameNames('gg3_stretch', 0, 4, '', 4), 12, false);

            player.animations.play('LoopAnim');
            animTime = 1500;
        }
        else {
            player = this.game.add.sprite(flyInFrom, position.y, 'player');
            player.animations.add('idle', [this.playerTypes[type].name + '_idle0000'], 8, false);
            player.animations.add('happy', [this.playerTypes[type].name + '_happy0000'], 5, false);
            player.animations.add('sad', [this.playerTypes[type].name + '_sad0000'], 5, false);

            player.animations.play('idle');
        }
        player.anchor.set(0.5);
        let playerShadow = this.game.add.sprite(flyInFrom, position.y + shadowY, 'shadow');
        playerShadow.anchor.set(0.5);

        playerObject.add(playerShadow);
        playerObject.add(player);

        let jerseyName: any;

        if (this.currentGrade == 'g6' || !this.lessThanZero || this.resultValue == undefined || (this.currentGrade != 'g6' && this.resultValue.value >= 0)) {
            let jerseyString = (this.engine.numberWithCommas(jerseyNo)).toString();
            jerseyName = this.game.add.sprite(0, 0, '');

            jerseyName.anchor.setTo(0.5);
            if (jerseyNo != '') {
                jerseyName.data.image = new Image();
                let yOffset = 0;

                //console.error('>>>>>>>>',jerseyString);

                jerseyName.data.playerObject = playerObject;
                if (this.playerGroup.length == 1) {
                    if (this.engine.startValue.isFraction) {

                        //KQ code 
                        latextopngconverter(jerseyString, { scale: 3.2, fill: '#000000' }, (output: any) => {
                            jerseyName.data.image.src = output.img;
                            jerseyName.data.isFraction = true;
                        });
                    }
                    else {
                        //KQ code 
                        latextopngconverter(jerseyString, { scale: 3.5, fill: '#000000' }, (output: any) => {
                            jerseyName.data.image.src = output.img;
                            jerseyName.data.isFraction = false;
                        });
                    }
                }
                else if (this.playerGroup.length == 2) {
                    if ((this.engine.answerFractionString != undefined && this.engine.answerFractionString.isFraction)) {
                        //KQ code 
                        latextopngconverter(jerseyString, { scale: 3.2, fill: '#ff0000' }, (output: any) => {
                            jerseyName.data.image.src = output.img;
                            jerseyName.data.isFraction = true;
                            console.error(output.img)
                        });
                    }
                    else if (this.engine.answerFractionString.value != undefined && this.engine.answerFractionString.value.denom > 1 && this.engine.isFraction) {
                        //KQ code 
                        latextopngconverter(jerseyString, { scale: 3.2, fill: '#ff0000' }, (output: any) => {
                            jerseyName.data.image.src = output.img;
                            jerseyName.data.isFraction = true;
                        });
                    }
                    else {
                        //KQ code 
                        latextopngconverter(jerseyString, { scale: 3.5, fill: '#ff0000' }, (output: any) => {
                            jerseyName.data.image.src = output.img;
                            jerseyName.data.isFraction = false;
                        });
                    }
                }
                else if (type != 3) {
                    if (this.resultValue != undefined && this.resultValue.isFraction) {
                        //KQ code 
                        latextopngconverter(jerseyString, { scale: 3.2, fill: '#000000' }, (output: any) => {
                            jerseyName.data.image.src = output.img;
                            jerseyName.data.isFraction = true;
                        });
                    }
                    else {
                        //KQ code 
                        latextopngconverter(jerseyString, { scale: 3.5, fill: '#000000' }, (output: any) => {
                            jerseyName.data.image.src = output.img;
                            jerseyName.data.isFraction = false;
                        });
                    }
                }

                jerseyName.data.image.onload = () => {
                    this.game.cache.addImage(jerseyString, jerseyName.data.image.src, jerseyName.data.image);
                    let tmpImage = this.game.add.sprite(0, 0, jerseyString);
                    jerseyName.texture = tmpImage.generateTexture();
                    tmpImage.destroy();
                    jerseyName.x = -115;
                    if (jerseyName.data.isFraction) {
                        if (type == 2 || type == 1)
                            jerseyName.y = jerseyName.data.playerObject.y + 170;
                        else
                            jerseyName.y = jerseyName.data.playerObject.y + 155;
                    }
                    else {
                        if (type == 2 || type == 1)
                            jerseyName.y = jerseyName.data.playerObject.y + 130;
                        else
                            jerseyName.y = jerseyName.data.playerObject.y + 120;
                    }
                }
            }
        }
        else {
            let Text_to_Display = '';
            let tempX = 0;
            let tempY = 0;

            if (type == 1 || type == 0) {
                Text_to_Display = this.getLocalizedText("cg_when_negative");//"Less than\nzero!";

                tempX = player.x;
                tempY = player.y + 135;
            }

            jerseyName = this.game.add.bitmapText(tempX, tempY, 'font_bold', Text_to_Display, 45, playerObject);
            jerseyName.tint = 0x000;
            jerseyName.align = "center";
            jerseyName.anchor.setTo(0.5);
        }
        playerObject.add(jerseyName);

        this.game.world.bringToTop(this.basketGroup);

        // Set the Group Position
        playerObject.x = flyInFrom;
        playerObject.y = position.y;
        playerObject.type = type;

        let entryAnim = this.game.add.tween(playerObject).to({ x: flyTo }, animTime, Phaser.Easing.Linear.None, true);
        entryAnim.onComplete.add(() => {
            cb(playerObject, this.playerTypes[type]);
            if (type === 1 || type === 0)
                this.animateKid(playerObject, 0, this.playerTypes[type], flyInFrom, position.y);
            if (type == 2)
                player.animations.play('idle');

        }, this);
        this.undoIcon = playerUndo;
        this.currentGroup = playerObject;
        this.playerGroup.push(playerObject);
    }

    /**
     * This function will add shake animation
     */
    protected animateKid(playerObject: any, counter: number, playerType: any, x: any, y: any) {
        //Old implemented
        let limitAnimate = 2;
        if (counter < limitAnimate && (counter % 2 === 0)) {
            if (playerType.name == "gg1") {
                playerObject.children[1].position.y = y + 60;
            } else {
                playerObject.children[1].position.y = y + 75;
            }

            playerObject.children[1].anchor.set(0.5, 1);
            let entryWarmUpAnim = this.game.add.tween(playerObject.children[1].scale).to({ x: 1.1, y: 0.8 }, 150, Phaser.Easing.Linear.None, true);
            this.game.add.tween(playerObject.children[0].scale).to({ x: 1.1, y: 0.8 }, 150, Phaser.Easing.Linear.None, true);
            entryWarmUpAnim.onComplete.add(() => {
                counter++;
                this.animateKid(playerObject, counter, playerType, x, y);
            }, this);
        } else if (counter < limitAnimate && (counter % 2 !== 0)) {
            let entryWarmUpAnim = this.game.add.tween(playerObject.children[1].scale).to({ x: 1.0, y: 1.0 }, 150, Phaser.Easing.Linear.None, true);
            this.game.add.tween(playerObject.children[0].scale).to({ x: 1.0, y: 1.0 }, 150, Phaser.Easing.Linear.None, true);
            entryWarmUpAnim.onComplete.add(() => {
                counter++;
                this.animateKid(playerObject, counter, playerType, x, y);
            }, this);
        }
    }

    /**
     * This method initilizes the game variables used to start or restart the game
    */
    protected initGame() {
        this.gamePoints = 0;
    }

    /**
     * This method creates home button
    */
    protected createHomeButton(enabled: boolean) {
        this.homeButton = this.game.add.sprite(40, 20, 'Basket_UI', 'btn_home0000');
        this.homeButton.inputEnabled = enabled;
        this.homeButton.input.pixelPerfectOver = true;
        this.homeButton.input.pixelPerfectClick = true;

        if (enabled) {
            this.homeButton.input.useHandCursor = true;
            this.homeButton.events.onInputDown.add(() => {
                this.homeButton.input.useHandCursor = false;
                this.game.canvas.style.cursor = 'default';
                setTimeout(() => { this.homeButton.inputEnabled = false; }, 50);

                this.showConfirmationBox();
                this.disableAllCards();
            });
        }
    }

    /**
     * This method will create the UI buttons.
     */
    protected initGameUIButtons() {
        // add pass count button
        this.countGroup = this.game.add.group();

        this.countdownBg = this.game.add.sprite(40, 1200, 'Basket_UI', 'countdown_bg0000');
        this.counterHolder = this.game.add.sprite(0, 0, '');
        this.countdownBg.addChild(this.counterHolder);

        this.counterUpdate(this.countdownBg, (this.engine.counter).toString());

        this.countdownBg.inputEnabled = true;
    }

    /**
     * Updates counter text
     * @param _parent string , str string counter text converted into png. 
     */
    counterUpdate(_parent: any, str: string) {

        _parent.children[0].destroy();
        _parent.children[0] = null;
        _parent.children[0] = this.game.add.sprite(0, 0, '');
        _parent.children[0].data.image = new Image();
        latextopngconverter(str, { scale: 6, fill: '#000000' }, (output: any) => {
            _parent.children[0].data.image.src = output.img;
        });
        _parent.children[0].data.image.onload = () => {
            this.game.cache.addImage('latex', _parent.children[0].data.image.src, _parent.children[0].data.image);
            let tmpImage = this.game.add.sprite(0, 0, 'latex');
            _parent.children[0].texture = tmpImage.generateTexture();
            tmpImage.destroy();
        }

        _parent.children[0].x = Math.floor(_parent.x + _parent.width / 2);
        _parent.children[0].y = Math.floor(_parent.y + _parent.width / 2);
        _parent.children[0].anchor.setTo(0.5);
    }

    /**
     * Updates counter text
     * @param _parent string , str string counter text converted into png. 
     */
    addRewardPoints() {
        // add reward stars background
        this.rewardGroup = this.game.add.group();

        let rewardBG = this.game.add.sprite(0, 0, 'Basket_UI', 'star_bar0000');
        this.rewardGroup.add(rewardBG);

        //add reward stars
        let rewardStarsGroup = this.game.add.group();
        let startLeftMargin = 8;
        let starScale = 0.45;
        let totalWidth = 0;
        this.levelStars = [];
        let shadowStars: any = [];
        let mask: any = [];
        let percentageStartToShow = 100;
        for (let i = 0; i < 3; i++) {
            this.levelStars[i] = this.game.add.group();
            let star = this.game.add.sprite(0, 0, 'Basket_UI', 'star_slot0000');
            let stripStar = this.game.add.sprite(0, 0, 'Basket_UI', 'star0000');

            this.levelStars[i].x = i * (startLeftMargin + (star.width * starScale)) - 35;
            this.levelStars[i].y = 10;
            totalWidth += this.levelStars[i].x;
            star.scale.set(starScale);
            shadowStars[i] = this.game.add.sprite(0, 0, 'Star_Mask');
            shadowStars[i].width = star.width;
            shadowStars[i].height = star.height;
            stripStar.width = star.width;
            stripStar.height = star.height;

            //	A mask is a Graphics object
            mask[i] = this.game.add.graphics(0, 0);
            mask[i].beginFill(0xffffff);
            mask[i].drawRect(0, 0, star.width, star.height);
            shadowStars[i].mask = mask[i];
            mask[i].y = (star.height * (100 - percentageStartToShow)) / 100;

            this.levelStars[i].add(star);
            this.levelStars[i].add(shadowStars[i]);
            this.levelStars[i].add(mask[i]);
            this.levelStars[i].add(stripStar);
            stripStar.visible = false;
            this.levelStars[i].children[1].visible = false;
            rewardStarsGroup.add(this.levelStars[i]);
        }

        totalWidth = totalWidth - startLeftMargin;
        rewardStarsGroup.x = rewardBG.width / 2 - totalWidth / 2;
        rewardStarsGroup.y = rewardBG.height / 2 - shadowStars[0].height + 15;
        this.rewardGroup.add(rewardStarsGroup);
        this.rewardGroup.x = this.BASE_GAME_WIDTH - rewardBG.width;
    }

    /**
     * Function is to show star(partial or full) on the game over screen
     * @param isPartial number. To check star is filled or partially filled
     * 
     * **/
    protected showStarProgress(isPartial: number) {
        let starToShow: any;
        if (isPartial) {
            starToShow = this.levelStars[this.startCounter - 1].children[1];
            starToShow.visible = true;
        }
        else {
            starToShow = this.levelStars[this.startCounter - 1].children[3];
            starToShow.visible = true;
            let tween = this.game.add.tween(starToShow);
            starToShow.height += 30;
            starToShow.width += 30;

            if ((this.startCounter - 1) != 2)
                this.star1and2Audio.play();
            else
                this.star3Audio.play();

            tween.to({ height: starToShow.height - 30, width: starToShow.width - 30 }, 500, Phaser.Easing.Bounce.Out, true, 0);
        }

        return starToShow;
    }

    protected calculatePoint() {

        if (this.startCounter > 3)
            return;

        let totalShotsRemaining = this.engine.counter;
        let roundRemainingShots = this.engine.scoring.starthresholds;
        let starToShow: any;
        this.scorePoints = Number(this.engine.scoring.points);

        if (this.prevRemainingShots > 0)
            totalShotsRemaining = totalShotsRemaining + this.prevRemainingShots;

        let points = Math.round((totalShotsRemaining / roundRemainingShots[this.startCounter - 1]) * this.scorePoints);

        if (points == this.scorePoints) {
            starToShow = this.showStarProgress(0);
            this.changeStarMaskPosition(starToShow, this.scorePoints);
            this.startCounter++;
            this.score = this.scorePoints;
        }
        else if (points < this.scorePoints) {
            starToShow = this.showStarProgress(1);
            this.changeStarMaskPosition(starToShow, points);
            this.prevRemainingShots = totalShotsRemaining;
            this.score = points;
        }
        else if (points > this.scorePoints) {
            starToShow = this.showStarProgress(0);
            this.changeStarMaskPosition(starToShow, this.scorePoints);
            let answerShots: number = roundRemainingShots[this.startCounter - 1];
            totalShotsRemaining = totalShotsRemaining - answerShots;
            this.score = this.scorePoints;



            if (this.startCounter >= 3) {
                if (this.score > this.scorePoints)
                    this.score = this.scorePoints;
                return;
            }

            this.startCounter++;

            points = Math.round((totalShotsRemaining / roundRemainingShots[this.startCounter - 1]) * this.scorePoints);


            if (points >= this.scorePoints) {
                starToShow = this.showStarProgress(0);
                this.score = this.scorePoints;
            }
            else {
                this.prevRemainingShots = totalShotsRemaining;
                starToShow = this.showStarProgress(1);
                this.score = points;
            }
            this.changeStarMaskPosition(starToShow, points);
        }

        this.score = points;
        if (this.score > this.scorePoints)
            this.score = this.scorePoints;

    }


    protected changeStarMaskPosition(star: any, pointsScored: number) {
        let points = Number(this.engine.scoring.points);
        let mask = this.levelStars[this.startCounter - 1].children[2];
        mask.y = (star.height * (points - pointsScored)) / points;

    }

    protected hideStars() {
        this.levelStars.forEach(element => {
            element.destroy();
        });
    }

    protected setAnchorForGameOverStars(victory: any, type: any) {
        if (type == 'on') {
            victory.anchor.set(0.5, 0);
        } else {
            victory.anchor.set(0.6, 0);
        }
    }

    protected showRandomStar(gameOverBG: any, x: number, y: number, type: string) {
        let lightStar = this.game.add.sprite(gameOverBG.x - x, gameOverBG.y - y, 'Basket_UI', 'star_slot0000', this.innerBoxGroup);
        lightStar.alpha = 0;
    }

    protected randomStarEndScreen(gameOverBG: any) {
        this.showRandomStar(gameOverBG, 300, 100, 'large');
        this.showRandomStar(gameOverBG, -50, 100, 'small');
        this.showRandomStar(gameOverBG, -200, 100, 'small');
        this.showRandomStar(gameOverBG, -150, 0, 'large');
        this.showRandomStar(gameOverBG, 250, -50, 'large');
    }

    protected starCount = 0;
    protected checkCompletion(): boolean {
        this.starCount = 0;

        for (var index = 0; index < 3; index++) {
            if (this.levelStars[index].children[3].visible) {
                this.starCount++;
            }
        }

        let islevelCompleted = (this.starCount >= 1) ? true : false;
        if (islevelCompleted)
            this.winAudio.play();
        else
            this.loseAudio.play();
        return islevelCompleted;
    }

    protected endStar: any = [];
    /**
     * Function adds star on the game over screen
     * @param gameOverBG any
     * @param ribbonLeft any
     * @param enableCount number
     * 
     * **/
    protected addRewardStarForGameOver(gameOverBG: any, ribbonLeft: any, enableCount: number) {
        let firstStarX = gameOverBG.x - 100;
        let firstStarY = ribbonLeft.y + 60;
        let secondStarX = gameOverBG.x + 10;
        let secondStarY = ribbonLeft.y + 10;
        let thirdStarX = gameOverBG.x + 120;
        let thirdStarY = ribbonLeft.y + 60;
        let score: number = 0;
        let totalScore: number = 0;

        let starX: any = [];
        let starY: any = [];
        starX.push(gameOverBG.x - 200);
        starX.push(gameOverBG.x);
        starX.push(gameOverBG.x + 200);

        starY.push(ribbonLeft.y + 90);
        starY.push(ribbonLeft.y + 15);
        starY.push(ribbonLeft.y + 90);

        for (var index = 0; index < 3; index++) {

            if (!this.levelStars[index].children[3].visible) {
                var slot = this.game.add.sprite(starX[index], starY[index], 'Basket_UI', 'star_slot0000', this.innerBoxGroup);

                this.setAnchorForGameOverStars(slot, 'on');
            }
            else {
                let star = this.game.add.sprite(starX[index], starY[index], 'Basket_UI', 'star0000', this.innerBoxGroup);
                this.setAnchorForGameOverStars(star, 'on');
                star.scale.setTo(0.8);
                this.endStar.push(star);
            }
        }
        this.score = totalScore;
    }

    protected removeRewardStar() {
        this.rewardGroup.removeAll(true);
    }

    /**
     * This method is used to create the variable card based on data received from the game engine
     */
    protected createVariableCards() {
        this.BenchCards = this.game.add.group();
        let bench = this.engine.bench;
        let cnt = 0;
        let spaceBetweenCards = 300;
        this.imageArray = [];
        bench.forEach((card: any, i: any) => {
            let type = Number(!(i % 2));

            this.BenchCards.add(this.createSingleVariableCard(card, cnt, 0, i, type));
            cnt += spaceBetweenCards;
        });

        let benchWidth = this.benchCardArray[this.benchCardArray.length - 1].x - this.benchCardArray[0].x;
        this.BenchCards.x = this.BASE_GAME_WIDTH / 2 - benchWidth / 2;
        this.BenchCards.y = this.BASE_GAME_HEIGHT - 225;
    }

    /**
     * This method will create a single variable card
     * 
     * @param {*} card It contains the variable card value, latex string
     * @param {number} x It contains co-ordinates of the variable card
     * @param {number} y It contains co-ordinates of the variable card
     * @param {string} cacheKey It contains phaser cache string name of variable card background 
     * @returns {Phaser.Sprite} It contains generated variable card
     * 
     * 
     */
    protected imageLoadCounter: number = 0;
    protected imageArray: Array<any> = [];
    protected createSingleVariableCard(card: any, x: number, y: number, index: number, type: number): Phaser.Sprite {
        let sprite = this.game.add.sprite(x, y, 'Basket_UI', 'card0000');
        sprite.visible = false;
        if (card.latexString != "") {
            let text1 = this.game.add.sprite(0, 0, '');
            text1.data.image = new Image();
            let digitCount = 0;


            if (card.isFraction) {
                //text1.data.image.src = this.engine.getLatexImage("130", "ffffff", card.latexString);
                latextopngconverter(card.latexString, { scale: 3.2, fill: '#ffffff' }, (output: any) => {
                    text1.data.image.src = output.img;
                });
            }
            else if (!card.isFraction) {
                //text1.data.image.src = this.engine.getLatexImage("50", "ffffff", card.latexString);               
                latextopngconverter(card.latexString, { scale: 3.2, fill: '#ffffff' }, (output: any) => {
                    text1.data.image.src = output.img;
                });
            }

            text1.data.image.onload = () => {
                this.game.cache.addImage('latex', text1.data.image.src, text1.data.image);
                let tmpImage = this.game.add.sprite(0, 0, 'latex');
                text1.texture = tmpImage.generateTexture();
                tmpImage.destroy();
                text1.y = ((sprite.height - text1.height) / 2) - 25;

                if (card.isFraction) {
                    text1.y = ((sprite.height - text1.height) / 2) - 15;
                    text1.scale.setTo(0.73);
                }
                else {
                    text1.scale.setTo(0.78);
                }

                sprite.addChild(text1);
                let width = sprite.width - 52;
                text1.x = width / 2 - text1.width / 2;
                this.imageArray.push(sprite);
                this.showImageSprite();
            }
        }
        else {
            let text = this.game.add.bitmapText(0, 0, 'font_white', card.operationSymbol + "" + card.value, 69);
            text.align = "center"
            text.anchor.set(0.5);
            text.x = sprite.width / 2;
            text.y = sprite.height / 2;
            sprite.addChild(text);

        }

        sprite.data.card = card;
        sprite.data.index = index;
        sprite.data.type = type;
        sprite.data.originalWH = {
            width: sprite.width,
            height: sprite.height
        };
        sprite.visible = false;
        this.benchCardArray.push(sprite);
        this.addBenchEvent(sprite);

        sprite.scale.setTo(1.25);
        sprite.input.priorityID = 1;
        sprite.input.pixelPerfectClick = true;
        sprite.input.pixelPerfectOver = true;

        return sprite;
    }

    /**
     * To show the bottom card images when all the cards(images) are loaded   
     */
    protected showImageSprite() {
        this.imageLoadCounter++;
        if (this.imageLoadCounter >= this.engine.bench.length) {
            this.imageArray.forEach(element => {
                element.visible = true;
            });
        }
    }

    /**
     * Used to decrease the game counter 
     */
    protected decreaseCounter() {
        this.engine.decrementCounter();
        this.counterUpdate(this.countdownBg, (this.engine.counter).toString());
    }

    /**
     * Function to reset the game
     */
    protected resetGame() {
        this.endStar.forEach(element => {
            if (element != undefined)
                element.destroy();
        });
        this.endStar = [];

        this.playerGroup.forEach(element => {
            element.destroy();
        });
        this.playerGroup = [];

        this.benchCardArray.forEach(element => {
            element.destroy();
        });

        if (this.game_Audio != undefined) {
            this.game_Audio.destroy()
            this.game_Audio = undefined;
        }
        this.basketSucessType = "short";
        this.optionClickCount = 0;
        this.isOn = false;

        this.resultValue = null;
        this.increment = 1 / this.game.width;
        this.star = 0

        this.currentOptionClicked.destroy();
        this.prevGroup.destroy();
        this.currentGroup.destroy();
        this.gameStateObject = [];
        if (this.bBoy != undefined) {
            this.bBoy.destroy()
            this.bBShadow.destroy();
        }

        this.engine.setupGame(null);
        this.counterUpdate(this.countdownBg, (this.engine.counter).toString());
        // create variable cards
        this.createVariableCards();

        this.disableAllCards();

        this.createBasketBallGroup();

        if (this.bounceAnimation != undefined)
            this.bounceAnimation.destroy();

        this.bounceAnimation = this.basketBall.animations.add('bounce');
        this.basketBall.animations.play('bounce', 30, true);

        this.addPlayerStartAndAnswer();

        this.addAudio();

        this.passTheballTo({
            passToPlayer: false, positionX: -1200, callBack: () => {
                this.basketBall.animations.play('bounce', 30, true);
            }
        });

        if (this.gameOverScreenGroup != undefined)
            this.gameOverScreenGroup.destroy();

        if (this.engine.currentLevel >= this.engine.data.levelData.length - 1) {
           // this.addEndVideo();
        }
        //this.settingUpGameOverUI(0, 300);
        //this.gameOverScreenGroup.visible = false;
    }

    gameOverScreenGroup: Phaser.Group;
    loadingImage: Phaser.Image;

    /**
     * Function opens a confirm popup to quit the game  
     */
    showConfirmationBox() {
        this.game.canvas.style.cursor = "default";
        this.confirmPopupGroup = this.game.add.group();
        let shadow = this.game.add.graphics(0, 0, this.confirmPopupGroup);
        shadow.beginFill(0x000000, 0.5);
        shadow.drawRect(0, 0, this.game.world.getBounds().width, this.game.world.getBounds().height);
        shadow.endFill();
        shadow.width = this.game.world.width;
        shadow.height = this.game.world.height;
        let confirmBoxBG = this.game.add.image(this.game.world.centerX, this.game.world.centerY, 'popup_confirm', "", this.gameOverScreenGroup);
        confirmBoxBG.anchor.set(0.5, 0.5);
        let confirmtext = this.game.add.bitmapText(0, 0, 'font_bold', this.wrapText(this.getLocalizedText("popup_quit"),16), 90, this.confirmPopupGroup);
        
        confirmtext.tint = 0x000;
        confirmtext.align = "center";
        confirmtext.anchor.setTo(0.5, 1);
        confirmBoxBG.addChild(confirmtext);

        let btngroup = this.game.add.group();

        let cancelBtn = this.game.add.sprite(0, 0, 'Basket_UI', 'btn_cancel0000', btngroup);
        cancelBtn.anchor.setTo(0.5, -0.45);
        cancelBtn.inputEnabled = true;
        cancelBtn.input.pixelPerfectClick = true;
        cancelBtn.input.pixelPerfectOver = true;
        cancelBtn.input.useHandCursor = true;
        cancelBtn.events.onInputDown.add(() => {
            this.homeButton.inputEnabled = true;
            this.homeButton.input.useHandCursor = true;
            this.confirmPopupGroup.visible = false;
            this.enableCards();
            this.showUndoIcon(this.gameStateObject, this.gameStateObject.length - 1);
        });

        let confirmBtn = this.game.add.sprite(cancelBtn.width + 100, 0, 'Basket_UI', 'btn_confirm0000', btngroup);
        confirmBtn.anchor.setTo(0.5, -0.45);
        confirmBtn.inputEnabled = true;
        confirmBtn.input.pixelPerfectClick = true;
        confirmBtn.input.pixelPerfectOver = true;
        confirmBtn.input.useHandCursor = true;
        confirmBtn.events.onInputDown.add(() => {
            //this.gameOverScreenGroup.visible = false;
            this.round = 1;
            this.startCounter = 1;
            this.prevRemainingShots = 0;
            this.scorePoints = 0;
            this.score = 0;
            this.hideStars();
            this.clearLevelData();
            this.gotoMenu();
        });

        confirmBoxBG.addChild(btngroup);
        this.confirmPopupGroup.addChild(confirmBoxBG);
        this.game.world.bringToTop(confirmBoxBG);
        this.game.world.bringToTop(this.confirmPopupGroup);
        btngroup.x = - (btngroup.width / 4);
    }

    /**
     * Function to clear(reset) the level data
     */
    protected clearLevelData() {
        this.endStar.forEach(element => {
            if (element != undefined)
                element.destroy();
        });
        this.endStar = [];

        this.playerGroup.forEach(element => {
            element.destroy();
        });
        this.playerGroup = [];

        this.benchCardArray.forEach(element => {
            element.destroy();
        });

        if (this.game_Audio != undefined) {
            this.game_Audio.destroy()
            this.game_Audio = undefined;
        }
        this.basketSucessType = "short";
        this.optionClickCount = 0;
        this.isOn = false;

        this.resultValue = null;
        this.increment = 1 / this.game.width;
        this.star = 0;

        if (this.currentOptionClicked != undefined)
            this.currentOptionClicked.destroy();

        if (this.prevGroup != undefined)
            this.prevGroup.destroy();

        if (this.currentGroup != undefined)
            this.currentGroup.destroy();

        this.gameStateObject = [];

        if (this.bBoy != undefined) {
            this.bBoy.destroy()
            this.bBShadow.destroy();
        }

        if (this.bounceAnimation != undefined)
            this.bounceAnimation.destroy();

        if (this.gameOverScreenGroup != undefined)
            this.gameOverScreenGroup.destroy();

        //this.engine.setupGame(null);
    }

    protected videoBG: Phaser.Group;
    /**
     * Callback function for video load complete
     * */
    videoLoadComplete() {
        this.videoBG = this.game.add.group();
        let shadow = this.game.add.graphics(0, 0, this.videoBG);
        shadow.beginFill(0xFFFFFF, 1);
        shadow.drawRect(0, 0, this.game.world.getBounds().width, this.game.world.getBounds().height);
        shadow.endFill();
        shadow.width = this.game.world.width;
        shadow.height = this.game.world.height;

        this.playVideo(true);

        if (this.loadingSplash) {
            this.loadingSplash = false;
        }

        this.game.load.onLoadStart.remove(this.loadStart, this);
        this.game.load.onLoadComplete.remove(this.videoLoadComplete, this);
        this.game.load.onFileError.remove(this.fileError, this);
    }

    /**
     * this function will execute if there is any error in loading the file
     */
    protected fileError() {
    }

    /**
     * this function will execute when assets starts loading and show the 
     * loading message on the screen
     */
    protected loadStart() {
        this.loadingImage = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'splashscreen', "");
        this.loadingImage.anchor.setTo(0.5);
        this.game.world.bringToTop(this.loadingImage);
        this.loadingImage.visible = true;
        this.loadingText = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY + 35, "font_bold", this.getLocalizedText("loading_assets"), 40);
        this.loadingText.anchor.setTo(0.5);
        this.loadingText.tint = 0xffffff;
        this.game.world.bringToTop(this.loadingText);
    }

    /**
     * function will run when an asset loading is complete 
     */
    protected fileComplete(progress: number, cacheKey: string, success: boolean, totalLoaded: number, totalFiles: number) {
        this.loadingText.setText(progress + "%");
    }


    /**
     * function executes when all the assets loads
     */
    protected loadComplete() {
        this.assetsLoaded = true;
        this.loadingImage.destroy();
        if (this.loadingSplash) {
            this.loadingSplash = false;
        }

        this.game.load.onLoadStart.remove(this.loadStart, this);
        this.game.load.onFileComplete.remove(this.fileComplete, this);
        this.game.load.onLoadComplete.remove(this.loadComplete, this);
        this.game.load.onFileError.remove(this.fileError, this);
    }

    /**
    * This is a default function from Phaser.State, used here to update the different part on UI
   */
    public update() {
        if (this.isOn) {
            this.timerSlot = this.game.time.create(true);
            this.timerSlot.loop(.01, this.plot, this);
            this.timerSlot.start();
        }        
        // work only for touch devices for autoplay 
        if (!this.game.device.desktop){
            if (this.endVideo !== undefined) {				
                if (this.endVideo.currentTime > 0 && this.endVideoField.visible == false) {
                    this.endVideoField.visible = true;
                    this.game.world.bringToTop(this.endVideoField);
                }
            }
            if (this.endVideo !== undefined && this.endVideoField.visible == true && this.endVideo.currentTime == this.endVideo.duration) {
                if (Math.round(this.endVideo.progress * 100) >= 100) {
                    this.endVideoField.destroy();
                    this.endVideoSprite.destroy();
                    this.endVideo.destroy();
                    this.clearLevelData();
                    this.gotoMenu();
                }
            }
        }
    }

    /**
     * Function to launch dynamic menu
     * 
     */
    gotoMenu() {
        this.initParams.animationCheck = true;
        this.game.state.start('DynamicMenu', true, false, [this.initParams, this.animIndex, this.initParams.levelID]);
    }

    /**
     * This method gets triggered when the screen size is changed
     * @returns
     */
    protected resizeGame(manager: Phaser.ScaleManager, bounds: Phaser.Rectangle) {
        let scale = Math.min(window.innerWidth / this.game.width, window.innerHeight / this.game.height);

        manager.setUserScale(scale, scale, 0, 0);
        this.game.scale.refresh();
    }

    /**
     * This method gets triggered when the user score comes to less than zero
     */
    protected ScoredLessThanZero() {

        this.game.canvas.style.cursor = "default";
        this.zeroScored = this.game.add.group();
        let shadow = this.game.add.graphics(0, 0, this.zeroScored);
        shadow.beginFill(0x000000, 0.3);
        shadow.drawRect(0, 0, this.game.world.getBounds().width, this.game.world.getBounds().height);
        shadow.endFill();
        shadow.width = this.game.world.width;
        shadow.height = this.game.world.height;

        let confirmBoxBG = this.game.add.image(this.BASE_GAME_WIDTH / 2, this.BASE_GAME_HEIGHT / 2, 'popup_confirm', "", this.gameOverScreenGroup);
        confirmBoxBG.anchor.set(0.5, 0.5);

        let lessText = this.game.add.bitmapText(0, 50, 'font_bold', this.getLocalizedText("cg_when_negative"), 120, this.zeroScored);
        lessText.tint = 0xFFFFFF;
        lessText.align = "center";
        lessText.anchor.setTo(0.5, 1);
        confirmBoxBG.addChild(lessText);

        this.zeroScored.addChild(confirmBoxBG);
    }

	/**
     * This function is used to load the end video and set it's visibility as false
     * 
     * @memberof FunctionMatchGameStateBase
     */

    addEndVideo() {	
        //this.removeEndVideo();        
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
                this.clearLevelData();
                this.gotoMenu();
            });
        }            
        if (!this.game.device.desktop) {		
            this.endVideo.currentTime = 0;
            this.endVideo.play();                  
        }
        
        
    }

	/**
     * This function is used to play the end animation when player win the final level of the game
     * 
     * @memberof FunctionMatchGameStateBase
     */
    playEndAnimation() {	        
		//this.addEndVideo();
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
                this.clearLevelData();
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
        if (typeof this.endVideo !== 'undefined' && typeof this.endVideo !== null && !this.game.device.android) {
            this.endVideoField.destroy();
            this.endVideoSprite.destroy();
            this.endVideo.destroy();
        }
    }

    /**
     * This function is used to update level id 
     */
    updateAssignModeAndLevelID() {
        if (this.initParams.assignmentMode !== -1 && this.initParams.assignmentLevelId === -1) {
            this.initParams.assignmentLevelId = this.levelID;
        }
    }
}