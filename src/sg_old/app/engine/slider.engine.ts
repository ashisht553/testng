declare var algebra: any;
declare var Probability: any;
export namespace SliderGameEngine {

    /**
    * Represents a enumerator for tile types
    * 
    * @enum TileType
    */
    export enum TileType {
        normal,
        goodGuy,
        badGuy,
        pointedSlide_Col,
        pointedSlide_Row
    }

    /**
     * Represents a enumerator for value types
     * 
     * @enum ValueType
     */
    enum ValueType {
        integer,
        decimal,
        fraction,
        percentage,
        equation
    }

    /**
     * Represents a enumerator for Arithmetatic operation
     * 
     * @enum OperationType
     */
    enum OperationType {
        addition,
        subraction,
        division,
        multiplication
    }

    /**
     * Represents a class which will be used for each card type
     * 
     * @class GlobalCardMethods
     */
    class GlobalCardMethods {

        /**
        * This method will get the card value type and it's value
        * 
        * @param cardValueString It contains value of the card
        * @returns It will return the card data type and value
        * 
        * @memberOf GlobalCardMethods
        */
        getCardValueType(cardValueString: string): any {
            let valueType = cardValueString[0];
            let cardData = {
                type: 0,
                value: ''
            };
            switch (valueType) {
                case 'D': cardData.type = ValueType.integer;
                    cardData.value = this.isIntorDecimalCardValue(cardValueString);
                    break;
                case 'P': cardData.type = ValueType.percentage;
                    cardData.value = this.isPercentageCardValue(cardValueString);
                    break;
                case 'F': cardData.type = ValueType.fraction;
                    cardData.value = this.isFractionCardValue(cardValueString);
                    break;
            }
            cardData.value = this.calculateLatexParam(cardData.value);
            return cardData;
        }

        /** 
         * This method will get the integer or decimal value of the card
         * 
         * @param cardValue It contains value of the card
         * @returns It will return params inside the braces
         * 
         * @memberOf GlobalCardMethods
         */
        isIntorDecimalCardValue(cardValue: string) {
            let intorDecimal = /D\(([^)]+)\)/;
            let matches = intorDecimal.exec(cardValue);
            return matches[1];
        }

