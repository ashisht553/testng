/**
 * This namespace contains all features including interfaces, types and base class that 
 * we will use for POG Game base level 
 */
export namespace POGGameEngineBase {

    /**
     * This interface will be implemented by all none abstract game engines 
     */
    export interface IGameEngine {
        setup(levelId: string): void;
    }

    /**
     * Types for all actors / elements on the screen that user can interact
     */
    export enum ActorType {
        GoodGuy,
        BadGuy,
        Referee
    }

    /** Types for all operation types, maybe divide and multiple in the future but current grades has only these two */
    export enum OperationType {
        Addition,
        Substraction
    }

    /**
     * The class describe the guy on the bench 
     */
    export class BenchActor {
        actor: IActor;
        infinit: boolean;
        sortID: number;

        constructor() {
            this.actor = {
                actorType: ActorType.GoodGuy,
                id: "",
                value: 0,
                spriteType: 0,
                cacheKey: "",
                width: 0,
                benchWidth: 0,
                decimalPosition: -1
            }
        }
    }

    /**
     * This enum describe image / sprite types we have for good guys and bad guys
     * we know which image we should use if we know 1) good or bad guy 2) SpriteType
     */
    // export enum SpriteType {
    //     /** never have value on shirt */ 
    //     WithoutShirt = 0,

    //     /** have value on shirt always */ 
    //     WithShirt = 1,

    //     /** indicative value these are small spec */
    //     WithSmallSpec = 2
    // }

    /**
     * This enum describe image / sprite types we have for good guys and bad guys
     * we know which image we should use if we know 1) good or bad guy 2) SpriteType
     */
    export enum SpriteType {
        /** never have value on shirt */
        WithoutShirt = 0,

        /** have value on shirt always */
        WithShirt = 2,

        /** indicative value these are small spec 1 */
        WithSmallSpec_1 = 1,

        /** indicative value these are small spec 5 */
        WithSmallSpec_5 = 5,

        /** indicative value these are small spec 10 */
        WithSmallSpec_10 = 10,

        /** indicative value these are small spec 100 */
        WithSmallSpec_100 = 100,
    }

    /** The interface to describe an user interactable element on the screen  */
    /** @property 'cacheKey' will store the key string for the guys to be displayed 
     *  on screen (need a prefix 'GG_' for GoodGuy and 'BG_' for BadGuy)
     */
    export interface IActor {
        actorType: ActorType,
        id: string,
        value: number,
        spriteType: SpriteType,
        cacheKey: any,
        width: number,
        benchWidth: number,
        decimalPosition: number
    }

    /**
     * This class is the base class for all game engines, it has all common features and methods declared.
     */
    export abstract class NewEngineBase {

        /**
         * The property used to store regrouping data in grid(row,col) form 
         */
        public grid: Array<Array<number>>;
        
        /**
         * The property used to store decimal index for decimal values 
         */
        decimalPoints: any = [];
        
        /**
         * The property used to store current game type 
         */
        gameType: string;
        
        /**
         * The property used to store all the numbers for each operation  
         */
        numberArray: Array<number> = [];
        /**
         * The property used to store bad guy object array
         */
        badGuysArray: Array<any> = [];
        /**
         * The property used to store scoreboard related data
         */
        scoreBoard: any;




        /**
         * The property describe the guys will appear on the top or left, based on the json
         */
        factors1: Array<IActor>;

        /**
         * The property describe the guys will appear on the bottom or right, based on the json
         * Note that for object game the unknow field always appear at the bottom or bottom right   
         */
        factors2: Array<IActor>;

        /**
         * The property describe the unknown also the answer
         */
        unknownAnswer: number;

        /**
         * The property describe all actors will show in bench. Most cases they are GoodGuys 
         */
        bench: Array<BenchActor>;
        
        /**
         * The property describe what the current game level is
         */
        currentLevel: string;

        /**
         * The property will have the current level json id ex. 'gk00','gk01' ...
         */
        currentLevelID: string;

        /**
        * The property describe what the current game level index is (the index position from its json)
        */
        currentLevelIndex: number;


