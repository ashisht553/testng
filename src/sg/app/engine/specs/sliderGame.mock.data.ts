import { SliderGameJson } from './SliderGameJson';
import { Grade } from './SliderGameJson';

/**
 * Mock game data for unit testing
 */
export const MockGameData: SliderGameJson[] = [{
    "gameName":"SG",
    "isbn":"games_9781328668219_",
    "GameGuid":"",
    "grade":"g3",
    "gradeLabel":"Grade 3",
    "testMode":true,
    "levelData":
[
        {
            "id":"SG-G3-01",
            "parentId":"",
            "title":"Tutorial Level 1",
            "lessons":null,
            "gridSize":3,
            "sliderType":"Ratio",
            "equationType":null,
            "var0":[5],
            "var1":[6],
            "var2":null,
            "var3":null,
             "frequency":
               {
                     "goodGuys":0.5,
                     "badGuys":0,
                     "comboTiles":0
                },
             "slider":
               {
                 "height":null,
                 "total":"D(4)",
                 "min":"D(1)",
                 "max":"D(1)",
                 "interval":null
                },
             "grid":
               {
                   "values":["D(1)", "D(3)"]
              },
             "scoring":
               {
                 "starThreshold":1,
                 "loseThreshold":2
               },
             "tutorial":
               {
                     "T1":"GoodGuy_Tutorial.mp4"
               },
            "keywords":"tutorial",
            "meaningfulDescription":"students learn how to beat a level of the game"
        }]
        }];

export const MockGamePointsData: Grade = { 
 "grade3":{
   "points":{
    "successfulPair":10,
    "comboTile":20,
    "clearBadGuy":20,
    "getGoodGuy":20,
    "earnStar":50
	},
	"3x3grid":{
	"goodGuysMaxNumber":2,
	"badGuysMaxNumber":1,
	"comboTileMaxNumber":2
	},
	"4x4grid":{
	"goodGuysMaxNumber":3,
	"badGuysMaxNumber":1,
	"comboTileMaxNumber":2
	}
}
};