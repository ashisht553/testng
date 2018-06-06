import * as gulp from 'gulp';
import * as runSequence from 'run-sequence';

import { PROJECT_TASKS_DIR, SEED_TASKS_DIR } from './tools/config';
import { loadTasks } from './tools/utils';
var typedoc = require("gulp-typedoc");


loadTasks(SEED_TASKS_DIR);
loadTasks(PROJECT_TASKS_DIR);

// --------------
// Build shared dev.
gulp.task('build.shared.dev', (done: any) =>
  runSequence(
                //'clean.shared.dev',
                'build.assets.shared.dev', 
                'build.js.shared.dev',
           
              done));

// --------------
// Build shared prod.
gulp.task('build.shared.prod', (done: any) =>
  runSequence(
                //'clean.shared.prod',
                'build.assets.shared.prod',
                'build.js.shared.prod',        

              done));

// --------------
// Build shared test.
gulp.task('build.shared.test', (done: any) =>
  runSequence(
                //'clean.shared.test',
                'build.assets.shared.dev', 
                'build.js.shared.test',           
              done));

// --------------
// Build shared e2e.
gulp.task('build.shared.e2e', (done: any) =>
  runSequence(
                //'clean.shared.e2e',
                'build.assets.shared.dev', 
                'build.js.shared.e2e',           
              done));


// --------------
// Build dev.
gulp.task('build.dev', (done: any) =>
  runSequence(  //'clean.dev',
                //'tslint',
                //'css-lint',
                'build.assets.dev',
                'build.html_css',
                'build.js.dev',
                'build.shared.dev',
                'build.index.dev',
              done));

// --------------
// Build dev watch.
gulp.task('build.dev.watch', (done: any) =>
  runSequence(  'build.dev',
                'watch.dev',
              done));

// --------------
// Build e2e.
gulp.task('build.e2e', (done: any) =>
  runSequence(  //'clean.dev',
                'tslint',
                'build.assets.dev',
                'build.js.e2e',
                'build.shared.e2e',
                'build.index.dev',
              done));

// --------------
// Build prod.
gulp.task('build.prod', (done: any) =>
  runSequence(
                'clean.prod',
                //'tslint',
                //'css-lint',
                'build.assets.shared.prod',
                'build.assets.prod',
                'build.shared.prod',
                'build.html_css',
                'copy.js.prod',
                'build.bundles',
                'build.js.prod',
                'build.bundles.app',
                'build.index.prod',
              done));

// --------------
// Build test.
gulp.task('build.test', (done: any) =>
  runSequence(
                //'clean.dev',
                //'tslint',
                'build.assets.dev',
                'build.html_css',
                'build.js.test',
                'build.shared.test',
                'build.index.dev',
              done));

// --------------
// Build test watch.
gulp.task('build.test.watch', (done: any) =>
  runSequence(  'build.test',
                'watch.test',
              done));

// --------------
// Build tools.
gulp.task('build.tools', (done: any) =>
  runSequence(  'clean.tools',
                'build.js.tools',
              done));

// --------------
// Serve dev
gulp.task('serve.dev', (done: any) =>
  runSequence(  'build.dev',
                'server.start',
                'watch.dev',
              done));

// --------------
// Serve e2e
gulp.task('serve.e2e', (done: any) =>
  runSequence(  'build.e2e',
                'server.start',
                'watch.e2e',
              done));


// --------------
// Serve prod
gulp.task('serve.prod', (done: any) =>
  runSequence(  'build.prod',
                'server.prod',
              done));


// --------------
// Test.
gulp.task('test', (done: any) =>
  runSequence(  'build.test',
                'karma.start', 
              done));


// --------------
// Push to playground.
gulp.task('deploy', (done: any) =>
  runSequence('playground.deploy',
              done));


// --------------
// TypeDoc
/*gulp.task('typedoc',(done: any) =>
  runSequence('generate.typedoc',
              done));*/
			  

gulp.task('typedoc',function(){
	return gulp
		.src(["src/filterpage/app/component/Landing/filter.landing.component.ts"])
		.pipe(typedoc({
			target: "es5",
			includeDeclarations: true,
			out:"./docs",
			name: "HSM ALG Filter Tool",
			ignoreCompilerErrors: false,
			version: true
		}));
})


// --------------