        /**
         * This method will get the fraction value of the card
         * 
         * @param cardValue It contains value of the card
         * @returns It will return params inside the braces
         * 
         * @memberOf GlobalCardMethods
         */
        isFractionCardValue(cardValue: string) {
            let fraction = /F\(([^)]+)\)/;
            let matches = fraction.exec(cardValue);
            return matches[1];
        }

        /**
         * This method will get the percentage value of the card
         * 
         * @param cardValue It contains value of the card
         * @returns It will return params inside the braces
         * 
         * @memberOf GlobalCardMethods
         */
        isPercentageCardValue(cardValue: string) {
            let percentage = /P\(([^)]+)\)/;
            let matches = percentage.exec(cardValue);
            return matches[1];
        }

        /**
         * This method will get the unicode value for operation symbols to display.
         * 
         * @param operationSymbol It contians the symbol of arthematic operator
         * @returns It will return the unicode value for the respective operator
         * 
         * @memberOf GlobalCardMethods
         */
        getOperationSymbol(operationSymbol: string, latex: string): string {
            switch (operationSymbol) {
                case '+': return `\u002B`;
                case '-': return `\u2212 `;
                case '/': return `\u00F7`;
                case '*':
                    if (latex === '\\cdot') {
                        return '\u2022';
                    } else {
                        return '\u00D7';
                    }
                case '%': return `%`;
                default: return '';
            }
        }

        /**
         * This method will generate the image url
         * 
         * @param valueType It contains card value type
         * @param latexParam It contains latex parameter value
         * @returns It will return url of converted latex image
         * 
         * @memberOf GlobalCardMethods
         */
        getLatexURL(valueType: ValueType, latexParam: string): string {
            let convertedParams = this.latexParamToURL(latexParam);
            convertedParams = convertedParams.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            return convertedParams;
        }


        /**
         * This method will convert the ordinary string to latex string
         * 
         * @param latexParam It contains string to convert
         * @returns It will return latexString 
         * 
         * @memberOf GlobalCardMethods
         */
        latexParamToURL(latexParam: string): string {
            latexParam = '' + latexParam;
            let params = latexParam.split(',');
            switch (params.length) {
                case 1: return `${params[0]}`;
                case 2: return `\\frac{${params[0]}}{${params[1]}}`;
                case 3: return `${params[0]}\\frac{${params[1]}}{${params[2]}}`;
            }
            return '';
        }

        /**
         * This method will convert the given string to normal fraction format
         * 
         * @returns It will return array of fraction values
         * 
         * @memberOf GlobalCardMethods
         */
        toNormal(latexParam: any): any {
            let params = latexParam.split(',');
            params = (params.length > 2) ? this.toFraction(latexParam) : params;
            return [parseFloat(params[0]), parseFloat(params[1])];
        }

        /**
         * This method will convert the given string to mixed fraction format
         * 
         * @returns It will return array of fraction values
         * 
         * @memberOf GlobalCardMethods
         */
        toMixed(latexParam: any): any {
            let params = latexParam.split(',');
            if (params.length === 2) {
                return this.getMixedNumberFraction(parseFloat(params[0]), parseFloat(params[1]));
            } else {
                return latexParam;
            }
        }

        /**
         * This method is used to convert given string to simple fraction format
         * 
         * @returns It will return array of fraction values
         * 
         * @memberOf GlobalCardMethods
         */
        toFraction(latexParam: any): Array<any> {
            let params = latexParam.split(',');
            return [((parseFloat(params[0]) * parseFloat(params[2]) + parseFloat(params[1]))), parseFloat(params[2])];
        }

        /**
         * This method will return mixed fraction
         * 
         * @param numerator It contains numerator value of fraction
         * @param denominator It contains denominator value of fraction
         * @returns It will return the array of mixed fraction values
         * 
         * @memberOf GlobalCardMethods
         */
        getMixedNumberFraction(numerator: number, denominator: number): Array<any> {
            let i: number = parseInt('' + (numerator / denominator));
            numerator -= i * denominator;
            if (i === 0) {
                return [this.getSimpleFraction(numerator, denominator)]
            } else {
                //modified to prevent display 1 as denominator
                if (this.getSimpleFraction(numerator, denominator).length > 1) {
                    return [i, this.getSimpleFraction(numerator, denominator)];
                } else {
                    return [i];
                }

            }
        }

        /**
         * This method will convert given fraction to simple fraction
         * 
         * @param numerator It contains numerator value of fraction
         * @param denominator It contains denominator value of fraction
         * @returns It will return array of simple fraction values
         * 
         * @memberOf GlobalCardMethods
         */
        getSimpleFraction(numerator: number, denominator: number): any {
            if (isNaN(numerator) || isNaN(denominator))
                return NaN;
            let greatestCommonDivisor: any = function greatestCommonDivisor(a: any, b: any): any {
                return b ? greatestCommonDivisor(b, a % b) : a;
            };
            greatestCommonDivisor = greatestCommonDivisor(numerator, denominator);
            //modified to avoid 0 in numerator
            if (numerator / greatestCommonDivisor > 0) {
                return [numerator / greatestCommonDivisor, denominator / greatestCommonDivisor];
            } else {
                return [denominator / greatestCommonDivisor];
            }
        }

        /**
         * This method will convert given string to machine understandable format
         * 
         * @param latexString It contains latex string to convert
         * @returns It iwll return machine understandable code
         * 
         * @memberOf GlobalCardMethods
         */
        toMachineCodeString(latexString: string): string {
            let params = latexString.split(',');
            switch (params.length) {
                case 1: return params[0];
                case 2: return `${params[0]}/${params[1]}`;
                case 3: let fractionValue = this.toFraction(latexString);
                    return `${fractionValue[0]}/${fractionValue[1]}`;
            }
            return '';
        }

        /**
         * This method will evaluate the math expressions given inside the bracis of function card and variable card
         * 
         * @param * latexParam It contains latex param string to evaluate 
         * @returns It will return evaluated value
         * 
         * @memberOf GlobalCardMethods
         */
        calculateLatexParam(latexParam: string) {
            // search is there any operation symbol is present inside card
            let mathExpression = latexParam.match(/\s[/*+-]\s/i);
            if (mathExpression !== null) {
                let operands = latexParam.split(mathExpression[0]);
                let leftMachineValue = this.toMachineCodeString(operands[0]);
                let rightMachineValue = this.toMachineCodeString(operands[1]);
                let machineValue = this.toMachineCodeString(`(${leftMachineValue})${mathExpression[0]}(${rightMachineValue})`);
                let resultValue = algebra.parse(`${machineValue}`).constant();
                let value = '0';
                if (resultValue.denom === 1) {
                    value = resultValue.numer;
                } else {
                    if (latexParam.split(',').length === 3) {
                        value = this.getMixedNumberFraction(resultValue.numer, resultValue.denom).toString();
                    } else {
                        value = `${resultValue.numer},${resultValue.denom}`;
                    }
                }
                return '' + value;
            }
            return latexParam;
        }
    }

    /**
     * Tile class
     * 
     * @class Tile
     * @extends {GlobalCardMethods}
     */
    class Tile extends GlobalCardMethods {
        tileData: any;
        latexData: any;

        constructor(tileData: any) {
            super();
            this.tileData = tileData;
            let getCardType = this.getCardValueType(tileData.value);
        }
    }

    /**
     * EngineBase class
     * 
     * @export
     * @class EngineBase
     */
    export class EngineBase extends GlobalCardMethods {
        gameJSON: any;
        currentLevel: any;
        variableValues: any = null;
        validPairs: Array<any>;
        generatedTiles: Array<any>;
        totalTiles: number;
        tileDetails: any;
        goodGuyAdded: boolean = false;
        badGuyAdded: boolean = false;
        bonusTileAdded: boolean = false;
        pointsJSON: any;
        gradePointsData: any;
        probabilityArray: Array<String> = [];
        gridValue: Array<any> = [];
        maximumGoodGuys: number;
        maximumBadGuys: number;
        totalGoodAndBadGuys: number;
        grade:number;
        maximumComboTiles:number;
        sliderValuesType: number = 0;
        sliderValues: Array<string> = [];
        sliderValueParams: Array<any> = [];

        /**
         * Creates an instance of EngineBase. 
         * 
         * @param jsonData It contains the json data from assets
         * 
         * @memberOf EngineBase
         */
        constructor(jsonData: any) {
            super();
            this.gameJSON = jsonData;
        }

        /**
         * This method will returns the cloned level json
         * 
         * @param * json It contains level json to clone
         * @returns * It will returns the new cloned json object
         * 
         * @memberOf EngineBase
         */
        getCloneJSON(json: any): any {
            let JSONString = JSON.stringify(json);
            return JSON.parse(JSONString);
        }

        /**
         * This mehtod will set the current game level json data
         * 
         * @param level It contains the level index
         * 
         * @memberOf EngineBase
         */
        setJSONLevel(level: number,json:any,grade:any) {
            if (level < this.gameJSON.levelData.length) {
                this.currentLevel = this.getCloneJSON(this.gameJSON.levelData[level]);
            } else {
                this.currentLevel = this.getCloneJSON(this.gameJSON.levelData[0]);
            }
            this.setGradePointsData(json,grade);
            this.initGameData();
        }

        /**
         * This method will set the points to given for the users in different achievements
         * 
         * @param  json It conatains json data loaded from json file
         * @param  grade It contains current grade 
         * 
         * @memberOf EngineBase
         */
        setGradePointsData(json: any, grade: any) {
            this.grade = typeof grade === 'number' ? grade : parseInt(grade);
            this.pointsJSON = this.getCloneJSON(json);
            this.gradePointsData = this.pointsJSON[`grade${grade}`];
            if (this.gradePointsData == undefined || this.gradePointsData == null) {
                this.gradePointsData = this.pointsJSON[`global`];
            }
            this.setMaxGoodAndBadGuy();
        }

        /**
         * This method will intilize the current game data from json
         * 
         * @memberOf EngineBase
         */
        initGameData() {
            this.variableValues = {
                var0: this.currentLevel.var0 !== null ? [_.shuffle(this.currentLevel.var0)[0]] : null,
                var1: this.currentLevel.var1 !== null ? [_.shuffle(this.currentLevel.var1)[0]] : null,
                var2: this.currentLevel.var2 !== null ? [_.shuffle(this.currentLevel.var2)[0]] : null,
            };

            this.totalTiles = this.currentLevel.gridSize * this.currentLevel.gridSize;
            this.setFilteredGridValues();
            if (this.currentLevel.grid.values != null) {
                this.currentLevel.grid.values.map((ele: string, index: number) => {
                    let tileData = this.getCardValueType(ele);
                    this.currentLevel.grid.values[index] = {
                        value: tileData.value,
                        type: tileData.type,
                        data: ele
                    };
                });
            }
            this.initSliderProperties();
            this.generateValidPairs();
            this.probality();
            if (this.validPairs.length > 0) {
                this.generateTiles();
            } else {
                alert("Valid pairs not available...");
            }
        }

        /**
         * This method is used to initialize the slider's min,max,height,interval and total
         * 
         * @memberOf EngineBase
         */
        initSliderProperties() {
            if (this.currentLevel.slider.height) {
                this.currentLevel.slider.height = this.replaceVariableValues(this.currentLevel.slider.height);
                this.currentLevel.slider.height = this.getCardValueType(this.currentLevel.slider.height);
                this.currentLevel.slider.height.latexParam = this.latexParamToURL(this.currentLevel.slider.height.value);
                if (this.currentLevel.slider.height.type == 2) {
                    this.currentLevel.slider.height.value = this.toNormal(this.currentLevel.slider.height.value);
                    this.currentLevel.slider.height.value = `${this.currentLevel.slider.height.value[0]}/${this.currentLevel.slider.height.value[1]}`;
                }
            }

            if (this.currentLevel.slider.total) {
                this.currentLevel.slider.total = this.replaceVariableValues(this.currentLevel.slider.total);
                this.currentLevel.slider.total = this.getCardValueType(this.currentLevel.slider.total);
                this.currentLevel.slider.total.latexParam = this.latexParamToURL(this.currentLevel.slider.total.value);
                if (this.currentLevel.slider.total.type == 2) {
                    this.currentLevel.slider.total.value = this.toNormal(this.currentLevel.slider.total.value);
                    this.currentLevel.slider.total.value = `${this.currentLevel.slider.total.value[0]}/${this.currentLevel.slider.total.value[1]}`;
                }
            }

            if (this.currentLevel.slider.min) {
                this.currentLevel.slider.min = this.replaceVariableValues(this.currentLevel.slider.min);
                this.currentLevel.slider.min = this.getCardValueType(this.currentLevel.slider.min);
                this.currentLevel.slider.min.latexString = this.currentLevel.slider.min.value;
                this.currentLevel.slider.min.latexParam = this.latexParamToURL(this.currentLevel.slider.min.value);
                if (this.currentLevel.slider.min.type == 2) {
                    this.currentLevel.slider.min.value = this.toNormal(this.currentLevel.slider.min.value);
                    this.currentLevel.slider.min.value = `${this.currentLevel.slider.min.value[0]}/${this.currentLevel.slider.min.value[1]}`;
                }
            }

            if (this.currentLevel.slider.max) {
                this.currentLevel.slider.max = this.replaceVariableValues(this.currentLevel.slider.max);
                this.currentLevel.slider.max = this.getCardValueType(this.currentLevel.slider.max);
                this.currentLevel.slider.max.latexString = this.currentLevel.slider.max.value;
                this.currentLevel.slider.max.latexParam = this.latexParamToURL(this.currentLevel.slider.max.value);
                if (this.currentLevel.slider.max.type == 2) {
                    this.currentLevel.slider.max.value = this.toNormal(this.currentLevel.slider.max.value);
                    this.currentLevel.slider.max.value = `${this.currentLevel.slider.max.value[0]}/${this.currentLevel.slider.max.value[1]}`;
                }
            }

            if (this.currentLevel.slider.interval) {
                this.currentLevel.slider.interval = this.replaceVariableValues(this.currentLevel.slider.interval);
                this.currentLevel.slider.interval = this.getCardValueType(this.currentLevel.slider.interval);
                this.currentLevel.slider.interval.latexParam = this.latexParamToURL(this.currentLevel.slider.interval.value);
                if (this.currentLevel.slider.interval.type == 2) {
                    this.currentLevel.slider.interval.value = this.toNormal(this.currentLevel.slider.interval.value);
                    this.currentLevel.slider.interval.value = `${this.currentLevel.slider.interval.value[0]}/${this.currentLevel.slider.interval.value[1]}`;
                }
            }
            this.calculateSliderValues();
        }

        /**
         * This function is used to generate tile values from available valid pairs
         * 
         * @memberOf EngineBase
         */
        generateTiles() {
            let tiles: any = [];
            let tile: any = null;
            this.validPairs = _.shuffle(this.validPairs);
            this.validPairs.map((ele, index) => {
                tiles.push(ele.left);
                tiles.push(ele.right);
            });
            let index = 0;
            while (tiles.length < this.totalTiles) {
                tile = this.validPairs[index];
                tiles.push(tile.left);
                tiles.push(tile.right);
                index++;
                if (index >= this.validPairs.length) {
                    index = 0;
                }
            }
            this.generatedTiles = tiles;
        }

        /**
         * This method is used to generate grid columns at game beginning and every time the user clears the tiles
         * 
         * @param oldCols
         * @param tileClicked
         * @returns
         * 
         * @memberOf EngineBase
         */
        generateNormalTileCols(oldCols: Array<any>, tileClicked: number) {
            this.generateTiles();
            this.analyseTiles(oldCols);
            let columns: any = oldCols;
            let index = 0;
            let finalColumns: any;

            //First time grid generation
            if (tileClicked === 0) {
                for (let col = 0; col < this.currentLevel.gridSize; col++) {
                    columns[col] = (columns[col]) ? columns[col] : [];
                    let rows = columns[col];
                    for (let row = 0; row < this.currentLevel.gridSize - 2; row++) {
                        if (typeof rows[row] === 'undefined') {
                            columns[col].push(this.generatedTiles[index++]);
                        }
                    }
                    //To shuffle the initial good,bad,bonus guys remove some generated tiles
                    let toRemove = this.generateRandomNumber(this.currentLevel.gridSize - 2, 1);
                    columns[col].splice(toRemove, 1);
                }
                this.analyseTiles(oldCols);
            }

            let addRows = this.generateRow(tileClicked);
            for (let col = 0; col < this.currentLevel.gridSize; col++) {
                columns[col] = (columns[col]) ? columns[col] : [];
                let rows = columns[col];
                for (let row = 0; row < this.currentLevel.gridSize; row++) {
                    if (typeof rows[row] === 'undefined') {
                        if (typeof addRows[`${col}_${row}`] !== 'undefined') {
                            columns[col].push(addRows[`${col}_${row}`]);
                        } else {
                            columns[col].push(this.generatedTiles[index++]);
                        }
                    }
                }
            }
            finalColumns = columns;
            return finalColumns;
        }

        /**
         * This function is used to analyze the current location and the type of tiles/guys exist on the grid
         * 
         * @param {Array<any>} oldCols
         * 
         * @memberOf EngineBase
         */
        analyseTiles(oldCols: Array<any>) {
            let columns: any = oldCols;
            this.tileDetails = {
                tileValue: [],
                gg: [],
                bg: [],
                tilesToFill: [],
                rowBonus: [],
                colBonus: []
            };
            for (let col = 0; col < this.currentLevel.gridSize; col++) {
                columns[col] = (columns[col]) ? columns[col] : [];
                let rows = columns[col];
                for (let row = 0; row < this.currentLevel.gridSize; row++) {
                    if (typeof rows[row] !== 'undefined') {
                        switch (rows[row].type) {
                            case 0: this.tileDetails.tileValue.push(rows[row].value); break;
                            case 1: this.tileDetails.gg.push(`${col}_${row}`); break;
                            case 2: this.tileDetails.bg.push(`${col}_${row}`); break;
                            case 3: this.tileDetails.colBonus.push(`${col}_${row}`); this.tileDetails.tileValue.push(rows[row].value); break;
                            case 4: this.tileDetails.rowBonus.push(`${col}_${row}`); this.tileDetails.tileValue.push(rows[row].value); break;
                        }
                    } else {
                        this.tileDetails.tilesToFill.push(`${col}_${row}`);
                    }
                }
            }
        }

        /**
         * This method is used to generate tiles/guys and place it based on the rules given to each type of tiles/guys
         * 
         * @param tileClicked
         * @returns Returns array of tile type,value,image url,latexstring to display in the various position of the grid
         * 
         * @memberOf EngineBase
         */
        generateRow(tileClicked: number) {
            this.tileDetails.tileValue = _.shuffle(this.tileDetails.tileValue);
            let row: any = {};
            let totalChars = this.tileDetails.gg.length + this.tileDetails.bg.length;
            let totalComboTile = this.tileDetails.colBonus.length + this.tileDetails.rowBonus.length;
            let totalBadGuys = this.tileDetails.bg.length;
            let totalGoodGuys = this.tileDetails.gg.length;
            let bgCols = _.reduce(this.tileDetails.bg, (arr: Array<any>, ele: any) => {
                arr.push(parseInt(ele.split('_')[0]));
                return arr;
            }, []);

            let ggCols = _.reduce(this.tileDetails.gg, (arr: Array<any>, ele: any) => {
                arr.push(parseInt(ele.split('_')[0]));
                return arr;
            }, []);

            let ggColRow = _.reduce(this.tileDetails.gg, (arr: Array<any>, ele: any) => {
                arr.push(ele);
                return arr;
            }, []);

             let bgColRow = _.reduce(this.tileDetails.bg, (arr: Array<any>, ele: any) => {
                arr.push(ele);
                return arr;
            }, []);

            let eligibleGGcols = _.difference(_.range(0, this.currentLevel.gridSize, 1), bgCols);
            eligibleGGcols = _.shuffle(eligibleGGcols);

            let eligibleBGcols = _.difference(_.range(0, this.currentLevel.gridSize, 1), ggCols);
            eligibleBGcols = _.shuffle(eligibleBGcols);

            this.tileDetails.tilesToFill = _.shuffle(this.tileDetails.tilesToFill);

            let addGoodGuy: boolean = false;
            let addBadGuy: boolean = false;
            let addBonusTile: boolean = false;

            if (tileClicked > 0) {
                let ind = 0;
                if (!this.isValidPairAvailable()) {
                    let tileObject: any = this.getValidPairValue(this.tileDetails.tileValue[this.generateRandomNumber(this.tileDetails.tileValue.length - 1, 0)]);
                    row[this.tileDetails.tilesToFill[0]] = {
                        value: tileObject.value,
                        latexUrl: tileObject.latexUrl,
                        type: TileType.normal,
                        latexString: tileObject.latexString,
                        valueType: tileObject.valueType
                    };
                    this.tileDetails.tilesToFill.splice(0, 1);
                }

                let disableGgBg:any=[];
                disableGgBg=this.blockGgBgOnFirstRow(ggColRow,bgColRow);

                let disableBG: any = [];
                for (let k = 0; k < ggColRow.length; k++) {
                    let s = parseInt(`${ggColRow[k].split('_')[1]}`);
                    s = s + 1;
                    disableBG.push(`${ggColRow[k].split('_')[0]}_${s}`);
                    disableBG.push(`${ggColRow[k].split('_')[0]}_${s - 2}`);
                    disableBG.push(`${ggColRow[k].split('_')[0]}_${s - 3}`);
                    disableBG.push(`${ggColRow[k].split('_')[0]}_${s - 4}`);
                }
                disableBG = _.uniq(disableBG);

                for (let i = 0; i < this.tileDetails.tilesToFill.length; i++) {
                    let index = this.generateRandomNumber(99, 0);
                    let tileType = this.probabilityArray[index];
                    switch (tileType) {
                        case 'goodGuy': addGoodGuy = true; break;
                        case 'badGuy': addBadGuy = true; break;
                        case 'comboTile': addBonusTile = true; break;
                        default:
                            break;
                    }
                    let toFill = this.tileDetails.tilesToFill[i];

                    if (addBadGuy && totalChars < this.totalGoodAndBadGuys && typeof row[toFill] === 'undefined' && totalBadGuys < this.maximumBadGuys) {
                        let colIndex = parseInt(toFill.split('_')[0]);

                        // To prevent bad guys appear at the bottom row when the user clear the column with vertical combo tile
                        if (parseInt(toFill.split('_')[1]) !== 0  &&  !_.contains(disableGgBg,toFill)) {
                            if (!_.contains(disableBG, toFill)) {
                                row[toFill] = {
                                    value: '',
                                    type: TileType.badGuy
                                };
                                if (tileClicked != 0) {
                                    this.badGuyAdded = true;
                                    totalChars++;
                                    totalBadGuys++;
                                }
                                let bgColIndex = eligibleGGcols.indexOf(colIndex);
                                if (bgColIndex > -1) {
                                    eligibleGGcols.splice(bgColIndex, 1);
                                }
                            }
                        }
                    }


                    if (addGoodGuy && typeof row[toFill] === 'undefined' && totalChars < this.totalGoodAndBadGuys && totalGoodGuys < this.maximumGoodGuys) {
                        let colIndex = parseInt(toFill.split('_')[1]);
                        let ggAdded = 0;
                        this.tileDetails.tilesToFill.map((ele: string, index: number) => {
                            colIndex = parseInt(ele.split('_')[0]);
                            //To prevent good to appear in the first row when the user clears the vertical combo tile
                            if (parseInt(ele.split('_')[1]) !== 0  &&  !_.contains(disableGgBg,ele)) {
                                //not allow good guy above bad guy
                                if (_.contains(eligibleGGcols, colIndex) && ggAdded === 0) {
                                    if (ggAdded === 0) {
                                        let rowIndex = parseInt(ele.split('_')[1]);
                                        let j = rowIndex + 1;

                                        disableBG.push(`${ele.split('_')[0]}_${j}`);
                                        disableBG.push(`${ele.split('_')[0]}_${j - 2}`);
                                        disableBG.push(`${ele.split('_')[0]}_${j - 3}`);
                                        disableBG.push(`${ele.split('_')[0]}_${j - 4}`);

                                        disableBG = _.uniq(disableBG);

                                        row[ele] = {
                                            value: '',
                                            type: TileType.goodGuy
                                        };
                                        ggAdded++;
                                        if (tileClicked != 0) {
                                            this.goodGuyAdded = true;
                                            totalChars++;
                                            totalGoodGuys++;
                                        }
                                    }
                                }
                            }
                        });
                    }

                    if (addBonusTile && typeof row[toFill] === 'undefined' && totalComboTile < this.maximumComboTiles) {
                        let tileIndex = ind++;
                        let type = (addBonusTile) ? _.shuffle([TileType.pointedSlide_Col, TileType.pointedSlide_Row])[0] : TileType.normal;
                        row[toFill] = {
                            value: this.generatedTiles[tileIndex].value,
                            latexUrl: this.generatedTiles[tileIndex].latexUrl,
                            type: type,
                            latexString: this.generatedTiles[tileIndex].latexString,
                            valueType: this.generatedTiles[tileIndex].valueType
                        };

                        if (tileClicked != 0 && (type == TileType.pointedSlide_Col || type == TileType.pointedSlide_Row)) {
                            this.bonusTileAdded = true;
                        }
                        totalComboTile++;
                    }

                    //Fill with normal tile if not filled by goodguy or badguy or bonus tile
                    if (typeof row[toFill] === 'undefined') {
                        let tileIndex = ind++;
                        row[toFill] = {
                            value: this.generatedTiles[tileIndex].value,
                            latexUrl: this.generatedTiles[tileIndex].latexUrl,
                            type: TileType.normal,
                            latexString: this.generatedTiles[tileIndex].latexString,
                            valueType: this.generatedTiles[tileIndex].valueType
                        };
                    }
                }
            }

            if ((this.tileDetails.tilesToFill.length >= this.currentLevel.gridSize) && tileClicked == 0) {
                if (tileClicked == 0) {
                    addGoodGuy = true;
                    addBadGuy = true;
                    addBonusTile = true;
                }
                let ind = 0;
                let disableBG: any = [];
                for (let k = 0; k < ggColRow.length; k++) {
                    let s = parseInt(`${ggColRow[k].split('_')[1]}`);
                    s = s + 1;
                    disableBG.push(`${ggColRow[k].split('_')[0]}_${s}`);
                    disableBG.push(`${ggColRow[k].split('_')[0]}_${s - 2}`);
                    disableBG.push(`${ggColRow[k].split('_')[0]}_${s - 3}`);
                    disableBG.push(`${ggColRow[k].split('_')[0]}_${s - 4}`);
                }

                disableBG = _.uniq(disableBG);
                // for badGuy
                if (addBadGuy && totalChars < this.totalGoodAndBadGuys && !this.badGuyAdded && totalBadGuys < this.maximumBadGuys) {
                    for (let i = 0; i < this.tileDetails.tilesToFill.length; i++) {
                        let ele = this.tileDetails.tilesToFill[i];
                        let colIndex = parseInt(ele.split('_')[0]);

                        if (typeof row[ele] === 'undefined' && totalChars < this.totalGoodAndBadGuys && !_.contains(disableBG, ele)) {
                            row[ele] = {
                                value: '',
                                type: TileType.badGuy
                            };
                            totalChars++;
                            totalBadGuys++;
                            this.badGuyAdded = true;
                            let bgColIndex = eligibleGGcols.indexOf(colIndex);
                            if (bgColIndex > -1) {
                                eligibleGGcols.splice(bgColIndex, 1);
                            }
                            break;
                        }
                    }
                }
                // for GoodGuy
                if (addGoodGuy && totalChars < this.totalGoodAndBadGuys && !this.goodGuyAdded && totalGoodGuys < this.maximumGoodGuys) {
                    for (let i = 0; i < this.tileDetails.tilesToFill.length; i++) {
                        let ele = this.tileDetails.tilesToFill[i];
                        //not allow good guy above bad guy
                        if (_.contains(eligibleGGcols, parseInt(ele.split('_')[0]))) {
                            let rowIndex = parseInt(ele.split('_')[1]);
                            let j = rowIndex + 1;
                            disableBG.push(`${ele.split('_')[0]}_${j}`);

                            row[ele] = {
                                value: '',
                                type: TileType.goodGuy
                            };
                            totalChars++;
                            totalGoodGuys++;
                            this.goodGuyAdded = true;
                            break;
                        }
                    }
                }

                // for bonusTile
                if (addBonusTile && !this.bonusTileAdded && totalComboTile < this.maximumComboTiles) {
                    for (let i = 0; i < this.tileDetails.tilesToFill.length; i++) {
                        let ele = this.tileDetails.tilesToFill[i];
                        if (typeof row[ele] === 'undefined') {
                            let tileIndex = ind++;
                            row[ele] = {
                                value: this.generatedTiles[tileIndex].value,
                                latexUrl: this.generatedTiles[tileIndex].latexUrl,
                                type: _.shuffle([TileType.pointedSlide_Col, TileType.pointedSlide_Row])[0],
                                latexString: this.generatedTiles[tileIndex].latexString,
                                valueType: this.generatedTiles[tileIndex].valueType

                            };
                            this.bonusTileAdded = true;
                            break;
                        }
                    }
                    totalComboTile++;
                }

                // fill remain tiles
                for (let i = 0; i < this.tileDetails.tilesToFill.length; i++) {
                    let ele = this.tileDetails.tilesToFill[i];
                    if (typeof row[ele] === 'undefined') {
                        let tileIndex = ind++;
                        row[ele] = {
                            value: this.generatedTiles[tileIndex].value,
                            latexUrl: this.generatedTiles[tileIndex].latexUrl,
                            type: TileType.normal,
                            latexString: this.generatedTiles[tileIndex].latexString,
                            valueType: this.generatedTiles[tileIndex].valueType
                        };
                        break;
                    }
                }

            }
            return row;
        }

        /**
         * This function is used to generate valid pairs of numbers to display on the grid.
         * 
         * @memberOf EngineBase
         */
        generateValidPairs() {
            let min: number = eval(this.currentLevel.slider.min.value);
            let total: number = eval(this.currentLevel.slider.total.value);
            let max: number = eval(this.currentLevel.slider.max.value);
            let interval: number = this.currentLevel.slider.interval ? eval(this.currentLevel.slider.interval.value) : 0;
            let left, right;
            this.validPairs = [];
            let height: any = 1;
            if (this.currentLevel.slider.height) {
                height = this.currentLevel.slider.height.value;
            }
         
            if (this.currentLevel.sliderType == 'Ratio') {
                if (this.currentLevel.grid.values != null) {
                    this.generateRatioValidPairs(min,max,left,right,interval,total);
                } else {
                    alert("Grid values should not be empty for ratio model");
                }
            } else {
                let heightString = height;
                while (min <= max) {
                    left = algebra.parse(`${heightString}*${min}`).toTex();
                    let anotherValue = total - min;
                    right = algebra.parse(`${heightString}*${anotherValue}`).toTex();
                    if (this.currentLevel.grid.values != null) {
                        if (this.isValueInGrid(left)) {
                            let leftStringToUrl = this.gridValue[0].value;
                            if (this.isValueInGrid(right)) {
                                let rightStringToUrl = this.gridValue[0].value;
                                let leftValue = eval(height) * min;
                                let rightValue = eval(height) * anotherValue;
                                let leftTileType = leftValue % 1 == 0 ? ValueType.integer : ValueType.fraction;
                                let rightTileType = rightValue % 1 == 0 ? ValueType.integer : ValueType.fraction;

                                let leftUrl = this.getLatexURL(leftTileType, leftStringToUrl);
                                let rightUrl = this.getLatexURL(rightTileType, rightStringToUrl);

                                this.validPairs.push({
                                    left: {
                                        value: leftValue,
                                        type: TileType.normal,
                                        latexUrl: leftUrl,
                                        latexString: this.latexParamToURL(left),
                                        valueType:leftTileType
                                    },
                                    right: {
                                        value: rightValue,
                                        type: TileType.normal,
                                        latexUrl: rightUrl,
                                        latexString: this.latexParamToURL(right),
                                        valueType:rightTileType
                                    }
                                });
                            }
                        }
                    } else {
                        this.pushActualValuesIntoValidPairs(height,min,anotherValue,left,right);
                    }
                    min += interval;
                    if (interval == 0) {
                        break;
                    }
                }
            }
        }

        /**
         * This function is used to check the availability of the given value on the grid value
         * 
         * @param  value It contains the value to check 
         * @returns It returns true if the value is exist on grid values otherwise false
         * 
         * @memberOf EngineBase
         */
        isValueInGrid(value: number) {
            this.gridValue = [];
            this.gridValue = _.reduce(this.currentLevel.grid.values, (arr: any, ele: any) => {
                if (ele.value == value) {
                    arr.push(ele);
                } else {
                    if (ele.type == 2) {
                        let convertedValue = this.toNormal(ele.value);
                        convertedValue = `${convertedValue[0]}/${convertedValue[1]}`;
                        convertedValue = algebra.parse(convertedValue).toTex();
                        if (convertedValue == value) {
                            arr.push(ele);
                        }
                    } else {
                        let intNum: any = algebra.parse(ele.value).toTex();
                        if (intNum == value) {
                            arr.push(ele);
                        }
                    }
                }
                return arr;
            }, []);
            return (this.gridValue.length > 0);
        }

        /**
         * This method will set and returns the populated final grid cards in json
         * 
         * @returns It returns the pouplated grid cards in json
         * 
         * @memberOf EngineBase
         */
        setFilteredGridValues() {
            if (this.currentLevel.grid.values !== null) {
                let possibleValues: any = [];
                let populatedGridCards: any = [];
                for (let ci = 0; ci < this.currentLevel.grid.values.length; ci++) {
                    possibleValues = this.replaceVariableValues(this.currentLevel.grid.values[ci]);
                    populatedGridCards.push(possibleValues);
                }
                this.currentLevel.grid.values = _.unique(populatedGridCards);
                this.currentLevel.grid.values = _.shuffle(this.currentLevel.grid.values);
            }
        }

        /**
         * This method will replace var0/var1/var2 string to their respective values
         * 
         * @param value string to replace var0/var1/var2
         * @returns string It contains replaced values
         * 
         * @memberOf EngineBase
         */
        replaceVariableValues(value: any): string {
            for (let i = 0; i < 3; i++) {
                if (value.indexOf(`var${i}`) >= 0) {
                    if (this.variableValues[`var${i}`] !== null) {
                        let replaceTo = _.shuffle(this.variableValues[`var${i}`])[0];
                        value = value.replace(`var${i}`, '' + replaceTo);
                    } else {
                        console.log(`JSON ERROR... ${`var${i}`} is NULL for ${value}`);
                    }
                }
            }
            return value;
        }

        /**
         * This method is used to generate strings that are used to load images to display in the equation area
         * 
         * @param sliderValue It contains slider's left and right values
         * @param leftTileParam  It contains the text of first tile in the selected pairs
         * @param rightTileParam It contains the text of second tile in the selected pairs
         * @returns String It contains generated equation string
         * 
         * @memberOf EngineBase
         */
        getResultAreaText(sliderValue: any, leftTileParam: any, rightTileParam: any, selectedTiles: any) {
            const { slider } = this.currentLevel;
            let height = slider.height ? eval(slider.height.value) : 1;
            const leftOperand = height * sliderValue.left;
            const rightOperand = height * sliderValue.right;
            const totalValue = leftOperand + rightOperand;
            let heightParam = slider.height ? slider.height.latexParam : '';
            let sliderTotal = 0;
            if(selectedTiles.length > 0) {
                sliderTotal = (selectedTiles[0].data.tileData.value + selectedTiles[1].data.tileData.value) / height
            } else {
                return '';
            }

            switch (this.currentLevel.equationType) {
                case 'twoEquationsRatio':
                    return `${leftTileParam} = ${sliderValue.leftParam}\\hspace{35pt}${rightTileParam} = ${sliderValue.rightParam}`;
                case 'ratioColons':
                    return `${leftTileParam} : ${rightTileParam}   ::   ${sliderValue.leftParam}:${sliderValue.rightParam}`;
                case 'ratioEquals':
                    return `${leftTileParam} :  ${rightTileParam} =  ${sliderValue.leftParam} : ${sliderValue.rightParam}`;
                case 'ratioSum':
                    return `${totalValue} =  ${sliderValue.leftParam} + ${sliderValue.rightParam}`;
                case 'distributiveProp':
                    return `${heightParam} \\times ${sliderTotal} = (${heightParam} \\times ${sliderValue.leftParam}) + (${heightParam} \\times ${sliderValue.rightParam})`;
                case 'placeValue':
                    return `${totalValue} = ${leftTileParam} + ${rightTileParam}`;
                case 'twoEquationsArea':
                    return `${heightParam}\\times ${sliderValue.leftParam}=${leftTileParam}\\hspace{19pt}${heightParam}\\times${sliderValue.rightParam}=${rightTileParam}`;
                default: return '';
            }
        }

        /**
         * This method is used to get the testmode from the json data
         * 
         * @returns It will return true or false
         * 
         * @memberOf EngineBase
         */
        isTestMode() {
            return this.gameJSON.testMode;
        }

        /**
         * This method will return the tutorial video name
         * 
         * @returns It will return video name
         * 
         * @memberOf EngineBase
         */
        getTutorialVideo() {
            return this.currentLevel.tutorial.T1;
        }

        /**
         * This method will return the number of good guys to be stacked to earn each stars
         * 
         * @returns Star thresholed array
         * 
         * @memberOf EngineBase
         */
        getStarThreshold() {
            return [
                this.currentLevel.scoring.starThreshold,
                2 * this.currentLevel.scoring.starThreshold,
                3 * this.currentLevel.scoring.starThreshold
            ];
        }


        /**
         * This method will return the available match value for the given value
         * 
         * @param value It contains the value to get the pair value
         * @returns Valid pair object
         * 
         * @memberOf EngineBase
         */
        getValidPairValue(value: number): number {
            let matched: boolean = false;
            for (let i = 0; i < this.validPairs.length; i++) {
                if (this.validPairs[i].left.value == value) {
                    matched = true;
                    return this.validPairs[i].right;
                }
            }
            if (!matched) {
                for (let i = 0; i < this.validPairs.length; i++) {
                    if (this.validPairs[i].right.value == value) {
                        matched = true;
                        return this.validPairs[i].left;
                    }
                }
            }
            return this.validPairs[0].right;
        }

        /**
         * This method will generate and return the random number in between the given minimum and maximum value
         * 
         * @param  max It contains the maximum range of random number to generate
         * @param  min It contains the minimum range of random number to generate
         * @returns It returns generated random number 
         * 
         * @memberOf EngineBase
         */
        generateRandomNumber(max: number, min: number): number {
            return Math.floor(Math.random() * (max - min) + min);
        }

        /**
         * This method is used to generate probability array which contains total of 100 tiles
         * The number of Goodguy, Badguy and Combo tiles are based on the given probability ratio
         * This method uses probability.js library
         * 
         * @memberOf EngineBase
         */
        probality() {
            let normalProbabilty = 1 - (this.currentLevel.frequency.goodGuys + this.currentLevel.frequency.badGuys + this.currentLevel.frequency.comboTiles);
            let probabilityArray: Array<String> = []
            var probabilitilized = new Probability({
                p: `${this.currentLevel.frequency.goodGuys * 100}%`,
                f: function () {
                    probabilityArray.push('goodGuy');
                }
            }, {
                    p: `${this.currentLevel.frequency.badGuys * 100}%`,
                    f: function () {
                        probabilityArray.push('badGuy');
                    }
                }, {
                    p: `${this.currentLevel.frequency.comboTiles * 100}%`,
                    f: function () {
                        probabilityArray.push('comboTile');
                    }
                }, {
                    p: `${normalProbabilty * 100}%`,
                    f: function () {
                        probabilityArray.push('normal');
                    }
                });
            for (var i = 0; i < 100; i++) {
                probabilitilized();
            }
            this.probabilityArray = probabilityArray;
            this.probabilityArray = this.probabilityArray.sort();
        }

        /**
         * This method is used to check wheather there is atleast one valid pair exist or not in the grid
         * 
         * @returns It returns true if valid pair exist otherwise false
         * 
         * @memberOf EngineBase
         */
        isValidPairAvailable() {
            let value: number = 0;
            for (let i = 0; i < this.tileDetails.tileValue.length; i++) {
                value = this.tileDetails.tileValue[i];
                for (let j = 0; j < this.validPairs.length; j++) {
                    if (this.validPairs[j].left.value == value) {
                        if (_.contains(this.tileDetails.tileValue, this.validPairs[j].right.value) && this.validPairs[j].left.value !=this.validPairs[j].right.value) {
                            return true;
                        }
                    } else if (this.validPairs[j].right.value == value) {
                        if (_.contains(this.tileDetails.tileValue, this.validPairs[j].left.value)  && this.validPairs[j].left.value !=this.validPairs[j].right.value) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        /**
         * This method is used to find the Highest common factor of two given numbers
         * 
         * @param  a It contains one of the number to find hcf
         * @param  b  It contains another one of the number to find hcf
         * @returns It returns HCF of the given numbers
         * 
         * @memberOf EngineBase
         */
        hcf(a: number, b: number): any {
            if (!b) {
                if (a < 1) {
                    return 1;
                } else {
                    return a;
                }
            }
            return this.hcf(b, a % b);
        }

        /**
         * This method is used to set the maximum number of Goodguys and Badguys can exist at a time
         * @memberOf EngineBase
         */
        setMaxGoodAndBadGuy() {
            if (this.currentLevel.gridSize == 3) {
                    this.maximumGoodGuys = this.gradePointsData['3x3grid'].goodGuysMaxNumber;
                    this.maximumBadGuys = this.gradePointsData['3x3grid'].badGuysMaxNumber;
                    this.maximumComboTiles = this.gradePointsData['3x3grid'].comboTileMaxNumber;
                    this.totalGoodAndBadGuys = this.maximumGoodGuys + this.maximumBadGuys;
            } else {
                    this.maximumGoodGuys = this.gradePointsData['4x4grid'].goodGuysMaxNumber;
                    this.maximumBadGuys = this.gradePointsData['4x4grid'].badGuysMaxNumber;
                    this.maximumComboTiles = this.gradePointsData['4x4grid'].comboTileMaxNumber;
                    this.totalGoodAndBadGuys = this.maximumGoodGuys + this.maximumBadGuys;
            }
        }

        /**
         * This function will get triggered to generate valid pair of number when the slider type is Ratio.
         * 
         * @param min It contains minimum value of the slider
         * @param max  It contains maximum value of the slider
         * @param left  It contains slider's current left value
         * @param right  It contains slider's current right value
         * @param interval It contains the slider's interval
         * @param total  It contains slider's total value
         * @memberof EngineBase
         */
        generateRatioValidPairs(min:number,max:number,left:number,right:number,interval:number,total:number) {
             while (min <= max) {
                            left = min;
                            right = (total - min);
                            let ratioString;
                            if(this.currentLevel.slider.total.type == ValueType.percentage) {
                                  ratioString = `${left / 100}/${right / 100}`;
                            } else {
                                  ratioString = `${left}/${right}`;
                            }
                            ratioString = eval(ratioString);
                            ratioString = Math.round(ratioString * 100) / 100;

                            for (let i = 0; i < this.currentLevel.grid.values.length; i++) {
                                for (let j = 0; j < this.currentLevel.grid.values.length; j++) {
                                    let first = this.toMachineCodeString(this.currentLevel.grid.values[i].value);
                                    let second = this.toMachineCodeString(this.currentLevel.grid.values[j].value);
                                    let firstValue = eval(first);
                                    firstValue = Math.round(firstValue * 100) / 100;
                                    let secondValue = eval(second);
                                    secondValue = Math.round(secondValue * 100) / 100;

                                    let resultString;
                                    resultString = `${firstValue}/${secondValue}`;
                                    resultString = eval(resultString);
                                    resultString = Math.round(resultString * 100) / 100;

                                    let equalRatio: boolean = (ratioString == resultString) ? true : false;
                                  
                                 if (this.grade !== 6 || this.currentLevel.equationType == 'twoEquationsRatio') {
                                    if(this.currentLevel.slider.total.type == ValueType.percentage) {
                                        equalRatio = (algebra.parse(`${left}`).toString() == algebra.parse(`${firstValue}*100`).toString() && algebra.parse(`${right}`).toString() == algebra.parse(`${secondValue}*100`).toString()) ? true : false;
                                    } else {
                                        left = Math.round(left * 100) / 100;	
	                                    right = Math.round(right * 100) / 100;			
	                                    equalRatio = (left == firstValue && right == secondValue) ? true : false;
                                    }
                                } 
                                    if (equalRatio) {
                                        let leftUrl = this.getLatexURL(this.currentLevel.grid.values[i].type, this.latexParamToURL(this.currentLevel.grid.values[i].value));
                                        let rightUrl = this.getLatexURL(this.currentLevel.grid.values[j].type, this.latexParamToURL(this.currentLevel.grid.values[j].value));
                                        this.validPairs.push({
                                            left: {
                                                value: firstValue,
                                                type: TileType.normal,
                                                latexUrl: leftUrl,
                                                latexString: this.latexParamToURL(this.currentLevel.grid.values[i].value),
                                                valueType:this.currentLevel.grid.values[i].type
                                            },
                                            right: {
                                                value: secondValue,
                                                type: TileType.normal,
                                                latexUrl: rightUrl,
                                                latexString: this.latexParamToURL(this.currentLevel.grid.values[j].value),
                                                valueType:this.currentLevel.grid.values[j].type
                                            }
                                        });
                                    }
                                }
                            }
                            min += interval;
                            if (interval == 0) {
                                break;
                            }
                        }
        }

        /**
         * This function will get triggered when grid values are not given
         * 
         * @param height It contains slider height value
         * @param min It contains slider minimum value
         * @param anotherValue It contains the difference between the slider's minimum and total value
         * @param left It contains slider's current left value
         * @param right  It contains slider's current right value
         * @memberof EngineBase
         */
        pushActualValuesIntoValidPairs(height:any,min:number,anotherValue:number,left:any,right:any) {
             let leftValue = eval(height) * min;
                        let rightValue = eval(height) * anotherValue;
                        let leftTileType = leftValue % 1 == 0 ? ValueType.integer : ValueType.fraction;
                        let rightTileType = rightValue % 1 == 0 ? ValueType.integer : ValueType.fraction;
                        let leftUrl = this.getLatexURL(leftTileType, left);
                        let rightUrl = this.getLatexURL(rightTileType, right);

                        this.validPairs.push({
                            left: {
                                value: leftValue,
                                type: TileType.normal,
                                latexUrl: leftUrl,
                                latexString: this.latexParamToURL(left),
                                valueType:leftTileType
                            },
                            right: {
                                value: rightValue,
                                type: TileType.normal,
                                latexUrl: rightUrl,
                                latexString: this.latexParamToURL(right),
                                valueType:rightTileType
                            }
                        });
        }

        /**
         * This function is used to block Goodguys and Badguys to appear in the first row while clearing more than two tiles
         * 
         * @param ggColRow It contains the existing Goodguys column and row
         * @param bgColRow It contains the existing Badguys column and row
         * @returns It returns array of postions that do not allow to place Goodguys and Badguys
         * @memberof EngineBase
         */
        blockGgBgOnFirstRow(ggColRow:any,bgColRow:any):any {
            let disableGgBg:any=[];
             let ggBgColRow=_.union(ggColRow,bgColRow);

              if(this.currentLevel.gridSize == 3) {
                    let firstRow = ["0_0","1_0","2_0"];
                    let secondRow = ["0_1","1_1","2_1"];
                    let thirdRow = ["0_2","1_2","2_2"];
                    for(let i=0;i<3;i++) {
                        if(_.contains(this.tileDetails.tilesToFill,secondRow[i])) {
                            for(let j=0;j<3;j++) {
                                if(_.contains(ggBgColRow,firstRow[j])) {
                                   disableGgBg.push(secondRow[i]);
                                }
                            }
                        }
                    }

                    for(let k=0;k<3;k++) {
                        if(_.contains(ggBgColRow,firstRow[k]) && _.contains(ggBgColRow,secondRow[k])){
                            disableGgBg.push(thirdRow[k]);
                        }
                    }
                    return disableGgBg;
        } else {
            let firstRow = ["0_0","1_0","2_0","3_0"];
            let secondRow = ["0_1","1_1","2_1","3_1"];
            let thirdRow = ["0_2","1_2","2_2","3_2"];
            let fourthRow = ["0_3","1_3","2_3","3_3"];
                    for(let i=0;i<4;i++) {
                        if(_.contains(this.tileDetails.tilesToFill,thirdRow[i])) {
                            for(let j=0;j<4;j++) {
                                if(_.contains(ggBgColRow,firstRow[j]) && _.contains(ggBgColRow,secondRow[j])) {
                                   disableGgBg.push(thirdRow[i]);
                                }
                            }
                        }
                    }

            for(let k=0;k<4;k++) {
                        if(_.contains(ggBgColRow,firstRow[k]) && _.contains(ggBgColRow,secondRow[k])  && _.contains(ggBgColRow,thirdRow[k])){
                            disableGgBg.push(fourthRow[k]);
                        }
            }
            return disableGgBg;
        }
    }

    /**
     * This function is used to calculate the slider's left and right values based on the given interval
     * 
     * @memberof EngineBase
     */
    calculateSliderValues() {
        const { slider } = this.currentLevel;
        let minValue:number = eval(slider.min.value);
        let maxValue:number = eval(slider.max.value);
        let intervalValue =  slider.interval ? eval(slider.interval.value) : 0;
        let total = eval(slider.total.value);
      
        if (intervalValue != 0) {
            while (minValue <= maxValue) {
                minValue = Math.round(minValue * 100) / 100;
                this.sliderValues.push(minValue.toFixed(1));
                minValue += intervalValue;
            }
        } else {
            this.sliderValues.push(minValue.toFixed(1));
        }
        let paramMin = slider.min.value;
        let paramTotal = slider.total.value;

        if (slider.interval) {
            let paramInterval = slider.interval.value;
            let Fraction = algebra.Fraction;
            if (slider.interval.type == 2 || slider.min.type == 2 || slider.max.type == 2 || slider.total.type == 2) {
                this.sliderValuesType = 2;
                let paramIntervalString = paramInterval.split('/');
                for (let i = 0; i < this.sliderValues.length; i++) {
                    let paramMinString = paramMin.split('/');
                    let paramTotalString = paramTotal.split('/');
                    let paramRight: any;

                    let frac1 = new Fraction(paramTotalString[0] ? parseInt(paramTotalString[0]) : parseInt(paramTotalString), paramTotalString[1] ? parseInt(paramTotalString[1]) : 1);
                    paramRight = frac1.subtract(new Fraction(paramMinString[0] ? parseInt(paramMinString[0]) : parseInt(paramMin), paramMinString[1] ? parseInt(paramMinString[1]) : 1), false).toString();

                    if (slider.min.latexString.split(',').length > 2 || slider.max.latexString.split(',').length > 2) {
                        this.sliderValueParams.push({ left: this.latexParamToURL(this.toMixed(paramMin.replace('\/', ','))), right: this.latexParamToURL(this.toMixed(paramRight.replace('\/', ','))) });
                    } else {
                        let paramMinSplit = paramMin.split('\/');
                        let paramMinToUrl;
                        if (paramMinSplit.length > 1) {
                            if (paramMinSplit[0] % paramMinSplit[1] == 0) {
                                paramMinToUrl = paramMinSplit[0] / paramMinSplit[1];
                            } else {
                                paramMinToUrl = `${paramMinSplit[0]},${paramMinSplit[1]}`;
                            }
                        } else {
                            paramMinToUrl = paramMinSplit[0];
                        }

                        let paramRightSplit = paramRight.split('\/');
                        let paramRightToUrl;
                        if (paramRightSplit.length > 1) {
                            if (paramRightSplit[0] % paramRightSplit[1] ==0) {
                                paramRightToUrl = paramRightSplit[0] / paramRightSplit[1];
                            } else {
                                paramRightToUrl = `${paramRightSplit[0]},${paramRightSplit[1]}`;
                            }
                        } else {
                            paramRightToUrl = paramRightSplit[0];
                        }
                        this.sliderValueParams.push({ left: this.latexParamToURL(paramMinToUrl), right: this.latexParamToURL(paramRightToUrl) });
                    }
                    let frac = new Fraction(paramMinString[0] ? parseInt(paramMinString[0]) : parseInt(paramMin), paramMinString[1] ? parseInt(paramMinString[1]) : 1);
                    paramMin = frac.add(new Fraction(paramIntervalString[0] ? parseInt(paramIntervalString[0]) : parseInt(paramInterval), paramIntervalString[1] ? parseInt(paramIntervalString[1]) : 1), false).toString();
                }

            } else {
                for (let i = 0; i < this.sliderValues.length; i++) {
                    this.sliderValueParams.push({ left: Number(this.sliderValues[i]) * 1, right: Math.round((total - Number(this.sliderValues[i])) * 100) / 100 });
                }
            }
        } else {
            this.sliderValueParams.push({ left: algebra.parse(`${paramMin}`).toTex(), right: algebra.parse(`${paramTotal}-${paramMin}`).toTex() });
        }
    }
    }
}
