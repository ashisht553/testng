import { DPO } from "../../shared/engine/dpo"
import { Annots } from "../../shared/engine/annotation.service";

export namespace GameUserData {

    export interface IGameUserData extends DPO.IDPOBaseObject {
        userName: string;
    }

    /**
     * interface for user data service 
     * setter and getter method for game level information
     */
    export interface IGameUserDataService {
        getGameUserData(): Array<DPO.ILevelInfo>;
        saveGameUserData(data: Array<DPO.ILevelInfo>, game: Phaser.State): void
    }

    export class gameUserDataService implements IGameUserDataService {
        annotationService: Annots.AnnotationService;
        gameInstance: any;
        gameUserData: IGameUserData;
        assignmentMode:number = -1;
        paramObject:any;

        constructor(param:any) {
            this.paramObject = param;
            this.assignmentMode = window.location.href.toLowerCase().indexOf("assignment");
        }

        /**
         * This function will retrieve the data from the Annotation/CAS service
         * and return the levelInfo to the caller
         */
        getGameUserData(): Array<DPO.ILevelInfo> {
            /**
             * returning the level information
             */
            console.log("........ levelInfos 1 ........", this.gameUserData);
            return this.gameUserData.GameInfo.levelInfos; 
        }

        /**
         * this function saves the game level information for the user
         * @param {levelInfos}  this is the array of type DOP.ILevelInfo that
         * holds the information regarding the level's status
         * @param {Phaser.State}  this value we pass to setup the call back method 
         * from the user data service that allow us to sends back the success of failure message
         */

        saveGameUserData(levelInfos: Array<DPO.ILevelInfo>, game: Phaser.State): void {

            /**
             * setting the state from where the call has been generated
             */
            if (game !== undefined || game !== null)
                this.gameInstance = game;

            /**
             * updating the level information from the game 
             * to the base object
             */
            this.gameUserData.GameInfo.levelInfos = levelInfos;
            console.log("........ levelInfos 1 ........", levelInfos);
            /**
             * sending the base object to the service to be saved 
             * to the database through CAS service
             */

            console.log("Saving Data In User Service", this.gameUserData)
            if(this.assignmentMode === -1){
                this.annotationService.saveData(this.gameUserData);
            }else{
                this.callBackMethod(this.gameUserData,false); 
            }


        }


        /**
         * function that will clear all the saved level information
         * just for developer purpose
         */
        private clearUserData() {
            if (this.gameInstance.urlParams.cleardata)
                this.gameUserData.GameInfo.levelInfos = [];
            
            if(this.assignmentMode === -1){
                this.annotationService.saveData(this.gameUserData);
            }else{
               this.callBackMethod(this.gameUserData,false); 
            }
        }


        /**
         * This function will be called by the game component to initialize the IDPOGetObject
         * game component will pass the data json to the Annotation/CAS service
         * @param {data}  this is the data JSON loaded by game component for generating 
         * Dynamic Menu
         */
        private constructGameUserData(data: any): IGameUserData {
            this.gameUserData = {
                mode: "",
                userId: "",
                userName: "",
                GameInfo: {
                    isbn: data.isbn,
                    gameGuid: data.GameGuid,
                    grade: data.grade,
                    gameName: data.gameName,
                    levelInfos: [
                        {
                            levelId: "",
                            completed: false,
                            awardInfo: {
                                score: 0,
                                stars: 0
                            }
                        }
                    ]

                }
            }
            console.log("........ levelInfos 2 ........", this.gameUserData);
            return this.gameUserData;
        }
        /**
         * Initializing the construction the base structure for user data object
         * @param {json}  this is grade level data json 
         * @param {game}  this is the instance of the game from where this call is initiated
         */
        initGameUserDataServiceCall(json: any, game: any) {
            this.gameInstance = game;
            this.gameUserData = this.constructGameUserData(json);
            /**
             * initializing the annotation service passing 
             */
            if(this.assignmentMode === -1){
                this.annotationService = new Annots.AnnotationService(this.gameUserData, this,this.paramObject);
            }else{
                this.callBackMethod(this.gameUserData,false);
            }
        }
        /**
         * this method will be called back by the cas service when the user data is 
         * retrieved from the service 
         * @param {gameInfoObject}  this object will have the updated status of the user
         * information currently logged in
         */
        callBackMethod(gameInfoObject: IGameUserData, success?: boolean) {
            this.gameUserData = gameInfoObject;

            /**
             * temporary setting of user data
             * 
             */
            /*  this.gameUserData = {"mode":"student","userId":"","userName":"","GameInfo":{"isbn":"games_9781328668219_","gameGuid":"POGK-1491210472820","grade":"gk","gameName":"POG","levelInfos":[{"levelId":"POGK-01","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-01-01","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-02","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-03","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-05","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-06","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-07","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-08","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-09","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-10","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-10-01","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-10-02","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-10-03","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-11","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-12","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-15","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-16","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-17","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-18","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-19","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-20","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-21","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-22","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-23","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-24","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-25","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-26","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-27","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-28","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-29","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-30","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-31","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-32","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-33","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-34","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-35","completed":true,"awardInfo":{"score":0,"stars":0}},{"levelId":"POGK-36","completed":true,"awardInfo":{"score":0,"stars":0}}]}}*/

            if (this.gameInstance !== undefined)
                this.gameInstance.userDataServiceCallBack(this.gameUserData, success);
        }

        /**
         * Method to reaturn to learner's level object equal to one of it property
         * @param {levelID}  level id of the level
         * @param {prop}  optional param that is the name of the property that need 
         * to be retrieve from the object
         * @return {userLevelInfo}  array OR {userLevelInfo}{prop} eg. ["POGK-01"]["completed"] = true
         */
        getLevelObjectByID(levelID: string, prop?: string): any {
            let objectByID: any = null;
            let dataFound = false;
            /**
             * storing all the level info in the local variable
             */
            let levelInfo = this.gameUserData.GameInfo.levelInfos;

            for (let i = 0; i < levelInfo.length; i++) {
                if (levelInfo[i] !== null && levelInfo[i] !== undefined) {
                    if (levelInfo[i].levelId === levelID) {
                        dataFound = true;
                        objectByID = levelInfo[i];
                        break;
                    }
                }
            }
            /**
             * if the required level found based on the levelid passed as parameter
             * looking for the prop param, if defined then sends back the value of the
             * prop else return the level object as a whole
             */
            if (dataFound) {
                if (prop !== undefined) {
                    if (objectByID !== null) {
                        return objectByID[prop];
                    }
                    return false;
                } else {
                    if (objectByID !== null) {
                        return objectByID;
                    } else {
                        return false;
                    }
                }
            }

        }

    }
}