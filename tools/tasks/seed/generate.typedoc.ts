import * as gulp from 'gulp';
import * as gutil from 'gulp-util';
import { APP_CLIENT } from '../../config';


var typedoc = require('typedoc');
var ts = require("typescript");

// hack: fix the "Cannot read property 'flags' of undefined" error. I don't actually require this, 
// but it doesn't break anything by leaving it in
var typedocConverterTypes = require("typedoc/lib/converter/types");
typedocConverterTypes.ReferenceConverter.prototype.supportsNode = function(context, node, type) {
    return !!(type && (type.flags & ts.TypeFlags.ObjectType));
}
typedocConverterTypes.TypeParameterConverter.prototype.supportsNode = function(context, node, type) {
    return !!(type && (type.flags & ts.TypeFlags.TypeParameter));
}
// end of hack



/**
 * code is to generate typedoc
 */
var typedoc = require("gulp-typedoc");
gutil.log('its working');
export = (done: any) =>{
    return gulp
    .src([`src/${APP_CLIENT}/app/app.component.ts`,
          `src/${APP_CLIENT}/app/tutorial/tutorials.ts`,
          `src/${APP_CLIENT}/app/states/dynamicMenu.ts`,
          `src/${APP_CLIENT}/app/states/game.state.base.ts`,
          `src/${APP_CLIENT}/app/states/new.game.state.base.ts`,
          `src/${APP_CLIENT}/app/states/new.objectgame.state.ts`,
          `src/${APP_CLIENT}/app/engine/dynamicmenu.engine.ts`,
          `src/${APP_CLIENT}/app/engine/game.mode.ts`,
          `src/${APP_CLIENT}/app/engine/new.game.engine.base.ts`,
          `src/${APP_CLIENT}/app/engine/new.object.game.engine.ts`,
          `src/${APP_CLIENT}/app/engine/tutorial.engine.ts`,
          `src/${APP_CLIENT}/app/commonui/game.components.ts`
    ])
    .pipe(typedoc({
        "target": "es5",
        "includeDeclarations": true,
        "emitDecoratorMetadata": true,
        "excludeExternals": true,
        "experimentalDecorators": true,
        "module": "commonjs",
        "out": "./docs",
        "name": "MX 2018 PrimaryOperations",
        "ignoreCompilerErrors": true,
        "moduleResolution": "node",
        "version": true,
    }));
};
