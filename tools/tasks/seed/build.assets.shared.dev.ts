import * as gulp from 'gulp';
import { join } from 'path';

import { SHARED_SRC, DEV_SHARED_DEST, TEMP_FILES } from '../../config';

/**
 * Executes the build process, copying the assets located in `src/client` over to the appropriate
 * `dist/dev` directory.
 */
export = () => {
  let paths: string[] = [
    join(SHARED_SRC, '**'),
    '!' + join(SHARED_SRC, '**', '*.ts'),
    '!' + join(SHARED_SRC, '**', '*.scss')
  ].concat(TEMP_FILES.map((p) => { return '!' + p; }));

  return gulp.src(paths)
    .pipe(gulp.dest(DEV_SHARED_DEST));
};