/**
 * This interface would have the properties of Slider
 */
export interface Slider {
    height: string;
    total: string;
    min: string;
    max: string;
    interval: string;
}

/**
 * This interface would have the properties of Frequency
 */
export interface Frequency {
    goodGuys: number;
    badGuys:number;
    comboTiles:number;
}

/**
 * This interface would have the properties of Grid
 */
export interface Grid {
    values : Array<string>;
}

/**
 * This interface would have the properties of Scoring
 */
export interface Scoring {
    starThreshold: number;
    loseThreshold: number;
}

/**
 * This interface would have the properties of LevelData
 */
export interface LevelData {
    id: string;
    parentId: string;
    title: string;
    lessons : any;
    gridSize : Number;
    sliderType :String;
    equationType:String;
    var0: Array<number>;
    var1: Array<number>;
    var2: Array<number>;
    var3: Array<number>;
    frequency: Frequency;
    slider: Slider;
    grid:Grid;
    scoring:Scoring;
    tutorial: any;
    keywords:any;
    meaningfulDescription:any;
}

/**
 * This interface would have the properties of SliderGameJson
 */
export interface SliderGameJson {
    gameName: string;
    isbn: string;
    GameGuid: string;
    grade: string;
    gradeLabel: string;
    testMode: boolean;
    levelData: Array<LevelData>;
}

export interface Points {
    successfulPair:number;
    comboTile:number;
    clearBadGuy:number;
    getGoodGuy:number;
    earnStar:number;
}
 
 
 export interface ThreebyThreeGrid {
	goodGuysMaxNumber:number;
	badGuysMaxNumber:number;
	comboTileMaxNumber:number;
 }

export interface FourbyFourGrid {
	goodGuysMaxNumber:number;
	badGuysMaxNumber:number;
	comboTileMaxNumber:number;
}

/**
 * This interface would have the properties of PointsJson
 */
export interface PointsJson {
    points:Points;
	'3x3grid':ThreebyThreeGrid;
	'4x4grid':FourbyFourGrid;
}

export interface Grade {
    grade3 :PointsJson;
}

