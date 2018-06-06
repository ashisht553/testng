import { beforeEachProviders, describe, inject, async, it, expect } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';

export function main(){
    describe('test test engine', ()=>{
      it('testing engine should be running', ()=>{
        expect(true).toEqual(true);
      })

      xit('skip this one', ()=>{
        expect(false).toEqual(false);
      })

      xit('this one should failed', ()=>{
        expect(1).toBeNull();
      })
  });
}
