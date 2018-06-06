declare var katex: any;
declare var algebra: any;
declare var underscore: any;
import { GameEngineBase } from './game.engine.base';

/**
 * A class represents actor common class to all the guys(good/bad)
*/
class Actor {
    id: string;
    name: string;
    uiElement: any;
    type: number;
    value: number;
    state: boolean;
    operationSymbol: string;
    latexString: string;
    isFraction: boolean;
    digitCount: number;
}

export enum BenchActorType {
    circular = 0,
    rectangular = 1
}

export enum GGActorType {
    ggone = 0,
    ggtwo = 1,
    ggthree = 3
}

export enum BGActorType {
    bgone = 0,
    bgtwo = 1
}

/**
 * This class is engine for all object games
 */
export class GameEngine extends GameEngineBase.EngineBase {
    answer: number;
    startValue: any;
    randomCardValues: any;
    distractorCardValue: any = [];
    bench: any;
    counter: number = 0;
    startActor: any;
    answerActor: any;
    badGuyActor: any;
    randomGoodGuyActor: any;
    randomGoodGuy: any;
    scoring: any;
    levelData: any;
    protected startValueArray: any = [];
    protected goalCards: any = [];
    protected variationCount = 0;
    protected variations: any = [];
    cards: any = [];
    answerObject: any = [];
    protected startCard: any = [];
    currentLevel: number = 1;
    isFraction = false;
	
	cardFraction = '';
	goalFraction = '';
	gameplayFraction = '';

    setupGame(varIndex: any) {
        this.cards = [];
        this.startValueArray = [];
        this.randomCardValues = [];
        this.startActor = new Actor();
        this.answerActor = new Actor();
        this.badGuyActor = new Actor();
        this.isFraction = false;
        this.randomGoodGuyActor = new Actor();
        this.answerFractionString = null;
        this.distractorCardValue = [];
        this.answer = null;
        this.answerObject = null;
        this.startValue = null;
        this.bench = [];
        this.randomGoodGuy = [];
        this.startCard = [];
        this.goalCards = [];
        this.variations = [];
        this.variationCount = 0;
        this.levelData = this.data.levelData[this.currentLevel];
		
		this.cardFraction = this.levelData.cardsFraction;
		this.gameplayFraction = this.levelData.gameplayFraction;
		this.goalFraction = this.levelData.goalFraction;
		console.log(this.cardFraction,this.gameplayFraction,this.goalFraction);
		
        this.setVariations(varIndex);
        this.getCards();
        this.setRandomCardValues();
    }

    flowFunctions() {
        if (this.cards.length > 1)
            this.setDistractorCardValue();
        this.setupBench();
        this.setupStage();
        this.setCounter();
        if (this.levelData.variableCards.goal.values != null)
            this.getGoalCards();
        this.scoring = this.data.levelData[this.currentLevel].scoring;
        var x = this.randomNumberGeneration(100, 500);
        var y = this.randomNumberGeneration(100, 500);
    }

    setCounter() {
        this.counter = Number(this.data.levelData[this.currentLevel].shotClockStart);
    }


    createCards(card: any) {
        let cardValues = card.values;
        let operationSymbol = card.operation;
        let operationSymbolLatex = card.symbol;
        let isFraction = false;
        let cardObj: any = [];

        if (operationSymbolLatex == "+")
            operationSymbolLatex = "+";

        if (cardValues == null)
            return null;

        cardValues.forEach(value => {
            let card: any = new Object();
            let tempFilteredValue = this.filterValues(value, operationSymbolLatex);
            card.value = Number(tempFilteredValue.value);
            card.latexString = tempFilteredValue.latexString;
            card.operationSymbol = operationSymbol;
            card.operationSymbolLatex = operationSymbolLatex;
            card.fractionString = tempFilteredValue.fractionString;
            card.isFraction = tempFilteredValue.isFraction;
            card.digitCount = tempFilteredValue.value.toString().length;
            cardObj.push(card);
        });
        return cardObj;
    }

