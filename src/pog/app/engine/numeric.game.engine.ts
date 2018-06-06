import { POGGameEngineBase } from './game.engine.base'

enum ActionType {
    MoveTo = 1,
    CrossOver = 2,
    Split = 3
}

/**
 * A class to RegroupingAnimation 
 */
class RegroupingAnimation {
    public index: Array<number>;
    public actionType: ActionType;
    public actionParam: any;

    constructor(_index: Array<number>, _actionType: ActionType, _actionParam?: any) {
        this.index = _index;
        this.actionParam = _actionParam;
        this.actionType = _actionType;
    }
}

/**
 * A class represents actor common class to all the guys(good/bad)
*/
class Actor {
    id: string;
    name: string;
    uiElement: any;
}

/**
 * A class representing GoodGuy object and having it's properties
*/
export class GoodGuy extends Actor {
    type: number;
    benchPositionIndex: number;
    fieldPositionIndex: number;
    isInfinite: boolean;
    decimalPosition: number;
    value: number;
}

/**
 * A class representing BadGuy object and having it's properties
*/
export class BadGuy extends Actor {
    decimalPosition: number;
    type: number;
    value: any;
}

/**
 * This class is engine for all object games
 */
export class NumericGameEngine extends POGGameEngineBase.NewEngineBase implements POGGameEngineBase.IGameEngine {
    public grid: Array<Array<any>>;
    public gridInitValues: Array<Array<number>>;
    public possibleRegroupingPositions: Array<Array<number>>;
    public animations: Array<RegroupingAnimation>;
    private answer: number;
    public badGuys: any;
    protected loopcount: number = 0;
    protected factor1TotalValue: number = 0;
    protected totalGridCols: number = 5;
    protected totalGridRow: number = 6;
    /**
     * This method is child level to validate generated factors based on logic. for example if using small spec 5 / 10 
     * as goodGuyType then answer has to be times by 5
     */
    validateFactors(): boolean {

        if (!super.validateFactors()) {
            return false;
        }

        var result = true;

        if (this.stateLevelJSONBlock["goodGuyTypes"] == 2) {

            this.factors2.forEach((actor) => {

                if (actor.value % 5 > 0 && actor.value % 10 > 10) {
                    result = false;
                }

            });

            if (this.unknownAnswer % 5 > 0 && this.unknownAnswer % 10 > 0) {
                result = false;
            }
        }

        if (this.stateLevelJSONBlock["badGuyTypes"] == 2) {

            this.factors1.forEach((actor) => {

                if (actor.value % 5 > 0 && actor.value % 10 > 10) {
                    result = false;
                }

            })
        }

        return result;
    }

