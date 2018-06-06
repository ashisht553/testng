import { FunctionMatchGameJson } from './FunctionMatchGameJson';

/**
 * Mock game data for unit testing
 */
export const MockGameData: FunctionMatchGameJson[] = [{
    "gameName":"FMG",
    "isbn":"games_9781328668219_",
    "GameGuid":"FM3-1491210659245",
    "grade":"g3",
    "gradeLabel":"Grade 3",
    "testMode":true,
    "levelData":
[{
            "id":"FM-G3-01",
            "parentId":"",
            "title":"Multiply with 5",
            "lessons":["1.1"],
            "variableCards":{
                 "numOfCards":3,
                 "var0":[1],
                 "var1":null,
                 "var2":null,
                 "var3":null,
                 "values":["D(1)", "D(2)", "D(3)", "D(4)", "D(5)", "D(6)", "D(7)", "D(8)", "D(9)"],
                 "operationSymbolMult":null,
                 "beforeText":null,
                 "afterText":null
               },
             "functionCards":
               {
                     "numOfCards":"1",
                     "beforeText":null,
                     "afterText":null,
                     "cards":
                     [
                         {
                                 "predefinedLatex":null,
                                 "values":["D(5)"],
                                 "fractionMode":null,
                                 "operationSymbol":"*",
                                 "operationSymbolLatex":"\\times",
                                 "expressionSymbolMult":null
                         },
                         {
                                 "predefinedLatex":null,
                                 "values":null,
                                 "fractionMode":null,
                                 "operationSymbol":null,
                                 "operationSymbolLatex":null,
                                 "expressionSymbolMult":null
                         },
                         {
                                 "predefinedLatex":null,
                                 "values":null,
                                 "fractionMode":null,
                                 "operationSymbol":null,
                                 "operationSymbolLatex":null,
                                 "expressionSymbolMult":null
                         },
                         {
                                 "predefinedLatex":null,
                                 "values":null,
                                 "fractionMode":null,
                                 "operationSymbol":null,
                                 "operationSymbolLatex":null,
                                 "expressionSymbolMult":null
                         }
                     ]
               },
             "gridCards":
               {
                     "BGCharacterType":"Square",
                     "numOfColumns":4,
                     "initialSpeed":7000,
                     "acceleration":100,
                     "fractionMode":null,
                     "values":
                          ["D(5)", "D(10)", "D(15)", "D(20)", "D(25)", "D(30)", "D(35)", "D(40)", "D(45)"],

                     "expressionSymbolMult":null,
                     "expressionSymbolDiv":null,
                     "beforeText":null,
                     "afterText":null
               },
             "scoring":
               {
                    "rewardPointsThreshold":[100,300,1000],
                    "bossIterations":0
               },
             "tutorial":
               {
                     "T1":"Operations_Tutorial.mp4"
               },
            "keywords":"tutorial, multiply, multiplication, multiples of 5, multiply by 5, 5, 5s, counting by 5s, 5 count-bys"
        }]
}];