    filterValues(value: string, operationSymbol: string) {
        let filteredValue = "";
        let latexString = "";
        let fractionString: any;
        let obj: any = [];

        if (value.indexOf("F(") != -1) {
            filteredValue = value.replace("F(", "");
            filteredValue = filteredValue.replace(")", "");

            let temp = filteredValue.split(",");
            let tempObj = this.createFractionValue(temp, operationSymbol);

            filteredValue = tempObj.value;
            latexString = tempObj.latexString;
            fractionString = tempObj.fractionString
            obj.isFraction = tempObj.isFraction;
        }
        else {
            filteredValue = value.replace("D(", "");
            filteredValue = filteredValue.replace(")", "");
            let tempVarValue = this.getVariations(filteredValue);
            filteredValue = tempVarValue.toString();
            // latexString = "\\mathbf{" + operationSymbol + "" + this.numberWithCommas(filteredValue) + "}";
              latexString = operationSymbol + "" + this.numberWithCommas(filteredValue);
            obj.isFraction = false;
        }

        obj.value = filteredValue;
        obj.latexString = latexString;
        obj.fractionString = fractionString;

        return obj;
    }

    convertFractionToMixed(fracNumber: any, isSimplified: boolean): any {
        if (!isSimplified)
            return null;

        let numer = Math.abs(fracNumber.numer);
        let denom = Math.abs(fracNumber.denom);

        if (numer > denom && numer != 0) {
            let remain = (fracNumber.numer % fracNumber.denom);
            let opert1 = ((numer - remain) / denom);
            let opert2 = remain;
            let opert3 = denom;

            if (!remain)
                return null
            else
                return { "opert1": opert1, "opert2": opert2, "opert3": opert3, "isMixedFraciton": true };
        }
        else {
            return null;
        }
    }