    /**
     * This method is to generate factors for object games
     */
    setupFactors() {
        this.factors1 = [];
        this.factors2 = [];
        //this.loopcount++;

        let members: Array<Array<number>> = this.stateLevelJSONBlock["members"];
        let badGuyType = this.stateLevelJSONBlock["badGuyTypes"];
        let goodGuyType = this.stateLevelJSONBlock["goodGuyTypes"];

        this.badGuysArray = [];
        //factors 1 : upper or left compartments - bad guys
        (this.stateLevelJSONBlock["operation"]["factors"][0] as Array<number>).forEach((num) => {
            if (num != null) {

                let props = this.getCacheKeyForActor(POGGameEngineBase.ActorType.BadGuy);
                let multipleof = (members[num][2] !== undefined) ? (<any>members[num][2])["multiple"] : undefined;
                let actorValue = this.createSameGridSizeForDecimal(this.randomNumberGeneration(members[num][0] as number, members[num][1] as number, multipleof));

                let actor: POGGameEngineBase.IActor = {
                    actorType: POGGameEngineBase.ActorType.BadGuy,
                    value: actorValue,
                    spriteType: this.stateLevelJSONBlock["badGuyTypes"][0],
                    id: "actor" + (num + 1),
                    cacheKey: "",
                    width: 0,
                    benchWidth: 0,
                    decimalPosition: actorValue.toString().indexOf("."),
                }

                this.factors1.push(actor);
                this.badGuysArray.push(this.createGridOfBadGuys(this.createBadGuys(actor.value)));
            }
        });



        this.loopcount++;


        //factors 2 : lower or right compartments - good guys
        (this.stateLevelJSONBlock["operation"]["factors"][1] as Array<number>).forEach((num) => {

            if (num != null) {
                let multipleof = (members[num][2] !== undefined) ? (<any>members[num][2])["multiple"] : undefined;
                let actorValue = this.createSameGridSizeForDecimal(this.randomNumberGeneration(members[num][0] as number, members[num][1] as number, multipleof));
                if (this.loopcount > 10) {
                    let unknownAnswerMin = this.stateLevelJSONBlock["unknown"][0];
                    let unknownAnswerMax = this.stateLevelJSONBlock["unknown"][1];
                    this.unknownAnswer = this.createSameGridSizeForDecimal(this.randomNumberGeneration(unknownAnswerMin as number, members[num][1] as number, multipleof))
                    actorValue = this.unknownAnswer + this.factor1TotalValue;
                }
                let actor: POGGameEngineBase.IActor = {
                    actorType: POGGameEngineBase.ActorType.GoodGuy,
                    value: actorValue,
                    spriteType: this.stateLevelJSONBlock["goodGuyTypes"][0],
                    id: "good" + (num + 1),
                    cacheKey: "",
                    width: 0,
                    benchWidth: 0,
                    decimalPosition: actorValue.toString().indexOf("."),
                }
                this.factors2.push(actor);
                this.badGuysArray.push(this.createGridOfBadGuys(this.createBadGuys(actorValue)));
            }

        });

        this.pushBlankValuesToTheCells();
        this.calculateUnknown();
    }

    /**
     * pushing the values in the bad guy array to make the complete set of 
     * row with equal number of elements
     */
    pushBlankValuesToTheCells() {
        //Inseting null values to the blank rows
        for (var i = 0; i < (5 - (this.factors1.length + this.factors2.length)); i++) {
            let actor: POGGameEngineBase.IActor = {
                actorType: POGGameEngineBase.ActorType.GoodGuy,
                value: null,
                spriteType: this.stateLevelJSONBlock["goodGuyTypes"][0],
                id: "good",
                cacheKey: "",
                width: 0,
                benchWidth: 0,
                decimalPosition: -1,
            }
            this.badGuysArray.unshift(this.createGridOfBadGuys(this.createBadGuys("      ")));
        }
    }

