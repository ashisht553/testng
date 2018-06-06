export namespace DynamicMenuEngine {

    export enum ElementType {
        Tree = 0,
        Mountain = 1,
        Button = 2
    }
    /**
     * class to generate dynamic menu
     */
    export class MenuElement {
        id: string;
        name: string;
        label: number;
        parent: string;
        type: string;
        gameType:string;
        currentStatus: number;
        elements: Array<any>;
        buttonElement: any;
        title:string;
        tutorial:Object;

        /**
         * initializing properties 
         */
        constructor(menuElementData: any, i: number) {
            this.id = menuElementData.id;
            this.name = "Button" + [i];
            this.label = i+1;
            this.parent = menuElementData.parentId;
            this.currentStatus = 0;
            this.type = menuElementData.operation? menuElementData.operation.operationType:null;
            this.gameType = menuElementData.operation?menuElementData.operation.gameType:null;
            this.title = menuElementData.title;
            this.tutorial = menuElementData.tutorial;
            this.buttonElement = {
                "id": menuElementData.id,
                "parentId": menuElementData.parentId
            }
        }
    }

    /**
     * dynamic menu engine to read the grade JSON 
     * and create dynamic menu element array
     */
    export class Engine {
        menuElements: Array<any>;
        linkedButton: Array<any>; // [[1,3], [3,4]]
        showTutorial: boolean = true;
        /**
         * constructor accepting the @param {mapData}  grade JSON's 
         * levelData array to generate the dynamic menu object to render
         * on screen
         */
        constructor(mapData: Array<any>) {
            this.menuElements = [];
            for (var i = 0; i < mapData.length; i++) {
                let m1: DynamicMenuEngine.MenuElement = new DynamicMenuEngine.MenuElement(mapData[i], i);
                this.menuElements.push(m1);
            }
        }


    }
}