    createFractionValue(valueArray: any, operationSymbolLatex: string) {
        let parseValue: any;
        let leftOperand: any;
        let rightOperand: any;
        let operator: any;
        let latexString = "";
        let fractionString: any;
        let obj: any = [];
        let isFraction: boolean = true;

        valueArray.forEach((varValue: any, i: number) => {
            let tempVarValue = this.getVariations(varValue);
            valueArray[i] = tempVarValue;
        });
		
        if (valueArray.length == 3) {
            leftOperand = Number(valueArray[0]);
            rightOperand = Number(valueArray[1]);
            operator = "*";
            parseValue = algebra.parse(`((${Number(valueArray[0])}*${Number(valueArray[2])})+(${Number(valueArray[1])}))/(${Number(valueArray[2])})`).constant();
            // latexString = "\\mathbf{" + operationSymbolLatex + "" + Number(valueArray[0]) + "\\frac{" + Number(valueArray[1]) + "}{" + Number(valueArray[2]) + "}}";
            latexString = operationSymbolLatex + "" + Number(valueArray[0]) + "\\frac{" + Number(valueArray[1]) + "}{" + Number(valueArray[2]) + "}";

            let opert1 = algebra.parse(`((${Number(valueArray[0])}*${Number(valueArray[2])})+(${Number(valueArray[1])}))`).constant();
            fractionString = new algebra.Fraction(Number(opert1.toString()), valueArray[2]);

            if (this.cardFraction == "simplified") {
                let mixedFraction = this.convertFractionToMixed(parseValue, true);
                // latexString = "\\mathbf{" + operationSymbolLatex + "" + mixedFraction.opert1 + "\\frac{" + mixedFraction.opert2 + "}{" + mixedFraction.opert3 + "}}";
                latexString = operationSymbolLatex + "" + mixedFraction.opert1 + "\\frac{" + mixedFraction.opert2 + "}{" + mixedFraction.opert3 + "}";
				
            }
            else if (parseValue.numer == 0) {
                // latexString = "\\mathbf{" + operationSymbolLatex + parseValue.numer + "}";
                latexString = operationSymbolLatex + parseValue.numer;
                isFraction = false;
            }
        }
        else {
            leftOperand = Number(valueArray[0]);
            rightOperand = Number(valueArray[1]);
            operator = "/";
            parseValue = algebra.parse(`(${leftOperand})${operator}(${rightOperand})`).constant();
            fractionString = (new algebra.Fraction(valueArray[0], valueArray[1], true));
            if (this.cardFraction == "unsimplified" || this.cardFraction == null) {
                // latexString = "\\mathbf{" + operationSymbolLatex + "\\frac{" + this.numberWithCommas(Number(valueArray[0])) + "}{" + this.numberWithCommas(Number(valueArray[1])) + "}}"
                latexString = operationSymbolLatex + "\\frac{" + this.numberWithCommas(Number(valueArray[0])) + "}{" + this.numberWithCommas(Number(valueArray[1])) + "}";
            }
            else {
                leftOperand = Number(parseValue.numer);
                rightOperand = Number(parseValue.denom);
                if (rightOperand != 1) {
                    // latexString = "\\mathbf{" + operationSymbolLatex + "\\frac{" + this.numberWithCommas(Number(leftOperand)) + "}{" + this.numberWithCommas(Number(rightOperand)) + "}}";
                    latexString = operationSymbolLatex + "\\frac{" + this.numberWithCommas(Number(leftOperand)) + "}{" + this.numberWithCommas(Number(rightOperand)) + "}";
                    if (Number(leftOperand) > Number(rightOperand)) {
                        let temp = Math.floor(leftOperand / rightOperand);
                        leftOperand = leftOperand - (rightOperand * temp);
                        // latexString = "\\mathbf{" + operationSymbolLatex + "" + temp + "\\frac{" + this.numberWithCommas(Number(leftOperand)) + "}{" + this.numberWithCommas(Number(rightOperand)) + "}}"
                         latexString = operationSymbolLatex + "" + temp + "\\frac{" + this.numberWithCommas(Number(leftOperand)) + "}{" + this.numberWithCommas(Number(rightOperand)) + "}"
                    }
                }
                else {
                    // latexString = "\\mathbf{" + operationSymbolLatex + this.numberWithCommas(Number(leftOperand)) + "}";
                      latexString = operationSymbolLatex + this.numberWithCommas(Number(leftOperand));
                    isFraction = false;
                }
            }
        }

        obj.value = Number(parseValue);
        obj.latexString = latexString;
        obj.fractionString = fractionString;
        obj.isFraction = isFraction;
        return obj;
    }

    getLatexImage(size: string, color: string, latexString: string) {
        //return 'https://chart.googleapis.com/chart?cht=tx&&chf=bg,s,00000000&chco=' + color + '&chs=' + size + '&chl=' + latexString;
    }

    getCards() {
        this.data.levelData[this.currentLevel].variableCards.cards.forEach(card => {
            if (this.createCards(card) != null)
                this.cards.push(this.createCards(card));
        });
        return this.cards;
    }

    getStartCard() {
        this.startValueArray = [];
        this.data.levelData[this.currentLevel].variableCards.startValues.forEach(value => {
            this.startValueArray.push(this.filterValues(value, ""));
        })
    }

