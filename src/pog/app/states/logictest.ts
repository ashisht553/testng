import { POGGameEngineBase } from '../engine/game.engine.base';
import { ObjectGameEngine } from '../engine/object.game.engine';

export class LogicTest extends Phaser.State{
    engine: POGGameEngineBase.IGameEngine

    preload() {       
        this.game.load.json('leveldata', 'assets/data/testdata.json');
    }

    create() {
        this.engine = new ObjectGameEngine(this.game.cache.getJSON('leveldata'));
        this.engine.setup("gk04");
    }

    update(){
     
     
    }

}