        /**
         * The property describe what the current grade is
         */
        currentGrade: string;

        /**
         * The property describe what the current game operation type is
         */
        operationType: OperationType;

         /**
         * The property describe what the current game operation type is
         */
        sign: string;

        /**
         * The property describe what json block the current level uses 
         */
        stateLevelJSONBlock: any;

        /**
         * constructor take the grade json, and initilize all array properties
         * @param data the grade json
         */
        constructor(protected data: any) {
            this.factors1 = [];
            this.factors2 = [];
            this.bench = [];
        }

        /**
         * This abstract method will be implemented in children, to calculate unknown value
         */
        abstract calculateUnknown(): void;


        /**
         * This method will be called when level change. It setup the engine with new level data
         * @param levelId the level ID 
         */
        setup(levelId: string) {
            this.currentLevelIndex = 0;
            this.stateLevelJSONBlock = this.data.levelData.filter(function (d: any) { return d.id == levelId })[0] || this.data.levelData[0];
            this.currentLevel = this.data.levelData.map(function (d: any) { return d['id']; }).indexOf(levelId);
            this.operationType = this.stateLevelJSONBlock.operation.operationType;
            this.gameType = this.stateLevelJSONBlock.operation.gameType;
          
            this.currentLevelID = levelId;
            this.setupBench(); // good guys array to be passed as @Param
            this.setupFactors();
        }

        /**
         * This abstract method will be implemented from children, it setup all top and bottom factors
         */
        abstract setupFactors(): void


        /**
         * This function is used to setup bench guys
         */
        setupBench() {
            //console.log("setupBench() engine base");
            this.bench = [];

            var useSmallSepc = this.stateLevelJSONBlock.goodGuyTypes.length > 1;


            for (var i = 0; i < this.stateLevelJSONBlock.bench.possibleValues.length; i++) {

                let benchGuy = new BenchActor();
                benchGuy.infinit = this.stateLevelJSONBlock.bench.isInfinite;
                benchGuy.sortID = i;

                if (useSmallSepc) {
                    benchGuy.actor.spriteType = this.stateLevelJSONBlock.bench.possibleValues[i];
                } else {
                    benchGuy.actor.spriteType = this.stateLevelJSONBlock.goodGuyTypes[0];
                }

                benchGuy.actor.value = this.stateLevelJSONBlock.bench.possibleValues[i];

                // setting the cacheKey and width ratio for the Actor

                var props: any = this.getCacheKeyForActor(benchGuy.actor.spriteType);
                benchGuy.actor.id = "bench-" + (i + 1);
                benchGuy.actor.decimalPosition = this.decimalPoints.correctAnswerDecimalIndex != undefined ? this.decimalPoints.correctAnswerDecimalIndex : -1;
                benchGuy.actor.cacheKey = props["name"];
                benchGuy.actor.width = props["width"];
                benchGuy.actor.benchWidth = props["benchWidth"]
                this.bench.push(benchGuy);
            }

        }


        /**
         * This method will be also can be used to move current level to next by index, rather than call the setup with level id 
         */
        moveLevel(level: number): string {
            // returning the id for the next level to launch
            if (this.data.levelData[level + 1] !== undefined) {
                return this.data.levelData[level + 1].id.toString();
            }
            else
                return "false"
        }

        /**
         * This base method is to validate the generated factors are valid based on the answer range, as any combination has to match the criteria
         * Note that we will have game specific or level specific requirement but these are implemented at child level   
         */
        validateFactors(): boolean {
            if (this.factors1.length <= 0 && this.factors2.length <= 0) {
                return false;
            }

            if (this.stateLevelJSONBlock.operation.type == "addition") {

                var factors1Sum = 0;
                this.factors1.forEach((f) => factors1Sum += f.value);

                var factors2Sum = 0;
                this.factors2.forEach((f) => factors2Sum += f.value);

                if (factors1Sum - factors2Sum < this.stateLevelJSONBlock.unknown[0]
                    || factors1Sum - factors2Sum > this.stateLevelJSONBlock.unknown[0]) {
                    return false;
                }
            }

            return true;
        }

