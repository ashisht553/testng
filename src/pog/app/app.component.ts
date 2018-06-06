import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { CommonUI } from './component/commonui/commonui.component';
import { POGGame } from './component/game/game.component';


@Component({
    selector: 'app-main',
    template: `
        <poggame></poggame>
    `,
    directives:[CommonUI, POGGame]
})


export class AppComponent{    
}