    getGoalCards(): any {
        let randomCardCombinations = this.cartesianProduct();
        this.data.levelData[this.currentLevel].variableCards.goal.values.forEach(value => {
            this.goalCards.push(this.filterValues(value, ""));
            if (this.goalCards[this.goalCards.length - 1].isFraction)
                this.isFraction = true;
        })

        this.shuffleArray(randomCardCombinations);
        let answerValue: any;
        let goalValue: any = "";

        for (var ind = 0; ind < randomCardCombinations.length; ind++) {
            answerValue = 0;
            let tempGoalCardValue: any = [];
            randomCardCombinations[ind].forEach((element, i) => {

                if (i == 0) {
                    if (this.startValue.isFraction)
                        answerValue = element.fractionString
                    else
                        answerValue = element.value;

                    console.log("for fixed goal ----- level ::", this.currentLevel);
                }
                else {

                    if (this.isFraction) {
                        let tempStartVal: any;

                        if (element.isFraction)
                            tempStartVal = element.fractionString;
                        else
                            tempStartVal = element.value;
                        this.answerFractionString = this.factionOperation(element.operationSymbol, answerValue, tempStartVal);
                        answerValue = this.answerFractionString.value;
                    }
                    else {
                        answerValue = Number(algebra.parse('(' + answerValue + ')' + element.operationSymbol + '(' + element.value + ')').constant());
                        console.log(element.operationSymbol, "", element.value);
                    }
                }

                tempGoalCardValue.push(element);
            });


            for (var index = 0; index < this.goalCards.length; index++) {
                
                if (this.goalCards[index].value == answerValue) {
                    goalValue = this.goalCards[index].value;
                    this.answer = answerValue;
                    this.answerFractionString = this.goalCards[index];
                    this.answerObject = this.goalCards[index];
                    this.randomCardValues = tempGoalCardValue.splice(1);
                    this.startValue = tempGoalCardValue[0];
					
                    this.setDistractorCardValue();
                    break;
                }
            }

            if (goalValue != "") {
                break;
            }
        }

        if (goalValue != "") {
            this.setupBench();
            this.setupStage();
            return goalValue;
        }

        if (goalValue == "" && this.variationCount < this.variations.length) {
            this.setupGame(this.variationCount);
            this.variationCount++;
        }

        return null;
    }

    cartesianProduct() {
        let randomCardArray: any = [];
        let startArray: any = [];

        this.startValueArray.forEach(element => {
            let obj: any = {};
            obj.value = element.value
            obj.latexString = element.latexString;
            obj.isFraction = element.isFraction;
            obj.fractionString = element.fractionString;
            obj.operationSymbol = "";
            obj.operationSymbolLatex = "";
            startArray.push(obj);
        });

        for (var i = 0; i < this.cards.length - 1; i++) {
            var card = this.cards[i];
            randomCardArray.push([]);
            card.forEach(element => {
                randomCardArray[i].push(element);

            });
        }

        randomCardArray.unshift(startArray);
        return randomCardArray.reduce((a, b) => {
            return a.map((x) => {
                return b.map((y) => {
                    return x.concat(y);
                })
            }).reduce((a, b) => { return a.concat(b) }, [])
        }, [[]])
    }

    setVariations(indexPos: number) {
        let i = 0;
        for (var key in this.levelData.variableCards.variations) {
            if (this.levelData.variableCards.variations.hasOwnProperty(key)) {
                var element = this.levelData.variableCards.variations[key];
                if (element != null) {
                    if (indexPos == null)
                        this.variations[i] = element[Math.floor(Math.random() * element.length)];
                    else
                        this.variations[i] = element[indexPos];
                }
                else {
                    this.variations[i] = element;
                }

				i++;
            }
        }
    }


    getVariations(variable: string) {
		
        let tmpString: string = variable;
        let result: number = 0;

        while (tmpString.indexOf("var") != -1) {
            let tempVariableIndex = Number(tmpString.charAt(tmpString.indexOf("var") + ("var".length)));
            let replaceString = 'var' + tmpString.charAt(tmpString.indexOf("var") + ("var".length));
            tmpString = tmpString.replace('var' + tmpString.charAt(tmpString.indexOf("var") + ("var".length)), this.variations[tempVariableIndex]);
            result = Number(algebra.parse(tmpString.toString()).constant());
        }
		
        return (!result) ? Number(tmpString) : result;
    }