    /**
     * This method will be used to calculate correct answer based on generated factors
     */
    calculateUnknown() {

        // Variable used to store Factor's value'
        let factor1TotalValue: number = 0;
        let factor2TotalValue: number = 0;

        this.numberArray = [];

        // Calculating Factor 1 total value
        let factor1ValueCounter = this.factors1.forEach((factor1val: any) => {
            factor1TotalValue = Number(factor1val.value) + factor1TotalValue;
            this.numberArray.push(factor1val.value);
        });

        this.factor1TotalValue = factor1TotalValue;

        // Calculating Factor 2 total value
        let factor2ValueCounter = this.factors2.forEach((factor2val: any) => {
            factor2TotalValue = Number(factor2val.value) + factor2TotalValue;
        });

        this.sign = this.stateLevelJSONBlock.operation.operationType;

        // Calculating Unknown Answer 
        let nullpos = -1;
        //this.sign = "addition";

        
        if (this.isNumeralGameType() && !this.isAdditionOperationType() && this.stateLevelJSONBlock.operation.factors[0].indexOf(null) != -1) {
            //  this.stateLevelJSONBlock.operation.operationType = "addition";
            //this.sign = "subtraction";
            nullpos = this.stateLevelJSONBlock.operation.factors[0].indexOf(null);
            //this.operationType = this.stateLevelJSONBlock.operation.operationType;
        }

       
        if (this.isNumeralGameType() && this.sign === "subtraction") {
            // this.sign = this.stateLevelJSONBlock.operation.operationType;
            if (nullpos == -1) {
                this.unknownAnswer = this.factors1[0].value - this.factors1[1].value;
            } else {
                switch (nullpos) {
                    case 0:
                        this.unknownAnswer = this.factors1[0].value + this.factors2[0].value;
                        break;
                    case 1:
                        /*console.log("values for swap",this.factors1[0].value, this.factors2[0].value)
                           let fac1 = this.factors1[0].value;
                           let fac2 = this.factors2[0].value;
                           console.log("values for swap",fac1, fac2)
                           this.factors1[0].value = fac2;
                           this.factors2[0].value = fac1;
                          */
                        /*this.unknownAnswer = Math.abs(this.factors1[0].value + this.factors2[0].value);
                        console.log("values for swap",this.factors1[0].value, this.unknownAnswer)
                        let ans = this.unknownAnswer;
                        let fac1 = this.factors1[0].value;
                        this.factors1[0].value = ans;
                        this.unknownAnswer = fac1;
                        console.log("values for swap === ",this.factors1[0].value, this.unknownAnswer)*/

                        if (this.factors1[0].value > this.factors2[0].value) {
                            this.unknownAnswer = this.factors1[0].value - this.factors2[0].value;
                        }
                        else {
                            this.unknownAnswer = this.factors2[0].value - this.factors1[0].value;
                            let temp = this.factors1[0].value;
                            this.factors1[0].value = this.factors2[0].value;
                            this.factors2[0].value = temp;
                            this.badGuysArray = [];
                            this.badGuysArray.push(this.createGridOfBadGuys(this.createBadGuys(this.factors1[0].value)));
                            this.badGuysArray.push(this.createGridOfBadGuys(this.createBadGuys(this.factors2[0].value)));
                            this.pushBlankValuesToTheCells();
                        }
                        break;
                }

            }
        }
        else {
           

            if (factor2TotalValue == 0) {
                this.unknownAnswer = factor1TotalValue - factor2TotalValue;
            } else {
                this.unknownAnswer = factor2TotalValue - factor1TotalValue;
            }

        }

        this.unknownAnswer = this.createSameGridSizeForDecimal(this.unknownAnswer);
       
        if (this.unknownAnswer < this.stateLevelJSONBlock["unknown"][0] || this.unknownAnswer > this.stateLevelJSONBlock["unknown"][1]) {
           
            this.setupFactors();
        }
        // need to know about this condition have added tne nullpos for subtraction equations
        if (factor1TotalValue > factor2TotalValue && factor2TotalValue != 0 && nullpos !== 1) {
          
            this.setupFactors();
        }

        if (this.unknownAnswer.toString().indexOf(".") != -1) {
            this.unknownAnswer = parseFloat(this.unknownAnswer.toString().replace(".", ""));
        }
    }



    /**
         * A method to setup the grid based on factor1 values
         * It fills both factor1 and unknown values to the grid
         */

    setupGrid() {
        this.grid = [
            [null, null, null, null, null, null], // carryover lv2
            [null, null, null, null, null, null], // carryover lv1
            [0, 0, 0, 0, 0, 0], // x
            [0, 0, 0, 0, 0, 0], // y
            [0, 0, 0, 0, 0, 0], // carry
            [0, 0, 0, 0, 0, 0]  // u
        ];

        let totalRowsForFactor1 = 4;
        let totalColsInGrid = 6;
        let gridRow = (totalRowsForFactor1 - this.factors1.length);
        this.factors1.forEach(element => {
            let val = element.value.toString();
            var startposition = totalColsInGrid - val.length;
            for (let i = 0; i < val.length; i++) {
                this.grid[gridRow][startposition + i] = parseInt(val[i]);
            }
            gridRow++;
        });

        let u = this.unknownAnswer.toString();
        let startposition = totalColsInGrid - u.length;
        let rowForUnknow = 4;

        if (this.operationType.toString() == "addition") {
            rowForUnknow = 5
        }

        for (let i = 0; i < u.length; i++) {
            this.grid[rowForUnknow][startposition + i] = parseInt(u[i]);
        }
    }


