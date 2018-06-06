/**
 * this namespace contains all features for the tutorial
 */
export namespace TutorialEngine {
    // Interfaces

    /**
     * this interface will be implemented for triggerConditions in tutorial
     */
    export interface ITriggerCondition {
        monitoredObject: any; //chahnged to any because this can be an array or object etc
        property: any;
        happenWhen: Object;
        happenWhenRange: Array<Array<number>>;
        inclusive: boolean;
        stopProperty: any;
        stopWhen: any;
        tutorialName:string;
    }
    /**
     * this interface will be implemented by all tutorial
     */
    export interface ITutorial {
        id: string;
        triggerConditions: Array<ITriggerCondition>;
        onceOff: boolean;
        triggeredCount: number;
        start(): void;
        show(): void;
        close(): void;
        masking(): void;
        unmasking(): void;
    }

    /**
     * Engine for Tutorials
     */
    export class Engine {
        timer: Phaser.Timer;
        tutorials: Array<ITutorial>
        game: Phaser.Game;
        onShowTutorial = new Phaser.Signal();

        constructor(_game: Phaser.Game) {
            this.game = _game;
            this.timer = this.game.time.create(false)
            this.timer.loop(Phaser.Timer.SECOND * 0.5, this.check, this);
            this.tutorials = [];
        }
        /**
         * starting the timer to keep track of user action
         * and trigger the tutorial
         */
        start() {            
            this.timer.start();
        }

        /**
         * starting the timer to keep track of user action
         * and stop the tutorial
         */
        stop() {
            this.timer.stop();
        }

        private check() {
        if(this.tutorials.length){
            this.tutorials.forEach(t => {
                this.checkTutorial(t);
            })
        }
        }

        /**
         * method to check tutorial conditions
         * @param 'tutorial'  tutorial pushed by the games
         */
        private checkTutorial(tutorial: ITutorial) {
            if (tutorial.triggerConditions[0].monitoredObject[tutorial.triggerConditions[0].property]  == tutorial.triggerConditions[0].happenWhen) {
                tutorial.start();
            }

            if (tutorial.triggerConditions[0].monitoredObject[tutorial.triggerConditions[0].stopProperty] == tutorial.triggerConditions[0].stopWhen) {
                tutorial.close();
            }
        }
    }

    /**
     * class to describe tutorials
     */
    export abstract class TutorialBase implements ITutorial {
        game: Phaser.Game;
        id: string;
        content: Phaser.Group;
        triggerConditions: Array<ITriggerCondition>;
        onceOff: boolean;
        triggeredCount: number;

        constructor(_game: Phaser.Game, _onceOff?: boolean) {
            this.game = _game;
            this.triggeredCount = 0;
            this.triggerConditions = [];
            this.onceOff = true;

            if (_onceOff) {
                this.onceOff = _onceOff;
            }
        }

        /**
         * method used to start tutorial
         */
        start(): void {

            if (this.onceOff == false || this.triggeredCount <= 0) {
                this.show();
            }

        }
        /**
         * method used to destroy tutorial
         */
        close(){
            this.content.destroy();
            
        }
        /**
         * method used to show tutorial
         */
        show(): void {
            // to be defined in each tutorial;
            this.triggeredCount++;
        }

        masking(): void { }

        unmasking(): void { }
    }

}