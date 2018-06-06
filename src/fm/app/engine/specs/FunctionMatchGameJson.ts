/**
 * This interface would have the properties of InputType
 */
export interface InputType {
    type: string;
    values: Array<number>;
    numAvailableValuesToStart: number;
    multiple: number;
}

/**
 * This interface would have the properties of VariableCard
 */
export interface VariableCard {
    numOfCards: number;
    var0: Array<number>;
    var1: Array<number>;
    var2: Array<number>;
    var3: Array<number>;
    values: Array<string>;
    operationSymbolMult:string,
    beforeText:string,
    afterText:string
}

/**
 * This interface would have the properties of FunctionType
 */
export interface FunctionType {
    predefinedLatex: string;
    values: Array<string>;
    fractionMode: string;
    operationSymbol: string;
    operationSymbolLatex: string;
    expressionSymbolMult:string
}

/**
 * This interface would have the properties of FunctionCard
 */
export interface FunctionCard {
    numOfCards: string;
    beforeText:string,
    afterText:string,
    cards: Array<FunctionType>;
}

/**
 * This interface would have the properties of GridType
 */
export interface GridCard {
    BGCharacterType:string;
    numOfColumns : number;
    initialSpeed : number;
    acceleration: number;
    fractionMode:string;
    values : Array<string>;
    expressionSymbolMult:string;
    expressionSymbolDiv:string;
    beforeText:string;
    afterText:string;
}

/**
 * This interface would have the properties of Scoring
 */
export interface Scoring {
    rewardPointsThreshold: Array<number>;
    bossIterations: number;
}

/**
 * This interface would have the properties of LevelData
 */
export interface LevelData {
    id: string;
    parentId: string;
    title: string;
    lessons : Array<string>;
    variableCards: VariableCard;
    functionCards: FunctionCard;
    gridCards: GridCard;
    scoring: Scoring;
    tutorial: any;
    keywords:any;
}

/**
 * This interface would have the properties of FunctionMatchGameJson
 */
export interface FunctionMatchGameJson {
    gameName: string;
    isbn: string;
    GameGuid: string;
    grade: string;
    gradeLabel: string;
    testMode: boolean;
    levelData: Array<LevelData>;
}
