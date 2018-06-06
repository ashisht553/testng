import { FunctionMatchGameStateBase } from './functionMatch.game.state.base';
import { FunctionMatchGameEngine } from '../engine/functionMatch.engine';

export class FunctionMatchGame extends FunctionMatchGameStateBase {

    /**
     * This method will preload all the assets and json data which requires for the game
     */
    preload() {
        this.engine = new FunctionMatchGameEngine.EngineBase(this.game.cache.getJSON('leveldata'));
        this.engine.setJSONLevel(this.levelIndex);
        this.levelID = this.engine.currentLevel.id;
        this.updateAssignModeAndLevelID();
        super.preload();
    }

    /**
     * This method will be triggered after preload but before create method. The grade level will be allocated.
     */
    init(params: any) {
        super.init(params);
        if (params) this.levelIndex = params[0] - 1;
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
