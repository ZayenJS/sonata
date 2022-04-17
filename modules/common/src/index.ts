import 'reflect-metadata';

import app from './App';
import { InjectionType } from './enums/InjectionType';
import { FS } from './Helpers/FS';
import { Logger } from './Helpers/Logger';
import { Registerer } from './Services/Registerer';
export { BaseRepository } from './Repository/BaseRepository';

export * from './http/Request';
export * from './http/Response';
export * from './decorators';
export * from './controllers/AbstractController';
export * from './enums/http-status.enum';
export * from './enums/request-methods.enum';

global.logger = Logger.getInstance();

Object.defineProperty(global, '__ext', {
  get: () => {
    return __filename.split('.').pop();
  },
});

Object.defineProperty(global, '__dir', {
  get: () => {
    const delimiter = process.platform === 'win32' ? '\\' : '/';
    return __dirname.split(delimiter).pop();
  },
});

Object.defineProperty(global, '__root', {
  get: () => {
    const delimiter = process.platform === 'win32' ? '\\' : '/';
    return __dirname.split(delimiter).slice(0, -1).join(delimiter);
  },
});

Object.defineProperty(global, '__line', {
  get: () => {
    const err = new Error();
    const line = err.stack?.split('\n')[2].match(/(?::)(\d+)(?::)/)?.[1];
    return line ?? 'unknown';
  },
});

export default {
  createApp() {
    const rootDir = FS.findApplicationDirectory();
    if (!rootDir) {
      throw new Error('Could not find package.json');
    }

    const servicesDirectory = FS.search(/[sS]ervices?/, rootDir, 'directory');
    const controllersDirectory = FS.search(/[cC]ontrollers?/, rootDir, 'directory');
    const entityDirectory = FS.search(/[eE]ntit[y|ies]|[mM]odels?/, rootDir, 'directory');
    // const repositoryDirectory = FS.search(/[rR]epositor[y|ies]?/, rootDir, 'directory');

    try {
      if (controllersDirectory)
        Registerer.load(controllersDirectory, InjectionType.CONTROLLER);
      if (servicesDirectory) Registerer.load(servicesDirectory, InjectionType.SERVICE);
      if (entityDirectory) Registerer.load(entityDirectory, InjectionType.ENTITY);
      // if (repositoryDirectory) Registerer.load(repositoryDirectory, InjectionType.REPOSITORY);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    app.create();

    return app;
  },
};
