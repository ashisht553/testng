import { POGGameEngineBase } from './game.engine.base'

/**
 * This class is engine for all object games
 */
export class ObjectGameEngine extends POGGameEngineBase.NewEngineBase implements POGGameEngineBase.IGameEngine {

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

        let members: Array<Array<number>> = this.stateLevelJSONBlock["members"];
        let badGuyType = this.stateLevelJSONBlock["badGuyTypes"];
        let goodGuyType = this.stateLevelJSONBlock["goodGuyTypes"];


        //factors 1 : upper or left compartments - bad guys
        (this.stateLevelJSONBlock["operation"]["factors"][0] as Array<number>).forEach((num) => {
            if (num != null) {

                let props = this.getCacheKeyForActor(POGGameEngineBase.ActorType.BadGuy);
                let multipleof = (members[num][2] !== undefined) ? (<any>members[num][2])["multiple"]:undefined;
                let actor: POGGameEngineBase.IActor = {
                    actorType: POGGameEngineBase.ActorType.BadGuy,
                    value: this.randomNumberGeneration(members[num][0] as number, members[num][1] as number, multipleof),
                    spriteType: this.stateLevelJSONBlock["badGuyTypes"][0],
                    cacheKey: "",
                    width: 0,
                    benchWidth:0,
                    id:"",
                    decimalPosition:0
                }
                this.factors1.push(actor);
            }

        });

        //factors 2 : lower or right compartments - good guys
        (this.stateLevelJSONBlock["operation"]["factors"][1] as Array<number>).forEach((num) => {

            if (num != null) {
                let multipleof = (members[num][2] !== undefined) ? (<any>members[num][2])["multiple"]:undefined;
                let actor: POGGameEngineBase.IActor = {
                    actorType: POGGameEngineBase.ActorType.GoodGuy,
                    value: this.randomNumberGeneration(members[num][0] as number, members[num][1] as number, multipleof),
                    spriteType: this.stateLevelJSONBlock["goodGuyTypes"][0],
                    cacheKey: "",
                    width: 0,
                    benchWidth:0,
                    id:"",
                    decimalPosition:0
                }
                this.factors2.push(actor);
                 }                
                    
            });
        this.calculateUnknown();

    }


    /**
     * This method will be used to calculate correct answer based on generated factors
     */
    calculateUnknown() {

        // Variable used to store Factor's value'
        let factor1TotalValue: number = 0;
        let factor2TotalValue: number = 0;

        // Calculating Factor 1 total value
        let factor1ValueCounter = this.factors1.forEach((factor1val: any) => {
            factor1TotalValue = factor1val.value + factor1TotalValue;
        });

        // Calculating Factor 2 total value
        let factor2ValueCounter = this.factors2.forEach((factor2val: any) => {
            factor2TotalValue = factor2val.value + factor2TotalValue;
        });



        // Calculating Unknown Answer
        this.unknownAnswer = factor1TotalValue - factor2TotalValue;
        if(this.unknownAnswer < this.stateLevelJSONBlock["unknown"][0] || this.unknownAnswer > this.stateLevelJSONBlock["unknown"][1]){
            this.setupFactors();
        }else if(this.stateLevelJSONBlock["unknown"][2] !== undefined){
            if(this.unknownAnswer % this.stateLevelJSONBlock["unknown"][2]["multiple"] !== 0)
             this.setupFactors();
        }

    }



}