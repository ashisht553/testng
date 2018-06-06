import {Annots} from "../../shared/engine/annotation.service";
/**
 * This namespace contains all features including interfaces, types and base class that 
 * we will use to store the information about user interaction
 */

export namespace UserData{
    /**
     * this interface to hold the user level completion information
     * 
     */
    export interface userLevelInfo{
        /**
         * interface hold the oject model to store the level information
         * 
         * @id : this will hold level id e.g. POGK-01
         * @index : index position of the object in data JSON
         * @completed : hold the completion status for the level (true|false)
         * @attemptCount : number of attempts taken by the user to complete the level
         * @correctAttemptCount : number of correct attempts by the user
         * @parentID : parent ID of the level from JSON
         * 
         */
        id:string,
        index:number,
        stars:number,
        points:number,
        completed:boolean,
        attemptCount:number,
        correctAttemptCount:number,
        parentID:string
    }
    
    /**
     * The class will act as a service to save and retrieve the user's 
     * level completion information
     */
     declare var annService: any;
    export class UserLevelInfo{
        userLevelInfoData:Array<userLevelInfo>;
        objectByID:any;
        AnnotationService:Annots.AnnotationService;
        /**
         * initializing the level information object
         */
        constructor(arr:any){
            this.userLevelInfoData = arr;
            //this.AnnotationService = new Annots.AnnotationService();
        }
        
        /**
         * method to retrieve complete user level information
         * object 
         */
        getUserLevelData():Array<userLevelInfo>{
            console.log("get user data called");
            return this.userLevelInfoData;
        }

        /**
         *  set the user level information in the userLevelData object
         *  @param {userLevelData}  array having userLevelInfo object(s)
         *  user data will persist at session level
         */
        setUserLevelData(userLevelData:Array<userLevelInfo>){
            console.log("set user data called");
            let self = this;
            this.userLevelInfoData = userLevelData;
            /*this.AnnotationService.findLastRecord1().then(function(data){
                 self.AnnotationService.createAnnotRecord(self.userLevelInfoData);
            },function(err){
                console.log(err);
            });*/
        //    this.AnnotationService.createAnnotRecord(this.userLevelInfoData);
        }
        /**
         * Method to reaturn to learner's level object equal to one of it property
         * @param {levelID}  level id of the level
         * @param {prop}  optional param that is the name of the property that need 
         * to be retrieve from the object
         * @return {userLevelInfo}  array OR {userLevelInfo}{prop} eg. ["POGK-01"]["completed"] = true
         */
        getLevelObjectByID(levelID:string,prop?:string):any{

             this.objectByID = null;
             let dataFound = false;
             for(let i=0;i<this.userLevelInfoData.length;i++){
                if(this.userLevelInfoData[i] !== null && this.userLevelInfoData[i] !== undefined){
                    if(this.userLevelInfoData[i].id === levelID){
                        dataFound = true;
                        this.objectByID = this.userLevelInfoData[i];
                        break;
                    }
                }
             }

            if(dataFound){
                if(prop !== undefined){
                        if(this.objectByID !== null){
                            return this.objectByID[prop];
                        }
                        return false;
                    }else{
                         if(this.objectByID !== null){
                            return this.objectByID;
                         }else{
                             return false;
                         }
                    }
            }

        }  
    }

}
