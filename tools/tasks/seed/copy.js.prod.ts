import * as gulp from 'gulp';
import { join } from 'path';
import { APP_SRC, SHARED_SRC, TMP_DIR, APP_CLIENT } from '../../config';

var replace=require('gulp-replace');

/**
 * Executes the build task, copying all TypeScript files over to the `dist/tmp` directory.
 */
export = () => {
  gulp.src([
      join(APP_SRC, '**/*.ts'),
      '!' + join(APP_SRC, '**/*.spec.ts'),
      '!' + join(APP_SRC, '**/*.e2e-spec.ts'),
      '!' + join(APP_SRC, '**/*.d.ts')
    ])
    .pipe(gulp.dest(TMP_DIR + "/" + APP_CLIENT));

    gulp.src([
      join(SHARED_SRC, '**/*.ts'),
      '!' + join(APP_SRC, '**/*.spec.ts'),
      '!' + join(APP_SRC, '**/*.e2e-spec.ts'),
      '!' +  join(SHARED_SRC, '**/*.d.ts'),
    ])
    .pipe(gulp.dest(TMP_DIR + '/shared'));
    
    gulp.src(SHARED_SRC +"typings.d.ts")
    .pipe(replace('/// <reference path="../../typings/index.d.ts"/>','/// <reference path="../../../typings/index.d.ts"/>'))
    .pipe(replace('/// <reference path="../../savedtypings/jquery.d.ts"/>','/// <reference path="../../../savedtypings/jquery.d.ts"/>'))
    .pipe(gulp.dest(TMP_DIR + "/shared"));

    return;
};