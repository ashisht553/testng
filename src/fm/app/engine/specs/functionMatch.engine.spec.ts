import { beforeEachProviders, describe, inject, async, it, expect } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { FunctionMatchGameEngine } from '../functionMatch.engine';
import { MockGameData } from './functionMatch.mock.data';

/**
 * The main class of unit testing
 */
export function main() {

  /**
   * Unit testing for function match game engine
   */
    describe('Test Function Match Game Engine', ()=> {
      let levelId = 0;
      let JSONData = MockGameData[levelId];
      let engine = new FunctionMatchGameEngine.EngineBase(JSONData);
      let fnCards: any = null;
      let varCards: any = null;
      let badGuysData:any = null;
      let gridCards:any = null;

      it('Testing engine method setJSONLevel', ()=> {
       engine.setJSONLevel(levelId);
       expect(engine.currentLevel.id).toEqual(JSONData.levelData[levelId].id);
      });

      it('Testing engine method getCloneJSON', ()=> {
        expect(engine.getCloneJSON(JSONData)).toEqual(JSONData);
      });

       it('Testing engine method initGameData', ()=> {
       engine.initGameData();
       expect(engine.currentLevel.id).toEqual(JSONData.levelData[levelId].id);
      });

       it('Testing engine method setFunctionCards', ()=> {
        engine.setFunctionCards();
        fnCards = engine.getFunctionCards();
        expect(fnCards.length.toString()).toEqual(JSONData.levelData[levelId].functionCards.numOfCards);
      });

      it('Testing engine method getFunctionCards', ()=> {
        fnCards = engine.getFunctionCards();
        expect(fnCards.length.toString()).toEqual(JSONData.levelData[levelId].functionCards.numOfCards);
      });

       it('Testing engine method setVariableCards', ()=> {
        engine.setVariableCards();
        varCards = engine.getVariableCards();
        expect(varCards.length).toEqual(JSONData.levelData[levelId].variableCards.numOfCards);
      });

      it('Testing engine method getVariableCards', ()=> {
        varCards = engine.getVariableCards();
        expect(varCards.length).toEqual(JSONData.levelData[levelId].variableCards.numOfCards);
      });

      it('Testing engine method replaceVariableValues', ()=> {
        expect(engine.replaceVariableValues('var0 * var0')).toEqual('1 * 1');
      });

        it('Testing engine method addAllVariableValues', ()=> {
        expect(engine.addAllVariableValues('var0 * var0')).toEqual([ '1 * 1' ]);
      });
      it('Testing engine method getNumofBadGuyColumnCount', ()=> {
        expect(engine.getNumofBadGuyColumnCount()).toEqual(JSONData.levelData[levelId].gridCards.numOfColumns);
      });

      it('Testing engine method getBadGuys', ()=> {
        gridCards=engine.getBadGuys(fnCards, varCards);
        expect(engine.getBadGuys(fnCards, varCards).length).toEqual(JSONData.levelData[levelId].gridCards.numOfColumns);
      });

      it('Testing engine method getInitialSpeed', ()=> {
        expect(engine.getInitialSpeed()).toEqual(JSONData.levelData[levelId].gridCards.initialSpeed);
      });

      it('Testing engine method getSpeed for 750 points', ()=> {
        expect(engine.getSpeed(750)).toEqual(3500);
      });

      it('Testing engine method getRewardsThreshold', ()=> {
        expect(engine.getRewardsThreshold()).toEqual(JSONData.levelData[levelId].scoring.rewardPointsThreshold);
      });

      it('Testing engine method getBadGuyCharacterType', ()=> {
        expect(engine.getBadGuyCharacterType()).toEqual(JSONData.levelData[levelId].gridCards.BGCharacterType);
      });

      it('Testing engine method getBossIterations', ()=> {
        expect(engine.getBossIterations()).toEqual(JSONData.levelData[levelId].scoring.bossIterations);
      });

      it('Testing engine method isTestMode', ()=> {
        expect(engine.isTestMode()).toEqual(JSONData.testMode);
      });

      it('Testing engine method getTutorialVideo', ()=> {
        expect(engine.getTutorialVideo()).toEqual(JSONData.levelData[levelId].tutorial.T1);
      });

      it('Testing engine method getFraction', ()=> {
        expect(engine.getFraction('16,48','simplified')).toEqual([1 , 3]);
      });

       it('Testing engine method toNormal', ()=> {
        expect(engine.toNormal('16,48')).toEqual([16 , 48]);
      });

      it('Testing engine method toSimple', ()=> {
        expect(engine.toSimple('16,48')).toEqual([1 , 3]);
      });

      it('Testing engine method toMixed', ()=> {
        expect(engine.toMixed('5,2')).toEqual([2,[1,2]]);
      });

      it('Testing engine method toFraction', ()=> {
        expect(engine.toFraction('5,2,5')).toEqual([27 , 5]);
      });

       it('Testing engine method getMixedNumberFraction', ()=> {
        expect(engine.getMixedNumberFraction(15,7)).toEqual([2,[1, 7]]);
      });

       it('Testing engine method getSimpleFraction', ()=> {
        expect(engine.getSimpleFraction(15,30)).toEqual([1, 2]);
      });

       it('Testing engine method splitEquation', ()=> {
        expect(engine.splitEquation('(2 + 5)')).toEqual({ operator: ' + ', operands: [ '2', '5' ] });
      });

      it('Testing engine method toMachineCodeString', ()=> {
        expect(engine.toMachineCodeString('2 , 5')).toEqual('2 / 5');
      });

       it('Testing engine method calculateLatexParam', ()=> {
        expect(engine.calculateLatexParam({type:0,value:'1 * 20'})).toEqual('20');
      });

      it('Testing engine method getCardValueType', ()=> {
        expect(engine.getCardValueType('E(1 + 5)')).toEqual({ type: 4, value: '1 + 5' });
      });

      it('Testing engine method isIntorDecimalCardValue', ()=> {
        expect(engine.isIntorDecimalCardValue('D(1 + 5)')).toEqual('1 + 5');
      });

       it('Testing engine method isFractionCardValue', ()=> {
        expect(engine.isFractionCardValue('F(1 + 5)')).toEqual('1 + 5');
      });

      it('Testing engine method isPercentageCardValue', ()=> {
        expect(engine.isPercentageCardValue('P(1 + 5)')).toEqual('1 + 5');
      });

       it('Testing engine method isEquationCardValue', ()=> {
        expect(engine.isEquationCardValue('E(1 + 5)')).toEqual('1 + 5');
      });

       it('Testing engine method getComputedLatex', ()=> {
        expect(engine.getComputedLatex(0,'','1 + 4',2,'+','+')).toEqual({ latexString: '+ 1 + 4', computedValue: 1, isImage: true, image: '', operationSymbol: '+', operationSymbolLatex: '' });
      });

     it('Testing engine method getOperationSymbol', ()=> {
        expect(engine.getOperationSymbol('+','')).toEqual(`\u002B`);
      });

      it('Testing engine method getOperationSymbolLatex', ()=> {
        expect(engine.getOperationSymbolLatex('*','\\cdot')).toEqual(`\\cdot`);
      });

      it('Testing engine method replaceExpressionSymbolLatex', ()=> {
        expect(engine.replaceExpressionSymbolLatex({expressionSymbolMult:"\\cdot"},'1 * 10')).toEqual('1 \\cdot 10');
      });

       it('Testing engine method getFractionString', ()=> {
        expect(engine.getFractionString({numer:15,denom:2})).toEqual('7,1,2');
      });

      it('Testing engine method latexParamToURL', ()=> {
        expect(engine.latexParamToURL({beforetext:'\\$',afterText:'per year',operationSymbolLatex:'+',expressionSymbolMult:null},'(2 + 5)',true,true)).toEqual( ' +  (2 + 5)\\text   per year');
      });

      it('Testing engine method getBadguysData', ()=> {
        badGuysData = engine.getBadguysData();
        expect(badGuysData).toEqual({ beforeText: JSONData.levelData[levelId].gridCards.beforeText,afterText: JSONData.levelData[levelId].gridCards.afterText,expressionSymbolMult: JSONData.levelData[levelId].gridCards.expressionSymbolMult});
      });

      it('Testing engine method identifyGridCardType', ()=> {
        expect(engine.identifyGridCardType({valueType:'fraction',algebravalue:'',latexParam:'(1 + 2)',latexString:'D(1 + 2)'})).toEqual({ valueType: 'fraction', algebravalue: '', latexParam: '(1 + 2)', latexString: 'D(1 + 2)' });
      });

      it('Testing engine method findAvailableCardsType', ()=> {
        engine.findAvailableCardsType()
        expect(engine.badGuysGrid.fractionMode).toEqual(null);
      });

      it('Testing engine method simplifyBadGuyValues', ()=> {
        let gridValues=engine.badGuysGrid.values;
        engine.simplifyBadGuyValues()
        expect(engine.badGuysGrid.values).toEqual(gridValues);
      });
  });
}

