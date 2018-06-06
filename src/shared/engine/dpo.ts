export namespace DPO {
    export interface IAwardInfo {
        score: number;
        stars: number;
    }
    export interface ILevelInfo {
        levelId: string,
        completed: Boolean,
        awardInfo: IAwardInfo
    }
    export interface IGameInfo {
        isbn: string;
        gameGuid: string;
        grade: string;
        gameName:string;
        levelInfos: Array<ILevelInfo>
    }

    export interface IDPOBaseObject {
        mode: string;
        userId: string;       
        GameInfo: IGameInfo
    }

}




// get(obj: IDPOGetObject) : IDPOBaseObject

/*
var DPOBaseGet = {
    mode: "freePlay",
    userID: "johnxu",
    currentPlayingGameInfo :{
        isbn: "games_9781328668219_",
        gameGuid: "7affa6b5-19e1-4146-9e8f-a020acfe17f2",
        grade: "g3",
        levelInfos: [
            {
                levelId: "FM-G3-01",
                completed: true,
                awardInfo : null
            },
            {
                levelId: "FM-G3-02",
                completed: true,
                awardInfo : {
                    score: 100,
                    stars:1
                }
            },
            {
                levelId: "FM-G3-03",
                completed: true;
                awardInfo : {
                    score: 100,
                    stars:1
                }
            },
            {
                levelId: "FM-G3-04",
                completed: true;
                awardInfo : {
                    score: 200,
                    stars:4
                }
            }
        ]
    }
}

//save()
var DPOBaseSave = {
    mode: "freePlay",
    userID: "johnxu",
    currentPlayingGameInfo :{
        isbn: "games_9781328668219_",
        gameGuid: "7affa6b5-19e1-4146-9e8f-a020acfe17f2",
        grade: "g3",
        levelInfos: [
            {
                levelId: "POGK-02",
                completed: true,
                index:0,
                parentID:"POGK-01"
                awardInfo : {
                    score: 200,
                    star:  2  
                }
            }
        ]
    }
}
*/