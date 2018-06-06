import { DEV_DEST, TMP_DIR } from '../../config';
import { clean } from '../../utils';

/**
 * Executes the build process, cleaning all files within the `/dist/dev` directory.
 */
export = clean([DEV_DEST, TMP_DIR]);