    /**
         * A method to calculate Regrouping positions
         * Returns a list of possible positions as array
         */
    calculateRegroupingPositions(): Array<Array<number>> {
        this.possibleRegroupingPositions = [];

        for (let i = 1; i < 6; i++) {

            var leftNeighborVerticalPosition = this.grid[2][i - 1] != null ? 2
                : this.grid[1][i - 1] != null ? 1
                    : 0;

            var leftNeighborXvalue = this.grid[2][i - 1] != null ? this.grid[2][i - 1]
                : this.grid[1][i - 1] != null ? this.grid[1][i - 1]
                    : this.grid[0][i - 1];


            var xvalue = this.grid[2][i] != null ? this.grid[2][i] : this.grid[1][i] != null ? this.grid[1][i] : this.grid[0][i];
            var yvalue = this.grid[3][i];

            if (xvalue < yvalue) {

                var leftNeighborHorizonPosition: number = i - 1;

                while (leftNeighborXvalue <= 0) {

                    leftNeighborHorizonPosition--;
                    leftNeighborVerticalPosition = this.grid[2][leftNeighborHorizonPosition] != null ? 2
                        : this.grid[1][leftNeighborHorizonPosition] != null ? 1
                            : 0;

                    leftNeighborXvalue = this.grid[leftNeighborVerticalPosition][leftNeighborHorizonPosition];

                }
                var exists = this.possibleRegroupingPositions.filter((arr) => {
                    if (arr[0] == leftNeighborVerticalPosition && arr[1] == leftNeighborHorizonPosition) {
                        return true;
                    }
                    return false;
                });

                if (!exists || exists.length <= 0) {

                    this.possibleRegroupingPositions.push([leftNeighborVerticalPosition, leftNeighborHorizonPosition]);
                }
            }
        }
        return this.possibleRegroupingPositions;
    }

    /**
     * A method calculates the regrouping position for numeral addition
     * Provides possible regrouping positions
     */
    calculateRegroupingPositionsForAddition() {
        this.possibleRegroupingPositions = [];
        for (var i = 5; i >= 0; i--) {
            if ((this.grid[0][i] + this.grid[1][i] + this.grid[2][i] + this.grid[3][i] + this.grid[4][i]) > 19) {
                this.grid[4][i - 1] = 2;
                this.possibleRegroupingPositions.push([2, i]);
                this.possibleRegroupingPositions.push([3, i]);
            }
            else if ((this.grid[0][i] + this.grid[1][i] + this.grid[2][i] + this.grid[3][i] + this.grid[4][i]) > 9) {
                this.grid[4][i - 1] = 1;
                this.possibleRegroupingPositions.push([2, i]);
                this.possibleRegroupingPositions.push([3, i]);
            }
        }
    }


