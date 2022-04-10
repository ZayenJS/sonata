import path from 'path';
import fs from 'fs';

interface FSSearchOptions {
  direction?: 'upward' | 'downward';
  type?: 'file' | 'directory';
}

export class FS {
  public static findRootDirectory(ressourcePath: string): string | void {
    const packageJSON = FS.search('package.json', ressourcePath, {
      direction: 'upward',
      type: 'file',
    });

    if (packageJSON) {
      return path.join(path.sep, ...packageJSON.split('/').slice(0, -1));
    }
  }

  public static search(name: string, path: string, options?: FSSearchOptions): string | void {
    const { direction, type } = options || { direction: 'downward', type: 'file' };

    const basePath = `${path}/${name}`;

    const pathExists = fs.existsSync(basePath);
    if (pathExists && FS.isRigthType(basePath, type)) {
      return basePath;
    }

    try {
      if (direction === 'upward') {
        return FS.upwardSearch(name, path, options);
      }

      return FS.downwardSearch(name, path, options);
    } catch (error) {
      console.error(error);
    }
  }

  private static isRigthType(basePath: string, type?: 'file' | 'directory') {
    const stats = fs.lstatSync(basePath);

    if (type === 'file' && stats.isFile()) {
      return true;
    }

    if (type === 'directory' && stats.isDirectory()) {
      return true;
    }

    return false;
  }

  private static upwardSearch(name: string, path: string, options?: FSSearchOptions) {
    const parentPath = path.split('/').slice(0, -1).join('/');
    return FS.search(name, parentPath, options);
  }

  private static downwardSearch(name: string, path: string, options?: FSSearchOptions) {
    const subDirectoryContent = fs.readdirSync(path);

    for (const subDirectory of subDirectoryContent) {
      const subDirectoryPath = `${path}/${subDirectory}`;
      const subDirectoryStats = fs.lstatSync(subDirectoryPath);

      if (subDirectoryStats.isDirectory()) {
        const result = FS.search(name, subDirectoryPath, options);
        if (result) {
          return result;
        }
      }
    }
  }
}
