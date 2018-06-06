/**
 * @author indecomm
 * @license Copyright HMH
 */
import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { CommonUI } from './component/commonui/commonui.component';
import { SG } from './component/game/game.component';


/**
 * Defining the base component 
 */
@Component({
    selector: 'app-main',
    template: `<slidergame></slidergame>`,
    directives: [CommonUI, SG]
})

/**
 * Represents a class.
 * @class AppComponent
 */
export class AppComponent { 
}
