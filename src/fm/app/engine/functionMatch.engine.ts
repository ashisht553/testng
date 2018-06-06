declare var algebra: any;
export namespace FunctionMatchGameEngine {

    /**
     * Represents a enumerator for type of cards
     * 
     * @enum CardType
     */
    enum CardType {
        GridCard,
        FunctionCard,
        VariableCard
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
     * Represents a interface for function card's json data
     * 
     * @interface FunctionCardJSONData
     */
    interface FunctionCardJSONData {
        predefinedLatex: string;
        values: Array<string>;
        fractionMode: string;
        operationSymbol: string;
        operationSymbolLatex: string;
        expressionSymbolMult: string;
        beforeText: string;
        afterText: string;
    }

    /**
    * Represents a interface for grid card's json data
    * 
    * @interface GridCardData
    */
    interface GridCardData {
        functionCard: FunctionCard;
        variableCard: VariableCard;
        computedValue: any;
        fractionMode: string;
        beforeText: string;
        afterText: string;
        expressionSymbolMult: string;
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
                case 'E': cardData.type = ValueType.equation;
                    cardData.value = this.isEquationCardValue(cardValueString);
                    break;
            }
            cardData.value = this.calculateLatexParam(cardData);
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
            let IntorDecimal = /D\(([^)]+)\)/;
            let matches = IntorDecimal.exec(cardValue);
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
            let Fraction = /F\(([^)]+)\)/;
            let matches = Fraction.exec(cardValue);
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
            let Percentage = /P\(([^)]+)\)/;
            let matches = Percentage.exec(cardValue);
            return matches[1];
        }

        /**
         * This method will get the Equation value of the card
         * 
         * @param cardValue It contains value of the card
         * @returns It will return params inside the braces
         * 
         * @memberOf GlobalCardMethods
         */
        isEquationCardValue(cardValue: string) {
            let Percentage = /E\(([^)]+)\)/;
            let matches = Percentage.exec(cardValue);
            matches[1] = (matches[1].indexOf('(') === 0) ? `${matches[1]})` : matches[1];
            return matches[1];
        }

        /**
         * This method will get the computed form of expressions / arthematic operators
         * 
         * @param card It contains the function card data
         * @returns It will return the computed form of expressions
         * 
         * @memberOf EngineBase
         */
        getComputedLatex(valueType: ValueType, predefinedLatex: string,
            latexParam: string, cardType: CardType, operationSymbol: string, operationSymbolLatex: string): any {
            let latexData: any = {
                latexString: latexParam,
                computedValue: parseFloat(latexParam),
                isImage: true, // to convert all equation to image
                image: '',
                operationSymbol: operationSymbol,
                operationSymbolLatex: ''
            };
            if ((valueType === ValueType.integer || valueType === ValueType.percentage) && operationSymbol !== '') {
                switch (operationSymbol) {
                    case '+':
                        latexData.latexString = `${this.getOperationSymbol('+', operationSymbolLatex)} ${latexParam}`;
                        latexData.computedValue = parseFloat(latexParam);
                        break;
                    case '-':
                        latexData.latexString = `${this.getOperationSymbol('-', operationSymbolLatex)} ${latexParam}`;
                        latexData.computedValue = parseFloat(latexParam);
                        break;
                    case '/':
                        latexData.latexString = `${this.getOperationSymbol('/', operationSymbolLatex)} ${latexParam}`;
                        latexData.computedValue = parseFloat(latexParam);
                        break;
                    case '*':
                        latexData.latexString = `${this.getOperationSymbol('*', operationSymbolLatex)} ${latexParam}`;
                        latexData.computedValue = parseFloat(latexParam);
                        break;
                    case '%':
                        latexData.latexString = `${this.getOperationSymbol('%', operationSymbolLatex)} ${latexParam}`;
                        latexData.computedValue = parseFloat(latexParam);
                        break;
                    default: return latexData;
                }
            }
            if (valueType === ValueType.fraction) {
                latexData.isImage = true;
            }
            return latexData;
        }

        /**
         * This method will get the unicode value for operation symbols to display in canvas
         * 
         * @param operationSymbol It contians the symbol of arthematic operator
         * @returns It will return the unicode value for the respective operator
         * 
         * @memberOf GlobalCardMethods
         */
        getOperationSymbol(operationSymbol: string, latex: string): string {
            switch (operationSymbol) {
                case '+': return `\u002B`;
                case '-': return `\u2212`;
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
         * This method will get the latex value for operation symbols to evaluate the expressions in the cards
         * 
         * @param operationSymbol It contains the symbol of arthematic operator
         * @param latex contains the type of latex to show for the multipication(i.e: cdot or times)
         * @returns It will return the latex value for the respective operator
         * 
         * @memberOf GlobalCardMethods
         */
        getOperationSymbolLatex(operationSymbol: string, latex: string): string {
            switch (operationSymbol) {
                case '+': return `+`;
                case '-': return `-`;
                case '/': return `\\div`;
                case '*':
                    if (latex === '\\cdot') {
                         return '\\cdot';
                    } else {
                         return '\\times';
                    }
                default: return '';
            }
        }

        /**
         * This method will generate the latex string used to get the image from mathjax
         * 
         * @param valueType It contains card value type
         * @param cardData It contains card data
         * @param latexParam It contains latex parameter value
         * @returns It will return latex string
         * 
         * @memberOf GlobalCardMethods
         */
        getLatexURL(valueType: ValueType, cardData: any, latexParam: string, appendText = false): string {
            let convertedParams = this.latexParamToURL(cardData, latexParam, appendText);
            convertedParams=convertedParams.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            return convertedParams;
        }

        /**
         * This method will generate a latex string by using the given inputs
         * 
         * @param cardData It contains card data 
         * @param latexParam It contains latex param to convert
         * @returns It will returns the latex string
         * 
         * @memberOf GlobalCardMethods
         */
        latexParamToURL(cardData: any, latexParam: string, appendText = false, isEquation = false): string {
            latexParam = '' + latexParam;
            let beforeText = '';
            let afterText = '';
            if (appendText) {
                beforeText = (cardData.beforeText) ? `${cardData.beforeText}\\text` : '';
                afterText = (cardData.afterText) ? `\\text   ${cardData.afterText}` : '';
            }
            latexParam = this.replaceExpressionSymbolLatex(cardData, latexParam);
            let params = latexParam.split(',');
            let operationSymbolLatex = (beforeText === '' || isEquation) ? ` ${cardData.operationSymbolLatex} ` : '';
            switch (params.length) {
                case 1: 
                        if(afterText == '') {
                             return `${operationSymbolLatex} ${beforeText}${params[0]}${afterText}`;
                        } else {
                             return `${operationSymbolLatex} ${beforeText}${params[0]}\\hspace{2pt}${afterText}`;
                        }
                case 2: return `${operationSymbolLatex} \\frac{${params[0]}}{${params[1]}}`;
                case 3: return `${operationSymbolLatex} ${params[0]}\\frac{${params[1]}}{${params[2]}}`;
            }
            return '';
        }

        /**
         * This method is used to replace the expression symbol with respective latex symbols
         * 
         * @param cardData contains the card data
         * @param latexParam latex param to replace
         * @returns it will replaced operation symbol latex
         * 
         * @memberOf GlobalCardMethods
         */
        replaceExpressionSymbolLatex(cardData: any, latexParam: string): string {
            let isBraced = (latexParam.indexOf('(') === 0);
            let latexString = (isBraced) ? latexParam : `(${latexParam})`;
            let isEquation = this.splitEquation(latexString);
            if (isEquation.operator !== null && isEquation.operands.length === 2 && cardData.expressionSymbolMult == null) {
                let operationSymbol = this.getOperationSymbolLatex(isEquation.operator.trim(), cardData.operationSymbolMult);
                if (isBraced) {
                    return `(${isEquation.operands[0]} ${operationSymbol} ${isEquation.operands[1]})`;
                } else {
                    return `${isEquation.operands[0]} ${operationSymbol} ${isEquation.operands[1]}`;
                }
            }

            if (cardData.expressionSymbolMult) {
                if (isEquation.operator !== null && isEquation.operands.length === 2) {
                      if (isBraced) {
                           return `(${isEquation.operands[0]} ${cardData.expressionSymbolMult} ${isEquation.operands[1]})`;
                      }else {
                           return `${isEquation.operands[0]} ${cardData.expressionSymbolMult} ${isEquation.operands[1]}`;
                      }
                }
            }
        return latexParam;
        }

        /**
         * This method is used to convert the given string to any one of the following fraction type 'unsimplified','simplified','mixed'
         * 
         * @param latexParam It contains latex parameter value 
         * @param fractionMode It contains fraction mode
         * @returns It wil return converted string
         * 
         * @memberOf FunctionCard
         */
        getFraction(latexParam: string, fractionMode: string): any {
            switch (fractionMode) {
                case 'unsimplified': return this.toNormal(latexParam);
                case 'simplified': return this.toSimple(latexParam);
                case 'mixed': return this.toMixed(latexParam);
            }
        }

        /**
         * This method will convert the given string to normal fraction string 
         * 
         * @returns It will return array of fraction values
         * 
         * @memberOf FunctionCard
         */
        toNormal(latexParam: any): any {
            let params = latexParam.split(',');
            params = (params.length > 2) ? this.toFraction(latexParam) : params;
            return [parseFloat(params[0]), parseFloat(params[1])];
        }

        /**
         * This method will generate the simplified value of the given fraction string
         * 
         * @returns It will return the simplified values
         * 
         * @memberOf FunctionCard
         */
        toSimple(latexParam: any): any {
            let params = latexParam.split(',');
            params = (params.length > 2) ? this.toFraction(latexParam) : params;
            return this.getSimpleFraction(parseFloat(params[0]), parseFloat(params[1]));
        }

        /**
         * This method will convert the given string to mixed fraction mode
         * 
         * @returns It will return array of fraction values
         * 
         * @memberOf FunctionCard
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
         * This method will convert the given mixed fraction string to normal fraction
         * 
         * @returns It will return array of fraction values
         * 
         * @memberOf FunctionCard
         */
        toFraction(latexParam: any): Array<any> {
            let params = latexParam.split(',');
            return [((parseFloat(params[0]) * parseFloat(params[2]) + parseFloat(params[1]))), parseFloat(params[2])];
        }

        /**
         * This method will generate mixed fraction using the given numerator and denominator
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
                return [i, this.getSimpleFraction(numerator, denominator)];
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
            return [numerator / greatestCommonDivisor, denominator / greatestCommonDivisor];
        }

        /**
         * This method will compute the values of function card and variable card
         * 
         * @param functionCard It contains the functin card value
         * @param variableCard It contains the variable card value
         * @return gridCardComputedData It will return the computed value
         * 
         * @memberOf GlobalCardMethods
         */
        computeCards(functionCard: FunctionCard, variableCard: VariableCard, fractionMode: string, expressionSymbolMult: String, gridValues: any): any {
            let gridCardComputedData = {
                latexString: '',
                latexParam: '',
                isImage: true, // to convert all equations to image
                image: '',
                algebraValue: '',
                valueType: ValueType.integer
            };
            let leftOperand = this.toMachineCodeString(variableCard.latexData.latexString);
            let operator = functionCard.latexData.operationSymbol;
            let rightOperand = this.toMachineCodeString(functionCard.latexParam);
            let resultValue;
            // for equation type
            if ((variableCard.valueType === ValueType.equation || functionCard.valueType === ValueType.equation) && variableCard.valueType != ValueType.fraction) {
                let isEquation = this.splitEquation(rightOperand);
                if (isEquation.operator !== null && isEquation.operands.length === 2) {
                    if (isEquation.operator.trim() != "*" && isEquation.operator.trim() != "/" && gridValues != null) {
                        let leftValue: String = algebra.parse(`${leftOperand}${operator}${isEquation.operands[0]}`).toTex();
                        if (leftValue.indexOf("\\frac") >= 0) {
                            leftValue = eval(`${leftOperand}${operator}${isEquation.operands[0]}`).toString();
                        }
                        let rightValue = algebra.parse(`${leftOperand}${operator}${isEquation.operands[1]}`).toTex();
                        gridCardComputedData.valueType = ValueType.equation;
                        gridCardComputedData.latexParam = `${leftValue} ${isEquation.operator} ${rightValue}`;
                        gridCardComputedData.latexString = `E(${leftValue} ${isEquation.operator} ${rightValue})`;
                        return gridCardComputedData;
                    } else {
                        let rightValue = algebra.parse(`${isEquation.operands[0]}${isEquation.operator}${isEquation.operands[1]}`).toTex();
                        let resultValue = algebra.parse(`${leftOperand}${functionCard.cardData.operationSymbol}${rightValue}`).toTex();
                        gridCardComputedData.valueType = ValueType.integer;
                        gridCardComputedData.latexParam = `${resultValue}`;
                        gridCardComputedData.latexString = `D(${resultValue})`;
                        return gridCardComputedData;
                    }
                } else {
                    // check for exponent
                    rightOperand = (rightOperand.indexOf('^') > 0) ? `(${rightOperand})` : rightOperand;
                    resultValue = algebra.parse(`${leftOperand}${operator}${rightOperand}`);
                    if (resultValue.terms.length > 0) {
                        resultValue = resultValue.toString();
                        gridCardComputedData.valueType = ValueType.equation;
                        gridCardComputedData.latexParam = resultValue;
                        gridCardComputedData.latexString = `E(${resultValue})`;
                        return gridCardComputedData;
                    } else {
                        resultValue = resultValue.constant();
                    }
                }
            } else {
                if (expressionSymbolMult == '\\times' || expressionSymbolMult == '\\cdot') {
                    let firstOperand: number = 0;
                    let secondOperand: number = 0;
                    let thirdOperand: number = 0;
                    let fourthOperand: number = 0;
                    if (Number(leftOperand) % 10 == 0) {
                        firstOperand = Number(leftOperand) / 10;
                        secondOperand = 10;
                    } else {
                        firstOperand = Number(leftOperand);
                        secondOperand = 1;
                    }
                    if (Number(rightOperand) % 10 == 0) {
                        thirdOperand = Number(rightOperand) / 10;
                        fourthOperand = 10;
                    } else {
                        thirdOperand = Number(rightOperand);
                        fourthOperand = 1;
                    }
                    let temp = secondOperand;
                    secondOperand = thirdOperand;
                    thirdOperand = temp;
                    let leftvalue = algebra.parse(`(${firstOperand}${operator}${secondOperand})`).constant();
                    let rightvalue = algebra.parse(`(${thirdOperand}${operator}${fourthOperand})`).constant();
                    while (leftvalue % 10 == 0) {
                        leftvalue = leftvalue / 10;
                        rightvalue = rightvalue * 10;
                    }
                    gridCardComputedData.valueType = ValueType.equation;
                    gridCardComputedData.latexParam = `${leftvalue} ${operator} ${rightvalue}`;
                    gridCardComputedData.latexString = `E(${leftvalue} ${operator} ${rightvalue})`;
                    return gridCardComputedData;
                }
                resultValue = algebra.parse(`(${leftOperand})${operator}(${rightOperand})`).constant();
            }

            // Percentage conversion 
            if (variableCard.valueType === ValueType.percentage) {
                resultValue = algebra.parse(`${resultValue.toString()} * 1/100`).constant();
            }

            if (fractionMode === null) {
                let num = resultValue.numer / resultValue.denom;
                let decimalResultValue = {
                    denom: 1,
                    numer: parseFloat(num.toFixed(2)).toString()
                };
                resultValue = decimalResultValue;
            }

            if (fractionMode === 'percentage') {
                let num = (resultValue.numer / resultValue.denom) * 100;
                let decimalResultValue = {
                    denom: 1,
                    numer: parseFloat(num.toFixed(2)).toString()
                };
                resultValue = decimalResultValue;
            }

            let resultString = '';
            if (resultValue.denom === 1) {
                resultString = '' + resultValue.numer;
                gridCardComputedData.latexString = `D(${resultString})`;
                gridCardComputedData.latexParam = resultString;
                if (fractionMode === 'percentage') {
                    gridCardComputedData.valueType = ValueType.percentage;
                    resultString = '' + resultValue.numer;
                    gridCardComputedData.latexParam = resultString;
                    gridCardComputedData.latexString = `P(${resultString})`;
                }
            } else {
                gridCardComputedData.valueType = ValueType.fraction;
                gridCardComputedData.isImage = true;
                resultString = `${resultValue.numer},${resultValue.denom}`;
                let convertedFraction;
                switch (fractionMode) {
                    case 'simplified':
                        convertedFraction = this.getSimpleFraction(resultValue.numer, resultValue.denom);
                        resultString = convertedFraction.toString().split(',');
                        resultString = `${convertedFraction[0]},${convertedFraction[1]}`;
                        break;
                    case 'unsimplified':
                    case 'mixed':
                        resultString = this.getFractionString(resultValue);
                        break;
                }
                gridCardComputedData.algebraValue = resultValue;
                gridCardComputedData.latexParam = resultString;
                gridCardComputedData.latexString = `F(${resultString})`;
            }
            return gridCardComputedData;
        }

        /**
         * This method is used to split the equation string to get the operands and operator
         * 
         * @param value string to split
         * @returns returns the operands and operator getting from splitting the equation string
         * 
         * @memberOf GlobalCardMethods
         */
        splitEquation(value: string) {
            if (value.indexOf('(') === 0) {
                let cardData = this.getCardValueType(`E${value}`);
                let mathExpression = cardData.value.match(/\s[/*+-]\s/i);
                let operands = (mathExpression !== null) ? cardData.value.split(mathExpression[0]) : [];
                let operator = (mathExpression !== null) ? mathExpression[0] : null;
                return { operator, operands };
            }
            return { operator: null, operands: [] };
        }

        /**
         * This method will generate the mixed fraction string 
         * 
         * @param resultValue It contains the string which is used to generate the mixed fraction
         * @returns It will return the mixed fraction
         * 
         * @memberOf GlobalCardMethods
         */
        getFractionString(resultValue: any): string {
            let resultString, convertedFraction;
            if (resultValue.numer > resultValue.denom) {
                convertedFraction = this.getMixedNumberFraction(resultValue.numer, resultValue.denom);
                convertedFraction = convertedFraction.toString().split(',');
                if (convertedFraction[0] === '0') {
                    resultString = `${convertedFraction[1]},${convertedFraction[2]}`;
                } else {
                    resultString = `${convertedFraction[0]},${convertedFraction[1]},${convertedFraction[2]}`;
                }
            } else {
                resultString = `${resultValue.numer},${resultValue.denom}`;
            }
            return resultString;
        }

        /**
         * This method will convert given fraction params to machine understandable format
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
         * This method will evaluate the math expressions(inside bracis) of function card and variable card
         * 
         * @param * latexParam It contains latex param string to evaluate 
         * @returns It will return the latex param value
         * 
         * @memberOf GlobalCardMethods
         */
        calculateLatexParam(cardData: any) {
            // search is there any operation symbol is present inside card
            let latexParam = cardData.value;
            let mathExpression = latexParam.match(/\s[/*+-]\s/i);
            if (mathExpression !== null && cardData.type !== ValueType.equation) {
                let operands = latexParam.split(mathExpression[0]);
                let leftMachineValue = this.toMachineCodeString(operands[0]);
                let rightMachineValue = this.toMachineCodeString(operands[1]);
                let machineValue = this.toMachineCodeString(`(${leftMachineValue})${mathExpression[0]}(${rightMachineValue})`);
                let resultValue = algebra.parse(`${machineValue}`).constant();
                if (cardData.type == ValueType.integer || cardData.type == ValueType.decimal) {
                    resultValue = eval(`${resultValue}`);
                    return resultValue.toString();
                }
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
     * Function card class
     * 
     * @class FunctionCard
     * @extends {GlobalCardMethods}
     */
    class FunctionCard extends GlobalCardMethods {
        cardType: CardType = CardType.FunctionCard;
        cardData: FunctionCardJSONData;
        valueType: ValueType;
        latexParam: string;
        latexData: any;

        /**
         * Creates an instance of FunctionCard.
         * 
         * @param cardData It contains card data
         * 
         * @memberOf FunctionCard
         */
        constructor(cardData: FunctionCardJSONData) {
            super();
            this.cardData = cardData;
            let getCardType = this.getCardValueType(this.getCardRawValue());
            this.valueType = getCardType.type;
            this.latexParam = getCardType.value;
            this.latexData = this.getComputedLatex(this.valueType, this.cardData.predefinedLatex, this.latexParam,
                this.cardType, this.cardData.operationSymbol, this.cardData.operationSymbolLatex);
            let splitArray = this.latexParam.split(',');
            if (splitArray.length > 2) {
                this.cardData.fractionMode = 'mixed';
            }
        }

        /**
         * This method will get the raw value of a card e.g D(5) or F(1,2),..
         * 
         * @returns It will return raw value of given card
         * 
         * @memberOf FunctionCard
         */
        getCardRawValue(): any {
            return _.shuffle(this.cardData.values)[0];
        }

        /**
         * This mehtod will get latext image URL
         * 
         * @returns It will return latex image url
         * 
         * @memberOf FunctionCard
         */
        getURL() {
            switch (this.valueType) {
                case ValueType.fraction:
                    if (this.cardData.fractionMode === null) {
                        this.cardData.fractionMode = 'unsimplified';
                    }
                    this.latexParam = this.getFraction(this.latexParam, this.cardData.fractionMode).toString();
                    return this.getLatexURL(this.valueType, this.cardData, this.latexParam);
            }
            return this.getLatexURL(this.valueType, this.cardData, this.latexParam,true);
        }

        /**
         * This function is used to get the scale value that is used to scale the image
         * 
         * @returns It will return the scale size
         * @memberof FunctionCard
         */
        getImageScale() {
            return this.valueType == ValueType.fraction ? 2.5 : 3.5;
        }

        /**
         * This method will process given variable card
         * 
         * @param variableCard It contains variable card to compute
         * @returns It contains computed result data
         * 
         * @memberOf FunctionCard
         */
        computeValue(variableCard: VariableCard, fractionMode: string, expressionSymbolMult: String, gridValue: any) {
            return this.computeCards(this, variableCard, fractionMode, expressionSymbolMult, gridValue);
        }

        /**
         * This method will return URL for latex equation which will be displayed in equation area
         * 
         * @param variableCard It contains variable card data
         * @param computedData It contains result data
         * @param isError It contains boolean value (whether the given equation is right/wrong)
         * @returns It will retun latex equation's URL
         * 
         * @memberOf FunctionCard
         */
        getEquationLatex(variableCard: VariableCard, computedData: any, isError: boolean, gridText: any) {
            let size = (this.valueType === ValueType.fraction || variableCard.valueType === ValueType.fraction ||
                computedData.valueType === ValueType.fraction) ? 90 : 50;

            let varPercent = (variableCard.valueType === ValueType.percentage) ? '%' : '';
            let gridPercent = (computedData.valueType === ValueType.percentage) ? '%' : '';
            variableCard.latexData.beforeText = variableCard.cardData.beforeText;
            variableCard.latexData.afterText = variableCard.cardData.afterText;

            let varCardURL = this.latexParamToURL(variableCard.latexData, variableCard.latexParam, true);
            varCardURL=varCardURL.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            if (varPercent !== '') {
                //varCardURL = `${varCardURL}\\${varPercent}`;
            }
            let fnCardURL = this.latexParamToURL(this.cardData, this.latexParam, true, true);
            fnCardURL=fnCardURL.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            gridText.operationSymbolLatex = '';
            let gridCardURL = this.latexParamToURL(gridText, computedData.latexParam, true);
            gridCardURL=gridCardURL.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            if (gridPercent !== '') {
                gridCardURL = `${gridCardURL}\\${gridPercent}`;
            }
            gridCardURL = gridCardURL.trim();
            let data = {
                isImage: true, // to convert all equation to images
                image: '',
                scale:4
            };
            if (this.valueType === ValueType.integer && variableCard.latexData.isImage === false && computedData.isImage === false) {
                data.isImage = false;
                data.image = `${variableCard.latexParam}${varPercent} ${this.getOperationSymbol(this.cardData.operationSymbol,

                    this.cardData.operationSymbolLatex)} ${this.latexParam} = ${computedData.latexParam}${gridPercent}`;
                data.scale=4;
            } else {
                data.isImage = true;
                let URI =`${varCardURL}${fnCardURL}=${gridCardURL}`;
                data.image = `${URI}`;
                data.scale = variableCard.valueType === ValueType.fraction  || this.cardData.fractionMode !== null ? 2.5 : 4;
            }
            return data;
        }
    }

    /**
     * Variable card class
     * 
     * @class VariableCard
     * @extends {GlobalCardMethods}
     */
    class VariableCard extends GlobalCardMethods {
        cardType: CardType = CardType.VariableCard;
        cardData: any;
        valueType: ValueType;
        latexParam: string;
        latexData: any;

        /**
         * Creates an instance of VariableCard.
         * 
         * @param cardData It contains card data
         * 
         * @memberOf VariableCard
         */
        constructor(cardData: any) {
            super();
            this.cardData = cardData;
            this.cardData.operationSymbolLatex = '';
            let getCardType = this.getCardValueType(cardData.value);
            this.valueType = getCardType.type;
            if (this.valueType === ValueType.percentage) {
                this.cardData.afterText = this.cardData.afterText ? '%' + this.cardData.afterText : '%';
            }
            this.latexParam = getCardType.value;
            this.latexData = this.getComputedLatex(this.valueType, '', this.latexParam,
                this.cardType, '', '');
        }

        /**
         * This method will get latex image url
         * 
         * @returns It will return string of image URL
         * 
         * @memberOf VariableCard
         */
        getURL() {
            return this.getLatexURL(this.valueType, this.cardData, this.latexParam,true);
        }

        /**
         * This function is used to get the scale value that is used to scale the image
         * 
         * @returns It will return the scale size
         * @memberof VariableCard
         */
        getImageScale() {
            return this.valueType == ValueType.fraction ? 2.5 : 3.5;
        }
    }

    /**
     * GridCard
     * 
     * @class GridCard
     * @extends {GlobalCardMethods}
     */
    class GridCard extends GlobalCardMethods {
        cardType: CardType = CardType.GridCard;
        cardData: GridCardData;
        latexData: any;

        /**
         * Creates an instance of GridCard.
         * 
         * @param cardData It contains card data
         * 
         * @memberOf GridCard
         */
        constructor(cardData: GridCardData) {
            super();
            this.cardData = cardData;
        }

        /**
          * This method will get latex image url
          * 
          * @returns It will return string of image URL
          * 
          * @memberOf GridCard
          */
        getURL() {
            let appendText = (this.latexData.valueType === ValueType.percentage) ? `\\%` : '';
            return this.getLatexURL(this.latexData.valueType, {
                operationSymbolLatex: '', beforeText: this.cardData.beforeText, afterText:

                this.cardData.afterText, expressionSymbolMult: this.cardData.expressionSymbolMult
            }, `${this.latexData.latexParam}${appendText}`,true);
        }

        /**
         * This function is used to get the scale value that is used to scale the image
         * 
         * @returns It will return the scale size
         * @memberof GridCard
         */
        getImageScale() {
            return this.latexData.valueType == ValueType.fraction ? 2 : 3;
        }

        /**
         * This method will return the computed bad guy grid data
         * 
         * @returns it contains grid data for the bad guy
         * 
         * @memberOf GridCard
         */
        getComputedValue() {
            if (this.cardData.computedValue === null) {
                this.latexData = this.computeCards(this.cardData.functionCard, this.cardData.variableCard, this.cardData.fractionMode, this.cardData.expressionSymbolMult, this.cardData.computedValue);
            } else {
                this.latexData = this.cardData.computedValue;
            }
            return this.latexData;
        }
    }

    /**
     * Describes the properties in the Bad guys
     * 
     * @export
     * @interface ActorBadGuy
     */
    export interface ActorBadGuy {
        type: string;
        value: string;
    }

    /**
     * Describes the properties in the Function Cards 
     * 
     * @export
     * @interface FunctionCardData
     */
    export interface FunctionCardData {
        operationSymbolLatex: string;
        computedLatexMode: string;
        values: number;
        operationSymbol: string;
    }

    /**
     * Describes the properties in the Variable Cards 
     * 
     * @export
     * @interface VariableCardData
     */
    export interface VariableCardData {
        type: string;
        value: number;
    }

    /**
     * Describes the properties in the Bad Guys Grid as per json
     * 
     * @export
     * @interface BadGuysGrid
     */
    export interface GridCards {
        numOfColumns: number;
        initialSpeed: number;
        acceleration: number;
        accelerationRate: number;
        maximumSpeed: number;
        BGCharacterType: string; // square (upto 3 char), long (fraction), wide (4 to 6 char) for bad guys type
        fractionMode: string;
        values: Array<any>;
        expressionSymbolMult: String;
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
        functionCards: Array<FunctionCard>;
        variableCards: Array<VariableCard>;
        variableCardsShown: Array<any>;
        maximumShownVariableCards: number;
        badGuysColumnCount: number;
        badGuysGrid: GridCards;
        dynamicBadGuysRow: Array<GridCard>;
        variableValues: any = null;
        possibleCardsList: any = [];
        accelerationRate: number = 500;
        maximumSpeed: number = 500;

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
        setJSONLevel(level: number) {
            if (level < this.gameJSON.levelData.length) {
                this.currentLevel = this.getCloneJSON(this.gameJSON.levelData[level]);
            } else {
                this.currentLevel = this.getCloneJSON(this.gameJSON.levelData[0]);
            }
            this.initGameData();
        }

        /**
         * This method will intilize the current game data from json
         * 
         * @memberOf EngineBase
         */
        initGameData() {
            this.maximumShownVariableCards = this.currentLevel.variableCards.numOfCards;
            let var0 = this.currentLevel.variableCards.var0 !== null ? [_.shuffle(this.currentLevel.variableCards.var0)[0]] : null;
            let var1 = this.currentLevel.variableCards.var1 !== null ? [_.without(_.shuffle(this.currentLevel.variableCards.var1), var0[0])[0]] : null;
            let var2 = this.currentLevel.variableCards.var2 !== null ? [_.without(_.shuffle(this.currentLevel.variableCards.var2), var0[0], var1[0])[0]] : null;
            let var3 = this.currentLevel.variableCards.var3 !== null ? [_.without(_.shuffle(this.currentLevel.variableCards.var3), var0[0], var1[0], var2[0])[0]] : null;
    
           if(var1 !== null ){
                var1 = var1.length == 0 ? [_.shuffle(this.currentLevel.variableCards.var1)[0]] : var1;
           }

            if(var2 !== null ){
                var2 = var2.length == 0 ? [_.shuffle(this.currentLevel.variableCards.var2)[0]] : var2;
           }

            if(var3 !== null ){
                var3 = var3.length == 0 ? [_.shuffle(this.currentLevel.variableCards.var3)[0]] : var3;
           }
          
            this.variableValues = {
                var0: var0,
                var1: var1,
                var2: var2,
                var3: var3,
            };
           
            this.badGuysGrid = this.currentLevel.gridCards;
            if (this.badGuysGrid.values !== null) {
                this.setFilteredGridValues();
                this.findAvailableCardsType();
                this.simplifyBadGuyValues();
            }
            this.setFunctionCards();
            this.setVariableCards();
        }

        /**
         * This method is used to find fraction mode for the bad guy grid values
         * 
         * @memberOf EngineBase
         */
        findAvailableCardsType() {
            let availableTypes = this.badGuysGrid.values.map((ele) => {
                if (ele.split(',').length === 3) {
                    return 'mixed';
                }

                if (ele.split(',').length === 2) {
                    return 'unsimplified';
                }
                if (ele.indexOf('P(') === 0) {
                    return 'percentage';
                }
                return null;
            });

            let frMode = this.badGuysGrid.fractionMode;
            let toFrMode = null;
            if (_.contains(availableTypes, 'mixed')) {
                toFrMode = 'mixed';
            }

            if (!_.contains(availableTypes, 'mixed') && _.contains(availableTypes, 'unsimplified')) {
                toFrMode = 'unsimplified';
            }

            if (toFrMode === null && _.contains(availableTypes, 'percentage')) {
                toFrMode = 'percentage';
            }

            if (frMode === null) {
                this.badGuysGrid.fractionMode = toFrMode;
            }
        }

        /**
         * This method is used to simplify the bad guy values if the fraction mode is 'simplified'
         * 
         * @memberOf EngineBase
         */
        simplifyBadGuyValues() {
            if (this.badGuysGrid.fractionMode === 'simplified') {
                let convertedValues: any = [];
                this.badGuysGrid.values.map((ele, index) => {
                    let cType = this.getCardValueType(ele);
                    if (cType.type === ValueType.fraction) {
                        let mValue = this.toMachineCodeString(cType.value);
                        let resultValue = algebra.parse(mValue).constant();
                        let resultString = this.getFractionString(resultValue);
                        convertedValues[index] = `F(${resultString})`;
                    } else {
                        convertedValues[index] = ele;
                    }
                });
                this.badGuysGrid.values = convertedValues;
            }
        }

        /**
         * This method will set and returns the populated final function cards
         * 
         * @returns It returns the pouplated function cards
         * 
         * @memberOf EngineBase
         */
        getFilteredFunctionCards(): any {
            let cards = _.filter(this.currentLevel.functionCards.cards, (element: any) => {
                return (element.values !== null);
            });
            cards = _.shuffle(cards);
            let fnValues = [];
            let pValues = [];
            let populatedFnValues: any = [];
            for (let ci = 0; ci < cards.length; ci++) {
                fnValues = _.shuffle(cards[ci].values);
                populatedFnValues = [];
                for (let vi = 0; vi < fnValues.length; vi++) {
                    pValues = this.addAllVariableValues(fnValues[vi]);
                    if (pValues.length <= 0) {
                        populatedFnValues.push(fnValues[vi]);
                    } else {
                        populatedFnValues = _.union(populatedFnValues, pValues);
                    }
                }
                populatedFnValues = _.uniq(populatedFnValues);
                cards[ci].values = populatedFnValues;
            }
            return cards;
        }

        /**
         * This method will set and returns the populated final variable cards
         * 
         * @returns It returns the pouplated variable cards
         * 
         * @memberOf EngineBase
         */
        getFilteredVariableCards(): any {
            this.variableCardsShown = [];
            let cards = this.currentLevel.variableCards.values;
            cards = _.shuffle(cards);
            let populatedVarCards: any = [];
            let possibleValues = [];
            for (let ci = 0; ci < cards.length; ci++) {
                possibleValues = this.addAllVariableValues(cards[ci]);
                if (possibleValues.length <= 0) {
                    populatedVarCards.push(cards[ci]);
                } else {
                    populatedVarCards = _.union(populatedVarCards, possibleValues);
                }
            }
            populatedVarCards = _.uniq(populatedVarCards);
            return populatedVarCards;
        }

        /**
         * This method will set and returns the populated final grid cards in json
         * 
         * @returns It returns the pouplated grid cards in json
         * 
         * @memberOf EngineBase
         */
        setFilteredGridValues() {
            if (this.badGuysGrid.values !== null) {
                let possibleValues: any = [];
                let populatedGridCards: any = [];
                for (let ci = 0; ci < this.badGuysGrid.values.length; ci++) {
                    possibleValues = this.addAllVariableValues(this.badGuysGrid.values[ci]);
                    if (possibleValues.length <= 0) {
                        populatedGridCards.push(this.badGuysGrid.values[ci]);
                    } else {
                        populatedGridCards = _.union(populatedGridCards, possibleValues);
                    }
                }
                this.badGuysGrid.values = _.unique(populatedGridCards);
                this.badGuysGrid.values = _.shuffle(this.badGuysGrid.values);
            }
        }

        /**
         * This method is used to identify grid card type
         * 
         * @param computedValue contains the value to check
         * @returns It will return computed value
         * 
         * @memberOf EngineBase
         */
        identifyGridCardType(computedValue: any): any {
            // To check for decimal points
            if (computedValue.valueType === ValueType.integer) {
                if (_.contains(this.badGuysGrid.values, `D(${computedValue.latexParam})`)) {
                    computedValue.latexString = `D(${computedValue.latexParam})`;
                } else if (_.contains(this.badGuysGrid.values, `D(${computedValue.latexParam}0)`)) {
                    computedValue.latexParam = `${computedValue.latexParam}0`;
                    computedValue.latexString = `D(${computedValue.latexParam})`;
                }
            }

            // To check the computed value weather it is a type of percentage
            if (computedValue.valueType === ValueType.integer || computedValue.valueType === ValueType.percentage) {
                if (_.contains(this.badGuysGrid.values, `P(${computedValue.latexParam})`)) {
                    computedValue.valueType = ValueType.percentage;
                    computedValue.latexString = `P(${computedValue.latexParam})`;
                }
            }

            // For fraction reduced mode
            if (computedValue.valueType === ValueType.fraction && this.badGuysGrid.values !== null) {
                this.badGuysGrid.values.map((ele, index) => {
                    let cType = this.getCardValueType(ele);
                    let mValue = this.toMachineCodeString(cType.value);
                    let resultValue = algebra.parse(mValue).constant();
                    if (computedValue.algebraValue.toString() === resultValue.toString()) {
                        // display original grid value
                        computedValue.latexParam = `${cType.value}`;
                        computedValue.latexString = `F(${cType.value})`;
                    }
                });
            }

            if (computedValue.valueType === ValueType.equation) {
                if (this.badGuysGrid.values !== null) {
                    let value = algebra.parse(`${computedValue.latexParam}`).toTex();
                    if (_.contains(this.badGuysGrid.values, `E(${computedValue.latexParam})`)) {
                        computedValue.latexString = `E(${computedValue.latexParam})`;
                    } else if (_.contains(this.badGuysGrid.values, `D(${value})`)) {
                        computedValue.latexParam = `${value}`;
                        computedValue.latexString = `D(${value})`;
                    } else {
                        let values: Array<String> = [];
                        let param = '';
                        _.each(this.badGuysGrid.values, (gridValue) => {
                            gridValue = gridValue.slice(1, -1);
                            param = gridValue;
                            values.push(`D(${algebra.parse(`${gridValue})`).toTex()})`);
                        });
                        let index = values.indexOf(`D(${value})`);
                        if (index > 0) {
                            computedValue.latexString = this.badGuysGrid.values[index];
                            computedValue.latexParam = this.badGuysGrid.values[index].slice(2, -1);
                        } else {
                            let variables = /[a-z]/;
                            let matches = variables.exec(computedValue.latexString);
                            if (matches !== null) {
                                let mathExpression = /[+]/;
                                let operator = mathExpression.exec(computedValue.latexParam);
                                if (operator !== null) {
                                    let values = computedValue.latexParam.split("+");
                                    computedValue.latexParam = `${values[1].trim()} + ${values[0].trim()}`;
                                    computedValue.latexString = `E(${values[1].trim()} + ${values[0].trim()})`;
                                } else {
                                    let array = Array.from(computedValue.latexParam);
                                    let result = '';
                                    let numbers = '';
                                    let mathExpression = /[0-9]/;
                                    let removeDigits = computedValue.latexParam.replace(/[0-9]/g, '');
                                    let newArray = Array.from(removeDigits);
                                    newArray = newArray.sort();
                                    array = _.union(array, newArray);
                                    array = array.sort();
                                    for (let i = 0; i < array.length; i++) {
                                        result += array[i];
                                    }
                                    computedValue.latexParam = `${result}`;
                                    computedValue.latexString = `E(${result})`;
                                }
                            }
                        }
                    }
                }
            }
            return computedValue;
        }

        /**
         * This method will create the function cards array using json data
         *  
         * @memberOf EngineBase
         */
        setFunctionCards(): void {
            this.functionCards = [];
            let cards = this.getFilteredFunctionCards();
            let uniqueValues: Array<string> = [];
            let opSymbol = null;
            let fnCardValues = [];
            for (let card = 0; card < cards.length; card++) {
                fnCardValues = cards[card].values;
                let cVals = _.filter(fnCardValues, function (element: any) {
                    if (!_.contains(uniqueValues, `${cards[card].operationSymbol}_${element}`)) return element;
                });
                fnCardValues = _.shuffle(cVals);
                if (fnCardValues.length > 0) {
                    this.functionCards.push(
                        new FunctionCard(
                            {
                                predefinedLatex: cards[card].predefinedLatex,
                                fractionMode: cards[card].fractionMode,
                                expressionSymbolMult: cards[card].expressionSymbolMult,
                                operationSymbolLatex: cards[card].operationSymbolLatex,
                                values: ['' + fnCardValues[0]],
                                operationSymbol: cards[card].operationSymbol,
                                beforeText: this.currentLevel.functionCards.beforeText,
                                afterText: this.currentLevel.functionCards.afterText
                            }
                        )
                    );
                    opSymbol = cards[card].operationSymbol;
                    uniqueValues.push(`${cards[card].operationSymbol}_${fnCardValues[0]}`);
                }
            }
            this.functionCards = this.functionCards.slice(0, this.currentLevel.functionCards.numOfCards);
        }

        /**
         * This method will get the set of function cards
         * 
         * @returns It will return the array of function cards
         * 
         * @memberOf EngineBase
         */
        getFunctionCards(): Array<FunctionCard> {
            return this.functionCards;
        }

        /**
         * This method will create the variable cards array using the json data
         * 
         * @memberOf EngineBase
         */
        setVariableCards() {
            this.variableCards = [];
            this.variableCardsShown = [];
            let convertValue = '';
            let cards = this.getFilteredVariableCards();
            for (let card = 0; card < cards.length; card++) {
                convertValue = this.replaceVariableValues(cards[card]);
                this.variableCards.push(new VariableCard(
                    {
                        value: convertValue,
                        beforeText: this.currentLevel.variableCards.beforeText,
                        afterText: this.currentLevel.variableCards.afterText,
                        operationSymbolMult: this.currentLevel.variableCards.operationSymbolMult
                    }
                ));
            }
            this.variableCards = this.variableCards.slice(0,
                this.maximumShownVariableCards);
        }

        /**
         * This method is used to get the variable cards
         * 
         * @returns it will return array of variable cards
         * 
         * @memberOf EngineBase
         */
        getVariableCards(): Array<VariableCard> {
            return this.variableCards;
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
             for (let j = 0; j < 2; j++) {
            for (let i = 0; i < 4; i++) {
                if (value.indexOf(`var${i}`) >= 0) {
                    if (this.variableValues[`var${i}`] !== null) {
                        let replaceTo = _.shuffle(this.variableValues[`var${i}`])[0];
                        value = value.replace(`var${i}`, '' + replaceTo);
                    } else {
                        console.log(`JSON ERROR... ${`var${i}`} is NULL for ${value}`);
                    }
                }
            }
             }
            return value;
        }

        /**
         * This method will replace all var0/var1/var2 string to their respective values
         * 
         * @param value string to replace var0/var1/var2
         * @returns string It contains array of possible replaced values
         * 
         * @memberOf EngineBase
         */
        addAllVariableValues(value: any): Array<string> {
            let possibleValues = [];
            let cVal = '';
             for (let j = 0; j < 2; j++) {
            for (let i = 0; i < 4; i++) {
                if (value.indexOf(`var${i}`) >= 0) {
                    if (this.variableValues[`var${i}`] !== null) {
                        for (let pi = 0; pi < this.variableValues[`var${i}`].length; pi++) {
                            value = value.replace(`var${i}`, '' + this.variableValues[`var${i}`][0]);
                           // possibleValues.push(cVal);
                       }
                    } else {
                        console.log(`JSON ERROR... ${`var${i}`} is NULL`);
                    }
                }
            }
             }
            possibleValues.push(value);
            return possibleValues;
        }

        /**
         * This method will get set of bad guys for the next row / initial row
         * 
         * @param functionCards It contains array of function cards
         * @param variableCards It contains array of variable cards
         * @returns It will return array of bad guys for the row
         * 
         * @memberOf EngineBase
         */
        getBadGuys(functionCards: Array<FunctionCard>, variableCards: Array<VariableCard>): Array<GridCard> {
            if (this.badGuysGrid.values === null) {
                this.dynamicBadGuysRow = [];
                for (let bgRowIndex = 0; bgRowIndex < this.badGuysGrid.numOfColumns; bgRowIndex++) {
                    this.dynamicBadGuysRow.push(
                        new GridCard(
                            {
                                functionCard: functionCards[Math.floor(functionCards.length * Math.random())],
                                variableCard: variableCards[Math.floor(variableCards.length * Math.random())],
                                computedValue: null,
                                fractionMode: this.badGuysGrid.fractionMode,
                                beforeText: this.currentLevel.gridCards.beforeText,
                                afterText: this.currentLevel.gridCards.afterText,
                                expressionSymbolMult: this.currentLevel.gridCards.expressionSymbolMult
                            }
                        )
                    );
                }
            } else {
                this.dynamicBadGuysRow = [];
                _.each(functionCards, (fnCard) => {
                    _.each(variableCards, (varCard) => {
                        let computedValue = fnCard.computeValue(varCard, this.badGuysGrid.fractionMode, this.badGuysGrid.expressionSymbolMult, this.badGuysGrid.values);
                        computedValue = this.identifyGridCardType(computedValue);
                        if (_.contains(this.badGuysGrid.values, computedValue.latexString)) {
                            this.dynamicBadGuysRow.push(
                                new GridCard(
                                    {
                                        functionCard: fnCard,
                                        variableCard: varCard,
                                        computedValue: computedValue,
                                        fractionMode: this.badGuysGrid.fractionMode,
                                        beforeText: this.currentLevel.gridCards.beforeText,
                                        afterText: this.currentLevel.gridCards.afterText,
                                        expressionSymbolMult: this.currentLevel.gridCards.expressionSymbolMult
                                    }
                                )
                            );
                        }
                    });
                });

                if (this.dynamicBadGuysRow.length < this.badGuysGrid.numOfColumns && this.dynamicBadGuysRow.length > 0) {
                    for (let i = this.dynamicBadGuysRow.length; i < this.badGuysGrid.numOfColumns; i++) {
                        this.dynamicBadGuysRow.push(this.dynamicBadGuysRow[Math.floor(this.dynamicBadGuysRow.length * Math.random())]);
                    }
                } else {
                    if (this.dynamicBadGuysRow.length === 0) {
                        alert('No possible values json err..');
                    }
                }
            }
            this.dynamicBadGuysRow = _.shuffle<GridCard>(this.dynamicBadGuysRow);
            this.dynamicBadGuysRow = this.dynamicBadGuysRow.slice(0, this.badGuysGrid.numOfColumns);
            return this.dynamicBadGuysRow;
        }

        /**
         * This method will get the count of bad guys visible per row
         * 
         * @returns It will return the column count for the bad guy
         * 
         * @memberOf EngineBase
         */
        getNumofBadGuyColumnCount() {
            return this.badGuysGrid.numOfColumns;
        }

        /**
         * This method will get the initial speed to tween the Bad Guys
         * 
         * @returns It will return the initial speed
         * 
         * @memberOf EngineBase
         */
        getInitialSpeed(): number {
            return this.badGuysGrid.initialSpeed;
        }

        /**
         * This method will get the speed of bad guys based on the game points.
         * 
         * @param gamePoints It contains the game points
         */
        getSpeed(gamePoints: number): number {
            let accPoints = Math.floor(gamePoints / this.badGuysGrid.acceleration);
            if (accPoints === 0) return this.getInitialSpeed();
            let calculatedSpeed = this.getInitialSpeed() - Math.floor(gamePoints / this.badGuysGrid.acceleration) * this.accelerationRate;
            if (calculatedSpeed < this.maximumSpeed) {
                return this.maximumSpeed;
            } else {
                return calculatedSpeed;
            }
        }

        /**
         * This method will return the rewardPointsThreshold
         */
        getRewardsThreshold(): Array<number> {
            return this.currentLevel.scoring.rewardPointsThreshold;
        }

        /**
         * This method will return the bad guy type to be used 
         * 
         * @returns It contains bad guy type to use
         * 
         * @memberOf EngineBase
         */
        getBadGuyCharacterType() {
            return this.badGuysGrid.BGCharacterType;
        }

        /**
         * This method will return the number of iteration to remove boss
         * 
         * @returns number of iteration to remove boss
         * 
         * @memberOf EngineBase
         */
        getBossIterations() {
            return this.currentLevel.scoring.bossIterations;
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
         * @returns It will return video url
         * 
         * @memberOf EngineBase
         */
        getTutorialVideo() {
            return this.currentLevel.tutorial.T1;
        }

        /**
         * This method is used the get grid card's before,after text and expressionSymbolMult properties,
         * to display on the equation area
         * @returns
         * 
         * @memberOf EngineBase
         */
        getBadguysData() {
            let data = {
                beforeText: this.currentLevel.gridCards.beforeText,
                afterText: this.currentLevel.gridCards.afterText,
                expressionSymbolMult: this.currentLevel.gridCards.expressionSymbolMult
            };
            return data;
        }
    }
}
