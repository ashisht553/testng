import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import * as merge from 'merge-stream';
import { join } from 'path';

import { DEV_SHARED_DEST, SHARED_SRC, TOOLS_DIR } from '../../config';
import { makeTsProject, templateLocals } from '../../utils';

const plugins = <any>gulpLoadPlugins();

/**
 * Executes the build process, transpiling the TypeScript files (except the spec and e2e-spec files) for the development
 * environment.
 */
export = () => {
  let tsProject = makeTsProject();
  let typings = gulp.src([
    'typings/index.d.ts',
    TOOLS_DIR + '/manual_typings/**/*.d.ts'
  ]);
  let src = [
    join(SHARED_SRC, '**/*.ts'),
    '!' + join(SHARED_SRC, '**/*.spec.ts'),
    '!' + join(SHARED_SRC, '**/*.e2e-spec.ts')
  ];

  let projectFiles = gulp.src(src).pipe(plugins.cached());
  let result = merge(typings, projectFiles)
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.typescript(tsProject));

  return result.js
    .pipe(plugins.sourcemaps.write())
    .pipe(plugins.template(templateLocals()))
    .pipe(gulp.dest(DEV_SHARED_DEST));
};