        /**
         * This method will return the cache 'key' for the guy to be attached in the game
         * @param 'type' spriteType of the guy (GoodGuy or BadGuy)
         * @return 'object'  this will return an object will have the string name, width, and
         * benchwidth that will allow the sprite to scale 
         */
        getCacheKeyForActor(type: number): Object {
            let props = {};
            switch (type) {
                case 0:
                    props = { "name": "WithoutShirt", "width": 62, "benchWidth": 62 };
                    break;

                case 2:
                    props = { "name": "WithShirt", "width": 62, "benchWidth": 62 };
                    break;

                case 1:
                    props = { "name": "SmallSpec_1", "width": 30, "benchWidth": 30 };
                    break;

                case 5:
                    props = { "name": "SmallSpec_5", "width": 20, "benchWidth": 30 };
                    break;

                case 10:
                    props = { "name": "SmallSpec_10", "width": 20, "benchWidth": 24 };
                    break;

                case 100:
                    props = { "name": "SmallSpec_100", "width": 145, "benchWidth": 250 };
                    break;


            }
            return props;
        }


        /**
         * This method will generate a number from a range
         * @param rangeFrom is minimun number
         * @param rangeTo is maximun number          
         */
        randomNumberGeneration(rangeFrom: number, rangeTo: number, multipleof?: number): number {
            let to: number = rangeTo, from: number = rangeFrom;
            let decimalIndex1 = (rangeFrom).toString().indexOf('.');
            let decimalIndex2 = (rangeTo).toString().indexOf('.');
            let randomNumber: any;
            if (decimalIndex1 != -1 && decimalIndex2 != -1) {
                randomNumber = parseFloat((Math.random() * (rangeTo - rangeFrom) + rangeFrom).toFixed(2));
            }
            else {
                randomNumber = Math.floor(Math.random() * (rangeTo - rangeFrom + 1)) + rangeFrom;
            }

            if (multipleof !== undefined) {
                randomNumber -= (randomNumber % multipleof)
            }

            return randomNumber;
        }

        /**
         * this method will generate repitition of game
         */
        setAttempts() {
            return this.stateLevelJSONBlock.iterations;
        }
        /**
         * this method will convert json object into array for tutorial property
         */
        setTutorial() {
            let tutorialCollection: Array<any> = [];

            for (var i in this.stateLevelJSONBlock.tutorial) {
                tutorialCollection.push(this.stateLevelJSONBlock.tutorial[i]);
            }

            return tutorialCollection;
        }

        /**
         * A method is to know the game type is numeric or not
         */
        isNumeralGameType() {
            if (this.gameType.toString() == "Numerals") return true; else return false;
        }

        /**
         * A method is to know the operation type is addition or not
         */
        isAdditionOperationType() {
            if (this.operationType.toString() == "addition") return true; else return false;
        }

        reInitialize(repetition: number) {
            this.scoreBoard.attempts = repetition;
            this.setupFactors();
        }

        /**
         * A method is to set the game type
         */
        setGameType(gameType: string) {
            this.gameType = gameType;
        }

        /**
        * A method is to get the game type
        */
        getGameType() {
            return this.gameType;
        }

        /**
          * A method is to know if the factors1 contains any decimal number
          */
        isDecimalNumber() {
            let isDecimal = false;
            this.factors1.forEach((f) => {
                if ((f.value).toString().indexOf(".") != -1) {
                    isDecimal = true;
                }
            });
            return isDecimal;

        }

        /**
         * A method is to get unknownAnswer
         */
        getAnswer(): number {
            //return this.correctAnswer;
            return this.unknownAnswer;
        }


        /**
         * A method is to set attempts in the score board
         * @ _attempts is the current attempt
         */
        setScoreBoardAttempts(_attempts: number) {
            this.scoreBoard.attempts = _attempts;
        }

        /**
         * A method is to get attempts left in the score board
         */
        getScoreBoardAttempts() {
            return this.scoreBoard.attempts;
        }

    }



}









