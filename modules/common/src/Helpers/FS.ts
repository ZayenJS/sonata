import path from 'path';
import fs from 'fs';

interface FSSearchOptions {}

export class FS {
  public static findRootDirectory(): string | void {
    const mainFilePath = require.main?.filename;

    if (!mainFilePath) {
      throw new Error('An error occured while trying to find the root directory');
    }

    return path.dirname(mainFilePath);
  }

  public static search(
    fileOrDirectoryName: RegExp,
    basePath: string,
    type: 'file' | 'directory',
  ): string | void {
    const basePaths = [basePath];

    while (basePaths.length) {
      const basePath = basePaths.shift();

      if (!basePath) {
        throw new Error(`Could not find ${type} ${fileOrDirectoryName}`);
      }

      if (this.isRigthType(basePath, type)) {
        const fileOrDirectoryNameMatch = fileOrDirectoryName.exec(basePath);

        if (fileOrDirectoryNameMatch) {
          return basePath;
        }
      }

      const files = fs.readdirSync(basePath);

      for (const file of files) {
        const filePath = path.join(basePath, file);

        if (this.isRigthType(filePath, type)) {
          const fileOrDirectoryNameMatch = fileOrDirectoryName.exec(filePath);

          if (fileOrDirectoryNameMatch) {
            return filePath;
          }
        }

        basePaths.push(filePath);
      }
    }
  }

  private static isRigthType(basePath: string, type?: 'file' | 'directory') {
    let stats: fs.Stats;
    try {
      stats = fs.lstatSync(basePath);
    } catch (e) {
      return false;
    }

    if (type === 'file' && stats.isFile()) {
      return true;
    }

    if (type === 'directory' && stats.isDirectory()) {
      return true;
    }

    return false;
  }
}
