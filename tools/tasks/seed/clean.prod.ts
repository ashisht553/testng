import { PROD_DEST, TMP_DIR, APP_CLIENT } from '../../config';
import { clean } from '../../utils';

/**
 * Executes the build process, cleaning all files within the `/dist/dev` and `dist/tmp` directory.
 */
//export = clean([PROD_DEST + "/" + APP_CLIENT, TMP_DIR]);
export = clean([PROD_DEST + "/" + APP_CLIENT]);

