import { join } from 'path';
import { SeedConfig } from './seed.config';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedConfig {

  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

  constructor() {
    super();
    // this.APP_TITLE = 'Put name of your app here';

    // Add third-party libraries to be injected/bundled.

    console.log('APP_CLIENT = ' + this.APP_CLIENT);

    if (this.APP_CLIENT == 'pog') {
      this.NPM_DEPENDENCIES = [
        ...this.NPM_DEPENDENCIES,
        // {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
        // {src: 'lodash/lodash.min.js', inject: 'libs'},
        { src: 'jquery/dist/jquery.min.js', inject: 'libs' },
        // {src: 'underscore/underscore-min.js', inject: 'libs' },
        // {src: 'snapsvg/dist/snap.svg-min.js', inject: 'libs' },
        { src: 'phaser/build/phaser.min.js', inject: 'libs' },
        { src: 'phaser-swipe/swipe.js', inject: 'libs' },

        { src: 'cas-handler/cas/queue-min.js', inject: 'libs' },
        { src: 'cas-handler/cas/annotations-service.js', inject: 'libs' },
        { src: 'cas-handler/cas/custom-cas.js', inject: 'libs' },
        //  {src: 'algebra.js/algebra-0.2.6.min.js', inject: 'libs' }
        //{src: 'svg4everybody/dist/svg4everybody.min.js', inject: 'libs' }
      ];
    } else if (this.APP_CLIENT == 'fm') {
      this.NPM_DEPENDENCIES = [
        ...this.NPM_DEPENDENCIES,
        // {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
        // {src: 'lodash/lodash.min.js', inject: 'libs'},
        { src: 'jquery/dist/jquery.min.js', inject: 'libs' },
        { src: 'underscore/underscore-min.js', inject: 'libs' },
        // {src: 'snapsvg/dist/snap.svg-min.js', inject: 'libs' },
        { src: 'phaser/build/phaser.min.js', inject: 'libs' },
        { src: 'phaser-swipe/swipe.js', inject: 'libs' },
        { src: 'algebra.js/dist/algebra-0.2.6.min.js', inject: 'libs' },
          {src: 'latextopng/rgbcolor.js', inject: 'libs' },
          {src: 'latextopng/StackBlur.js', inject: 'libs' },
          {src: 'latextopng/canvg.js', inject: 'libs' },
          {src: 'latextopng/index.js', inject: 'libs' },

          { src: 'hmhmathjax/dist/hmh-mathjax.min.js', inject: 'libs' }
        //{src: 'svg4everybody/dist/svg4everybody.min.js', inject: 'libs' }
      ];
    } else if (this.APP_CLIENT == 'card') {
      this.NPM_DEPENDENCIES = [
        ...this.NPM_DEPENDENCIES,
        // {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
        // {src: 'lodash/lodash.min.js', inject: 'libs'},
        { src: 'jquery/dist/jquery.min.js', inject: 'libs' },
        { src: 'underscore/underscore-min.js', inject: 'libs' },
        // {src: 'snapsvg/dist/snap.svg-min.js', inject: 'libs' },
        { src: 'phaser/build/phaser.min.js', inject: 'libs' },
        { src: 'phaser-swipe/swipe.js', inject: 'libs' },
        { src: 'algebra.js/algebra-0.2.6.min.js', inject: 'libs' },

        { src: 'cas-handler/cas/queue-min.js', inject: 'libs' },
        { src: 'cas-handler/cas/annotations-service.js', inject: 'libs' },
        { src: 'cas-handler/cas/custom-cas.js', inject: 'libs' },

        //{src: 'svg4everybody/dist/svg4everybody.min.js', inject: 'libs' }
      ];
    } else if (this.APP_CLIENT == 'sg') {
     
        this.NPM_DEPENDENCIES = [
          ...this.NPM_DEPENDENCIES,
          {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
          {src: 'underscore/underscore-min.js', inject: 'libs' },
          {src: 'phaser/build/phaser.min.js', inject: 'libs' },
          {src: 'phaser-swipe/swipe.js', inject: 'libs' },
          {src: 'algebra.js/algebra-0.2.6.min.js', inject: 'libs' },
          {src: 'latextopng/rgbcolor.js', inject: 'libs' },
          {src: 'latextopng/StackBlur.js', inject: 'libs' },
          {src: 'latextopng/canvg.js', inject: 'libs' },
          {src: 'latextopng/index.js', inject: 'libs' },

          { src: 'hmhmathjax/mathjax.js', inject: 'libs' },
		  { src: 'hmhmathjax/config/TeX-AMS-MML_SVG.js', inject: 'libs' },
          { src: 'hmhmathjax/jax/output/SVG/jax.js', inject: 'libs' },
          { src: 'hmhmathjax/jax/output/SVG/fonts/Latin-Modern/fontdata.js', inject: 'libs' },
          { src: 'hmhmathjax/jax/output/SVG/fonts/Latin-Modern/Main/Regular/Main.js', inject: 'libs' },
          { src: 'hmhmathjax/jax/output/SVG/fonts/Latin-Modern/Normal/Regular/Main.js', inject: 'libs' }
        ];
    } else {
      console.log('Set Valid APP_CLIENT');
    }

    /* Add to or override NPM module configurations: */
    //this.mergeObject(this.PLUGIN_CONFIGS['browser-sync'], { ghostMode: false });
  }

}