    /**
     * A method is to show regrouping animation sequence for numeral substraction
     * @param regroupingPosition array contains row and columns of regrouping position
     * 
     */
    regrouping(regroupingPosition: Array<number>) {

        if (regroupingPosition.length != 2) return;

        var exists = this.possibleRegroupingPositions.filter((arr) => {
            if (arr[0] == regroupingPosition[0] && arr[1] == regroupingPosition[1]) {
                return true;
            }
            return false;
        });

        let animation: RegroupingAnimation;
        this.animations = [];
        if (exists) {

            var rightXVerticalPosition = this.grid[2][regroupingPosition[1] + 1] != null ? 2
                : this.grid[1][regroupingPosition[1] + 1] != null ? 1
                    : 0;

            var rightXValue = this.grid[rightXVerticalPosition][regroupingPosition[1] + 1];

            var rightYValue = this.grid[3][regroupingPosition[1] + 1]

            while (regroupingPosition[1] < 5 && rightXValue <= 0 && rightYValue <= 0) {

                var position: Array<number> = [];
                position = [regroupingPosition[0], regroupingPosition[1]];

                // animation : cross over regrouped card
                animation = new RegroupingAnimation(position,
                    ActionType.CrossOver);
                this.animations.push(animation);

                // animation : split the regrouped card to 2
                animation = new RegroupingAnimation(position,
                    ActionType.Split,
                    [this.grid[position[0]][position[1]] - 1, 10]);
                this.animations.push(animation);

                // animation : cross over right x card
                animation = new RegroupingAnimation([rightXVerticalPosition, position[1] + 1],
                    ActionType.CrossOver);
                this.animations.push(animation);

                // animation : move 1st of 2 splitted cards to upper position
                animation = new RegroupingAnimation(position,
                    ActionType.MoveTo,
                    [this.grid[position[0]][position[1]] - 1,
                        [position[0] - 1, position[1]]
                    ]);
                this.animations.push(animation);

                // animation: move 2st of 2 splitted cards to the new position
                //Changed move vaue from 10 to 1
                animation = new RegroupingAnimation(position,
                    ActionType.MoveTo,
                    [1,
                        [rightXVerticalPosition - 1, position[1] + 1]
                    ]);
                this.animations.push(animation);



                // data change
                this.grid[position[0] - 1][position[1]] = this.grid[regroupingPosition[0]][position[1]] - 1;
                this.grid[rightXVerticalPosition - 1][position[1] + 1] = 10 + this.grid[rightXVerticalPosition][position[1] + 1];

                this.grid[position[0]][position[1]] = null;
                this.grid[rightXVerticalPosition][position[1] + 1] = null;

                //set next rightXVerticalPosition and rightXValue
                regroupingPosition[1] = regroupingPosition[1] + 1;
                regroupingPosition[0] = this.grid[2][regroupingPosition[1]] != null ? 2
                    : this.grid[1][regroupingPosition[1]] != null ? 1
                        : 0;

                rightXVerticalPosition = this.grid[2][regroupingPosition[1] + 1] != null ? 2
                    : this.grid[1][regroupingPosition[1] + 1] != null ? 1
                        : 0;

                rightXValue = this.grid[rightXVerticalPosition][regroupingPosition[1] + 1];
                rightYValue = this.grid[3][regroupingPosition[1] + 1];
            }

            if (rightXValue >= this.grid[3][regroupingPosition[1] + 1] || regroupingPosition[1] >= 5) { return; }

            // animation : cross over regrouped card
            animation = new RegroupingAnimation(regroupingPosition,
                ActionType.CrossOver);
            this.animations.push(animation);

            // animation : move 1st of 2 splitted cards to new position
            animation = new RegroupingAnimation(regroupingPosition,
                ActionType.MoveTo,
                [this.grid[regroupingPosition[0]][regroupingPosition[1]] - 1,
                    [regroupingPosition[0] - 1, regroupingPosition[1]]
                ]);
            this.animations.push(animation);

            // animation : split the regrouped card to 2
            animation = new RegroupingAnimation(regroupingPosition,
                ActionType.Split,
                [this.grid[regroupingPosition[0]][regroupingPosition[1]] - 1, 10]);
            this.animations.push(animation);


            // animation: move 2st of 2 splitted cards to the new position
            //Changed move vaue from 10 to 1
            animation = new RegroupingAnimation(regroupingPosition,
                ActionType.MoveTo,
                [1,
                    [rightXVerticalPosition - 1, regroupingPosition[1] + 1]
                ]);
            this.animations.push(animation);


            //changed ------

            let crossedValue = this.grid[rightXVerticalPosition][regroupingPosition[1] + 1];

            //--------------------------------------------------
            // animation : cross over right x card
            animation = new RegroupingAnimation([rightXVerticalPosition, regroupingPosition[1] + 1],
                ActionType.CrossOver);
            this.animations.push(animation);


            // animation : move right x card to upper position
            animation = new RegroupingAnimation([rightXVerticalPosition, regroupingPosition[1] + 1],
                ActionType.MoveTo,
                [crossedValue,
                    [rightXVerticalPosition - 1, regroupingPosition[1] + 1]
                ]);
            this.animations.push(animation);

            // data change
            this.grid[regroupingPosition[0] - 1][regroupingPosition[1]] = this.grid[regroupingPosition[0]][regroupingPosition[1]] - 1;
            this.grid[rightXVerticalPosition - 1][regroupingPosition[1] + 1] = 10 + this.grid[rightXVerticalPosition][regroupingPosition[1] + 1];

            this.grid[regroupingPosition[0]][regroupingPosition[1]] = null;
            this.grid[rightXVerticalPosition][regroupingPosition[1] + 1] = null;
        }
    }

