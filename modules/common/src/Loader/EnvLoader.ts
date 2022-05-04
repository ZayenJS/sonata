import { GenericObject } from '../@types';
import { AbstractLoader } from './AbstractLoader';

export class EnvLoader extends AbstractLoader {
  /**
   * @param directory the path to the root directory of the loader. default is the project root directory
   */
  public constructor(
    directory: string = '',
    extensions: Set<string> = new Set(['env', 'env.local']),
  ) {
    super(directory, extensions);
  }

  public loadEnvFile(): GenericObject;
  public loadEnvFile(filePath: string): GenericObject;
  public loadEnvFile(filePath?: string): GenericObject {
    const envFile = process.env.NODE_ENV === 'production' ? 'env' : 'env.local';
    console.log(envFile);

    const fileContent = this.load(filePath ?? '', [envFile]);

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