    setRandomCardValues() {
        this.randomCardValues = [];
        let randomValue: any = [];
        let totalRandomCards = Number(this.levelData.variableCards.numOfCards) - 1;
        this.answer = 0;

        for (var i = 0; i < this.cards.length - 1; i++){
            var element = this.cards[i];
            let cardValues: any = [];
            let randomCard = element[Math.floor(Math.random() * element.length)];
            cardValues.value = randomCard.value;
            cardValues.operationSymbol = randomCard.operationSymbol;
            cardValues.operationSymbolLatex = randomCard.operationSymbolLatex;
            cardValues.latexString = randomCard.latexString;
            cardValues.fractionString = randomCard.fractionString;
            cardValues.isFraction = randomCard.isFraction;
            cardValues.digitCount = randomCard.digitCount;
            randomValue.push(cardValues);
        }

        this.getStartCard();
        this.startValue = this.startValueArray[Math.floor(Math.random() * this.startValueArray.length)];
		
        this.shuffleArray(randomValue);
        randomValue.splice(0, randomValue.length - totalRandomCards);
        this.randomCardValues = randomValue;
        this.checkisFraction();

        if (this.levelData.variableCards.goal.values == null)
            this.setAnswerValue(randomValue);
        else
            this.flowFunctions();
    }

    setDistractorCardValue() {
        let randomVlaue = Math.random();
        let temp = this.cards[this.cards.length - 1];
        let distractor = temp[Math.floor(randomVlaue * temp.length)];
        this.randomCardValues.push(distractor);
        this.shuffleArray(this.randomCardValues);
    }

    answerFractionString: any;
    setAnswerValue(randomValue: any) {
        let answer = 0;
        if (randomValue.length == 0) {
            let randomVlaue = Math.random();
            let temp = this.cards[this.cards.length - 1];
            let distractor = temp[Math.floor(randomVlaue * temp.length)];
            randomValue[0] = distractor;
        }

        if (this.startValue.isFraction) {
            let tempAns = answer;
            let tempStartVal = this.startValue.fractionString;
            this.answerFractionString = this.factionOperation("+", tempAns, tempStartVal);
        }
        else {
            this.answerFractionString = this.factionOperation("+", answer, this.startValue.value);
        }
        console.log(" --> for no goal values ------------> level ::", this.currentLevel);

        randomValue.forEach((card: any, i: number) => {
            let tempStartVal: any;
            if (this.isFraction) {
                if (card.isFraction)
                    tempStartVal = card.fractionString;
                else
                    tempStartVal = card.value;

                this.answerFractionString = this.factionOperation(card.operationSymbol, this.answerFractionString.value, tempStartVal);
                console.log(card.operationSymbol, "", tempStartVal);
            }
            else {
                if (card.isFraction)
                    tempStartVal = card.fractionString;
                else
                    tempStartVal = card.value;
                this.answerFractionString = this.factionOperation(card.operationSymbol, this.answerFractionString.value, tempStartVal);
                console.log(card.operationSymbol, "", tempStartVal);
            }
        })

        if (this.answerFractionString.value < 0) {
            console.log('Restarting...');
            this.setupGame(null);
        }
        else {
            this.answer = this.answerFractionString.value;
            this.flowFunctions();
        }
    }