    /**
     * A method is to create bad guys for numeral game. 
     * It creates bad guys object array with individual digits of number as value.
     * @param guyCount is the length of bad guy
     * 
     */

    private createBadGuys(guyCount: any): Array<BadGuy> {
        var results: Array<BadGuy> = [];
        var count: number;

        count = (guyCount).toString().length;

        for (let i = 0; i < count; i++) {

            if ((guyCount).toString()[i].indexOf(".") == -1) {
                let guy: BadGuy = {
                    id: "bad" + (i + 1),
                    name: "",
                    value: this.stateLevelJSONBlock.badGuyTypes[0] > 0 ? (guyCount).toString()[i] : 1,
                    type: this.stateLevelJSONBlock.badGuyTypes[0],
                    decimalPosition: this.decimalPoints,
                    uiElement: null
                }
                
                if( (guyCount).toString()[i]==" ")
                guy=null;
                
                results.push(guy);
            }
        }
        return results;
    }


    /**
    * A method is to create bad guys grid structure. 
    * Inserts null to the position where there is no value.
    * @param badGuys is the length of bad guy
    * 
    */
    private createGridOfBadGuys(badGuys: Array<BadGuy>): Array<BadGuy> {
        let i = 0;
        let insertUpto = (6 - badGuys.length);
        this.decimalPoints = this.factors1[0].decimalPosition;

        while (i < insertUpto) {
            if (this.decimalPoints != -1)
                this.decimalPoints++;
            //this.decimalPoints.xDecimalIndex++;
            //this.decimalPoints.yDecimalIndex++;
            badGuys.unshift(null);
            i++;
        }
        return badGuys;
    }

    /**
    * A method is to create bad guys grid structure for decimal numbers.
    * @param decimalValue is the numeric value for which the zero is to be appended or prepended
    * 
    */
    private createSameGridSizeForDecimal(decimalValue: any) {
       
        if (decimalValue.toString().indexOf(".") == -1 && this.stateLevelJSONBlock['money'] != 'dollarscent')
            return decimalValue;

        let lengthAfterDecimal = 2;
        let lengthBeforeDecimal = 1;
        let element = decimalValue.toFixed(2);


        let currentAfterDecimal = element.toString().length - element.toString().indexOf(".") - 1;
        let currentBeforeDecimal = element.toString().indexOf(".");

        let zeroToAppend = lengthAfterDecimal - currentAfterDecimal;
        let zeroToPrepend = lengthBeforeDecimal - currentBeforeDecimal;

        if (zeroToAppend > 0) {
            for (var index = 0; index < zeroToAppend; index++) {
                element = element + "0";
            }
        }
        else if (zeroToPrepend > 0) {
            for (var index = 0; index < zeroToAppend; index++) {
                element = "0" + element;
            }
        }
        return element;
    }
}