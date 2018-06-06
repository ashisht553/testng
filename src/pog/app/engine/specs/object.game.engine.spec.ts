
import { beforeEach, beforeEachProviders, describe, inject, async, it, expect } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { ObjectGameEngine } from '../object.game.engine';
import { POGGameEngineBase } from '../game.engine.base';


export function main() {

    /**
     * SpyOn Test 
     */

    describe("1. Load the JSON and setting up the Engine:", function () {

        var json: any;
        var engine: ObjectGameEngine;
        var f: any;
        var idsArray: Array<any> = [];
        var engineObject: any;
        var levelNum: number = 0;
        var currentLevel: number = 0;
        var levelID: string = "POGK-01";
       // var mode: string = 'student';
        var gameUserData: any = {
            GameInfo: {
                gameGuid: "4410305337",
                gameName: "POG",
                grade: "gk",
                isbn: "PO-K-9781328795496",
                levelInfos: [
                    {
                        levelId: "POGK-01",
                        completed: true,
                        awardInfo: {
                            score: 0,
                            stars: 0
                        }
                    },
                    {
                        levelId: "POGK-01-01",
                        completed: true,
                        awardInfo: {
                            score: 0,
                            stars: 0
                        }
                    }
                ]
            },
            mode: "student",
            userId: "",
            userName: ""
        }

        beforeEach(function () {
            jasmine.getFixtures().fixturesPath = "assets/data/";
            f = readFixtures("pog.gradek.data_en.json");
            json = JSON.parse(f);
            levelNum = json.levelData.map(function (d: any) { return d['id']; }).indexOf(levelID);
            engine = new ObjectGameEngine(json);
            engine.setup(levelID);
           /* console.log("engine")
            console.log(engine)

            console.log("json")
            console.log(json)

            console.log("levelNum")
            console.log(levelNum)

            console.log("POGGameEngineBase")
            console.log(POGGameEngineBase)

            console.log("gameUserData")
            console.log(gameUserData)*/
            
        });

        
        it("1.1 bad guys factor1 length should be equal to json's factor1 length", () => {
            //console.log("Engine Facgtor", engine.factors1.length, "Json Factor", json.levelData[levelNum].operation.factors[0].length);
            expect(json.levelData[levelNum].operation.factors[0].length).toEqual(engine.factors1.length);
        });
        it("1.2 good guys factors factor2 should be equal to +1 of the length of factor2 in JSON", () => {
            //console.log(engine.factors2.length, json.levelData[levelNum].operation.factors[1].length);
            expect(json.levelData[levelNum].operation.factors[1].length).toBeGreaterThan(engine.factors2.length);
        });
        it("1.3 possible values array from JSON should have 1 or more elements", () => {
            //console.log(json.levelData[levelNum].bench.possibleValues.length);
            expect(json.levelData[levelNum].bench.possibleValues.length).toBeGreaterThan(0);
        });
        it("1.4 bad guys type should be big specs without shirt 0", () => {
            //console.log(engine.factors2, POGGameEngineBase.SpriteType.WithoutShirt);
            expect(engine.factors2[0].spriteType).toEqual(POGGameEngineBase.SpriteType.WithoutShirt);
        });
        it("1.5 answer value should not be Less then the minimum range value", () => {
            //console.log(engine.unknownAnswer, json.levelData[levelNum].unknown[0]);
            expect(engine.unknownAnswer).not.toBeLessThan(json.levelData[levelNum].unknown[0]);
        });
        it("1.6 answer value should not be greater then the maximum range value", () => {
            //console.log(engine.unknownAnswer, json.levelData[levelNum].unknown[1]);
            expect(engine.unknownAnswer).not.toBeGreaterThan(json.levelData[levelNum].unknown[1]);
        });
        it("1.7 good guys type should be big specs without shirt", () => {
            //console.log(engine.factors1[0].spriteType, POGGameEngineBase.SpriteType.WithoutShirt);
            expect(engine.factors1[0].spriteType).toBe(POGGameEngineBase.SpriteType.WithShirt);
        });
        it("1.8 answer should be muliple of the given number", () => {

            if (json.levelData[levelNum].members[0][2] !== null && json.levelData[levelNum].members[0][2] !== undefined) {
                let answer = engine.unknownAnswer % Number(json.levelData[levelNum].members[0][2].multiple);
                //console.log("member having multiple", json.levelData[levelNum].members[0][2].multiple, engine.unknownAnswer);
                expect(answer).toBe(0);
            }
        });

        /*
        * 
        */

        it('1.9 Testing levelNum should be numeric value', function(){   
            if( (typeof levelNum) == "number" && levelNum >= 0){
                expect(levelNum).toEqual(jasmine.any(Number));
                expect(levelNum).toBeGreaterThan(-1);
            }
            expect(Math.trunc(levelNum)).toEqual(levelNum);
        });        

        it('1.10 Testing engine method to verify User Level', ()=> {               
            expect(engine.currentLevelID).toEqual(json.levelData[levelNum].id);
        });

        it('1.11 Testing engine to verify userIdentity is student', ()=> {
            expect(gameUserData.mode).toEqual('student');
        });       
      
        it('1.12 Testing engine to verify userIdentity is teacher', ()=> {
            expect(gameUserData.mode).toEqual(''); 
        });

        it('1.13 Testing engine to verify game is over', ()=> {
            expect(gameUserData.GameInfo.levelInfos[json.levelData.length - 1]).not.toBeUndefined();
            expect(gameUserData.GameInfo.levelInfos[json.levelData.length - 1].completed).toEqual(true);
        });

        if(gameUserData.mode == 'student'){

            it('1.14 Testing engine to verify intial level 1 for student should be unlock', ()=> {
                expect(levelNum).toEqual(0);
            });

            it('1.15 Testing engine to current level is unlock for student mode', ()=> {
                expect(gameUserData.GameInfo.levelInfos[levelNum]).not.toBeUndefined();
            });

            it('1.16 Testing engine to from initial level to level '+ (gameUserData.GameInfo.levelInfos.length+1) +' all levels are unlock for student mode', ()=> {
                expect(gameUserData.GameInfo.levelInfos.length).not.toEqual(0);
            });

            it('1.17 Testing engine to from level '+ gameUserData.GameInfo.levelInfos.length +' next all are levels lock for student mode', ()=> {
                expect(levelNum).toBeLessThan(gameUserData.GameInfo.levelInfos.length);
            });

        }



        describe("2. Validating the JSON values", function () {

            it("2.0 Game GUID should not be blank", () => {
                console.log("Game GUID > ", json.GameGuid);
                expect(json.GameGuid).not.toEqual("");
            });

            it("2.1 id should not be undefined", () => {
                expect(json.levelData[levelNum].id).not.toBeUndefined();
            });

            it("2.2. 'iterations' cannot be 0 or blank", () => {
                expect(Number(json.levelData[levelNum].iterations)).toBeGreaterThan(0);
            });

            it("2.3 'gameType' should not be blank", () => {
                expect(json.levelData[levelNum].operation.gameType).not.toBe("");
            });

            it("2.4 'operationType' should not be blank", () => {
                expect(json.levelData[levelNum].operation.operationType).not.toBe("");
            });

            it("2.5 'factors' for comaprtment creation should have more than 1 array objects", () => {
                expect(json.levelData[levelNum].operation.factors.length).toEqual(2);
            });

            it("2.6 tutorial 1 should have URL and not be true", () => {
                expect(json.levelData[levelNum].tutorial.T1).not.toBe(true);
            });

            it("2.7 tutorial 1 should have URL with .mp4 extension", () => {
                let mp4index = json.levelData[levelNum].tutorial.T1.indexOf(".mp4")
                console.log(json.levelData[levelNum].tutorial.T1)
                expect(json.levelData[levelNum].tutorial.T1).not.toBe(-1);
            });

        });

    });
}