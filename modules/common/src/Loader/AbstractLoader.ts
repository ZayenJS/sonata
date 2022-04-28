import path from 'path';

import { FS } from '../Helpers/FS';

/**
 * @class AbstractLoader
 * @abstract
 * @author David Nogueira
 * @description The AbstractLoader class is an abstract class that will be the root of all the other types of loaders.
 * It will be responsible for loading the files and directories that will be used by the application.
 *
 */
export abstract class AbstractLoader {
  private _directory: string;
  private _extensions: Set<string>;

  /**
   * @param directory the path to the root directory of the loader
   */
  public constructor(directory: string, extensions: Set<string> = new Set(['yml', 'yaml'])) {
    const rootProjectDirectory = FS.findRootDirectory();

    if (!rootProjectDirectory) {
      throw new Error('Could not find the root directory of the project.');
    }

    this._directory = path.join(rootProjectDirectory, directory);
    this._extensions = extensions;
  }

  /**
   * Returns ths path of the current loader directory.
   *
   * @param {boolean} full if true, the path will be returned with the full absolute path,
   * otherwise, only the directory path will be returned. default is false.
   * @returns {string} the path to the directory of the loader
   */
  public getDirectory(full?: boolean): string;
  public getDirectory(): string;
  public getDirectory(full = false): string {
    const rootProjectDirectory = FS.findRootDirectory();

    if (full) return path.join(rootProjectDirectory, this._directory);

    return this._directory;
  }

  /**
   * Changes the directory of the loader.
   *
   * @param directory the new path to the directory to be loaded by the loader
   * @returns {this} the current instance of the loader
   */
  public setDirectory(directory: string): this {
    this._directory = directory;

    return this;
  }

  /**
   * Gets a list of possible extensions for the files that will be loaded.
   *
   * @returns {string[]} the list of the extensions that will be used to load the files by the loader.
   */
  public getExtensions(): string[] {
    return Array.from(this._extensions);
  }

  /**
   * Will replace the current list of extensions with the new ones.
   *
   * @param extensions a list of the extensions that will be used to load the files by the loader.
   * @returns
   */
  public setExtensions(extensions: string[]): this {
    this._extensions = new Set(extensions);

    return this;
  }

  /**
   * Adds a new extension to the list of extensions that will be used to load the files by the loader.
   *
   * @param extension
   * @returns
   */
  public addExtension(extension: string): this {
    this._extensions.add(extension);

    return this;
  }

  /**
   * Deletes an extension from the list of extensions that will be used to load the files by the loader.
   *
   * @param extension the extension to remove from the list of extensions
   * @returns
   */
  public deleteExtension(extension: string): this {
    this._extensions.delete(extension);

    return this;
  }

  /**
   * Loads the file specified by the filePath and returns the content of the file.
   *
   * @param filePath the path to the file to be loaded
   * @returns {Promise<string>} a promise that will be resolved when the files and directories are loaded.
   *
   * @throws {Error} if the directory does not exist.
   * @throws {Error} if the directory is not a directory.
   * @throws {Error} if the directory is not readable.
   *
   */
  public load(filePath: string): string {
    const filePathWithDirectory = path.join(this._directory, filePath);

    const possibleExtensions = this.getExtensions().join('|');

    const foundFile = FS.search(
      new RegExp(`${filePath}\.(${possibleExtensions})$`),
      this._directory,
      'file',
    );

    if (!foundFile) {
      throw new Error(`Could not find the file ${filePathWithDirectory}`);
    }

    return FS.readFile(foundFile);
  }
}
