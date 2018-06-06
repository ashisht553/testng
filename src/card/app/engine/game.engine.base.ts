export namespace GameEngineBase{
    class Actor {
        id: string;
        name: string;
        uiElement: any;
    }
    
    export class GoodGuy extends Actor {
        type: number;
        benchPositionIndex: number;
        fieldPositionIndex: number;
        isInfinite: boolean;
        decimalPosition: number;
        value: number;
    }

    export class BadGuy extends Actor {
        decimalPosition: number;
        type: number;
        value: any;
    }

    class ScoreBoard {
        attempts: number;
        score: number;
        time: Date;
    }

    
     export class EngineBase {
         data:any;
         constructor(jsonData: any) {
             this.data=jsonData;
             
            
        }
     }
     
}