    factionOperation(operationSymbol: any, operator1: any, operator2: any): any {
        let result: any;
        let oprt1 = operator1;
        let oprt2 = operator2;
        let isSimplified: any = true;
        let isFraction: boolean;
        oprt1 = algebra.parse(operator1.toString()).constant();
        oprt2 = algebra.parse(operator2.toString()).constant();

        if (this.goalFraction == "unsimplified" || this.goalFraction == "decimal" || this.goalFraction == null)
            isSimplified = false;
        else
            isSimplified = true;

        switch (operationSymbol) {
            case "+":
                result = oprt1.add(oprt2, isSimplified);
                break;
            case "-":
                result = oprt1.subtract(oprt2, isSimplified);
                break;
            case "*":
                result = oprt1.multiply(oprt2, isSimplified);
                break;
            case "/":
                result = oprt1.divide(oprt2, isSimplified);
                break;
        }

        if (result.numer == 0) {
            isFraction = false;
        }
        
        let mixedFraction = this.convertFractionToMixed(result, isSimplified);
        let isMixedFraciton: boolean = false;

        if (mixedFraction != null)
            isMixedFraciton = mixedFraction.isMixedFraciton;

        let latexString: string;

        let Res_Numer: string = (this.numberWithCommas(result.numer)).toString();
        let Res_Denom: string = (this.numberWithCommas(result.denom)).toString();

        if (isMixedFraciton && mixedFraction.opert3 != 1 && result.numer != 0) {
            // latexString = "\\mathbf{" + mixedFraction.opert1 + "\\frac{" + mixedFraction.opert2 + "}{" + mixedFraction.opert3 + "}}";
            latexString = mixedFraction.opert1 + "\\frac{" + mixedFraction.opert2 + "}{" + mixedFraction.opert3 + "}";
            isFraction = true;
        }
        else if (result.numer != 0 && this.isFraction){
            // latexString = "\\mathbf{\\frac{" + Res_Numer + "}{" + Res_Denom + "}}";
              latexString = "\\frac{" + Res_Numer + "}{" + Res_Denom + "}";
            isFraction = true;
        }
        else {
            // latexString = "\\mathbf{" + Res_Numer + "}";
             latexString = Res_Numer;
            isFraction = false;
        }

        if (!isFraction) {
            result = (result.numer / result.denom).toString();
            let tempString = (this.numberWithCommas(result)).toString();
            // latexString = "\\mathbf{" + result + "}";
              latexString = result;
        }
        return { "latexString": latexString, "value": result, "isFraction": (Number(result.denom) > 1 && this.isFraction) };
    }
	
	fractionOperation(operationSymbol: any, operator1: any, operator2: any): any {
        let result: any;
        let oprt1 = operator1;
        let oprt2 = operator2;
        let isSimplified: any = true;
        let isFraction: boolean;
        oprt1 = algebra.parse(operator1.toString()).constant();
        oprt2 = algebra.parse(operator2.toString()).constant();

        if (this.gameplayFraction == "unsimplified" || this.gameplayFraction == "decimal" || this.gameplayFraction == null)
            isSimplified = false;
        else
            isSimplified = true;

        switch (operationSymbol) {
            case "+":
                result = oprt1.add(oprt2, isSimplified);
                break;
            case "-":
                result = oprt1.subtract(oprt2, isSimplified);
                break;
            case "*":
                result = oprt1.multiply(oprt2, isSimplified);
                break;
            case "/":
                result = oprt1.divide(oprt2, isSimplified);
                break;
        }

        if (result.numer == 0) {
            isFraction = false;
        }
		
        let mixedFraction = this.convertFractionToMixed(result, isSimplified);
        let isMixedFraciton: boolean = false;

        if (mixedFraction != null)
            isMixedFraciton = mixedFraction.isMixedFraciton;
	
        let latexString: string;

        let Res_Numer: string = (this.numberWithCommas(result.numer)).toString();
        let Res_Denom: string = (this.numberWithCommas(result.denom)).toString();
		
        if (isMixedFraciton && result.numer != 0) {
            // latexString = "\\mathbf{" + mixedFraction.opert1 + "\\frac{" + mixedFraction.opert2 + "}{" + mixedFraction.opert3 + "}}";
            latexString = mixedFraction.opert1 + "\\frac{" + mixedFraction.opert2 + "}{" + mixedFraction.opert3 + "}";
            isFraction = true;
        }
        else if (result.numer != 0 && result.denom != 1 && this.isFraction && this.gameplayFraction != 'decimal'){
            // latexString = "\\mathbf{\\frac{" + Res_Numer + "}{" + Res_Denom + "}}";
            latexString = "\\frac{" + Res_Numer + "}{" + Res_Denom + "}";
            isFraction = true;
        }
        else {
            // latexString = "\\mathbf{" + Res_Numer + "}";
              latexString = Res_Numer;
            isFraction = false;
        }
		
        if (!isFraction) {
            result = (result.numer / result.denom).toString();
            let tempString = (this.numberWithCommas(result)).toString();
            // latexString = "\\mathbf{" + result + "}";
             latexString = result;
        }
		
        return { "latexString": latexString, "value": result, "isFraction": (Number(result.denom) >= 1 && this.isFraction) };
    }


