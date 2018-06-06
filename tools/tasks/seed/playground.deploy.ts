import * as gulp from 'gulp';
import * as gutil from 'gulp-util';
import { APP_CLIENT } from '../../config';
var ftp = require( 'vinyl-ftp' );

// [ CODE REVIEW]
// Prob: Not flexible for different tools 
// Action: set and use args for different tools

export = (done: any) =>{
        var conn = ftp.create( {
        host:     'hmh.lectoraonline.com',
        user:     'xuj',
        password: 'wRE2u=ru',
        parallel: 10,
        log:      gutil.log
    } );
 
    var globs = [
        'prod/**'
    ];
 
    // using base = '.' will transfer everything to /public_html correctly 
    // turn off buffering in gulp.src for best performance 
    
    return gulp.src( globs, { cwd: './dist/', buffer: false } )
        .pipe( conn.newer( '/playground/MX2018/Games/AutoBuild/' + APP_CLIENT ) ) // only upload newer files 
        .pipe( conn.dest( '/playground/MX2018/Games/AutoBuild/' + APP_CLIENT ) );
}
