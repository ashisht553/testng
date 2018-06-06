/**
 * @author indecomm
 * @license Copyright HMH
 */
import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { CommonUI } from './component/commonui/commonui.component';
import { FMGame } from './component/game/game.component';

@Component({
    selector: 'app-main',
    template: `<fmgame></fmgame>`,
    directives: [CommonUI, FMGame]
})

/**
 * Represents a class.
 * @class AppComponent
 */
export class AppComponent {
}
