declare var katex: any;
declare var algebra: any;
declare var underscore: any;
import { beforeEach, beforeEachProviders, describe, inject, async, it, expect } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { GameEngineBase } from '../engine/game.engine.base';
import { GameEngine } from '../engine/game.engine';


export function main() {

    describe('Load the JSON and setting up the Engine:', function () {
        var json: any;
        var engineBase: GameEngineBase.EngineBase;
        var engine: GameEngine;
        var f: any;
        var idsArray: Array<any> = [];
        var engineObject: any;
        var levelNum: number = 1;
        var jsonFile="";

        beforeEach(function () {
            jasmine.getFixtures().fixturesPath = "../assets/data/";
            jsonFile="card_grade_3_data.json"
            f = readFixtures(jsonFile);
            json = JSON.parse(f);

            engine = new GameEngine(json);
        });

        it("1 To check all the card values are there", () => {
            for (var index = 0; index < engine.data.levelData.length; index++) {
                engine.setupGame(index);
                
                //console.log("\nfile "+jsonFile);
                
                console.log("\nlevel---->"+engine.data.levelData[index].id+"\n");
                
                if (engine.data.levelData[index].variableCards.goal.values != null)
					console.log("goal values predefined\n");
                else
					console.log("goal values not defined\n");
                
                console.log("start value :"+ engine.startActor.value);
                console.log("answer value :"+ engine.answerActor.value+"\n");
                
                engine.bench.forEach(element => {
                    console.log("card value: "+ element.operationSymbol+" "+element.value);
					
					expect(engine.filterValues(element.value,element.operationSymbolLatex)).not.toBe(null);
                });
				expect(engine.createCards(element)).toBeDefined();
            }
        });
		
		it("1.1 RemoveDuplicateValues",()=>{
				var tempBool = engine.removeDuplicateValues();
				expect(tempBool).toBe(true);
			});
        
		it("1.2 Answer value should be greater then 0", () => {				
			var operator: string = '';
			var leftOperand: any;
			var rightOperand: number = 0;
			var resultValue: any;
			
			for(var i = 0;i<3;i++)
			{
				operator = engine.randomCardValues[i].operationSymbol;
				leftOperand = (engine.startValue.value).toString();
				rightOperand = engine.randomCardValues[i].value;
				resultValue = engine.factionOperation(operator, leftOperand, engine.randomCardValues[i].fractionString);
			}
			expect(resultValue.value).toBeGreaterThanOrEqual(0);
		});

        it('Random Number',()=>{
			var value = 0;
			value = engine.randomNumberGeneration(1,10);
			expect(value).not.toBe(0);
			expect(Number).toContain(value);
		});
		
		/*it('getVariations'()=>{
			//var valz = getVariations()
			//expect()
		});*/

    });
}