import { AbstractLoader } from './AbstractLoader';

/**
 * @inheritdoc
 */
export class ConfigLoader extends AbstractLoader {
  /**
   * @param directory the path to the root directory of the loader. default is 'config'
   */
  public constructor(
    directory: string = 'config',
    extensions: Set<string> = new Set(['yml', 'yaml']),
  ) {
    super(directory, extensions);
  }
}
