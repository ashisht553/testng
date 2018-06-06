
import { DPO } from "../../shared/engine/dpo";
import { GameUserData } from "../../shared/engine/game.user.data.service";
export namespace Annots {

    export interface IDataPersistance {
        _initDP(appShortName: string): void;
    }
    declare var cas: any;
    declare var annService: any;
    export class AnnotationService implements IDataPersistance {
        uniqueId: string;
        dpStorageId: string = "";
        annotationId: any;
        casStarted: boolean;
        casInitiated: boolean;
        dpTimeStamp: string;
        dpLastAction: string;
        dpLastRecord: any = [];
        dpUserid: string;
        usrInfo: any;
        param:any;
        
        /**
         * this property have the user data interface having all the information
         * related to user's current game 
         */
        gameUserData: GameUserData.IGameUserData;

        /**
         * this property have the user data service object help to get and set the
         * user game information 
         */
        gameUserDataService: GameUserData.gameUserDataService;

        /**
         * this property holds the instance of the class from where the Service
         * is being called
         */
        gameInstance: any;
        /**
         * baseUserData @param the initial base object having values
         * updated from data json and server information need to be 
         * updated in this service 
         * most of the feilds are empty which going to be populated
         * in this service call back function
         */
        constructor(baseUserData: GameUserData.IGameUserData, userDataService: GameUserData.gameUserDataService,param:{}) {
            let self = this;
            this.param = param;
            this.gameUserData = baseUserData;
            //console.log(">>>>>>>>>>>>> ",userService)
            this.gameUserDataService = userDataService
            // this.dpoBaseObject = dpoBaseObject;
            this.dpLastAction = null;
            this.usrInfo = {
                userid: '',
                userName: '',
                usrRole: ''
            };
            if(this.gameUserDataService && this.gameUserDataService.gameInstance && this.gameUserDataService.gameInstance.urlParams && !this.gameUserDataService.gameInstance.urlParams.forceload){
                this._initDP();
            }else{
                console.log('DP is disabled using param forceload');
                this.startGame();
            }
        }
        /**
         * this method is start the game
         * @method startGame
         */
        startGame(){
            this.gameUserDataService.callBackMethod(this.gameUserData, false);
        }
        /**
         * this method is called when CAS recived the user information and updating the 
         * same in the {gameUserData} before fetching the game information from the service
         * @param {userInfo}  user information retrieved from the service
         * @param {casStarted}  cas service status checking if its started or not
         */
        updateGameUserData(userInfo: any, casStarted: boolean) {
            console.log("update Game User Data funciton ", userInfo);
            /**
             * if cas started updating user data and fetching the stored _data
             * from the service
             */
            if (casStarted) {
                this.gameUserData.userId = userInfo.userid;
                this.gameUserData.mode = userInfo.usrRole;
                this.gameUserData.userName = userInfo.userName;
                this._fetchUserDataFromCAS(this.gameUserData);
            } else {
                /**
                 * when cas is not started allowing game to load using the inline URL parameter
                 * forceload=true or by clicking OK on confirmation box
                 */
                let confirmBox;
                if (!this.gameUserDataService.gameInstance.urlParams.forceload) {
                    confirmBox = confirm(this.param.cas_alert);
                }
                if (this.gameUserDataService.gameInstance.urlParams.forceload || confirmBox){
                    this.gameUserDataService.callBackMethod(this.gameUserData, false);
                }
            }
        }

