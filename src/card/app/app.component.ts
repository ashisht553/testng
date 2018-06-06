import { Component } from '@angular/core';
import { CommonUI } from './component/commonui/commonui.component';
import { CardGame } from './component/game/game.component';


@Component({
    selector: 'app-main',
    template: `
        <cardgame></cardgame>
    `,
    directives:[CommonUI, CardGame]
})


export class AppComponent{    
}
