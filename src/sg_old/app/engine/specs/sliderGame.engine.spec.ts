import { beforeEachProviders, describe, inject, async, it, expect } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { SliderGameEngine } from '../slider.engine';
import { MockGameData } from './sliderGame.mock.data';
import { MockGamePointsData } from './sliderGame.mock.data';

/**
 * The main class of unit testing
 */
export function main() {

  /**
   * Unit testing for slider game engine
   */
  describe('Test Slider Game Engine', ()=> {
    let levelIndex = 0;
    let JSONData = MockGameData[levelIndex];
    let engine = new SliderGameEngine.EngineBase(JSONData);

    it('Testing engine method setJSONLevel', ()=> {
      engine.setJSONLevel(levelIndex,MockGamePointsData,3);
      expect(engine.currentLevel.id).toEqual(JSONData.levelData[levelIndex].id);
    });

    it('Testing engine method setGradePointsData', ()=> {
      engine.setGradePointsData(MockGamePointsData,3);
      expect(engine.gradePointsData).toEqual(MockGamePointsData.grade3);
    });

    it('Testing engine method getCloneJSON', ()=> {
        expect(engine.getCloneJSON(JSONData)).toEqual(JSONData);
    });

    it('Testing engine method replaceVariableValues', ()=> {
        expect(engine.replaceVariableValues('var0 * 6')).toEqual('5 * 6');
    });

    it('Testing engine method isTestMode', ()=> {
        expect(engine.isTestMode()).toEqual(JSONData.testMode);
    });

    it('Testing engine method getTutorialVideo', ()=> {
        expect(engine.getTutorialVideo()).toEqual(JSONData.levelData[levelIndex].tutorial.T1);
    });

    it('Testing engine method toNormal', ()=> {
        expect(engine.toNormal('16,48')).toEqual([16 , 48]);
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

    it('Testing engine method toMachineCodeString', ()=> {
        expect(engine.toMachineCodeString('2 , 5')).toEqual('2 / 5');
    });

    it('Testing engine method calculateLatexParam', ()=> {
        expect(engine.calculateLatexParam('1 * 20')).toEqual('20');
    });

    it('Testing engine method getCardValueType', ()=> {
        expect(engine.getCardValueType('D(1 + 5)')).toEqual({ type: 0, value: '6' });
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

    it('Testing engine method getOperationSymbol', ()=> {
        expect(engine.getOperationSymbol('+','')).toEqual(`\u002B`);
    });

    it('Testing engine method getLatexURL', ()=> {
        expect(engine.getLatexURL(0,'2',{ size: '50', color: 'FFFFFF' })).toEqual('2');
    });

    it('Testing engine method latexParamToURL', ()=> {
        expect(engine.latexParamToURL('1,1,2')).toEqual('1\\frac{1}{2}');
    });

    it('Testing engine method setMaxGoodAndBadGuy', ()=> {
      engine.setMaxGoodAndBadGuy();
      expect(engine.maximumGoodGuys).toEqual(MockGamePointsData.grade3['3x3grid'].goodGuysMaxNumber);
    });
    
    it('Testing engine method hcf', ()=> {
      expect(engine.hcf(24,36)).toEqual(12);
    });

    it('Testing engine method generateRandomNumber', ()=> {
      let result=engine.generateRandomNumber(0,10);
      expect(result).toBeLessThan(11);
    });

    it('Testing engine method getStarThreshold', ()=> {
      let result=engine.getStarThreshold();
      expect(result).toEqual([1,2,3]);
    }); 
  });
}

