import { GenericObject } from '../@types';
import { AbstractLoader } from './AbstractLoader';

export class EnvLoader extends AbstractLoader {
  /**
   * @param directory the path to the root directory of the loader. default is the project root directory
   */
  public constructor(directory: string = '', extensions: Set<string> = new Set(['env'])) {
    super(directory, extensions);
  }

  public loadEnvFile(): GenericObject;
  public loadEnvFile(filePath: string): GenericObject;
  public loadEnvFile(filePath?: string): GenericObject {
    const fileContent = this.load(filePath ?? '');

    return fileContent
      .split('\n')
      .filter(line => line.trim().length)
      .map(line => line.split(/=/g))
      .reduce((acc, [key, value]) => {
        acc[key] = value;

        return acc;
      }, {} as GenericObject);
  }
}