        /**
         * This method will initialize the CAS service and fetch the stored information
         * of the user for the current game
         */
        _initDP() {
            var self = this;
            /**
             * If cas not equal to undefined
             */

            if (cas !== undefined) {
                /**
                 * Create instance for cas object
                 */
                cas = new cas();
                /**
                 * Initialise cas
                 */
                //  alert(cas.isCasAvailable);
                cas.init();
                //   cas.initCasService();

                /**
                 * Set cas starts status as 'false'
                 */
                this.casStarted = false;
                this.casInitiated = true;
                var self = this;
                var count = 0;
                var clock = setInterval(function () {
                    count++;
                    if (self.casStarted) {
                        clearInterval(clock);
                        console.log("Service started");
                    } else if (count === 50) {
                        clearInterval(clock);
                        console.log("Service not started");
                        /**
                         * setting back the default user data object as it comes 
                         * from the user data service
                         */
                        self.updateGameUserData(self.gameUserData, self.casStarted);
                    }
                }, 100);

                /**
                 * calling the CAS service to retrieve the user game data
                 */
                this.getUserInfoFromCAS().then(function (data: any) {
                    self.updateGameUserData(data, self.casStarted);
                }, function (err) {
                    console.log(err);
                });

            }
        }
        /**
         * saving the user data 
         * @param {data}  type of GameUserData.IGameUserData 
         * 
         */
        saveData(data: GameUserData.IGameUserData) {
            var self = this;

            var self = this;
            var obj: any = {};
            let _data = data
            /**
             * data is array..add this to this.gameUserData and save it
             */

            if (this.annotationId !== null && this.annotationId !== undefined) {
                obj.annotation_id = parseInt(this.annotationId);
                
                obj.data = JSON.stringify(_data);

            } else {
                obj.data = JSON.stringify(_data);
                obj.body_text = this.dpStorageId;
            }
            console.log("Stringyfy JSON   ", JSON.stringify(_data));
            console.log("checking self.casStarted  ", self.casStarted)
           if (self.casStarted) {
                cas.set({
                    'data': obj,
                    success: function (res: any) {
                        if (res.ACTION === 'created') {
                            self.annotationId = res.RESULT.annotation_id;
                        }
                        console.log("Successfully saved, Action Type = ", res.ACTION, obj, self.gameUserDataService);
                        self.gameUserData = JSON.parse(obj.data)
                        self.gameUserDataService.callBackMethod(self.gameUserData, true)
                    },

                    fail: function (res: any) {
                        console.log("fail", res);
                    }
                });
            } else {
                self.gameUserDataService.callBackMethod(data, false);
            }
        }

        updateDPOBaseObject(gameInfo: any, success?: boolean) {
            this.gameUserDataService.callBackMethod(this.gameUserData, success);
        }
        getUserInfoFromCAS() {
            var self = this;

            var promiseObj = new Promise(function (resolve, reject) {
                cas.getRole({
                    'data': {},
                    success: function (res: any): any {
                        var tokenString = res.RESULT;

                        var base64Url = tokenString.split('.')[1];
                        var base64 = base64Url.replace('-', '+').replace('_', '/');

                        var obj = JSON.parse(window.atob(base64));
                        //username detail string
                        var username = obj['sub'].replace("=", "/");
                        username = username.split(",")[0].split("/")[1];
                        var userid = obj['sub'].replace("=", "/").split(",")[1].split("=")[1];
                        //  console.log(obj['sub'].replace("=", "/").split(",")[1].split("=")[1]);
                        self.usrInfo.userName = username;
                        self.usrInfo.userid = userid;
                        var userRole = obj["http://www.imsglobal.org/imspurl/lis/v1/vocab/person"][0];

                        if (userRole.includes("[")) {
                            userRole = userRole.split(/[[\d\]]/);
                            userRole = userRole[1].split(",");
                            userRole = userRole[0];
                        }

                        self.usrInfo.usrRole = userRole;
                        self.casStarted = true;

                        self.dpUserid = self.usrInfo.userid;
                        resolve(self.usrInfo);


                    }, fail: function (res: any): any {
                        console.log("fail", res);
                        reject(res);
                    }

                });



            });

            //   this._retriveRequiredDataFromDP(appUniqueId);

            return promiseObj;
        }



        _fetchUserDataFromCAS(appUniqueId: GameUserData.IGameUserData) {
            // alert("retrieve");
            var lastRecord: any = [];
            /**
             * Set 'this' to thiS variable
             */
            var self = this;

            /**
             * Represents the retrive data method.
             * @method cas.get
             * @param {Object} data, success, fail
             */

            this.dpStorageId = appUniqueId.userId + "_" + appUniqueId.mode + "_" + appUniqueId.GameInfo["gameGuid"] + "_" + appUniqueId.GameInfo["grade"];

            cas.get({
                /**
                 * Set appUniqueId in 'data'
                 */

                'data': { body_text: self.dpStorageId },
                /**
                 * If get method success, then
                 */
                success: function (res: any): any {

                    if (res.RESULT.length == 0) {
                        self.updateDPOBaseObject(null, true);
                    } else {
                        self.annotationId = res.RESULT.annotation_id;
                        self.dpLastRecord = res.RESULT.data;
                        let data = JSON.parse(res.RESULT.data)
                        self.gameUserData = <GameUserData.IGameUserData> JSON.parse(res.RESULT.data);
                        self.updateDPOBaseObject(self.gameUserData, true);

                    }


                }, fail: function (res: any): any {
                    self.annotationId = null;
                    self.casStarted = true;
                    self.updateDPOBaseObject(self.gameUserData, false);
                }
            });
          
        }


    }
}
