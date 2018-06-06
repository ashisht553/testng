/**
 * @author indecomm
 * @license Copyright HMH
 */

/**
 * Represents a class.
 * @class DemoEngine
 */
export class DemoEngine{
    badGuy: number
    goodGuys: Array<number>
    

    //for example json says badGuy value between 20 to 50
    //goodGuy value between 10 to 20
    //good guys number is 3
    /**
     * Represents a constructor.
     * @constructor
     * @param {JSON} data
     */
    constructor(private data: JSON){
        this.goodGuys = [];
    }

    /**
     * Represents a method.
     * @method removeGoodGuys
     * @param {Array<number>} indexes
     */
    removeGoodGuys(indexes:Array<number>){
        var self = this;
        indexes.forEach((i)=>{
            this.goodGuys.slice(i);
        })
    }   

    /**
     * Represents a method.
     * @method setup
     */
    setup(){
        this.badGuy = this.generateRandomValue(20, 50);
        
        for(var i = 0 ; i < 3; i++){
            this.goodGuys.push(this.generateRandomValue(10, 20))
        }

    }

    /**
     * Represents a method.
     * @method generateRandomValue
     * @param {number} min
     * @param {number} max
     */
    generateRandomValue(min: number, max: number): number {
        //do something here with coding
        var ran = Math.random() * min + (max - min);
        return ran;
    }

    /**
     * Represents a method.
     * @method check
     * @return {boolean}
     */
    check(): Boolean{
        var sum = 0;

        for(var i = 0; i< this.goodGuys.length; i++){
            sum += this.goodGuys[i];
        }

        if(sum != this.badGuy){
            return false
        }

        return true;
    }


    
}