    numberWithCommas(x: any) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    shuffleArray(array: any) {
        let temporaryValue = 0;
        let randomIndex = 0;
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    removeDuplicateValues() {
        let isDuplicateValue = false;
        this.randomCardValues = this.randomCardValues.filter((item: any, pos: number, self: any) => {
            if (self.indexOf(item) != pos)
                isDuplicateValue = true;
            return self.indexOf(item) == pos
        })
        return isDuplicateValue;
    }


    /**
         * This method will generate a number from a range
         * @param rangeFrom is minimun number
         * @param rangeTo is maximun number          
         */
    randomNumberGeneration(rangeFrom: number, rangeTo: number): number {
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

        return randomNumber;
    }

    setupBench() {
        this.shuffleArray(this.randomCardValues);
        this.bench = [];

        for (var i = 0; i < this.randomCardValues.length; i++) {
            let benchActor = new Actor();
            var element = this.randomCardValues[i];
            benchActor.id = "bench" + i;
            benchActor.value = element.value;
            benchActor.latexString = element.latexString;
            benchActor.operationSymbol = element.operationSymbol;
            benchActor.type = BenchActorType.circular;
            benchActor.state = true;
            benchActor.isFraction = element.isFraction;
            benchActor.digitCount = element.digitCount;
            this.bench.push(benchActor);
        }
    }

    checkisFraction() {
        if (this.startValue.isFraction || this.gameplayFraction != "decimal")
            this.isFraction = true;

        for (var i = 0; i < this.randomCardValues.length; i++) {
            var element = this.randomCardValues[i];
            if (element.isFraction || (element.operationSymbol == "/" && this.gameplayFraction != "decimal"))
                this.isFraction = true;
        }
    }

    setupStage() {
        this.setupStartGuy();
        this.setupAnswerGuy();
        this.setupBadGuy();
        this.setupRandomGoodGuy();
    }

    setupStartGuy() {
        this.startActor = new Actor();
        this.startActor.id = "start";
        this.startActor = this.startValue;
        this.startActor.type = GGActorType.ggone;
    }

    setupAnswerGuy() {
        this.answerActor = new Actor();
        this.answerActor.id = "answer";
		
        if (this.answerFractionString != undefined && this.answerFractionString.value != undefined && this.answerFractionString.value.denom >= 1 && this.isFraction)
            this.answerActor.value = this.answerFractionString.value;
        else if (this.answerFractionString != undefined && this.answerFractionString.fractionString != undefined && this.answerFractionString.fractionString.denom >= 1 && this.isFraction)
            this.answerActor.value = this.answerFractionString.fractionString;
        else
            this.answerActor.value = Number(this.answer);

        this.answerActor.type = GGActorType.ggthree;
    }

    setupBadGuy() {
        this.badGuyActor = new Actor();
        this.badGuyActor.id = "bad";
        this.badGuyActor.value = "";
        this.badGuyActor.type = BGActorType.bgone;
    }

    setupRandomGoodGuy() {
        this.randomGoodGuy = [];
        for (var i = 0; i < this.randomCardValues.length; i++) {
            this.randomGoodGuyActor = new Actor();
            this.randomGoodGuyActor.id = "randomGuy";
            this.randomGoodGuyActor.value = "";
            this.randomGoodGuyActor.type = GGActorType.ggtwo;
            this.randomGoodGuy.push(this.randomGoodGuyActor);
        }
    }

    incrementCounter() {
        this.counter++;
    }

    decrementCounter() {
        this.counter--;
    }

}