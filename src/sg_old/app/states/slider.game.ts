import { SliderGameStateBase } from './slider.game.state.base';
import { SliderGameEngine } from '../engine/slider.engine';

export class SliderGame extends SliderGameStateBase {

    /**
     * This method will preload all the assets and json data which requires for the game
     */
    preload() {
        this.engine = new SliderGameEngine.EngineBase(this.game.cache.getJSON('leveldata'));
        this.engine.setJSONLevel(this.levelIndex,this.game.cache.getJSON('pointsdata'), this.initParams.urlParams.grade);
        this.levelID = this.engine.currentLevel.id;
        this.updateAssignModeAndLevelID();
        super.preload();
    }

    /**
     * This method will be triggered after preload but before create method. The grade level will be allocated.
     */
    init(params: any) {
        super.init(params);
        if(params) this.levelIndex = params[0]-1;
    }

    /**
     * This method will be triggered when the preload has completed successfully. Here, game engine gets intilized
     */
    create() {
        super.create();
    }

    /**
     * Default phaser update method which updates Phaser canvas
     */
    update() {
        super.update();
    }
}
