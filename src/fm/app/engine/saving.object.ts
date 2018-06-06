export namespace SavingObject {
    /**
     * Contains Player Information
     */
    export interface IPlayerInfo {
        sessionId: string;
        name: string;
        type: string;
    }

    /**
     * Contains Game Information
     */
    export interface IGameInfo {
        gameGUID: string;
        grade: string;
    }

    export interface ILevelInfo {
        score: number;
        stars: number;
    }

    export class FMSavingObject {
        userInfo: IPlayerInfo;
        gameInfo: IGameInfo;
        levelInfo: Array<ILevelInfo>;

        constructor(jsonString: string) {
            let data = JSON.parse(jsonString);
            this.userInfo = data.userInfo;
            this.gameInfo = data.gameInfo;
            this.levelInfo = data.levelInfo;
        }

        update(levelId: number, levelInfo: ILevelInfo) {
            this.levelInfo[levelId] = levelInfo;
        }
    }
}
