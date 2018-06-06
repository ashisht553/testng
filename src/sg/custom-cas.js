(function(window){
    'use strict';
    function define_cas(){
        var cas = function(){
            var cascallQueue, user, contentId, casInitObj, serviceInitialized, serviceRunning, currentCasObj, currentCasMethod, currentCasQueueId, isProdEnv, browserUrl, CAS_CONSTANTS, initCasService, isCasAvailable, chkCasCredential,
                checkCasAvailable, next, thiS, SETTINGS, fetchFromCas, resetAndDoNext, addOrUpdateToCas;
            
            this.serviceInitialized = false;
            this.serviceRunning = false;
            this.currentCasObj = null;
            this.currentCasMethod = null;
            this.currentCasQueueId = null;
            this.isProdEnv = false;
            this.browserUrl = window.location.href.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
            this.isCasAvailable = false,
            this.chkCasCredential = '';
            thiS = this;
            
             if(/\.hrw\.com$/i.test(this.browserUrl[1]) || /\.thinkcentral\.com$/i.test(this.browserUrl[1]) ) {//if this is prod, then it will not take any default user credential
              console.log("It is prod");
                this.isProdEnv = true;
            }
            this.SETTINGS = {//Static object, used accross the lib
                EVENT_SETTINGS: {
                    EVENT_TOPICS: {
                        RESPONSE_EVENT: 'CAS Integration - Response !!',
                        REQUEST_EVENT: 'CAS Integration - Request !!'
                    },
                    ACTIONS: {
                        ADD: 'created',
                        UPDATE: 'updated',
                        FETCH: 'fetch',
                        DELETE: 'remove',
                        USER:'user'
                    },
                    SAVE_TYPES: {
                        SET: 'set',
                        FILE: 'file'
                    },
                    ANNOTATION_TYPES: {//Type of annotataions
                        "BOOKMARK": 1,
                        "HIGHLIGHT": 2,
                        "STATIC_NOTE": 3,
                        "INTERACTIVE_NOTE": 4,
                        "TEACHER_COMMENT": 7,
                        "AUTOMATED_BOOKMARK": 8,
                        "EBOOK_ANSWER": 9,
                        "STUDENT_COVER_NOTE": 10,
                        "TEACHER_COVER_NOTE": 11,
                        "GO_NOTE": 12,
                        "MAPS_WIZARD": 13
                    },
                },
                METHOD_TYPES: {
                    SET: "set",//create/update annotation data
                    GET: "get",//get annotation data
                    DELETE: "remove",//remove Annotation_id
                    UPLOAD: "upload",//upload image amazon server
                    DOWNLOAD: "download",//download image link
                    UNLINK: "unlink",//delete image
                    USER:"userDetail"
                },
                RESULT_TYPES: {
                    SUCCESSS: "success",
                    FAIL: "fail"
                },
                IDS: {
                    CAS_QUEUE: "casqueue"//If multi CAS request, this this release one after other
                },
                CAS_FIELDS: {
                    DEFAULTS: {
                        "object_id": "",//Request uuid "String 32"
                        "content_id": "",//"String 32"
                    }
                }
            };
            this.CAS_CONSTANTS = {//CAS request static object
                "GO_NOTE_TYPE": 9,
                "UserDetails": {//Dafault user cookie
                    "users": ["NBTEACHER1", "NBSTUDENT1", "NBSTUDENT2"],
                    "NBTEACHER1": {
                        "token": "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJodHRwOi8vd3d3LmhtaGNvLmNvbSIsImlzcyI6Imh0dHBzOi8vbXkuaHJ3LmNvbSIsIm5iZiI6MTQ1MzM2MTA4MiwiZXhwIjoxNDU2ODE3MDgyLCJzdWIiOiJjbj1OQlRFQUNIRVIxLHVpZD1OQlRFQUNIRVIxLHVuaXF1ZUlkZW50aWZpZXI9TkJURUFDSEVSMSxvPXVuZGVmaW5lZCxkYz11bmRlZmluZWQsc3Q9Z2EiLCJQbGF0Zm9ybUlkIjoiSE1PRiIsImh0dHA6Ly93d3cuaW1zZ2xvYmFsLm9yZy9pbXNwdXJsL2xpcy92MS92b2NhYi9wZXJzb24iOlsiW0luc3RydWN0b3JdIiwiW0FkbWluaXN0cmF0b3JdIl19.XKBRj3gfmP1nT1Rox_NQQdRXDTSENUIa_fDJPzECnCM",
                        "role": "Instructor"
                    },
                    "NBSTUDENT1": {
                        "token": "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJodHRwOi8vd3d3LmhtaGNvLmNvbSIsImlzcyI6Imh0dHBzOi8vbXkuaHJ3LmNvbSIsIm5iZiI6MTQ1MzM2MTEyNCwiZXhwIjoxNDU2ODE3MTI0LCJzdWIiOiJjbj1OQlNUVURFTlQxLHVpZD1OQlNUVURFTlQxLHVuaXF1ZUlkZW50aWZpZXI9TkJTVFVERU5UMSxvPXVuZGVmaW5lZCxkYz11bmRlZmluZWQsc3Q9Z2EiLCJQbGF0Zm9ybUlkIjoiSE1PRiIsImh0dHA6Ly93d3cuaW1zZ2xvYmFsLm9yZy9pbXNwdXJsL2xpcy92MS92b2NhYi9wZXJzb24iOlsiW1N0dWRlbnRdIl19.nAKyKQUrXWF_PM1CRM0c0FnvYM6jvyBa4LFhYArLBN8",
                        "role": "Student"
                    },
                    "NBSTUDENT2": {
                        "token": "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJodHRwOi8vd3d3LmhtaGNvLmNvbSIsImlzcyI6Imh0dHBzOi8vbXktcmV2aWV3LWNlcnQuaHJ3LmNvbSIsIm5iZiI6MTQ3NDkwMTM4OCwiZXhwIjoxNTA2MDA1Mzg4LCJzdWIiOiJjbj1OQlNUVURFTlQyLHVpZD1OQlNUVURFTlQyLHVuaXF1ZUlkZW50aWZpZXI9TkJTVFVERU5UMixvPXVuZGVmaW5lZCxkYz11bmRlZmluZWQsc3Q9Z2EiLCJQbGF0Zm9ybUlkIjoiSE1PRiIsImh0dHA6Ly93d3cuaW1zZ2xvYmFsLm9yZy9pbXNwdXJsL2xpcy92MS92b2NhYi9wZXJzb24iOlsiW1N0dWRlbnRdIl19.3XUhyRQzQMLlIWKJTbosWDKrNzQ4qi7FV6kJDNLPcbM",
                        "role": "Student"
                    }
                },
                "fields": ['annotation_id', 'title', 'body_text', 'type_id', 'data', "content_id"],//valid object key for cas call
                "visibility": "MX",
                "contentId": "MX2018",//Here we are adding default content id
                "annotatioServiceInit": {
                    "production": this.isProdEnv,
                    "server_url": "//dubv-dpqaweb01.dubeng.local/",
                    "initDefaults": {
                        "clientId": "MX",
                        "usePostTunneling": false,
                        "cors": true,
                        "requestTimeout": 20000,
                        "forceDefaultServiceSettings": false,
                        "nextLinkDomainStripping": true
                    }
                }
            };
            this.checkCasAvailable = function(callback){
                annService.testHeartbeat({successHandler: function(data) {
                    thiS.isCasAvailable = true;
                    callback.call();
                }, errorHandler: function(data) {
                    thiS.chkCasCredential = data;
                    thiS.isCasAvailable = false;
                    console.warn('cas is not available');
                }});
            }
            this.resetAndDoNext = function(){
                thiS.currentCasObj = null;
                thiS.currentCasMethod = null;
                thiS.currentCasQueueId = null;
                thiS.serviceRunning = false;
                thiS.next();
            }
            this.mergeObjects = function(obj_a,obj_b){
                for(var p in obj_a){
                    if(obj_a[p] === undefined || obj_a[p] === null){
                        delete obj_a[p];
                    }
                }
                for(var p in obj_b){
                    if(obj_b[p] === undefined || obj_b[p] === null){
                        delete obj_b[p]
                    }else{
                        obj_a[p] = obj_b[p];
                    }
                }
                return obj_a;
            }
            this.casCallbackHandler = function(resultType, action, result, forceFail){
                if(thiS.currentCasObj){
                    result = result && result instanceof Array && result.length == 1 ? result[0] : result;
                    if(resultType == thiS.SETTINGS.RESULT_TYPES.SUCCESSS && thiS.currentCasObj[resultType]){
                        thiS.currentCasObj[resultType]({ACTION: action, RESULT: result});
                    }else if(forceFail){
                        if(thiS.currentCasObj[resultType]){
                            thiS.currentCasObj[resultType]({ACTION: action, RESULT: result});
                        }
                    }else if(resultType == thiS.SETTINGS.RESULT_TYPES.FAIL){//if request is failed from CAS server
                        thiS.checkCasAvailable(function(result){
                            if(result){
                                if(thiS.currentCasObj[resultType]){
                                    thiS.currentCasObj[resultType]({ACTION: action, RESULT: result});
                                }
                            }else{
                                thiS.cascallQueue.add({
                                    method: thiS.currentCasMethod,
                                    data: thiS.currentCasObj
                                }, thiS.currentCasQueueId);
                            }
                            thiS.resetAndDoNext();//it will reset all param and go for next queue
                        });
                        return;
                    }
                }
                thiS.resetAndDoNext();
            }
            this.fetchFromCas = function(){
                thiS.serviceRunning = true;
                if(thiS.currentCasObj.data == null){
                    thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, null);
                }else if(typeof(thiS.currentCasObj.data) === 'string'){//while we are trying search by title or desc
                    try{
                        annService.Annotations.findAllAnnotationsByText(thiS.currentCasObj.data).done(function(result){
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.SUCCESSS, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, result);
                        }).fail(function() {
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, null);
                        }).run();
                    }catch(e){
                        thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, null, true);
                    }
                }else if(typeof(thiS.currentCasObj.data) === 'number'){//while we are trying to search with number such as "Anotation_id"
                    try{
                        annService.Annotations.findOne(thiS.currentCasObj.data).done(function(result) {
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.SUCCESSS, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, result);
                        }).fail(function() {
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, null);
                        }).run();
                    }catch(e){
                        thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, null, true);
                    }
                } else if(typeof (thiS.currentCasObj.data) === 'object'){//while we trying to search with multiple param, "Title", "l3" & "l5"
                    try{
                        annService.Annotations.find(thiS.currentCasObj.data).done(function(result){
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.SUCCESSS, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, result);
                        }).fail(function(){
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, null);
                        }).run();
                    }catch(e){
                        thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.FETCH, null, true);
                    }
                }
            }
            this.addOrUpdateToCas = function(){
                 var reqObj = {},
                    visibilityArr = ['eBook', 'Notebook'], //By default setting visibility in both env or when checkbox is checked
                    hiddenArr = []; //By default both env are visible or when checkbox is checked
                thiS.serviceRunning = true;
                if((thiS.currentCasObj.data.annotation_id === null && thiS.currentCasObj.annotation_id === null) || (thiS.currentCasObj.annotation_id === '' && thiS.currentCasObj.data.annotation_id === '') || (thiS.currentCasObj.annotation_id === undefined && thiS.currentCasObj.data.annotation_id === undefined)) {//Requeest for new creation
                    reqObj = {
                        $visibility: thiS.CAS_CONSTANTS.$visibility,
                        content_id: thiS.CAS_CONSTANTS.contentId
                    };
                    if((thiS.currentCasObj.data.content_id !== null) && (thiS.currentCasObj.data.content_id !== '') && (thiS.currentCasObj.data.content_id !== undefined)) {
                        reqObj.content_id = currentCasObj.data.content_id;
                    }
                    if((thiS.currentCasObj.data.custom_annotation_type !== null) && (thiS.currentCasObj.data.custom_annotation_type !== '') && (thiS.currentCasObj.data.custom_annotation_type !== undefined)) {//if annotation type is come with request
                        reqObj.type_id = thiS.SETTINGS.EVENT_SETTINGS.ANNOTATION_TYPES[thiS.currentCasObj.data.custom_annotation_type];//Update the annotation type
                    }else{
                        reqObj.type_id = thiS.CAS_CONSTANTS.GO_NOTE_TYPE;//else set to default 12
                    }
                    thiS.mergeObjects(reqObj,thiS.currentCasObj.data);
                    delete reqObj.annotation_id;
                    delete reqObj.custom_annotation_type;
                    delete reqObj.visibility_id; //Remove visibility_id before cas call
                    try{
                        annService.Annotations.create(reqObj).done(function(result) {//Request for create new object with requested data
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.SUCCESSS, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.ADD, result);
                        }).fail(function() {
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.ADD, null);
                        }).run();
                    }catch(e){
                        thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.ADD, null, true);
                    }
                } else {//If request for update annotation
                    var annotation_id = parseInt(thiS.currentCasObj.data.annotation_id);//get annotation id from Requested object (from widget)
                    delete thiS.currentCasObj.data.annotation_id;
                    thiS.mergeObjects(reqObj,thiS.currentCasObj.data);
                    
                    if((thiS.currentCasObj.data.content_id !== null) && (thiS.currentCasObj.data.content_id !== '') && (thiS.currentCasObj.data.content_id !== undefined)) {
                        reqObj.content_id = thiS.currentCasObj.data.content_id;
                    }
                    if((reqObj.custom_annotation_type !== null) && (reqObj.custom_annotation_type !== '') && (reqObj.custom_annotation_type !== undefined)) {
                        reqObj.type_id = thiS.SETTINGS.EVENT_SETTINGS.ANNOTATION_TYPES[reqObj.custom_annotation_type];//Update the annotation type
                    }else{
                        reqObj.type_id = thiS.CAS_CONSTANTS.GO_NOTE_TYPE;//else set to default 12
                    }
                    if(reqObj.visibility_id === 0){ //When checkbox is unchecked
                        visibilityArr = ['eBook']; //Data visible in eBook
                        hiddenArr = ['Notebook']; //Datat hidden in Notebook
                    }
                    delete reqObj.custom_annotation_type;
                    delete reqObj.type_id;//Code: API_ERR_QUERY_API_11 Message: Annotations: type_id field is not allowed in update operation, Help page: http://dubconf.hmhpub.com:8080/display/DP2/Error+handling#Errorhandling-API_ERR_QUERY_API_11
                    delete reqObj.visibility_id; //Remove visibility_id before cas call
                    try{
                        annService.Annotations.update(annotation_id, reqObj).forVisibility(0).visibilityInclude(visibilityArr).visibilityExclude(hiddenArr).done(function(result) {//Request for create new object with requested data and annotation_id
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.SUCCESSS, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.UPDATE, null);
                        }).fail(function() {
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.UPDATE, null);
                        }).run();
                    }catch(e){
                        thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.UPDATE, null, true);
                    }
                }
            }
            this.deleteCasObj = function(){
                if ((thiS.currentCasObj.data.annotation_id !== null) && (thiS.currentCasObj.data.annotation_id !== '') && (thiS.currentCasObj.data.annotation_id !== undefined)){
                    try{
                        annService.Annotations.remove(thiS.currentCasObj.data.annotation_id).done(function(result) {//request for delete annothation with annotation_id as parameter
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.SUCCESSS, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.DELETE, result);
                        }).fail(function() {
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.DELETE, null);
                        }).run();
                    }catch(e){
                        thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.DELETE, null, true);
                    }
                }else{
                    thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.DELETE, null);
                }
            }
            function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length == 2) return parts.pop().split(";").shift();
            }

            this.getUserDetails = function(){
                if (typeof(thiS.currentCasObj) === 'object'){
                    var result="";
                     result = annService.getToken();

                    try{
                   
                     if(result==null){
                             var token = getCookie("Authn");
							 annService.setToken(token);
							 result = annService.getToken();
							 result = String(result);
							 console.log("Token "+result);
                     }
                       
                        if(typeof(result) === 'string'){
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.SUCCESSS, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.USER, result);
                        }else{
                            thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.USER, null, true);
                        }
                    }catch(e){
                        thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.USER, null, true);
                    }
                }else{
                    thiS.casCallbackHandler(thiS.SETTINGS.RESULT_TYPES.FAIL, thiS.SETTINGS.EVENT_SETTINGS.ACTIONS.USER, null);
                }
            }
            this.next = function(){
                if(thiS.serviceRunning){
                    return;
                }else if(!thiS.isCasAvailable){
                    thiS.serviceRunning = true;
                    thiS.checkCasAvailable(function(result){
                        thiS.serviceRunning = false;
                        if(result){
                            thiS.next();
                        }
                    });
                    return;
                }
                if(thiS.cascallQueue.hasNext()){//Checking any request is there to process next
                    var obj = thiS.cascallQueue.next();
                    thiS.currentCasMethod = obj.method;
                    thiS.currentCasQueueId = obj.queueid
                    if(obj.method === thiS.SETTINGS.METHOD_TYPES.GET){//If fetch request
                        thiS.currentCasObj = obj.data;//Set Fetch Object request
                        thiS.fetchFromCas();//Call for fetching 
                    }else if(obj.method === thiS.SETTINGS.METHOD_TYPES.SET){//Request for create/update
                        thiS.currentCasObj = obj.data;
                        thiS.addOrUpdateToCas();
                    }else if(obj.method === thiS.SETTINGS.METHOD_TYPES.DELETE){//Request for remove CAS
                        thiS.currentCasObj = obj.data;
                        thiS.deleteCasObj();
                    }else if(obj.method === thiS.SETTINGS.METHOD_TYPES.USER){//Request for User Details
                        thiS.currentCasObj = obj.data;
                        thiS.getUserDetails();
                    }
                }
            }
            this.initCasService = function(){
                if(!this.serviceInitialized && !this.serviceRunning){
                    this.serviceRunning = true;
                    var thiS = this;
                    annService.init(this.casInitObj, (function(){
                        thiS.isCasAvailable = true;
                        thiS.serviceInitialized = true;
                        thiS.serviceRunning = false;
                        thiS.next();
                    }), function(e){
                        thiS.isCasAvailable = false;
                        thiS.serviceInitialized = false;
                        thiS.serviceRunning = false;
                        if(thiS.chkCasCredential !== 'HTTP request failed'){//If CAS credential fail
                            setTimeout(function(){
                                thiS.checkCasAvailable(thiS.initCasService);
                            }, 2000);
                        }
                    });
                    return false;
                }
                return true;
            }
            //this.init();
        };
        cas.prototype.init = function(){
            console.log('cas initialised' +this.CAS_CONSTANTS.annotatioServiceInit.production);
            this.user = 'NBSTUDENT2';//Default user for CAS call
            this.casInitObj = this.CAS_CONSTANTS.annotatioServiceInit.initDefaults;
            this.casInitObj["usePostTunneling"] = true;
            this.casInitObj["cors"] = true;
            if(!this.CAS_CONSTANTS.annotatioServiceInit.production) {
                this.casInitObj["serverURL"] = this.CAS_CONSTANTS.annotatioServiceInit.server_url;
                this.casInitObj["token"] = this.CAS_CONSTANTS.UserDetails[this.user].token;
         }else{
              console.log('Production');
              // this.casInitObj["serverURL"] = "//www-review-cert-tc1.thinkcentral.com/";
			   this.casInitObj["serverURL"] = "//"+document.location.hostname+"/";
			  
			   console.log( this.casInitObj);
         }
            this.cascallQueue = Queue(this.SETTINGS.IDS.CAS_QUEUE);//Initailizing QUEUE Object
			 console.log( this.casInitObj);
        }
        cas.prototype.fetch = function(obj){
            if(typeof(obj)==='object'){
                obj['data'] = {};
                this.cascallQueue.add({//Adding to CAS request Queue
                    method: "get",//Setting valid data from Static object
                    data: obj//set the requested object
                });
                if(this.initCasService()){//If CAS service is initalize
                    if (!this.serviceRunning) {//check if CAS is not running
                        this.next();//Run the next item in the QUEUE
                    }
                };
            }else{
                console.log('set callback parameter as get.fetch({success:function(res){console.log(res)}})');
            }
        }
        cas.prototype.get = function(obj){
            if(typeof(obj)==='object'){
                this.cascallQueue.add({//Adding to CAS request Queue
                    method: "get",//Setting valid data from Static object
                    data: obj//set the requested object
                });
                if(this.initCasService()){//If CAS service is initalize
                    if (!this.serviceRunning) {//check if CAS is not running
                        this.next();//Run the next item in the QUEUE
                    }
                };
            }else{
                console.log('set data and callback parameter as get.fetch({data:{annotation_id:xxxxxx},success:function(res){console.log(res)}})');
            }
        }
        cas.prototype.set = function(obj){
            if(typeof(obj)==='object'){
                this.cascallQueue.add({//Adding to CAS request Queue
                    method: "set",//Setting valid data from Static object
                    data: obj//set the requested object
                });
                if(this.initCasService()){//If CAS service is initalize
                    if (!this.serviceRunning) {//check if CAS is not running
                        this.next();//Run the next item in the QUEUE
                    }
                };
            }else{
                console.log('set data and callback parameter as get.fetch({data:{annotation_id:xxxxxx},success:function(res){console.log(res)}}) (Notebook: give id to update)');
                console.log('set data and callback parameter as get.fetch({data:{body_text:"new value string"},success:function(res){console.log(res)}}) (Notebook: remove id for new)');
            }
        }
        cas.prototype.delete = function(obj){
            if(typeof(obj)==='object'){
                this.cascallQueue.add({//Adding to CAS request Queue
                    method: "remove",//Setting valid data from Static object
                    data: obj//set the requested object
                });
                if(this.initCasService()){//If CAS service is initalize
                    if (!this.serviceRunning) {//check if CAS is not running
                        this.next();//Run the next item in the QUEUE
                    }
                };
            }else{
                console.log('set data and callback parameter as get.fetch({data:{annotation_id:xxxxxx},success:function(res){console.log(res)}})');
            }
        }
        cas.prototype.getRole = function(obj){
            if(typeof(obj)==='object'){
                this.cascallQueue.add({//Adding to CAS request Queue
                    method: "userDetail",//Setting valid data from Static object
                    data: obj//set the requested object
                });
                if(this.initCasService()){//If CAS service is initalize
                    if (!this.serviceRunning) {//check if CAS is not running
                        this.next();//Run the next item in the QUEUE
                    }
                };
            }
        }
        return cas;
    }
    if(typeof(cas) === 'undefined'){
        window.cas = define_cas();
    }else{
        console.log("cas already defined.");
    }
}(window));